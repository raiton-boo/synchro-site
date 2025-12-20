// @ts-check
import { defineConfig } from 'astro/config';

/**
 * GLSL ファイルを文字列として読み込むカスタムプラグイン
 * @returns {import('vite').Plugin}
 */
function glslLoader() {
  return {
    name: 'glsl-loader',
    /**
     * @param {string} code - ファイルの内容
     * @param {string} id - ファイルのパス
     */
    transform(code, id) {
      // .glsl ファイルを検知
      if (id.endsWith('.glsl')) {
        // GLSL ファイルを文字列としてエクスポート
        return {
          code: `export default ${JSON.stringify(code)}`,
          map: null,
        };
      }
      // それ以外はそのまま返す
      return null;
    },
  };
}

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
    // @ts-ignore - Vite バージョンの不一致による型エラーを無視
    plugins: [glslLoader()],
  },
});
