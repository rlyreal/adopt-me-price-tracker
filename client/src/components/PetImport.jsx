import { useState } from 'react'
import { Check, FileUp, LoaderCircle, Upload, X } from 'lucide-react'

const requiredColumns = ['name', 'rarity', 'price', 'currency']
const rarityLabels = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', ultra_rare: 'Ultra-Rare', legendary: 'Legendary' }

function parseCsv(text) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { value += '"'; index += 1 }
      else quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(value.trim()); value = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(value.trim()); value = ''
      if (row.some(Boolean)) rows.push(row)
      row = []
    } else value += character
  }
  row.push(value.trim())
  if (row.some(Boolean)) rows.push(row)
  if (rows.length < 2) throw new Error('Your CSV needs a header row and at least one pet')
  const headers = rows[0].map((header) => header.toLowerCase().replace(/\s+/g, '_'))
  const missing = requiredColumns.filter((column) => !headers.includes(column))
  if (missing.length) throw new Error(`Missing columns: ${missing.join(', ')}`)
  return rows.slice(1).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ''])))
}

function asBoolean(value) {
  return ['true', '1', 'yes', 'y'].includes(String(value).toLowerCase())
}

function normalizeRow(row, index) {
  const pet = {
    name: row.name,
    rarity: row.rarity.toLowerCase().replace(/[- ]/g, '_'),
    price: row.price,
    currency: row.currency.toUpperCase(),
    is_neon: asBoolean(row.is_neon),
    is_mega_neon: asBoolean(row.is_mega_neon),
    is_flyable: asBoolean(row.is_flyable),
    is_rideable: asBoolean(row.is_rideable),
    notes: row.notes || ''
  }
  const errors = []
  if (!pet.name) errors.push('name is required')
  if (!rarityLabels[pet.rarity]) errors.push('invalid rarity')
  if (!Number.isFinite(Number(pet.price)) || Number(pet.price) <= 0) errors.push('price must be positive')
  if (!['PHP', 'USD'].includes(pet.currency)) errors.push('currency must be PHP or USD')
  if (pet.is_neon && pet.is_mega_neon) errors.push('Neon and Mega cannot be combined')
  return { ...pet, rowNumber: index + 2, error: errors.join(', ') }
}

export default function PetImport({ onClose, onImport, submitting }) {
  const [pets, setPets] = useState([])
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')

  const selectFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError(''); setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      try { setPets(parseCsv(String(reader.result)).map(normalizeRow)) }
      catch (parseError) { setPets([]); setError(parseError.message) }
    }
    reader.onerror = () => setError('Could not read that file')
    reader.readAsText(file)
  }

  const invalidCount = pets.filter((pet) => pet.error).length
  const validPets = pets.filter((pet) => !pet.error).map(({ rowNumber, error: _error, ...pet }) => ({ ...pet, price: Number(pet.price) }))

  return <div className="space-y-5">
    <div className="import-upload-zone rounded-2xl border border-dashed border-[#ff735c]/60 bg-[#fff8f5] p-5 text-center">
      <FileUp className="mx-auto text-[#e73d8b]" size={28} />
      <p className="mt-2 font-bold text-ink">Choose a CSV file</p>
      <p className="mt-1 text-xs leading-5 text-moss">Columns: name, rarity, price, currency, is_neon, is_mega_neon, is_flyable, is_rideable</p>
      <label className="button button-secondary mt-4 inline-flex cursor-pointer"><Upload size={16} /> {fileName || 'Select CSV'}<input type="file" accept=".csv,text/csv" onChange={selectFile} className="sr-only" /></label>
    </div>
    {error && <p className="rounded-xl bg-[#fff0ed] px-4 py-3 text-sm font-bold text-[#c04431]">{error}</p>}
    {pets.length > 0 && <div className="space-y-3">
      <div className="flex items-center justify-between text-sm"><span className="font-bold text-ink">{pets.length} rows found</span><span className={invalidCount ? 'text-[#c04431]' : 'text-[#287d4b]'}>{invalidCount ? `${invalidCount} need fixing` : 'All rows valid'}</span></div>
      <div className="max-h-56 overflow-auto rounded-xl border border-ink/10"><table className="w-full text-left text-xs"><thead className="import-table-head sticky top-0 bg-[#f4f2ec] text-moss"><tr><th className="px-3 py-2">Row</th><th className="px-3 py-2">Pet</th><th className="px-3 py-2">Price</th><th className="px-3 py-2">Status</th></tr></thead><tbody>{pets.map((pet) => <tr key={pet.rowNumber} className="border-t border-ink/10"><td className="px-3 py-2">{pet.rowNumber}</td><td className="px-3 py-2 font-bold">{pet.name || 'Unnamed'}</td><td className="px-3 py-2">{pet.currency} {pet.price || '-'}</td><td className={`px-3 py-2 ${pet.error ? 'text-[#c04431]' : 'text-[#287d4b]'}`}>{pet.error || <Check size={15} />}</td></tr>)}</tbody></table></div>
    </div>}
    <div className="flex justify-end gap-3 border-t border-ink/10 pt-5"><button type="button" className="button button-quiet" onClick={onClose}><X size={16} /> Cancel</button><button type="button" className="button button-primary" disabled={!validPets.length || invalidCount > 0 || submitting} onClick={() => onImport(validPets)}>{submitting && <LoaderCircle size={16} className="animate-spin" />}{submitting ? 'Importing...' : `Import ${validPets.length || ''} pets`}</button></div>
  </div>
}