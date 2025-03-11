import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/loginsuper.css"; 

function SuperintendentPortal({ setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("showSuperintendentPortal");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="coe-container">
      <header className="header">
        <div className="header-content">
          <h1 className="title">Superintendent Portal</h1>
          <nav className="nav">
            <a href="#">Home</a>
            <a href="#">View Teachers</a>
            <a href="#">Paper Requests</a>
            <a href="#" onClick={handleLogout}>Logout</a>
          </nav>
        </div>
      </header>

      <main className="full-page-content">
        <div className="welcome-box">
          <h2>Welcome Superintendent (By COE)</h2>
        </div>
      </main>
    </div>
  );
}

export default SuperintendentPortal;
