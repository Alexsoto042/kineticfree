import { registerPlugin } from '@capacitor/core';

export interface WidgetDataPlugin {
  /**
   * Set a value in the widget's data store
   */
  setItem(options: { key: string; value: string }): Promise<void>;

  /**
   * Get a value from the widget's data store
   */
  getItem(options: { key: string }): Promise<{ value: string | null }>;

  /**
   * Check if the plugin is available
   */
  isAvailable(): Promise<{ available: boolean }>;
}

const WidgetData = registerPlugin<WidgetDataPlugin>('WidgetData', {
  web: () => import('./web').then(m => new m.WidgetDataWeb()),
});

export default WidgetData;
