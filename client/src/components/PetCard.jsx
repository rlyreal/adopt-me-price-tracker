import { Edit3, Trash2 } from 'lucide-react'

const rarityLabels = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', ultra_rare: 'Ultra-Rare', legendary: 'Legendary' }
const rarityColors = { common: 'rarity-common', uncommon: 'rarity-uncommon', rare: 'rarity-rare', ultra_rare: 'rarity-ultra', legendary: 'rarity-legendary' }

export default function PetCard({ pet, onEdit, onDelete }) {
  const variants = [pet.is_neon && 'Neon', pet.is_mega_neon && 'Mega', pet.is_flyable && 'Fly', pet.is_rideable && 'Ride'].filter(Boolean)
  return <article className="pet-card reference-pet-card"><div className={`pet-rarity-line ${rarityColors[pet.rarity]}`} title={rarityLabels[pet.rarity]} aria-label={`Rarity: ${rarityLabels[pet.rarity]}`} /><div className="pet-card-media">{pet.image_url ? <img className="pet-card-image" src={pet.image_url} alt={`${pet.name} pet`} /> : <span className="image-placeholder">No image</span>}<div className="pet-reference-variants">{variants.map((variant) => <span className={`reference-variant variant-${variant.toLowerCase().replace(' ', '-')}`} key={variant}>{variant === 'Fly' ? 'F' : variant === 'Ride' ? 'R' : variant === 'Neon' ? 'N' : 'M'}</span>)}</div></div><div className="pet-card-content"><p className="pet-age-label">Full-Grown</p><h3 className="pet-reference-name">{pet.name}</h3><p className="pet-reference-price">{Number(pet.price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {pet.currency === 'USD' ? '$' : pet.currency}</p></div><div className="reference-card-actions"><button title="Edit pet" onClick={() => onEdit(pet)}><Edit3 size={16} /></button><button title="Delete pet" onClick={() => onDelete(pet)}><Trash2 size={16} /></button></div></article>
}
