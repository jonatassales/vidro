import { ImageResponse } from 'next/og'

// ImageResponse renders inline styles; it cannot use the website's Tailwind CSS.
export function renderSocialImage() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: 72,
        gap: 48,
        background: 'linear-gradient(135deg, #E9F2F6, #F8FBFC 65%, #FFFFFF)',
        color: '#111517',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: 430 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg
            aria-label="Vidro logo"
            fill="#111517"
            height="68"
            role="img"
            viewBox="0 0 32 32"
            width="68"
          >
            <polygon fillOpacity="0.45" points="3,4 12,2 10,14 2,12" />
            <polygon fillOpacity="0.82" points="2,13 11,14 14,29 5,28" />
            <polygon points="14,14 26,2 31,7 17,29" />
            <polygon fillOpacity="0.58" points="11,13 15,12 14,17 10,16" />
          </svg>
          <div style={{ fontSize: 80, fontWeight: 600, letterSpacing: -4 }}>
            Vidro
          </div>
        </div>
        <div
          style={{
            fontSize: 42,
            lineHeight: 1.18,
            letterSpacing: -1,
            marginTop: 28,
          }}
        >
          A clear view of your code.
        </div>
        <div style={{ fontSize: 23, color: '#647781', marginTop: 24 }}>
          A Web Component. Any frontend.
        </div>
        <div style={{ fontSize: 20, color: '#647781', marginTop: 46 }}>
          vidro.pro
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 570,
          border: '1px solid #D8E4E9',
          borderRadius: 20,
          background: '#FFFFFFCC',
          boxShadow: '0 24px 70px #233A4A12',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '22px 28px',
            background: 'linear-gradient(110deg, #FAFAFACC, #EEF6FACC)',
            borderBottom: '1px solid #D8E4E9',
            fontSize: 20,
            color: '#647781',
          }}
        >
          <span>hello.ts</span>
          <span>TypeScript</span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 28px',
            fontSize: 23,
            lineHeight: 1.8,
          }}
        >
          <div style={{ color: '#D40067' }}>import &quot;vidropro&quot;</div>
          <div style={{ marginTop: 18 }}>const editor =</div>
          <div style={{ paddingLeft: 24, color: '#0072F5' }}>
            document.createElement(
          </div>
          <div style={{ paddingLeft: 48, color: '#008A22' }}>
            &quot;vidro-editor&quot;
          </div>
          <div style={{ paddingLeft: 24 }}>)</div>
          <div style={{ marginTop: 18 }}>editor.header = true</div>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
