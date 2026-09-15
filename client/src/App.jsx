import { useEffect, useState } from 'react'
import { LogOut, Plus, Search, SlidersHorizontal, PawPrint, ArrowDownUp, RefreshCw, X } from 'lucide-react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { api, getToken, logout } from './lib/api.js'
import Modal from './components/Modal.jsx'
import PetCard from './components/PetCard.jsx'
import PetForm from './components/PetForm.jsx'

const emptyFilters = { search: '', rarity: '', category: '', sort: 'updated' }

function Login() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true)
    try { const { token } = await api.login(password); localStorage.setItem('petfolio_token', token); navigate('/', { replace: true }) }
    catch { setError('Incorrect password') } finally { setLoading(false) }
  }
  return <main className="login-shell"><div className="login-mark"><PawPrint size={24} strokeWidth={2.5} /></div><p className="eyebrow text-center">Private collection</p><h1 className="mt-3 text-center font-display text-4xl font-bold text-ink">Welcome to Petfolio</h1><p className="mx-auto mt-3 max-w-xs text-center text-sm leading-6 text-moss">Your calm corner for keeping every pet value in one place.</p><form onSubmit={submit} className="login-card mt-8"><label className="field"><span>Admin password</span><div className="relative"><input autoFocus required type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="pr-16" /><button type="button" className="password-toggle" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button></div></label>{error && <p className="error-message">{error}</p>}<button className="button button-primary mt-5 w-full" disabled={loading}>{loading ? 'Checking...' : 'Unlock collection'}</button></form><p className="mt-6 text-center text-xs text-moss/70">A personal admin space · keep it yours</p></main>
}

function Protected({ children }) { return getToken() ? children : <Navigate to="/login" replace /> }

function Dashboard() {
  const navigate = useNavigate()
  const [pets, setPets] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadPets = async () => { setLoading(true); try { setPets(await api.listPets(filters)) } catch (error) { showToast(error.message, 'error') } finally { setLoading(false) } }
  useEffect(() => { loadPets() }, [filters])
  useEffect(() => { const expire = () => navigate('/login', { replace: true }); window.addEventListener('auth-expired', expire); return () => window.removeEventListener('auth-expired', expire) }, [navigate])
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(null), 3200); return () => clearTimeout(timer) }, [toast])
  const showToast = (message, type = 'success') => setToast({ message, type })
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  const handleSave = async (data) => { setSubmitting(true); try { if (modal?.pet) { await api.updatePet(modal.pet.id, data); showToast('Pet details updated') } else { await api.createPet(data); showToast('Pet added to your collection') }; setModal(null); await loadPets() } catch (error) { showToast(error.message, 'error') } finally { setSubmitting(false) } }
  const handleDelete = async (pet) => { if (!window.confirm(`Are you sure you want to delete ${pet.name}?`)) return; try { await api.deletePet(pet.id); showToast(`${pet.name} removed`); await loadPets() } catch (error) { showToast(error.message, 'error') } }
  const signOut = () => { logout(); navigate('/login', { replace: true }) }
  return <div className="app-shell"><header className="topbar"><div className="brand"><span className="brand-icon"><PawPrint size={19} /></span><span>Petfolio</span></div><div className="topbar-right"><span className="hidden text-sm text-moss sm:inline">Private price tracker</span><button className="logout-button" onClick={signOut}><LogOut size={16} /> Log out</button></div></header><main className="page-wrap"><section className="hero-row"><div><p className="eyebrow">Your collection</p><h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">Pet values, <span className="text-coral">beautifully</span> kept.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-moss sm:text-base">A living snapshot of your Adopt Me collection, ready whenever a trade comes up.</p></div><button className="button button-primary shrink-0" onClick={() => setModal({ type: 'add' })}><Plus size={18} /> Add pet</button></section><section className="stat-strip"><div><span className="stat-number">{pets.length}</span><span className="stat-label">Showing pets</span></div><div className="stat-divider" /><div><span className="stat-number">{new Set(pets.map((pet) => pet.rarity)).size}</span><span className="stat-label">Rarity tiers</span></div><div className="stat-divider" /><div className="hidden sm:block"><span className="stat-number">{pets.filter((pet) => pet.is_neon || pet.is_mega_neon).length}</span><span className="stat-label">Special variants</span></div><div className="ml-auto hidden sm:block"><button className="icon-button" title="Refresh collection" onClick={loadPets}><RefreshCw size={17} /></button></div></section><section className="toolbar"><div className="search-wrap"><Search size={18} /><input value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} placeholder="Search your pets..." /><button className="clear-search" onClick={() => updateFilter('search', '')} hidden={!filters.search}><X size={15} /></button></div><div className="filter-row"><div className="select-wrap"><SlidersHorizontal size={15} /><select value={filters.rarity} onChange={(e) => updateFilter('rarity', e.target.value)}><option value="">All rarities</option><option value="common">Common</option><option value="uncommon">Uncommon</option><option value="rare">Rare</option><option value="ultra_rare">Ultra-Rare</option><option value="legendary">Legendary</option></select></div><div className="select-wrap"><select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}><option value="">All variants</option><option value="neon">Neon</option><option value="mega">Mega Neon</option><option value="fly">Fly</option><option value="ride">Ride</option><option value="fly_ride">Fly + Ride</option></select></div><div className="select-wrap"><ArrowDownUp size={15} /><select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}><option value="updated">Recently updated</option><option value="name">Name A-Z</option><option value="priceAsc">Price low-high</option><option value="priceDesc">Price high-low</option></select></div></div></section>{loading ? <div className="empty-state"><RefreshCw className="animate-spin text-coral" /><p>Gathering your collection...</p></div> : pets.length ? <div className="pet-grid">{pets.map((pet) => <PetCard key={pet.id} pet={pet} onEdit={(selected) => setModal({ type: 'edit', pet: selected })} onDelete={handleDelete} />)}</div> : <div className="empty-state"><div className="empty-icon"><PawPrint size={27} /></div><h2 className="font-display text-2xl font-bold text-ink">No pets here yet</h2><p className="max-w-xs text-center text-sm leading-6 text-moss">{filters.search || filters.rarity || filters.category ? 'Try adjusting your filters to find what you are looking for.' : 'Add your first pet and start building your collection.'}</p>{!filters.search && !filters.rarity && !filters.category && <button className="button button-secondary mt-2" onClick={() => setModal({ type: 'add' })}><Plus size={17} /> Add first pet</button>}</div>}</main>{modal && <Modal eyebrow={modal.type === 'edit' ? 'Edit listing' : 'New listing'} title={modal.type === 'edit' ? `Update ${modal.pet.name}` : 'Add a pet'} onClose={() => setModal(null)}><PetForm pet={modal.pet} onSubmit={handleSave} onCancel={() => setModal(null)} submitting={submitting} /></Modal>}{toast && <div className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`}>{toast.message}</div>}</div>
}

export default function App() { return <Routes><Route path="/login" element={<Login />} /><Route path="*" element={<Protected><Dashboard /></Protected>} /></Routes> }
