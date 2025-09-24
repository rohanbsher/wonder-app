import AsyncStorage from '@react-native-async-storage/async-storage';

// Steve Jobs would want a single source of truth for all data operations
// Clean, predictable, and bulletproof

class DataService {
  constructor() {
    this.cache = new Map();
    this.listeners = new Map();
  }

  // Keys for different data types
  static KEYS = {
    ONBOARDING_COMPLETED: 'onboardingCompleted',
    JOURNEY_PROGRESS: 'journeyProgress',
    CURRENT_DAY: 'currentDay',
    LAST_OPEN_DATE: 'lastOpenDate',
    STREAK_COUNT: 'streakCount',
    THOUGHTS: 'thoughts_',
    ALL_THOUGHTS: 'allThoughts',
    ENGAGEMENT_HISTORY: 'engagementHistory',
    LATEST_MILESTONE: 'latestMilestone',
    MORNING_RITUAL_TIME: 'morningRitualTime',
    PUSH_TOKEN: 'pushToken',
  };

  // Generic get with error handling and caching
  async get(key, defaultValue = null) {
    try {
      // Check cache first
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }

      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        const parsed = this.tryParseJSON(value);
        this.cache.set(key, parsed);
        return parsed;
      }
      return defaultValue;
    } catch (error) {
      console.error(`DataService: Error getting ${key}:`, error);
      return defaultValue;
    }
  }

  // Generic set with validation and cache update
  async set(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
      this.cache.set(key, value);
      this.notifyListeners(key, value);
      return true;
    } catch (error) {
      console.error(`DataService: Error setting ${key}:`, error);
      return false;
    }
  }

  // Delete data
  async delete(key) {
    try {
      await AsyncStorage.removeItem(key);
      this.cache.delete(key);
      this.notifyListeners(key, null);
      return true;
    } catch (error) {
      console.error(`DataService: Error deleting ${key}:`, error);
      return false;
    }
  }

  // Clear all data (dangerous - use carefully)
  async clearAll() {
    try {
      await AsyncStorage.clear();
      this.cache.clear();
      return true;
    } catch (error) {
      console.error('DataService: Error clearing all data:', error);
      return false;
    }
  }

  // Batch operations for performance
  async getBatch(keys) {
    try {
      const results = {};
      for (const key of keys) {
        results[key] = await this.get(key);
      }
      return results;
    } catch (error) {
      console.error('DataService: Error in batch get:', error);
      return {};
    }
  }

  async setBatch(keyValuePairs) {
    try {
      for (const [key, value] of Object.entries(keyValuePairs)) {
        await this.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('DataService: Error in batch set:', error);
      return false;
    }
  }

  // Helper to safely parse JSON
  tryParseJSON(value) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  // Subscribe to changes
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Notify listeners when data changes
  notifyListeners(key, value) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error('DataService: Error in listener:', error);
        }
      });
    }
  }

  // Specialized methods for common operations

  // User & Onboarding
  async isFirstTimeUser() {
    const completed = await this.get(DataService.KEYS.ONBOARDING_COMPLETED);
    return !completed;
  }

  async completeOnboarding() {
    return await this.set(DataService.KEYS.ONBOARDING_COMPLETED, true);
  }

  // Journey Progress
  async getJourneyProgress(journeyId = null) {
    const allProgress = await this.get(DataService.KEYS.JOURNEY_PROGRESS, {});
    return journeyId ? allProgress[journeyId] : allProgress;
  }

  async updateJourneyProgress(journeyId, depth, unlocked) {
    const allProgress = await this.get(DataService.KEYS.JOURNEY_PROGRESS, {});
    allProgress[journeyId] = {
      currentDepth: depth,
      unlockedLevels: unlocked,
      lastAccessed: new Date().toISOString(),
    };
    return await this.set(DataService.KEYS.JOURNEY_PROGRESS, allProgress);
  }

  // Daily Questions
  async getCurrentDay() {
    return await this.get(DataService.KEYS.CURRENT_DAY, 1);
  }

  async setCurrentDay(day) {
    return await this.set(DataService.KEYS.CURRENT_DAY, day);
  }

  async getLastOpenDate() {
    return await this.get(DataService.KEYS.LAST_OPEN_DATE);
  }

  async setLastOpenDate(date) {
    return await this.set(DataService.KEYS.LAST_OPEN_DATE, date);
  }

  // Streaks
  async getStreakCount() {
    const streak = await this.get(DataService.KEYS.STREAK_COUNT);
    return streak ? parseInt(streak) : 0;
  }

  async updateStreak(count) {
    return await this.set(DataService.KEYS.STREAK_COUNT, count);
  }

  // Thoughts
  async getThoughtsForQuestion(questionId) {
    return await this.get(`${DataService.KEYS.THOUGHTS}${questionId}`, []);
  }

  async saveThought(questionId, thoughtData) {
    const thoughts = await this.getThoughtsForQuestion(questionId);
    thoughts.push(thoughtData);

    // Save to question-specific thoughts
    await this.set(`${DataService.KEYS.THOUGHTS}${questionId}`, thoughts);

    // Save to global thoughts
    const allThoughts = await this.get(DataService.KEYS.ALL_THOUGHTS, []);
    allThoughts.push(thoughtData);
    await this.set(DataService.KEYS.ALL_THOUGHTS, allThoughts);

    return thoughts;
  }

  async getAllThoughts() {
    return await this.get(DataService.KEYS.ALL_THOUGHTS, []);
  }

  // Engagement tracking
  async recordEngagement(hour, minute, dayOfWeek) {
    const engagement = {
      hour,
      minute,
      dayOfWeek,
      timestamp: new Date().toISOString(),
    };

    const history = await this.get(DataService.KEYS.ENGAGEMENT_HISTORY, []);
    history.push(engagement);

    // Keep only last 30 engagements
    if (history.length > 30) {
      history.shift();
    }

    return await this.set(DataService.KEYS.ENGAGEMENT_HISTORY, history);
  }

  async getEngagementHistory() {
    return await this.get(DataService.KEYS.ENGAGEMENT_HISTORY, []);
  }

  // Milestones
  async setMilestone(milestone) {
    return await this.set(DataService.KEYS.LATEST_MILESTONE, milestone);
  }

  async getMilestone() {
    return await this.get(DataService.KEYS.LATEST_MILESTONE);
  }

  // Morning Ritual
  async getMorningRitualTime() {
    return await this.get(DataService.KEYS.MORNING_RITUAL_TIME, { hour: 6, minute: 0 });
  }

  async setMorningRitualTime(hour, minute) {
    return await this.set(DataService.KEYS.MORNING_RITUAL_TIME, { hour, minute });
  }

  // Push notifications
  async getPushToken() {
    return await this.get(DataService.KEYS.PUSH_TOKEN);
  }

  async setPushToken(token) {
    return await this.set(DataService.KEYS.PUSH_TOKEN, token);
  }

  // Debug methods
  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('DataService: Error getting all keys:', error);
      return [];
    }
  }

  async debugPrintAll() {
    const keys = await this.getAllKeys();
    const data = {};
    for (const key of keys) {
      data[key] = await this.get(key);
    }
    console.log('DataService: All stored data:', data);
    return data;
  }
}

// Export singleton instance
export default new DataService();