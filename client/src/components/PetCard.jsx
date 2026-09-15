import { Edit3, Trash2 } from 'lucide-react'

const rarityLabels = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', ultra_rare: 'Ultra-Rare', legendary: 'Legendary' }
const rarityColors = { common: 'rarity-common', uncommon: 'rarity-uncommon', rare: 'rarity-rare', ultra_rare: 'rarity-ultra', legendary: 'rarity-legendary' }

export default function PetCard({ pet, onEdit, onDelete }) {
  const variants = [pet.is_neon && 'Neon', pet.is_mega_neon && 'Mega', pet.is_flyable && 'Fly', pet.is_rideable && 'Ride'].filter(Boolean)
  return <article className="pet-card"><div className="p-4"><div className="mb-4 flex items-center justify-between"><span className={`rarity-badge !static ${rarityColors[pet.rarity]}`}>{rarityLabels[pet.rarity]}</span><div className="card-actions"><button title="Edit pet" onClick={() => onEdit(pet)}><Edit3 size={16} /></button><button title="Delete pet" onClick={() => onDelete(pet)}><Trash2 size={16} /></button></div></div><div className="mb-3 flex items-start justify-between gap-2"><h3 className="font-display text-xl font-bold leading-tight text-ink">{pet.name}</h3></div><div className="mb-4 flex min-h-6 flex-wrap gap-1.5">{variants.map((variant) => <span className="variant-chip" key={variant}>{variant}</span>)}</div><div className="flex items-end justify-between border-t border-ink/10 pt-3"><div><p className="text-xs font-bold uppercase tracking-wider text-moss">Current value</p><p className="font-display text-2xl font-bold text-ink">{pet.currency} {Number(pet.price).toLocaleString()}</p></div><p className="text-right text-[11px] text-moss">Updated<br />{new Date(pet.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p></div></div></article>
}
