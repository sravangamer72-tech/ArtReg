interface WaveLogoProps {
  size?: number
  className?: string
}

/**
 * ReSoLArt.co wave logo — curling barrel wave with foam spray and two wave lines.
 * Matches the painted ocean-wave brand mark.
 */
export default function WaveLogo({ size = 48, className = '' }: WaveLogoProps) {
  const h = Math.round(size * 1.1)
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 200 220"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ReSoLArt.co wave logo"
    >
      {/* ── Main wave body (deep navy) ── */}
      <path
        d="
          M 18,148
          C 10,114 16,76 42,52
          C 60,34 82,26 104,30
          C 124,34 138,50 136,68
          C 134,82 122,92 108,90
          C 96,88 88,80 90,70
          C 91,62 98,58 104,60
          C 109,62 110,68 106,73
          C 118,80 128,92 124,108
          C 120,122 104,132 86,134
          C 64,136 36,130 18,148 Z
        "
        fill="#1B4F72"
      />

      {/* ── Inner barrel — medium blue ── */}
      <path
        d="
          M 100,30
          C 120,26 140,38 144,56
          C 147,68 142,80 130,86
          C 122,90 112,87 108,79
          C 104,72 107,62 104,60
          C 98,58 91,62 90,70
          C 89,62 93,48 100,30 Z
        "
        fill="#2E86AB"
        opacity="0.88"
      />

      {/* ── Aqua highlight — inside of curl ── */}
      <path
        d="
          M 118,34
          C 132,38 142,52 140,66
          C 138,75 132,80 124,80
          C 130,74 132,66 128,58
          C 125,52 120,44 118,34 Z
        "
        fill="#A8D8EA"
        opacity="0.55"
      />

      {/* ── Foam spray streaks ── */}
      <path d="M 105,26 C 118,16 134,17 140,26" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.9"/>
      <path d="M 120,18 C 134,8  150,10  156,20" stroke="white" strokeWidth="3"   fill="none" strokeLinecap="round" opacity="0.65"/>
      <path d="M 136,12 C 148,4  162,6   167,15" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.42"/>

      {/* ── Wave lines below ── */}
      <path
        d="M 6,158 C 34,146 62,162 90,154 C 118,146 146,162 172,154 C 183,150 192,156 198,160"
        stroke="#1B4F72"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 10,174 C 38,162 66,178 94,170 C 122,162 150,178 176,170 C 187,166 194,172 198,176"
        stroke="#2E86AB"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  )
}
