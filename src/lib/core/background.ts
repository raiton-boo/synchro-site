import * as THREE from 'three';
import { BACKGROUND_CONFIG } from '@utils/constants';

/**
 * 宇宙背景クラス
 * 星屑と動的な背景を管理
 */
export class CosmicBackground {
  private scene: THREE.Scene;
  private stars: THREE.Points;
  private starGeometry: THREE.BufferGeometry;
  private starMaterial: THREE.PointsMaterial;

  /**
   * @param {THREE.Scene} scene - Three.jsのシーン
   */
  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 星屑の作成
    this.starGeometry = new THREE.BufferGeometry();
    this.starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    this.stars = new THREE.Points(this.starGeometry, this.starMaterial);
    this.createStarField();

    this.scene.add(this.stars);
  }

  /**
   * 星屑フィールドを生成
   */
  private createStarField(): void {
    const positions = new Float32Array(BACKGROUND_CONFIG.STAR_COUNT * 3);
    const sizes = new Float32Array(BACKGROUND_CONFIG.STAR_COUNT);

    for (let i = 0; i < BACKGROUND_CONFIG.STAR_COUNT; i++) {
      // ランダムな位置（球体内に配置）
      const radius = 50 + Math.random() * 50; // 50 ~ 100 の範囲
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // ランダムなサイズ
      sizes[i] =
        BACKGROUND_CONFIG.STAR_SIZE_MIN +
        Math.random() *
          (BACKGROUND_CONFIG.STAR_SIZE_MAX - BACKGROUND_CONFIG.STAR_SIZE_MIN);
    }

    this.starGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    this.starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  }

  /**
   * アニメーション更新（視差効果）
   * @param {THREE.Camera} camera - カメラオブジェクト
   * @param {number} delta - 前フレームからの経過時間
   */
  update(camera: THREE.Camera, delta: number): void {
    // 視差効果: カメラの動きに合わせて星屑を微妙に回転
    // 星屑はカメラより遠くにあるため、動きが遅い
    this.stars.rotation.y += delta * 0.01;
    this.stars.rotation.x += delta * 0.005;

    // 星の明滅エフェクト（ランダムに輝度を変化）
    const time = Date.now() * 0.001;
    const sizes = this.starGeometry.attributes.size.array as Float32Array;

    for (let i = 0; i < BACKGROUND_CONFIG.STAR_COUNT; i++) {
      // ノイズ関数の代わりに sin 波で明滅
      const baseSize =
        BACKGROUND_CONFIG.STAR_SIZE_MIN +
        Math.random() *
          (BACKGROUND_CONFIG.STAR_SIZE_MAX - BACKGROUND_CONFIG.STAR_SIZE_MIN);
      const flicker = Math.sin(time * (0.5 + Math.random() * 0.5) + i) * 0.3;
      sizes[i] = baseSize * (1 + flicker);
    }

    this.starGeometry.attributes.size.needsUpdate = true;
  }

  /**
   * リソースの解放
   */
  dispose(): void {
    this.starGeometry.dispose();
    this.starMaterial.dispose();
    this.scene.remove(this.stars);
  }
}
