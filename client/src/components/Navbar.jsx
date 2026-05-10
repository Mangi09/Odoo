import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Navbar() {
  return (
    <header className="tl-bar tl-navbar">
      <Link className="tl-brand-wrap tl-brand-link" to="/" aria-label="Traveloop home">
        <img src={logo} alt="Traveloop logo" className="tl-logo" />
        <div className="tl-brand">Traveloop</div>
      </Link>

      <Link className="tl-profile" to="/profile" aria-label="User profile">
        <span>U</span>
      </Link>
    </header>
  )
}