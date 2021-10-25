require("@nomiclabs/hardhat-waffle");
require('hardhat-abi-exporter');

const { resolve } = require("path");

const { config: dotenvConfig } = require("dotenv");

dotenvConfig({ path: resolve(__dirname, "./.env") });

const chainIds = {
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};

// Ensure that we have all the environment variables we need.
const mnemonic = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

const infuraApiKey = process.env.INFURA_API_KEY;
if (!infuraApiKey) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
}

function getChainConfig(network) {
  const url = "https://" + network + ".infura.io/v3/" + infuraApiKey;
  return {
    accounts: {
      count: 10,
      mnemonic,
    },
    chainId: chainIds[network],
    url,
  };
}

const config = {
  abiExporter: {
    path: './src/abi',
    clear: true,
    flat: true,
    spacing: 2,
    pretty: true,
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      chainId: chainIds.hardhat,
    },
    goerli: getChainConfig("goerli"),
    kovan: getChainConfig("kovan"),
    rinkeby: getChainConfig("rinkeby"),
    ropsten: getChainConfig("ropsten"),
  },
  solidity: {
    version: "0.8.0",
  },
};

module.exports = config;