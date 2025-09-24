import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MorningRitual from '../services/MorningRitual';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Wonder',
    subtitle: 'One profound question.\nEvery single day.',
    gradient: ['#000000', '#1a1a2e', '#16213e'],
    icon: '✨',
  },
  {
    id: 2,
    title: 'Think Deeper',
    subtitle: 'Journey through layers\nof understanding.',
    gradient: ['#16213e', '#0f3460', '#533483'],
    icon: '🌊',
  },
  {
    id: 3,
    title: 'Capture Clarity',
    subtitle: 'Your thoughts matter.\nSave them beautifully.',
    gradient: ['#533483', '#C06C84', '#F67280'],
    icon: '💭',
  },
  {
    id: 4,
    title: 'Morning Ritual',
    subtitle: 'Start each day\nwith wonder.',
    gradient: ['#F67280', '#F8B500', '#FFD700'],
    icon: '🌅',
    showNotificationPrompt: true,
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [name, setName] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateSlideIn();
  }, [currentSlide]);

  const animateSlideIn = () => {
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);
    titleAnim.setValue(-30);

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(titleAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const goToNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentSlide(currentSlide + 1);
      });
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    try {
      // Save onboarding completion
      await AsyncStorage.setItem('onboardingCompleted', 'true');

      // Initialize morning ritual if on last slide
      if (SLIDES[currentSlide].showNotificationPrompt) {
        await MorningRitual.initialize();
      }

      // Animate out and navigate
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Journey');
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      navigation.replace('Journey');
    }
  };

  const skip = () => {
    completeOnboarding();
  };

  const slide = SLIDES[currentSlide];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={slide.gradient}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Skip button */}
          {currentSlide < SLIDES.length - 1 && (
            <TouchableOpacity style={styles.skipButton} onPress={skip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}

          {/* Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.icon}>{slide.icon}</Text>
          </Animated.View>

          {/* Title and Subtitle */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                transform: [{ translateY: titleAnim }],
              },
            ]}
          >
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </Animated.View>

          {/* Special content for notification prompt */}
          {slide.showNotificationPrompt && (
            <View style={styles.notificationPrompt}>
              <Text style={styles.promptText}>
                We'll send you a gentle reminder each morning
              </Text>
              <Text style={styles.promptSubtext}>
                You can customize this anytime
              </Text>
            </View>
          )}

          {/* Progress dots */}
          <View style={styles.dotsContainer}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === currentSlide ? '#FFFFFF' : '#FFFFFF30',
                    width: index === currentSlide ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* Next/Complete button */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={goToNext}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFFFFF20', '#FFFFFF10']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.nextButtonText}>
                {currentSlide === SLIDES.length - 1
                  ? 'Begin Your Journey'
                  : 'Continue'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 0,
    padding: 10,
  },
  skipText: {
    color: '#FFFFFF60',
    fontSize: 16,
  },
  iconContainer: {
    marginBottom: 60,
  },
  icon: {
    fontSize: 100,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  title: {
    fontSize: 48,
    fontWeight: '200',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '300',
    color: '#FFFFFFCC',
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: 0.5,
  },
  notificationPrompt: {
    backgroundColor: '#FFFFFF10',
    padding: 20,
    borderRadius: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  promptText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  promptSubtext: {
    color: '#FFFFFF80',
    fontSize: 14,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 60,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s',
  },
  nextButton: {
    position: 'absolute',
    bottom: 60,
    left: 40,
    right: 40,
  },
  nextButtonGradient: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});