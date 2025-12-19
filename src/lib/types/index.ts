import type * as THREE from 'three';

/**
 * 星の状態を表す型
 */
export type StarState = 'birth' | 'normal' | 'death' | 'blackhole';

/**
 * タブの役割
 */
export type TabRole = 'host' | 'client';

/**
 * 星の基本情報
 */
export interface StarData {
  /** タブID */
  id: string;
  /** 星の色 */
  color: number;
  /** 位置 */
  position: {
    x: number;
    y: number;
    z: number;
  };
  /** 回転 */
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  /** ズーム倍率 */
  zoom: number;
  /** 現在の状態 */
  state: StarState;
  /** 作成日時 */
  createdAt: number;
}

/**
 * BroadcastChannel で送信するメッセージの型
 */
export interface SyncMessage {
  /** メッセージタイプ */
  type: 'update' | 'join' | 'leave' | 'request_close';
  /** 送信元タブID */
  tabId: string;
  /** ペイロード */
  data: StarData;
  /** タイムスタンプ */
  timestamp: number;
}

/**
 * デバッグ情報の型
 */
export interface DebugInfo {
  /** FPS */
  fps: number;
  /** タブの役割 */
  role: TabRole;
  /** アクティブなタブ数 */
  tabCount: number;
  /** タブID */
  tabId: string;
  /** 星の位置 */
  starPosition: THREE.Vector3;
  /** 星の回転 */
  starRotation: THREE.Euler;
  /** 音声再生回数 */
  audioPlayCount: number;
  /** メモリ使用量（MB） */
  memoryUsage: number;
  /** WebGL情報 */
  webglInfo: {
    vendor: string;
    renderer: string;
  };
  /** BroadcastChannel メッセージログ（最新10件） */
  broadcastMessages: string[];
  /** 粒子数 */
  particleCount: number;
  /** レンダリング時間（ms） */
  renderTime: number;
  /** アニメーション進捗 */
  animationProgress?: number;
  /** 現在の色情報 */
  colorInfo: string;
}

/**
 * インタラクションイベントの型
 */
export interface InteractionEvent {
  /** イベントタイプ */
  type: 'tap' | 'rotate' | 'zoom' | 'doubletap' | 'pinch';
  /** イベント発生時刻 */
  timestamp: number;
  /** 追加データ */
  data?: {
    /** ドラッグ距離 */
    delta?: { x: number; y: number };
    /** ズーム倍率 */
    zoomDelta?: number;
  };
}

/**
 * 線の接続情報
 */
export interface LineConnection {
  /** 始点のタブID */
  fromTabId: string;
  /** 終点のタブID */
  toTabId: string;
  /** 始点の色 */
  fromColor: number;
  /** 終点の色 */
  toColor: number;
  /** Three.js の Line オブジェクト */
  line: THREE.Line;
}

/**
 * パルスエフェクトの状態
 */
export interface PulseState {
  /** 現在の不透明度 */
  opacity: number;
  /** 増加中かどうか */
  increasing: boolean;
  /** 最終更新時刻 */
  lastUpdate: number;
}

/**
 * ウィンドウモーションの状態（PC用）
 */
export interface WindowMotionState {
  /** 前回のスクリーン座標 */
  lastScreenX: number;
  lastScreenY: number;
  /** 速度 */
  velocity: {
    x: number;
    y: number;
  };
}

/**
 * デバイスモーションの状態（スマホ用）
 */
export interface DeviceMotionState {
  /** 加速度 */
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  /** 最終更新時刻 */
  lastUpdate: number;
}

/**
 * ストレージに保存する設定の型
 */
export interface StorageConfig {
  /** タブID */
  tabId: string;
  /** 星の色 */
  starColor: number;
  /** マスタータブID */
  masterTabId?: string;
  /** デバッグモード */
  debugMode: boolean;
}

/**
 * カスタムエラー型
 */
export class CosmicError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CosmicError';
  }
}
