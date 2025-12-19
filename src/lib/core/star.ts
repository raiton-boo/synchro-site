import * as THREE from 'three';
import { PARTICLE_CONFIG, getParticleCount } from '@utils/constants';
import type { StarState } from '@customTypes/index';

/**
 * 星クラス
 * 粒子の集合体として星を表現
 */
export class Star {
  private particles: THREE.Points;
  private particleGeometry: THREE.BufferGeometry;
  private particleMaterial: THREE.PointsMaterial;
  private particleCount: number;

  public state: StarState = 'normal';
  public group: THREE.Group; // 回転・移動用のグループ

  /**
   * @param color - 星の色（16進数）
   * @param scene - Three.js のシーン
   */
  constructor(private color: number, private scene: THREE.Scene) {
    this.particleCount = getParticleCount();
    this.group = new THREE.Group();

    // 粒子ジオメトリの作成
    this.particleGeometry = new THREE.BufferGeometry();
    this.createParticles();

    // 粒子マテリアルの作成
    this.particleMaterial = this.createMaterial();

    // Points オブジェクトの作成
    this.particles = new THREE.Points(
      this.particleGeometry,
      this.particleMaterial
    );

    this.group.add(this.particles);
    this.scene.add(this.group);
  }

  /**
   * 粒子を球体表面にランダム配置
   */
  private createParticles(): void {
    const positions = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      // 球体表面の座標をランダムに生成（フィボナッチ球）
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = PARTICLE_CONFIG.BASE_RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = PARTICLE_CONFIG.BASE_RADIUS * Math.sin(phi) * Math.sin(theta);
      const z = PARTICLE_CONFIG.BASE_RADIUS * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    this.particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
  }

  /**
   * グラデーション付きマテリアルを作成
   */
  private createMaterial(): THREE.PointsMaterial {
    // Canvas でグラデーションテクスチャを作成
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 64;
    canvas.height = 64;

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    const color = new THREE.Color(this.color);

    // コア部分（中心）: 最も明るい
    gradient.addColorStop(
      0,
      `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 1.0)`
    );

    // 中間部分: 徐々に暗く
    gradient.addColorStop(
      0.4,
      `rgba(${color.r * 200}, ${color.g * 200}, ${color.b * 200}, 0.8)`
    );

    // 外縁部分: 透明
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    return new THREE.PointsMaterial({
      map: texture,
      size: PARTICLE_CONFIG.BASE_SIZE,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending, // 加算ブレンディングで発光効果
      sizeAttenuation: true,
    });
  }

  /**
   * アニメーション更新
   * @param {number} delta - 前フレームからの経過時間
   */
  update(delta: number): void {
    if (this.state === 'normal') {
      // 微細な回転（ノイズによる自然な動き）
      this.group.rotation.y += delta * 0.1;
      this.group.rotation.x += delta * 0.05;
    }
  }

  /**
   * 粒子の位置を取得
   */
  getPosition(): THREE.Vector3 {
    return this.group.position;
  }

  /**
   * 粒子の回転を取得
   */
  getRotation(): THREE.Euler {
    return this.group.rotation;
  }

  /**
   * リソースの解放
   */
  dispose(): void {
    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
    if (this.particleMaterial.map) {
      this.particleMaterial.map.dispose();
    }
    this.scene.remove(this.group);
  }
}
