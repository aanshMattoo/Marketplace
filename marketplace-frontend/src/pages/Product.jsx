import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProduct } from "../services/api";
import PaymentModal from "../components/PaymentModal";

export default function Product() {
  const { id } = useParams(); // Extract product ID from URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // State for modal visibility

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProduct(id);
        console.log("Fetched product data:", data); // Debug log
        setProduct(data);
      } catch (err) {
        console.error("Fetch error:", err); // Detailed error logging
        setError("Failed to fetch product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleBuyNow = () => {
    setShowPaymentModal(true); // Show payment modal
  };

  const handlePurchaseSuccess = () => {
    console.log("Purchase successful! Redirecting to profile...");
    window.location.href = "/profile"; // Redirect to ProfilePage
  };
  

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-red-500">{error}</h1>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-red-500">Product not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
        <p className="text-gray-700 mb-4">{product.description}</p>
        <div className="mb-4">
          <span className="text-2xl font-bold">Price: ₹{product.price}</span>
        </div>
        <div className="mb-4">
          <span className="text-gray-600">Seller Wallet: {product.owner}</span>
        </div>
        <div className="flex items-center">
          {product.isSold ? (
            <span className="bg-gray-500 text-white px-4 py-2 rounded">Sold Out</span>
          ) : (
            <button
              onClick={handleBuyNow} // Opens modal
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Buy Now
            </button>
          )}
        </div>
      </div>

      {showPaymentModal && (
  <PaymentModal
    onClose={() => setShowPaymentModal(false)}
    productId={product._id}
    price={product.price}
    onPurchaseSuccess={handlePurchaseSuccess} // ✅ Pass success handler
  />
)}

    </div>
  );
}
