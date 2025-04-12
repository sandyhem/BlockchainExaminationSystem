const QuestionPaperSystem = artifacts.require("QuestionPaperSystem");

contract("QuestionPaperSystem", function (accounts) {
  it("create 10 paper requests", async () => {
    const questionPaperSystemInstance = await QuestionPaperSystem.deployed();

    const promises = [];

    for (let i = 0; i < 10; i++) {
      promises.push(questionPaperSystemInstance.createPaperRequest({ from: accounts[0] }));
    }

    const startTime = new Date().getTime();
    await Promise.all(promises);

    const endTime = new Date().getTime();

    console.log(
      `Call to create 10 paper requests took ${endTime - startTime} milliseconds`
    );
  });

  it("create 30 paper requests", async () => {
    const questionPaperSystemInstance = await QuestionPaperSystem.deployed();

    const promises = [];

    for (let i = 0; i < 30; i++) {
      promises.push(questionPaperSystemInstance.createPaperRequest({ from: accounts[0] }));
    }

    const startTime = new Date().getTime();
    await Promise.all(promises);

    const endTime = new Date().getTime();

    console.log(
      `Call to create 30 paper requests took ${endTime - startTime} milliseconds`
    );
  });

  it("create 50 paper requests", async () => {
    const questionPaperSystemInstance = await QuestionPaperSystem.deployed();

    const promises = [];

    for (let i = 0; i < 50; i++) {
      promises.push(questionPaperSystemInstance.createPaperRequest({ from: accounts[0] }));
    }

    const startTime = new Date().getTime();
    await Promise.all(promises);

    const endTime = new Date().getTime();

    console.log(
      `Call to create 50 paper requests took ${endTime - startTime} milliseconds`
    );
  });

  it("create 75 paper requests", async () => {
    const questionPaperSystemInstance = await QuestionPaperSystem.deployed();

    const promises = [];

    for (let i = 0; i < 75; i++) {
      promises.push(questionPaperSystemInstance.createPaperRequest({ from: accounts[0] }));
    }

    const startTime = new Date().getTime();
    await Promise.all(promises);

    const endTime = new Date().getTime();

    console.log(
      `Call to create 75 paper requests took ${endTime - startTime} milliseconds`
    );
  });

  it("create 100 paper requests", async () => {
    const questionPaperSystemInstance = await QuestionPaperSystem.deployed();

    const promises = [];

    for (let i = 0; i < 100; i++) {
      promises.push(questionPaperSystemInstance.createPaperRequest({ from: accounts[0] }));
    }

    const startTime = new Date().getTime();
    await Promise.all(promises);

    const endTime = new Date().getTime();

    console.log(
      `Call to create 100 paper requests took ${endTime - startTime} milliseconds`
    );
  });
});
