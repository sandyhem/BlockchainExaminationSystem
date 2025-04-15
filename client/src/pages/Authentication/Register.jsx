import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import registerservice from "../FireStore/services/registerservice.js";

function Register() {
  const navigate = useNavigate();
  
  // Register form state
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('');
  
  // Register form references to maintain focus
  const fullNameRef = useRef(null);
  const registerEmailRef = useRef(null);
  const phoneNumberRef = useRef(null);
  const universityIdRef = useRef(null);
  const registerRoleRef = useRef(null);
  const registerPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleRegister = async(e) => {
    e.preventDefault();
    console.log("Register with:", registerEmail);
    
    // Check password match before proceeding
    if (registerPassword !== confirmPassword) {
      alert("Passwords do not match!");
      confirmPasswordRef.current?.focus();
      return;
    }
    
    try {
      await registerservice.addUser({
        name: fullName,
        email: registerEmail,
        contactNumber: phoneNumber,
        univID: universityId,
        password: registerPassword,
        role: registerRole,
        key: "",
        address: "",
        generate: 0,
      });
      const user = await registerservice.getUsers();
      console.log(user);

      alert("Registration successful! Please login.");
      navigate('/');
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Registration failed. Please try again.");
      return; 
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
                <div className="card-body p-4 p-md-5 m-2">
                  <h4 className="text-center text-primary fw-bold mb-4">Create New Account</h4>
                  
                  <form onSubmit={handleRegister}>
                    <div className="mb-3">
                      <label htmlFor="fullName" className="form-label text-primary fw-semibold">Full Name</label>
                      <div className="input-group">
                        <span className="input-group-text bg-primary text-white">
                          <i className="bi bi-person-fill"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-primary"
                          id="fullName"
                          ref={fullNameRef}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="registerEmail" className="form-label text-primary fw-semibold">Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-primary text-white">
                          <i className="bi bi-envelope-fill"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control border-primary"
                          id="registerEmail"
                          ref={registerEmailRef}
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="phoneNumber" className="form-label text-primary fw-semibold">Phone Number</label>
                      <div className="input-group">
                        <span className="input-group-text bg-primary text-white">
                          <i className="bi bi-telephone-fill"></i>
                        </span>
                        <input
                          type="tel"
                          className="form-control border-primary"
                          id="phoneNumber"
                          ref={phoneNumberRef}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="universityId" className="form-label text-primary fw-semibold">University ID</label>
                      <div className="input-group">
                        <span className="input-group-text bg-primary text-white">
                          <i className="bi bi-card-heading"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-primary"
                          id="universityId"
                          ref={universityIdRef}
                          value={universityId}
                          onChange={(e) => setUniversityId(e.target.value)}
                          placeholder="Enter your university ID"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="registerRole" className="form-label text-primary fw-semibold">Role</label>
                      <div className="input-group">
                        <span className="input-group-text bg-primary text-white">
                          <i className="bi bi-person-badge-fill"></i>
                        </span>
                        <select 
                          className="form-select border-primary"
                          id="registerRole"
                          ref={registerRoleRef}
                          value={registerRole}
                          onChange={(e) => setRegisterRole(e.target.value)}
                          required
                        >
                          <option value="">Select Role</option>
                          <option value="2">Superintendent</option>
                          <option value="1">Teacher</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3 mb-md-0">
                        <label htmlFor="registerPassword" className="form-label text-primary fw-semibold">Password</label>
                        <div className="input-group">
                          <span className="input-group-text bg-primary text-white">
                            <i className="bi bi-lock-fill"></i>
                          </span>
                          <input
                            type="password"
                            className="form-control border-primary"
                            id="registerPassword"
                            ref={registerPasswordRef}
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            placeholder="Create a password"
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="confirmPassword" className="form-label text-primary fw-semibold">Confirm Password</label>
                        <div className="input-group">
                          <span className="input-group-text bg-primary text-white">
                            <i className="bi bi-lock-fill"></i>
                          </span>
                          <input
                            type="password"
                            className="form-control border-primary"
                            id="confirmPassword"
                            ref={confirmPasswordRef}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="d-grid gap-2 mb-4">
                      <button type="submit" className="btn btn-primary btn-lg">
                        <i className="bi bi-person-plus-fill me-2"></i>Register
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <p>Already have an account?
                        <Link to="/" className="btn btn-link text-primary fw-bold p-0 ms-1">
                          Login here
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

export default Register;