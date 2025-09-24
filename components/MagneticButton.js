import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  Animated,
  StyleSheet,
  PanResponder,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MagneticButton({
  onPress,
  children,
  style,
  textStyle,
  gradientColors = ['#FFFFFF20', '#FFFFFF10'],
  magneticRange = 50,
  ...props
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: (evt, gestureState) => {
        const { moveX, moveY } = gestureState;
        const buttonCenter = { x: 0, y: 0 }; // Relative to button center

        // Calculate distance from touch to button center
        const distance = Math.sqrt(
          Math.pow(moveX - buttonCenter.x, 2) + Math.pow(moveY - buttonCenter.y, 2)
        );

        if (distance < magneticRange) {
          // Create magnetic effect
          const magneticPower = 1 - distance / magneticRange;
          const offsetX = (moveX - buttonCenter.x) * magneticPower * 0.3;
          const offsetY = (moveY - buttonCenter.y) * magneticPower * 0.3;

          Animated.parallel([
            Animated.spring(translateX, {
              toValue: offsetX,
              tension: 100,
              friction: 10,
              useNativeDriver: true,
            }),
            Animated.spring(translateY, {
              toValue: offsetY,
              tension: 100,
              friction: 10,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      onPanResponderRelease: () => {
        // Reset position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    // Ripple effect
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onPress) onPress();
    });
  };

  return (
    <View {...panResponder.panHandlers}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        {...props}
      >
        <Animated.View
          style={[
            styles.button,
            style,
            {
              transform: [
                { translateX },
                { translateY },
                { scale: scaleValue },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {typeof children === 'string' ? (
              <Text style={[styles.buttonText, textStyle]}>{children}</Text>
            ) : (
              children
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});