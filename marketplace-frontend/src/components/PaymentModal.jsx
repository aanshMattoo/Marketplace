import { useState } from "react";
import axios from "axios";

export default function PaymentModal({ productId, price, onClose, onPurchaseSuccess }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle ETH purchase
  const handleEth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first!");
        return;
      }
      const response = await axios.post(
        `http://localhost:5000/api/products/${productId}/buy-eth`,
        {}, // No body needed, as calculation is done on backend
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("ETH Purchase success:", response.data);
      onPurchaseSuccess();
    } catch (error) {
      console.error("Error buying with ETH:", error.response?.data || error.message);
      alert(`Payment failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle token-based purchase
  const handleToken = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first!");
        return;
      }
      const { data } = await axios.post(
        `http://localhost:5000/api/products/${productId}/buy`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      onPurchaseSuccess();
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Session expired. Please log in again.");
      } else {
        alert(`Payment failed: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Confirm Your Purchase</h2>
        <p className="mb-4 text-center">Choose your preferred payment method:</p>
        <p className="text-lg text-center mb-2 font-semibold">Price: ₹{price}</p>
        {error && <p className="text-red-500 mb-2 text-center">{error}</p>}
        <div className="flex justify-around mb-4">
          <button
            onClick={handleEth}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Buy with ETH"}
          </button>
          <button
            onClick={handleToken}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Buy with Token"}
          </button>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
