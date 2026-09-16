import { useEffect, useRef, useState } from 'react'
import { LogIn, LogOut, Plus, Search, SlidersHorizontal, PawPrint, ArrowDownUp, RefreshCw, X, Sparkles, ShieldCheck, LockKeyhole, ArrowDown, ExternalLink, Moon, Sun, CheckCircle2, LoaderCircle, Play, Instagram, Github, Facebook, Upload } from 'lucide-react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { api, getToken, logout } from './lib/api.js'
import Modal from './components/Modal.jsx'
import PetCard from './components/PetCard.jsx'
import PetForm from './components/PetForm.jsx'
import PetImport from './components/PetImport.jsx'

const emptyFilters = { search: '', rarity: '', category: '', sort: 'updated' }

function DiscordIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[22px] w-[22px] fill-current"><path d="M19.54 5.07a16.9 16.9 0 0 0-4.12-1.27.06.06 0 0 0-.06.03c-.18.32-.38.74-.52 1.07a15.6 15.6 0 0 0-5.68 0c-.14-.34-.34-.75-.53-1.07a.06.06 0 0 0-.06-.03c-1.46.25-2.84.68-4.12 1.27a.05.05 0 0 0-.02.02C1.8 9.22 1.08 13.26 1.44 17.25a.07.07 0 0 0 .03.05 16.97 16.97 0 0 0 5.08 2.54.07.07 0 0 0 .08-.03c.39-.54.74-1.1 1.04-1.69a.07.07 0 0 0-.04-.1 11.2 11.2 0 0 1-1.59-.76.07.07 0 0 1-.01-.11c.11-.08.22-.17.33-.25a.06.06 0 0 1 .06-.01c3.33 1.52 6.94 1.52 10.23 0a.06.06 0 0 1 .06.01c.11.08.22.17.33.25a.07.07 0 0 1-.01.11c-.51.3-1.04.55-1.59.76a.07.07 0 0 0-.04.1c.31.59.65 1.15 1.04 1.69a.07.07 0 0 0 .08.03 16.93 16.93 0 0 0 5.09-2.54.07.07 0 0 0 .03-.05c.43-4.62-.73-8.63-3.06-12.16a.05.05 0 0 0-.02-.02ZM8.02 14.7c-1 0-1.83-.92-1.83-2.05s.81-2.05 1.83-2.05c1.03 0 1.84.93 1.83 2.05 0 1.13-.81 2.05-1.83 2.05Zm7.96 0c-1.01 0-1.83-.92-1.83-2.05s.81-2.05 1.83-2.05c1.03 0 1.84.93 1.83 2.05 0 1.13-.81 2.05-1.83 2.05Z" /></svg>
}

function TikTokIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[22px] w-[22px] fill-current"><path d="M16.6 3c.2 1.7 1.2 2.8 2.9 2.9v2.8a7.2 7.2 0 0 1-2.9-.7v5.8a5.2 5.2 0 1 1-4.5-5.2v2.9a2.4 2.4 0 1 0 1.7 2.3V3h2.8Z" /></svg>
}

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
  const [welcomeText, setWelcomeText] = useState('')
  const [openingTracker, setOpeningTracker] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(true)
  const videoRef = useRef(null)

  useEffect(() => {
    const fullText = 'Welcome to Petfolio'
    let index = 0
    const timer = setInterval(() => {
      index += 1
      setWelcomeText(fullText.slice(0, index))
      if (index === fullText.length) clearInterval(timer)
    }, 75)
    return () => clearInterval(timer)
  }, [])

  const toggleVideo = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) videoRef.current.play().catch(() => {})
    else videoRef.current.pause()
  }

  const openTracker = () => {
    setOpeningTracker(true)
    setTimeout(() => navigate('/'), 700)
  }

  useEffect(() => {
    const revealItems = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.18 })
    revealItems.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

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
    <main className={`min-h-screen bg-canvas ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <header className="flex items-center justify-between gap-4 bg-[#1f2326]/95 px-5 py-4 backdrop-blur sm:px-9">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f2326] text-mint"><PawPrint size={18} strokeWidth={2.5} /></span>
          <div className="landing-brand-stack flex items-center gap-2">
            <span className="font-display text-xl font-extrabold text-white sm:text-2xl">Petfolio</span>
            <span className="landing-version rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d5e7df]">v1.0.0</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button type="button" className="landing-login-button landing-open-tracker" onClick={openTracker} disabled={openingTracker}>
            <span className="dashboard-action-icon"><LogIn size={16} /></span>
            <span>Open Tracker</span>
          </button>
        </div>
      </header>

      <section className={`landing-hero ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
        <video
          ref={videoRef}
          className="landing-video"
          autoPlay
          muted
          loop
          playsInline
          onPlay={() => setVideoPlaying(true)}
          onPause={() => setVideoPlaying(false)}
          aria-hidden="true"
        >
          <source src="/videos/ADOPT%20ME!%20Official%20Game%20Trailer%20%F0%9F%90%BE.mp4" type="video/mp4" />
        </video>
        <div className="landing-video-overlay" aria-hidden="true" />
        <button type="button" className="landing-video-toggle" onClick={toggleVideo} aria-label={videoPlaying ? 'Pause background video' : 'Play background video'} title={videoPlaying ? 'Pause background video' : 'Play background video'}>
          {videoPlaying ? '||' : '▶'}
        </button>
        <div className="landing-hero-bg" aria-hidden="true">
          <span className="orb orb-one" />
          <span className="orb orb-two" />
          <span className="orb orb-three" />
        </div>

        <div className="landing-hero-inner">
          <div className="landing-reveal landing-reveal-up hero-copy" data-reveal>
            <p className="hero-kicker">Private collection</p>
            <h1 className="landing-welcome-title font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight text-[#1f2326]">{welcomeText}<span className="typing-caret" aria-hidden="true" /></h1>
            <p className="landing-welcome-description mt-3 text-base text-[#687277]">Your polished collection hub for tracking pet values, keeping notes, and staying ready for your next big trade.</p>
            <div className="hero-actions">
              <a href="https://www.roblox.com/" target="_blank" rel="noopener noreferrer" className="hero-primary hero-play-button">
                <span className="hero-play-icon"><Play size={12} fill="currentColor" /></span>
                <span>Play</span>
              </a>
              <a href="#features" className="hero-secondary">Explore features</a>
            </div>
          </div>

          <div className="landing-reveal landing-reveal-scale hero-visual" data-reveal>
            <div className="floating-card floating-card-main">
              <span className="mini-label">Tracked pets</span>
              <strong>3.2k</strong>
              <small>Updated this week</small>
            </div>

            <img
              src="/images/Front.png"
              alt="Adopt Me style pet scene"
              className="hero-image"
            />

            <div className="floating-card floating-card-secondary">
              <span className="mini-label">Best value</span>
              <strong>+18.4%</strong>
              <small>Recent growth</small>
            </div>
          </div>
        </div>

        <div className="landing-stats landing-reveal landing-reveal-up" data-reveal>
          <div>
            <span className="stat-number">1.2k</span>
            <span className="stat-label">pet entries</span>
          </div>
          <div>
            <span className="stat-number">96%</span>
            <span className="stat-label">organization</span>
          </div>
          <div>
            <span className="stat-number">24/7</span>
            <span className="stat-label">collection access</span>
          </div>
        </div>
      </section>

      <div className="cloud-divider relative z-10 h-28 overflow-visible bg-transparent sm:h-36">
        <img src="/images/cloud.png" alt="Cloud divider" className="cloud-divider-image absolute" />
      </div>

      <section className="landing-feature-band relative overflow-hidden bg-[#1f2326] px-5 py-20 text-white sm:px-10 lg:px-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div className="landing-reveal landing-reveal-left" data-reveal>
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[.2em] text-[#ff5f9d]">Made for your collection</p>
            <h2 className="max-w-2xl font-display text-4xl font-bold leading-tight sm:text-6xl">Keep every value <span className="text-[#ff5f9d]">beautifully</span> close.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#c7d0cd]">A private place to remember what your pets are worth, spot special variants, and stay ready when the next trade appears.</p>
            <a className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#ff5f9d] to-[#e73d8b] px-5 py-3 font-bold text-white shadow-lg shadow-[#db4e8a]/25 transition hover:-translate-y-1" href="#features">Explore Petfolio <ArrowDown size={17} /></a>
          </div>
          <div className="landing-reveal landing-reveal-right relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/10 bg-[#2a3033] p-3 shadow-2xl shadow-black/20" data-reveal>
            <img src="/images/owner.png" alt="Petfolio collection artwork" className="h-full w-full rounded-[1.5rem] object-cover object-center" />
          </div>
        </div>
      </section>

      <div className="tree-divider relative z-10 mt-0 mb-0 flex h-64 items-center justify-center overflow-hidden sm:mt-0 sm:h-80">
        <img src="/images/tree.png" alt="Decorative tree divider" className="relative z-10 h-full w-full max-w-none object-cover object-center" />
      </div>

      <section id="features" className="bg-canvas px-5 py-20 sm:px-10 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="landing-reveal landing-reveal-up mb-10 max-w-2xl" data-reveal>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[.2em] text-[#e73d8b]">A calmer way to track</p>
            <h2 className="font-display text-4xl font-bold leading-tight text-[#1f2326] sm:text-5xl">Everything you need, nothing in the way.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <article className="landing-reveal landing-reveal-up landing-reveal-delay-1 rounded-3xl bg-white p-7 shadow-[0_16px_40px_rgba(23,33,31,.07)] transition hover:-translate-y-1" data-reveal>
              <span className="mb-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffe1ed] text-[#e73d8b]"><Sparkles size={23} /></span>
              <h3 className="font-display text-2xl font-bold text-[#1f2326]">Build your collection</h3>
              <p className="mt-3 text-sm leading-6 text-[#687277]">Add pets, update their values, and remove old listings whenever your collection changes.</p>
            </article>
            <article className="landing-reveal landing-reveal-up landing-reveal-delay-2 rounded-3xl bg-[#b9f3d0] p-7 shadow-[0_16px_40px_rgba(23,33,31,.07)] transition hover:-translate-y-1" data-reveal>
              <span className="mb-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-[#456453]"><PawPrint size={23} /></span>
              <h3 className="font-display text-2xl font-bold text-[#1f2326]">See every pet clearly</h3>
              <p className="mt-3 text-sm leading-6 text-[#456453]">Give each listing a compact card with a full pet image, value, life stage, and quick actions.</p>
            </article>
            <article className="landing-reveal landing-reveal-up landing-reveal-delay-3 rounded-3xl bg-[#ffe1ed] p-7 shadow-[0_16px_40px_rgba(23,33,31,.07)] transition hover:-translate-y-1" data-reveal>
              <span className="mb-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-[#b92b68]"><ShieldCheck size={23} /></span>
              <h3 className="font-display text-2xl font-bold text-[#1f2326]">Track rarities and variants</h3>
              <p className="mt-3 text-sm leading-6 text-[#b92b68]">Highlight Common through Legendary pets and mark Neon, Mega, Fly, and Ride at a glance.</p>
            </article>
            <article className="landing-reveal landing-reveal-up landing-reveal-delay-1 rounded-3xl bg-white p-7 shadow-[0_16px_40px_rgba(23,33,31,.07)] transition hover:-translate-y-1" data-reveal>
              <span className="mb-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e1f3ff] text-[#168dca]"><Search size={23} /></span>
              <h3 className="font-display text-2xl font-bold text-[#1f2326]">Find pets fast</h3>
              <p className="mt-3 text-sm leading-6 text-[#687277]">Search by name, filter by rarity or variant, and sort your collection by name, price, or latest update.</p>
            </article>
            <article className="landing-reveal landing-reveal-up landing-reveal-delay-2 rounded-3xl bg-[#fff0c7] p-7 shadow-[0_16px_40px_rgba(23,33,31,.07)] transition hover:-translate-y-1" data-reveal>
              <span className="mb-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-[#c77900]"><RefreshCw size={23} /></span>
              <h3 className="font-display text-2xl font-bold text-[#1f2326]">Ready on every screen</h3>
              <p className="mt-3 text-sm leading-6 text-[#765719]">Use the tracker comfortably on phones, tablets, laptops, and desktop screens with a responsive card grid.</p>
            </article>
            <article className="landing-reveal landing-reveal-up landing-reveal-delay-3 rounded-3xl bg-[#e9e4ff] p-7 shadow-[0_16px_40px_rgba(23,33,31,.07)] transition hover:-translate-y-1" data-reveal>
              <span className="mb-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-[#6348c4]"><LockKeyhole size={23} /></span>
              <h3 className="font-display text-2xl font-bold text-[#1f2326]">Share with friends</h3>
              <p className="mt-3 text-sm leading-6 text-[#6348c4]">Open the tracker with your friends so everyone can help keep the collection current.</p>
            </article>
          </div>
        </div>
      </section>

      <div className="footer-log-divider relative z-10 h-32 overflow-hidden sm:h-40"><img src="/images/log.png" alt="Wooden divider" className="h-full w-full object-cover object-center" /></div>
      <footer className="bg-[#1f2326] px-5 py-16 text-white sm:px-10 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="landing-reveal landing-reveal-up flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-12 md:flex-row md:items-center" data-reveal>
            <div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#ff5f9d]">Your pets are waiting</p><h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Start your collection.</h2></div>
            <a className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#ff5f9d] to-[#e73d8b] px-6 py-3 font-bold text-white shadow-lg shadow-[#db4e8a]/25 transition hover:-translate-y-1" href="https://www.roblox.com/" target="_blank" rel="noopener noreferrer">Visit Roblox <ExternalLink size={17} /></a>
          </div>
          <div className="flex flex-col justify-between gap-6 pt-8 text-sm text-[#aebbb6] sm:flex-row sm:items-center"><div><span className="font-display text-lg font-bold text-white">Petfolio</span><span className="ml-3">Private collection tracker · built for your Adopt Me journey</span></div><div className="flex items-center gap-3" aria-label="Social links">
            <a className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7289da] text-white transition hover:-translate-y-1 hover:brightness-110" href="https://discord.com/users/853873666285633536" target="_blank" rel="noopener noreferrer" aria-label="Discord"><DiscordIcon /></a>
            <a className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f00073] text-white transition hover:-translate-y-1 hover:brightness-110" href="https://www.instagram.com/_rlyreal" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={23} /></a>
            <a className="flex h-11 w-11 items-center justify-center rounded-full bg-[#24292f] text-white transition hover:-translate-y-1 hover:brightness-125" href="https://github.com/rlyreal" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={22} /></a>
            <a className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877f2] text-white transition hover:-translate-y-1 hover:brightness-110" href="https://www.facebook.com/realjhon.palacio.14/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={22} fill="currentColor" /></a>
            <a className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white ring-1 ring-white/20 transition hover:-translate-y-1 hover:brightness-125" href="https://www.tiktok.com/@real.adoptmeph?_r=1&_t=ZS-99lyIrGcru1" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><TikTokIcon /></a>
          </div></div>
          <p className="mt-5 text-xs text-[#84918d]">© 2026 <a className="underline decoration-[#84918d] underline-offset-2 transition hover:text-white" href="https://uplift.games/" target="_blank" rel="noopener noreferrer">Uplift Games LLC.</a> All Rights Reserved.</p>
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
                {loading ? 'Checking...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      )}
      {openingTracker && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2326]/45 p-6 backdrop-blur-sm" role="status" aria-live="polite"><div className={`flex w-full max-w-xs flex-col items-center rounded-3xl px-8 py-9 text-center shadow-2xl shadow-[#db4e8a]/25 ${theme === 'dark' ? 'bg-[#20282a] text-[#eef5f2]' : 'bg-white text-[#1f2326]'}`}><LoaderCircle size={42} className="animate-spin text-[#e73d8b]" /><p className="mt-4 font-display text-xl font-bold">Opening tracker...</p><p className={`mt-1 text-sm ${theme === 'dark' ? 'text-[#c3d0cc]' : 'text-[#687277]'}`}>Loading your collection</p></div></div>}
      {success && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2326]/45 p-6 backdrop-blur-sm"><div className="flex w-full max-w-xs flex-col items-center rounded-3xl bg-white px-8 py-9 text-center shadow-2xl shadow-[#db4e8a]/25"><LoaderCircle size={42} className="animate-spin text-[#e73d8b]" /><CheckCircle2 size={22} className="mt-4 text-[#e73d8b]" /><p className="mt-2 font-display text-xl font-bold text-[#1f2326]">{success}</p><p className="mt-1 text-sm text-[#687277]">Opening your collection...</p></div></div>}
    </main>
  )
}

function Protected({ children }) { return children }

function Dashboard() {
  const navigate = useNavigate()
  const [pets, setPets] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [exiting, setExiting] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const loadPets = async () => { setLoading(true); try { setPets(await api.listPets(filters)) } catch (error) { showToast(error.message, 'error') } finally { setLoading(false) } }
  useEffect(() => { loadPets() }, [filters])
  useEffect(() => { const expire = () => navigate('/login', { replace: true }); window.addEventListener('auth-expired', expire); return () => window.removeEventListener('auth-expired', expire) }, [navigate])
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(null), 3200); return () => clearTimeout(timer) }, [toast])
  const showToast = (message, type = 'success') => setToast({ message, type })
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  const handleSave = async (data) => { if (data?.__logout) { setExiting(true); setTimeout(() => { logout(); navigate('/login', { replace: true }) }, 700); return }; setSubmitting(true); try { if (modal?.pet) { await api.updatePet(modal.pet.id, data); showToast('Pet details updated') } else { await api.createPet(data); showToast('Pet added to your collection') }; setModal(null); await loadPets() } catch (error) { showToast(error.message, 'error') } finally { setSubmitting(false) } }
  const handleImport = async (importedPets) => { setImporting(true); try { await api.importPets(importedPets); showToast(`${importedPets.length} pets imported`); setModal(null); await loadPets() } catch (error) { showToast(error.message, 'error') } finally { setImporting(false) } }
  const handleDelete = (pet) => setPendingDelete(pet)
    const confirmDelete = async () => { if (!pendingDelete) return; const pet = pendingDelete; setPendingDelete(null); try { await api.deletePet(pet.id); showToast(`${pet.name} removed`); await loadPets() } catch (error) { showToast(error.message, 'error') } }
  const signOut = () => setModal({ type: 'edit', pet: { __logout: true, name: 'Exit?' } })
    return (
      <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : ''}`}>
        <header className="landing-header dashboard-header">
          <div className="landing-brand-wrap">
            <span className="landing-logo"><PawPrint size={18} strokeWidth={2.5} /></span>
            <div className="landing-brand-stack flex items-center gap-2">
              <span className="font-display text-xl font-extrabold text-white sm:text-2xl">Petfolio</span>
              <span className="landing-version rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#d5e7df]">v1.0.0</span>
            </div>
          </div>
          <div className="topbar-right">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
            <button className="landing-login-button dashboard-logout" onClick={signOut}>
              <span className="dashboard-action-icon"><LogOut size={16} /></span>
              <span>Exit</span>
            </button>
          </div>
        </header>
        <main className="page-wrap dashboard-wrap">
          <section className="dashboard-hero premium-panel">
            <div className="hero-copy-wrap">
              <p className="eyebrow">Your collection</p>
              <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">Pet values, <span className="text-coral">beautifully</span> kept.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-moss sm:text-base">A living snapshot of your Adopt Me collection, ready whenever a trade comes up.</p>
              <div className="hero-actions-row">
                <button className="button button-primary shrink-0" onClick={() => setModal({ type: 'add', itemType: 'pet' })}>
                  <Plus size={18} /> Add
                </button>
                <button className="button button-quiet premium-soft-button shrink-0" onClick={() => setModal({ type: 'import' })}>
                  <Upload size={17} /> Import CSV
                </button>
                <button className="button button-quiet premium-soft-button" title="Refresh collection" onClick={loadPets}>
                  <RefreshCw size={17} /> Refresh
                </button>
              </div>
            </div>
          </section>

          <section className="stat-strip premium-stat-strip">
            <div>
              <span className="stat-number">{pets.length}</span>
              <span className="stat-label">Showing pets</span>
            </div>
            <div className="stat-divider" />
            <div>
              <span className="stat-number">{new Set(pets.map((pet) => pet.rarity)).size}</span>
              <span className="stat-label">Rarity tiers</span>
            </div>
            <div className="stat-divider" />
            <div className="hidden sm:block">
              <span className="stat-number">{pets.filter((pet) => pet.is_neon || pet.is_mega_neon).length}</span>
              <span className="stat-label">Special variants</span>
            </div>
            <div className="ml-auto hidden sm:block">
              <button className="icon-button premium-icon-button" title="Refresh collection" onClick={loadPets}>
                <RefreshCw size={17} />
              </button>
            </div>
          </section>

          <section className="toolbar premium-toolbar">
            <div className="search-wrap premium-search-wrap">
              <Search size={18} />
              <input value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} placeholder="Search your pets..." />
              <button className="clear-search" onClick={() => updateFilter('search', '')} hidden={!filters.search}>
                <X size={15} />
              </button>
            </div>
            <div className="filter-row">
              <div className="select-wrap premium-select-wrap">
                <SlidersHorizontal size={15} />
                <select value={filters.rarity} onChange={(e) => updateFilter('rarity', e.target.value)}>
                  <option value="">All rarities</option>
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="ultra_rare">Ultra-Rare</option>
                  <option value="legendary">Legendary</option>
                </select>
              </div>
              <div className="select-wrap premium-select-wrap">
                <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
                  <option value="">All variants</option>
                  <option value="neon">Neon</option>
                  <option value="mega">Mega</option>
                  <option value="fly">Fly</option>
                  <option value="ride">Ride</option>
                  <option value="fly_ride">Fly + Ride</option>
                </select>
              </div>
              <div className="select-wrap premium-select-wrap">
                <ArrowDownUp size={15} />
                <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                  <option value="updated">Recently updated</option>
                  <option value="name">Name A-Z</option>
                  <option value="priceAsc">Price low-high</option>
                  <option value="priceDesc">Price high-low</option>
                </select>
              </div>
            </div>
          </section>
          {loading ? (
            <div className="empty-state premium-empty-state">
              <RefreshCw className="animate-spin text-coral" />
              <p>Gathering your collection...</p>
            </div>
          ) : pets.length ? (
            <div className="pet-grid premium-pet-grid">
              {pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} onEdit={(selected) => setModal({ type: 'edit', pet: selected })} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="empty-state premium-empty-state">
              <div className="empty-icon"><PawPrint size={27} /></div>
              <h2 className="font-display text-2xl font-bold text-ink">No pets here yet</h2>
              <p className="max-w-xs text-center text-sm leading-6 text-moss">{filters.search || filters.rarity || filters.category ? 'Try adjusting your filters to find what you are looking for.' : 'Add your first pet and start building your collection.'}</p>
              {!filters.search && !filters.rarity && !filters.category && (
                <button className="button button-secondary mt-2" onClick={() => setModal({ type: 'add' })}>
                  <Plus size={17} /> Add first pet
                </button>
              )}
            </div>
          )}
        </main>
        {modal && (
          <Modal eyebrow={modal.type === 'edit' ? 'Edit listing' : modal.type === 'import' ? 'Bulk import' : 'New listing'} title={modal.type === 'edit' ? `Update ${modal.pet.name}` : modal.type === 'import' ? 'Import items' : modal.itemType === 'egg' ? 'Add an egg' : modal.itemType === 'potion' ? 'Add a potion' : 'Add a pet'} onClose={() => setModal(null)}>
            {modal.type === 'import' ? <PetImport onClose={() => setModal(null)} onImport={handleImport} submitting={importing} /> : <PetForm pet={modal.pet} itemType={modal.itemType} onItemTypeChange={(itemType) => setModal((current) => ({ ...current, itemType }))} onSubmit={handleSave} onCancel={() => setModal(null)} submitting={submitting} />}
          </Modal>
        )}
            {pendingDelete && <Modal eyebrow="Confirm action" title={`Delete ${pendingDelete.name}?`} onClose={() => setPendingDelete(null)}><div className="space-y-5"><p className="text-sm leading-6 text-moss">This pet will be permanently removed from your collection.</p><div className="flex justify-end gap-3 border-t border-ink/10 pt-5"><button type="button" className="button button-quiet" onClick={() => setPendingDelete(null)}>Cancel</button><button type="button" className="flex min-h-11 items-center justify-center rounded-xl bg-[#ff735c] px-5 font-bold text-white shadow-lg shadow-[#ff735c]/20 transition hover:-translate-y-0.5 hover:bg-[#e85d49]" onClick={confirmDelete}>Delete pet</button></div></div></Modal>}
            {toast && <div className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`}>{toast.message}</div>}
            {exiting && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2326]/45 p-6 backdrop-blur-sm" role="status" aria-live="polite"><div className={`flex w-full max-w-xs flex-col items-center rounded-3xl px-8 py-9 text-center shadow-2xl shadow-[#db4e8a]/25 ${theme === 'dark' ? 'bg-[#20282a] text-[#eef5f2]' : 'bg-white text-[#1f2326]'}`}><LoaderCircle size={42} className="animate-spin text-[#e73d8b]" /><p className="mt-4 font-display text-xl font-bold">Exiting...</p><p className={`mt-1 text-sm ${theme === 'dark' ? 'text-[#c3d0cc]' : 'text-[#687277]'}`}>Returning to Petfolio</p></div></div>}
      </div>
    )
}

export default function App() { return <Routes><Route path="/login" element={<Login />} /><Route path="*" element={<Protected><Dashboard /></Protected>} /></Routes> }
