require("@nomiclabs/hardhat-waffle");

const fs = require('fs');
const privateKey = fs.readFileSync('.secretkey').toString();

module.exports = {
  networks: {
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/a01d757a6b094cd386dc0ab756349e17",
      accounts: [privateKey]
    }
  },
  solidity: "0.8.4",
};