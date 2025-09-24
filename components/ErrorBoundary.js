import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DataService from '../services/DataService';
import { Typography, TextStyles } from '../styles/typography';
import Spacing from '../styles/spacing';

// Steve Jobs would never let users see an error screen
// Instead, show them something beautiful and helpful

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1,
    });

    // Log to analytics service (if implemented)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = async (error, errorInfo) => {
    // Store error locally for debugging
    try {
      const errorData = {
        message: error.toString(),
        stack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      };

      const errors = await DataService.get('app_errors', []);
      errors.push(errorData);

      // Keep only last 10 errors
      if (errors.length > 10) {
        errors.shift();
      }

      await DataService.set('app_errors', errors);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleRestart = () => {
    // In production, this would restart the app
    // For now, just reset the error state
    this.handleReset();
  };

  render() {
    if (this.state.hasError) {
      // Beautiful error screen that maintains the app's aesthetic
      return (
        <SafeAreaView style={styles.container}>
          <LinearGradient
            colors={['#000000', '#1a1a1a', '#000000']}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.content}>
            {/* Elegant error message */}
            <Text style={styles.title}>
              Wonder needs a moment
            </Text>

            <Text style={styles.subtitle}>
              Something unexpected happened, but all is not lost.
            </Text>

            {/* Philosophical touch even in errors */}
            <View style={styles.quoteContainer}>
              <Text style={styles.quote}>
                "Failure is simply the opportunity to begin again,
                this time more intelligently."
              </Text>
              <Text style={styles.author}>— Henry Ford</Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={this.handleReset}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FFFFFF20', '#FFFFFF10']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={this.handleRestart}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>
                  Restart Wonder
                </Text>
              </TouchableOpacity>
            </View>

            {/* Debug info (only in development) */}
            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText} numberOfLines={3}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.screen.paddingHorizontal,
  },
  title: {
    ...TextStyles.journeyTitle,
    fontSize: 36,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...TextStyles.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  quoteContainer: {
    backgroundColor: '#0A0A0A',
    padding: Spacing.md,
    borderRadius: Spacing.card.borderRadius,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    marginBottom: Spacing.xl,
  },
  quote: {
    ...TextStyles.body,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  author: {
    ...TextStyles.caption,
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.gap.medium,
  },
  primaryButton: {
    borderRadius: Spacing.button.borderRadius,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: Spacing.button.paddingVertical,
    paddingHorizontal: Spacing.button.paddingHorizontal,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF20',
    borderRadius: Spacing.button.borderRadius,
  },
  buttonText: {
    ...TextStyles.button,
  },
  secondaryButton: {
    paddingVertical: Spacing.button.paddingVertical,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...TextStyles.caption,
    color: '#666666',
  },
  debugContainer: {
    marginTop: Spacing.xl,
    padding: Spacing.sm,
    backgroundColor: '#1A0000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#330000',
  },
  debugTitle: {
    ...TextStyles.label,
    color: '#FF6666',
    marginBottom: Spacing.xs,
  },
  debugText: {
    ...TextStyles.caption,
    fontFamily: 'Courier',
    color: '#CC9999',
    fontSize: 12,
  },
});

export default ErrorBoundary;