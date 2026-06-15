import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, IndianRupee, CalendarCheck, Clock, RefreshCw, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase, type Registration } from '@art-workshop/shared'

interface Stats {
  totalRegistrations: number
  totalRevenue: number
  todayRegistrations: number
  pendingPayments: number
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true)
    try {
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false })

      const regs: Registration[] = data ?? []
      const today = todayISO()
      setStats({
        totalRegistrations: regs.length,
        totalRevenue: regs.filter((r) => r.payment_status === 'paid').reduce((s, r) => s + r.amount, 0),
        todayRegistrations: regs.filter((r) => r.created_at?.startsWith(today)).length,
        pendingPayments: regs.filter((r) => r.payment_status === 'pending').length,
      })
      setRecent(regs.slice(0, 10))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const statCards = stats
    ? [
        {
          icon: <Users size={22} />,
          label: 'Total Registrations',
          value: stats.totalRegistrations.toString(),
          iconColor: '#16537E',
          iconBg: '#E6F3FA',
        },
        {
          icon: <IndianRupee size={22} />,
          label: 'Total Revenue',
          value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
          iconColor: '#2E7D5E',
          iconBg: '#D4EDDA',
        },
        {
          icon: <CalendarCheck size={22} />,
          label: "Today's Registrations",
          value: stats.todayRegistrations.toString(),
          iconColor: '#4CA0C2',
          iconBg: '#E6F3FA',
        },
        {
          icon: <Clock size={22} />,
          label: 'Pending Payments',
          value: stats.pendingPayments.toString(),
          iconColor: '#D97706',
          iconBg: '#FEF3C7',
        },
      ]
    : []

  return (
    <div className="space-y-7 pb-8 font-body">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Overview</h2>
          <p className="font-body text-sm text-navy/45 mt-0.5">Live stats from all registrations</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body text-navy border border-gray-200 hover:border-ocean hover:text-ocean transition-colors bg-white"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-card p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map(({ icon, label, value, iconColor, iconBg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-xl shadow-card p-5"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: iconBg }}
              >
                <span style={{ color: iconColor }}>{icon}</span>
              </div>
              <p className="font-body text-xs text-navy/45 uppercase tracking-wider mb-1">{label}</p>
              <p className="font-display text-2xl font-bold text-navy">{value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recent Registrations table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="bg-white rounded-xl shadow-card overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-display font-bold text-navy text-lg">Recent Registrations</h3>
            <p className="font-body text-xs text-navy/40 mt-0.5">Latest 10 entries</p>
          </div>
          <Link
            to="/registrations"
            className="flex items-center gap-1 font-body text-sm text-ocean hover:text-navy transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="py-16 text-center font-body text-navy/40">
            No registrations yet. Share the registration link to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-background">
                <tr>
                  {['Name', 'Workshop', 'Email', 'Phone', 'Payment', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left font-body text-xs font-semibold text-navy/40 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((reg) => (
                  <tr key={reg.id} className="hover:bg-background/60 transition-colors">
                    <td className="px-5 py-3.5 font-body font-semibold text-navy whitespace-nowrap">
                      {reg.full_name}
                    </td>
                    <td className="px-5 py-3.5 font-body text-navy/60 max-w-[160px] truncate">
                      {reg.workshop_name}
                    </td>
                    <td className="px-5 py-3.5 font-body text-navy/60 max-w-[160px] truncate">
                      {reg.email}
                    </td>
                    <td className="px-5 py-3.5 font-body text-navy/60 whitespace-nowrap">
                      {reg.phone}
                    </td>
                    <td className="px-5 py-3.5 font-body font-semibold text-navy whitespace-nowrap">
                      ₹{reg.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={reg.payment_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid:    'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed:  'bg-red-100 text-red-600',
  }
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full font-body text-xs font-semibold capitalize ${
        styles[status] ?? 'bg-gray-100 text-gray-600'
      }`}
    >
      {status}
    </span>
  )
}
