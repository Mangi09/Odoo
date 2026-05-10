import { Link, useNavigate } from 'react-router-dom'
import { clearStoredUser, getStoredUser } from '../lib/api'

export default function Navbar() {
  const navigate = useNavigate()
  const user = getStoredUser()

  const handleLogout = () => {
    clearStoredUser()
    navigate('/')
  }

  return (
    <nav className="w-full px-6 lg:px-12 py-6 flex items-center justify-between max-w-7xl mx-auto z-50">

      <Link to="/" className="text-3xl font-bold text-[#2D2D2D]">
        Traveloop
      </Link>

      <div className="hidden md:flex items-center gap-10 text-[#555] font-medium">

        <Link to="/dashboard">Dashboard</Link>
        <Link to="/create-trip">Plan Trip</Link>
        <Link to="/my-trips">My Trips</Link>
        <Link to="/itinerary-builder">Itinerary</Link>

      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-12 h-12 rounded-full bg-[#FFF3E9] border border-[#F97316]/30 text-[#F97316] font-bold overflow-hidden"
              title="Open profile"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                user.fullName?.slice(0, 1) || 'U'
              )}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:inline-flex border border-[#E5E5E5] px-4 py-3 rounded-2xl font-medium hover:bg-white transition"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="bg-[#F97316] text-white px-6 py-3 rounded-2xl font-medium hover:scale-105 transition"
          >
            Get Started
          </button>
        )}
      </div>
    </nav>
  );
}
