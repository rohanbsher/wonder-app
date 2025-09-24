import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import questionsData from '../questions.json';

// Configure how notifications should be displayed
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // Silent by design - Steve would approve
    shouldSetBadge: true,
  }),
});

class MorningRitual {
  constructor() {
    this.notificationTime = { hour: 6, minute: 0 }; // Default 6 AM
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    // Register for notifications
    const permission = await this.requestPermission();
    if (!permission) return false;

    // Load user's preferred time
    await this.loadPreferredTime();

    // Schedule tomorrow's wonder
    await this.scheduleTomorrowsWonder();

    this.isInitialized = true;
    return true;
  }

  async requestPermission() {
    if (!Device.isDevice) {
      console.log('Notifications require physical device');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    // Get push token for future use
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;

    await AsyncStorage.setItem('pushToken', token);
    return true;
  }

  async loadPreferredTime() {
    try {
      const savedTime = await AsyncStorage.getItem('morningRitualTime');
      if (savedTime) {
        this.notificationTime = JSON.parse(savedTime);
      }
    } catch (error) {
      console.error('Error loading preferred time:', error);
    }
  }

  async setPreferredTime(hour, minute) {
    this.notificationTime = { hour, minute };
    await AsyncStorage.setItem('morningRitualTime', JSON.stringify({ hour, minute }));

    // Reschedule with new time
    await this.cancelAllScheduled();
    await this.scheduleTomorrowsWonder();
  }

  async scheduleTomorrowsWonder() {
    // Get tomorrow's question
    const question = await this.getTomorrowsQuestion();
    if (!question) return;

    // Calculate trigger time for tomorrow
    const trigger = new Date();
    trigger.setDate(trigger.getDate() + 1);
    trigger.setHours(this.notificationTime.hour);
    trigger.setMinutes(this.notificationTime.minute);
    trigger.setSeconds(0);

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: question.question,
        body: 'Take a moment to wonder...',
        data: {
          questionId: question.id,
          date: question.date,
        },
        // iOS specific - show as banner
        sound: false,
        badge: 1,
      },
      trigger,
    });

    // Schedule weekly summary (Sundays at 7 PM)
    if (new Date().getDay() === 6) {
      await this.scheduleWeeklyReflection();
    }
  }

  async getTomorrowsQuestion() {
    try {
      const currentDay = await AsyncStorage.getItem('currentDay');
      const nextDay = currentDay ? (parseInt(currentDay) % 30) + 1 : 1;
      return questionsData.questions.find(q => q.id === nextDay);
    } catch (error) {
      console.error('Error getting tomorrow question:', error);
      return questionsData.questions[0];
    }
  }

  async scheduleWeeklyReflection() {
    const sunday = new Date();
    sunday.setDate(sunday.getDate() + (7 - sunday.getDay()));
    sunday.setHours(19, 0, 0); // 7 PM Sunday

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your Week of Wonder',
        body: 'You pondered 7 profound questions this week. Ready to go deeper?',
        data: { type: 'weekly_reflection' },
        sound: false,
      },
      trigger: sunday,
    });
  }

  async cancelAllScheduled() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Track engagement for learning optimal time
  async recordEngagement() {
    const now = new Date();
    const engagement = {
      hour: now.getHours(),
      minute: now.getMinutes(),
      dayOfWeek: now.getDay(),
      timestamp: now.toISOString(),
    };

    try {
      const history = await AsyncStorage.getItem('engagementHistory');
      const engagements = history ? JSON.parse(history) : [];
      engagements.push(engagement);

      // Keep last 30 engagements
      if (engagements.length > 30) {
        engagements.shift();
      }

      await AsyncStorage.setItem('engagementHistory', JSON.stringify(engagements));

      // Learn optimal time after 7 days
      if (engagements.length >= 7) {
        await this.optimizeNotificationTime(engagements);
      }
    } catch (error) {
      console.error('Error recording engagement:', error);
    }
  }

  async optimizeNotificationTime(engagements) {
    // Find the most common hour for engagement
    const hourCounts = {};
    engagements.forEach(e => {
      const hour = e.hour;
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const optimalHour = Object.keys(hourCounts).reduce((a, b) =>
      hourCounts[a] > hourCounts[b] ? a : b
    );

    // Notify 30 minutes before their usual engagement time
    const notifyHour = parseInt(optimalHour) - 1;
    const adjustedHour = notifyHour < 5 ? 6 : notifyHour; // Not too early

    if (Math.abs(adjustedHour - this.notificationTime.hour) > 1) {
      await this.setPreferredTime(adjustedHour, 0);

      // Subtle notification about the change
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Wonder knows you better now',
          body: `We'll send your daily question at ${adjustedHour}:00 AM`,
          sound: false,
        },
        trigger: { seconds: 1 },
      });
    }
  }

  // Special milestone notifications
  async checkMilestones() {
    const streakCount = await this.getStreakCount();

    const milestones = {
      7: 'A week of wonder! You are developing a beautiful habit.',
      30: 'A month of deep thinking. You are transforming your mind.',
      100: 'One hundred days of wonder. You are a philosopher now.',
      365: 'A year of profound questions. You have changed forever.',
    };

    if (milestones[streakCount]) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: milestones[streakCount],
          body: 'Your journey into wonder continues...',
          data: { type: 'milestone', streak: streakCount },
          sound: false,
        },
        trigger: { seconds: 2 },
      });
    }
  }

  async getStreakCount() {
    try {
      const streak = await AsyncStorage.getItem('streakCount');
      return streak ? parseInt(streak) : 0;
    } catch (error) {
      return 0;
    }
  }

  async updateStreak() {
    const lastOpen = await AsyncStorage.getItem('lastOpenDate');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastOpen === yesterday || !lastOpen) {
      const currentStreak = await this.getStreakCount();
      const newStreak = currentStreak + 1;
      await AsyncStorage.setItem('streakCount', newStreak.toString());
      await this.checkMilestones();
    } else if (lastOpen !== today) {
      // Streak broken
      await AsyncStorage.setItem('streakCount', '1');
    }
  }
}

export default new MorningRitual();