import * as Font from 'expo-font';
import {
  useFonts as useInterFonts,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  useFonts as usePlayfairFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display';
import {
  useFonts as useLoraFonts,
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
} from '@expo-google-fonts/lora';

// Typography scale following Steve Jobs' principle of simplicity
export const Typography = {
  // Font families
  fonts: {
    primary: 'Inter',
    philosophical: 'PlayfairDisplay', // For deep questions
    prose: 'Lora', // For stories and context
    system: 'System', // Fallback
  },

  // Font weights
  weights: {
    extraLight: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    black: '900',
  },

  // Size scale - Golden ratio inspired
  sizes: {
    hero: 48,      // Journey titles
    title: 32,     // Questions
    subtitle: 24,  // Section headers
    body: 18,      // Main content
    caption: 16,   // Secondary text
    small: 14,     // Labels
    tiny: 12,      // Metadata
  },

  // Line heights - Optimized for readability
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.618, // Golden ratio
    loose: 1.8,
  },

  // Letter spacing - Subtle refinement
  letterSpacing: {
    tightest: -1,
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
    ultraWide: 3,
  },

  // Pre-defined text styles
  styles: {
    heroQuestion: {
      fontFamily: 'PlayfairDisplay_700Bold',
      fontSize: 48,
      fontWeight: '700',
      lineHeight: 48 * 1.2,
      letterSpacing: -1,
      color: '#FFFFFF',
    },
    mainQuestion: {
      fontFamily: 'PlayfairDisplay_400Regular',
      fontSize: 32,
      fontWeight: '400',
      lineHeight: 32 * 1.5,
      letterSpacing: -0.5,
      color: '#FFFFFF',
    },
    journeyTitle: {
      fontFamily: 'Inter_200ExtraLight',
      fontSize: 42,
      fontWeight: '200',
      lineHeight: 42 * 1.2,
      letterSpacing: 1,
      color: '#FFFFFF',
    },
    sectionHeader: {
      fontFamily: 'Inter_500Medium',
      fontSize: 24,
      fontWeight: '500',
      lineHeight: 24 * 1.3,
      letterSpacing: 0.5,
      color: '#FFFFFF',
    },
    body: {
      fontFamily: 'Lora_400Regular',
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 18 * 1.618,
      letterSpacing: 0.3,
      color: '#CCCCCC',
    },
    caption: {
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 16 * 1.5,
      letterSpacing: 0,
      color: '#999999',
    },
    button: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 18 * 1.2,
      letterSpacing: 0.5,
      color: '#FFFFFF',
    },
    label: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 12 * 1.5,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: '#666666',
    },
  },
};

// Custom hook to load all fonts
export function useCustomFonts() {
  const [interLoaded] = useInterFonts({
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [playfairLoaded] = usePlayfairFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
  });

  const [loraLoaded] = useLoraFonts({
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
  });

  return interLoaded && playfairLoaded && loraLoaded;
}

// Function to get text style
export function getTextStyle(styleName) {
  return Typography.styles[styleName] || Typography.styles.body;
}

// Export individual styles for convenience
export const TextStyles = Typography.styles;