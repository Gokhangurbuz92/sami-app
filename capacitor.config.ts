import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gokhangurbuz.samiapp',
  appName: 'SAMI App',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;
