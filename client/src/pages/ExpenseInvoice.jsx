import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import logo from '../assets/logo.png'
import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../lib/api'
import { getCurrentUserId } from '../lib/session'

function Money({ value }) {
  return <span>${Number(value).toLocaleString()}</span>
}

function PieChart({ parts = [] , size = 120}){
  const total = parts.reduce((s,p)=>s + Math.max(0,p.value),0) || 1
  const { slices } = parts.reduce((acc, p) => {
    const portion = (p.value / total) * 360
    const start = acc.angle
    const end = start + portion
    acc.slices.push({ ...p, start, end })
    acc.angle = end
    return acc
  }, { slices: [], angle: -90 })

  const cx = size/2, cy = size/2, r = size/2 - 4
  const polar = (angle)=>{
    const a = (angle * Math.PI) / 180
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="rgba(0,0,0,0.03)" />
      {slices.map((s, idx) => {
        const [sx, sy] = polar(s.start)
        const [ex, ey] = polar(s.end)
        const large = s.end - s.start > 180 ? 1 : 0
        const d = `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`
        return <path key={idx} d={d} fill={s.color || ['#ff9a3c','#ffd6b0','#ffd0a8'][idx%3]} />
      })}
      <circle cx={cx} cy={cy} r={r*0.56} fill="#fff" />
    </svg>
  )
}

export default function ExpenseInvoice() {
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const userId = getCurrentUserId()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        // try server endpoint for invoices by user
        const invoices = await apiFetch(`/invoices?userId=${userId}`)
        // choose first invoice as demo; adapt later to route param
        if (mounted && Array.isArray(invoices) && invoices.length) {
          setInvoice(invoices[0])
        }
      } catch {
        // fallback: try trips -> invoice or leave as null
        try {
          const trips = await apiFetch(`/trips?userId=${userId}`)
          if (mounted && Array.isArray(trips) && trips.length) {
            const trip = trips[0]
            // attempt a trip-specific invoice endpoint
            try {
              const inv = await apiFetch(`/trips/${trip.id}/invoice`)
              if (inv) setInvoice(inv)
            } catch { /* ignore */ }
          }
        } catch { /* ignore */ }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [userId])

  const data = useMemo(() => {
    if (!invoice) {
      return {
        id: 'INV-LOCAL-0001',
        date: new Date().toLocaleDateString(),
        tripTitle: 'Untitled trip',
        travelers: [],
        items: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
      }
    }
    // normalize server shape
    return {
      id: invoice.id || invoice.invoiceId || 'INV-UNKNOWN',
      date: invoice.date || invoice.createdAt || new Date().toLocaleDateString(),
      tripTitle: invoice.tripTitle || invoice.trip?.title || invoice.title || 'Trip invoice',
      travelers: invoice.travelers || invoice.participants || (invoice.trip?.members || []),
      items: invoice.items || invoice.lines || [],
      subtotal: invoice.subtotal ?? invoice.amount ?? (invoice.items ? invoice.items.reduce((s,i)=>(s + (i.amount||0)),0) : 0),
      tax: invoice.tax ?? 0,
      discount: invoice.discount ?? 0,
      total: invoice.total ?? invoice.grandTotal ?? 0,
    }
  }, [invoice])

  const budgetParts = useMemo(()=>{
    const spent = data.total || 0
    const budget = invoice?.budget || data.subtotal || Math.max(spent, 1)
    const remaining = Math.max(0, budget - spent)
    return [
      { label: 'Spent', value: spent, color: '#ff9a3c' },
      { label: 'Remaining', value: remaining, color: '#ffd6b0' }
    ]
  }, [invoice, data])

  return (
    <div className="tl-page">
      <main className="tl-board tl-board-large">
        <Navbar />

        <div className="tl-section tl-invoice-shell">
          <div className="tl-invoice-left">
            <div className="tl-invoice-head">
              <div className="tl-invoice-brand">
                <img src={logo} alt="logo" className="tl-logo" />
                <div>
                  <h2 className="tl-title">{data.tripTitle}</h2>
                  <p className="tl-muted">{data.date} • Invoice ID {data.id}</p>
                </div>
              </div>

              <div className="tl-invoice-meta">
                <p><strong>Traveler Details</strong></p>
                <ul className="tl-inline-list">
                  {data.travelers?.map((t) => <li key={t}>{t}</li>)}
                </ul>
                <p className="tl-muted">Payment status - <strong>{invoice?.status || 'Pending'}</strong></p>
              </div>
            </div>

            <div className="tl-invoice-table-wrap">
              {loading ? (
                <div className="tl-muted">Loading invoice…</div>
              ) : (
                <>
                <table className="tl-invoice-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Qty/details</th>
                      <th>Unit Cost</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.length ? data.items.map((row, idx) => (
                      <tr key={row.id || idx}>
                        <td>{idx + 1}</td>
                        <td>{row.category || row.type || '-'}</td>
                        <td>{row.description || row.name || '-'}</td>
                        <td>{row.qty || row.days || '-'}</td>
                        <td><Money value={row.unit || row.price || row.cost || 0} /></td>
                        <td><Money value={row.amount || row.total || 0} /></td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="tl-muted">No invoice line items</td></tr>
                    )}
                  </tbody>
                </table>

                <div className="tl-invoice-totals">
                  <div></div>
                  <div className="tl-totals-right">
                    <div><span>Subtotal</span><strong><Money value={data.subtotal} /></strong></div>
                    <div><span>Tax</span><strong><Money value={data.tax} /></strong></div>
                    <div><span>Discount</span><strong><Money value={data.discount} /></strong></div>
                    <div className="tl-grand"><span>Grand Total</span><strong><Money value={data.total} /></strong></div>
                  </div>
                </div>
                </>
              )}
            </div>

            <div className="tl-invoice-actions">
              <button className="tl-btn">Download Invoice</button>
              <button className="tl-btn">Export as PDF</button>
              <button className="tl-btn tl-btn-primary">Mark as paid</button>
            </div>
          </div>

          <aside className="tl-invoice-right">
            <div className="tl-panel">
              <h3 className="tl-subtitle">Budget Insights</h3>
              <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:12,alignItems:'center'}}>
                <PieChart parts={budgetParts} />
                <div>
                  <p className="tl-muted">Total Budget: <strong>{invoice?.budget ?? '—'}</strong></p>
                  <p className="tl-muted">Total Spent: <strong><Money value={data.total} /></strong></p>
                  <p className="tl-muted">Remaining: <strong><Money value={(invoice?.budget ?? data.subtotal) - data.total} /></strong></p>
                </div>
              </div>
              <Link to="/trips" className="tl-pill">View Full Budget</Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
