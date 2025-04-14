import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/loginsuper.css"; 
import ExamCard from "./ExamCard";
import Papers from "./Papers";
import RaiseRequests from "./RaiseRequests";
import Assigned from "./Assigned";
import UserAccount from "../UserAccount";

function SuperintendentPortal({ setUser }) {
  const navigate = useNavigate();

// Load state from localStorage or default to "home"
  const [activePage, setActivePage] = useState(
    () => localStorage.getItem("activePage") || "home"
  );

  useEffect(() => {
    // Save active page to localStorage whenever it changes
    localStorage.setItem("activePage", activePage);
  }, [activePage]);

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
          <a href="#" onClick={() => setActivePage("home")}>Home</a>
          {/* <a href="#/view-papers" onClick={() => setActivePage("viewpapers")}>View Papers</a>
          <a href="#/raise-requests" onClick={() => setActivePage("createRequests")}>Raise Requests</a> */}
          <a href="#/superintendent-account" onClick={() => setActivePage("superintendentAccount")}>My Account</a>
          <a href="#/assigned-papers" onClick={() => setActivePage("assignedPapers")}>papers</a>
          <a href="#/" onClick={handleLogout}>Logout</a>
          </nav>
        </div>
      </header>

      <main className="full-page-content">
      {activePage === "viewpapers" ? (
          <Papers />
        )  : activePage === "uploadPaper"?(
          <RaiseRequests />
        )
          : activePage === "superintendentAccount"?(
            <UserAccount />
        ): activePage === "assignedPapers"?(
          <Assigned />
        ): (
          <div className="welcome-box">
            <h2>Welcome Controller of Examination (COE)</h2>
          </div>
        )}
      </main>
    </div>
  );
}

export default SuperintendentPortal;
