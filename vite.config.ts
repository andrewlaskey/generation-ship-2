import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const deployTarget = process.env.DEPLOY_TARGET || 'github';

const getBasePath = () => {
  switch (deployTarget) {
    case 'itch':
      return ''; // Root path for itch.io, no forward slash
    case 'github':
    default:
      return '/generation-ship-2/'; // Subfolder for GitHub Pages
  }
};

export default defineConfig({
  base: getBasePath(),
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]_[local]_[hash:base64:5]',
    },
  },
});
