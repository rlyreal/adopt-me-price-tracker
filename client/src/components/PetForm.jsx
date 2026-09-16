import { useState } from 'react'

const emptyPet = { name: '', rarity: 'common', is_neon: false, is_mega_neon: false, is_flyable: false, is_rideable: false, price: '', currency: 'PHP' }

export default function PetForm({ pet, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(pet ? { ...pet } : emptyPet)
  const [image, setImage] = useState(null)
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event) => {
    event.preventDefault()
    onSubmit({ ...form, image })
  }
  if (pet?.__logout) return <div className="space-y-5"><p className="text-sm leading-6 text-moss">Are you sure you want to exit your collection?</p><div className="flex justify-end gap-3 border-t border-ink/10 pt-5"><button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button><button type="button" className="flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#ff5f9d] to-[#e73d8b] px-5 font-bold text-white shadow-lg shadow-[#db4e8a]/25 transition hover:-translate-y-0.5" onClick={() => onSubmit({ __logout: true })}>Exit</button></div></div>
  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field sm:col-span-2"><span>Pet name</span><input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Frost Dragon" /></label>
        <label className="field sm:col-span-2"><span>Pet image <em>(optional, max 500 KB)</em></span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImage(e.target.files?.[0] || null)} /></label>
        <label className="field"><span>Rarity</span><select value={form.rarity} onChange={(e) => update('rarity', e.target.value)}><option value="common">Common</option><option value="uncommon">Uncommon</option><option value="rare">Rare</option><option value="ultra_rare">Ultra-Rare</option><option value="legendary">Legendary</option></select></label>
        <label className="field"><span>Price</span><div className="flex gap-2"><select className="w-24" value={form.currency} onChange={(e) => update('currency', e.target.value)}><option>PHP</option><option>USD</option></select><input required min="0.01" step="0.01" type="number" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="0" /></div></label>
      </div>
      <fieldset><legend className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-moss">Variants</legend><div className="variant-options">{[['is_neon', 'N', 'Neon'], ['is_mega_neon', 'M', 'Mega'], ['is_flyable', 'F', 'Flyable'], ['is_rideable', 'R', 'Rideable']].map(([key, badge, label]) => <label key={key} className="variant-option"><input type="checkbox" checked={Boolean(form[key])} onChange={(e) => update(key, e.target.checked)} /><span className={`variant-option-badge variant-option-${key}`}>{badge}</span><span>{label}</span></label>)}</div></fieldset>
      <div className="flex justify-end gap-3 border-t border-ink/10 pt-5"><button type="button" className="button button-quiet" onClick={onCancel}>Cancel</button><button className="flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#ff5f9d] to-[#e73d8b] px-5 font-bold text-white shadow-lg shadow-[#db4e8a]/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-[.65]" disabled={submitting}>{submitting ? 'Saving...' : pet ? 'Save changes' : 'Add to collection'}</button></div>
    </form>
  )
}
