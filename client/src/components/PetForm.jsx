import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

const emptyPet = { name: '', rarity: 'common', is_neon: false, is_mega_neon: false, is_flyable: false, is_rideable: false, price: '', currency: 'PHP', notes: '' }

export default function PetForm({ pet, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(pet ? { ...pet } : emptyPet)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(pet?.image_url || '')
  const inputRef = useRef(null)

  useEffect(() => () => preview.startsWith('blob:') && URL.revokeObjectURL(preview), [preview])
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const chooseFile = (selected) => {
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }
  const submit = (event) => {
    event.preventDefault()
    const data = new FormData()
    Object.entries(form).forEach(([key, value]) => data.append(key, value ?? ''))
    if (file) data.append('image', file)
    onSubmit(data)
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field sm:col-span-2"><span>Pet name</span><input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Frost Dragon" /></label>
        <label className="field"><span>Rarity</span><select value={form.rarity} onChange={(e) => update('rarity', e.target.value)}><option value="common">Common</option><option value="uncommon">Uncommon</option><option value="rare">Rare</option><option value="ultra_rare">Ultra-Rare</option><option value="legendary">Legendary</option></select></label>
        <label className="field"><span>Price</span><div className="flex gap-2"><select className="w-24" value={form.currency} onChange={(e) => update('currency', e.target.value)}><option>PHP</option><option>USD</option></select><input required min="0.01" step="0.01" type="number" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="0.00" /></div></label>
      </div>
      <fieldset><legend className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-moss">Variants</legend><div className="flex flex-wrap gap-2">{[['is_neon', 'Neon'], ['is_mega_neon', 'Mega Neon'], ['is_flyable', 'Fly'], ['is_rideable', 'Ride']].map(([key, label]) => <label key={key} className={`check-pill ${form[key] ? 'selected' : ''}`}><input type="checkbox" checked={Boolean(form[key])} onChange={(e) => update(key, e.target.checked)} />{label}</label>)}</div></fieldset>
      <label className="field"><span>Notes <em>(optional)</em></span><textarea rows="3" value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} placeholder="Trade context, demand notes, or where you found this value..." /></label>
      <div><span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-moss">Pet image</span><div className="upload-zone" onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); chooseFile(e.dataTransfer.files?.[0]) }}>{preview ? <div className="relative"><img src={preview} alt="Preview" className="mx-auto max-h-44 rounded-xl object-contain" /><button type="button" className="absolute right-2 top-2 rounded-full bg-ink p-2 text-white" onClick={(e) => { e.stopPropagation(); setFile(null); setPreview('') }}><X size={15} /></button></div> : <div className="py-7 text-center"><ImagePlus className="mx-auto mb-2 text-coral" /><p className="font-bold text-ink">Drop an image here</p><p className="mt-1 text-sm text-moss">or browse from your device · 5MB max</p></div>}<input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => chooseFile(e.target.files?.[0])} /></div></div>
      <div className="flex justify-end gap-3 border-t border-ink/10 pt-5"><button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button><button className="button button-primary" disabled={submitting}>{submitting ? 'Saving...' : pet ? 'Save changes' : 'Add to collection'}</button></div>
    </form>
  )
}
