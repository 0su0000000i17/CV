import type { RayGraphics } from './home-rays-graphics';

function smoothstep(value: number) {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped * clamped * (3 - 2 * clamped);
}

export type RayRuntime = { redraw: () => void; stop: () => void };

export function startRayRuntime(
  host: HTMLDivElement,
  surface: HTMLCanvasElement,
  graphics: RayGraphics,
): RayRuntime {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const animate = !reduced && !coarse;
  const frameInterval = 1000 / 42;
  let width = 1;
  let height = 1;
  let frame = 0;
  let scrollFrame = 0;
  let lastFrameTime = 0;
  let visible = true;
  let targetX = 0.5;
  let targetY = 0.55;
  let currentX = 0.5;
  let currentY = 0.55;

  const redraw = (time = performance.now() / 1000) => {
    graphics.draw(time, width / height, currentX, currentY);
  };
  const resize = () => {
    const rect = host.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
    const quality = coarse ? 0.5 : 0.66;
    graphics.resize(
      Math.max(1, Math.round(width * pixelRatio * quality)),
      Math.max(1, Math.round(height * pixelRatio * quality)),
    );
    redraw();
  };
  const schedule = () => {
    if (animate && visible && !document.hidden && !frame) frame = requestAnimationFrame(render);
  };
  function render(timestamp: number) {
    frame = 0;
    if (!visible || document.hidden) return;
    if (timestamp - lastFrameTime >= frameInterval) {
      lastFrameTime = timestamp;
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.1;
      redraw(timestamp / 1000);
    }
    schedule();
  }
  const updateOpacity = () => {
    scrollFrame = 0;
    if (coarse) {
      host.style.setProperty('--rays-opacity', '0.42');
      return;
    }
    const distance = Math.max(420, window.innerHeight * 0.82);
    host.style.setProperty('--rays-opacity', (0.98 * (1 - smoothstep(window.scrollY / distance))).toFixed(3));
  };
  const handleScroll = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateOpacity);
  };
  const handlePointer = (event: PointerEvent) => {
    targetX = Math.min(1, Math.max(0, event.clientX / window.innerWidth));
    targetY = Math.min(1, Math.max(0, 1 - event.clientY / window.innerHeight));
  };
  const handleVisibility = () => {
    if (document.hidden) cancelAnimationFrame(frame);
    if (document.hidden) frame = 0;
    else schedule();
  };
  const resizeObserver = new ResizeObserver(resize);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) cancelAnimationFrame(frame);
    if (!visible) frame = 0;
    else schedule();
  });
  resizeObserver.observe(host);
  visibilityObserver.observe(host);
  document.addEventListener('visibilitychange', handleVisibility);
  if (!coarse) {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    if (animate) window.addEventListener('pointermove', handlePointer, { passive: true });
  }
  resize();
  updateOpacity();
  redraw(0);
  schedule();

  return { redraw, stop() {
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleScroll);
    window.removeEventListener('pointermove', handlePointer);
    cancelAnimationFrame(frame);
    cancelAnimationFrame(scrollFrame);
  } };
}
