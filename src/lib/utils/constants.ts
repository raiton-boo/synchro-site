/**
 * 粒子システムの定数
 */
export const PARTICLE_CONFIG = {
  /** デスクトップの粒子数 */
  COUNT_DESKTOP: 14000,
  /** モバイルの粒子数 */
  COUNT_MOBILE: 8000,
  /** 星の基本半径 */
  BASE_RADIUS: 2.0,
  /** 粒子の基本サイズ */
  BASE_SIZE: 0.035,
} as const;

/**
 * ズームの制限
 */
export const ZOOM_CONFIG = {
  /** 最小ズーム */
  MIN: 0.8,
  /** 最大ズーム */
  MAX: 2.2,
  /** ズーム速度 */
  SPEED: 0.1,
} as const;

/**
 * カメラ設定
 */
export const CAMERA_CONFIG = {
  /** 視野角 */
  FOV: 60,
  /** near plane */
  NEAR: 0.1,
  /** far plane */
  FAR: 100,
  /** 初期Z位置 */
  INITIAL_Z: 6,
} as const;

/**
 * 星の色パレット（20色）
 */
export const STAR_COLORS = [
  0x66ccff, // シアン
  0xff6b9d, // ピンク
  0xffd700, // ゴールド
  0x9d4edd, // パープル
  0x06ffa5, // ミントグリーン
  0xff6f3c, // オレンジ
  0x5dfdcb, // ターコイズ
  0xf72585, // マゼンタ
  0x4cc9f0, // スカイブルー
  0xf77f00, // アンバー
  0x7209b7, // ディープパープル
  0x00f5ff, // ネオンブルー
  0xff1b8d, // ホットピンク
  0x39ff14, // ネオングリーン
  0xffaa00, // ビビッドオレンジ
  0x00ffc6, // アクアマリン
  0xc77dff, // ライラック
  0xff006e, // フューシャ
  0x06d6a0, // ティール
  0xffbe0b, // イエロー
] as const;

/**
 * 背景設定
 */
export const BACKGROUND_CONFIG = {
  /** 背景色1 */
  COLOR_1: '#050510',
  /** 背景色2 */
  COLOR_2: '#0a0a15',
  /** 星屑の数 */
  STAR_COUNT: 200,
  /** 星屑のサイズ範囲 */
  STAR_SIZE_MIN: 0.5,
  STAR_SIZE_MAX: 2.0,
} as const;

/**
 * パルスエフェクトの設定
 */
export const PULSE_CONFIG = {
  /** パルス間隔（ミリ秒） */
  INTERVAL: 2000,
  /** 最小不透明度 */
  MIN_OPACITY: 0.6,
  /** 最大不透明度 */
  MAX_OPACITY: 1.0,
  /** パルス速度 */
  SPEED: 0.02,
} as const;

/**
 * タブ同期の設定
 */
export const SYNC_CONFIG = {
  /** 最大タブ数 */
  MAX_TABS: 10,
  /** BroadcastChannel 名 */
  CHANNEL_NAME: 'cosmic-sync',
  /** 同期間隔（ミリ秒） */
  SYNC_INTERVAL: 50,
} as const;

/**
 * デバッグモードの設定
 */
export const DEBUG_CONFIG = {
  /** D キー長押し時間（ミリ秒） */
  KEY_HOLD_DURATION: 3000,
  /** URL パラメータ名 */
  URL_PARAM: 'debug',
  /** パネルの更新間隔（ミリ秒） */
  UPDATE_INTERVAL: 100,
} as const;

/**
 * アニメーション設定（調整可能）
 */
export const ANIMATION_CONFIG = {
  /** 誕生: 爆発時間（秒） */
  BIRTH_EXPLOSION_DURATION: 0.8,
  /** 誕生: 収束時間（秒） */
  BIRTH_CONVERGENCE_DURATION: 2.5,
  /** 誕生: 爆発半径 */
  BIRTH_EXPLOSION_RADIUS: 8.0,
  /** 誕生: 爆発時サイズ */
  BIRTH_EXPLOSION_SIZE: 6.0,

  /** 消滅: 吸い込み時間（秒） */
  DEATH_DURATION: 2.0,
  /** 消滅: 螺旋の回転数 */
  DEATH_SPIRAL_ROTATIONS: 3,
} as const;

/**
 * パフォーマンス設定
 */
export const PERFORMANCE_CONFIG = {
  /** 目標FPS */
  TARGET_FPS: 60,
  /** 最大ピクセル比 */
  MAX_PIXEL_RATIO: 2,
} as const;

/**
 * モバイル判定
 */
export const isMobile = (): boolean => {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

/**
 * 粒子数を取得（デバイスに応じて）
 */
export const getParticleCount = (): number => {
  return isMobile()
    ? PARTICLE_CONFIG.COUNT_MOBILE
    : PARTICLE_CONFIG.COUNT_DESKTOP;
};

/**
 * ランダムな星の色を取得
 */
export const getRandomStarColor = (): number => {
  return STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
};
