import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import journeysData from '../journeys.json';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function JourneyScreen({ navigation }) {
  const [journeyProgress, setJourneyProgress] = useState({});

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('journeyProgress');
      if (saved) {
        setJourneyProgress(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }
  };

  const getJourneyDepth = (journeyId) => {
    return journeyProgress[journeyId]?.currentDepth || 1;
  };

  const getUnlockedLevels = (journeyId) => {
    return journeyProgress[journeyId]?.unlockedLevels || 1;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose Your Journey</Text>
          <Text style={styles.headerSubtitle}>
            Each question has infinite depth. How far will you go?
          </Text>
        </View>

        <View style={styles.journeysContainer}>
          {journeysData.journeys.map((journey) => (
            <TouchableOpacity
              key={journey.id}
              style={[
                styles.journeyCard,
                { borderColor: journey.color + '40' }
              ]}
              onPress={() => navigation.navigate('Depth', { journeyId: journey.id })}
              activeOpacity={0.8}
            >
              <View style={styles.journeyHeader}>
                <Text style={styles.journeyIcon}>{journey.icon}</Text>
                <View style={styles.progressIndicator}>
                  <Text style={styles.depthText}>
                    Depth {getJourneyDepth(journey.id)}/6
                  </Text>
                </View>
              </View>

              <Text style={styles.journeyTitle}>{journey.title}</Text>
              <Text style={styles.journeyDescription}>{journey.description}</Text>

              {/* Depth visualization */}
              <View style={styles.depthVisual}>
                {[...Array(6)].map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.depthDot,
                      {
                        backgroundColor:
                          index < getUnlockedLevels(journey.id)
                            ? journey.color
                            : '#333333',
                        opacity: index < getUnlockedLevels(journey.id) ? 1 : 0.3,
                      }
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.exploreButton, { backgroundColor: journey.color + '20' }]}
                onPress={() => navigation.navigate('Depth', { journeyId: journey.id })}
              >
                <Text style={[styles.exploreButtonText, { color: journey.color }]}>
                  {getJourneyDepth(journey.id) > 1 ? 'Continue Journey' : 'Begin Journey'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Question Link */}
        <TouchableOpacity
          style={styles.dailyQuestionButton}
          onPress={() => navigation.navigate('Daily')}
        >
          <Text style={styles.dailyQuestionText}>
            Or explore today's daily wonder →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 40,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    marginBottom: 10,
  },
  headerSubtitle: {
    color: '#888888',
    fontSize: 16,
    lineHeight: 24,
  },
  journeysContainer: {
    marginBottom: 30,
  },
  journeyCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 1,
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  journeyIcon: {
    fontSize: 40,
  },
  progressIndicator: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  depthText: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '600',
  },
  journeyTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 10,
  },
  journeyDescription: {
    color: '#999999',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  depthVisual: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  depthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exploreButton: {
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dailyQuestionButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  dailyQuestionText: {
    color: '#666666',
    fontSize: 16,
  },
});