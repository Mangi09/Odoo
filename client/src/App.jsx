import { Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
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
}

export default App;