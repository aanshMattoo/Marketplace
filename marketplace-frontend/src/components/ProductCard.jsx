import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold">₹{product.price}</span>
        <Link
          to={`/product/${product._id}`} // Ensure `_id` is correctly used
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          View Details
        </Link>
        {/* {console.log("Product ID:", product._id)} */}
      </div>
    </div>
  );
}
