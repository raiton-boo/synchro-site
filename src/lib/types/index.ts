import type * as THREE from 'three';

/**
 * ガス惑星の状態
 */
export type GasPlanetState = 'idle' | 'birth' | 'death' | 'blackhole';

/**
 * ガス惑星のデータ
 */
export interface GasPlanetData {
  /** 星のID（タブID） */
  id: string;
  /** 色（16進数） */
  color: number;
  /** 作成日時 */
  createdAt: number;
  /** 位置 */
  position: { x: number; y: number; z: number };
  /** 現在の状態 */
  state: GasPlanetState;
}

/**
 * ガス惑星の Shader Uniforms
 */
export interface GasPlanetUniforms {
  uTime: { value: number };
  uColor: { value: THREE.Color };
  uDensity: { value: number };
  uRadius: { value: number };
  uCameraPosition: { value: THREE.Vector3 };
  uRaymarchSteps: { value: number };
  uNoiseScale: { value: number };
  uNoiseSpeed: { value: number };
}

/**
 * 接続線のデータ
 */
export interface ConnectionData {
  /** 始点の星ID */
  fromId: string;
  /** 終点の星ID */
  toId: string;
  /** 作成日時 */
  createdAt: number;
}

/**
 * インタラクションの状態
 */
export interface InteractionState {
  /** ドラッグ中か */
  isDragging: boolean;
  /** 前回のマウス位置 */
  previousMouse: { x: number; y: number };
  /** 回転速度 */
  rotationVelocity: { x: number; y: number };
  /** 現在のズーム */
  currentZoom: number;
  /** 波紋エフェクトが有効か */
  rippleActive: boolean;
  /** 波紋の中心位置 */
  rippleOrigin?: THREE.Vector3;
  /** 波紋の開始時刻 */
  rippleStartTime?: number;
  /** ホバー中か（PC） */
  isHovering: boolean;
  /** ホバー位置 */
  hoverPosition?: THREE.Vector3;
}

/**
 * デバッグ情報
 */
export interface DebugInfo {
  /** FPS */
  fps: number;
  /** 描画呼び出し回数 */
  drawCalls: number;
  /** 三角形の数 */
  triangles: number;
  /** 現在のタブ数 */
  tabCount: number;
  /** 現在のズーム */
  zoom: number;
  /** 回転速度 */
  rotationSpeed: number;

  // ガス惑星用
  /** 現在の密度 */
  gasDensity: number;
  /** 現在の半径 */
  gasRadius: number;
  /** Raymarchingのステップ数 */
  raymarchSteps: number;
  /** ノイズのタイプ */
  noiseType: string;

  // 接続線用
  /** アクティブな線の数 */
  activeLines: number;
  /** 線のガスへの影響度（平均） */
  lineInfluence: number;

  // インタラクション用
  /** ホバーエフェクトが有効か（PC） */
  hoverActive: boolean;
  /** 波紋エフェクトが有効か */
  rippleActive: boolean;
  /** 渦巻きエフェクトが有効か */
  vortexActive: boolean;

  // パフォーマンス用
  /** Shaderのコンパイル時間（ms） */
  shaderCompileTime: number;
  /** テクスチャのメモリ使用量（MB） */
  textureMemory: number;
}

/**
 * BroadcastChannel メッセージの型
 */
export type SyncMessage =
  | { type: 'star-created'; data: GasPlanetData }
  | { type: 'star-updated'; data: GasPlanetData }
  | { type: 'star-destroyed'; data: { id: string } }
  | { type: 'request-state' }
  | { type: 'state-response'; data: GasPlanetData[] };
