const hre = require("hardhat");

async function main() {
  const [buyer, seller, lender, inspector] = await hre.ethers.getSigners()
  
  const RealEstateNFT = await hre.ethers.getContractFactory("RealEstateNFT");
  const realEstateNFT = await RealEstateNFT.deploy("Hello, Hardhat!");

  await realEstateNFT.deployed();

  console.log("realEstateNFT deployed to:", realEstateNFT.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
