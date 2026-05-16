import { WidgetBridgePlugin } from 'capacitor-widget-bridge';
import { logger } from '../lib/logger';

const widgetLogger = logger.createContext('WidgetService');
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const WIDGET_GROUP = 'group.com.kinetic.app.widgets';
const STREAK_KEY = 'widget_streak';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Structured logger for widget operations
 */
class WidgetLogger {
  private prefix = '📱 [WidgetService]';

  info(message: string, data?: any) {
    widgetLogger.info(`${this.prefix} ${message}`, data || '');
  }

  success(message: string, data?: any) {
    widgetLogger.info(`${this.prefix} ✅ ${message}`, data || '');
  }

  warn(message: string, data?: any) {
    console.warn(`${this.prefix} ⚠️ ${message}`, data || '');
  }

  error(message: string, error?: any) {
    console.error(`${this.prefix} ❌ ${message}`, error || '');
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`${this.prefix} 🔍 ${message}`, data || '');
    }
  }
}

/**
 * Service for managing native widgets with robust error handling
 */
class WidgetService {
  private logger = new WidgetLogger();
  private updateInProgress = false;

  /**
   * Validate streak value
   */
  private validateStreak(streak: number): boolean {
    if (typeof streak !== 'number') {
      this.logger.error('Invalid streak type', { type: typeof streak, value: streak });
      return false;
    }

    if (isNaN(streak)) {
      this.logger.error('Streak is NaN');
      return false;
    }

    if (streak < 0) {
      this.logger.warn('Negative streak value', { streak });
      return false;
    }

    if (streak > 10000) {
      this.logger.warn('Suspiciously high streak value', { streak });
      return false;
    }

    return true;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string,
    retries = MAX_RETRIES
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
          this.logger.info(`Retry attempt ${attempt + 1}/${retries} for ${operationName}`, { delay });
          await this.sleep(delay);
        }

        return await operation();
      } catch (error) {
        lastError = error;
        this.logger.warn(`${operationName} failed (attempt ${attempt + 1}/${retries})`, error);

        if (attempt === retries - 1) {
          throw lastError;
        }
      }
    }

    throw lastError;
  }

  /**
   * Update the streak widget with new data
   */
  async updateStreakWidget(streak: number): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      this.logger.debug('Skipping widget update (not native platform)');
      return;
    }

    // Prevent concurrent updates
    if (this.updateInProgress) {
      this.logger.warn('Widget update already in progress, skipping');
      return;
    }

    // Validate input
    if (!this.validateStreak(streak)) {
      this.logger.error('Invalid streak value, aborting update', { streak });
      return;
    }

    this.updateInProgress = true;
    const platform = Capacitor.getPlatform();

    try {
      this.logger.info(`Updating widget with streak: ${streak} (platform: ${platform})`);

      if (platform === 'android') {
        // Android: Use Capacitor Preferences to store streak
        // The widget will read from these preferences
        await this.retryWithBackoff(
          async () => {
            await Preferences.set({
              key: STREAK_KEY,
              value: String(streak),
            });
          },
          'Preferences.set'
        );
        this.logger.success('Android widget data stored successfully', { streak });
      } else if (platform === 'ios') {
        // iOS: Use WidgetBridgePlugin to write to App Groups
        await this.retryWithBackoff(
          async () => {
            await WidgetBridgePlugin.setItem({
              key: STREAK_KEY,
              value: String(streak),
              group: WIDGET_GROUP,
            });
          },
          'WidgetBridgePlugin.setItem'
        );
        this.logger.success('iOS widget data stored successfully', { streak });

        // Reload the widget with retry (iOS only)
        try {
          await this.retryWithBackoff(
            async () => {
              await WidgetBridgePlugin.reloadAllTimelines();
            },
            'reloadAllTimelines',
            2 // Fewer retries for reload
          );
          this.logger.success('iOS widget reloaded successfully');
        } catch (reloadError) {
          // Widget reload can fail if widget is not added to home screen
          // This is expected and shouldn't break the app
          this.logger.warn(
            'Widget reload failed (expected if widget not on home screen)',
            reloadError
          );
        }
      } else {
        this.logger.warn(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      this.logger.error('Failed to update widget after retries', error);
      // Don't throw - we don't want widget errors to break the app
    } finally {
      this.updateInProgress = false;
    }
  }

  /**
   * Get the current streak value from the widget
   */
  async getStreakFromWidget(): Promise<number> {
    if (!Capacitor.isNativePlatform()) {
      this.logger.debug('Skipping widget read (not native platform)');
      return 0;
    }

    try {
      this.logger.debug('Reading streak from widget');

      const result = await this.retryWithBackoff(
        async () => {
          return await WidgetBridgePlugin.getItem({
            key: STREAK_KEY,
            group: WIDGET_GROUP,
          });
        },
        'getItem'
      );

      const streakValue = parseInt(result.results || '0', 10);

      if (isNaN(streakValue)) {
        this.logger.warn('Invalid streak value from widget, returning 0', { raw: result.results });
        return 0;
      }

      this.logger.success('Read streak from widget', { streak: streakValue });
      return streakValue;
    } catch (error) {
      this.logger.error('Failed to get streak from widget', error);
      return 0;
    }
  }

  /**
   * Check if widget is available/supported
   */
  isWidgetSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Get widget service status
   */
  getStatus(): {
    supported: boolean;
    updateInProgress: boolean;
    platform: string;
  } {
    return {
      supported: this.isWidgetSupported(),
      updateInProgress: this.updateInProgress,
      platform: Capacitor.getPlatform(),
    };
  }
}

export const widgetService = new WidgetService();
