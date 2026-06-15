import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Download, RefreshCw } from 'lucide-react'
import { supabase, type Registration } from '@art-workshop/shared'
import toast from 'react-hot-toast'

const PAGE_SIZE = 15

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  useEffect(() => { fetchData() }, [])

  const fetchData = async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true)
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false })
    setRegistrations(data ?? [])
    setLoading(false)
    setRefreshing(false)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return registrations.filter((r) => {
      const matchSearch =
        !q ||
        r.full_name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.workshop_name.toLowerCase().includes(q) ||
        r.pass_id.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || r.payment_status === statusFilter
      return matchSearch && matchStatus
    })
  }, [registrations, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const exportCSV = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Workshop', 'Pass ID', 'Amount', 'Status', 'Registered'],
      ...registrations.map((r) => [
        r.full_name,
        r.email,
        r.phone,
        r.workshop_name,
        r.pass_id,
        r.amount,
        r.payment_status,
        new Date(r.created_at).toLocaleDateString('en-IN'),
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'registrations.csv'
    a.click()
    toast.success('CSV downloaded')
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Registrations</h2>
          <p className="font-body text-sm text-navy/45 mt-0.5">
            {registrations.length} total entries
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body text-navy border border-gray-200 hover:border-ocean transition-colors bg-white"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body text-white bg-navy hover:bg-ocean transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/30" />
          <input
            type="text"
            placeholder="Search by name, email, workshop or pass ID…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg font-body text-sm text-navy placeholder-navy/30 focus:outline-none focus:border-ocean focus:ring-1 focus:ring-ocean"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2.5 border border-gray-200 rounded-lg font-body text-sm text-navy focus:outline-none focus:border-ocean bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-card overflow-hidden"
      >
        {loading ? (
          <div className="p-6 space-y-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-background rounded-lg animate-pulse" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-16 text-center font-body text-navy/40">
            No registrations match your filters.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background border-b border-gray-100">
                  <tr>
                    {['Name', 'Workshop', 'Email', 'Phone', 'Payment', 'Status', 'Registered'].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left font-body text-xs font-semibold text-navy/40 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((reg) => (
                    <tr key={reg.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-5 py-3.5 font-body font-semibold text-navy whitespace-nowrap">
                        {reg.full_name}
                      </td>
                      <td className="px-5 py-3.5 font-body text-navy/60 max-w-[160px] truncate">
                        {reg.workshop_name}
                      </td>
                      <td className="px-5 py-3.5 font-body text-navy/60 max-w-[180px] truncate">
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
                      <td className="px-5 py-3.5 font-body text-navy/50 whitespace-nowrap text-xs">
                        {new Date(reg.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
                <p className="font-body text-xs text-navy/40">
                  Page {page} of {totalPages} · {filtered.length} results
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-body border border-gray-200 rounded-lg text-navy disabled:opacity-40 hover:border-ocean transition-colors"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs font-body border border-gray-200 rounded-lg text-navy disabled:opacity-40 hover:border-ocean transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-600',
  }
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full font-body text-xs font-bold uppercase ${styles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}
