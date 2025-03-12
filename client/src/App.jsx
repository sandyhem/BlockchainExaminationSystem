import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; 
import "./App.css";
import "./COE.css";

import Login from "./pages/login";
import COE from "./pages/COE";
import SuperintendentPortal from "./pages/loginSuper";
import AddSuperintendent from "./pages/Superintendent";
import TeacherPortal from "./pages/Teacher";
import loginsuper from "./pages/loginSuper"; 
import RecipientPortal from "./pages/Recipient";
import CreatePaperRequest from "./pages/PaperRequest";
import PaperUpload from "./pages/PaperUpload";
import FileUpload from "./pages/FileUpload";
import UploadPrivateIPFS from "./pages/UploadPrivateIpfs";
import DownloadPrivateIPFS from "./pages/DowloadPrivateIPFS";




function App() {
  // Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  useEffect(() => {
    // Store user in localStorage when it changes
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
   
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />

        {/* Restrict COE route */}
        <Route
          path="/coe"
          element={user?.role === "coe" ? <COE setUser={setUser} /> : <Navigate to="/" />}
        />

        {/* Restrict Superintendent Portal */}
        <Route
          path="/superintendent"
          element={user?.role === "superintendent" ? <SuperintendentPortal setUser={setUser} /> : <Navigate to="/" />}
        />

        <Route
          path="/teacher"
          element={user?.role === "teacher" ? <TeacherPortal setUser={setUser} /> : <Navigate to="/" />}
        />

        <Route
          path="/recipient"
          element={user?.role === "recipient" ? <RecipientPortal setUser={setUser} /> : <Navigate to="/" />}
        />

        {/* Only COE should be able to add a Superintendent */}
        <Route
          path="/add-superintendent"
          element={user?.role === "coe" ? <AddSuperintendent /> : <Navigate to="/" />}
        />

        <Route
          path="/add-paperRequest"
          element={user?.role === "coe" ? <CreatePaperRequest /> : <Navigate to="/" />}
        />
          {/* <Route
          path="/add-accessManage"
          element={user?.role === "coe" ? <CreatePaperRequest /> : <Navigate to="/" />}
        /> */}
        {/* Only Teacher should be able to access the below routes */}
        <Route
          path="/view-paperRequests"
          element={user?.role === "teacher" ? <PaperUpload /> : <Navigate to="/" />}
        />
         <Route
          path="/add-paperUpload"
          element={user?.role === "teacher" ? <FileUpload /> : <Navigate to="/" />}
        />

        <Route
          path="/uploadipfs"
          element={<UploadPrivateIPFS/> }
        />
          <Route
          path="/downloadipfs"
          element={<DownloadPrivateIPFS/> }
        />

      </Routes>
    </Router>
    
  );

}

export default App;
