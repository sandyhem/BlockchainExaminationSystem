import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/teacher.css";
import PaperUpload from "./PaperUpload";
import FileUpload from "./FileUpload";
import UserAccount from "./UserAccount";

function TeacherPortal({ setUser }) {
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
    <div className="teacher-container">
      <header className="header">
        <div className="header-content">
          <h1 className="title">Teacher Portal</h1>
          <nav className="nav">
          <a href="#" onClick={() => setActivePage("home")}>Home</a>
          <a href="#/teacher-account" onClick={() => setActivePage("teacherAccount")}>My Account</a>
          <a href="#/view-paperRequests" onClick={() => setActivePage("paperRequest")}>Paper Requests</a>
          {/* <a href="#/add-paperUpload" onClick={() => setActivePage("uploadPaper")}>Upload Paper</a> */}
          <a href="#" onClick={handleLogout}>Logout</a>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="full-page-content">
        {activePage === "paperRequest" ? (
          <PaperUpload />
        )  : activePage === "uploadPaper"?(
          <FileUpload />
        ): activePage === "teacherAccount"?(
          <UserAccount />
        ): (
          <div className="welcome-box">
            <h2>Welcome Controller of Examination (COE)</h2>
          </div>
        )}
      </main>
    </div>
  );
}

export default TeacherPortal;
