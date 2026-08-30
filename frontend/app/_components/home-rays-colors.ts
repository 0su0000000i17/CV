export type RayTheme = 'dark' | 'light';
export type RayColor = readonly [number, number, number];

export const RAY_COLORS: Record<RayTheme, { deep: RayColor; electric: RayColor }> = {
  dark: { deep: [0.08, 0.11, 0.15], electric: [0.24, 0.32, 0.42] },
  light: { deep: [0.62, 0.74, 0.88], electric: [0.25, 0.45, 0.75] },
};
