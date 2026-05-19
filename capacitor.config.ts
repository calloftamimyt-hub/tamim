import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.muslimsathi.app',
  appName: 'Halal Circle',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'muslim-sathi-1.onrender.com',
      'api.telegram.org',
      'ais-dev-xpt625mejzdy6pkn63egic-61738440703.asia-east1.run.app',
      'ais-pre-xpt625mejzdy6pkn63egic-61738440703.asia-east1.run.app',
      'muslim-sathi-video.onrender.com',
      '*.run.app'
    ]
  },
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-4288324218526190~7221934995',
    },
    CapacitorHttp: {
      enabled: false,
    }
  }
};

export default config;
