/**
 * Worley Noise (Cellular/Voronoi Noise)
 * 
 * セル状の模様を生成する
 * ガス惑星の大きな渦（大赤斑のような構造）の表現に使用
 * 
 * @param p - 3次元座標
 * @return ノイズ値（0.0 ~ 1.0）
 */

// 2次元ハッシュ関数
vec2 hash2Worley(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

// 3次元ハッシュ関数（セルの中心をランダムに配置）
vec3 hash3Worley(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453123);
}

/**
 * 基本的な Worley Noise（最近接距離）
 * 
 * 最も近いセル中心までの距離を返す
 * 
 * @param p - 3次元座標
 * @return 最近接距離（0.0 ~ 1.0）
 */
float worley(vec3 p) {
  vec3 id = floor(p);
  vec3 fd = fract(p);
  
  float minDist = 1.0;
  
  // 周囲 3x3x3 = 27 個のセルを調べる
  for(int z = -1; z <= 1; z++) {
    for(int y = -1; y <= 1; y++) {
      for(int x = -1; x <= 1; x++) {
        vec3 coord = vec3(float(x), float(y), float(z));
        vec3 cellId = id + coord;
        vec3 cellCenter = hash3Worley(cellId);
        
        vec3 delta = coord + cellCenter - fd;
        float dist = length(delta);
        
        minDist = min(minDist, dist);
      }
    }
  }
  
  return minDist;
}

/**
 * より複雑な Worley Noise（F2 - F1）
 * 
 * 2番目に近いセルとの距離差を返す
 * セルの境界（エッジ）が強調される
 * 
 * @param p - 3次元座標
 * @return 距離差（0.0 ~ 1.0）
 */
float worleyF2F1(vec3 p) {
  vec3 id = floor(p);
  vec3 fd = fract(p);
  
  float minDist1 = 1.0; // 最近接距離
  float minDist2 = 1.0; // 2番目に近い距離
  
  // 周囲 3x3x3 = 27 個のセルを調べる
  for(int z = -1; z <= 1; z++) {
    for(int y = -1; y <= 1; y++) {
      for(int x = -1; x <= 1; x++) {
        vec3 coord = vec3(float(x), float(y), float(z));
        vec3 cellId = id + coord;
        vec3 cellCenter = hash3Worley(cellId);
        
        vec3 delta = coord + cellCenter - fd;
        float dist = length(delta);
        
        // 距離が短い順に更新
        if(dist < minDist1) {
          minDist2 = minDist1;
          minDist1 = dist;
        } else if(dist < minDist2) {
          minDist2 = dist;
        }
      }
    }
  }
  
  // 距離差を返す（エッジが強調される）
  return minDist2 - minDist1;
}