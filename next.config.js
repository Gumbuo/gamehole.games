/** @type {import('next').NextConfig} */
const path = require('path');

module.exports = {
  // Foxstead's Godot 4 web export uses threads (SharedArrayBuffer), which
  // only works behind a cross-origin-isolated document — scoped to just
  // this game's static files so it can't affect anything else under
  // /games/ that isn't expecting COEP's strict same-origin resource rule.
  async headers() {
    return [
      {
        source: "/games/foxstead/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Handle optional Wagmi connector dependencies by aliasing to empty module
    const emptyModule = path.resolve(__dirname, 'app/lib/empty-module.js');

    config.resolve.alias = {
      ...config.resolve.alias,
      '@base-org/account': emptyModule,
      '@gemini-wallet/core': emptyModule,
      'porto/internal': emptyModule,
      'porto': emptyModule,
      '@safe-global/safe-apps-sdk': emptyModule,
      '@safe-global/safe-apps-provider': emptyModule,
      // MetaMask SDK dependencies
      '@react-native-async-storage/async-storage': emptyModule,
      'supports-color': emptyModule,
      'encoding': emptyModule,
    };

    return config;
  },
};
