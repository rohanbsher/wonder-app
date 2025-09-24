import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ThoughtCapture({ questionId, questionText, onClose }) {
  const [thought, setThought] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedThoughts, setSavedThoughts] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPreviousThoughts();
  }, []);

  const loadPreviousThoughts = async () => {
    try {
      const thoughts = await AsyncStorage.getItem(`thoughts_${questionId}`);
      if (thoughts) {
        setSavedThoughts(JSON.parse(thoughts));
      }
    } catch (error) {
      console.error('Error loading thoughts:', error);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);

    if (!isExpanded) {
      // Animate expansion
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate collapse
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onClose) onClose();
      });
    }
  };

  const saveThought = async () => {
    if (!thought.trim()) return;

    const newThought = {
      id: Date.now().toString(),
      text: thought,
      timestamp: new Date().toISOString(),
      questionId,
      questionText,
    };

    try {
      // Save to local storage
      const allThoughts = [...savedThoughts, newThought];
      await AsyncStorage.setItem(`thoughts_${questionId}`, JSON.stringify(allThoughts));

      // Save to global thoughts collection
      const globalThoughts = await AsyncStorage.getItem('allThoughts');
      const thoughts = globalThoughts ? JSON.parse(globalThoughts) : [];
      thoughts.push(newThought);
      await AsyncStorage.setItem('allThoughts', JSON.stringify(thoughts));

      // Update state
      setSavedThoughts(allThoughts);
      setThought('');

      // Show success animation
      showSuccessAnimation();

      // Check for milestone
      await checkThoughtMilestone(thoughts.length);

      // Hide keyboard
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error saving thought:', error);
    }
  };

  const showSuccessAnimation = () => {
    setShowSuccess(true);
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
    ]).start(() => {
      setShowSuccess(false);
      toggleExpanded();
    });
  };

  const checkThoughtMilestone = async (thoughtCount) => {
    const milestones = {
      1: 'Your first thought captured!',
      10: 'Ten moments of clarity',
      50: 'Fifty philosophical insights',
      100: 'A century of wonder',
    };

    if (milestones[thoughtCount]) {
      // Store milestone for later display
      await AsyncStorage.setItem('latestMilestone', milestones[thoughtCount]);
    }
  };

  if (!isExpanded) {
    return (
      <TouchableOpacity
        style={styles.captureButton}
        onPress={toggleExpanded}
        activeOpacity={0.8}
      >
        <Text style={styles.captureButtonText}>Capture a thought</Text>
      </TouchableOpacity>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.expandedContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Your thought on this wonder...</Text>
          <TouchableOpacity onPress={toggleExpanded} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="What sparked in your mind?"
          placeholderTextColor="#666666"
          multiline
          maxLength={500}
          value={thought}
          onChangeText={setThought}
          autoFocus
        />

        <View style={styles.footer}>
          <Text style={styles.characterCount}>{thought.length}/500</Text>
          <TouchableOpacity
            style={[styles.saveButton, !thought.trim() && styles.saveButtonDisabled]}
            onPress={saveThought}
            disabled={!thought.trim()}
          >
            <Text style={styles.saveButtonText}>Save Thought</Text>
          </TouchableOpacity>
        </View>

        {savedThoughts.length > 0 && (
          <View style={styles.previousThoughts}>
            <Text style={styles.previousTitle}>
              Your previous thoughts ({savedThoughts.length})
            </Text>
            {savedThoughts.slice(-2).reverse().map((t, index) => (
              <View key={t.id} style={styles.previousThought}>
                <Text style={styles.previousText}>{t.text}</Text>
                <Text style={styles.previousDate}>
                  {new Date(t.timestamp).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {showSuccess && (
          <Animated.View
            style={[
              styles.successMessage,
              {
                opacity: successAnim,
                transform: [
                  {
                    translateY: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.successText}>Thought captured beautifully</Text>
          </Animated.View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  captureButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  expandedContainer: {
    backgroundColor: '#0A0A0A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    color: '#666666',
    fontSize: 20,
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: 15,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  characterCount: {
    color: '#666666',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    opacity: 0.3,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  previousThoughts: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  previousTitle: {
    color: '#666666',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  previousThought: {
    backgroundColor: '#000000',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  previousText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  previousDate: {
    color: '#666666',
    fontSize: 11,
    marginTop: 5,
  },
  successMessage: {
    position: 'absolute',
    top: '50%',
    left: '20%',
    right: '20%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  successText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
});