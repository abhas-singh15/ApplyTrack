import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const emptyForm = { company: '', role: '', application_url: '', status: 'Applied', date_applied: new Date().toISOString().slice(0, 10), notes: '' }

export default function ApplicationForm({ application, onClose, onSave, saving }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  useEffect(() => {
    setForm(application ? {
      ...emptyForm,
      ...application,
      company: application.company ?? '',
      role: application.role ?? '',
      application_url: application.application_url ?? '',
      notes: application.notes ?? '',
      status: application.status ?? 'Applied',
      date_applied: application.date_applied ?? '',
    } : emptyForm)
  }, [application])
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const company = (form.company ?? '').trim()
    const role = (form.role ?? '').trim()
    const applicationUrl = (form.application_url ?? '').trim()
    const notes = (form.notes ?? '').trim()
    if (!company || !role) return setError('Company and role are required.')
    if (applicationUrl) {
      try {
        const url = new URL(applicationUrl)
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol')
      } catch { return setError('Enter a valid http:// or https:// URL.') }
    }
    const saveError = await onSave({
      ...form,
      company,
      role,
      application_url: applicationUrl || null,
      date_applied: form.date_applied || null,
      notes: notes || null,
    })
    if (saveError) setError(saveError)
  }
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
      <div className="modal-heading"><div><span className="eyebrow">APPLICATION DETAILS</span><h2 id="form-title">{application ? 'Edit application' : 'Add application'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19}/></button></div>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>Company <span className="required">*</span><input autoFocus value={form.company} onChange={update('company')} placeholder="e.g. Linear" required /></label>
          <label>Role <span className="required">*</span><input value={form.role} onChange={update('role')} placeholder="e.g. Product Designer" required /></label>
          <label className="span-two">Application URL<input type="url" value={form.application_url} onChange={update('application_url')} placeholder="https://company.com/careers/role" /></label>
          <label>Status <span className="required">*</span><select value={form.status} onChange={update('status')} required><option>Applied</option><option>Interview</option><option>Rejected</option><option>Offer</option></select></label>
          <label>Date applied<input type="date" value={form.date_applied} onChange={update('date_applied')} /></label>
          <label className="span-two">Notes<textarea value={form.notes || ''} onChange={update('notes')} rows="3" placeholder="Add a few details to remember…" /></label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : application ? 'Save changes' : 'Add application'}</button></div>
      </form>
    </section>
  </div>
}
