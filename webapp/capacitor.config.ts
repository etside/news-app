import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.etside.openclaude',
  appName: 'OpenClaude Web',
  webDir: 'www',
  server: {
    url: 'https://devlover.torquesticker.com',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
