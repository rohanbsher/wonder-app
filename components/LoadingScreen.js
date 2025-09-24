import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePulseAnimation, useRotationAnimation } from '../hooks/useAnimations';
import { Typography, TextStyles } from '../styles/typography';
import Spacing from '../styles/spacing';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = usePulseAnimation(0.9, 1.1, 3000);
  const rotation = useRotationAnimation(8000);

  useEffect(() => {
    // Elegant fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Elegant loading indicator - no emoji per Steve Jobs */}
        <Animated.View
          style={[
            styles.orbContainer,
            {
              transform: [
                { scale: pulseAnim },
                { rotate: rotation },
              ],
            },
          ]}
        >
          <View style={styles.orb} />
          <View style={styles.orbInner} />
        </Animated.View>

        {/* Wonder text */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          Wonder
        </Animated.Text>

        {/* Loading text */}
        <Animated.Text
          style={[
            styles.loadingText,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          Preparing your journey
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  content: {
    alignItems: 'center',
  },
  orbContainer: {
    width: 80,
    height: 80,
    marginBottom: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orb: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    backgroundColor: '#FFFFFF05',
  },
  orbInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  title: {
    ...TextStyles.heroQuestion,
    fontSize: 56,
    letterSpacing: 4,
    marginBottom: Spacing.md,
  },
  loadingText: {
    ...TextStyles.caption,
    color: '#FFFFFF40',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 12,
  },
});