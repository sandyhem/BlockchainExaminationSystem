import React, { useState, useEffect } from "react";
import Web3 from "web3";
import QuestionPaperSystem from "../contracts/QuestionPaperSystem.json";
import { useNavigate } from "react-router-dom";
import FileUpload from "./FileUpload";

/* teacher portal papers page */
const PaperUpload = () => {
  const [state, setState] = useState({
    web3: null,
    contract: null,
    account: null,
  });
  const [activePage, setActivePage] = useState("");
  const [paper, setPaper] = useState(null);
  const navigate = useNavigate();
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


  const [paperRequests, setPaperRequests] = useState([]);

  const [formData, setFormData] = useState({
    examId: "",
    examName: "",
    subject: "",
    teacher: "",
    key: "",
  });

  useEffect(() => {
    async function fetchPaperRequests() {
      if (!state.contract) return;

      try {
        const result = await state.contract.methods.getAllPapers().call();
        console.log(result);
        const paperRequestsList = result
  .map((paper, index) => {
    if (paper.teacher === state.account) {
      return {
        examId: paper.ExamId,
        examName: paper.ExamName,
        subject: paper.Subject,
        teacher: paper.teacher,
        key: paper.keyCID,
        paperId: index + 1,
        status:
          Number(paper.status) === 0
            ? "Requested"
            : Number(paper.status) === 1
            ? "Uploaded"
            : "Verified",
      };
    }
    return null;
  })
  .filter(paper => paper !== null); // Filter out the nulls
        console.log("PaperRequests", paperRequestsList);
        setPaperRequests(paperRequestsList);
      } catch (error) {
        console.error("Error fetching Papers:", error);
      }
    }

    fetchPaperRequests();
  }, [state.contract,state.account]);

  return activePage === "uploadPaper" ? (
    <FileUpload state={state} paper={paper} />
  ) : (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Teacher DashBoard</h1>
      </div>

      <div className="card p-4">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Exam ID</th>
              <th>Exam Name</th>
              <th>Subject</th>
              <th>Teacher</th>
              <th>Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {paperRequests.length > 0 ? (
              paperRequests.map((request, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{request.examId}</td>
                  <td>{request.examName}</td>
                  <td>{request.subject}</td>
                  <td>{request.teacher}</td>
                  <td>{request.status}</td>
                  {request.status === "Requested" ? (
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          // navigate("/add-paperUpload");
                          setPaper(request);
                          setActivePage("uploadPaper");
                        }}
                      >
                        Upload
                      </button>
                    </td>
                  ):(<>
                  <td className="text-center">Done</td>
                  </>)
                  }
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No paper requests available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaperUpload;
