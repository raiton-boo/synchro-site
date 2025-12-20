import * as THREE from 'three';
import type {
  GasPlanetData,
  GasPlanetState,
  GasPlanetUniforms,
} from '@customTypes/index';
import { GAS_PLANET_CONFIG, IS_MOBILE } from '@utils/constants';

// Shader ファイルをインポート
import simplexNoise from '@shaders/noise/simplex.glsl';
import perlinNoise from '@shaders/noise/perlin.glsl';
import worleyNoise from '@shaders/noise/worley.glsl';
import vertexShader from '@shaders/gasPlanet/vertex.glsl';
import fragmentShader from '@shaders/gasPlanet/fragment.glsl';

/**
 * ガス惑星クラス
 *
 * Raymarching Shader を使用してボリューメトリックなガス惑星を描画
 */
export class GasPlanet {
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private uniforms: GasPlanetUniforms;
  private data: GasPlanetData;
  private state: GasPlanetState = 'idle';

  // 呼吸エフェクト用
  private breathStartTime: number = Date.now();

  // アニメーション用
  private animationStartTime: number = 0;
  private birthParticles?: THREE.Points;
  private particleVelocities: THREE.Vector3[] = [];

  constructor(data: GasPlanetData, scene: THREE.Scene) {
    this.data = data;

    // Shader Uniforms の初期化
    this.uniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(data.color) },
      uDensity: { value: GAS_PLANET_CONFIG.MAX_DENSITY },
      uRadius: { value: GAS_PLANET_CONFIG.OUTER_RADIUS },
      uCameraPosition: { value: new THREE.Vector3(0, 0, 6) },
      uRaymarchSteps: {
        value: IS_MOBILE
          ? GAS_PLANET_CONFIG.RAYMARCH_STEPS_MOBILE
          : GAS_PLANET_CONFIG.RAYMARCH_STEPS_DESKTOP,
      },
      uNoiseScale: { value: GAS_PLANET_CONFIG.NOISE_SCALE },
      uNoiseSpeed: { value: GAS_PLANET_CONFIG.NOISE_SPEED },
    };

    // ノイズ関数を結合した Fragment Shader
    const fullFragmentShader = `
      ${simplexNoise}
      ${perlinNoise}
      ${worleyNoise}
      ${fragmentShader}
    `;

    // ShaderMaterial の作成
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader: fullFragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    // 球体ジオメトリ（高解像度）
    const geometry = new THREE.SphereGeometry(
      GAS_PLANET_CONFIG.OUTER_RADIUS,
      64,
      64
    );

    // メッシュの作成
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(data.position.x, data.position.y, data.position.z);

    scene.add(this.mesh);

    // 誕生アニメーション開始
    if (data.state === 'birth') {
      this.startBirthAnimation(scene);
    }
  }

  /**
   * 誕生アニメーションを開始
   */
  private startBirthAnimation(scene: THREE.Scene): void {
    this.state = 'birth';
    this.animationStartTime = Date.now();

    // 爆発粒子を作成
    this.createExplosionParticles(scene);

    // 初期状態（非表示）
    this.uniforms.uDensity.value = 0;
    this.uniforms.uRadius.value = 0.1;
  }

  /**
   * 爆発粒子を作成
   */
  private createExplosionParticles(scene: THREE.Scene): void {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const color = new THREE.Color(this.data.color);

    for (let i = 0; i < count; i++) {
      // 中心に配置
      positions[i * 3] = this.data.position.x;
      positions[i * 3 + 1] = this.data.position.y;
      positions[i * 3 + 2] = this.data.position.z;

      // ランダムな速度ベクトル（放射状）
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 3.0 + Math.random() * 2.0;

      const vel = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      );

      this.particleVelocities.push(vel);

      // 色
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.birthParticles = new THREE.Points(geometry, material);
    scene.add(this.birthParticles);
  }

  /**
   * フレーム更新
   */
  update(deltaTime: number, camera: THREE.Camera): void {
    // 時間を更新
    this.uniforms.uTime.value += deltaTime;

    // カメラ位置を更新
    this.uniforms.uCameraPosition.value.copy(camera.position);

    // 状態に応じた処理
    switch (this.state) {
      case 'birth':
        this.updateBirthAnimation(deltaTime);
        break;
      case 'idle':
        this.updateBreathEffect();
        break;
      case 'death':
        this.updateDeathAnimation(deltaTime);
        break;
    }
  }

  /**
   * 誕生アニメーションの更新
   */
  private updateBirthAnimation(deltaTime: number): void {
    const elapsed = (Date.now() - this.animationStartTime) / 1000;
    const totalDuration = 3.0; // 3秒

    if (elapsed >= totalDuration) {
      // アニメーション完了
      this.state = 'idle';
      this.breathStartTime = Date.now();

      // 粒子を削除
      if (this.birthParticles) {
        this.birthParticles.parent?.remove(this.birthParticles);
        this.birthParticles.geometry.dispose();
        (this.birthParticles.material as THREE.Material).dispose();
        this.birthParticles = undefined;
      }

      return;
    }

    const progress = elapsed / totalDuration;

    if (progress < 0.33) {
      // フェーズ2: 爆発的拡散（0.0 ~ 1.0秒）
      const t = progress / 0.33;

      // 粒子を動かす
      if (this.birthParticles) {
        const positions = this.birthParticles.geometry.attributes.position
          .array as Float32Array;

        for (let i = 0; i < 500; i++) {
          positions[i * 3] += this.particleVelocities[i].x * deltaTime;
          positions[i * 3 + 1] += this.particleVelocities[i].y * deltaTime;
          positions[i * 3 + 2] += this.particleVelocities[i].z * deltaTime;

          // 減速
          this.particleVelocities[i].multiplyScalar(0.98);
        }

        this.birthParticles.geometry.attributes.position.needsUpdate = true;
      }

      // ガスも拡散
      this.uniforms.uDensity.value = 0.2 * t;
      this.uniforms.uRadius.value = 8.0 * t;
    } else {
      // フェーズ3: 収束（1.0 ~ 3.0秒）
      const t = (progress - 0.33) / 0.67;

      // 粒子をガスに吸い込む
      if (this.birthParticles) {
        const positions = this.birthParticles.geometry.attributes.position
          .array as Float32Array;

        for (let i = 0; i < 500; i++) {
          const dx = this.data.position.x - positions[i * 3];
          const dy = this.data.position.y - positions[i * 3 + 1];
          const dz = this.data.position.z - positions[i * 3 + 2];

          positions[i * 3] += dx * 0.05;
          positions[i * 3 + 1] += dy * 0.05;
          positions[i * 3 + 2] += dz * 0.05;
        }

        this.birthParticles.geometry.attributes.position.needsUpdate = true;

        // 粒子を透明に
        (this.birthParticles.material as THREE.PointsMaterial).opacity =
          1.0 - t;
      }

      // ガス収束
      this.uniforms.uDensity.value = 0.2 + 0.6 * t;
      this.uniforms.uRadius.value = 8.0 - 4.5 * t;
    }
  }

  /**
   * 呼吸エフェクトの更新
   */
  private updateBreathEffect(): void {
    const elapsed = Date.now() - this.breathStartTime;
    const cycle = GAS_PLANET_CONFIG.BREATH_CYCLE;
    const t = (elapsed % cycle) / cycle;

    // サイン波で密度を変化
    const density =
      GAS_PLANET_CONFIG.MIN_DENSITY +
      (GAS_PLANET_CONFIG.MAX_DENSITY - GAS_PLANET_CONFIG.MIN_DENSITY) *
        (Math.sin(t * Math.PI * 2) * 0.5 + 0.5);

    this.uniforms.uDensity.value = density;
  }

  /**
   * 消滅アニメーションの更新
   */
  private updateDeathAnimation(deltaTime: number): void {
    // TODO: Phase 4 で実装
  }

  /**
   * 消滅アニメーションを開始
   */
  startDeathAnimation(): void {
    this.state = 'death';
    this.animationStartTime = Date.now();
  }

  /**
   * メッシュを取得
   */
  getMesh(): THREE.Mesh {
    return this.mesh;
  }

  /**
   * データを取得
   */
  getData(): GasPlanetData {
    return this.data;
  }

  /**
   * 状態を取得
   */
  getState(): GasPlanetState {
    return this.state;
  }

  /**
   * リソースを解放
   */
  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();

    if (this.birthParticles) {
      this.birthParticles.geometry.dispose();
      (this.birthParticles.material as THREE.Material).dispose();
    }
  }
}
