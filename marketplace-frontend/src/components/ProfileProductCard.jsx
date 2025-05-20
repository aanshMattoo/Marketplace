import { useState } from "react";

export default function ProfileProductCard({ product }) {
  const [showModal, setShowModal] = useState(false);

  // Determine the status text and color based on isSold
  const statusText = product.isSold ? "Sold" : "Unsold";
  const statusColor = product.isSold ? "red" : "green";

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">₹{product.price}</span>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            View Details
          </button>
        </div>
        <div className="mt-2">
          <span className="text-lg font-medium" style={{ color: statusColor }}>
            {statusText}
          </span>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Product Details</h2>
            <p>
              <strong>Name:</strong> {product.name}
            </p>
            <p>
              <strong>Description:</strong> {product.description}
            </p>
            <p>
              <strong>Price:</strong> ₹{product.price}
            </p>
            <p>
              <strong>Status:</strong> {statusText}
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
