// src/components/Home.jsx
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Welcome to Blockchain Marketplace
      </h1>
      <p className="text-gray-600 mb-6">
        Buy and sell products securely using blockchain technology.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={() => navigate("/explore")}
          className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-500 transition"
        >
          Explore Marketplace
        </button>
        <button
          onClick={() => navigate("/list-product")}
          className="px-6 py-3 bg-green-600 text-white rounded-md shadow-lg hover:bg-green-500 transition"
        >
          List a Product
        </button>
      </div>
    </div>
  );
}
