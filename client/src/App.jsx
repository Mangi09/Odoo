import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateTripPage from './pages/CreateTripPage'
import Profile from './pages/Profile'
import MyTrips from './pages/MyTrips'
import ItineraryBuilder from './pages/ItineraryBuilder'
import PackingChecklist from './components/PackingChecklist'
import BudgetItinerary from './components/BudgetItinerary'
import ActivitySearch from './components/ActivitySearch'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-trip" element={<CreateTripPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/itinerary-builder" element={<ItineraryBuilder />} />
        <Route path="/packing-checklist" element={<PackingChecklist />} />
        <Route path="/budget-itinerary" element={<BudgetItinerary />} />
        <Route path="/activity-search" element={<ActivitySearch />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
