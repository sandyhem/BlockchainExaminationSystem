const QuestionPaperSystem = artifacts.require("QuestionPaperSystem");
const { assert } = require("chai");

contract("QuestionPaperSystem", (accounts) => {
  let contract;
  const admin = accounts[0];
  const teacher = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
  const superintendent = accounts[2];

  before(async () => {
    contract = await QuestionPaperSystem.deployed();
  });

  it("should register a new user", async () => {
    
    await contract.registerUser(
      "0x627306090abaB3A6e1400e9345bC60c78a8BEf57", 
      "chithra", 
      0, 
      "chithra@gmail.com", 
      "9677959337", 
      { from: admin }
    );

    // Fetch the registered user to check if it is successfully registered
    const user1 = await contract.users("0x627306090abaB3A6e1400e9345bC60c78a8BEf57");

    // Check the user details
    assert.equal(user1.name, "chithra");
    assert.equal(user1.role.toString(), "0"); // Teacher role is 0
    assert.isTrue(user1.isActive);
  });

  // Other tests...
});
