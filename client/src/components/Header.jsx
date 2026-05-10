import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-300">
            <img src={logo} alt="Traveloop Logo" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--orange-600)] to-[var(--orange-400)]">
            Traveloop
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-gray-600 hover:text-[var(--orange-500)] font-medium transition-colors">Home</Link>
          <Link to="/explore" className="text-gray-600 hover:text-[var(--orange-500)] font-medium transition-colors">Explore</Link>
          <Link to="/trips" className="text-gray-600 hover:text-[var(--orange-500)] font-medium transition-colors">My Trips</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden sm:block text-gray-600 hover:text-[var(--orange-500)] font-medium transition-colors">
            Log in
          </Link>
          <Link to="/plan" className="px-6 py-2.5 bg-gradient-to-r from-[var(--orange-500)] to-[var(--orange-400)] text-white font-medium rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-300">
            Plan a trip
          </Link>
        </div>
      </div>
    </header>
  );
}
