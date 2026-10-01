import 'server-only'
import type { jsPDF } from 'jspdf'
import type { reportStyles } from './interview-report-styles'

type Layout = ReturnType<typeof reportStyles>
type TextOptions = { size?: number; weight?: 400 | 600; color?: string; after?: number; keepNext?: boolean }

export function reportFlow(doc: jsPDF, layout: Layout) {
  const width = doc.internal.pageSize.getWidth() - 2 * layout.margin
  const bottom = doc.internal.pageSize.getHeight() - layout.footerReserve
  let y = layout.margin
  function ensure(height: number) {
    if (y + height > bottom) { doc.addPage(); y = layout.margin }
  }
  return {
    gap(amount = layout.gap) { y += amount },
    text(value: string, options: TextOptions = {}) {
      const size = options.size ?? layout.body
      const height = size * layout.lineHeight
      doc.setFont('Inter', 'normal', options.weight ?? 400)
      doc.setFontSize(size)
      doc.setTextColor(options.color ?? layout.text)
      const lines: string[] = doc.splitTextToSize(value, width)
      if (options.keepNext) ensure(height + (options.after ?? layout.gap) + layout.body * layout.lineHeight)
      for (const line of lines) {
        ensure(height)
        doc.text(line, layout.margin, y + size)
        y += height
      }
      y += options.after ?? layout.gap
    },
    footer(label: string) {
      const total = doc.getNumberOfPages()
      for (let page = 1; page <= total; page++) {
        doc.setPage(page)
        doc.setFont('Inter', 'normal', 400)
        doc.setFontSize(layout.small)
        doc.setTextColor(layout.secondary)
        doc.text(`${label} ${page} / ${total}`, doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - layout.footerBottom, { align: 'center' })
      }
    },
  }
}
