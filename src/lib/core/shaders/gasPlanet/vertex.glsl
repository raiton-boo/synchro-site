/**
 * ガス惑星の頂点シェーダー
 *
 * 球体の各頂点を処理し、Raymarching に必要な情報を Fragment Shader に渡す
 */

// Varying（Fragment Shader に渡す変数）
varying vec3 vWorldPosition;  // ワールド座標
varying vec3 vNormal;          // 法線ベクトル
varying vec2 vUv;              // UV座標

void main() {
  // UV座標を渡す
  vUv = uv;

  // 法線をワールド座標系に変換
  vNormal = normalize(normalMatrix * normal);

  // ワールド座標を計算
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;

  // 最終的な頂点位置
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}