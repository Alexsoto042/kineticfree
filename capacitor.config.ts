import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kinetic.app',
  appName: 'Kinetic',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#1e1e1e',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#6366f1',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      // This is the key setting to prevent the webview from overlapping the status bar
      // It will make the webview start below the status bar.
      overlaysWebView: false,
      // You can also set the style of the status bar content (dark or light icons)
      // style: 'DEFAULT', // or 'DARK', 'LIGHT'
      // backgroundColor: '#1e1e1e', // Optional: set a background color for the status bar area
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
