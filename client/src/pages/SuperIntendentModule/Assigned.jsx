import React, { useEffect, useState } from "react";
import Web3 from "web3";
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

  // Connect to MetaMask & contract
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

  const viewPaper = async (paperId) => {
    try {
      console.log("Attempting to view paper with ID:", paperId);

      const data = await state.contract.methods
        .getPaper(paperId)
        .call({ from: state.account });

      alert(
        `FileCID: ${data[0]}\nKeyCID: ${data[1]}\nExam ID: ${data[2]}\nSubject: ${data[4]}`
      );
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

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa" }}>
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
    </div>
  );
};

export default Assigned;