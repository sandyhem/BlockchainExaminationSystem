import React, { useEffect, useState } from "react";
import registerService from "./FireStore/services/registerservice.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import { User, Key, Eye, EyeOff, Copy, Shield, Wallet } from 'lucide-react';
import Web3 from 'web3';

const UserAccount = () => {
  // Get user data from localStorage
  const userjson = JSON.parse(localStorage.getItem("user"));
  const email = userjson?.email;
  const password = userjson?.password;
  const role = userjson?.role;

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "", phone: "", address: "", generate: 0});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [key,setKey] = useState(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const roler = role === "teacher" ? "1" : role === "superintendent" ? "2" : "3";
        const userData = await registerService.getByEmail(email, roler);
        console.log("fetch:", userData);
        if (userData) {
          setUser(userData);
          setFormData({
            name: userData.name || "",
            email: userData.email,
            phone: userData.contactNumber || "",
            password: userData.password,
            role: userData.role,
            // key: userData.key || null,
            address: userData.address || null,
            generate: userData.generate
          });
        }
        
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
      
    };
    fetchUser();
  }, [email, password, role]);



  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    try {
      await registerService.updateUser(user.id, formData);
      setUser({...user, ...formData});
      setIsEditing(false);
      
      alert("Updated successfully!!!");
    
    } catch (err) {
      console.error("Update failed:", err.message);
      setError("Failed to update profile");
    }
  };

  //GENERATE THE ACCOUNT FOR USER:
  const generateAccount = async () => {
    const web3 = new Web3();
    const account = web3.eth.accounts.create();
    setKey(account.privateKey);
    setFormData(prev => ({ 
        ...prev, 
        address: account.address,
        generate: 1 
    }));
    await registerService.updateUser(user.id, {
      address: account.address,
      generate: 1
    });

  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };
  
  const togglePrivateKeyVisibility = () => {
    setShowPrivateKey(!showPrivateKey);
  };

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{height: "100vh"}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          User profile not found. Please log in again.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      <div className="row g-0" style={{ minHeight: "100vh" }}>
        {/* Left side - User profile form */}
        <div className="col-md-6 bg-light p-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">User Profile</h3>
            </div>
            <div className="card-body">
              <div id="alertPlaceholder"></div>
              
              <div className="text-center mb-4">
                <div className="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center" style={{width: "100px", height: "100px"}}>
                  <h1>{formData.name.charAt(0).toUpperCase()}</h1>
                </div>
                <h4 className="mt-2">{formData.name}</h4>
                <span className="badge bg-primary">{formData.role === "1" ? "Teacher" : "Superintendent"}</span>
              </div>

              <form>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <div className="input-group">
                    <span className="input-group-text"><User size={18} /></span>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope-fill"></i></span>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock-fill"></i></span>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-telephone-fill"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-person-badge-fill"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      id="role"
                      name="role"
                      value={formData.role == "1" ? "Teacher" : formData.role == "2" ? "Superintendent" : ""}
                      onChange={handleChange}
                      disabled
                    />
                  </div>
                </div>

                <div className="d-grid gap-2 mt-4">
                  {!isEditing ? (
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={() => setIsEditing(true)}
                    >
                      <i className="bi bi-pencil-fill me-2"></i>Edit Profile
                    </button>
                  ) : (
                    <div className="d-flex gap-2">
                      <button 
                        type="button" 
                        className="btn btn-success flex-grow-1"
                        onClick={handleUpdate}
                      >
                        <i className="bi bi-check-lg me-2"></i>Save Changes
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary flex-grow-1"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name || "",
                            email: user.email,
                            phone: user.contactNumber || "",
                            password: user.password,
                            role: user.role,
                            address: user.address || null
                          });
                        }}
                      >
                        <i className="bi bi-x-lg me-2"></i>Cancel
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Right side - Wallet & Private Key with illustrations */}
        <div className="col-md-6 bg-primary bg-gradient text-white p-4 d-flex align-items-center">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold">Your Digital Wallet</h2>
              <p className="lead">Securely manage your blockchain identity</p>
            </div>
            
            <div className="row justify-content-center mb-5">
              <div className="col-lg-10">
                <div className="text-center mb-4">
                  <div className="bg-white text-primary rounded-circle p-3 d-inline-flex justify-content-center align-items-center" style={{width: "120px", height: "120px"}}>
                    <Wallet size={64} />
                  </div>
                </div>
              </div>
            </div>
            
            {key ? (
              <div className="row justify-content-center">
                <div className="col-lg-10">
                  <div className="card bg-white text-dark shadow mb-4">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <Wallet className="text-primary me-2" size={24} />
                        <h5 className="card-title mb-0">Wallet Address</h5>
                        <button 
                          className="btn btn-sm btn-outline-primary ms-auto"
                          onClick={() => copyToClipboard(formData.address)}
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                      <p className="card-text text-break font-monospace small bg-light p-2 rounded">
                        {formData.address}
                      </p>
                      
                      <hr />
                      
                      <div className="d-flex align-items-center mb-3">
                        <Key className="text-primary me-2" size={24} />
                        <h5 className="card-title mb-0">Private Key</h5>
                        <div className="ms-auto">
                          <button 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={togglePrivateKeyVisibility}
                          >
                            {showPrivateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => copyToClipboard(key)}
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="bg-light p-2 rounded">
                        <p className="card-text text-break font-monospace small mb-0">
                          {showPrivateKey ? key : '•'.repeat(40)}
                        </p>
                      </div>
                      
                      <div className="alert alert-warning mt-3 d-flex align-items-center" role="alert">
                        <Shield className="me-2" size={20} />
                        <small>Never share your private key with anyone. Keep it secure.</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="row justify-content-center">
                <div className="col-lg-10">
                  <div className="card bg-white text-dark shadow text-center p-4">
                    <div className="card-body">
                      <Key className="text-muted mb-3" size={48} />
                      <h5 className="card-title">Anna University - ACOE</h5>
                      <p className="card-text text-muted">Welcome to the Anna University - ACOE blockchain-based examination paper transmission platform.</p>
                        {
                            (formData.generate === 0)?(
                                <>
                                <button className="btn btn-primary mt-2" onClick={()=>{
                                  setFormData(prev => ({ ...prev, generate: 1 }));
                                  generateAccount()
                                  }}>
                                Generate Account
                                </button>
                                </>
                            ):(
                                <>
                                  <h6 className="text-muted">Account is under verification.</h6>
                                  <h6 className="text-muted">Keep the key secure and do not share.</h6>
                                  <h6 className="text-muted">Account will be activated soon.</h6>
                                </>
                            )
                        }
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="row mt-5 justify-content-center">
              <div className="col-md-10">
                <div className="d-flex justify-content-around">
                  <div className="text-center">
                    <div className="bg-white text-primary rounded-circle p-3 d-inline-flex justify-content-center align-items-center mb-2" style={{width: "60px", height: "60px"}}>
                      <Shield size={32} />
                    </div>
                    <p>Secure</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white text-primary rounded-circle p-3 d-inline-flex justify-content-center align-items-center mb-2" style={{width: "60px", height: "60px"}}>
                      <i className="bi bi-lightning-charge-fill fs-3"></i>
                    </div>
                    <p>Fast</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white text-primary rounded-circle p-3 d-inline-flex justify-content-center align-items-center mb-2" style={{width: "60px", height: "60px"}}>
                      <i className="bi bi-globe fs-3"></i>
                    </div>
                    <p>Global</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;