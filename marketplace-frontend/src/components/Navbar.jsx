import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload(); // Force re-render to remove Navbar
  };

  return (
    <nav className="bg-gray-900 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          Blockchain Marketplace
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-gray-300 hover:text-white transition">Home</Link>
          <Link to="/profile" className="text-gray-300 hover:text-white transition">Profile</Link>
          <button onClick={handleLogout} className="text-gray-300 hover:text-white transition">Logout</button>
        </div>
      </div>
    </nav>
  );
}
