/// <reference types="vite/client" />

/**
 * GLSL ファイルの型定義
 *
 * Vite で GLSL ファイルを文字列としてインポートできるようにする
 * 使用例: import shader from '@shaders/gasPlanet/vertex.glsl?raw';
 */
declare module '*.glsl' {
  const content: string;
  export default content;
}
