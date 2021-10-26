import { ethers } from "ethers";
import axios from "axios";
import Web3Modal  from 'web3modal';
import { useEffect, useState } from "react";

import {nftaddress, nftmarketaddress} from '../config';

import NFT from '../abi/NFT.json';
import Market from '../abi/NFTMarketplace.json';
// import FractionsManager from './abi/NFTFractionsManager.json';

const Home = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs(){
    const provider = new ethers.providers.JsonRpcProvider();
    const nftContract = new ethers.Contract(nftaddress, NFT, provider);
    const marketContract = new ethers.Contract(nftmarketaddress, Market, provider);
    // const fractionsManagerContract = new ethers.Contract(nftfractionsmanager, FractionsManager.abi, provider);

    const data = await marketContract.fetchItems();

    console.log(data);

    const items = await Promise.all(data.map(async i => {

      const tokenURI = await nftContract.tokenURI(i.tokenId);

      const meta = await axios.get(tokenURI);
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
      let distributionPrice = ethers.utils.formatUnits(i.distributionPrice.toString(), 'ether');
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        distributionPrice,
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }

      return item
    }));

    setNfts(items);
    setLoading(false);
  }

  async function buyNFT(nft){
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');

    const tx = await contract.sellItem(nftaddress, nft.tokenId, {
      value: price
    });

    await tx.wait();
    loadNFTs();
  }

  async function buyFraction(nft){
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market, signer);

    const price = ethers.utils.parseUnits(nft.distributionPrice.toString(), 'ether');

    const tx = await contract.getNFTFraction(nft.tokenId, {
      value: price
    });

    await tx.wait();
  }

  return (
    <div className="App">
        {(loading || !nfts.length) ? (
          <p>No items on the market {nfts.length}</p>
        ) : (
          <div className="grid grid-cols-3">
            {nfts.map((item, key) => (
              <div key={key} className="p-5 mx-5 border shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p>{item.name}</p>
                    <p>{item.description}</p>
                  </div>
                  <div>
                    <p className="text-green-700">{"Price " + item.price + " Eth"}</p>
                    <p className="text-green-700">{"Fraction Price " + item.distributionPrice + " Eth"}</p>
                  </div>
                </div>
                <img alt={"NFT " + key + 1} src={item.image} className="rounded mt-2 w-full"/>
                <div className="flex justify-end mt-2 items-center">
                    <button className="px-4 py-3 bg-green-400 text-white ml-2" onClick={() => buyFraction(item)}>Buy Fraction</button>
                    <button className="px-4 py-3 bg-green-400 text-white ml-2" onClick={() => buyNFT(item)}>Buy Now</button>
                  </div>
              </div>))}
          </div>
        )
        }
        
    </div>
  );
}

export default Home;
