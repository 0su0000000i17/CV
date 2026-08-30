import { RAY_COLORS, type RayTheme } from './home-rays-colors';
import { createRayProgram } from './home-rays-program';

type Uniforms = {
  time: WebGLUniformLocation;
  aspect: WebGLUniformLocation;
  mouse: WebGLUniformLocation;
  deep: WebGLUniformLocation;
  electric: WebGLUniformLocation;
};

export type RayGraphics = {
  draw: (time: number, aspect: number, pointerX: number, pointerY: number) => void;
  resize: (width: number, height: number) => void;
  setTheme: (theme: RayTheme) => void;
  dispose: () => void;
};

function getUniforms(gl: WebGLRenderingContext, program: WebGLProgram): Uniforms | null {
  const time = gl.getUniformLocation(program, 'uTime');
  const aspect = gl.getUniformLocation(program, 'uAspect');
  const mouse = gl.getUniformLocation(program, 'uMouse');
  const deep = gl.getUniformLocation(program, 'uDeepBlue');
  const electric = gl.getUniformLocation(program, 'uElectricBlue');
  return time && aspect && mouse && deep && electric
    ? { time, aspect, mouse, deep, electric }
    : null;
}

export function createRayGraphics(surface: HTMLCanvasElement): RayGraphics | null {
  const gl = surface.getContext('webgl', {
    alpha: true, antialias: false, depth: false, premultipliedAlpha: false,
    preserveDrawingBuffer: false, stencil: false,
  });
  if (!gl) return null;
  const program = createRayProgram(gl);
  if (!program) return null;
  const position = gl.getAttribLocation(program, 'aPosition');
  const uniforms = getUniforms(gl, program);
  const buffer = gl.createBuffer();
  if (position < 0 || !uniforms || !buffer) {
    gl.deleteProgram(program);
    return null;
  }

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.clearColor(0, 0, 0, 0);
  gl.disable(gl.DEPTH_TEST);

  return {
    draw(time, aspect, pointerX, pointerY) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform1f(uniforms.time, time);
      gl.uniform1f(uniforms.aspect, aspect);
      gl.uniform2f(uniforms.mouse, pointerX, pointerY);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    resize(width, height) {
      if (surface.width === width && surface.height === height) return;
      surface.width = width;
      surface.height = height;
      gl.viewport(0, 0, width, height);
    },
    setTheme(theme) {
      const colors = RAY_COLORS[theme];
      gl.useProgram(program);
      gl.uniform3f(uniforms.deep, ...colors.deep);
      gl.uniform3f(uniforms.electric, ...colors.electric);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
