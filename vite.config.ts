import { defineConfig } from 'vite';

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
});
