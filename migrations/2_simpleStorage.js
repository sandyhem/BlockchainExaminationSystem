var SimpleStorage = artifacts.require("./simpleStorage.sol");

module.exports = function (deployer) {
  deployer.deploy(SimpleStorage);
};