import 'server-only'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Approved CSS tokens are the sole design source. rem -> PDF pt.
export function reportStyles() {
  const css = readFileSync(join(process.cwd(), 'styles/talentry-tokens.css'), 'utf8')
  function token(name: string): string {
    const value = css.match(new RegExp(`--talentry-${name}:\\s*([^;]+);`))?.[1].trim()
    if (!value) throw new Error('Missing report design token')
    return value
  }
  const points = (name: string) => {
    const value = token(name)
    if (!/^\d+(\.\d+)?rem$/.test(value)) throw new Error('Invalid report dimension token')
    return parseFloat(value) * 12
  }
  const lineHeight = Number(token('line-height-normal'))
  if (!Number.isFinite(lineHeight) || lineHeight < 1) throw new Error('Invalid report line height')
  return {
    margin: points('space-12'), footerReserve: points('space-16'), footerBottom: points('space-6'),
    body: points('font-size-sm'), small: points('font-size-xs'), title: points('font-size-2xl'),
    heading: points('font-size-lg'), score: points('font-size-3xl'), lineHeight,
    gap: points('space-2'), labelGap: points('space-3'), sectionGap: points('space-5'),
    text: token('color-text'), secondary: token('color-text-secondary'),
    navy: token('color-navy'), primary: token('color-primary'),
  }
}
