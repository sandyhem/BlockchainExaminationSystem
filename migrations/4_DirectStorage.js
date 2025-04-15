var DirectStorage = artifacts.require("./DirectStorage.sol");

module.exports = function (deployer) {
  deployer.deploy(DirectStorage);
};