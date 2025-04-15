import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import registerservice from "./FireStore/services/registerservice";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  
  // Keep track of form state to prevent focus loss
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const roleRef = useRef(null);

  const handleLogin = async(e) => {
    e.preventDefault();
    
    if (email && password && role) {
      const userData = { email, role};
     
      try {
        if (role === "teacher") {
          const user = await registerservice.getByQuery(email, password, "1");
          if (!user) {
            alert("Login not successful for teacher");
            throw new Error("Invalid credentials or user not found for teacher.");
          }
          alert("Login successful for teacher");
          console.log(user);
        } else if (role === "superintendent") {
          const user = await registerservice.getByQuery(email, password, "2");
          if (!user) {
            alert("Login not successful for superintendent");
            throw new Error("Invalid credentials or user not found for superintendent.");
          }
          alert("Login successful for superintendent");
          console.log(user);
        }
        
     
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      // Redirect based on role
      if (role === "coe") {
        navigate("/coe");
      } else if (role === "superintendent") {
        navigate("/superintendent");
      } else if (role === "teacher") {
        navigate("/teacher");
      } 
       else {
        alert("Invalid role selected!");
      }
      } catch (error) {
          console.log(error)
      }
     
     
    } else {
      alert("Please fill all fields");
      // Return focus to the first empty field
      if (!email) emailRef.current?.focus();
      else if (!password) passwordRef.current?.focus();
      else if (!role) roleRef.current?.focus();
    }
  };

  return (
    <>
      <Header />
      
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{
             backgroundImage: 'url("../../public/images/bc.jpg")',
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat',
             position: 'relative'
           }}>
        
        <div className="container position-relative m-2" style={{zIndex: 2}}>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow-lg border-0 rounded-lg">
                <div className="card-body p-4 p-md-5">
                  <h4 className="text-center text-primary fw-bold mb-4">Login to Your Account</h4>
                  
                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label text-primary fw-semibold">Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-primary text-white">
                          <i className="bi bi-envelope-fill"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control border-primary"
                          id="email"
                          ref={emailRef}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label text-primary fw-semibold">Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-primary text-white">
                          <i className="bi bi-lock-fill"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control border-primary"
                          id="password"
                          ref={passwordRef}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="role" className="form-label text-primary fw-semibold">Role</label>
                      <div className="input-group">
                        <span className="input-group-text bg-primary text-white">
                          <i className="bi bi-person-badge-fill"></i>
                        </span>
                        <select 
                          className="form-select border-primary"
                          id="role"
                          ref={roleRef}
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          required
                        >
                          <option value="">Select Role</option>
                          <option value="coe">COE</option>
                          <option value="superintendent">Superintendent</option>
                          <option value="teacher">Teacher</option>
                          
                        </select>
                      </div>
                    </div>

                    <div className="mb-3 form-check">
                      <input type="checkbox" className="form-check-input" id="rememberMe" />
                      <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                      <a href="#" className="float-end text-primary">Forgot password?</a>
                    </div>
                    
                    <div className="d-grid gap-2 mb-4">
                      <button type="submit" className="btn btn-primary btn-lg">
                        <i className="bi bi-box-arrow-in-right me-2"></i>Login
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <p>Don't have an account?
                        <Link to="/register" className="btn btn-link text-primary fw-bold p-0 ms-1">
                          Register here
                        </Link>
                      </p>
                    </div>
                  </form>
                </div>
                
                <div className="card-footer bg-light py-3 text-center">
                  <small className="text-muted">Secured by Blockchain Technology</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;