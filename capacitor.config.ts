import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gokhangurbuz.samiapp',
  appName: 'SAMI App',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*'],
    hostname: 'localhost'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FFFFFF',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#999999',
      splashFullScreen: true,
      splashImmersive: true,
      androidScaleType: 'CENTER_CROP',
      layoutName: 'launch_screen',
      useDialog: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
      smallIcon: "ic_notification",
      iconColor: "#FFFFFF"
    },
    Toast: {
      duration: 'short',
      position: 'bottom'
    },
    Browser: {
      androidToolbarColor: '#FFFFFF',
      toolbarColor: '#FFFFFF',
      showTitle: true,
      closeButtonCaption: 'Fermer',
      closeButtonColor: '#000000'
    },
    SentryCapacitor: {
      dsn: "https://a1f0f2001361095c45e2cc24d5d38fc7@o4509125147361280.ingest.de.sentry.io/4509125158371408",
      tracesSampleRate: 1.0,
      environment: "production",
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      attachStacktrace: true,
      attachScreenshot: true,
      enableNativeCrashHandling: true,
      release: "1.0.0",
      debug: false,
      _experiments: {
        profilesSampleRate: 1.0
      }
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: '#FFFFFF',
    initialFocus: true,
    useLegacyBridge: false
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: true,
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
    preferredContentMode: 'mobile'
  }
};

export default config;
