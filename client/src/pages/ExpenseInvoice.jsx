import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import logo from '../assets/logo.png'
import { useMemo } from 'react'

function Money({ value }) {
  return <span>${value}</span>
}

export default function ExpenseInvoice() {
  const invoice = useMemo(() => ({
    id: 'INV-2026-30240',
    date: 'May 10, 2026',
    tripTitle: 'Trip to Europe Adventure',
    travelers: ['James', 'Arjun', 'Jenny', 'Cristina'],
    items: [
      { id: 1, category: 'Hotel', description: 'hotel booking paris', qty: '3 nights', unit: 3000, amount: 9000 },
      { id: 2, category: 'Travel', description: 'flight bookings (DEL -> PAR)', qty: 1, unit: 12000, amount: 12000 }
    ],
    subtotal: 21000,
    tax: 1050,
    discount: 50,
    total: 22000
  }), [])

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
                  <h2 className="tl-title">{invoice.tripTitle}</h2>
                  <p className="tl-muted">{invoice.date} • Invoice ID {invoice.id}</p>
                </div>
              </div>

              <div className="tl-invoice-meta">
                <p><strong>Traveler Details</strong></p>
                <ul className="tl-inline-list">
                  {invoice.travelers.map((t) => <li key={t}>{t}</li>)}
                </ul>
                <p className="tl-muted">Payment status - <strong>Pending</strong></p>
              </div>
            </div>

            <div className="tl-invoice-table-wrap">
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
                  {invoice.items.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.category}</td>
                      <td>{row.description}</td>
                      <td>{row.qty}</td>
                      <td><Money value={row.unit} /></td>
                      <td><Money value={row.amount} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="tl-invoice-totals">
                <div></div>
                <div className="tl-totals-right">
                  <div><span>Subtotal</span><strong><Money value={invoice.subtotal} /></strong></div>
                  <div><span>Tax (5%)</span><strong><Money value={invoice.tax} /></strong></div>
                  <div><span>Discount</span><strong><Money value={invoice.discount} /></strong></div>
                  <div className="tl-grand"><span>Grand Total</span><strong><Money value={invoice.total} /></strong></div>
                </div>
              </div>
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
              <div className="tl-chart-placeholder">Pie</div>
              <p className="tl-muted">Total Budget: 20000</p>
              <p className="tl-muted">Total Spent: 22000</p>
              <p className="tl-muted">Remaining: -2000</p>
              <Link to="/trips" className="tl-pill">View Full Budget</Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
