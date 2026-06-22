import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, RefreshCw, ToggleLeft, ToggleRight, Upload, ImageOff } from 'lucide-react'
import { supabase, type Workshop } from '@art-workshop/shared'
import toast from 'react-hot-toast'

interface WorkshopForm {
  name: string
  description: string
  instructor: string
  date: string
  time: string
  venue: string
  price: string
  capacity: string
  image_url: string
  is_active: boolean
}

const EMPTY_FORM: WorkshopForm = {
  name: '', description: '', instructor: '', date: '', time: '',
  venue: '', price: '', capacity: '999', image_url: '', is_active: true,
}

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<WorkshopForm>(EMPTY_FORM)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => { fetchWorkshops() }, [])

  const fetchWorkshops = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('workshops')
      .select('*')
      .order('date', { ascending: true })
    setWorkshops(data ?? [])
    setLoading(false)
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (w: Workshop) => {
    setForm({
      name: w.name,
      description: w.description ?? '',
      instructor: w.instructor ?? '',
      date: w.date,
      time: w.time,
      venue: w.venue,
      price: String(w.price),
      capacity: String(w.capacity),
      image_url: w.image_url ?? '',
      is_active: w.is_active,
    })
    setEditingId(w.id)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.date || !form.time || !form.venue || !form.price) {
      toast.error('Please fill in all required fields.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        instructor: form.instructor.trim(),
        date: form.date,
        time: form.time,
        venue: form.venue.trim(),
        price: parseFloat(form.price),
        capacity: parseInt(form.capacity, 10),
        image_url: form.image_url.trim(),
        is_active: form.is_active,
      }

      if (editingId) {
        const { error } = await supabase.from('workshops').update(payload).eq('id', editingId)
        if (error) throw error
        toast.success('Workshop updated.')
      } else {
        const { error } = await supabase.from('workshops').insert({ ...payload, enrolled: 0 })
        if (error) throw error
        toast.success('Workshop created.')
      }
      closeModal()
      fetchWorkshops()
    } catch (err: any) {
      console.error('Workshop save error:', err)
      toast.error(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    // Delete linked registrations first to avoid foreign key constraint
    const { error: regError } = await supabase.from('registrations').delete().eq('workshop_id', id)
    if (regError) {
      setDeletingId(null)
      toast.error(regError.message ?? 'Failed to delete registrations.')
      return
    }
    const { error } = await supabase.from('workshops').delete().eq('id', id)
    setDeletingId(null)
    if (error) { toast.error(error.message ?? 'Failed to delete workshop.'); return }
    toast.success('Workshop deleted.')
    fetchWorkshops()
  }

  const toggleActive = async (w: Workshop) => {
    const { error } = await supabase
      .from('workshops')
      .update({ is_active: !w.is_active })
      .eq('id', w.id)
    if (!error) {
      toast.success(`Workshop ${!w.is_active ? 'activated' : 'deactivated'}.`)
      fetchWorkshops()
    }
  }

  const set = (field: keyof WorkshopForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="space-y-6 pb-8 font-body">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Workshops</h2>
          <p className="font-body text-sm text-navy/45 mt-0.5">
            {workshops.length} workshop{workshops.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchWorkshops}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-navy border border-gray-200 hover:border-ocean hover:text-ocean transition-colors bg-white"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-navy hover:bg-ocean transition-colors"
          >
            <Plus size={15} />
            New Workshop
          </button>
        </div>
      </div>

      {/* Workshop list */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-card h-24 animate-pulse" />
          ))}
        </div>
      ) : workshops.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card py-20 text-center">
          <p className="font-display text-lg font-bold text-navy mb-2">No workshops yet</p>
          <p className="font-body text-sm text-navy/40 mb-6">
            Create your first workshop to get started.
          </p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-ocean transition-colors"
          >
            <Plus size={15} /> Create Workshop
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {workshops.map((w) => (
            <motion.div
              key={w.id}
              layout
              className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4 p-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display font-bold text-navy text-base truncate">
                      {w.name}
                    </h3>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-body font-bold uppercase ${
                        w.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {w.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-body text-navy/50">
                    <span>{w.date} · {w.time}</span>
                    <span>{w.venue}</span>
                    <span className="font-semibold text-ocean">₹{w.price.toLocaleString('en-IN')}</span>
                  </div>
                  {w.description && (
                    <p className="mt-2 text-xs font-body text-navy/40 line-clamp-1">{w.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleActive(w)}
                    className="p-2 rounded-lg text-navy/40 hover:text-ocean hover:bg-light transition-colors"
                    title={w.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {w.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                  <button
                    onClick={() => openEdit(w)}
                    className="p-2 rounded-lg text-navy/40 hover:text-navy hover:bg-background transition-colors"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(w.id)}
                    disabled={deletingId === w.id}
                    className="p-2 rounded-lg text-navy/40 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === w.id ? (
                      <div className="w-4 h-4 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />
            <motion.div
              key="modal"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h3 className="font-display font-bold text-navy text-lg">
                    {editingId ? 'Edit Workshop' : 'New Workshop'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="p-1.5 rounded-lg text-navy/40 hover:text-navy hover:bg-background transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal body */}
                <div className="p-6 space-y-5">
                  <Field label="Workshop Name *">
                    <input
                      value={form.name}
                      onChange={set('name')}
                      placeholder="e.g. Ocean Soul Painting"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Description">
                    <textarea
                      value={form.description}
                      onChange={set('description')}
                      placeholder="What participants can expect…"
                      rows={3}
                      className={inputCls + ' resize-none'}
                    />
                  </Field>

                  <Field label="Instructor">
                    <input
                      value={form.instructor}
                      onChange={set('instructor')}
                      placeholder="Instructor name"
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Date *">
                      <input
                        type="date"
                        value={form.date}
                        onChange={set('date')}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Time *">
                      <input
                        value={form.time}
                        onChange={set('time')}
                        placeholder="e.g. 10:00 AM – 1:00 PM"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field label="Venue *">
                    <input
                      value={form.venue}
                      onChange={set('venue')}
                      placeholder="Studio or location name"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Price (₹) *">
                    <input
                      type="number"
                      value={form.price}
                      onChange={set('price')}
                      placeholder="1500"
                      min="0"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Workshop Image">
                    <ImageUpload
                      value={form.image_url}
                      onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
                    />
                  </Field>

                  {/* Active toggle */}
                  <div className="flex items-center justify-between py-3 px-4 bg-background rounded-xl border border-gray-100">
                    <div>
                      <p className="font-body font-semibold text-sm text-navy">Visible on public site</p>
                      <p className="font-body text-xs text-navy/40">Active workshops appear on the landing page</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        form.is_active ? 'bg-ocean' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                          form.is_active ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Modal footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 border border-gray-200 text-navy font-body text-sm rounded-xl hover:bg-background transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-navy text-white font-body font-semibold text-sm rounded-xl hover:bg-ocean transition-colors disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : (
                      editingId ? 'Save Changes' : 'Create Workshop'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

const inputCls =
  'w-full border border-gray-200 rounded-lg px-4 py-2.5 font-body text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-ocean focus:ring-2 focus:ring-blue-100 transition-all bg-white [color-scheme:light]'

/* ─── Image Upload ─── */
function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB.')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `workshop-${Date.now()}.${ext}`

      const { data, error } = await supabase.storage
        .from('workshop-images')
        .upload(path, file, { upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('workshop-images')
        .getPublicUrl(data.path)

      onChange(publicUrl)
    } catch (err: any) {
      console.error('Storage upload error:', err)
      toast.error(err?.message ?? 'Upload failed.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  const removeImage = async () => {
    if (value) {
      const segment = value.split('/workshop-images/')
      if (segment[1]) {
        await supabase.storage.from('workshop-images').remove([segment[1]])
      }
    }
    onChange('')
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      {value ? (
        /* Preview */
        <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
          <img src={value} alt="Workshop" className="w-full h-auto block" />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-navy/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-navy text-xs font-body font-semibold rounded-lg hover:bg-background transition-colors"
            >
              <Upload size={12} /> Change
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-body font-semibold rounded-lg hover:bg-red-600 transition-colors"
            >
              <ImageOff size={12} /> Remove
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          disabled={uploading}
          className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all disabled:opacity-60 ${
            dragOver
              ? 'border-ocean bg-light scale-[1.01]'
              : 'border-gray-200 hover:border-ocean hover:bg-light/60'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-8 h-8 border-2 border-ocean/20 border-t-ocean rounded-full animate-spin" />
              <p className="font-body text-sm text-navy/40">Uploading…</p>
            </>
          ) : (
            <>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dragOver ? 'bg-ocean/15' : 'bg-gray-100'}`}>
                <Upload size={20} className={dragOver ? 'text-ocean' : 'text-navy/35'} />
              </div>
              <div className="text-center">
                <p className="font-body text-sm font-semibold text-navy/60">
                  {dragOver ? 'Drop to upload' : 'Click or drag & drop'}
                </p>
                <p className="font-body text-xs text-navy/35 mt-0.5">PNG, JPG, WebP · Max 5 MB</p>
              </div>
            </>
          )}
        </button>
      )}
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}
