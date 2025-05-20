const axios = require("axios");

// Fetch ETH-to-INR rate using CoinGecko API
const getEthToInrRate = async () => {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr");
    return response.data.ethereum.inr;
  } catch (error) {
    console.error("Error fetching ETH-to-INR rate:", error);
    throw error;
  }
};

module.exports = { getEthToInrRate };