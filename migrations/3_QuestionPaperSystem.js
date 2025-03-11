var QuestionPaperSystem = artifacts.require("./QuestionPaperSystem.sol");

module.exports = function (deployer) {
  deployer.deploy(QuestionPaperSystem);
};