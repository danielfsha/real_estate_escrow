const { expect } = require("chai");
const { ethers } = require("hardhat");

const convertTokens = (value) => {
  return ethers.utils.parseUnits(value.toString(), 'ether')
}

describe("Escrow", () => {
  let realEstateNFT, escrow
  
  let buyer, seller, inspector, lender

  beforeEach(async () => {
    [buyer, seller, lender, inspector] = await ethers.getSigners()

    const RealsEstateNFT = await ethers.getContractFactory('RealEstateNFT')
    realEstateNFT =  await RealsEstateNFT.deploy()
    await realEstateNFT.deployed()

    // Mint 
    let tx = await realEstateNFT.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
    await tx.wait()

    const Escrow = await ethers.getContractFactory('Escrow')
    escrow = await Escrow.deploy(
      seller.address, 
      lender.address,
      inspector.address,
      realEstateNFT.address,
    )

    await escrow.deployed()

    tx = await realEstateNFT.connect(seller).approve(escrow.address, 0)
    tx.wait()

    tx = await escrow.connect(seller).listProperty(
      0,
      buyer.address,
      convertTokens(10),
      convertTokens(5)
    )
    await tx.wait()
  })

  describe('Deployment', () => {
    it("Should match NFT address", async () => {
      expect(await escrow.nftContractAddress()).to.equal(realEstateNFT.address)
    })

    it("Should match seller address", async () => {
      expect(await escrow.seller()).to.equal(seller.address)
    })

    it("Should match lender address", async () => {
      expect(await escrow.lender()).to.equal(lender.address)
    })

    it("Should match inspector address", async () => {
      expect(await escrow.inspector()).to.equal(inspector.address)
    })
  })


  describe('Listing', () => {
    it("Should update the ownership", async () => {
      expect(await realEstateNFT.ownerOf(0)).to.equal(escrow.address)
    })

    it("Should check if property is listed", async () => {
      expect(await escrow.isListed(0)).to.equal(true)
    })

    it("Should return the buyer", async () => {
      expect(await escrow.buyer(0)).to.equal(buyer.address)
    })

    it("Should return the purchase price", async () => {
      expect(await escrow.price(0)).to.equal(convertTokens(10))
    })

    it("Should return the escrowAmount", async () => {
      expect(await escrow.escrowAmount(0)).to.equal(convertTokens(5))
    })
  })

  describe('Deposit', () => {
    it("Should get contract balance", async () => {
      const tx = await escrow.connect(buyer).depositEarnest(0, {
        value: convertTokens(10)
      })
      await tx.wait()

      expect(await escrow.getBalance()).to.equal(convertTokens(10))
    })
  })

  describe('Inspection', () => {
    it("Should update the inspection", async () => {
      let tx = await escrow.connect(inspector).updateInspectionStatus(0, true)
      await tx.wait()

      expect(await escrow.inspectionPassed(0)).to.equal(true)
    })
  })

  describe('Approval', () => {
    beforeEach(async () => {
      let transaction = await escrow.connect(buyer).approveSale(0)
      await transaction.wait()

      transaction = await escrow.connect(seller).approveSale(0)
      await transaction.wait()

      transaction = await escrow.connect(lender).approveSale(0)
      await transaction.wait()
    })

    it('Updates approval status', async () => {
      expect(await escrow.approval(0, buyer.address)).to.be.equal(true)
      expect(await escrow.approval(0, seller.address)).to.be.equal(true)
      expect(await escrow.approval(0, lender.address)).to.be.equal(true)
    })
  })
})