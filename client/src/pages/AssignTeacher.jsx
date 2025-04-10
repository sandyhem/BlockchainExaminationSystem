import React, { useState, useEffect } from "react";
import TeacherTable from "./ViewTeacher";
import Web3 from "web3";
import QuestionPaperSystem from "../contracts/QuestionPaperSystem.json";

function AddTeacher() {
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

    const [showTable, setShowTable] = useState(() => {
        const savedState = localStorage.getItem("showTable");
        return savedState ? JSON.parse(savedState) : false;
    });

    useEffect(() => {
        localStorage.setItem("showTable", JSON.stringify(showTable));
    }, [showTable]);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        email: '',
        phone: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await registerUser();
        setFormData({ name: '', address: '', email: '', phone: '' });
        setShowTable(true);
        window.location.reload();
    };

    async function registerUser() { 
        const { contract, account, web3 } = state;
        if (!account) {
            alert("Please connect your wallet!");
            return;
        }
        try {
            const gasPrice = await web3.eth.getGasPrice(); // Fetch the gas price dynamically
    
            await contract.methods.registerUser(
                formData.address,
                formData.name,
                0,  
                formData.email,
                formData.phone
            ).send({ from: account, gasPrice });
    
            alert("Registration successful");
        } catch (error) {
            console.error("Transaction failed:", error);
            // alert(error);
            if (error.message.includes("execution reverted")) {
                const errorMessage = error.message.split("reverted with reason string '")[1]?.split("'")[0];
                alert(`Transaction failed: ${errorMessage || "Unknown error"}`);
            } else {
                alert("Transaction failed. Check console for details.");
            }
        }
    }
    
    

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>{showTable ? "Teacher List" : "Add Teacher"}</h1>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setShowTable(!showTable)}
                >
                    {showTable ? "Add Teacher" : "View Teachers"}
                </button>
            </div>

            {showTable ? (
                <TeacherTable state={state} />
            ) : (
                <div className="card p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Name:</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="form-control" 
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Address:</label>
                            <input 
                                type="text" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange} 
                                className="form-control" 
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email:</label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                className="form-control" 
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Phone:</label>
                            <input 
                                type="tel" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                className="form-control" 
                                required 
                            />
                        </div>
                        <button type="submit" className="btn btn-success">Submit</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AddTeacher;
