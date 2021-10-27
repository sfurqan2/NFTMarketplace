// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import './NFTFractionsManager.sol';

contract NFTMarketplace is NFTFractionsManager, ReentrancyGuard {
    
    using Counters for Counters.Counter;
    Counters.Counter private _itemsIds;
    Counters.Counter private _itemsSold;

    address payable owner;

    struct Item{
        uint itemId;
        address NFTContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        uint256 distributionPrice;
        bool sold;
    }

    mapping(uint => Item) private idToItem;

    event ItemCreated(
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        uint256 distributionPrice,
        bool sold
    );

    function createItem(address nftContract, uint256 tokenId, uint256 distributionPrice, uint256 price) public payable nonReentrant {
        require(price > 0, "Price should atleast be 1 wei");
        require(distributionPrice > 0, "Distribution Price should atleast be 1 wei");

        _itemsIds.increment();
        uint256 itemId = _itemsIds.current();

        idToItem[itemId] = Item(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            distributionPrice,
            false
        ); 

        addNFTToMarket(nftContract, tokenId);

        emit ItemCreated (
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            distributionPrice,
            false
        );
    }

    function getNFTFraction(uint256 itemId) public payable nonReentrant {
        require(idToItem[itemId].distributionPrice == msg.value, "Please match the amount required to get the share");

        addPartialOwner(idToItem[itemId].tokenId);
    }

    function sellItem(address nftContract, uint256 itemId) public payable nonReentrant{
        uint price = idToItem[itemId].price;
        uint tokenId = idToItem[itemId].tokenId;

        require(msg.value == price, "Price should be equal to the price of the item");
        
        sellNFT(nftContract, tokenId);

        idToItem[itemId].owner = payable(msg.sender);
        idToItem[itemId].sold = true;

        _itemsSold.increment();

    }

    function fetchItems() external view returns(Item[] memory) {
        uint itemCount = _itemsIds.current();
        uint unsoldItemCount = itemCount - _itemsSold.current();
        uint index = 0;
        
        Item[] memory items = new Item[](unsoldItemCount);
        for(uint i = 0; i < itemCount; i++){
            if(!idToItem[i + 1].sold){
                Item storage currentItem = idToItem[i+1];
                items[index] = currentItem;
                index++;
            }
        }

        return items;
    }

    function fetchNFTs() external view returns(Item[] memory){
        uint totalItemCount = _itemsIds.current();
        uint itemCount = 0;
        uint index = 0;

        for(uint i = 0; i < totalItemCount; i++){
            if(idToItem[i+1].owner == msg.sender){
                itemCount++;
            }
        }

        Item[] memory items = new Item[](itemCount);

        for(uint i = 0; i < totalItemCount; i++){
            if(idToItem[i+1].owner == msg.sender){
                Item storage currentItem = idToItem[i+1];
                items[index] = currentItem; 
                index++;
            }
        }

        return items;
    }

    function fetchItemsCreated() external view returns(Item[] memory){
        uint totalItemCount = _itemsIds.current();
        uint itemCount = 0;
        uint index = 0;

        for(uint i = 0; i < totalItemCount; i++){
            if(idToItem[i+1].seller == msg.sender){
                itemCount++;
            }
        }

        Item[] memory items = new Item[](itemCount);

        for(uint i = 0; i < totalItemCount; i++){
            if(idToItem[i+1].seller == msg.sender){
                Item storage currentItem = idToItem[i+1];
                items[index] = currentItem; 
                index++;
            }
        }

        return items;
    }
}
