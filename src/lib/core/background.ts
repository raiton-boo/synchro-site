import * as THREE from 'three';
import { BACKGROUND_CONFIG } from '@utils/constants';

export class CosmicBackground {
  private scene: THREE.Scene;
  private starField: THREE.Points;
  private starGeometry: THREE.BufferGeometry;
  private starMaterial: THREE.ShaderMaterial;
  private backgroundMesh: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // --- 1. 深淵のグラデーション（背景の底） ---
    const bgGeo = new THREE.SphereGeometry(90, 32, 32);
    const bgMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor1: { value: new THREE.Color(0x020205) }, // より深い黒
        uColor2: { value: new THREE.Color(0x08081a) }, // わずかに青み
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec3 vNormal;
        void main() {
          // 法線の高さ（Y軸）に基づいて滑らかな宇宙の広がりを作る
          float factor = vNormal.y * 0.5 + 0.5;
          gl_FragColor = vec4(mix(uColor1, uColor2, factor), 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.backgroundMesh = new THREE.Mesh(bgGeo, bgMat);
    this.backgroundMesh.renderOrder = -10;
    this.scene.add(this.backgroundMesh);

    // --- 2. 刷新された星屑システム ---
    const count = 400; // 少し数を増やして密度を出す
    this.starGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(count * 3);
    const aRandoms = new Float32Array(count); // 個別のアニメーション用
    const aColors = new Float32Array(count * 3); // 個別の色

    for (let i = 0; i < count; i++) {
      // 球状に配置しつつ、少し歪ませる
      const r = 50 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      aRandoms[i] = Math.random();

      // 星にわずかな個別の色を与える（青白、暖色、白）
      const colorRand = Math.random();
      if (colorRand > 0.8) {
        aColors[i * 3] = 0.8;
        aColors[i * 3 + 1] = 0.9;
        aColors[i * 3 + 2] = 1.0; // 青白い
      } else if (colorRand > 0.6) {
        aColors[i * 3] = 1.0;
        aColors[i * 3 + 1] = 0.95;
        aColors[i * 3 + 2] = 0.8; // 暖かい
      } else {
        aColors[i * 3] = 1.0;
        aColors[i * 3 + 1] = 1.0;
        aColors[i * 3 + 2] = 1.0; // 純白
      }
    }

    this.starGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    this.starGeometry.setAttribute(
      'aRandom',
      new THREE.BufferAttribute(aRandoms, 1)
    );
    this.starGeometry.setAttribute(
      'aColor',
      new THREE.BufferAttribute(aColors, 3)
    );

    this.starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        attribute float aRandom;
        attribute vec3 aColor;
        varying float vAlpha;
        varying vec3 vColor;

        void main() {
          vColor = aColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // --- 動的な明滅（またたき）のロジック ---
          // sinの周期をaRandomでずらし、星によってリズムを変える
          float time = uTime * (0.5 + aRandom * 0.5);
          float blink = pow(0.5 + 0.5 * sin(time + aRandom * 10.0), 3.0);
          
          // 強烈に光る瞬間を作るための係数
          vAlpha = blink;

          // サイズ調整（遠くの星ほど小さく、しかし最小サイズを保証）
          gl_Position = projectionMatrix * mvPosition;
          float baseSize = 4.0 + aRandom * 8.0; // 4px ~ 12px
          gl_PointSize = baseSize * uPixelRatio * (300.0 / -mvPosition.z) * blink;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float d = length(uv);
          if(d > 0.5) discard;

          // 星の描画ロジック：中心に鋭い光、周りに柔らかなハロー
          // 中心コア
          float core = smoothstep(0.15, 0.0, d);
          // 柔らかなボケ
          float glow = exp(-d * 10.0);
          
          float finalStrength = core * 1.5 + glow * 0.8;
          gl_FragColor = vec4(vColor, finalStrength * vAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.starField = new THREE.Points(this.starGeometry, this.starMaterial);
    this.starField.renderOrder = -5;
    this.scene.add(this.starField);
  }

  update(camera: THREE.Camera, delta: number): void {
    this.starMaterial.uniforms.uTime.value += delta;

    // カメラの向きと逆方向に極めてわずかに動かすことで、視差効果（Parallax）を生む
    // これにより宇宙の広大さが強調される
    this.starField.rotation.y += delta * 0.005;
    this.starField.rotation.z += delta * 0.002;
  }

  dispose(): void {
    this.starGeometry.dispose();
    this.starMaterial.dispose();
    this.backgroundMesh.geometry.dispose();
    (this.backgroundMesh.material as THREE.Material).dispose();
    this.scene.remove(this.starField);
    this.scene.remove(this.backgroundMesh);
  }
}
