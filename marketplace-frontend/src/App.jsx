import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./components/Profile";
import ExploreMarketplace from "./pages/ExploreMarketplace";
import ListProduct from "./pages/ListProduct";
import Product from "./pages/Product"; 

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    // Whenever localStorage token changes, update the state.
    setToken(localStorage.getItem("token"));
  }, []);

  return (
    <Router>
      {token && <Navbar />} {/* Only show Navbar if token exists */}
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
          <Route path="/explore" element={token ? <ExploreMarketplace /> : <Navigate to="/login" />} />
          <Route path="/list-product" element={token ? <ListProduct /> : <Navigate to="/login" />} />
          <Route path="/login" element={token ? <Navigate to="/" /> : <Login setToken={setToken} />} />
          <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
          <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/product/:id" element={token ? <Product /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}