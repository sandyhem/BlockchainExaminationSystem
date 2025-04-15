
import Web3 from "web3";
import QuestionPaperSystem from "../contracts/QuestionPaperSystem.json";

const init = async () => {
  const provider = new Web3("ws://127.0.0.1:8546");
  const web3 = new Web3(provider);
  const netId = await web3.eth.net.getId();

  const cbdc = new web3.eth.Contract(
    QuestionPaperSystem.abi,
    QuestionPaperSystem.networks[netId].address
  );

  const address = await cbdc.methods.digitalRupee().call();

  const token = new web3.eth.Contract(DigitalRupee_build.abi, address);

  token.events.Redemption({}).on("data", (event) => console.log(event));
};

init();