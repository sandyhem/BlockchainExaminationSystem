import React, { useState, useEffect } from "react";
import Web3 from "web3";
import QuestionPaperSystem from "../contracts/QuestionPaperSystem.json";
import axios from "axios";
import CryptoJS from "crypto-js";
/* Notification */
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const CreatePaperRequest = () => {

  const [state, setState] = useState({
    web3: null,
    contract: null,
    account: null,
  });
 const [activePage, setActivePage] = useState("");
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

  const [showTable, setShowTable] = useState(
    () => JSON.parse(localStorage.getItem("showTable")) || false
  );

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
        console.log("result",result);
        const paperRequestsList = result.map((paper, index) => ({
          index: index,
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
        setPaperRequests(paperRequestsList);
      } catch (error) {
        console.error("Error fetching Papers:", error);
      }
    }

    fetchPaperRequests();
  }, [state.contract]);

  // Save state in localStorage
  useEffect(() => {
    localStorage.setItem("showTable", JSON.stringify(showTable));
  }, [showTable]);

  /* Notification */
  const showToastSuccess = (msg) => {
    toast.success(msg, {
      position: "top-right"
    });
  };
  
  const showToastError = (msg) => {
    toast.warning(msg, {
      position: "top-right",
    });
  };
/******************** */
  const [cid, setCid] = useState("");
  // const [secretKey,setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  const secretKey = import.meta.env.VITE_AES_KEY;

  const decryptFile = (encryptedText) => {
    try {
      console.log("Encrypted Text Input:", encryptedText);
      
      // Decrypt the text
      const decrypted = CryptoJS.AES.decrypt(encryptedText, CryptoJS.enc.Utf8.parse(secretKey), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      
      console.log("Decrypted WordArray:", decrypted);
      
      // Convert the decrypted WordArray to a Uint8Array
      const decryptedBytes = new Uint8Array(decrypted.sigBytes);
      for (let i = 0; i < decrypted.sigBytes; i++) {
        decryptedBytes[i] = (decrypted.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      }
      
      console.log("Decrypted Bytes:", decryptedBytes);
      return decryptedBytes;
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  };

  const fetchFileFromIPFS = async () => {
    // if (!cid) {
    //   alert("Please enter a CID.");
    //   return;
    // }

    setLoading(true);
    console.log("Fetching file for CID:", cid);

    try {
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
      console.log("Fetching from IPFS URL:", ipfsUrl);
      const response = await axios.get(ipfsUrl, { responseType: "text" });
      console.log("Response received:", response);

      const encryptedText = response.data;
      const decryptedBytes = decryptFile(encryptedText);
      if (!decryptedBytes) {
        alert("Decryption failed.");
        setLoading(false);
        return;
      }

      const fileBlob = new Blob([decryptedBytes], { type: "application/pdf" });
      console.log("Blob Created:", fileBlob);

      const url = URL.createObjectURL(fileBlob);
      console.log("Generated Object URL:", url);
      setFileUrl(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Check console for details.");
    }

    setLoading(false);
  };
  
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createPaperRequest();
    setFormData({
      examId: "",
      examName: "",
      subject: "",
      teacher: "",
      key: "",
    });
    setShowTable(true);
    // window.location.reload();
  };

  
  async function createPaperRequest() {
    const { contract, account, web3  } = state;
    if (!account) {
      alert("Please connect your wallet!");
      return;
    }
    try {

      function generateRandomKey(length) {
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      }
    
    // 256-bit key = 32 bytes
    const aesKeyForPaper = generateRandomKey(32);
    console.log(aesKeyForPaper)
    
      const gasPrice = await web3.eth.getGasPrice();

      await contract.methods
        .createPaperRequest(
          formData.teacher,
          aesKeyForPaper,
          formData.examId,
          formData.examName,
          formData.subject
        )
        .send({ from: account, gasPrice });
        showToastSuccess("Registration successful");
    } catch (error) {
      console.error("Transaction failed:", error);
      // alert(error);
      showToastError("Registration failed");
      if (error.message.includes("execution reverted")) {
          const errorMessage = error.message.split("reverted with reason string '")[1]?.split("'")[0];
          console.log(`Transaction failed: ${errorMessage || "Unknown error"}`);
      } else {
          console.log("Transaction failed. Check console for details.");
      }
  }
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{showTable ? "View Paper Requests" : "Create Paper Request"}</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowTable(!showTable)}
        >
          {showTable ? "Create Paper Request" : "View Paper Requests"}
        </button>
      </div>

      { activePage === "viewPaper" ? (<></>):
      showTable ? (
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
                <th>Action</th>
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
                    {request.status === "Uploaded" || request.status === "Verified" ? (
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            // setCid(request.cid)
                            // // setSecretKey(request.key)
                            // fetchFileFromIPFS()
                            navigate("/verify-paper", {
                              state: {
                                paperId: index + 1,
                                examId: request.examId,
                                examName: request.examName,
                                subject: request.subject,
                                key: request.key,
                                cid: request.cid,
                                teacher: request.teacher
                              },
                            });
                          }}
                        >
                          View
                        </button>
                      </td>
                    ):(
                      <>
                        <td className="text-center">Pending</td>
                      </>
                    )}
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
          {fileUrl && (
        <div>
          {/* <a href={fileUrl} download="decrypted.pdf">Download PDF</a> */}
          <iframe
            src={fileUrl}
            style={{ width: "80%", height: "600px", marginTop: "20px" }}
            title="Decrypted PDF"
          ></iframe>
        </div>
      )}
          
        </div>
      ) : (
        <div className="card p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="examId" className="form-label">
                Exam ID
              </label>
              <input
                type="text"
                id="examId"
                value={formData.examId}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="examName" className="form-label">
                Exam Name
              </label>
              <input
                type="text"
                id="examName"
                value={formData.examName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="subject" className="form-label">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="teacher" className="form-label">
                Teacher Address
              </label>
              <input
                type="text"
                id="teacher"
                value={formData.teacher}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            {/* <div className="mb-3">
                            <label htmlFor="key" className="form-label">Subject</label>
                            <input
                                type="text"
                                id="key"
                                value={formData.key}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div> */}
            <button type="submit" className="btn btn-success">
              Create Request
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreatePaperRequest;
