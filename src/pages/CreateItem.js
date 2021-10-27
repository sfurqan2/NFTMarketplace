import { ethers } from "ethers";
import { create as ipfsHttpClient} from "ipfs-http-client";
import Web3Modal from 'web3modal';
import {useState } from 'react';
import { useHistory } from "react-router-dom";

import { nftaddress, nftmarketaddress } from "../config";

import {abi as NFT} from "../artifacts/contracts/NFT.sol/NFT.json";
import {abi as Market} from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');


const CreateItem = () => {

    const [fileURL, setFileURL] = useState("");
    const [fileLoading, setFileLoading] = useState(false);
    const [formInput, setFormInput] = useState({ name: "", price: "", description: "", distributionPrice: ""})
    let history = useHistory();

    async function onChange(e){
        setFileLoading(true);
        const file = e.target.files[0];
        try{
            const added = await client.add(
                file,{
                    progress: progress => console.log(`received: ${progress}`)
                }
            )

            const url = `https://ipfs.infura.io/ipfs/${added.path}`;
            setFileURL(url);
            setFileLoading(false);
        }catch(e){
            console.error(e);
        }
    }

    async function createItem(){
        const {name, distributionPrice, price, description} = formInput;
        if(!name || !distributionPrice || !price || !description || !fileURL) {console.log({name,description,distributionPrice, price}); return};

        const data = JSON.stringify({
            name, description, image: fileURL
        });

        try{
            const added = await client.add(data);
            const url = `https://ipfs.infura.io/ipfs/${added.path}`;

            addItemToMarket(url);
        }catch(e){
            console.error("Error uploading file: ", e);
        }
    }

    async function addItemToMarket(url){
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        const signer = provider.getSigner();
        let contract = new ethers.Contract(nftaddress, NFT, signer);
        
        let transaction = await contract.createToken(url);

        const tx = await transaction.wait();
        
        let event = tx.events[0];
        let value = event.args[2];
        let tokenId = value.toNumber();

        const price = ethers.utils.parseUnits(formInput.price, "ether");
        const distributionPrice = ethers.utils.parseUnits(formInput.distributionPrice, "ether");

        contract = new ethers.Contract(nftmarketaddress, Market, signer);

        transaction = await contract.createItem(nftaddress, tokenId, distributionPrice, price);
        await transaction.wait();

        alert("Transaction completed!");
        history.push('/');
        
    }

    return(
        <div className="flex-1 flex items-center">
            <div className="border shadow rounded mt-2 mx-auto max-w-lg w-full">
                <div className="p-5 border-b">
                    <h1 className="text-xl font-semibold">Add NFT to Marketplace</h1>
                </div>
                <div className="p-5">
                    <div className="flex items-center">
                        <label className="w-40">NFT Name</label>
                        <input className="flex-1" type="text" onChange={e => setFormInput({...formInput, name: e.target.value})} required/>
                    </div>
                    <div className="flex items-center mt-2">
                        <label className="w-40">NFT Description</label>
                        <textarea className="flex-1" onChange={e => setFormInput({...formInput, description: e.target.value})} required></textarea>
                    </div>
                    <div className="flex items-center mt-2">
                        <label className="w-40">NFT Fraction Price</label>
                        <input className="flex-1" type="text"  onChange={e => setFormInput({...formInput, distributionPrice: e.target.value})} required/>
                    </div>
                    <div className="flex items-center mt-2">
                        <label className="w-40">NFT Selling Price</label>
                        <input className="flex-1" type="text" onChange={e => setFormInput({...formInput, price: e.target.value})} required/>
                    </div>
                    <div className="mt-2">
                        <input type="file" onChange={onChange} required />
                    </div>

                    { (fileLoading ? <img width="350" height="300" className="contain m-auto bg-gray-100 mt-2" alt="Loading" src="https://i.pinimg.com/originals/d7/34/49/d73449313ecedb997822efecd1ee3eac.gif"/> : <img width="350" height="300" className="contain m-auto bg-gray-100 mt-2" alt="NFT" src={fileURL ? fileURL: "https://socialistmodernism.com/wp-content/uploads/2017/07/placeholder-image.png?w=640"} />)  }

                    <div className="mt-2">
                        <button type="button" onClick={createItem} className="w-full px-4 py-3 bg-green-600 text-white">Add NFT to Marketplace</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateItem;