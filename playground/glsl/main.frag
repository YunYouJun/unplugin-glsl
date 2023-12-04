precision highp float;

#include /glsl/chunk0.frag;

out highp vec4 fragColor;

void main (void) {
  fragColor = chunkFn();
}

@import ./import/imported.glsl;
