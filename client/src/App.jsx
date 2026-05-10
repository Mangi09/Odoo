<<<<<<< HEAD
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
=======
// import Navbar from "./components/Navbar";
// import Hero from "./components/Hero";
// import Features from "./components/Features";
// import ActivitySearch from "./components/ActivitySearch";
// import BudgetItinerary from "./components/BudgetItenrary";
import PackingChecklist from "./components/PackingChecklist";
// import CTA from "./components/CTA";
// import Footer from "./components/Footer";
// import CreateTrip from "./components/CreateTrip";
>>>>>>> a2b4a2a313968342998725a8ca64d4ad408c6d94

// export default function App() {
//   return (
//     <div className="bg-[#F5F3F2] overflow-x-hidden">
//       <Navbar />
//       <Hero />
//       <Features />
//       <CreateTrip />
//       <ActivitySearch />
//       <BudgetItinerary />
//       <CTA />
//       <Footer />
//     </div>
//   );
// }

// Testing Files

// import CreateTrip from "./components/CreateTrip";

// export default function App() {
//   return (
//     <div className="bg-[#F5F3F2] min-h-screen">
//       <CreateTrip />
//     </div>
//   );
// }

// import ActivitySearch from "./components/ActivitySearch";

// export default function App() {
//   return (
//     <div className="bg-[#F5F3F2] min-h-screen">
//       <ActivitySearch />
//     </div>
//   );
// }

// import BudgetItinerary from "./components/BudgetItinerary";

// export default function App() {
//   return (
//     <div className="bg-[#F5F3F2] min-h-screen">
//       <BudgetItinerary />
//     </div>
//   );
// }

export default function App() {
  return (
<<<<<<< HEAD
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
=======
    <div className="bg-[#F5F3F2] overflow-x-hidden min-h-screen">
      <PackingChecklist />
    </div>
  );
}
>>>>>>> a2b4a2a313968342998725a8ca64d4ad408c6d94
