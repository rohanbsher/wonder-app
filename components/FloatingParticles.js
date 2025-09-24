import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const Particle = ({ delay, color, size = 4 }) => {
  const animX = useRef(new Animated.Value(Math.random() * width)).current;
  const animY = useRef(new Animated.Value(Math.random() * height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(animY, {
            toValue: -100,
            duration: 20000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animY, {
            toValue: height + 100,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(animX, {
            toValue: animX._value + (Math.random() - 0.5) * 200,
            duration: 10000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animX, {
            toValue: animX._value - (Math.random() - 0.5) * 200,
            duration: 10000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          opacity,
          transform: [
            { translateX: animX },
            { translateY: animY },
          ],
        },
      ]}
    />
  );
};

export default function FloatingParticles({ theme = 'default', count = 20 }) {
  const getParticleColor = () => {
    switch (theme) {
      case 'time':
        return 'rgba(74, 144, 226, 0.6)';
      case 'god':
        return 'rgba(156, 39, 176, 0.6)';
      case 'consciousness':
        return 'rgba(255, 87, 34, 0.6)';
      default:
        return 'rgba(255, 255, 255, 0.3)';
    }
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {[...Array(count)].map((_, i) => (
        <Particle
          key={i}
          delay={i * 200}
          color={getParticleColor()}
          size={Math.random() * 3 + 2}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
});