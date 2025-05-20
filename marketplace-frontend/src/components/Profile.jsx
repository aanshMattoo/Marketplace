import { useEffect, useState } from "react";
import { fetchUserProfile, fetchProducts } from "../services/api";
import WalletModal from "../components/WalletModal";
import { FaWallet } from "react-icons/fa";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]); // all of this user’s products
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 1. Load user profile
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchUserProfile();
        setUser(data.user);
      } catch {
        setError("Failed to fetch user profile.");
      }
    };
    loadUser();
  }, []);

  // 2. Once user loaded, fetch *their* products
  useEffect(() => {
    if (!user) return;
    const loadUserProducts = async () => {
      try {
        const all = await fetchProducts();
        // only keep products where this user is owner
        const mine = all.filter((p) => p.owner === user.walletId);
        setProducts(mine);
      } catch {
        setError("Failed to fetch your products.");
      } finally {
        setLoading(false);
      }
    };
    loadUserProducts();
  }, [user]);

  if (loading) return <h1 className="text-3xl font-bold">Loading...</h1>;
  if (error) return <h1 className="text-3xl text-red-500">{error}</h1>;

  // split into unsold & sold
  const listedProducts   = products.filter((p) => !p.isSold);
  const purchasedProducts = products.filter((p) => p.isSold);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      {user ? (
        <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-2">User Information</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Contact:</strong> {user.contact}</p>
          <p className="flex items-center">
            <strong>Wallet:</strong>
            <span className="ml-2">{user.walletId}</span>
            <button
              onClick={() => setShowWalletModal(true)}
              className="ml-4 text-blue-600 hover:text-blue-800"
              title="Manage Wallet"
            >
              <FaWallet size={20} />
            </button>
          </p>
          <p><strong>Balance:</strong> ₹{user.balance}</p>
          

        </div>
      ) : (
        <p className="text-red-500">User not found. Please log in again.</p>
      )}

      {/* Unsold products */}
      <h2 className="text-2xl font-bold mt-6 mb-4">Your Listed Products</h2>
      {listedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listedProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md p-4 relative">
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">₹{product.price}</span>
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  View Details
                </button>
              </div>
              <span className="absolute top-2 right-2 text-sm font-semibold px-2 py-1 rounded bg-green-500 text-white">
                Unsold
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">You have no unsold (listed) products.</p>
      )}

      {/* Sold products */}
      <h2 className="text-2xl font-bold mt-6 mb-4">Your Purchased Products</h2>
      {purchasedProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md p-4 relative">
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">₹{product.price}</span>
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  View Details
                </button>
              </div>
              <span className="absolute top-2 right-2 text-sm font-semibold px-2 py-1 rounded bg-red-500 text-white">
                Sold
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">You haven’t purchased any products yet.</p>
      )}

      {/* Detail modal */}
      {selectedProduct && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
            <p className="text-gray-600 mb-2">{selectedProduct.description}</p>
            <p className="text-lg font-semibold mb-2">Price: ₹{selectedProduct.price}</p>
            <p className="text-sm font-medium mb-2">Owner: {selectedProduct.owner}</p>
            <p className="text-sm font-medium mb-4">
              Status: {selectedProduct.isSold ? 'Sold' : 'Available'}
            </p>
            <button
              onClick={() => setSelectedProduct(null)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Wallet modal */}
      {showWalletModal && (
        <WalletModal
          onClose={() => setShowWalletModal(false)}
          onUpdate={(updatedUser) => setUser(updatedUser)}
          currentBalance={user.balance}
        />
      )}
    </div>
  );
}
