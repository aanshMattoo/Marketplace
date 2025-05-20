import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// User API calls
export const registerUser = async (userData) => {
  try {
    const response = await API.post("/users/register", userData);
    return response.data; // Expected response: { user, token }
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
    throw error;
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await API.post("/users/login", userData);
    return response.data; // Expected response: { user, token }
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchUserProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  try {
    const response = await API.get("/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Expected response: { user }
  } catch (error) {
    console.error("Failed to fetch user profile:", error.response?.data || error.message);
    throw error;
  }
};

// Wallet API calls
export const depositBalance = async (amount) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.post(
      "/users/wallet/deposit",
      { amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data; // Expected response: { message, balance }
  } catch (error) {
    console.error("Deposit failed:", error.response?.data || error.message);
    throw error;
  }
};

export const withdrawBalance = async (amount) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.post(
      "/users/wallet/withdraw",
      { amount },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data; // Expected response: { message, balance }
  } catch (error) {
    console.error("Withdrawal failed:", error.response?.data || error.message);
    throw error;
  }
};

// Product API calls
export const fetchProducts = async () => {
  try {
    const response = await API.get("/products");
    return response.data; // Expected response: array of product objects
  } catch (error) {
    console.error("Failed to fetch products:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchProduct = async (id) => {
  try {
    const response = await API.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch product:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchUserProducts = async (walletId) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.get(`/products/user/${walletId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user products:", error.response?.data || error.message);
    throw error;
  }
};

export const listProduct = async (productData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.post("/products", productData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to list product:", error.response?.data || error.message);
    throw error;
  }
};
