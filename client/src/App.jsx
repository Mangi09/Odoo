import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Route, Routes } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateTripPage from './pages/CreateTripPage';
import Profile from './pages/Profile';
import MyTrips from './pages/MyTrips';
import ItineraryBuilder from './pages/ItineraryBuilder';

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
<<<<<<< HEAD
    <Routes>

      {/* Normal Website Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Admin Layout */}
      <Route element={<AdminLayout />}>

      </Route>

    </Routes>
  );
=======
    <>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/create-trip' element={<CreateTripPage />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/my-trips' element={<MyTrips />} />
          <Route path='/itinerary-builder' element={<ItineraryBuilder />} />
        </Routes>
    </>
  )
>>>>>>> 965fd47 (connecting backend to frontend)
}

export default App;