import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { nftaddress, nftmarketaddress } from "../config";
import {abi as NFT} from "../artifacts/contracts/NFT.sol/NFT.json";
import {abi as Market} from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";
import axios from "axios";
import Web3Modal from "web3modal";

const History = ({address}) => {
  const [myNfts, setMyNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyNFTs();
  }, [address]);

  async function loadMyNFTs() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
      
    const marketContract = new ethers.Contract(nftmarketaddress, Market, signer);
    const nftContract = new ethers.Contract(nftaddress, NFT, provider);
    const data = await marketContract.fetchItemsCreated();
    // const fractionsManagerContract = new ethers.Contract(nftfractionsmanager, FractionsManager.abi, provider);

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
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
          ownerCount: await getItemOwnersCount(i),
          sold: i.sold,
        };

        return item;
      })
    );

    setMyNfts(items);
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

  return (
    <div className="flex-1 flex flex-col">
      <h1 className="text-xl font-semibold text-green-600 mt-5">NFTs created by you</h1>
      <div className="flex-1 flex justify-center items-center">
        {loading || !myNfts.length ? (
          <div className="">
            <p>No items on the market!</p>
          </div>
        ) : (
          <div className="self-start mt-2">
            <div className="grid grid-cols-3 mt-5 gap-10">
              {myNfts.map((item, key) => (
                <div key={key} className="p-5 border shadow rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p>{item.name}</p>
                      <p>{item.description}</p>
                    </div>
                    <div>
                      <p className="text-green-700">
                        {"Price: " + item.price + " Eth"}
                      </p>
                      <p className="text-green-700">
                        {"Fraction Price: " + item.distributionPrice + " Eth"}
                      </p>
                    </div>
                  </div>
                  <img
                    alt={"NFT " + key + 1}
                    src={item.image}
                    className="rounded mt-2 w-full"
                  />
                  <div className="flex justify-between mt-2 items-center">
                    <p className="mt-2">{"Partial Owners: " + item.ownerCount}</p>
                    {item.sold ? ( <p className="font-semibold text-red-500">SOLD</p>) : (<p className="font-semibold text-green-500">AVAILABLE</p>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
};

export default History;