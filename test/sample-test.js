const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function() {
  it("Should create and execute market sales", async function() {
    
    const FractionManager = await ethers.getContractFactory("NFTFractionsManager");
    const fractionsManager = await FractionManager.deploy();
    await fractionsManager.deployed();
    const fractionsAddress = fractionsManager.address;

    const Market = await ethers.getContractFactory("NFTMarketplace");
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftContractAddress = nft.address;

    const auctionPrice = ethers.utils.parseUnits('1', 'ether');
    const distributionPrice = ethers.utils.parseUnits('0.025', 'ether');

    await nft.createToken("https://www.mytokenlocation.com");
    await nft.createToken("https://www.mytokenlocation2.com");
  
    await market.createItem(nftContractAddress, 1, distributionPrice, auctionPrice);
    await market.createItem(nftContractAddress, 2, distributionPrice, auctionPrice);
    
    const [_, john, mary, harry, buyerAddress] = await ethers.getSigners();

    await market.connect(john).getNFTFraction(1, {value: distributionPrice});

    await market.connect(buyerAddress).sellItem(nftContractAddress, 1, { value: auctionPrice})

    items = await market.fetchItems()
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))
    console.log('items: ', items)
  })
})