
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a managed Ganache instance for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */
require('dotenv').config();
const { MNEMONIC, PROJECT_ID } = process.env;

const HDWalletProvider = require('@truffle/hdwallet-provider');


const PrivateKeyProvider = require("@truffle/hdwallet-provider");
// const privateKey = [
//   "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63",
//   "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
//   "ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",
//   "b8d089e0df9f0ce14aee8795bd562d9357acd45f813858f7b0bcb8733f105956"
// ];
const privateKey = "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63";


const privateKeyProvider = new PrivateKeyProvider(
  privateKey,
  "http://localhost:8545", 
  //"http://192.168.110.73:8545",
);

module.exports = {

  
  contracts_build_directory:"./client/src/contracts",
  networks: {
   
    // development: {
    //  host: "127.0.0.1",    
    //  port: 7545,            
    //  network_id: "*",       
    // },
    besuWallet: {
      provider: privateKeyProvider,
      network_id: "1337",
    },
    // besuAzure: {
    //   host: "172.191.148.87", // your Azure VM's public IP
    //   port: 8545,
    //   network_id: "*",
    //   skipDryRun: true,
    //   timeoutBlocks: 200
    // }
    
  },

  
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.11",      // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },

};
