import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CryptoJS from "crypto-js";
import axios from "axios";
import "../../css/Verify.css"; 
import Web3 from "web3";
import QuestionPaperSystem from "../../contracts/QuestionPaperSystem.json";
import useAccessLogs from "./UserAccessLogs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

export default function ViewPaper() {
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(false); //done
  const [accessLogs, setAccessLogs] = useState([]);
  const [paperDetails, setPaperDetails] = useState({}); //done

  //prop pass the paper details
  const { state } = useLocation();
  const paperId = state?.paperId;
  const examName = state?.examName;
  const subject = state?.subject;
  const examId = state?.examId;
  const key = state?.key;
  const cid = state?.cid;
  const teacher = state?.teacher;

  const [accessUsers, setAccessUsers] = useState("");
  const [blockNumeber, setBlockNumber] = useState("");

  const [states, setStates] = useState({
    web3: null,
    contract: null,
    account: null,
  });
  /****************************************************** */
  /*Fetch The contents of the page....... */
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
          setStates({ web3, contract, account: accounts[0] });

          window.ethereum.on("accountsChanged", (accounts) => {
            setStates((prevState) => ({ ...prevState, account: accounts[0] }));
          });

          setBlockNumber(await web3.eth.getBlockNumber());
          console.log("cid", cid);
          console.log("key", key);
          console.log("state:", state);
        } catch (error) {
          console.error("User denied wallet connection:", error);
        }
      } else {
        console.error("MetaMask not detected.");
      }
    }
    connectWallet();
  }, []);

  /**************************************************** */
  /* Contracts */

  const fetchPaperDetails = async () => {
    const { contract, account } = states;
    let reason = "Access Denied";
    let success = false;
    if (!contract || !account) {
      console.warn("Web3 or contract not initialized yet.");
      return;
    }
    try {
      const gasPrice = await states.web3.eth.getGasPrice();
      const result = await contract.methods
        .getPaper(paperId)
        .send({ from: account, gasPrice });
      console.log("result in the verify paper:", paperId, result);
      console.log(result.sucess);
      // setCid(result.fileCID);
      // setKeyCid(result.keyCID);
      setPaperDetails(result);
      console.log("check cid", cid);
      console.log("check key", key);

      fetchFileFromIPFS();
      success=true                  // success,
      reason="Access Granted"      // reason,

    } catch (error) {
      console.error("Error fetching paper:", error);

    }
    try {
      
      const gasPrice = await states.web3.eth.getGasPrice();
      await states.contract.methods.setAccessLogs(
        paperId,
        success,                   // success,
        reason,      // reason,
        Math.floor(Date.now() / 1000)
      ).send({ from: account, gasPrice });
    } catch (error) {
      console.error("Error in logging:", error);
    }
    try {
      const fetchAccessLogs = async () => {
        if (states.contract) {
          const logs = await states.contract.methods.getAccessLogs().call();
          console.log("Access Logs..............:", logs);
          setLogs(logs);
        }
      };
  
      fetchAccessLogs();
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const AddUser = async () => {
    console.log("formdata:", formData);
    const { contract, account } = states;
    if (!contract || !account) {
      console.warn("Web3 or contract not initialized yet.");
      return;
    }
    try {
      const gasPrice = await states.web3.eth.getGasPrice();
      const result = await contract.methods
        .grantAccess(
          paperId,
          formData.user,
          formData.startUnix,
          formData.endUnix
        )
        .send({ from: account, gasPrice });
      alert("Access Granted",result);
    } catch (error) {
      console.error("Error fetching paper:", error);
    }
  };

  async function getUsersWithAccess() {
    try {
      const accounts = await states.web3.eth.getAccounts();
  
      const result = await states.contract.methods
        .getAllUsers()
        .call({ from: accounts[0] });
  
      console.log("results:", result);
  
      const addresses = result[0];
      const users = result[1];
  
      const accessibleUsers = [];
  
      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
   
        try {
         
          const access = await states.contract.methods
          .accessControl(paperId, address)
          .call({ from: accounts[0] });
           console.log("the hem:",access);
        if (access.granted) {
          accessibleUsers.push({
            address,            
            start: access.startTime,
            end: access.endTime,
          });
        } 
        } catch (error) {
          console.error("Error checking access:", extractError(error));
        }
      }
  
      console.log("access:", accessibleUsers);
      setAccessUsers(accessibleUsers);
    } catch (outerError) {
      console.error("Error in getUsersWithAccess:", extractError(outerError));
    }
  }
  
  // Utility to extract readable error messages from nested errors
  function extractError(error) {
    if (error?.data?.message) return error.data.message;
    if (error?.message) return error.message;
    return String(error);
  }
  
  const [remuser,setRemUser] = useState("");

  const revokeAccess = async() => {
    const { contract, account } = states;
    if (!contract || !account) {
      console.warn("Web3 or contract not initialized yet.");
      return;
    }
    try {
      const gasPrice = await states.web3.eth.getGasPrice();
      const result = await contract.methods
        .revokeAccess(paperId, remuser)
        .send({ from: account, gasPrice });
      alert("Access Revoked");
      window.location.reload();
    } catch (error) {
      console.error("Error fetching paper:", error);
    }
  }
  /*************************************************** */
  /* Decrypting the File... */
  const secretKey = import.meta.env.VITE_AES_KEY;

  const decryptFile = (encryptedText) => {
    try {
      console.log("Encrypted Text Input:", encryptedText);

      // Decrypt the text
      const decrypted = CryptoJS.AES.decrypt(
        encryptedText,
        CryptoJS.enc.Utf8.parse(secretKey),
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      console.log("Decrypted WordArray:", decrypted);

      // Convert the decrypted WordArray to a Uint8Array
      const decryptedBytes = new Uint8Array(decrypted.sigBytes);
      for (let i = 0; i < decrypted.sigBytes; i++) {
        decryptedBytes[i] =
          (decrypted.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
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
      //  alert("Download failed. Check console for details.");
    }

    setLoading(false);
  };

  /************************************************** */
  /* Utility functions: */

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Format date for display
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const [logs,setLogs] = useState([]);

  useEffect(() => {
    const fetchAccessLogs = async () => {
      if (states.contract) {
        const logs = await states.contract.methods.getAccessLogs().call();
        console.log("Access Logs:", logs);
        setLogs(logs);
      }
    };

    fetchAccessLogs();
  }, [states.contract]);
 
  // Remove duplicates based on all fields matching
  const uniqueLogs = logs.filter(
    (log, index, self) =>
      index ===
      self.findIndex(
        (l) =>
          
          l.paperId === log.paperId &&
          l.user === log.user &&
          l.success === log.success &&
          l.reason === log.reason &&
          l.timestamp === log.timestamp 
      )
  ).sort((a, b) => Number(b.timestamp) - Number(a.timestamp));



  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  const totalPages = Math.ceil(logs.length / logsPerPage);
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = uniqueLogs.slice(indexOfFirstLog, indexOfLastLog);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // const [timeRange, setTimeRange] = useState({ startUnix: null, endUnix: null });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [formData, setFormData] = useState({
    user: "",
    startUnix: "",
    endUnix: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    console.log(id, value);
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleStartChange = (date) => {
    setStartDate(date);
    if (endDate) emitChange(date, endDate);
  };

  const handleEndChange = (date) => {
    setEndDate(date);
    if (startDate) emitChange(startDate, date);
  };

  const emitChange = (start, end) => {
    // setTimeRange({
    // startUnix: Math.floor(start.getTime() / 1000),
    // endUnix: Math.floor(end.getTime() / 1000),
    // });
    setFormData((prevState) => ({
      ...prevState,
      startUnix: Math.floor(start.getTime() / 1000),
      endUnix: Math.floor(end.getTime() / 1000),
    }));
  };

  useEffect(()=>{
    revokeAccess()
    setRemUser("");
  },[remuser])
  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        {/* <div className="col-md-3 col-lg-2 d-md-block bg-primary sidebar collapse">
          <div className="position-sticky pt-3">
            <div className="text-center mb-4">
              <img src="/api/placeholder/80/80" alt="Logo" className="rounded-circle bg-white p-2" />
              <h5 className="text-white mt-2">Admin Dashboard</h5>
            </div>
            <ul className="nav flex-column">
              <li className="nav-item">
                <a className="nav-link active text-white" href="#">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Question Papers
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white" href="#">
                  <i className="bi bi-people me-2"></i>
                  User Management
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white" href="#">
                  <i className="bi bi-shield-lock me-2"></i>
                  Access Control
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white" href="#">
                  <i className="bi bi-diagram-3 me-2"></i>
                  Blockchain Status
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-white" href="#">
                  <i className="bi bi-gear me-2"></i>
                  Settings
                </a>
              </li>
            </ul>
          </div>
        </div> */}

        {/* Main Content */}
        <main className="">
          {/* download,manage,... */}
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h2>
              <i className="bi bi-file-earmark-text me-2 text-primary"></i>
              Question Paper View
            </h2>
            {/* <div className="btn-toolbar mb-2 mb-md-0">
              <div className="btn-group me-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                >
                  <i className="bi bi-download me-1"></i> Download
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                >
                  <i className="bi bi-printer me-1"></i> Print
                </button>
              </div>
              <button type="button" className="btn btn-sm btn-primary">
                <i className="bi bi-lock me-1"></i> Manage Access
              </button>
            </div> */}
          </div>

          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading paper data from blockchain...</p>
            </div>
          ) : (
            <div className="row">
              {/* Paper Details Card - completed */}
              <div className="col-md-4 mb-4">
                <div className="card border-primary h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      Paper Details
                    </h5>
                  </div>

                  <div className="card-body">
                    <div className="paper-detail-item">
                      <span className="text-muted">Exam ID:</span>
                      <span className="fw-bold">{examId || "N/A"}</span>
                    </div>
                    <div className="paper-detail-item">
                      <span className="text-muted">Exam Name:</span>
                      <span className="fw-bold">{examName || "N/A"}</span>
                    </div>
                    <div className="paper-detail-item">
                      <span className="text-muted">Subject:</span>
                      <span className="fw-bold">{subject || "N/A"}</span>
                    </div>
                    <div className="paper-detail-item">
                      <span className="text-muted">Uploaded By:</span>
                      <span className="text-monospace">
                        {formatAddress(teacher) || "N/A"}
                      </span>
                    </div>
                    <div className="paper-detail-item">
                      <span className="text-muted">status:</span>
                      <span className="text-monospace small">
                        {Number(paperDetails.status) == 0
                          ? "Requested"
                          : Number(paperDetails.status) == 1
                          ? "Verified"
                          : Number(paperDetails.status) == 2
                          ? "Rejected"
                          : "N/A"}
                      </span>
                    </div>
                    <div className="row text-monospace">
                      <i className="text-muted m-2">Instructions:</i>
                      <li>Verify student ID cards before allowing entry.</li>
                      <li>
                        Start the exam on time and display a visible timer.
                      </li>
                      <li>
                        Ensure all devices (phones, smartwatches) are switched
                        off and kept away.
                      </li>
                      <li>
                        Distribute question papers only after the official start
                        signal.
                      </li>
                      <li>
                        Maintain silence and monitor continuously by walking
                        around.
                      </li>
                      <li>
                        Do not allow unauthorized materials like notes or books.
                      </li>
                      <li>Collect all answer sheets before students leave.</li>
                      <li>
                        Seal and submit answer scripts securely to the exam
                        coordinator.
                      </li>
                    </div>
                  </div>
                  {/* <div className="card-footer bg-white">
                    <div className="d-flex justify-content-between">
                      <button className="btn btn-sm btn-outline-primary">
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                      <button className="btn btn-sm btn-danger">
                        <i className="bi bi-trash me-1"></i> Delete
                      </button>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* PDF Viewer - completed*/}
              <div className="col-md-8 mb-4">
                <div className="card border-primary h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-file-earmark-pdf me-2"></i>
                      Question Paper Preview
                    </h5>
                  </div>
                  <div className="card-body pdf-container">
                    {Number(paperDetails.status) == 1 && fileUrl ? (
                      // <iframe
                      //   src={fileUrl}
                      //   className="pdf-iframe"
                      //   title="Decrypted PDF"
                      // ></iframe>
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                      <Viewer
                        fileUrl={fileUrl}
                        renderToolbar={() => null} // Hide the toolbar
                      />
                    </Worker>
                    ) : (
                      <div className="text-center py-5">
                        <i
                          className="bi bi-file-earmark-x text-muted"
                          style={{ fontSize: "3rem" }}
                        ></i>
                        <p className="mt-3">PDF preview not available</p>
                        <button
                          className="btn btn-primary mt-2"
                          onClick={() => fetchPaperDetails()}
                        >
                          <i className="bi bi-arrow-repeat me-1"></i> View Paper
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Access Logs Table  - partial*/}
              <div className="col-12 mb-4">
                <div className="card border-primary">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-clock-history me-2"></i>
                      Recent Access Logs
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Time</th>
                            <th>User Address</th>
                            <th>Status</th>
                            <th>Reason</th>
                          
                         
                          </tr>
                        </thead>
                        <tbody>
                          {currentLogs.length > 0 ? (
                            currentLogs.map((log, index) => (
                              <tr key={index}>
                                {
                                  
                                }
                                <td>{new Date(Number(log.timestamp) * 1000).toLocaleString()}</td>
                                {/* <td>{log.timestamp}</td> */}
                                <td className="text-monospace">
                                  {formatAddress(log.user)}
                                  <FontAwesomeIcon
                                    icon={faCopy}
                                    className="ms-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => copyToClipboard(log.user)}
                                  />
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                      log.success ? "bg-success" : "bg-danger"
                                    }`}
                                  >
                                    {log.success ? "SUCCESS" : "FAILED"}
                                  </span>
                                </td>
                                <td>{log.reason}</td>

                                
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="text-center py-3">
                                No access logs found
                              </td>
                            </tr>
                          )}
                        </tbody>

                        {/* Pagination Controls */}
                        {logs.length > logsPerPage && (
                          <tfoot>
                            <tr>
                              <td colSpan="6" className="text-center">
                                <button
                                  className="btn btn-sm btn-outline-secondary me-2"
                                  onClick={() => goToPage(currentPage - 1)}
                                  disabled={currentPage === 1}
                                >
                                  Previous
                                </button>
                                <span className="me-2">
                                  Page {currentPage} of {totalPages}
                                </span>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => goToPage(currentPage + 1)}
                                  disabled={currentPage === totalPages}
                                >
                                  Next
                                </button>
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                  <div className="card-footer bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">
                        Showing {uniqueLogs.length + 1} entries
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Status - completed */}
              <div className="col-md-6 mb-4">
                <div className="card border-primary">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-diagram-3 me-2"></i>
                      Blockchain Status
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="stats-card bg-light p-3 rounded mb-3">
                          <div className="d-flex justify-content-between">
                            <div>
                              <h6 className="text-muted mb-1">Network</h6>
                              <h4 className="mb-0">Besu Private Network</h4>
                            </div>
                            <div className="stats-icon bg-primary rounded-circle">
                              <i className="bi bi-hdd-network text-white"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="stats-card bg-light p-3 rounded mb-3">
                          <div className="d-flex justify-content-between">
                            <div>
                              <h6 className="text-muted mb-1">Consensus</h6>
                              <h4 className="mb-0">Proof of Authority</h4>
                            </div>
                            <div className="stats-icon bg-primary rounded-circle">
                              <i className="bi bi-fuel-pump text-white"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="stats-card bg-light p-3 rounded">
                          <div className="d-flex justify-content-between">
                            <div>
                              <h6 className="text-muted mb-1">Block Height</h6>

                              <h4 className="mb-0">{blockNumeber}</h4>
                            </div>
                            <div className="stats-icon bg-primary rounded-circle">
                              <i className="bi bi-boxes text-white"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="stats-card bg-light p-3 rounded">
                          <div className="d-flex justify-content-between">
                            <div>
                              <h6 className="text-muted mb-1">Contract</h6>
                              <h4 className="mb-0 text-success">Active</h4>
                            </div>
                            <div className="stats-icon bg-primary rounded-circle">
                              <i className="bi bi-file-earmark-code text-white"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Control */}
              <div className="col-md-6 mb-4">
                <div className="card border-primary">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">
                      <i className="bi bi-shield-lock me-2"></i>
                      Access Control
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <input
                        type="text"
                        id="user"
                        value={formData.user}
                        onChange={handleChange}
                        className="form-control m-2"
                        placeholder="User address (0x...)"
                      />

                      <div className="d-flex gap-3">
                        <div>
                          <DatePicker
                            selected={startDate}
                            onChange={handleStartChange}
                            showTimeSelect
                            timeIntervals={15}
                            dateFormat="Pp"
                            placeholderText="Select start"
                            className="form-control m-2"
                          />
                        </div>
                        <div>
                          <DatePicker
                            selected={endDate}
                            onChange={handleEndChange}
                            showTimeSelect
                            timeIntervals={15}
                            dateFormat="Pp"
                            placeholderText="Select end"
                            className="form-control m-2"
                          />
                        </div>
                      </div>
                      <button
                        className="btn btn-primary m-2"
                        type="button"
                        onClick={AddUser}
                      >
                        Add User
                      </button>
                      <button 
                       className="btn btn-primary m-2"
                        type="button"
                      onClick={getUsersWithAccess}>
                            View Users
                      </button>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead className="table-light">
                          <tr>
                            <th>User</th>
                            <th>Valid from</th>
                            <th>Valid Until</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          
                          {accessUsers.length > 0 ? (
                            accessUsers.map((user, index) => (
                              <tr key={index}>
                                <td className="text-monospace">
                                  {user.address}
                                </td>
                                <td>
                                  {new Date(
                                    Number(user.start) * 1000
                                  ).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                  </td>
                                  <td>
                                  {new Date(
                                    Number(user.end) * 1000
                                  ).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </td>

                                <td>
                                  <button 
                                  onClick={()=>{
                                    setRemUser(user.address);
                                  }}
                                  className="btn btn-sm btn-outline-danger">
                                    Revoke
                                  </button>
                                </td> 
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center">
                                No users with access
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
