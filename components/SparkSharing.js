import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const CARD_THEMES = {
  cosmic: {
    gradient: ['#1a1042', '#461959', '#7A316F', '#CD6688'],
    accent: '#FFB6C1',
  },
  ocean: {
    gradient: ['#051937', '#004d7a', '#008793', '#00bf72'],
    accent: '#A8DADC',
  },
  sunset: {
    gradient: ['#2E1A47', '#624CAB', '#E97451', '#FFBD59'],
    accent: '#FFE5B4',
  },
  midnight: {
    gradient: ['#000000', '#1a1a2e', '#16213e', '#0f3460'],
    accent: '#E94560',
  },
  aurora: {
    gradient: ['#000428', '#004e92', '#009ffd', '#00d2ff'],
    accent: '#ffa400',
  },
};

export default function SparkSharing({ question, type = 'daily', journeyTitle = null }) {
  const viewShotRef = useRef(null);
  const [selectedTheme, setSelectedTheme] = useState('cosmic');
  const [isCapturing, setIsCapturing] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const captureAndShare = async () => {
    setIsCapturing(true);

    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      // Capture the card as image
      const uri = await viewShotRef.current.capture();

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share Wonder',
        });

        // Track share
        await trackShare();
      } else {
        // Save to camera roll as fallback
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (permission.granted) {
          await MediaLibrary.saveToLibraryAsync(uri);
          Alert.alert('Saved!', 'Question card saved to your photos');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Could not share question');
    }

    setIsCapturing(false);
  };

  const trackShare = async () => {
    try {
      const shares = await AsyncStorage.getItem('shareCount');
      const count = shares ? parseInt(shares) + 1 : 1;
      await AsyncStorage.setItem('shareCount', count.toString());

      // Check for share milestones
      const milestones = {
        1: 'Your first spark shared!',
        10: 'Ten sparks sent into the world',
        50: 'Fifty minds sparked with wonder',
      };

      if (milestones[count]) {
        // Could show a celebration animation here
        console.log(milestones[count]);
      }
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const theme = CARD_THEMES[selectedTheme];

  return (
    <View style={styles.container}>
      {/* Theme Selector */}
      <View style={styles.themeSelector}>
        {Object.keys(CARD_THEMES).map((themeName) => (
          <TouchableOpacity
            key={themeName}
            style={[
              styles.themeButton,
              selectedTheme === themeName && styles.themeButtonActive,
            ]}
            onPress={() => setSelectedTheme(themeName)}
          >
            <LinearGradient
              colors={CARD_THEMES[themeName].gradient}
              style={styles.themePreview}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Question Card Preview */}
      <ViewShot
        ref={viewShotRef}
        style={styles.cardPreview}
        options={{
          format: 'png',
          quality: 1,
          width: 1080,
          height: 1920,
        }}
      >
        <LinearGradient colors={theme.gradient} style={styles.card}>
          {/* Decorative Elements */}
          <View style={styles.decorativeTop}>
            <Svg width="200" height="200" style={styles.svgDecoration}>
              <Circle
                cx="100"
                cy="100"
                r="80"
                fill={theme.accent}
                opacity={0.1}
              />
              <Circle
                cx="100"
                cy="100"
                r="60"
                fill={theme.accent}
                opacity={0.15}
              />
              <Circle
                cx="100"
                cy="100"
                r="40"
                fill={theme.accent}
                opacity={0.2}
              />
            </Svg>
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            {journeyTitle && (
              <Text style={[styles.journeyLabel, { color: theme.accent }]}>
                {journeyTitle}
              </Text>
            )}

            <Text style={styles.questionText}>{question}</Text>

            <View style={styles.brandingContainer}>
              <Text style={[styles.brandingText, { color: theme.accent }]}>
                Wonder
              </Text>
              <Text style={styles.tagline}>A moment of deep thinking</Text>
            </View>
          </View>

          {/* Decorative Bottom */}
          <View style={styles.decorativeBottom}>
            <Svg width="300" height="150" style={styles.svgDecorationBottom}>
              <Path
                d="M0,50 Q150,0 300,50"
                stroke={theme.accent}
                strokeWidth="2"
                fill="none"
                opacity={0.3}
              />
              <Path
                d="M0,100 Q150,50 300,100"
                stroke={theme.accent}
                strokeWidth="1"
                fill="none"
                opacity={0.2}
              />
            </Svg>
          </View>
        </LinearGradient>
      </ViewShot>

      {/* Share Button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={captureAndShare}
          disabled={isCapturing}
        >
          <Text style={styles.shareButtonText}>
            {isCapturing ? 'Creating magic...' : 'Share this Wonder'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Direct Share Option */}
      <TouchableOpacity style={styles.directShareButton}>
        <Text style={styles.directShareText}>
          Or send to someone special →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: 'center',
  },
  themeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeButtonActive: {
    borderColor: '#FFFFFF',
  },
  themePreview: {
    flex: 1,
  },
  cardPreview: {
    width: width * 0.8,
    height: width * 0.8 * 1.77, // 9:16 ratio
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    flex: 1,
    padding: 30,
    justifyContent: 'space-between',
  },
  decorativeTop: {
    position: 'absolute',
    top: -50,
    right: -50,
  },
  svgDecoration: {
    opacity: 0.3,
  },
  decorativeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  svgDecorationBottom: {
    opacity: 0.5,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  journeyLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 20,
    opacity: 0.9,
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 48,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  brandingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  brandingText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 5,
  },
  tagline: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
    letterSpacing: 1,
  },
  shareButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 15,
  },
  shareButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  directShareButton: {
    paddingVertical: 10,
  },
  directShareText: {
    color: '#888888',
    fontSize: 14,
  },
});