/// <reference types="vite/client" />

declare module 'qrcode.react' {
  import * as React from 'react'
  interface QRCodeProps {
    value: string
    size?: number
    bgColor?: string
    fgColor?: string
    level?: 'L' | 'M' | 'Q' | 'H'
    includeMargin?: boolean
    quietZone?: number
    renderAs?: 'canvas' | 'svg'
    imageSettings?: {
      src: string
      height?: number
      width?: number
      excavate?: boolean
    }
  }
  export const QRCodeSVG: React.FC<QRCodeProps>
  export const QRCodeCanvas: React.FC<QRCodeProps>
  const QRCode: React.FC<QRCodeProps>
  export default QRCode
}
