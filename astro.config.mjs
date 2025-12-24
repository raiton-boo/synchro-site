// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://raiton-boo.github.io',
  base: '/synchro-site', //リポジトリ名
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@lib': '/src/lib',
        '@core': '/src/lib/core',
        '@sync': '/src/lib/sync',
        '@interaction': '/src/lib/interaction',
        '@audio': '/src/lib/audio',
        '@debug': '/src/lib/debug',
        '@utils': '/src/lib/utils',
        '@customTypes': '/src/lib/types',
        '@shaders': '/src/lib/core/shaders',
      },
    },
  },
});
