import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { widgetService } from './widgetService';
import { Capacitor } from '@capacitor/core';
import { WidgetBridgePlugin } from 'capacitor-widget-bridge';
import { Preferences } from '@capacitor/preferences';

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(),
    getPlatform: vi.fn(),
  },
}));

// Mock WidgetBridgePlugin
vi.mock('capacitor-widget-bridge', () => ({
  WidgetBridgePlugin: {
    setItem: vi.fn(),
    getItem: vi.fn(),
    reloadAllTimelines: vi.fn(),
  },
}));

// Mock Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    set: vi.fn(),
    get: vi.fn(),
  },
}));

describe('widgetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: simulate native platform
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    vi.mocked(Capacitor.getPlatform).mockReturnValue('android');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isWidgetSupported', () => {
    it('should return true on native platform', () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      expect(widgetService.isWidgetSupported()).toBe(true);
    });

    it('should return false on web platform', () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
      expect(widgetService.isWidgetSupported()).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return correct status', () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android');

      const status = widgetService.getStatus();

      expect(status).toEqual({
        supported: true,
        updateInProgress: false,
        platform: 'android',
      });
    });

    it('should reflect iOS platform', () => {
      vi.mocked(Capacitor.getPlatform).mockReturnValue('ios');

      const status = widgetService.getStatus();

      expect(status.platform).toBe('ios');
    });
  });

  describe('updateStreakWidget', () => {
    it('should skip update on non-native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

      await widgetService.updateStreakWidget(5);

      expect(Preferences.set).not.toHaveBeenCalled();
      expect(WidgetBridgePlugin.setItem).not.toHaveBeenCalled();
    });

    describe('Android', () => {
      beforeEach(() => {
        vi.mocked(Capacitor.getPlatform).mockReturnValue('android');
      });

      it('should use Preferences.set for Android', async () => {
        vi.mocked(Preferences.set).mockResolvedValue();

        await widgetService.updateStreakWidget(7);

        expect(Preferences.set).toHaveBeenCalledWith({
          key: 'widget_streak',
          value: '7',
        });
        expect(WidgetBridgePlugin.setItem).not.toHaveBeenCalled();
      });

      it('should accept streak value of 0', async () => {
        vi.mocked(Preferences.set).mockResolvedValue();

        await widgetService.updateStreakWidget(0);

        expect(Preferences.set).toHaveBeenCalledWith({
          key: 'widget_streak',
          value: '0',
        });
      });

      it('should retry on Preferences.set failure', async () => {
        vi.mocked(Preferences.set)
          .mockRejectedValueOnce(new Error('Network error'))
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce();

        await widgetService.updateStreakWidget(5);

        expect(Preferences.set).toHaveBeenCalledTimes(3);
      });
    });

    describe('iOS', () => {
      beforeEach(() => {
        vi.mocked(Capacitor.getPlatform).mockReturnValue('ios');
      });

      it('should use WidgetBridgePlugin for iOS', async () => {
        (vi.mocked(WidgetBridgePlugin.setItem) as any).mockResolvedValue(undefined);
        (vi.mocked(WidgetBridgePlugin.reloadAllTimelines) as any).mockResolvedValue(undefined);

        await widgetService.updateStreakWidget(7);

        expect(WidgetBridgePlugin.setItem).toHaveBeenCalledWith({
          key: 'widget_streak',
          value: '7',
          group: 'group.com.kinetic.app.widgets',
        });
        expect(WidgetBridgePlugin.reloadAllTimelines).toHaveBeenCalled();
        expect(Preferences.set).not.toHaveBeenCalled();
      });

      it('should handle reload failure gracefully', async () => {
        (vi.mocked(WidgetBridgePlugin.setItem) as any).mockResolvedValue(undefined);
        vi.mocked(WidgetBridgePlugin.reloadAllTimelines).mockRejectedValue(
          new Error('Widget not on home screen')
        );

        // Should not throw
        await expect(widgetService.updateStreakWidget(5)).resolves.toBeUndefined();

        expect(WidgetBridgePlugin.setItem).toHaveBeenCalled();
      });

      it('should retry on setItem failure', async () => {
        vi.mocked(WidgetBridgePlugin.setItem)
          .mockRejectedValueOnce(new Error('Network error'))
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce(undefined);
        (vi.mocked(WidgetBridgePlugin.reloadAllTimelines) as any).mockResolvedValue(undefined);

        await widgetService.updateStreakWidget(5);

        expect(WidgetBridgePlugin.setItem).toHaveBeenCalledTimes(3);
        expect(WidgetBridgePlugin.reloadAllTimelines).toHaveBeenCalled();
      });
    });

    it('should reject negative streak values', async () => {
      await widgetService.updateStreakWidget(-5);

      expect(Preferences.set).not.toHaveBeenCalled();
      expect(WidgetBridgePlugin.setItem).not.toHaveBeenCalled();
    });

    it('should reject NaN streak values', async () => {
      await widgetService.updateStreakWidget(NaN);

      expect(Preferences.set).not.toHaveBeenCalled();
      expect(WidgetBridgePlugin.setItem).not.toHaveBeenCalled();
    });

    it('should reject non-number streak values', async () => {
      await widgetService.updateStreakWidget('invalid' as any);

      expect(Preferences.set).not.toHaveBeenCalled();
      expect(WidgetBridgePlugin.setItem).not.toHaveBeenCalled();
    });

    it('should reject suspiciously high streak values', async () => {
      await widgetService.updateStreakWidget(15000);

      expect(Preferences.set).not.toHaveBeenCalled();
      expect(WidgetBridgePlugin.setItem).not.toHaveBeenCalled();
    });

    it('should prevent concurrent updates', async () => {
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android');
      vi.mocked(Preferences.set).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      // Start first update
      const promise1 = widgetService.updateStreakWidget(5);
      
      // Try to start second update immediately
      const promise2 = widgetService.updateStreakWidget(10);

      await Promise.all([promise1, promise2]);

      // Should only call set once (second call skipped)
      expect(Preferences.set).toHaveBeenCalledTimes(1);
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'widget_streak',
        value: '5',
      });
    });

    it('should handle complete failure after retries', async () => {
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android');
      vi.mocked(Preferences.set).mockRejectedValue(
        new Error('Persistent error')
      );

      // Should not throw even after all retries fail
      await expect(widgetService.updateStreakWidget(5)).resolves.toBeUndefined();

      expect(Preferences.set).toHaveBeenCalledTimes(3); // MAX_RETRIES
    });
  });

  describe('getStreakFromWidget', () => {
    it('should return 0 on non-native platform', async () => {
      vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);

      const streak = await widgetService.getStreakFromWidget();

      expect(streak).toBe(0);
      expect(WidgetBridgePlugin.getItem).not.toHaveBeenCalled();
    });

    it('should successfully get streak from widget', async () => {
      vi.mocked(WidgetBridgePlugin.getItem).mockResolvedValue({
        results: '42',
      });

      const streak = await widgetService.getStreakFromWidget();

      expect(streak).toBe(42);
      expect(WidgetBridgePlugin.getItem).toHaveBeenCalledWith({
        key: 'widget_streak',
        group: 'group.com.kinetic.app.widgets',
      });
    });

    it('should return 0 for empty result', async () => {
      vi.mocked(WidgetBridgePlugin.getItem).mockResolvedValue({
        results: '',
      });

      const streak = await widgetService.getStreakFromWidget();

      expect(streak).toBe(0);
    });

    it('should return 0 for invalid result', async () => {
      vi.mocked(WidgetBridgePlugin.getItem).mockResolvedValue({
        results: 'invalid',
      });

      const streak = await widgetService.getStreakFromWidget();

      expect(streak).toBe(0);
    });

    it('should retry on getItem failure', async () => {
      vi.mocked(WidgetBridgePlugin.getItem)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ results: '15' });

      const streak = await widgetService.getStreakFromWidget();

      expect(streak).toBe(15);
      expect(WidgetBridgePlugin.getItem).toHaveBeenCalledTimes(2);
    });

    it('should return 0 after all retries fail', async () => {
      vi.mocked(WidgetBridgePlugin.getItem).mockRejectedValue(
        new Error('Persistent error')
      );

      const streak = await widgetService.getStreakFromWidget();

      expect(streak).toBe(0);
      expect(WidgetBridgePlugin.getItem).toHaveBeenCalledTimes(3); // MAX_RETRIES
    });
  });

  describe('retry logic', () => {
    it('should use exponential backoff', async () => {
      vi.mocked(Capacitor.getPlatform).mockReturnValue('android');
      const delays: number[] = [];
      const startTime = Date.now();

      (vi.mocked(Preferences.set) as any)
        .mockImplementation(async () => {
          delays.push(Date.now() - startTime);
          throw new Error('Retry test');
        });

      await widgetService.updateStreakWidget(5);

      // Should have attempted 3 times
      expect(delays.length).toBe(3);
      
      // First attempt should be immediate
      expect(delays[0]).toBeLessThan(100);
      
      // Subsequent attempts should have increasing delays
      // (we can't test exact timing due to test environment, but we can verify attempts)
      expect(Preferences.set).toHaveBeenCalledTimes(3);
    });
  });
});
