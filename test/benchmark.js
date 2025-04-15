const fs = require('fs');
const { assert } = require("chai");
const { default: Web3 } = require('web3');

const QuestionPaperSystem = artifacts.require("QuestionPaperSystem");

const testCases = [
  // { users: 1},
  //   { users: 2 },
  //   { users: 3 },
  //   { users: 4 },
  //   { users: 5 },
  //   { users: 6 },
  //   { users: 7 },
  //   { users: 8 },
  //   { users: 9 },
  //   { users: 10 },
  //   { users: 11 },
  //   { users: 12 },
  //   { users: 13},
  //   { users: 14},
  //   { users: 15},
  //   { users: 16},
  //   { users: 17},
  //   { users: 18},
  //   { users: 19},
  //   { users: 20},
  //   { users: 21},
  //   { users: 22},
  //   { users: 23},
  //   { users: 24},
  //   { users: 25},
  //   { users: 26},
  //   { users: 27},
  //   { users: 28},
  //   { users: 29},
  //   { users: 30},
  //   { users: 31},
  //   { users: 32},
  //   { users: 33},
  //   { users: 34},
  //   { users: 35},
  //   { users: 36},
  //   { users: 37},
  //   { users: 38},
  //   { users: 39},
  //   { users: 40},
  //   { users: 41},
  //   { users: 42},
  //   { users: 43},
  //   { users: 44},
  //   { users: 45},
  //   { users: 46},
  //   { users: 47},
  //   { users: 48},
  //   { users: 49},
    { users: 50},


//   { users: 10 },
//   { users: 20 },
//   { users: 30 },
//   { users: 40 },
//   { users: 50 },
//   { users: 60 },
//   { users: 70 },
//   { users: 80 },
//   { users: 90 },
//   { users: 100 },

];

const gasLimit = 500000;
const gasPrice = Web3.utils.toWei("1", "gwei"); // Adjustable for Besu

contract("QuestionPaperSystem Performance Test (Besu)", (accounts) => {
  let contract;
  let web3Instance;
  const admin = accounts[0];

  before(async () => {
    contract = await QuestionPaperSystem.deployed();
    web3Instance = new Web3(web3.currentProvider);
  });

  const registerUsers = async (count) => {
    const metrics = [];
    const users = [];

    // Create users
    for (let i = 0; i < count; i++) {
      const account = web3Instance.eth.accounts.create();
      users.push(account);
    }

    const start = Date.now();

    // Register users in parallel
    const registrationPromises = users.map(async (user, index) => {
      const txStart = Date.now();
      const tx = await contract.registerUser(
        user.address,
        `User${index}`,
        0, // Teacher
        `user${index}@mail.com`,
        `90000000${index}`,
        {
          from: admin,
          gas: gasLimit,
          gasPrice,
        }
      );
      const txEnd = Date.now();
      const gasUsed = tx.receipt.gasUsed;
      metrics.push({ latency: txEnd - txStart, gasUsed });
    });

    // Wait for all registration transactions to complete
    await Promise.all(registrationPromises);

    const end = Date.now();
    const totalTime = (end - start) / 1000; // in seconds

    const totalGas = metrics.reduce((sum, m) => sum + m.gasUsed, 0);
    const totalLatency = metrics.reduce((sum, m) => sum + m.latency, 0);

    const throughput = count / totalTime;
    const avgLatency = totalLatency / count;
    const avgGas = totalGas / count;

    return {
      totalUsers: count,
      timeTaken: totalTime.toFixed(2),
      throughput: throughput.toFixed(2),
      avgLatency: avgLatency.toFixed(2),
      avgGasUsed: avgGas.toFixed(2),
    };
  };

  it("📈 Performance Benchmark", async () => {
    // CSV Header
    const header = "Run,TotalUsers,TimeTaken(s),Throughput(TPS),AvgLatency(ms),AvgGasUsed\n";
    let csvData = header;
    let run = 1;

    // Testing each case without repeat
    for (const { users } of testCases) {
      const result = await registerUsers(users);
      csvData += `${run},${result.totalUsers},${result.timeTaken},${result.throughput},${result.avgLatency},${result.avgGasUsed}\n`;
      run++;
    }

    // Write results to CSV file
    fs.writeFileSync('performance_results.csv', csvData);
  });
});
