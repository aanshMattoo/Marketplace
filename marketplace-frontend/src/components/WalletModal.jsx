import { useState } from "react";
import { depositBalance, withdrawBalance, fetchUserProfile } from "../services/api";

export default function WalletModal({ onClose, onUpdate, currentBalance }) {
  const [amount, setAmount] = useState("");
  const [action, setAction] = useState("deposit"); // "deposit" or "withdraw"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setError("");
    const numericAmount = Number(amount);
    if (numericAmount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (action === "withdraw" && numericAmount > currentBalance) {
      setError("Insufficient balance for withdrawal.");
      return;
    }

    setLoading(true);
    try {
      if (action === "deposit") {
        await depositBalance(numericAmount);
      } else {
        await withdrawBalance(numericAmount);
      }
      // Update user profile info (e.g., updated balance)
      const data = await fetchUserProfile();
      onUpdate(data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Wallet Operations</h2>
        <div className="mb-4">
          <label className="block mb-2">Action:</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Amount (₹):</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter amount"
          />
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleAction}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
          >
            {loading
              ? "Processing..."
              : action === "deposit"
              ? "Deposit"
              : "Withdraw"}
          </button>
        </div>
      </div>
    </div>
  );
}
