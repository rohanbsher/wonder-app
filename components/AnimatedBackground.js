import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function AnimatedBackground({ theme, depth = 1 }) {
  const animation1 = useRef(new Animated.Value(0)).current;
  const animation2 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Main floating animation
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(animation1, {
            toValue: 1,
            duration: 20000,
            useNativeDriver: true,
          }),
          Animated.timing(animation1, {
            toValue: 0,
            duration: 20000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(animation2, {
            toValue: 1,
            duration: 15000,
            useNativeDriver: true,
          }),
          Animated.timing(animation2, {
            toValue: 0,
            duration: 15000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getGradientColors = () => {
    const deeperFactor = (depth - 1) / 5; // 0 to 1 based on depth

    switch (theme) {
      case 'time':
        // Blue shifting to deeper purple as you go deeper
        return [
          `rgba(26, 54, 93, ${0.95 + deeperFactor * 0.05})`,
          `rgba(74, 144, 226, ${0.3 - deeperFactor * 0.2})`,
          `rgba(20, 30, 48, ${0.98 + deeperFactor * 0.02})`,
          '#000000',
        ];
      case 'god':
        // Purple shifting to cosmic colors
        return [
          `rgba(46, 7, 63, ${0.95 + deeperFactor * 0.05})`,
          `rgba(156, 39, 176, ${0.3 - deeperFactor * 0.2})`,
          `rgba(25, 10, 40, ${0.98 + deeperFactor * 0.02})`,
          '#000000',
        ];
      case 'consciousness':
        // Red/orange shifting to deeper consciousness colors
        return [
          `rgba(63, 7, 7, ${0.95 + deeperFactor * 0.05})`,
          `rgba(255, 87, 34, ${0.3 - deeperFactor * 0.2})`,
          `rgba(40, 10, 10, ${0.98 + deeperFactor * 0.02})`,
          '#000000',
        ];
      default:
        return ['#000000', '#111111', '#000000', '#000000'];
    }
  };

  const renderTimeVisuals = () => (
    <>
      {/* Flowing time streams */}
      <Animated.View
        style={[
          styles.floatingElement,
          {
            transform: [
              {
                translateY: animation1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -100],
                }),
              },
              {
                translateX: animation2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 50],
                }),
              },
              { scale: pulseAnim },
            ],
            opacity: animation1.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.1, 0.3, 0.1],
            }),
          },
        ]}
      >
        <Svg height="400" width="400" style={styles.svgContainer}>
          <Circle cx="200" cy="200" r="150" fill="rgba(74, 144, 226, 0.05)" />
          <Circle cx="200" cy="200" r="100" fill="rgba(74, 144, 226, 0.08)" />
          <Circle cx="200" cy="200" r="50" fill="rgba(74, 144, 226, 0.1)" />
        </Svg>
      </Animated.View>
    </>
  );

  const renderGodVisuals = () => (
    <>
      {/* Ethereal cosmic elements */}
      <Animated.View
        style={[
          styles.floatingElement,
          {
            transform: [
              {
                translateY: animation2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, -50],
                }),
              },
              {
                rotate: animation1.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
              { scale: pulseAnim },
            ],
            opacity: 0.2,
          },
        ]}
      >
        <Svg height="300" width="300" style={styles.svgContainer}>
          {/* Star pattern */}
          {[...Array(6)].map((_, i) => (
            <Circle
              key={i}
              cx={150 + Math.cos(i * 60 * Math.PI / 180) * 100}
              cy={150 + Math.sin(i * 60 * Math.PI / 180) * 100}
              r="5"
              fill="rgba(156, 39, 176, 0.3)"
            />
          ))}
        </Svg>
      </Animated.View>
    </>
  );

  const renderConsciousnessVisuals = () => (
    <>
      {/* Neural network-like connections */}
      <Animated.View
        style={[
          styles.floatingElement,
          {
            transform: [
              { scale: pulseAnim },
              {
                rotate: animation1.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }),
              },
            ],
            opacity: 0.15,
          },
        ]}
      >
        <Svg height="400" width="400" style={styles.svgContainer}>
          {/* Neural nodes */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45) * Math.PI / 180;
            const x = 200 + Math.cos(angle) * 120;
            const y = 200 + Math.sin(angle) * 120;
            return (
              <React.Fragment key={i}>
                <Circle cx={x} cy={y} r="8" fill="rgba(255, 87, 34, 0.2)" />
                <Path
                  d={`M 200 200 L ${x} ${y}`}
                  stroke="rgba(255, 87, 34, 0.1)"
                  strokeWidth="1"
                />
              </React.Fragment>
            );
          })}
        </Svg>
      </Animated.View>
    </>
  );

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <LinearGradient
        colors={getGradientColors()}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {theme === 'time' && renderTimeVisuals()}
      {theme === 'god' && renderGodVisuals()}
      {theme === 'consciousness' && renderConsciousnessVisuals()}

      {/* Depth overlay - gets darker as you go deeper */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: 'black',
            opacity: depth * 0.08, // More darkness as you go deeper
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  floatingElement: {
    position: 'absolute',
    top: height * 0.2,
    left: width * 0.1,
  },
  svgContainer: {
    position: 'absolute',
  },
});