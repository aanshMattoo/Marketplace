const axios = require("axios");

// Fetch current ETH-to-INR rate
const getEthToInrRate = async () => {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr");
    return response.data.ethereum.inr;
  } catch (error) {
    console.error("Error fetching ETH-to-INR rate:", error);
    throw error;
  }
};

// Fetch ETH-to-INR rate from 5 minutes ago
const getEthToInrRate5MinAgo = async () => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const fiveMinAgo = now - 5 * 60;

    const url = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart/range?vs_currency=inr&from=${fiveMinAgo}&to=${now}`;
    const response = await axios.get(url);

    const prices = response.data.prices;
    if (prices.length > 0) {
      const price5MinAgo = prices[0][1]; // [timestamp, price]
      return price5MinAgo;
    } else {
      throw new Error("No historical price data available");
    }
  } catch (error) {
    console.error("Error fetching 5-minute-old ETH-to-INR rate:", error);
    throw error;
  }
};

module.exports = {
  getEthToInrRate,
  getEthToInrRate5MinAgo,
};
