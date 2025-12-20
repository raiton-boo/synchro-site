/**
 * アプリケーション全体の定数定義
 */

/**
 * 20色のカラーパレット
 */
export const STAR_COLORS = [
  0xff6b9d, // ピンク
  0xc770f0, // 紫
  0x4d9de0, // 青
  0x3bb9d9, // シアン
  0x7bdb8e, // 緑
  0xf9ca24, // 黄色
  0xff793f, // オレンジ
  0xff5757, // 赤
  0xe17cb3, // ローズ
  0xa29bfe, // ラベンダー
  0x74b9ff, // スカイブルー
  0x00d2d3, // ターコイズ
  0x55efc4, // ミント
  0xffeaa7, // クリーム
  0xfdcb6e, // アプリコット
  0xe84393, // マゼンタ
  0xfd79a8, // チェリー
  0x6c5ce7, // インディゴ
  0x00b894, // エメラルド
  0xfab1a0, // コーラル
] as const;

/**
 * ガス惑星の設定
 */
export const GAS_PLANET_CONFIG = {
  /** コアの半径 */
  CORE_RADIUS: 1.0,
  /** 中層の半径 */
  MIDDLE_RADIUS: 2.0,
  /** 外層の半径 */
  OUTER_RADIUS: 3.5,
  /** 最大密度 */
  MAX_DENSITY: 1.0,
  /** 最小密度 */
  MIN_DENSITY: 0.6,
  /** 呼吸の周期（ミリ秒） */
  BREATH_CYCLE: 3000,
  /** Raymarchingのステップ数（デスクトップ） */
  RAYMARCH_STEPS_DESKTOP: 32,
  /** Raymarchingのステップ数（モバイル） */
  RAYMARCH_STEPS_MOBILE: 16,
  /** ノイズのスケール */
  NOISE_SCALE: 2.0,
  /** ノイズの変化速度 */
  NOISE_SPEED: 0.1,
} as const;

/**
 * 背景の設定
 */
export const BACKGROUND_CONFIG = {
  /** 星屑の数 */
  STAR_COUNT: 200,
  /** 星の最小サイズ */
  STAR_SIZE_MIN: 0.5,
  /** 星の最大サイズ */
  STAR_SIZE_MAX: 2.0,
  /** 星の色（カラフル） */
  STAR_COLORS: [
    0xffffff, // 白
    0xffe9c4, // 薄いオレンジ（太陽のような星）
    0xe3f6ff, // 薄い青（若い星）
    0xffd4d4, // 薄いピンク
    0xd4e3ff, // 薄い青紫
    0xfffacd, // 薄い黄色
    0xffc4e1, // 薄いマゼンタ
    0xc4f0ff, // 薄いシアン
    0xe8ffc4, // 薄い黄緑
    0xffd9c4, // 薄いピーチ
  ],
} as const;

/**
 * カメラの設定
 */
export const CAMERA_CONFIG = {
  /** 初期位置 Z */
  INITIAL_POSITION_Z: 6,
  /** FOV（視野角） */
  FOV: 75,
  /** Near クリッピング */
  NEAR: 0.1,
  /** Far クリッピング */
  FAR: 1000,
} as const;

/**
 * インタラクションの設定
 */
export const INTERACTION_CONFIG = {
  /** ドラッグ感度 */
  DRAG_SENSITIVITY: 0.005,
  /** 慣性の減衰率 */
  INERTIA_DAMPING: 0.95,
  /** 最小ズーム */
  MIN_ZOOM: 0.8,
  /** 最大ズーム */
  MAX_ZOOM: 2.2,
  /** ズーム速度 */
  ZOOM_SPEED: 0.001,
  /** 波紋エフェクトの持続時間（ミリ秒） */
  RIPPLE_DURATION: 1000,
  /** 渦巻きエフェクトの閾値（回転速度） */
  VORTEX_THRESHOLD: 0.5,
} as const;

/**
 * 誕生アニメーションの設定
 */
export const BIRTH_ANIMATION_CONFIG = {
  /** 爆発時間（秒） */
  EXPLOSION_DURATION: 1.0,
  /** 収束時間（秒） */
  CONVERGENCE_DURATION: 2.0,
  /** 爆発時の粒子数 */
  EXPLOSION_PARTICLE_COUNT: 500,
  /** 最大拡散距離 */
  EXPLOSION_RADIUS: 8.0,
  /** 粒子の速度 */
  PARTICLE_SPEED_MIN: 3.0,
  PARTICLE_SPEED_MAX: 5.0,
} as const;

/**
 * 消滅アニメーションの設定
 */
export const DEATH_ANIMATION_CONFIG = {
  /** 圧縮時間（秒） */
  COMPRESSION_DURATION: 1.0,
  /** ブラックホール化時間（秒） */
  BLACKHOLE_DURATION: 1.0,
  /** 消失時間（秒） */
  FADE_DURATION: 1.0,
  /** ブラックホールの影響範囲 */
  BLACKHOLE_INFLUENCE_RADIUS: 20.0,
} as const;

/**
 * 接続線の設定
 */
export const CONNECTION_CONFIG = {
  /** 線の太さ */
  LINE_WIDTH: 2.0,
  /** 線のセグメント数 */
  LINE_SEGMENTS: 100,
  /** 線のアニメーション速度 */
  ANIMATION_SPEED: 1.0,
  /** 線のガスへの影響度 */
  GAS_INFLUENCE: 0.2,
  /** 線のトレイル履歴（最大保存点数） */
  TRAIL_MAX_POINTS: 100,
} as const;

/**
 * デバッグモードの設定
 */
export const DEBUG_CONFIG = {
  /** デバッグモードを有効にするか */
  ENABLED: import.meta.env.DEV,
  /** FPS表示 */
  SHOW_FPS: true,
  /** 統計情報表示 */
  SHOW_STATS: true,
} as const;

/**
 * モバイル判定
 */
export const IS_MOBILE = /iPhone|iPad|Android/i.test(navigator.userAgent);
