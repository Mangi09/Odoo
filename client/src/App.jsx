import { Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminPanel from "./pages/AdminPanel";
import Tips from "./pages/Tips";
import Community from "./pages/Community";

function App() {
  return (
    <Routes>

      {/* Normal Website Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path='/tips' element={<Tips />} />
        <Route path='/community' element={<Community />} />
      </Route>

      {/* Admin Layout */}
      <Route element={<AdminLayout />}>
        <Route path="/admin-panel" element={<AdminPanel />} />
      </Route>

    </Routes>
  );
}

export default App;