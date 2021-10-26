import { ethers } from "ethers";
import { create as ipfsHttpClient} from "ipfs-http-client";
import Web3Modal from 'web3modal';
import {useState } from 'react';
import { useHistory } from "react-router-dom";

import { nftaddress, nftmarketaddress } from "../config";

import NFT from '../abi/NFT.json';
import Market from '../abi/NFTMarketplace.json';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');


const CreateItem = () => {

    const [fileURL, setFileURL] = useState("");
    const [formInput, setFormInput] = useState({ name: "", price: "", description: "", distributionPrice: ""})
    let history = useHistory();

    async function onChange(e){
        const file = e.target.files[0];
        try{
            const added = await client.add(
                file,{
                    progress: progress => console.log(`received: ${progress}`)
                }
            )

            const url = `https://ipfs.infura.io/ipfs/${added.path}`;
            setFileURL(url);

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
        <div>
            <div>
                <label>NFT Name</label>
                <input type="text" onChange={e => setFormInput({...formInput, name: e.target.value})} required/>
            </div>
            <div>
                <label>NFT Description</label>
                <textarea  onChange={e => setFormInput({...formInput, description: e.target.value})} required></textarea>
            </div>
            <div>
                <label>NFT Fraction Price</label>
                <input type="text"  onChange={e => setFormInput({...formInput, distributionPrice: e.target.value})} required/>
            </div>
            <div>
                <label>NFT Selling Price</label>
                <input type="text" onChange={e => setFormInput({...formInput, price: e.target.value})} required/>
            </div>
            <div>
                <input type="file" onChange={onChange} required />
            </div>

            { fileURL && (<img width="350" alt="NFT" src={fileURL} /> ) }

            <div>
                <button type="button" onClick={createItem}>Add NFT to Marketplace</button>
            </div>
        </div>
    )
}

export default CreateItem;