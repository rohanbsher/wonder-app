import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import journeysData from '../journeys.json';
import AnimatedJourneyCard from '../components/AnimatedJourneyCard';
import FloatingParticles from '../components/FloatingParticles';
import { Typography, TextStyles } from '../styles/typography';
import Spacing from '../styles/spacing';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_SPACING = width * 0.075;

export default function MajesticJourneyScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [journeyProgress, setJourneyProgress] = useState({});
  const [streakCount, setStreakCount] = useState(0);

  // Animation values
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(-50)).current;
  const dailyOrb = useRef(new Animated.Value(0)).current;
  const backgroundColorAnim = useRef(new Animated.Value(0)).current;

  // Scroll view ref
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadProgress();
    loadStreak();
    animateEntrance();
    startDailyOrbAnimation();
  }, []);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('journeyProgress');
      if (saved) {
        setJourneyProgress(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }
  };

  const loadStreak = async () => {
    try {
      const streak = await AsyncStorage.getItem('streakCount');
      if (streak) {
        setStreakCount(parseInt(streak));
      }
    } catch (e) {
      console.error('Error loading streak:', e);
    }
  };

  const animateEntrance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(titleAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startDailyOrbAnimation = () => {
    // Daily wonder orb pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(dailyOrb, {
          toValue: 1.2,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(dailyOrb, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getJourneyDepth = (journeyId) => {
    return journeyProgress[journeyId]?.currentDepth || 1;
  };

  const getUnlockedLevels = (journeyId) => {
    return journeyProgress[journeyId]?.unlockedLevels || 1;
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const newIndex = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_SPACING * 2));
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < journeysData.journeys.length) {
          setCurrentIndex(newIndex);
          animateBackgroundColor(newIndex);
        }
      }
    }
  );

  const animateBackgroundColor = (index) => {
    Animated.timing(backgroundColorAnim, {
      toValue: index,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const selectJourney = (journeyId) => {
    // Expand animation before navigation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Depth', { journeyId });
    });
  };

  const openDailyWonder = () => {
    navigation.navigate('Daily');
  };

  // Background gradient based on current journey
  const backgroundColors = [
    ['#000000', '#0d2847', '#1a365d', '#000000'], // Time
    ['#000000', '#2e1a47', '#44337a', '#000000'], // God
    ['#000000', '#3b1a1a', '#7c2d12', '#000000'], // Consciousness
  ];

  const currentBgColors = backgroundColors[currentIndex] || backgroundColors[0];

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={currentBgColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Particles */}
      <FloatingParticles
        theme={journeysData.journeys[currentIndex]?.theme || 'default'}
        count={10}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: titleAnim }],
            },
          ]}
        >
          <View>
            <Text style={styles.headerTitle}>Wonder</Text>
            <Text style={styles.headerSubtitle}>Choose your path to enlightenment</Text>
            {streakCount > 0 && (
              <View style={styles.streakContainer}>
                <Text style={styles.streakText}>{streakCount} day streak</Text>
              </View>
            )}
          </View>

          {/* Daily Wonder Orb */}
          <TouchableOpacity onPress={openDailyWonder} activeOpacity={0.8}>
            <Animated.View
              style={[
                styles.dailyOrb,
                {
                  transform: [{ scale: dailyOrb }],
                },
              ]}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#FF8C00']}
                style={styles.orbGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.orbText}>Daily</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {/* Journey Carousel */}
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
          style={[
            styles.scrollView,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {journeysData.journeys.map((journey, index) => (
            <View key={journey.id} style={styles.cardContainer}>
              <AnimatedJourneyCard
                journey={journey}
                progress={getJourneyDepth(journey.id)}
                unlocked={getUnlockedLevels(journey.id)}
                isActive={index === currentIndex}
                onPress={() => selectJourney(journey.id)}
                index={index}
              />
            </View>
          ))}
        </Animated.ScrollView>

        {/* Page Indicators */}
        <Animated.View
          style={[
            styles.pagination,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {journeysData.journeys.map((_, index) => {
            const inputRange = [
              (index - 1) * (CARD_WIDTH + CARD_SPACING * 2),
              index * (CARD_WIDTH + CARD_SPACING * 2),
              (index + 1) * (CARD_WIDTH + CARD_SPACING * 2),
            ];

            const dotScale = scrollX.interpolate({
              inputRange,
              outputRange: [0.8, 1.4, 0.8],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.paginationDot,
                  {
                    transform: [{ scale: dotScale }],
                    opacity,
                    backgroundColor: journeysData.journeys[index].color,
                  },
                ]}
              />
            );
          })}
        </Animated.View>

        {/* Navigation Hints */}
        <Animated.View
          style={[
            styles.navigationHints,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.hintText}>Swipe to explore</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: '#FFFFFF80',
    letterSpacing: 1,
    marginTop: 5,
  },
  streakContainer: {
    marginTop: 10,
    flexDirection: 'row',
  },
  streakText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '500',
  },
  dailyOrb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  orbGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  cardContainer: {
    width: CARD_WIDTH + CARD_SPACING * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    gap: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  navigationHints: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    color: '#FFFFFF40',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});