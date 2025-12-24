/// <reference types="vite/client" />

/**
 * GLSL ファイルの型定義
 */
declare module '*.glsl' {
  const content: string;
  export default content;
}
