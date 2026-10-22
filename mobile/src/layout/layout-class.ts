export type LayoutClass = 'compact' | 'medium' | 'expanded'
/** Probe thresholds only, not frozen product breakpoints. Account for usable width/text scale. */
export function layoutClass(width: number, fontScale: number): LayoutClass {
  const usable = width / Math.max(1, fontScale)
  return usable < 600 ? 'compact' : usable < 1000 ? 'medium' : 'expanded'
}
