import { useState } from 'react'
import Navbar from "./components/Navbar";
import { Route, Routes } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/register' element={<Register />} />
          <Route path='/login' element={<Login />} />
        </Routes>
    </>
  )
}

export default App
