import { WebPlugin } from '@capacitor/core';
import type { WidgetDataPlugin } from './index';

export class WidgetDataWeb extends WebPlugin implements WidgetDataPlugin {
  async setItem(_options: { key: string; value: string }): Promise<void> {
    // Web implementation does nothing
    console.log('WidgetData.setItem not available on web');
  }

  async getItem(_options: { key: string }): Promise<{ value: string | null }> {
    // Web implementation returns null
    console.log('WidgetData.getItem not available on web');
    return { value: null };
  }

  async isAvailable(): Promise<{ available: boolean }> {
    return { available: false };
  }
}
