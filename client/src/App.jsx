import { useEffect, useState } from 'react'
import { LogIn, LogOut, Plus, Search, SlidersHorizontal, PawPrint, ArrowDownUp, RefreshCw, X, Sparkles, ShieldCheck, LockKeyhole, ArrowDown, ExternalLink, Moon, Sun, CheckCircle2, LoaderCircle } from 'lucide-react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { api, getToken, logout } from './lib/api.js'
import Modal from './components/Modal.jsx'
import PetCard from './components/PetCard.jsx'
import PetForm from './components/PetForm.jsx'

const emptyFilters = { search: '', rarity: '', category: '', sort: 'updated' }

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('petfolio_theme') || 'light')
  const toggleTheme = () => setTheme((current) => current === 'light' ? 'dark' : 'light')
  useEffect(() => { localStorage.setItem('petfolio_theme', theme) }, [theme])
  return { theme, toggleTheme }
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return <button type="button" onClick={onToggle} aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`} title={`Switch to ${isDark ? 'light' : 'dark'} mode`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-white/20">{isDark ? <Sun size={18} /> : <Moon size={18} />}</button>
}

function Login() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const submit = async (event) => {
    event.preventDefault(); setError(''); setSuccess(''); setLoading(true)
    try {
      const { token } = await api.login(password)
      localStorage.setItem('petfolio_token', token)
      setSuccess('Login successful')
      setTimeout(() => {
        setModalOpen(false)
        navigate('/', { replace: true })
      }, 900)
    } catch {
      setError('Incorrect password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={`min-h-screen bg-canvas ${theme === 'dark' ? 'theme-dark' : ''}`}>
      <header className="flex items-center justify-between gap-4 bg-[#1f2326]/95 px-5 py-4 backdrop-blur sm:px-9">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f2326] text-mint"><PawPrint size={18} strokeWidth={2.5} /></span>
          <span className="font-display text-xl font-extrabold text-white sm:text-2xl">Petfolio</span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#ff5f9d] to-[#e73d8b] px-5 py-3 font-bold text-white shadow-lg shadow-[#db4e8a]/25 transition hover:-translate-y-0.5" onClick={() => setModalOpen(true)}><LogIn size={17} /> Log in</button>
        </div>
      </header>

      <section className="flex min-h-[calc(100vh-76px)] flex-col items-center justify-center bg-canvas px-5 pb-16 pt-10">
        <div className="mb-5 text-center">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[.16em] text-[#e73d8b]">Private collection</p>
          <h1 className="landing-welcome-title font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight text-[#1f2326]">Welcome to Petfolio</h1>
          <p className="landing-welcome-description mt-3 text-base text-[#687277]">Your calm corner for keeping every pet value in one place.</p>
        </div>

        <div className="flex w-full max-w-[900px] items-center justify-center">
          <img
            src="/images/Front.png"
            alt="Adopt Me style pet scene"
            className="block w-full max-w-[820px] object-contain drop-shadow-[0_20px_30px_rgba(26,35,38,0.12)]"
          />
        </div>

        <a className="group relative mt-6 inline-flex animate-float rounded-xl before:absolute before:inset-0 before:translate-y-3 before:rounded-xl before:border-4 before:border-white before:bg-white before:transition-transform before:duration-100 group-hover:before:translate-y-4 group-active:animate-none group-active:before:translate-y-0" href="https://www.roblox.com/" target="_blank" rel="noopener noreferrer" aria-label="Open Roblox">
          <img src="/images/button.png" alt="Unlock collection" className="relative z-10 block w-[180px] rounded-xl bg-white shadow-[0_8px_16px_rgba(0,0,0,0.12)] transition-transform duration-100 group-hover:-translate-y-1 group-active:translate-y-3" />
        </a>

        <p className="mt-3 text-xs text-[#687277]">A personal admin space · keep it yours</p>
      </section>

      <div className="cloud-divider relative z-10 h-28 overflow-visible bg-transparent sm:h-36">
        <img src="/images/cloud.png" alt="Cloud divider" className="cloud-divider-image absolute" />
      </div>

      <section className="landing-feature-band relative overflow-hidden bg-[#1f2326] px-5 py-20 text-white sm:px-10 lg:px-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[.2em] text-[#ff5f9d]">Made for your collection</p>
            <h2 className="max-w-2xl font-display text-4xl font-bold leading-tight sm:text-6xl">Keep every value <span className="text-[#ff5f9d]">beautifully</span> close.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#c7d0cd]">A private place to remember what your pets are worth, spot special variants, and stay ready when the next trade appears.</p>
            <a className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#ff5f9d] to-[#e73d8b] px-5 py-3 font-bold text-white shadow-lg shadow-[#db4e8a]/25 transition hover:-translate-y-1" href="#features">Explore Petfolio <ArrowDown size={17} /></a>
          </div>
          <div className="relative rounded-[2rem] border border-white/10 bg-[#2a3033] p-3 shadow-2xl shadow-black/20">
            <img src="/images/owner.png" alt="Petfolio collection artwork" className="h-72 w-full rounded-[1.5rem] object-cover object-center sm:h-96" />
          </div>
        </div>
      </section>

      <div className="tree-divider relative z-10 -mt-24 mb-0 flex h-64 items-center justify-center overflow-hidden sm:-mt-32 sm:h-80">
        <img src="/images/tree.png" alt="Decorative tree divider" className="relative z-10 h-full w-full max-w-none object-cover object-center" />
      </div>

      <section id="features" className="bg-canvas px-5 py-20 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[.2em] text-[#e73d8b]">A calmer way to track</p>
            <h2 className="font-display text-4xl font-bold leading-tight text-[#1f2326] sm:text-5xl">Everything you need, nothing in the way.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <article className="rounded-3xl bg-white p-7 shadow-[0_16px_40px_rgba(23,33,31,.07)] transition hover:-translate-y-1">
              <span className="mb-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffe1ed] text-[#e73d8b]"><Sparkles size={23} /></span>
              <h3 className="font-display text-2xl font-bold text-[#1f2326]">Know your values</h3>
              <p className="mt-3 text-sm leading-6 text-[#687277]">Keep prices, rarities, and notes together so your collection is easy to scan.</p>
            </article>
            <article className="rounded-3xl bg-[#b9f3d0] p-7 shadow-[0_16px_40px_rgba(23,33,31,.07)] transition hover:-translate-y-1">
              <span className="mb-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-[#456453]"><ShieldCheck size={23} /></span>
              <h3 className="font-display text-2xl font-bold text-[#1f2326]">Keep it private</h3>
              <p className="mt-3 text-sm leading-6 text-[#456453]">Your collection stays behind your admin login, exactly where it belongs.</p>
            </article>
            <article className="rounded-3xl bg-[#ffe1ed] p-7 shadow-[0_16px_40px_rgba(23,33,31,.07)] transition hover:-translate-y-1">
              <span className="mb-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-[#b92b68]"><LockKeyhole size={23} /></span>
              <h3 className="font-display text-2xl font-bold text-[#1f2326]">Ready for trades</h3>
              <p className="mt-3 text-sm leading-6 text-[#b92b68]">Open your tracker quickly whenever a trade, update, or new pet comes up.</p>
            </article>
          </div>
        </div>
      </section>

      <div className="footer-log-divider relative z-10 h-32 overflow-hidden sm:h-40"><img src="/images/log.png" alt="Wooden divider" className="h-full w-full object-cover object-center" /></div>
      <footer className="bg-[#1f2326] px-5 py-16 text-white sm:px-10 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-12 md:flex-row md:items-center">
            <div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#ff5f9d]">Your pets are waiting</p><h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Start your collection.</h2></div>
            <a className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#ff5f9d] to-[#e73d8b] px-6 py-3 font-bold text-white shadow-lg shadow-[#db4e8a]/25 transition hover:-translate-y-1" href="https://www.roblox.com/" target="_blank" rel="noopener noreferrer">Visit Roblox <ExternalLink size={17} /></a>
          </div>
          <div className="flex flex-col justify-between gap-5 pt-8 text-sm text-[#aebbb6] sm:flex-row"><span className="font-display text-lg font-bold text-white">Petfolio</span><span>Private collection tracker · built for your Adopt Me journey</span></div>
        </div>
      </footer>

      {modalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#1f2326]/45 p-6 backdrop-blur" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}>
          <div className="theme-login-modal relative w-full max-w-[420px] rounded-3xl bg-white p-6 shadow-2xl shadow-[#1f2326]/25">
            <button type="button" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f1f1] text-[#1f2326] transition hover:bg-[#ffe1ed] hover:text-[#e73d8b]" onClick={() => setModalOpen(false)} aria-label="Close login dialog">
              <X size={18} />
            </button>

            <form onSubmit={submit} className="flex flex-col gap-4 pt-3">
              <label className="block text-xs font-extrabold uppercase tracking-[.14em] text-[#456453]">
                <span className="mb-2 block">Admin password</span>
                <div className="relative">
                  <input
                    autoFocus
                    required
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="min-h-[56px] w-full rounded-2xl border border-[#ff735c]/70 bg-[#fafafa] px-4 pr-16 text-base font-medium normal-case tracking-normal text-[#1f2326] outline-none transition placeholder:text-[#9ba7b0] focus:border-[#e73d8b] focus:ring-4 focus:ring-[#e73d8b]/15"
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 border-0 bg-transparent text-xs font-extrabold uppercase tracking-normal text-[#ff735c] transition hover:text-[#e73d8b]" onClick={() => setShow(!show)}>
                    {show ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {error && <p className="text-xs font-bold text-[#c04431]">{error}</p>}

              <button className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#ff5f9d] to-[#e73d8b] font-bold text-white shadow-lg shadow-[#db4e8a]/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-wait disabled:opacity-[.65]" disabled={loading}>
                <LogIn size={18} />
                {loading ? 'Checking...' : 'Unlock collection'}
              </button>
            </form>
          </div>
        </div>
      )}
      {success && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2326]/45 p-6 backdrop-blur-sm"><div className="flex w-full max-w-xs flex-col items-center rounded-3xl bg-white px-8 py-9 text-center shadow-2xl shadow-[#db4e8a]/25"><LoaderCircle size={42} className="animate-spin text-[#e73d8b]" /><CheckCircle2 size={22} className="mt-4 text-[#e73d8b]" /><p className="mt-2 font-display text-xl font-bold text-[#1f2326]">{success}</p><p className="mt-1 text-sm text-[#687277]">Opening your collection...</p></div></div>}
    </main>
  )
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
  const { theme, toggleTheme } = useTheme()

  const loadPets = async () => { setLoading(true); try { setPets(await api.listPets(filters)) } catch (error) { showToast(error.message, 'error') } finally { setLoading(false) } }
  useEffect(() => { loadPets() }, [filters])
  useEffect(() => { const expire = () => navigate('/login', { replace: true }); window.addEventListener('auth-expired', expire); return () => window.removeEventListener('auth-expired', expire) }, [navigate])
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(null), 3200); return () => clearTimeout(timer) }, [toast])
  const showToast = (message, type = 'success') => setToast({ message, type })
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  const handleSave = async (data) => { if (data?.__logout) { logout(); navigate('/login', { replace: true }); return }; setSubmitting(true); try { if (modal?.pet) { await api.updatePet(modal.pet.id, data); showToast('Pet details updated') } else { await api.createPet(data); showToast('Pet added to your collection') }; setModal(null); await loadPets() } catch (error) { showToast(error.message, 'error') } finally { setSubmitting(false) } }
  const handleDelete = async (pet) => { if (!window.confirm(`Are you sure you want to delete ${pet.name}?`)) return; try { await api.deletePet(pet.id); showToast(`${pet.name} removed`); await loadPets() } catch (error) { showToast(error.message, 'error') } }
  const signOut = () => setModal({ type: 'edit', pet: { __logout: true, name: 'Log out?' } })
  return <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : ''}`}><header className="topbar !h-auto !bg-[#1f2326] !px-[clamp(1.2rem,3vw,2.2rem)] !py-[1.1rem] text-white"><div className="brand !gap-3 !font-display !text-[clamp(1.2rem,2vw,2rem)] !font-extrabold"><span className="brand-icon !h-9 !w-9 !rounded-xl !bg-[#1f2326] text-mint"><PawPrint size={18} /></span><span>Petfolio</span></div><div className="topbar-right"><span className="hidden text-sm text-[#b8c9c0] sm:inline">Private price tracker</span><ThemeToggle theme={theme} onToggle={toggleTheme} /><button className="flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#ff5f9d] to-[#e73d8b] px-4 py-2.5 font-bold text-white shadow-lg shadow-[#db4e8a]/25 transition hover:-translate-y-0.5" onClick={signOut}><LogOut size={16} /> Log out</button></div></header><main className="page-wrap"><section className="hero-row"><div><p className="eyebrow">Your collection</p><h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">Pet values, <span className="text-coral">beautifully</span> kept.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-moss sm:text-base">A living snapshot of your Adopt Me collection, ready whenever a trade comes up.</p></div><button className="button button-primary shrink-0" onClick={() => setModal({ type: 'add' })}><Plus size={18} /> Add pet</button></section><section className="stat-strip"><div><span className="stat-number">{pets.length}</span><span className="stat-label">Showing pets</span></div><div className="stat-divider" /><div><span className="stat-number">{new Set(pets.map((pet) => pet.rarity)).size}</span><span className="stat-label">Rarity tiers</span></div><div className="stat-divider" /><div className="hidden sm:block"><span className="stat-number">{pets.filter((pet) => pet.is_neon || pet.is_mega_neon).length}</span><span className="stat-label">Special variants</span></div><div className="ml-auto hidden sm:block"><button className="icon-button" title="Refresh collection" onClick={loadPets}><RefreshCw size={17} /></button></div></section><section className="toolbar"><div className="search-wrap"><Search size={18} /><input value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} placeholder="Search your pets..." /><button className="clear-search" onClick={() => updateFilter('search', '')} hidden={!filters.search}><X size={15} /></button></div><div className="filter-row"><div className="select-wrap"><SlidersHorizontal size={15} /><select value={filters.rarity} onChange={(e) => updateFilter('rarity', e.target.value)}><option value="">All rarities</option><option value="common">Common</option><option value="uncommon">Uncommon</option><option value="rare">Rare</option><option value="ultra_rare">Ultra-Rare</option><option value="legendary">Legendary</option></select></div><div className="select-wrap"><select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}><option value="">All variants</option><option value="neon">Neon</option><option value="mega">Mega Neon</option><option value="fly">Fly</option><option value="ride">Ride</option><option value="fly_ride">Fly + Ride</option></select></div><div className="select-wrap"><ArrowDownUp size={15} /><select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}><option value="updated">Recently updated</option><option value="name">Name A-Z</option><option value="priceAsc">Price low-high</option><option value="priceDesc">Price high-low</option></select></div></div></section>{loading ? <div className="empty-state"><RefreshCw className="animate-spin text-coral" /><p>Gathering your collection...</p></div> : pets.length ? <div className="pet-grid">{pets.map((pet) => <PetCard key={pet.id} pet={pet} onEdit={(selected) => setModal({ type: 'edit', pet: selected })} onDelete={handleDelete} />)}</div> : <div className="empty-state"><div className="empty-icon"><PawPrint size={27} /></div><h2 className="font-display text-2xl font-bold text-ink">No pets here yet</h2><p className="max-w-xs text-center text-sm leading-6 text-moss">{filters.search || filters.rarity || filters.category ? 'Try adjusting your filters to find what you are looking for.' : 'Add your first pet and start building your collection.'}</p>{!filters.search && !filters.rarity && !filters.category && <button className="button button-secondary mt-2" onClick={() => setModal({ type: 'add' })}><Plus size={17} /> Add first pet</button>}</div>}</main>{modal && <Modal eyebrow={modal.type === 'edit' ? 'Edit listing' : 'New listing'} title={modal.type === 'edit' ? `Update ${modal.pet.name}` : 'Add a pet'} onClose={() => setModal(null)}><PetForm pet={modal.pet} onSubmit={handleSave} onCancel={() => setModal(null)} submitting={submitting} /></Modal>}{toast && <div className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`}>{toast.message}</div>}</div>
}

export default function App() { return <Routes><Route path="/login" element={<Login />} /><Route path="*" element={<Protected><Dashboard /></Protected>} /></Routes> }
