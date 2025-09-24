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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import journeysData from '../journeys.json';
import AnimatedBackground from '../components/AnimatedBackground';
import FloatingParticles from '../components/FloatingParticles';
import ThoughtCapture from '../components/ThoughtCapture';

const { width, height } = Dimensions.get('window');

export default function DepthScreen({ route, navigation }) {
  const { journeyId } = route.params;
  const journey = journeysData.journeys.find(j => j.id === journeyId);

  const [currentDepth, setCurrentDepth] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [unlockedLevels, setUnlockedLevels] = useState(1);
  const [showContext, setShowContext] = useState(false);
  const [engagementTime, setEngagementTime] = useState(0);
  const questionFadeAnim = useRef(new Animated.Value(0)).current;
  const questionTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadProgress();
    animateQuestionEntrance();
    // Track engagement time
    const interval = setInterval(() => {
      setEngagementTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Unlock next level after 30 seconds of engagement
    if (engagementTime > 30 && unlockedLevels === currentDepth && currentDepth < journey.levels.length) {
      unlockNextLevel();
    }
  }, [engagementTime]);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('journeyProgress');
      if (saved) {
        const progress = JSON.parse(saved);
        const journeyData = progress[journeyId];
        if (journeyData) {
          setCurrentDepth(journeyData.currentDepth || 1);
          setUnlockedLevels(journeyData.unlockedLevels || 1);
        }
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }
  };

  const saveProgress = async (depth, unlocked) => {
    try {
      const saved = await AsyncStorage.getItem('journeyProgress');
      const progress = saved ? JSON.parse(saved) : {};
      progress[journeyId] = {
        currentDepth: depth,
        unlockedLevels: unlocked,
        lastAccessed: new Date().toISOString(),
      };
      await AsyncStorage.setItem('journeyProgress', JSON.stringify(progress));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  };

  const unlockNextLevel = () => {
    const newUnlocked = Math.min(unlockedLevels + 1, journey.levels.length);
    setUnlockedLevels(newUnlocked);
    saveProgress(currentDepth, newUnlocked);
  };

  const goToDepth = (depth) => {
    if (depth <= unlockedLevels) {
      setCurrentDepth(depth);
      setCurrentQuestionIndex(0);
      setShowContext(false);
      setEngagementTime(0);
      saveProgress(depth, unlockedLevels);
      animateQuestionEntrance();
    }
  };

  const animateQuestionEntrance = () => {
    questionFadeAnim.setValue(0);
    questionTranslateY.setValue(30);

    Animated.parallel([
      Animated.timing(questionFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(questionTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const currentLevel = journey.levels[currentDepth - 1];
  const currentQuestion = currentLevel.questions[currentQuestionIndex];

  const goDeeper = () => {
    if (currentDepth < unlockedLevels) {
      goToDepth(currentDepth + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentLevel.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowContext(false);
      animateQuestionEntrance();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground theme={journey.theme} depth={currentDepth} />
      <FloatingParticles theme={journey.theme} count={15} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Depth Indicator */}
        <View style={styles.depthIndicator}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <View style={styles.depthDots}>
            {journey.levels.map((level, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => goToDepth(index + 1)}
                disabled={index + 1 > unlockedLevels}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        index + 1 === currentDepth
                          ? journey.color
                          : index + 1 <= unlockedLevels
                          ? '#666666'
                          : '#222222',
                      width: index + 1 === currentDepth ? 12 : 8,
                      height: index + 1 === currentDepth ? 12 : 8,
                    }
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Journey Title */}
        <Text style={[styles.journeyTitle, { color: journey.color }]}>
          {journey.title}
        </Text>

        {/* Level Title */}
        <View style={styles.levelHeader}>
          <Text style={styles.levelTitle}>
            Level {currentDepth}: {currentLevel.title}
          </Text>
          {currentLevel.questions.length > 1 && (
            <Text style={styles.questionCounter}>
              {currentQuestionIndex + 1}/{currentLevel.questions.length}
            </Text>
          )}
        </View>

        {/* Main Question */}
        <Animated.View
          style={[
            styles.questionContainer,
            {
              opacity: questionFadeAnim,
              transform: [{ translateY: questionTranslateY }],
            }
          ]}
        >
          <Text style={styles.mainQuestion}>
            {currentQuestion.main}
          </Text>
        </Animated.View>

        {/* Thought Capture */}
        <ThoughtCapture
          questionId={`${journeyId}_${currentDepth}_${currentQuestionIndex}`}
          questionText={currentQuestion.main}
        />

        {/* Context Button or Context */}
        {!showContext ? (
          <TouchableOpacity
            style={[styles.contextButton, { backgroundColor: journey.color + '20' }]}
            onPress={() => setShowContext(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.contextButtonText, { color: journey.color }]}>
              Explore Context
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.contextContainer}>
            <Text style={styles.contextText}>{currentQuestion.context}</Text>

            <View style={styles.followUpContainer}>
              <Text style={styles.followUpLabel}>Wonder deeper:</Text>
              <Text style={styles.followUpText}>{currentQuestion.followUp}</Text>
            </View>
          </View>
        )}

        {/* Navigation Options */}
        <View style={styles.navigationContainer}>
          {/* Next Question in same level */}
          {currentQuestionIndex < currentLevel.questions.length - 1 && (
            <TouchableOpacity
              style={styles.navigationButton}
              onPress={nextQuestion}
            >
              <Text style={styles.navigationText}>Next Question →</Text>
            </TouchableOpacity>
          )}

          {/* Go Deeper */}
          {currentDepth < unlockedLevels && (
            <TouchableOpacity
              style={[styles.deeperButton, { backgroundColor: journey.color + '20' }]}
              onPress={goDeeper}
            >
              <Text style={[styles.deeperButtonText, { color: journey.color }]}>
                Go Deeper ↓
              </Text>
            </TouchableOpacity>
          )}

          {/* Unlock Next Level */}
          {currentDepth === unlockedLevels &&
           unlockedLevels < journey.levels.length &&
           showContext && (
            <View style={styles.unlockContainer}>
              <Text style={styles.unlockText}>
                {engagementTime < 30
                  ? `Ponder this for ${30 - engagementTime} more seconds to unlock deeper levels...`
                  : 'New depth available!'}
              </Text>
              {engagementTime >= 30 && (
                <TouchableOpacity
                  style={[styles.unlockButton, { backgroundColor: journey.color }]}
                  onPress={() => goToDepth(currentDepth + 1)}
                >
                  <Text style={styles.unlockButtonText}>Enter Level {currentDepth + 1}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Depth Progress Visual */}
        <View style={styles.depthProgress}>
          <Text style={styles.depthProgressText}>
            Your Depth: {currentDepth} of {journey.levels.length}
          </Text>
          <View style={styles.depthBar}>
            <View
              style={[
                styles.depthBarFill,
                {
                  backgroundColor: journey.color,
                  width: `${(currentDepth / journey.levels.length) * 100}%`,
                }
              ]}
            />
          </View>
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
    paddingHorizontal: 25,
    paddingVertical: 40,
    minHeight: height,
  },
  depthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 20,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  depthDots: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  dot: {
    borderRadius: 6,
  },
  journeyTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 15,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  levelTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '200',
    letterSpacing: 0.5,
  },
  questionCounter: {
    color: '#666666',
    fontSize: 14,
  },
  questionContainer: {
    marginBottom: 40,
  },
  mainQuestion: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '200',
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  contextButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  contextButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  contextContainer: {
    marginBottom: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  contextText: {
    color: '#BBBBBB',
    fontSize: 17,
    lineHeight: 28,
    marginBottom: 25,
    letterSpacing: 0.3,
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
    fontSize: 20,
    fontWeight: '300',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  navigationContainer: {
    marginTop: 30,
    marginBottom: 50,
  },
  navigationButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#111111',
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  navigationText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  deeperButton: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 15,
  },
  deeperButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  unlockContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    alignItems: 'center',
  },
  unlockText: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  unlockButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  depthProgress: {
    marginTop: 40,
    alignItems: 'center',
  },
  depthProgressText: {
    color: '#666666',
    fontSize: 12,
    marginBottom: 10,
  },
  depthBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#222222',
    borderRadius: 2,
  },
  depthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});