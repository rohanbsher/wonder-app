import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

// Steve Jobs would appreciate the elegance of reusable animation patterns
// DRY principle - Don't Repeat Yourself

// Breathing animation - creates a living, organic feel
export function useBreathingAnimation(duration = 4000, scale = 1.02) {
  const animValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: scale,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [duration, scale]);

  return animValue;
}

// Floating animation - subtle vertical movement
export function useFloatingAnimation(amplitude = 10, duration = 3000, delay = 0) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: -amplitude,
          duration: duration + delay,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: duration + delay,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [amplitude, duration, delay]);

  return animValue;
}

// Fade in animation with optional slide
export function useFadeInAnimation(duration = 800, delay = 0, slideFrom = 0) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(slideFrom)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: duration,
        delay: delay,
        useNativeDriver: true,
      }),
      slideFrom !== 0 && Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: delay,
        useNativeDriver: true,
      }),
    ].filter(Boolean)).start();
  }, []);

  return { fadeAnim, slideAnim };
}

// Press animation - subtle scale on tap
export function usePressAnimation(pressScale = 0.95) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: pressScale,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return { scaleAnim, handlePressIn, handlePressOut };
}

// Rotation animation - continuous rotation
export function useRotationAnimation(duration = 20000) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: true,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [duration]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return rotation;
}

// Pulsing animation - attention-grabbing pulse
export function usePulseAnimation(minScale = 1, maxScale = 1.2, duration = 2000) {
  const pulseAnim = useRef(new Animated.Value(minScale)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: maxScale,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: minScale,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [minScale, maxScale, duration]);

  return pulseAnim;
}

// Entrance animation - orchestrated entrance
export function useEntranceAnimation(stagger = 100) {
  const animations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const staggeredAnimation = Animated.stagger(stagger,
      animations.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      )
    );
    staggeredAnimation.start();
  }, []);

  return animations;
}

// Success animation - feedback for completed actions
export function useSuccessAnimation() {
  const successAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const triggerSuccess = (callback) => {
    Animated.parallel([
      Animated.sequence([
        Animated.spring(successAnim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  return { successAnim, scaleAnim, triggerSuccess };
}

// Scroll-based animation - animations tied to scroll position
export function useScrollAnimation() {
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  const getInterpolation = (inputRange, outputRange) => {
    return scrollY.interpolate({
      inputRange,
      outputRange,
      extrapolate: 'clamp',
    });
  };

  return { scrollY, handleScroll, getInterpolation };
}

// Magnetic animation - follows touch position
export function useMagneticAnimation() {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const animateTo = (x, y, tension = 100) => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: x,
        tension,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: y,
        tension,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const reset = () => {
    animateTo(0, 0);
  };

  return { translateX, translateY, animateTo, reset };
}