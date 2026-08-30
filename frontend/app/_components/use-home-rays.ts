'use client';

import { useEffect, useRef } from 'react';

import type { RayTheme } from './home-rays-colors';
import { createRayGraphics, type RayGraphics } from './home-rays-graphics';
import { startRayRuntime, type RayRuntime } from './home-rays-runtime';

export function useHomeRays(theme: RayTheme) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphicsRef = useRef<RayGraphics | null>(null);
  const runtimeRef = useRef<RayRuntime | null>(null);

  useEffect(() => {
    const host = containerRef.current;
    const surface = canvasRef.current;
    if (!host || !surface) return;
    const graphics = createRayGraphics(surface);
    if (!graphics) return;
    graphics.setTheme(theme);
    const runtime = startRayRuntime(host, surface, graphics);
    graphicsRef.current = graphics;
    runtimeRef.current = runtime;
    return () => {
      runtime.stop();
      graphics.dispose();
      graphicsRef.current = null;
      runtimeRef.current = null;
    };
    // Theme updates do not recreate the WebGL context; the effect below
    // updates only its color uniforms.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    graphicsRef.current?.setTheme(theme);
    runtimeRef.current?.redraw();
  }, [theme]);

  return { containerRef, canvasRef };
}
