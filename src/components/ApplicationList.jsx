import { ArrowUpRight, BriefcaseBusiness, CalendarDays, Pencil, Trash2 } from 'lucide-react'

const dateLabel = (value) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export default function ApplicationList({ applications, hasApplications, onEdit, onDelete }) {
  if (!applications.length) return <div className="empty-state"><div className="empty-icon"><BriefcaseBusiness size={23}/></div><h3>{hasApplications ? 'No matching applications' : 'No applications here yet'}</h3><p>{hasApplications ? 'Try another search or status filter.' : 'Once you add a role, it’ll show up right here.'}</p></div>
  return <div className="table-scroll"><table><thead><tr><th>COMPANY</th><th>ROLE</th><th>STATUS</th><th>DATE APPLIED</th><th className="actions-head">ACTIONS</th></tr></thead><tbody>{applications.map((app) => <tr key={app.id}>
    <td><div className="company-cell"><span className="company-mark">{app.company?.trim().charAt(0)?.toUpperCase() || '?'}</span><span className="company-name">{app.company}</span></div></td>
    <td className="role-cell">{app.role}</td><td><span className={`status-badge status-${app.status?.toLowerCase()}`}>{app.status}</span></td>
    <td><span className="date-cell"><CalendarDays size={14}/>{dateLabel(app.date_applied)}</span></td>
    <td><div className="row-actions">{app.application_url && <a className="action-button" href={app.application_url} target="_blank" rel="noreferrer" aria-label="Open application URL" title="Open application"><ArrowUpRight size={16}/></a>}<button className="action-button" onClick={() => onEdit(app)} aria-label={`Edit ${app.company}`} title="Edit"><Pencil size={15}/></button><button className="action-button action-delete" onClick={() => onDelete(app)} aria-label={`Delete ${app.company}`} title="Delete"><Trash2 size={15}/></button></div></td>
  </tr>)}</tbody></table></div>
}
