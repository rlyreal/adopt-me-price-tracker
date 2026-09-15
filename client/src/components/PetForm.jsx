import { useState } from 'react'

const emptyPet = { name: '', rarity: 'common', is_neon: false, is_mega_neon: false, is_flyable: false, is_rideable: false, price: '', currency: 'PHP', notes: '' }

export default function PetForm({ pet, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(pet ? { ...pet } : emptyPet)
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event) => {
    event.preventDefault()
    onSubmit({ ...form, image_url: null, image_path: null })
  }
  if (pet?.__logout) return <div className="space-y-5"><p className="text-sm leading-6 text-moss">Are you sure you want to log out of your collection?</p><div className="flex justify-end gap-3 border-t border-ink/10 pt-5"><button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button><button type="button" className="flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#ff5f9d] to-[#e73d8b] px-5 font-bold text-white shadow-lg shadow-[#db4e8a]/25 transition hover:-translate-y-0.5" onClick={() => onSubmit({ __logout: true })}>Log out</button></div></div>
  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field sm:col-span-2"><span>Pet name</span><input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Frost Dragon" /></label>
        <label className="field"><span>Rarity</span><select value={form.rarity} onChange={(e) => update('rarity', e.target.value)}><option value="common">Common</option><option value="uncommon">Uncommon</option><option value="rare">Rare</option><option value="ultra_rare">Ultra-Rare</option><option value="legendary">Legendary</option></select></label>
        <label className="field"><span>Price</span><div className="flex gap-2"><select className="w-24" value={form.currency} onChange={(e) => update('currency', e.target.value)}><option>PHP</option><option>USD</option></select><input required min="0.01" step="0.01" type="number" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="0.00" /></div></label>
      </div>
      <fieldset><legend className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-moss">Variants</legend><div className="flex flex-wrap gap-2">{[['is_neon', 'Neon'], ['is_mega_neon', 'Mega Neon'], ['is_flyable', 'Fly'], ['is_rideable', 'Ride']].map(([key, label]) => <label key={key} className={`check-pill ${form[key] ? 'selected' : ''}`}><input type="checkbox" checked={Boolean(form[key])} onChange={(e) => update(key, e.target.checked)} />{label}</label>)}</div></fieldset>
      <label className="field"><span>Notes <em>(optional)</em></span><textarea rows="3" value={form.notes || ''} onChange={(e) => update('notes', e.target.value)} placeholder="Trade context, demand notes, or where you found this value..." /></label>
      <div className="flex justify-end gap-3 border-t border-ink/10 pt-5"><button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button><button className="flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#ff5f9d] to-[#e73d8b] px-5 font-bold text-white shadow-lg shadow-[#db4e8a]/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-[.65]" disabled={submitting}>{submitting ? 'Saving...' : pet ? 'Save changes' : 'Add to collection'}</button></div>
    </form>
  )
}
