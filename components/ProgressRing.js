import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ProgressRing({
  progress = 0,
  total = 6,
  size = 80,
  strokeWidth = 3,
  color = '#4A90E2',
  bgColor = '#1A1A1A',
  showText = true,
  animated = true,
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const circleRef = useRef();

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressValue = (progress / total) * 100;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progressValue,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(progressValue);
    }
  }, [progress, total]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={styles.container}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.3}
          />

          {/* Progress Circle */}
          <AnimatedCircle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>

        {/* Center Text */}
        {showText && (
          <SvgText
            x={size / 2}
            y={size / 2 + 5}
            fontSize="16"
            fill="#FFFFFF"
            textAnchor="middle"
            fontWeight="300"
          >
            {`${progress}/${total}`}
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    transform: [{ rotateZ: '90deg' }],
  },
});