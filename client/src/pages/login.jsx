import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header"; // Import Header
import Web3 from "web3";
import QuestionPaperSystem from "../contracts/QuestionPaperSystem.json";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const [state, setState] = useState({ web3: null, contract: null, account: null });
  //const [users, setUsers] = useState([]);

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
          console.log(state,web3,contract,accounts[0]);

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

  const handleLogin = async(e) => {
    e.preventDefault();
    await connectWallet();
    if (email && password && role) {
      const userData = { email, role};
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      // Redirect based on role
      if (role === "coe") {
        navigate("/coe");
      } else if (role === "superintendent") {
        navigate("/superintendent");
      } else if (role === "teacher") {
        navigate("/teacher");
      } else if (role === "recipient") {
        navigate("/recipient");
      } else {
        alert("Invalid role selected!");
      }
    } else {
      alert("Please fill all fields");
    }
  };

  return (
    <>
      <Header /> {/* Keeps the header at the top */}
      <div className="login-container">
        <main className="hero">
          {/* Title Section - Now Inline in the Login Page */}
          <div className="title-section">
            <h2>Examination Paper</h2>
            <h1>Discover Best Way For Monitoring Exam Papers</h1>
          </div>

          {/* Login Box */}
          <div className="login-box">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input type="text" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Your Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">Select Role</option>
                <option value="coe">COE</option>
                <option value="superintendent">Superintendent</option>
                <option value="teacher">Teacher</option>
                <option value="recipient">Recipient</option>
              </select>
              <button type="submit">Login</button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

export default Login;
