import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateTripPage from './pages/CreateTripPage'
import Profile from './pages/Profile'
import MyTrips from './pages/MyTrips'
import ItineraryBuilder from './pages/ItineraryBuilder'
import PackingChecklist from './pages/PackingChecklist'
import ExpenseInvoice from './pages/ExpenseInvoice'
import Trips from './pages/Trips'
import TripDetails from './pages/TripDetails'
import PlanTrip from './pages/PlanTrip'
import Community from './pages/Community'
import AdminPanel from './pages/AdminPanel'
import Tips from './pages/Tips'
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
        <Route path="/checklist" element={<PackingChecklist />} />
        <Route path="/screen-11" element={<PackingChecklist />} />
        <Route path="/expense-invoice" element={<ExpenseInvoice />} />
        <Route path="/invoice" element={<ExpenseInvoice />} />
        <Route path="/screen-14" element={<ExpenseInvoice />} />
        <Route path="/budget-itinerary" element={<BudgetItinerary />} />
        <Route path="/activity-search" element={<ActivitySearch />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:tripId" element={<TripDetails />} />
        <Route path="/plan" element={<PlanTrip />} />
        <Route path="/community" element={<Community />} />
        <Route path="/tips" element={<Tips />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminPanel />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
