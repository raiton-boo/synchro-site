import * as THREE from 'three';
import { PARTICLE_CONFIG, getParticleCount } from '@utils/constants';

/**
 * 高効率・高解像度 Star クラス
 * パフォーマンス向上のため、回転計算を完全にGPUへ移譲
 */
export class Star {
  public group: THREE.Group;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private points: THREE.Points;

  constructor(private color: number, private scene: THREE.Scene) {
    this.group = new THREE.Group();
    const count = getParticleCount();
    const RADIUS = 2.5;
    const ratio = (RADIUS / PARTICLE_CONFIG.BASE_RADIUS) * 1.2;

    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const aRandom = new Float32Array(count);
    const aSpeed = new Float32Array(count);

    // CPU負荷軽減: 計算済みの値を再利用
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const rand = Math.random();
      // 外殻密度のロジックを維持しつつ計算を整理
      const r =
        rand < 0.2
          ? RADIUS * Math.random() * 0.8
          : RADIUS * (0.8 + Math.pow(Math.random(), 2.0) * 0.3);

      const sinPhi = Math.sin(phi);
      positions[i3] = r * sinPhi * Math.cos(theta);
      positions[i3 + 1] = r * sinPhi * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      aRandom[i] = Math.random() * 100.0;
      aSpeed[i] = 0.5 + Math.random() * 1.0;
    }

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute(
      'aRandom',
      new THREE.BufferAttribute(aRandom, 1)
    );
    this.geometry.setAttribute('aSpeed', new THREE.BufferAttribute(aSpeed, 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(this.color) },
        uBaseSize: {
          value: PARTICLE_CONFIG.BASE_SIZE * Math.sqrt(ratio) * 1.2,
        },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uBaseSize;
        uniform float uPixelRatio;
        attribute float aRandom;
        attribute float aSpeed;
        varying float vAlpha;
        varying float vCoreInfluence;

        mat3 rotationMatrix(vec3 axis, float angle) {
            float s = sin(angle); float c = cos(angle); float oc = 1.0 - c;
            return mat3(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s,
                        oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s,
                        oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c);
        }

        void main() {
          vec3 pos = position;
          float dist = length(pos);
          vCoreInfluence = smoothstep(0.4, 0.0, dist);

          // 1. 個別のうねり
          float t = uTime * 0.3 * aSpeed;
          pos.x += sin(t + aRandom) * 0.08;
          pos.y += cos(t * 0.8 + aRandom) * 0.08;
          pos.z += sin(t * 1.2 + aRandom) * 0.08;

          // 2. GPU自転
          pos = rotationMatrix(vec3(0, 1, 0), uTime * 0.04) * pos;
          pos = rotationMatrix(vec3(1, 0, 0), uTime * 0.02) * pos;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // --- 呼吸エフェクト（Radial Breathing） ---
          // 中心から外へ向かう波を作る
          // dist * 1.5: 波の密度（数値を上げると波紋が細かくなる）
          // uTime * 2.0: 呼吸の速さ
          float wave = sin(dist * 1.5 - uTime * 2.0);

          // 波を 0.0 ~ 1.0 の範囲に正規化し、外側ほど少し弱める
          float breathe = (wave * 0.5 + 0.5) * (1.0 - dist * 0.1);

          // 元々の個別明滅(aRandom)と呼吸(breathe)をミックス
          // 0.7: 呼吸の影響度（ここを上げると「波」がはっきりする）
          vAlpha = mix(0.5, 1.0, breathe) * (0.7 + 0.3 * sin(uTime + aRandom));

          gl_PointSize = uBaseSize * uPixelRatio * (850.0 / -mvPosition.z) * (1.0 + vCoreInfluence * 0.5);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;
        varying float vCoreInfluence;

        void main() {
          // 早期 discard で GPU 負荷軽減
          vec2 uv = gl_PointCoord - vec2(0.5);
          float d2 = dot(uv, uv); // length(uv) より高速
          if (d2 > 0.25) discard; 

          float d = sqrt(d2) * 2.0; // 0.0 to 1.0
          float strength = pow(1.0 - d, 4.5 - vCoreInfluence * 1.5);

          vec3 coreColor = mix(uColor, vec3(1.5), vCoreInfluence);
          gl_FragColor = vec4(coreColor, strength * vAlpha * (1.1 + vCoreInfluence * 0.4));
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.group.add(this.points);
    this.scene.add(this.group);
  }

  update(delta: number): void {
    // CPU は時間の更新だけを行う（非常に軽量）
    this.material.uniforms.uTime.value += delta;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.scene.remove(this.group);
  }
}
