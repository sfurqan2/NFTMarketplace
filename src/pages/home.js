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

    const items = Promise.all(data.map(async i => {
      const tokenURI = await nftContract.tokenURI(i.tokenId);

      const meta = await axios.get(tokenURI);
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
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

  return (
    <div className="App">
        {loading || !nfts.length ? (
          <p>No items on the market</p>
        ) : nfts.map((item, key) => (
          <div>
            <p>{item.price}</p>
          </div>
        ))}
    </div>
  );
}

export default Home;
