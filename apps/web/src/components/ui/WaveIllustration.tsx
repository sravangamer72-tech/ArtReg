import { SVGProps } from 'react'

export default function WaveIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M0,300 C100,250 200,200 300,220 C400,240 500,180 600,200 L600,500 L0,500 Z"
        fill="#A7D8F0"
        opacity="0.3"
      />
      <path
        d="M0,260 C80,210 180,170 280,190 C380,210 480,150 580,170 C590,172 595,173 600,174 L600,500 L0,500 Z"
        fill="#4CA0C2"
        opacity="0.5"
      />
      <path
        d="M0,220 C120,180 220,140 320,160 C420,180 520,120 600,140 L600,500 L0,500 Z"
        fill="#16537E"
        opacity="0.6"
      />
      <path
        d="M0,180 C100,140 200,100 300,120 C400,140 500,80 600,100 L600,500 L0,500 Z"
        fill="#0D2B45"
        opacity="0.7"
      />
      <circle cx="150" cy="100" r="60" fill="#A7D8F0" opacity="0.2" />
      <circle cx="450" cy="80" r="40" fill="#4CA0C2" opacity="0.2" />
    </svg>
  )
}
