import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownUp, BriefcaseBusiness, Check, ChevronDown, CircleAlert, LayoutDashboard, Plus, Search, Sparkles } from 'lucide-react'
import ApplicationForm from './components/ApplicationForm.jsx'
import ApplicationList from './components/ApplicationList.jsx'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient.js'

const statuses = ['All statuses', 'Applied', 'Interview', 'Rejected', 'Offer']
const statItems = [
  { key: 'total', label: 'Total applications', value: (apps) => apps.length, tone: 'violet', icon: BriefcaseBusiness },
  { key: 'applied', label: 'Applied', value: (apps) => apps.filter((a) => a.status === 'Applied').length, tone: 'blue', icon: ArrowDownUp },
  { key: 'interview', label: 'Interviews', value: (apps) => apps.filter((a) => a.status === 'Interview').length, tone: 'amber', icon: Activity },
  { key: 'offer', label: 'Offers', value: (apps) => apps.filter((a) => a.status === 'Offer').length, tone: 'green', icon: Sparkles },
  { key: 'rejected', label: 'Rejected', value: (apps) => apps.filter((a) => a.status === 'Rejected').length, tone: 'red', icon: CircleAlert },
]

export default function App() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All statuses')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const fetchApplications = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); return }
    setLoading(true); setLoadError('')
    try {
      const { data, error } = await supabase.from('applications').select('*').order('date_applied', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false })
      if (error) setLoadError(`${error.message} Check that you ran supabase/schema.sql and configured the environment variables.`)
      else setApplications(data || [])
    } catch (error) {
      setLoadError(`Could not reach Supabase: ${error instanceof Error ? error.message : 'Unknown network error'}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchApplications() }, [fetchApplications])
  const filtered = useMemo(() => applications.filter((app) => {
    const term = search.trim().toLowerCase()
    return (filter === 'All statuses' || app.status === filter) && (!term || app.company?.toLowerCase().includes(term) || app.role?.toLowerCase().includes(term))
  }), [applications, filter, search])

  const saveApplication = async (values) => {
    if (!supabase) return 'Supabase is not configured.'
    setSaving(true); setActionError('')
    try {
      const result = editing
        ? await supabase.from('applications').update(values).eq('id', editing.id)
        : await supabase.from('applications').insert(values)
      if (result.error) return `Could not save application: ${result.error.message}`
      setFormOpen(false); setEditing(null); await fetchApplications()
      return null
    } catch (error) {
      return `Could not save application: ${error instanceof Error ? error.message : 'Unknown network error'}`
    } finally {
      setSaving(false)
    }
  }

  const deleteApplication = async (app) => {
    if (!window.confirm(`Delete the application to ${app.company} for ${app.role}? This can’t be undone.`)) return
    setActionError('')
    try {
      const { error } = await supabase.from('applications').delete().eq('id', app.id)
      if (error) setActionError(`Could not delete application: ${error.message}`)
      else await fetchApplications()
    } catch (error) {
      setActionError(`Could not delete application: ${error instanceof Error ? error.message : 'Unknown network error'}`)
    }
  }

  const openForm = (application = null) => { setEditing(application); setFormOpen(true) }

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-icon"><LayoutDashboard size={19}/></span><span>apply<span className="brand-accent">track</span></span></div><div className="side-section-label">WORKSPACE</div><div className="side-link side-link-active"><span className="side-link-icon"><BriefcaseBusiness size={17}/></span>Applications<span className="nav-count">{applications.length}</span></div><div className="sidebar-bottom"><span className="avatar">A</span><div className="user-meta"><strong>My workspace</strong><span>Personal dashboard</span></div><ChevronDown size={15} className="user-chevron"/></div></aside>
    <main className="main-content"><header className="topbar"><div className="breadcrumb"><span>Workspace</span><span className="crumb-divider">/</span><strong>Applications</strong></div><div className="topbar-right"><span className={`connection-indicator ${isSupabaseConfigured ? 'connected' : ''}`}><span className="connection-dot"/>{isSupabaseConfigured ? 'Connected' : 'Setup required'}</span><span className="top-avatar">A</span></div></header>
      <div className="content-wrap"><div className="page-heading"><div><div className="eyebrow"><span className="heading-sparkle">✳</span> YOUR JOB SEARCH</div><h1>Applications</h1><p>Track your applications in one place.</p></div><button className="button button-primary add-button" onClick={() => openForm()} disabled={!isSupabaseConfigured}><Plus size={17}/>Add application</button></div>
        {!isSupabaseConfigured && <div className="notice setup-notice"><CircleAlert size={17}/><div><strong>Connect your Supabase project</strong><p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to your <code>.env</code>, then restart the dev server.</p></div></div>}
        {actionError && <div className="notice error-notice" role="alert"><CircleAlert size={17}/><span>{actionError}</span><button onClick={() => setActionError('')} aria-label="Dismiss">×</button></div>}
        <section className="stats-grid" aria-label="Application statistics">{statItems.map(({ key, label, value, tone, icon: Icon }) => <article className="stat-card" key={key}><div className={`stat-icon stat-${tone}`}><Icon size={17}/></div><span className="stat-label">{label}</span><strong className="stat-value">{loading ? <span className="skeleton-number"/> : value(applications)}</strong><span className="stat-foot">{key === 'total' ? 'Across your job search' : `${value(applications)} ${value(applications) === 1 ? 'application' : 'applications'}`}</span></article>)}</section>
        <section className="applications-panel"><div className="panel-heading"><div><h2>All applications</h2><p>Keep tabs on every opportunity.</p></div><span className="record-count">{filtered.length} {filtered.length === 1 ? 'record' : 'records'}</span></div>
          <div className="toolbar"><label className="search-box"><Search size={17}/><input aria-label="Search by company or role" placeholder="Search company or role…" value={search} onChange={(e) => setSearch(e.target.value)}/>{search && <button className="clear-search" onClick={() => setSearch('')} aria-label="Clear search">×</button>}</label><label className="filter-select"><span>Filter:</span><select aria-label="Filter by status" value={filter} onChange={(e) => setFilter(e.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select><ChevronDown size={14}/></label></div>
          {loading ? <div className="loading-state"><span className="spinner"/>Loading your applications…</div> : loadError ? <div className="panel-error"><div className="empty-icon error-icon"><CircleAlert size={21}/></div><h3>We couldn’t load your applications</h3><p>{loadError}</p><button className="button button-secondary" onClick={fetchApplications}>Try again</button></div> : <ApplicationList applications={filtered} hasApplications={applications.length > 0} onEdit={openForm} onDelete={deleteApplication}/>}
          {!loading && !loadError && applications.length === 0 && <div className="panel-footnote"><Check size={14}/> Your pipeline is ready when you are.</div>}
        </section><footer className="page-footer">Made for your next opportunity <span>✳</span></footer>
      </div>
    </main>
    {formOpen && <ApplicationForm application={editing} onClose={() => { setFormOpen(false); setEditing(null) }} onSave={saveApplication} saving={saving}/>}
  </div>
}
