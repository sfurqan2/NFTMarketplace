import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";
import { useEffect, useState } from "react";

import { nftaddress, nftmarketaddress } from "../config";

import { abi as NFT } from "../artifacts/contracts/NFT.sol/NFT.json";
import { abi as Market } from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
// import FractionsManager from './abi/NFTFractionsManager.json';

const Home = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider();
    const nftContract = new ethers.Contract(nftaddress, NFT, provider);
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market,
      provider
    );
    // const fractionsManagerContract = new ethers.Contract(nftfractionsmanager, FractionsManager.abi, provider);

    const data = await marketContract.fetchItems();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await nftContract.tokenURI(i.tokenId);

        const meta = await axios.get(tokenURI);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let distributionPrice = ethers.utils.formatUnits(
          i.distributionPrice.toString(),
          "ether"
        );
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          distributionPrice,
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          ownerCount: await getItemOwnersCount(i),
          owners: await getItemPartialOwners(i),
        };

        return item;
      })
    );

    setNfts(items);
    setLoading(false);
  }

  async function getItemOwnersCount(item) {
    const provider = new ethers.providers.JsonRpcProvider();
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market,
      provider
    );
    // const fractionsManagerContract = new ethers.Contract(nftfractionsmanager, FractionsManager.abi, provider);

    const result = await marketContract.getOwnerCount(item.tokenId);

    return result;
  }

  async function getItemPartialOwners(item) {
    const provider = new ethers.providers.JsonRpcProvider();
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market,
      provider
    );
    // const fractionsManagerContract = new ethers.Contract(nftfractionsmanager, FractionsManager.abi, provider);

    const result = await marketContract.getPartialOwners(item.tokenId);

    return result;
  }

  async function buyNFT(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    const tx = await contract.sellItem(nftaddress, nft.tokenId, {
      value: price,
    });

    await tx.wait();
    loadNFTs();
  }

  async function buyFraction(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market, signer);

    const price = ethers.utils.parseUnits(
      nft.distributionPrice.toString(),
      "ether"
    );

    const tx = await contract.getNFTFraction(nft.tokenId, {
      value: price,
    });

    await tx.wait();
    loadNFTs();
  }

  return (
    <div className="flex-1 flex justify-center items-center">
      {loading || !nfts.length ? (
        <div className="">
          <p>No items on the market!</p>
        </div>
      ) : (
        <div className="self-start mt-5">
          <p className="text-xl font-semibold text-green-600">NFTs for sale</p>
          <div className="grid grid-cols-1 sm:grid-cols-2  mt-5 gap-10">
            {nfts.map((item, key) => (
              <div key={key} className="p-5 border shadow rounded-md">
                <div className="flex items-center justify-between">
                  <dd>
                    <dt className="text-xl font-semibold text-blue-700">{item.name}</dt>
                    <dd>{item.description}</dd>
                  </dd>
                  <div>
                    <p className="text-green-700">
                      {"Price: " + item.price + " Eth"}
                    </p>
                    <p className="text-green-700">
                      {"Fraction Price: " + item.distributionPrice + " Eth"}
                    </p>
                  </div>
                </div>
                <p className="mt-2">{"Owner: " + item.owner}</p>
                {item.owners.length > 1 ? <h1 className="font-semibold mt-2">Partial Owners</h1> : null}
                {item.owners.map((owner, key) => {
                  if (item.owner === owner) return null;
                  return <p key={key}>{owner}</p>;
                })}
                <img
                  alt={"NFT " + key + 1}
                  src={item.image}
                  className="rounded mt-2 w-full"
                />
                <div className="flex justify-between mt-2 items-center">
                  <p className="mt-2">{"Partial Owners: " + item.ownerCount}</p>
                  <div className="flex justify-end mt-2 items-center">
                    <button
                      className="px-4 py-3 bg-green-400 text-white ml-2 rounded-3xl hover:bg-green-500 transition-colors"
                      onClick={() => buyFraction(item)}
                    >
                      Buy Fraction
                    </button>
                    <button
                      className="px-4 py-3 bg-green-400 text-white ml-2 rounded-3xl hover:bg-green-500 transition-colors"
                      onClick={() => buyNFT(item)}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
