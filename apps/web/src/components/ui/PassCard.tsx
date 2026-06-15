import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { Registration } from '@art-workshop/shared'

interface PassCardProps {
  registration: Registration
}

export default function PassCard({ registration }: PassCardProps) {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => { setIsClient(true) }, [])

  return (
    <div
      className="w-80 rounded-3xl overflow-hidden"
      style={{ background: '#ffffff', boxShadow: '0 8px 40px rgba(13,43,69,0.18)' }}
    >
      {/* Header */}
      <div
        className="px-7 pt-7 pb-14 relative"
        style={{ background: 'linear-gradient(135deg, #0D2B45 0%, #16537E 60%, #4CA0C2 100%)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-1">
          <img
            src="/logo.png"
            alt="ReSoLArt.co"
            className="h-9 w-auto"
            style={{ mixBlendMode: 'multiply' }}
          />
          <div>
            <p className="font-display font-bold text-white text-base leading-none">ReSoLArt.co</p>
            <p className="font-body text-[9px] text-white/60 tracking-wider mt-0.5">
              create • connect • resonate
            </p>
          </div>
        </div>

        {/* Ticket label */}
        <div className="mt-4 inline-block px-3.5 py-1 rounded-full bg-white/15 border border-white/25">
          <span className="font-body text-[10px] text-white font-semibold uppercase tracking-[0.18em]">
            Experience Pass
          </span>
        </div>

        {/* Wave at bottom of header */}
        <div className="absolute -bottom-px left-0 right-0">
          <svg viewBox="0 0 320 32" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              fill="#ffffff"
              d="M0,16 C50,30 100,4 160,20 C210,32 270,8 320,16 L320,32 L0,32 Z"
            />
          </svg>
        </div>
      </div>

      {/* Body */}
      <div className="px-7 pb-7 -mt-2 space-y-4">

        {/* Pass ID */}
        <div className="text-center pt-2">
          <p className="font-body text-[9px] text-navy/40 uppercase tracking-[0.2em] mb-1">Pass ID</p>
          <p className="font-mono font-bold text-ocean text-sm tracking-widest">
            {registration.pass_id}
          </p>
        </div>

        {/* QR Code */}
        {isClient && (
          <div className="flex justify-center">
            <div
              className="p-3 rounded-2xl"
              style={{ background: '#F7F3E8', boxShadow: '0 2px 12px rgba(13,43,69,0.1)' }}
            >
              <QRCodeSVG
                value={registration.pass_id}
                level="H"
                size={108}
                quietZone={2}
                fgColor="#0D2B45"
                bgColor="#F7F3E8"
              />
            </div>
          </div>
        )}

        {/* Perforated divider */}
        <div className="flex items-center gap-2">
          <div className="flex-1 border-t-2 border-dashed border-gray-200" />
          <div className="w-4 h-4 rounded-full bg-background border-2 border-dashed border-gray-200" />
          <div className="flex-1 border-t-2 border-dashed border-gray-200" />
        </div>

        {/* Holder details */}
        <div className="space-y-3 text-sm">
          <DetailRow label="Name" value={registration.full_name} />
          <DetailRow label="Workshop" value={registration.workshop_name} />
          {registration.created_at && (
            <DetailRow
              label="Registered"
              value={new Date(registration.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            />
          )}
          <DetailRow
            label="Amount"
            value={`₹${registration.amount.toLocaleString('en-IN')}`}
            bold
          />
        </div>

        {/* Status */}
        <div className="flex justify-between items-center rounded-xl px-4 py-2.5 bg-[#F7F3E8]">
          <span className="font-body text-[10px] text-navy/40 uppercase tracking-[0.15em]">Status</span>
          <span
            className={`font-body text-xs font-bold uppercase px-3 py-0.5 rounded-full ${
              registration.payment_status === 'paid'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {registration.payment_status}
          </span>
        </div>

        {/* Wave footer decoration */}
        <div className="pt-2">
          <svg viewBox="0 0 280 24" xmlns="http://www.w3.org/2000/svg" className="w-full opacity-20">
            <path
              fill="#16537E"
              d="M0,12 C35,22 70,4 105,14 C140,24 175,6 210,16 C240,24 265,10 280,14 L280,24 L0,24 Z"
            />
          </svg>
          <p className="font-body text-[9px] text-center text-navy/30 font-accent italic mt-1">
            Present this pass at the venue · ReSoLArt.co
          </p>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="font-body text-[10px] text-navy/40 uppercase tracking-[0.12em] shrink-0 mt-0.5">
        {label}
      </span>
      <span className={`font-body text-right ${bold ? 'text-ocean font-bold' : 'text-navy font-semibold text-xs'}`}>
        {value}
      </span>
    </div>
  )
}
