import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProgressRing from './ProgressRing';
import { Typography, TextStyles } from '../styles/typography';
import Spacing from '../styles/spacing';
import { useBreathingAnimation, useFloatingAnimation, useRotationAnimation } from '../hooks/useAnimations';

const { width, height } = Dimensions.get('window');

export default function AnimatedJourneyCard({
  journey,
  progress = 1,
  unlocked = 1,
  isActive = false,
  onPress,
  index = 0,
}) {
  // Animation values
  // Use reusable animation hooks
  const breatheAnim = useBreathingAnimation(4000, 1.02);
  const floatAnim = useFloatingAnimation(10, 3000 + index * 500);
  const iconRotation = useRotationAnimation(20000);
  const scaleAnim = useRef(new Animated.Value(isActive ? 1 : 0.85)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0.7)).current;

  // Animation effects are now handled by hooks

  useEffect(() => {
    // Active state animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1 : 0.85,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: isActive ? 1 : 0.7,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isActive]);

  const handlePress = () => {
    // Press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onPress) onPress();
    });
  };

  // iconRotation is now returned directly from the hook

  // Journey-specific gradients
  const getGradientColors = () => {
    switch (journey.theme) {
      case 'time':
        return ['#1a365d', '#2c5282', '#2b6cb0', '#4A90E2'];
      case 'god':
        return ['#44337a', '#553c9a', '#6b46c1', '#9C27B0'];
      case 'consciousness':
        return ['#7c2d12', '#c05621', '#ea580c', '#FF5722'];
      default:
        return ['#1a1a1a', '#2a2a2a', '#3a3a3a', '#4a4a4a'];
    }
  };

  // Journey-specific taglines
  const getTagline = () => {
    switch (journey.theme) {
      case 'time':
        return 'Where past meets future';
      case 'god':
        return 'Beyond belief itself';
      case 'consciousness':
        return 'The universe aware of itself';
      default:
        return 'A journey into wonder';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, breatheAnim) },
            { translateY: floatAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.touchable}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Overlay for depth */}
          <View style={styles.overlay} />

          {/* Icon Section */}
          <View style={styles.iconSection}>
            <Animated.Text
              style={[
                styles.icon,
                {
                  transform: [{ rotate: iconRotation }],
                },
              ]}
            >
              {journey.icon}
            </Animated.Text>

            {/* Progress Ring */}
            <View style={styles.progressContainer}>
              <ProgressRing
                progress={progress}
                total={6}
                size={60}
                color={journey.color}
                strokeWidth={3}
                showText={false}
              />
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.content}>
            <Text style={styles.title}>{journey.title}</Text>
            <Text style={styles.tagline}>{getTagline()}</Text>

            {/* Simplified Stats - Steve Jobs would approve */}
            <View style={styles.stats}>
              <Text style={styles.depthIndicator}>Depth {progress} of 6</Text>
            </View>

            {/* CTA Button */}
            <View style={styles.ctaButton}>
              <LinearGradient
                colors={['#FFFFFF20', '#FFFFFF10']}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.ctaText}>
                  {progress > 1 ? 'Continue Journey' : 'Begin Journey'}
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Decorative elements */}
          <View style={styles.decorativeTop} />
          <View style={styles.decorativeBottom} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.85,
    height: height * 0.65,
    marginHorizontal: width * 0.075,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  touchable: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    borderRadius: 30,
    padding: 30,
    justifyContent: 'space-between',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    opacity: 0.2,
    borderRadius: 30,
  },
  iconSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  icon: {
    fontSize: 100,
    marginBottom: 25,
  },
  progressContainer: {
    marginTop: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...TextStyles.journeyTitle,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...TextStyles.caption,
    color: '#FFFFFFAA',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  stats: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  depthIndicator: {
    ...TextStyles.body,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 1,
  },
  ctaButton: {
    marginTop: 20,
  },
  ctaGradient: {
    paddingVertical: 18,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FFFFFF30',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  decorativeTop: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    opacity: 0.03,
  },
  decorativeBottom: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    opacity: 0.02,
  },
});