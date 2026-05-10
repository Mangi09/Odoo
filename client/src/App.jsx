import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PlanTrip from './pages/PlanTrip'
import Profile from './pages/Profile'
import PackingChecklist from './pages/PackingChecklist'
import Trips from './pages/Trips'
import TripDetails from './pages/TripDetails'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plan" element={<PlanTrip />} />
        <Route path="/checklist" element={<PackingChecklist />} />
        <Route path="/screen-11" element={<PackingChecklist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:tripId" element={<TripDetails />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
