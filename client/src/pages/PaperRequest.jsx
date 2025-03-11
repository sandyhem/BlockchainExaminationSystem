import React, { useState, useEffect } from "react";
import Web3 from "web3";
import QuestionPaperSystem from "../contracts/QuestionPaperSystem.json";

const CreatePaperRequest = () => {
        const [state, setState] = useState({ web3: null, contract: null, account: null });
    
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
    
                        const contract = new web3.eth.Contract(QuestionPaperSystem.abi, deployedNetwork.address);
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
        examId: '',
        examName: '',
        subject: '',
        teacher: '',
        key: ''
    });

     useEffect(() => {
        async function fetchPaperRequests() {
          if (!state.contract) return;
    
          try {
             const result = await state.contract.methods.getAllPapers().call();
             console.log(result)
             const paperRequestsList = result.map((paper, index) => ({
                examId: paper.ExamId,
                examName: paper.ExamName,
                subject: paper.Subject,
                teacher: paper.teacher,
                status: Number(paper.status) === 0 
                  ? "Requested" 
                  : Number(paper.status) === 1 
                  ? "Uploaded" 
                  : "Verified"
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

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        await createPaperRequest();
        setFormData({ examId: '', examName: '', subject: '', teacher: '', key: '' }); 
        setShowTable(true); 
        window.location.reload();
    };

    async function createPaperRequest() {
        const { contract, account } = state;
        if (!account) {
            alert("Please connect your wallet!");
            return;
        }
        try {
            await contract.methods.createPaperRequest(
               formData.teacher,
               formData.key,
               formData.examId,
               formData.examName,
               formData.subject,
            ).send({ from: account });
            alert("Registration successful");
        } catch (error) {
            console.error("Transaction failed:", error);
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

            {showTable ? (
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
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">No paper requests available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="examId" className="form-label">Exam ID</label>
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
                            <label htmlFor="examName" className="form-label">Exam Name</label>
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
                            <label htmlFor="subject" className="form-label">Subject</label>
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
                            <label htmlFor="teacher" className="form-label">Teacher Address</label>
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
                        <button type="submit" className="btn btn-success">Create Request</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CreatePaperRequest;