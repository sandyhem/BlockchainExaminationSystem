import React, { useEffect, useState } from 'react'
import ExamCard from './ExamCard'
import Web3 from "web3";
import QuestionPaperSystem from "../../contracts/QuestionPaperSystem.json";

export default function Papers() {
  // const exams = [
  //   { id: "AU2025", title: "END SEMESTER", subject: "DISTRIBUTED SYSTEMS" },
  //   { id: "AU2026", title: "MID SEMESTER", subject: "COMPUTER NETWORKS" },
  //   { id: "AU2027", title: "QUIZ TEST", subject: "MACHINE LEARNING" },
  // ];
  const [exams,setExams] = useState([]);
  const [state, setState] = useState({
    web3: null,
    contract: null,
    account: null,
  });

  /* Connecting to the wallet! */
    useEffect(() => {
        async function connectWallet() {
          if (window.ethereum) {
            try {
              const web3 = new Web3(window.ethereum);
              await window.ethereum.request({ method: "eth_requestAccounts" });
              const accounts = await web3.eth.getAccounts();
              const networkId = await web3.eth.net.getId();
              const deployedNetwork = QuestionPaperSystem.networks[networkId];

              if (!deployedNetwork) {
                console.error("Contract not deployed on this network.");
                return;
              }

              const contract = new web3.eth.Contract(
                QuestionPaperSystem.abi,
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

    useEffect(() => {
      async function fetchPaperRequests() {
        if (!state.contract) return;

        try {
          const result = await state.contract.methods.getAllPapers().call();
          console.log("result",result);
          const paperRequestsList = result.map((paper, index) => ({
            examId: paper.ExamId,
            examName: paper.ExamName,
            subject: paper.Subject,
            teacher: paper.teacher,
            key:paper.keyCID,
            cid: paper.fileCID,
            status:
              Number(paper.status) === 0
                ? "Requested"
                : Number(paper.status) === 1
                ? "Uploaded"
                : "Verified",
          }));

          console.log("PaperRequests", paperRequestsList);
          setExams(paperRequestsList);
        } catch (error) {
          console.error("Error fetching Papers:", error);
        }
      }

      fetchPaperRequests();
    }, [state.contract]);

  return (
    <ExamCard exams={exams}/>
  )
}
