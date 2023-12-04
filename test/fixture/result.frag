precision highp float;

highp float chunkRed () {
  return 0.0;
}

highp float chunkGreen () {
  return 0.8;
}

highp vec3 chunkRGB () {
  return vec3(chunkRed(), chunkGreen(), 0.0);
}

highp vec4 chunkFn () {
  return vec4(chunkRGB(), 1.0);
}

out highp vec4 fragColor;

void main (void) {
  fragColor = chunkFn();
}
