/**
 * ガス惑星のフラグメントシェーダー（Raymarching）
 *
 * ボリューメトリックレンダリングでガス惑星を描画
 * - Simplex Noise: 細かい模様（乱流）
 * - Perlin Noise: 大きな流れ（帯状模様）
 * - Worley Noise: 渦巻き（大赤斑風）
 */

// Uniforms（JavaScript から渡される値）
uniform float uTime;              // 経過時間
uniform vec3 uColor;              // 惑星の色
uniform float uDensity;           // ガスの密度（0.6 ~ 1.0）
uniform float uRadius;            // 惑星の半径
uniform vec3 uCameraPosition;     // カメラの位置
uniform int uRaymarchSteps;       // Raymarchingのステップ数
uniform float uNoiseScale;        // ノイズのスケール
uniform float uNoiseSpeed;        // ノイズの変化速度

// Varying（Vertex Shader から受け取る値）
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;

// ノイズ関数をインクルード（別ファイルから読み込む想定）
// 実際の使用時は JavaScript 側で文字列結合する
// #include <simplex>
// #include <perlin>
// #include <worley>

// ここでは関数の宣言のみ（実装は noise/*.glsl にある）
float snoise(vec3 v);
float cnoise(vec3 P);
float worley(vec3 p);

/**
 * ハイブリッドノイズ（木星風の模様）
 *
 * 3種類のノイズを組み合わせて複雑な模様を生成
 *
 * @param p - 3次元座標
 * @return ノイズ値（0.0 ~ 1.0）
 */
float getHybridNoise(vec3 p) {
  // 時間による変化を追加
  vec3 pAnimated = p + vec3(0.0, uTime * uNoiseSpeed * 0.1, 0.0);

  // Simplex Noise（細かい乱流）
  float noise1 = snoise(pAnimated * uNoiseScale * 2.0) * 0.5 + 0.5;

  // Perlin Noise（大きな流れ）
  float noise2 = cnoise(pAnimated * uNoiseScale * 1.0) * 0.5 + 0.5;

  // Worley Noise（渦巻き）
  float noise3 = worley(pAnimated * uNoiseScale * 0.5);

  // 横方向の帯状模様（Y軸方向で変化）
  float bands = sin(p.y * 3.0 + uTime * 0.05) * 0.5 + 0.5;

  // 3種類のノイズをブレンド
  float combined = 
    noise1 * 0.4 +      // 細かい模様
    noise2 * 0.4 +      // 大きな流れ
    noise3 * 0.2;       // 渦

  // 帯状模様と合成
  return mix(combined, bands, 0.3);
}

/**
 * ガスの密度を計算
 *
 * 中心からの距離に応じて密度が変化
 * - コア: 最も濃い
 * - 中層: 模様が現れる
 * - 外層: 薄くフェード
 *
 * @param p - 3次元座標（惑星の中心が原点）
 * @return 密度（0.0 ~ 1.0）
 */
float getDensity(vec3 p) {
  // 中心からの距離
  float dist = length(p);

  // 基本密度（中心が濃く、外側が薄い）
  float coreDensity = exp(-dist * 1.5);

  // ノイズで模様を追加
  float noise = getHybridNoise(p);

  // 呼吸エフェクトを適用
  float breath = uDensity;

  // 最終的な密度
  return coreDensity * (0.5 + noise * 0.5) * breath;
}

/**
 * Raymarching のメイン処理
 *
 * レイを球体内部に飛ばしてガスの密度を積算
 */
void main() {
  // レイの方向を計算
  vec3 rayOrigin = uCameraPosition;
  vec3 rayDir = normalize(vWorldPosition - uCameraPosition);

  // レイと球体の交点を計算
  vec3 sphereCenter = vec3(0.0);
  float sphereRadius = uRadius;

  // 球体との交差判定（二次方程式の解）
  vec3 oc = rayOrigin - sphereCenter;
  float a = dot(rayDir, rayDir);
  float b = 2.0 * dot(oc, rayDir);
  float c = dot(oc, oc) - sphereRadius * sphereRadius;
  float discriminant = b * b - 4.0 * a * c;

  // 交差しない場合は透明
  if (discriminant < 0.0) {
    discard;
  }

  // 交点の距離を計算
  float t1 = (-b - sqrt(discriminant)) / (2.0 * a);
  float t2 = (-b + sqrt(discriminant)) / (2.0 * a);

  // レイの開始点と終了点
  float tStart = max(t1, 0.0);
  float tEnd = t2;

  // Raymarching のステップサイズ
  float stepSize = (tEnd - tStart) / float(uRaymarchSteps);

  // 密度を積算
  float totalDensity = 0.0;
  vec3 accumulatedColor = vec3(0.0);

  for (int i = 0; i < 64; i++) {
    if (i >= uRaymarchSteps) break;

    float t = tStart + float(i) * stepSize;
    vec3 samplePos = rayOrigin + rayDir * t;

    // 惑星の中心を基準にした座標に変換
    vec3 localPos = samplePos - sphereCenter;

    // 密度を取得
    float density = getDensity(localPos);

    // 密度を積算
    totalDensity += density * stepSize;

    // 色を積算（ガスの色）
    accumulatedColor += uColor * density * stepSize;
  }

  // 最終的な色とアルファ値
  vec3 finalColor = accumulatedColor;
  float alpha = clamp(totalDensity, 0.0, 1.0);

  // ガスの発光感を強調
  finalColor += uColor * alpha * 0.3;

  gl_FragColor = vec4(finalColor, alpha);
}