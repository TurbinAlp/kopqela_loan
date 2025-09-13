declare module 'pdfkit/js/pdfkit.standalone.js' {
  // Minimal constructor shape used in our route
  interface PDFDocOptions {
    size?: string | [number, number]
    margin?: number
  }
  class PDFDocument {
    constructor(options?: PDFDocOptions)
    on(event: 'data', cb: (chunk: Uint8Array) => void): this
    on(event: 'end', cb: () => void): this
    fontSize(size: number): this
    text(text: string): this
    text(text: string, options: Record<string, unknown>): this
    text(text: string, x: number, y?: number, options?: Record<string, unknown>): this
    moveDown(lines?: number): this
    fillColor(color: string): this
    moveTo(x: number, y: number): this
    lineTo(x: number, y: number): this
    strokeColor(color: string): this
    stroke(): this
    rect(x: number, y: number, w: number, h: number): this
    fill(color?: string): this
    addPage(): this
    end(): void
    readonly y: number
  }
  export default PDFDocument
}
