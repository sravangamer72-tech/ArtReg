import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Html5Qrcode } from 'html5-qrcode'
import {
  ScanLine, Keyboard, Search, CheckCircle2, XCircle, AlertTriangle,
  User, Palette, Phone, Mail, IndianRupee, Clock, RefreshCw, Camera, CameraOff,
} from 'lucide-react'
import { supabase, formatCurrency, type Registration } from '@art-workshop/shared'
import toast from 'react-hot-toast'

const PASS_PATTERN = /^ART-[A-Z0-9]{6}-[A-Z0-9]{4}$/
const SCANNER_DIV = 'html5-qr-region'

function playBeep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'; osc.frequency.value = 1050
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.18)
  } catch { /* skip if AudioContext unavailable */ }
}

function QrScannerView({ onScan, paused }: { onScan: (t: string) => void; paused: boolean }) {
  const instanceRef = useRef<Html5Qrcode | null>(null)
  const startedRef = useRef(false)
  const pausedRef = useRef(paused)
  const onScanRef = useRef(onScan)
  const [camError, setCamError] = useState<string | null>(null)
  const [initialising, setInitialising] = useState(true)

  useEffect(() => { onScanRef.current = onScan }, [onScan])
  useEffect(() => { pausedRef.current = paused }, [paused])

  useEffect(() => {
    let scanner: Html5Qrcode | null = null
    const start = async () => {
      try {
        scanner = new Html5Qrcode(SCANNER_DIV, { verbose: false })
        instanceRef.current = scanner
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 12, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
          (text) => { if (!pausedRef.current) { playBeep(); if (navigator.vibrate) navigator.vibrate(80); onScanRef.current(text) } },
          () => {}
        )
        startedRef.current = true
        setInitialising(false)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied'))
          setCamError('Camera permission denied. Enable it in your browser settings.')
        else if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('no camera'))
          setCamError('No camera found on this device. Use manual entry instead.')
        else
          setCamError('Could not start camera. Use manual entry below.')
        setInitialising(false)
      }
    }
    start()
    return () => {
      if (scanner) {
        (async () => { try { if (startedRef.current) await scanner!.stop() } catch {} finally { try { scanner!.clear() } catch {} } })()
        startedRef.current = false
      }
    }
  }, [])

  if (camError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 bg-background border border-gray-200 rounded-2xl py-10 px-6 text-center">
        <CameraOff size={32} className="text-navy/30" />
        <p className="text-sm text-navy/50">{camError}</p>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-200">
      {initialising && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
              <Camera size={28} className="text-accent" />
            </motion.div>
            <p className="text-sm text-white/60">Starting camera…</p>
          </div>
        </div>
      )}
      <div id={SCANNER_DIV} className="w-full" style={{ minHeight: 280 }} />
      {!initialising && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[200px] h-[200px] relative">
            {['top-0 left-0 border-t-2 border-l-2','top-0 right-0 border-t-2 border-r-2','bottom-0 left-0 border-b-2 border-l-2','bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
              <span key={i} className={`absolute w-6 h-6 border-accent rounded-sm ${cls}`} />
            ))}
            <motion.div
              animate={{ y: [0, 180, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-80"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ResultCard({ registration: reg, onCheckIn, checkingIn, success }: {
  registration: Registration; onCheckIn: () => void; checkingIn: boolean; success: boolean
}) {
  const alreadyCheckedIn = reg.checked_in
  const notPaid = reg.payment_status !== 'paid'

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
          className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3"
        >
          <CheckCircle2 size={28} className="text-green-600" />
        </motion.div>
        <p className="font-display font-bold text-lg text-green-700">Checked In!</p>
        <p className="text-sm text-navy/60 mt-1">{reg.full_name}</p>
        <p className="text-xs text-navy/40 mt-0.5">{reg.workshop_name}</p>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-card"
    >
      {(notPaid || alreadyCheckedIn) && (
        <div className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b ${
          notPaid ? 'bg-red-50 border-red-200 text-red-600' : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <AlertTriangle size={13} />
          {notPaid
            ? `Payment status is "${reg.payment_status}" — check before admitting`
            : 'Already checked in — marking again will update the timestamp'}
        </div>
      )}
      <div className="p-5 space-y-3">
        {[
          { icon: <User size={14} />, label: 'Name', value: reg.full_name },
          { icon: <Mail size={14} />, label: 'Email', value: reg.email },
          { icon: <Phone size={14} />, label: 'Phone', value: `+91 ${reg.phone}` },
          { icon: <Palette size={14} />, label: 'Workshop', value: reg.workshop_name },
          { icon: <IndianRupee size={14} />, label: 'Amount', value: formatCurrency(reg.amount) },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 text-sm">
            <span className="text-navy/35 shrink-0">{row.icon}</span>
            <span className="text-navy/45 w-16 shrink-0 font-body">{row.label}</span>
            <span className="font-body font-medium text-navy truncate">{row.value}</span>
          </div>
        ))}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-navy/35 shrink-0"><ScanLine size={14} /></span>
          <span className="text-navy/45 w-16 shrink-0 font-body">Status</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full font-body ${
            reg.payment_status === 'paid' ? 'bg-green-100 text-green-700'
            : reg.payment_status === 'pending' ? 'bg-amber-100 text-amber-700'
            : 'bg-red-100 text-red-700'
          }`}>
            {reg.payment_status}
          </span>
        </div>
        <div className="pt-1 font-mono text-xs text-ocean bg-light rounded-lg px-3 py-2">
          {reg.pass_id}
        </div>
      </div>
      <div className="px-5 pb-5">
        <motion.button onClick={onCheckIn} disabled={checkingIn} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className={`w-full py-3 rounded-xl font-body font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            alreadyCheckedIn
              ? 'bg-amber-100 border border-amber-300 text-amber-700 hover:bg-amber-200'
              : 'bg-navy text-white hover:bg-ocean'
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {checkingIn ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><RefreshCw size={15} /></motion.div>Checking in…</>
          ) : (
            <><CheckCircle2 size={15} />{alreadyCheckedIn ? 'Check In Again' : 'Mark as Checked In'}</>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

function RecentCheckIns({ regs, loading }: { regs: Registration[]; loading: boolean }) {
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'Just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-card">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-display font-bold text-navy text-sm">Recent Check-ins</h3>
        <p className="text-xs text-navy/40 font-body mt-0.5">Last 10 scanned passes</p>
      </div>
      {loading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-background rounded-xl animate-pulse" />)}
        </div>
      ) : regs.length === 0 ? (
        <div className="py-10 text-center">
          <ScanLine size={28} className="text-navy/15 mx-auto mb-2" />
          <p className="text-xs text-navy/40 font-body">No check-ins yet today</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {regs.map((reg, i) => (
            <motion.div key={reg.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-5 py-3"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg,#0D2B45,#16537E)' }}>
                {reg.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-medium text-navy truncate">{reg.full_name}</p>
                <p className="text-xs text-navy/40 font-body truncate">{reg.workshop_name}</p>
              </div>
              <div className="text-xs text-navy/40 font-body whitespace-nowrap shrink-0 flex items-center gap-1">
                <Clock size={11} />{reg.checked_in_at ? timeAgo(reg.checked_in_at) : '—'}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

type Tab = 'camera' | 'manual'
type LookupState = 'idle' | 'loading' | 'found' | 'not_found'

export default function CheckInPage() {
  const [tab, setTab] = useState<Tab>('camera')
  const [manualInput, setManualInput] = useState('')
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [scannerPaused, setScannerPaused] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkInSuccess, setCheckInSuccess] = useState(false)
  const [recentCheckIns, setRecentCheckIns] = useState<Registration[]>([])
  const [recentLoading, setRecentLoading] = useState(true)
  const lastScannedRef = useRef<string>('')

  useEffect(() => { fetchRecentCheckIns() }, [])

  const fetchRecentCheckIns = async () => {
    setRecentLoading(true)
    try {
      const { data } = await supabase.from('registrations').select('*').eq('checked_in', true).order('checked_in_at', { ascending: false }).limit(10)
      setRecentCheckIns(data ?? [])
    } finally { setRecentLoading(false) }
  }

  const lookupPass = useCallback(async (passId: string) => {
    const clean = passId.trim().toUpperCase()
    if (!clean) return
    if (clean === lastScannedRef.current) return
    lastScannedRef.current = clean
    setScannerPaused(true); setLookupState('loading'); setRegistration(null); setCheckInSuccess(false)
    try {
      const { data, error } = await supabase.from('registrations').select('*').eq('pass_id', clean).maybeSingle()
      if (error) throw error
      if (!data) { setLookupState('not_found') } else { setRegistration(data); setLookupState('found') }
    } catch {
      toast.error('Lookup failed. Please try again.')
      setLookupState('idle'); setScannerPaused(false); lastScannedRef.current = ''
    }
  }, [])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualInput.trim()) { toast.error('Enter a Pass ID to search'); return }
    lookupPass(manualInput.trim())
  }

  const handleManualChange = (value: string) => {
    setManualInput(value)
    if (PASS_PATTERN.test(value.trim().toUpperCase())) lookupPass(value.trim())
  }

  const handleCheckIn = async () => {
    if (!registration) return
    setCheckingIn(true)
    try {
      const { error } = await supabase.from('registrations').update({ checked_in: true, checked_in_at: new Date().toISOString() }).eq('id', registration.id)
      if (error) throw error
      setCheckInSuccess(true)
      toast.success(`${registration.full_name} checked in!`)
      fetchRecentCheckIns()
      setTimeout(() => { setLookupState('idle'); setRegistration(null); setCheckInSuccess(false); setScannerPaused(false); setManualInput(''); lastScannedRef.current = '' }, 2500)
    } catch { toast.error('Check-in failed. Please try again.') }
    finally { setCheckingIn(false) }
  }

  const handleReset = () => { setLookupState('idle'); setRegistration(null); setCheckInSuccess(false); setScannerPaused(false); setManualInput(''); lastScannedRef.current = '' }

  return (
    <div className="space-y-6 pb-8 font-body">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy">Check-in Scanner</h2>
        <p className="text-sm text-navy/45 mt-0.5">Scan a QR code or enter a Pass ID to check in attendees</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left: scanner + result */}
        <div className="xl:col-span-2 space-y-4">
          {/* Tab strip */}
          <div className="flex gap-1.5 bg-background border border-gray-200 p-1 rounded-xl w-fit">
            {([
              { key: 'camera' as Tab, label: 'Camera Scan', icon: <Camera size={15} /> },
              { key: 'manual' as Tab, label: 'Manual / USB', icon: <Keyboard size={15} /> },
            ] as const).map(({ key, label, icon }) => (
              <button key={key} onClick={() => { setTab(key); handleReset() }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === key ? 'bg-navy text-white shadow-card' : 'text-navy/55 hover:text-navy'
                }`}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {tab === 'camera' && (
            <motion.div key="camera-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="relative">
                <QrScannerView onScan={lookupPass} paused={scannerPaused} />
                <AnimatePresence>
                  {scannerPaused && lookupState !== 'loading' && lookupState === 'idle' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                      <p className="text-sm text-white/60">Scanner paused</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-xs text-navy/40 text-center">Point camera at a ReSoLArt QR code — detection is automatic</p>
            </motion.div>
          )}

          {tab === 'manual' && (
            <motion.div key="manual-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/35 pointer-events-none" />
                  <input
                    autoFocus type="text"
                    placeholder="ART-XXXXXX-XXXX or scan with USB scanner…"
                    value={manualInput}
                    onChange={(e) => handleManualChange(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-navy placeholder-gray-400 focus:border-ocean focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors font-mono uppercase tracking-wider"
                  />
                </div>
                <button type="submit" disabled={lookupState === 'loading'}
                  className="px-5 py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-ocean disabled:opacity-50 transition-colors shrink-0">
                  Search
                </button>
              </form>
              <p className="text-xs text-navy/40">USB QR scanners are auto-detected — just scan and the pass ID is filled automatically.</p>
            </motion.div>
          )}

          {/* Result area */}
          <AnimatePresence mode="wait">
            {lookupState === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl py-8 shadow-card">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <RefreshCw size={20} className="text-ocean" />
                </motion.div>
                <p className="text-sm text-navy/55">Looking up pass…</p>
              </motion.div>
            )}
            {lookupState === 'not_found' && (
              <motion.div key="not-found" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 bg-red-50 border border-red-200 rounded-2xl py-8 px-6 text-center">
                <XCircle size={32} className="text-red-500" />
                <div>
                  <p className="font-display font-bold text-red-600">Pass Not Found</p>
                  <p className="text-sm text-navy/50 mt-1">No registration matches this pass ID. Double-check and try again.</p>
                </div>
                <button onClick={handleReset} className="mt-1 text-sm text-ocean hover:text-navy transition-colors">Try again →</button>
              </motion.div>
            )}
            {lookupState === 'found' && registration && (
              <motion.div key="found" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-navy/45 uppercase tracking-wide font-semibold">Registration Found</p>
                  <button onClick={handleReset} className="text-xs text-navy/45 hover:text-navy transition-colors">← Scan another</button>
                </div>
                <ResultCard registration={registration} onCheckIn={handleCheckIn} checkingIn={checkingIn} success={checkInSuccess} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: recent check-ins */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-display font-bold text-navy">Recent</span>
            <button onClick={fetchRecentCheckIns} className="text-navy/40 hover:text-navy transition-colors p-1.5 rounded-lg hover:bg-background">
              <RefreshCw size={14} />
            </button>
          </div>
          <RecentCheckIns regs={recentCheckIns} loading={recentLoading} />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-card">
              <p className="text-2xl font-display font-bold text-ocean">{recentCheckIns.length}</p>
              <p className="text-xs text-navy/45 font-body mt-1">Checked in</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-card">
              <p className="text-2xl font-display font-bold text-navy">
                {recentCheckIns.length > 0
                  ? Math.round((recentCheckIns.filter(r => r.payment_status === 'paid').length / recentCheckIns.length) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-navy/45 font-body mt-1">Paid rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
