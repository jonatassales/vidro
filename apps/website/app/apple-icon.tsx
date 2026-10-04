import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: '#F8FBFC',
      }}
    >
      <svg
        aria-label="Vidro logo"
        fill="#111517"
        height="128"
        role="img"
        viewBox="0 0 32 32"
        width="128"
      >
        <polygon fillOpacity="0.45" points="3,4 12,2 10,14 2,12" />
        <polygon fillOpacity="0.82" points="2,13 11,14 14,29 5,28" />
        <polygon points="14,14 26,2 31,7 17,29" />
        <polygon fillOpacity="0.58" points="11,13 15,12 14,17 10,16" />
      </svg>
    </div>,
    size,
  )
}
