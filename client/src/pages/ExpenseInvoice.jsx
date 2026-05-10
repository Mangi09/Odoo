import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useEffect, useMemo, useState } from 'react'
import { apiFetch, API_BASE_URL } from '../lib/api'
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
  const [trips, setTrips] = useState([])
  const [selectedTripId, setSelectedTripId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState('Pending')
  const userId = getCurrentUserId()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        // Load both trips and invoices
        const [tripsResponse, invoicesResponse] = await Promise.all([
          apiFetch(`/trips?userId=${userId}`),
          apiFetch(`/invoices?userId=${userId}`)
        ])

        const tripsData = Array.isArray(tripsResponse) ? tripsResponse : tripsResponse?.trips || []
        const invoicesList = Array.isArray(invoicesResponse) ? invoicesResponse : invoicesResponse?.invoices || invoicesResponse || []

        if (!mounted) return

        setTrips(tripsData)

        // auto-select first trip with expenses (use invoices to determine), fallback to first trip
        const tripWithExpenses = invoicesList.find((inv) => Number(inv.total || 0) > 0 || Number(inv.subtotal || 0) > 0)
        const selectedId = tripWithExpenses?.id || tripsData[0]?.id
        if (selectedId) {
          setSelectedTripId(selectedId)

          // set the invoice for this trip
          if (mounted && Array.isArray(invoicesList)) {
            const matchingInvoice = invoicesList.find((inv) => inv.id === selectedId)
            if (matchingInvoice) {
              setInvoice(matchingInvoice)
              setPaymentStatus(matchingInvoice.status || 'Pending')
            }
          }
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [userId])

  useEffect(() => {
    if (!selectedTripId) return
    let mounted = true
    async function loadInvoiceForTrip() {
      try {
        const response = await apiFetch(`/invoices?userId=${userId}`)
        const invoicesList = Array.isArray(response) ? response : response?.invoices || response || []
        if (mounted && Array.isArray(invoicesList)) {
          const matchingInvoice = invoicesList.find((inv) => inv.id === selectedTripId)
          if (matchingInvoice) {
            setInvoice(matchingInvoice)
            setPaymentStatus(matchingInvoice.status || 'Pending')
          }
        }
      } catch {
        // ignore
      }
    }
    loadInvoiceForTrip()
    return () => { mounted = false }
  }, [selectedTripId, userId])

  async function downloadInvoice() {
    if (!invoice?.id) {
      // fallback to client-side print if no server invoice id
      return exportAsPdfFallback()
    }

    try {
      const resp = await fetch(`${API_BASE_URL}/invoices/${invoice.id}/pdf`, {
        method: 'GET',
        headers: { Accept: 'application/pdf' }
      })

      if (!resp.ok) throw new Error('PDF download failed')

      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.id || 'invoice'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      // server not available or returned error — fallback
      exportAsPdfFallback()
    }
  }

  async function exportAsPdfFallback() {
    // Simple client-side fallback: open printable window and call print
    const node = document.getElementById('invoice-root')
    if (!node) return
    const html = `<!doctype html><html><head><title>Invoice</title><meta name="viewport" content="width=device-width,initial-scale=1"/><style>body{font-family: Sora, sans-serif;padding:20px;color:var(--text);background:#fff}</style></head><body>${node.outerHTML}</body></html>`
    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    // give the window a moment to render
    setTimeout(() => {
      w.print()
      w.close()
    }, 300)
  }

  async function markAsPaid() {
    try {
      await apiFetch(`/invoices/${invoice?.id || 'local-demo'}/paid`, {
        method: 'POST',
        body: JSON.stringify({ status: 'paid' })
      })
      setPaymentStatus('Paid')
    } catch {
      setPaymentStatus('Paid')
    }
  }

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
        {trips.length > 1 && (
          <div className="tl-invoice-selector">
            <label htmlFor="trip-select" style={{ fontWeight: 600, color: 'var(--text)' }}>Select Trip:</label>
            <select
              id="trip-select"
              value={selectedTripId || ''}
              onChange={(e) => setSelectedTripId(e.target.value)}
            >
              <option value="">-- Choose a trip --</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>{trip.title || trip.name || 'Untitled Trip'}</option>
              ))}
            </select>
          </div>
        )}
        <div id="invoice-root" className="tl-section tl-invoice-shell">
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
                <p className="tl-muted">Payment status - <strong>{invoice?.status || paymentStatus}</strong></p>
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
                      <tr key={`${row.id}-${row.description}-${idx}`}>
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
              <button className="tl-btn" onClick={downloadInvoice}>Download Invoice</button>
              <button className="tl-btn" onClick={exportAsPdfFallback}>Export as PDF</button>
              <button className="tl-btn tl-btn-primary" onClick={markAsPaid}>Mark as paid</button>
            </div>
          </div>

          <aside className="tl-invoice-right">
            <div className="tl-panel">
              <h3 className="tl-subtitle">Budget Insights</h3>
              <div className="tl-budget-insights-grid">
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
