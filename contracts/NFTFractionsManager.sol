// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTFractionsManager {
    event OwnerAdded(address owner, uint256 tokenId, address[] owners);

    mapping(uint256 => address[]) private tokenToPartialOwners;
    mapping(uint256 => uint256) private tokenToPartialOwnerCount;
    mapping(uint256 => address) private tokenToOwner;

    function addPartialOwner(uint256 tokenId) public payable {
        address payable owner = payable(tokenToOwner[tokenId]);
        owner.transfer(msg.value);

        tokenToPartialOwners[tokenId].push(payable(msg.sender));
        tokenToPartialOwnerCount[tokenId]++;

        emit OwnerAdded(msg.sender, tokenId, tokenToPartialOwners[tokenId]);
    }

    function addNFTToMarket(address nftContract, uint256 tokenId) public {
        tokenToOwner[tokenId] = msg.sender;

        tokenToPartialOwners[tokenId].push(msg.sender);
        tokenToPartialOwnerCount[tokenId]++;

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
    }

    function sellNFT(address nftContract, uint256 tokenId) public payable {
        address[] memory owners = tokenToPartialOwners[tokenId];
        uint256 ownerCount = tokenToPartialOwnerCount[tokenId] + 1;

        uint256 pricePerShare = msg.value / ownerCount;

        for (uint256 i = 0; i < ownerCount - 1; i++) {
            address payable owner = payable(owners[i]);
            owner.transfer(pricePerShare);
            owners[i] = address(0);
        }

        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        tokenToPartialOwnerCount[tokenId] = 1;
        tokenToOwner[tokenId] = msg.sender;
    }

    function getOwners(uint256 tokenId) public view returns (address[] memory) {
        return tokenToPartialOwners[tokenId];
    }

    function getOwnerCount(uint256 tokenId) public view returns(uint256) {
        return tokenToPartialOwnerCount[tokenId];
    }
}
