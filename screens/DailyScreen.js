import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import questionsData from '../questions.json';
import MorningRitual from '../services/MorningRitual';
import ThoughtCapture from '../components/ThoughtCapture';
import SparkSharing from '../components/SparkSharing';

const { width, height } = Dimensions.get('window');

export default function DailyScreen({ navigation }) {
  const [currentDay, setCurrentDay] = useState(1);
  const [todayQuestion, setTodayQuestion] = useState(null);
  const [showStory, setShowStory] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const questionScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    loadCurrentDay();
    loadStreak();
    animateEntrance();

    // Track engagement and update streak
    const trackEngagement = async () => {
      await MorningRitual.recordEngagement();
      await MorningRitual.updateStreak();
    };

    trackEngagement();
  }, []);

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(questionScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadStreak = async () => {
    try {
      const streak = await AsyncStorage.getItem('streakCount');
      if (streak) {
        setStreakCount(parseInt(streak));
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const loadCurrentDay = async () => {
    try {
      const savedDay = await AsyncStorage.getItem('currentDay');
      const lastOpenDate = await AsyncStorage.getItem('lastOpenDate');
      const today = new Date().toDateString();

      if (lastOpenDate !== today) {
        // New day, show next question
        const nextDay = savedDay ? parseInt(savedDay) + 1 : 1;
        const dayToShow = nextDay > 30 ? ((nextDay - 1) % 30) + 1 : nextDay;

        setCurrentDay(dayToShow);
        await AsyncStorage.setItem('currentDay', dayToShow.toString());
        await AsyncStorage.setItem('lastOpenDate', today);
      } else {
        // Same day, show current question
        const dayToShow = savedDay ? parseInt(savedDay) : 1;
        setCurrentDay(dayToShow);
      }
    } catch (e) {
      console.error('Error loading day:', e);
      setCurrentDay(1);
    }
  };

  useEffect(() => {
    if (currentDay && questionsData.questions) {
      const question = questionsData.questions.find(q => q.id === currentDay);
      setTodayQuestion(question);
    }
  }, [currentDay]);

  if (!todayQuestion) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Wonder is awakening...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Header */}
        <TouchableOpacity
          style={styles.backToJourneys}
          onPress={() => navigation.navigate('Journey')}
        >
          <Text style={styles.backText}>← Explore Journeys</Text>
        </TouchableOpacity>

        {/* Day indicator */}
        <View style={styles.dayContainer}>
          <Text style={styles.dayText}>{todayQuestion.date}</Text>
          <Text style={styles.dailyLabel}>Daily Wonder</Text>
        </View>

        {/* Main Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {todayQuestion.question}
          </Text>
        </View>

        {/* Thought Capture */}
        <ThoughtCapture
          questionId={todayQuestion.id}
          questionText={todayQuestion.question}
        />

        {/* Story Button or Story Content */}
        {!showStory ? (
          <TouchableOpacity
            style={styles.storyButton}
            onPress={() => setShowStory(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.storyButtonText}>Who wondered this?</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.storyContainer}>
            <Text style={styles.storyText}>{todayQuestion.story}</Text>
            <Text style={styles.thinkerText}>— {todayQuestion.thinker}</Text>

            <View style={styles.followUpContainer}>
              <Text style={styles.followUpLabel}>Wonder deeper:</Text>
              <Text style={styles.followUpText}>{todayQuestion.followUp}</Text>
            </View>

            {/* Share this Wonder */}
            <SparkSharing
              question={todayQuestion.question}
              type="daily"
            />
          </View>
        )}

        {/* Tomorrow teaser */}
        <View style={styles.tomorrowContainer}>
          <Text style={styles.tomorrowText}>Tomorrow's wonder awaits...</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingVertical: 40,
    minHeight: height,
  },
  backToJourneys: {
    marginBottom: 30,
  },
  backText: {
    color: '#666666',
    fontSize: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: height / 2,
  },
  dayContainer: {
    marginBottom: 30,
  },
  dayText: {
    color: '#666666',
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dailyLabel: {
    color: '#FFD700',
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 5,
  },
  questionContainer: {
    marginBottom: 50,
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 44,
    letterSpacing: 0.5,
  },
  storyButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    backgroundColor: '#111111',
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginBottom: 40,
  },
  storyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  storyContainer: {
    marginBottom: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  storyText: {
    color: '#CCCCCC',
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 15,
  },
  thinkerText: {
    color: '#888888',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 30,
  },
  followUpContainer: {
    backgroundColor: '#0A0A0A',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  followUpLabel: {
    color: '#666666',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  followUpText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '300',
    lineHeight: 26,
  },
  tomorrowContainer: {
    marginTop: 60,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#111111',
  },
  tomorrowText: {
    color: '#333333',
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 1,
  },
});