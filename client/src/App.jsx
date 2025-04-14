import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css"; 
import "./App.css";
import "./COE.css";

import Login from "./pages/login";
import COE from "./pages/COE";
import SuperintendentPortal from "./pages/SuperIntendentModule/loginSuper";
import AddSuperintendent from "./pages/Superintendent";
import TeacherPortal from "./pages/Teacher";
import loginsuper from "./pages/SuperIntendentModule/loginSuper"; 

import CreatePaperRequest from "./pages/PaperRequest";
import PaperUpload from "./pages/PaperUpload";
import FileUpload from "./pages/FileUpload";
import UploadPrivateIPFS from "./pages/UploadPrivateIpfs";
import DownloadPrivateIPFS from "./pages/DowloadPrivateIPFS";
import Papers from "./pages/SuperIntendentModule/Papers";
import AccessLogPage from "./pages/Admin/AccessLogPage";
import ViewPaper from "./pages/Admin/ViewPaper";
import Assigned from "./pages/SuperIntendentModule/Assigned";

import Firestore from "./pages/FireStore/Firestore";
import Register from "./pages/Authentication/Register";
import UserAccount from "./pages/UserAccount";
import UserManage from "./pages/Admin/UserManage";



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
    <>
    <ToastContainer />
    <Router>
      <Routes>
        
        <Route path="/" element={<Login setUser={setUser} />} />
  
          <Route path="/register" element={<Register/>}></Route>
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


        {/* Only COE should be able to add a Superintendent */}
        <Route
          path="/add-superintendent"
          element={user?.role === "coe" ? <AddSuperintendent /> : <Navigate to="/" />}
        />

        <Route
          path="/verify-paper"
          element={user?.role === "coe" ? <ViewPaper/> : <Navigate to="/" />}
        />

        <Route
          path="/access-pages"
          element={user?.role === "coe" ? <AccessLogPage/> : <Navigate to="/" />}
        />

        <Route
          path="/add-paperRequest"
          element={user?.role === "coe" ? <CreatePaperRequest /> : <Navigate to="/" />}
        />

        <Route
          path="/view-userrequests"
          element={user?.role === "coe" ? <UserManage /> : <Navigate to="/" />}
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
          path="/teacher-account"
          element={user?.role === "teacher" ? <UserAccount /> : <Navigate to="/" />}
        />

        <Route
          path="/view-papers"
          element={user?.role === "superintendent" ? <Papers /> : <Navigate to="/" />}
        />
         <Route
          path="/raise-requests"
          element={user?.role === "superintendent" ? <Papers /> : <Navigate to="/" />}
        />

        <Route
          path="/assigned-papers"
          element={user?.role === "superintendent" ? <Assigned /> : <Navigate to="/" />}
        />

       <Route
          path="/superintendent-account"
          element={user?.role === "superintendent" ? <UserAccount /> : <Navigate to="/" />}
        />

        <Route
          path="/uploadipfs"
          element={<UploadPrivateIPFS/> }
        />
          <Route
          path="/downloadipfs"
          element={<DownloadPrivateIPFS/> }
        />
          
         

         <Route
          path="/firestore"
          element={<Firestore/> }
        />

      </Routes>
    </Router>
    </>
  );

}

export default App;
