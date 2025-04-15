import React, { useEffect, useState } from "react";
import Web3 from "web3";
import DirectStorage from "../contracts/DirectStorage.json";

export default function UploadPrivateIPFS() {
  const [state, setState] = useState({
    web3: null,
    contract: null,
    account: null,
  });

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  // Connect to MetaMask + Initialize contract
  useEffect(() => {
    async function connectWallet() {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = DirectStorage.networks[networkId];

          if (!deployedNetwork) {
            console.error("Contract not deployed on this network.");
            return;
          }

          const contract = new web3.eth.Contract(
            DirectStorage.abi,
            deployedNetwork.address
          );

          setState({ web3, contract, account: accounts[0] });

          window.ethereum.on("accountsChanged", (accounts) => {
            setState((prevState) => ({ ...prevState, account: accounts[0] }));
          });
        } catch (error) {
          console.error("User denied wallet connection:", error);
        }
      } else {
        console.error("MetaMask not detected.");
      }
    }

    connectWallet();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const convertToBytes = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(new Uint8Array(reader.result));
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!file || !state.contract) {
      alert("Please select a file and ensure contract is loaded.");
      return;
    }

    try {
      setStatus("Reading file...");
      const fileBytes = await convertToBytes(file);

      setStatus("Uploading to blockchain...");

      const gasPrice = await state.web3.eth.getGasPrice();


        const result = await state.contract.methods
        .uploadFile(file.name, fileBytes)
        .send({ from: state.account, gas: 30000000000, gasPrice: gasPrice });
console.log(result);
      setStatus("✅ File uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus("❌ Upload failed. Check console.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Upload File to Blockchain</h2>
      <input type="file" onChange={handleFileChange} className="mb-4" />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload
      </button>
      <p className="mt-3 text-gray-700">{status}</p>
    </div>
  );
}
