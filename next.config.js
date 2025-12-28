/** @type {import('next').NextConfig} */
const path = require('path');

module.exports = {
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
    };

    return config;
  },
};
