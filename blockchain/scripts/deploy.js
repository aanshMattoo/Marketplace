const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  // Step 1: Deploy INRToken first
  const INRToken = await hre.ethers.getContractFactory("INRToken");
  const inrToken = await INRToken.deploy(deployer.address);

  // ✅ Use waitForDeployment() instead of deployed()
  await inrToken.waitForDeployment();
  console.log("INRToken deployed to:", await inrToken.getAddress());

  // Step 2: Deploy ProductMarketplace, passing INRToken's address to constructor
  const ProductMarketplace = await hre.ethers.getContractFactory("ProductMarketplace");
  const productMarketplace = await ProductMarketplace.deploy(await inrToken.getAddress());

  await productMarketplace.waitForDeployment();
  console.log("ProductMarketplace deployed to:", await productMarketplace.getAddress());

  // Step 3: Transfer ownership of INRToken to ProductMarketplace
  await inrToken.transferOwnership(await productMarketplace.getAddress());
  console.log(`INRToken ownership transferred to ProductMarketplace at: ${await productMarketplace.getAddress()}`);

  console.log("Contracts deployed successfully!");

  // ✅ Save contract addresses for frontend use
  const fs = require("fs");
  fs.writeFileSync(
    "./deployedAddresses.json",
    JSON.stringify({
      INRToken: await inrToken.getAddress(),
      ProductMarketplace: await productMarketplace.getAddress(),
    }, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
