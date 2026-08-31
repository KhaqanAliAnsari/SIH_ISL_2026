import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Unique reverse-domain app ID (used in Play Store listing)
  appId: 'com.sih2026.islvcip',
  appName: 'SignKYC VCIP',

  // Vite build output directory
  webDir: 'dist',

  // Bundle the web assets into the APK (no live-reload server in production)
  server: {
    androidScheme: 'https',
  },

  android: {
    // Minimum Android 10 — required for WebGPU + full WebAssembly SIMD
    minWebViewVersion: 80,
    // Allow cleartext only for localhost dev server access
    allowMixedContent: false,
    // Immersive full-screen (hide status + nav bars)
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#09090b', // zinc-950 — matches app bg
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      // Immersive dark status bar overlaying content
      style: 'Dark',
      backgroundColor: '#09090b',
      overlaysWebView: true,
    },
    Camera: {
      // Permissions will be requested at runtime
    },
  },
};

export default config;
