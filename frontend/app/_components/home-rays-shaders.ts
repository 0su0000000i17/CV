export const VERTEX_SHADER = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

export const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uMouse;
  uniform vec3 uDeepBlue;
  uniform vec3 uElectricBlue;

  float hash(float value) { return fract(sin(value * 127.1) * 43758.5453123); }
  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);
    float a = hash(cell.x + cell.y * 57.0);
    float b = hash(cell.x + 1.0 + cell.y * 57.0);
    float c = hash(cell.x + (cell.y + 1.0) * 57.0);
    float d = hash(cell.x + 1.0 + (cell.y + 1.0) * 57.0);
    return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
  }
  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.55;
    for (int octave = 0; octave < 4; octave++) {
      value += amplitude * noise(point);
      point = point * 2.03 + vec2(17.7, 9.2);
      amplitude *= 0.48;
    }
    return value;
  }
  void main() {
    float distanceFromTop = 1.0 - vUv.y;
    float originX = 0.5 + (uMouse.x - 0.5) * 0.02;
    float horizontal = (vUv.x - originX) * uAspect;
    float vertical = distanceFromTop + 0.045;
    float radius = length(vec2(horizontal, vertical));
    float angle = atan(horizontal, vertical);
    angle -= (uMouse.x - 0.5) * 0.012 *
      (1.0 - smoothstep(0.08, 0.95, distanceFromTop));
    float slowNoise = fbm(vec2(angle * 2.8 + uTime * 0.055,
      distanceFromTop * 1.35 - uTime * 0.045));
    float flowingNoise = fbm(vec2(angle * 7.0 - uTime * 0.09,
      distanceFromTop * 2.25 + uTime * 0.065));
    float turbulence = (slowNoise - 0.5) * 0.22;
    float light = 0.0;
    float colorShift = 0.0;
    for (int index = 0; index < 12; index++) {
      float rayIndex = float(index);
      float seed = hash(rayIndex + 3.7);
      float seedTwo = hash(rayIndex * 2.31 + 9.4);
      float baseAngle = mix(-0.86, 0.86, (rayIndex + 0.5) / 12.0);
      float sway = sin(uTime * (0.18 + seed * 0.18) + seedTwo * 9.0) *
        (0.045 + seed * 0.055);
      float rayCenter = baseAngle + sway + turbulence * (0.55 + seedTwo * 0.7) +
        sin(distanceFromTop * (2.0 + seed * 3.0) - uTime * 0.16 + seed * 8.0) * 0.025;
      float beam = 1.0 - smoothstep(0.0, 0.105 + seedTwo * 0.1, abs(angle - rayCenter));
      beam = pow(beam, 1.08);
      float pulse = 0.62 + 0.38 * sin(uTime * (0.32 + seed * 0.3) +
        distanceFromTop * (3.0 + seedTwo * 4.0) + seedTwo * 11.0);
      float flow = mix(0.55, 1.18, flowingNoise);
      light += beam * (0.045 + seed * 0.095) * (0.68 + pulse * 0.32) * flow;
      colorShift += beam * pulse;
    }
    float fan = 1.0 - smoothstep(0.72, 1.32, abs(angle));
    float bottomFade = 1.0 - smoothstep(0.48, 1.08, distanceFromTop);
    float outerFade = 1.0 - smoothstep(0.55, 1.35, radius);
    float centerWidth = 0.12 + distanceFromTop * 0.42;
    float centerGlow = exp(-pow(abs(horizontal) / centerWidth, 2.0));
    float breathing = 0.78 + 0.22 *
      sin(uTime * 0.28 + slowNoise * 4.0 + uMouse.y * 0.3);
    light = (light * 1.08 + centerGlow * (0.11 + flowingNoise * 0.15)) *
      fan * bottomFade * outerFade * breathing;
    float colorMix = clamp(colorShift * 0.28 + flowingNoise * 0.55, 0.0, 1.0);
    vec3 color = mix(uDeepBlue, uElectricBlue, colorMix);
    gl_FragColor = vec4(color, clamp(light, 0.0, 0.2));
  }
`;
