import React, { useEffect, useState } from "react";
import Web3 from "web3";
import axios from "axios";
import CryptoJS from "crypto-js";
import QuestionPaperSystem from "../../contracts/QuestionPaperSystem.json";

const Assigned = () => {
  const [state, setState] = useState({
    web3: null,
    contract: null,
    account: null,
  });
  const [accessiblePapers, setAccessiblePapers] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewingPaper, setViewingPaper] = useState(false);
  const [currentPaper, setCurrentPaper] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [fetchingPdf, setFetchingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  

  const secretKey = import.meta.env.VITE_AES_KEY;

  // Connect to MetaMask and load the contract
  useEffect(() => {
    async function connectWallet() {
      if (window.ethereum) {
        try {
          setLoading(true);
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = QuestionPaperSystem.networks[networkId];

          if (!deployedNetwork) {
            console.error("Smart contract not deployed on this network");
            return;
          }

          const contract = new web3.eth.Contract(
            QuestionPaperSystem.abi,
            deployedNetwork.address
          );

          setState({ web3, contract, account: accounts[0] });

          window.ethereum.on("accountsChanged", (accounts) => {
            setState((prev) => ({ ...prev, account: accounts[0] }));
          });
        } catch (error) {
          console.error("Wallet connection error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        alert("Please install MetaMask");
        setLoading(false);
      }
    }

    connectWallet();
  }, []);

  // Fetch accessible papers
  useEffect(() => {
    if (state.contract && state.account) {
      fetchAccessiblePapers();
    }
  }, [state.contract, state.account]);

  // Trigger countdown refresh every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns((prev) => ({ ...prev }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Clean up file URL when closing paper view
  useEffect(() => {
    if (!viewingPaper && fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  }, [viewingPaper, fileUrl]);

  const fetchAccessiblePapers = async () => {
    try {
      setLoading(true);
      const papers = await state.contract.methods.getAllPapers().call();
      const filtered = await Promise.all(
        papers.map(async (paper, idx) => {
          const access = await state.contract.methods
            .accessControl(idx + 1, state.account)
            .call();
          if (access.granted) {
            return {
              paperId: idx + 1,
              ExamId: paper.ExamId,
              Subject: paper.Subject,
              ExamName: paper.ExamName,
              startTime: Number(access.startTime),
              endTime: Number(access.endTime),
            };
          }
          return null;
        })
      );
      setAccessiblePapers(filtered.filter(Boolean));
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch papers:", error);
      setLoading(false);
    }
  };

  const formatTime = (unix) => {
    const date = new Date(unix * 1000);
    return date.toLocaleString();
  };

  const getCountdown = (startTime, endTime) => {
    const now = new Date().getTime();
    const startMillis = startTime * 1000;
    const endMillis = endTime * 1000;

    if (now < startMillis) {
      const diff = startMillis - now;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return `Starts in ${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    if (now >= startMillis && now < endMillis) {
      const remaining = endMillis - now;
      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      return `Ends in ${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    return "Access expired";
  };

  // Decrypt the encrypted file content
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
      setErrorMessage("Failed to decrypt the file. Please check if you have the correct key.");
      return null;
    }
  };

  // Fetch and decrypt file from IPFS
  const fetchFileFromIPFS = async (fileCID) => {
    setFetchingPdf(true);
    setErrorMessage(null);
    
    console.log("Fetching file for CID:", fileCID);

    try {
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${fileCID}`;
      console.log("Fetching from IPFS URL:", ipfsUrl);
      const response = await axios.get(ipfsUrl, { responseType: "text" });
      console.log("Response received:", response);

      const encryptedText = response.data;
      const decryptedBytes = decryptFile(encryptedText);
      if (!decryptedBytes) {
        setFetchingPdf(false);
        return;
      }

      const fileBlob = new Blob([decryptedBytes], { type: "application/pdf" });
      console.log("Blob Created:", fileBlob);

      const url = URL.createObjectURL(fileBlob);
      console.log("Generated Object URL:", url);
      setFileUrl(url);
    } catch (error) {
      console.error("Download failed:", error);
      setErrorMessage("Failed to download the file. Please check your connection or try again later.");
    }

    setFetchingPdf(false);
  };

  const viewPaper = async (paperId) => {
    try {
      console.log("Attempting to view paper with ID:", paperId);
      setFetchingPdf(false);
      setFileUrl(null);
      setErrorMessage(null);

      const data = await state.contract.methods
        .getPaper(paperId)
        .call({ from: state.account });

      // Set current paper data and show the paper view
      const paperData = {
        paperId,
        fileCID: data[0],
        keyCID: data[1],
        examId: data[2],
        examName: data[3],
        subject: data[4],
        status: data[5]
      };
      
      setCurrentPaper(paperData);
      setViewingPaper(true);
      
      // Start fetching the file after showing the paper view
      fetchFileFromIPFS(paperData.fileCID);
      
    } catch (err) {
      console.error("Smart contract error:", err);

      if (err?.data?.message) {
        alert(`Smart Contract Error:\n${err.data.message}`);
      } else if (err?.message) {
        alert(`Error: ${err.message}`);
      } else {
        alert("Unknown error occurred");
      }
    }
  };

  const closePaperView = () => {
    setViewingPaper(false);
    setCurrentPaper(null);
    setFetchingPdf(false);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    setErrorMessage(null);
  };

  const getStatusClass = (paper) => {
    const now = new Date().getTime();
    const startMillis = paper.startTime * 1000;
    const endMillis = paper.endTime * 1000;

    if (now >= startMillis && now <= endMillis) {
      return "border-success";
    } else if (now < startMillis) {
      return "border-warning";
    } else {
      return "border-danger";
    }
  };

  const getStatusBadge = (paper) => {
    const now = new Date().getTime();
    const startMillis = paper.startTime * 1000;
    const endMillis = paper.endTime * 1000;

    if (now >= startMillis && now <= endMillis) {
      return <span className="badge bg-success">Active</span>;
    } else if (now < startMillis) {
      return <span className="badge bg-warning text-dark">Upcoming</span>;
    } else {
      return <span className="badge bg-danger">Expired</span>;
    }
  };

  // Render the papers list view or the paper viewing section
  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa" }}>
      {!viewingPaper ? (
        // Papers List View
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">
                    <i className="fas fa-user-shield me-2"></i> Superintendent Dashboard
                  </h4>
                  {state.account && (
                    <div className="d-flex align-items-center">
                      <div className="bg-success rounded-circle me-2" style={{ width: "10px", height: "10px" }}></div>
                      <small>
                        {state.account.substring(0, 6)}...
                        {state.account.substring(state.account.length - 4)}
                      </small>
                    </div>
                  )}
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="text-primary mb-0">
                    <i className="fas fa-clipboard-list me-2"></i> Your Assigned Exams
                  </h5>
                  <button className="btn btn-sm btn-outline-primary" onClick={fetchAccessiblePapers}>
                    <i className="fas fa-sync-alt me-1"></i> Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : accessiblePapers.length === 0 ? (
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    No accessible exam papers found. You might not have any assigned exams at the moment.
                  </div>
                ) : (
                  <div className="row g-3">
                    {accessiblePapers.map((paper, idx) => {
                      const now = new Date().getTime();
                      const startMillis = paper.startTime * 1000;
                      const endMillis = paper.endTime * 1000;
                      const countdownText = getCountdown(paper.startTime, paper.endTime);
                      const isActive = now >= startMillis && now <= endMillis;
                      const statusClass = getStatusClass(paper);

                      return (
                        <div className="col-md-6 col-lg-4" key={idx}>
                          <div className={`card h-100 shadow-sm ${statusClass}`} style={{ borderLeft: "5px solid" }}>
                            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                              {getStatusBadge(paper)}
                              <span className="badge bg-primary">ID: {paper.ExamId}</span>
                            </div>
                            <div className="card-body">
                              <h5 className="card-title text-primary">{paper.ExamName}</h5>
                              <h6 className="card-subtitle mb-2 text-muted">{paper.Subject}</h6>
                              
                              <div className="mt-3">
                                <div className="d-flex justify-content-between mb-2">
                                  <div className="small text-muted">
                                    <i className="fas fa-calendar-day me-1"></i> Start:
                                  </div>
                                  <div className="small fw-bold">{formatTime(paper.startTime)}</div>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                  <div className="small text-muted">
                                    <i className="fas fa-calendar-check me-1"></i> End:
                                  </div>
                                  <div className="small fw-bold">{formatTime(paper.endTime)}</div>
                                </div>
                              </div>

                              <div className={`alert alert-${isActive ? "success" : now < startMillis ? "warning" : "danger"} py-2 small`}>
                                <i className={`fas ${isActive ? "fa-hourglass-half" : now < startMillis ? "fa-clock" : "fa-lock"} me-1`}></i>
                                <strong>{countdownText}</strong>
                              </div>
                            </div>
                            <div className="card-footer bg-white">
                              {now >= startMillis && now <= endMillis ? (
                                <button
                                  className="btn btn-primary w-100"
                                  onClick={() => viewPaper(paper.paperId)}
                                >
                                  <i className="fas fa-eye me-1"></i> View Paper
                                </button>
                              ) : now < startMillis ? (
                                <button className="btn btn-outline-secondary w-100" disabled>
                                  <i className="fas fa-clock me-1"></i> Available Soon
                                </button>
                              ) : (
                                <button className="btn btn-outline-danger w-100" disabled>
                                  <i className="fas fa-lock me-1"></i> Access Expired
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="card-footer bg-white text-center text-muted small py-2">
                <span>Question Paper Management System</span>
                <span> • </span>
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Paper View with side-by-side layout
        <div className="row">
          <div className="col-12 mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <button 
                className="btn btn-outline-primary" 
                onClick={closePaperView}
              >
                <i className="fas fa-arrow-left me-1"></i> Back to Exam List
              </button>
              <div className="d-flex align-items-center">
                {state.account && (
                  <div className="d-flex align-items-center ms-2">
                    <div className="bg-success rounded-circle me-2" style={{ width: "10px", height: "10px" }}></div>
                    <small>
                      {state.account.substring(0, 6)}...
                      {state.account.substring(state.account.length - 4)}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-primary text-white sticky-top">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">
                    <i className="fas fa-file-alt me-2"></i>
                    {currentPaper?.examName} - {currentPaper?.subject}
                  </h4>
                  <div>
                    {fileUrl && (
                      <a 
                        href={fileUrl} 
                        download={`${currentPaper?.examName}-${currentPaper?.subject}.pdf`}
                        className="btn btn-sm btn-light me-2"
                      >
                        <i className="fas fa-download me-1"></i> Download
                      </a>
                      // <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                      //     <Viewer
                      //       fileUrl={fileUrl}
                      //       renderToolbar={() => null} // Hide the toolbar
                      //     />
                      // </Worker>
                    )}
                    <button 
                      className="btn btn-sm btn-light" 
                      onClick={closePaperView}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Side-by-side layout using Bootstrap grid */}
              <div className="card-body p-3">
                {currentPaper && (
                  <div className="row g-3">
                    {/* Left column - Paper Details */}
                    <div className="col-md-4">
                      <div className="card h-100 shadow-sm">
                        <div className="card-header bg-light d-flex align-items-center">
                          <i className="fas fa-info-circle me-2 text-primary"></i>
                          <strong>Exam Details</strong>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <div className="text-muted small">Exam ID:</div>
                            <div className="fw-bold">{currentPaper.examId}</div>
                          </div>
                          <div className="mb-3">
                            <div className="text-muted small">Exam Name:</div>
                            <div className="fw-bold">{currentPaper.examName}</div>
                          </div>
                          <div className="mb-3">
                            <div className="text-muted small">Subject:</div>
                            <div className="fw-bold">{currentPaper.subject}</div>
                          </div>
                          <div className="mb-3">
                            <div className="text-muted small">Status:</div>
                            <div className="fw-bold">
                              {currentPaper.status === "0" ? 
                                <span className="badge bg-secondary">Draft</span> : 
                                currentPaper.status === "1" ? 
                                  <span className="badge bg-success">Published</span> : 
                                  <span className="badge bg-danger">Archived</span>
                              }
                            </div>
                          </div>
                          
                        

                          {/* Clock icon with current time */}
                          <div className="alert alert-info mt-4">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-clock me-2"></i>
                              <div>
                                <div className="small">Current Time</div>
                                <div className="fw-bold">{new Date().toLocaleTimeString()}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="card-footer bg-white text-center">
                          {fileUrl && (
                            <a 
                              href={fileUrl} 
                              download={`${currentPaper.examName}-${currentPaper.subject}.pdf`}
                              className="btn btn-primary btn-sm w-100"
                            >
                              <i className="fas fa-download me-1"></i> Download PDF
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right column - PDF Viewer */}
                    <div className="col-md-8">
                      <div className="card shadow-sm h-100">
                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                          <div>
                            <i className="fas fa-file-pdf me-2 text-danger"></i>
                            <strong>Question Paper Preview</strong>
                          </div>
                        </div>
                        <div className="card-body p-0" style={{ height: "75vh" }}>
                          {fetchingPdf ? (
                            <div className="d-flex flex-column justify-content-center align-items-center h-100">
                              <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              <p className="mb-0">Fetching and decrypting the question paper...</p>
                            </div>
                          ) : errorMessage ? (
                            <div className="d-flex flex-column justify-content-center align-items-center h-100">
                              <div className="text-danger mb-3">
                                <i className="fas fa-exclamation-triangle fa-3x"></i>
                              </div>
                              <p className="text-danger mb-3">{errorMessage}</p>
                              <button 
                                className="btn btn-outline-primary" 
                                onClick={() => fetchFileFromIPFS(currentPaper.fileCID)}
                              >
                                <i className="fas fa-sync-alt me-1"></i> Try Again
                              </button>
                            </div>
                          ) : fileUrl ? (
                            <iframe 
                              src={fileUrl} 
                              width="100%" 
                              height="100%" 
                              style={{ border: "none" }}
                              title="Question Paper Preview"
                            />
                          ) : (
                            <div className="d-flex flex-column justify-content-center align-items-center h-100">
                              <div className="text-muted mb-3">
                                <i className="fas fa-file-pdf fa-3x"></i>
                              </div>
                              <p className="mb-0">Paper is being prepared for viewing...</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="card-footer bg-white d-flex justify-content-between">
                <button type="button" className="btn btn-outline-secondary" onClick={closePaperView}>
                  <i className="fas fa-arrow-left me-1"></i> Back to Exam List
                </button>
                <span className="text-muted small d-flex align-items-center">
                  <i className="fas fa-shield-alt me-1"></i>
                  Secure Exam Portal
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assigned;