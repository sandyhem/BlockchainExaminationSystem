import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { 
  faBook, 
  faUserCircle, 
  faTachometerAlt, 
  faFilePdf, 
  faCalendarAlt, 
  faUsers, 
  faExclamationTriangle, 
  faCog,
  faFilter,
  faSortAmountDown,
  faUnlock,
  faPrint,
  faDownload,
  faChevronLeft,
  faChevronRight,
  faExpand,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'bootstrap/dist/css/bootstrap.min.css';

const SuperintendentPaperView = () => {
  // State for countdown timer
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isAccessible, setIsAccessible] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [showPdfSection, setShowPdfSection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(5);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const pdfContainerRef = useRef(null);
  const iframeRef = useRef(null);

  // Timer effect for countdown
  useEffect(() => {
    // Set the countdown date (1 minute from now)
    const countDownDate = new Date().getTime() + (1 * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = countDownDate - now;
      
      if (distance < 0) {
        clearInterval(timer);
        setIsAccessible(true);
        return;
      }
      
      setTimeRemaining({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Function to format numbers with leading zeros
  const formatNumber = (num) => {
    return num.toString().padStart(2, '0');
  };

  // Function to handle access button click
  const handleAccessClick = () => {
    setShowPasswordModal(true);
  };

  // Function to handle security verification
  const handleVerification = () => {
    if (securityCode.trim() !== '') {
      setShowPasswordModal(false);
      setShowPdfSection(true);
      loadPdf();
      
      // Scroll to PDF section
      setTimeout(() => {
        if (pdfContainerRef.current) {
          pdfContainerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      alert("Please enter a security code.");
    }
  };

  // Function to simulate loading a PDF
  const loadPdf = () => {
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = "/api/placeholder/800/1000";
      }
      
      // Hide loading overlay after a delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }, 2000);
  };

  // Functions for PDF navigation
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function for fullscreen
  const toggleFullscreen = () => {
    if (pdfContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        pdfContainerRef.current.requestFullscreen();
      }
    }
  };

  // Functions for paper actions
  const printPaper = () => {
    alert("Printing functionality would be implemented here");
  };

  const downloadPaper = () => {
    alert("Download functionality would be implemented here");
  };

  const selectPaper = (paperCode) => {
    alert(`Selected paper: ${paperCode}\nThis would load the details for this paper.`);
  };

  return (
    <div className="superintendent-view">
    
      <style jsx>{`
        :root {
          --primary: #0d6efd;
          --primary-dark: #0a58ca;
          --primary-light: #6ea8fe;
          --secondary: #0dcaf0;
          --dark-blue: #0d47a1;
        }
        
        body {
          background-color: #f8f9fa;
        }
        
        .navbar {
          background-color: var(--dark-blue);
        }
        
        .card {
          border-color: var(--primary-light);
          transition: transform 0.3s;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .sidebar {
          background-color: #fff;
          border-right: 1px solid #dee2e6;
          height: calc(100vh - 56px);
        }
        
        .sidebar-link {
          color: #333;
          transition: background-color 0.3s;
        }
        
        .sidebar-link:hover, .sidebar-link.active {
          background-color: var(--primary-light);
          color: white;
        }
        
        .timer-container {
          background-color: rgba(13, 110, 253, 0.1);
          border-left: 4px solid var(--primary);
        }
        
        .pdf-container {
          position: relative;
          min-height: 700px;
        }
        
        .pdf-controls {
          background-color: #e9ecef;
          border-bottom: 1px solid #dee2e6;
        }
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
        }
        
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          color: rgba(13, 110, 253, 0.1);
          font-size: 5rem;
          font-weight: bold;
          pointer-events: none;
          z-index: 5;
          white-space: nowrap;
        }
        
        iframe {
          width: 100%;
          height: 700px;
          border: 1px solid #dee2e6;
        }
      `}</style>

      {/* Navigation Bar */}
      {/* <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <FontAwesomeIcon icon={faBook} className="me-2" />
            Exam Portal
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="#">Dashboard</a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" href="#">Papers</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Schedule</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Reports</a>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <FontAwesomeIcon icon={faUserCircle} className="me-1" />
                  John Doe
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><a className="dropdown-item" href="#">Profile</a></li>
                  <li><a className="dropdown-item" href="#">Settings</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="#">Logout</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav> */}

      <div className="container-fluid bg-">
        <div className="row">
          {/* Sidebar
          <div className="col-lg-2 d-none d-lg-block p-0 sidebar">
            <div className="p-3">
              <h5 className="text-primary">Superintendent Panel</h5>
            </div>
            <div className="list-group list-group-flush">
              <a href="#" className="list-group-item list-group-item-action sidebar-link">
                <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                Dashboard
              </a>
              <a href="#" className="list-group-item list-group-item-action sidebar-link active">
                <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                Question Papers
              </a>
              <a href="#" className="list-group-item list-group-item-action sidebar-link">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Exam Schedule
              </a>
              <a href="#" className="list-group-item list-group-item-action sidebar-link">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Invigilators
              </a>
              <a href="#" className="list-group-item list-group-item-action sidebar-link">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                Issue Reports
              </a>
              <a href="#" className="list-group-item list-group-item-action sidebar-link">
                <FontAwesomeIcon icon={faCog} className="me-2" />
                Settings
              </a>
            </div>
          </div> */}

          {/* Main Content */}
          <div className="col-lg-15 p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="text-primary">Question Papers</h2>
              <div>
                <button className="btn btn-outline-primary me-2">
                  <FontAwesomeIcon icon={faFilter} /> Filter
                </button>
                <button className="btn btn-outline-primary">
                  <FontAwesomeIcon icon={faSortAmountDown} /> Sort
                </button>
              </div>
            </div>

            {/* Currently Selected Paper */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Currently Selected Paper</h5>
                  </div>
                  <div className="card-body" id="paperDetailsArea">
                    <div className="row">
                      <div className="col-md-6">
                        <h4>Mathematics - Advanced Calculus</h4>
                        <p className="text-muted">Paper Code: MATH304</p>
                        <div className="mb-3">
                          <span className="badge bg-primary me-2">3 Hours</span>
                          <span className="badge bg-info me-2">100 Marks</span>
                          <span className="badge bg-secondary">Final Exam</span>
                        </div>
                        <p><strong>Scheduled Date:</strong> April 15, 2025</p>
                        <p><strong>Exam Time:</strong> 10:00 AM - 1:00 PM</p>
                        <p><strong>Department:</strong> Science & Engineering</p>
                        <p><strong>Instructions:</strong> Ensure all students have their ID cards. No electronic devices allowed.</p>
                      </div>
                      <div className="col-md-6">
                        {/* Timer section */}
                        <div className="timer-container p-4 rounded mb-3">
                          <h5 className="text-primary">Time Remaining Until Access:</h5>
                          {isAccessible ? (
                            <div className="display-4 text-center fw-bold text-primary">
                              PAPER ACCESS AVAILABLE NOW
                            </div>
                          ) : (
                            <div className="display-4 text-center fw-bold text-primary">
                              <span>{formatNumber(timeRemaining.days)}</span>:
                              <span>{formatNumber(timeRemaining.hours)}</span>:
                              <span>{formatNumber(timeRemaining.minutes)}</span>:
                              <span>{formatNumber(timeRemaining.seconds)}</span>
                            </div>
                          )}
                          <p className="text-center text-muted mt-2">
                            The question paper will be available 30 minutes before exam time
                          </p>
                        </div>
                        
                        {isAccessible && (
                          <div className="text-center">
                            <button className="btn btn-primary btn-lg" onClick={handleAccessClick}>
                              <FontAwesomeIcon icon={faUnlock} className="me-2" />
                              Access Question Paper
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Viewer Section */}
            {showPdfSection && (
              <div className="row mb-4" ref={pdfContainerRef}>
                <div className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Question Paper: Mathematics - Advanced Calculus</h5>
                      <div>
                        <button className="btn btn-sm btn-light me-2" onClick={printPaper}>
                          <FontAwesomeIcon icon={faPrint} /> Print
                        </button>
                        <button className="btn btn-sm btn-light" onClick={downloadPaper}>
                          <FontAwesomeIcon icon={faDownload} /> Download
                        </button>
                      </div>
                    </div>
                    <div className="card-body p-0">
                      {/* PDF Controls */}
                      <div className="pdf-controls p-2">
                        <div className="row">
                          <div className="col-md-6 d-flex align-items-center">
                            <button className="btn btn-outline-primary btn-sm me-2" onClick={prevPage}>
                              <FontAwesomeIcon icon={faChevronLeft} /> Previous
                            </button>
                            <button className="btn btn-outline-primary btn-sm me-3" onClick={nextPage}>
                              Next <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                            <span className="me-3">
                              Page <span>{currentPage}</span> of <span>{totalPages}</span>
                            </span>
                          </div>
                          <div className="col-md-6 d-flex align-items-center justify-content-md-end mt-2 mt-md-0">
                            <div className="input-group input-group-sm me-3" style={{ width: '120px' }}>
                              <span className="input-group-text">Zoom</span>
                              <select 
                                className="form-select" 
                                value={zoomLevel}
                                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                              >
                                <option value="0.5">50%</option>
                                <option value="0.75">75%</option>
                                <option value="1">100%</option>
                                <option value="1.25">125%</option>
                                <option value="1.5">150%</option>
                                <option value="2">200%</option>
                              </select>
                            </div>
                            <button className="btn btn-outline-primary btn-sm" onClick={toggleFullscreen}>
                              <FontAwesomeIcon icon={faExpand} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* PDF Viewer Container */}
                      <div className="pdf-container">
                        {/* Watermark */}
                        <div className="watermark">CONFIDENTIAL</div>
                        
                        {/* Loading Overlay */}
                        {isLoading && (
                          <div className="loading-overlay">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        )}
                        
                        {/* PDF Iframe */}
                        <iframe 
                          ref={iframeRef}
                          title="PDF Viewer" 
                          className="w-100" 
                          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                          frameBorder="0"
                        ></iframe>
                      </div>
                      
                      <div className="alert alert-info m-3">
                        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                        This paper is confidential. Please ensure it remains secure until the examination begins.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Assigned Papers */}
            <div className="row mb-4">
              <div className="col-12">
                <h4 className="text-primary mb-3">Other Assigned Papers</h4>
              </div>
              
              <div className="col-md-6 col-lg-4 mb-3">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Physics - Quantum Mechanics</h5>
                    <p className="card-text">
                      <span className="badge bg-primary me-2">April 18, 2025</span>
                      <span className="badge bg-info">3 Hours</span>
                    </p>
                    <p className="card-text small text-muted">Paper Code: PHY405</p>
                    <p className="card-text small">Time: 2:00 PM - 5:00 PM</p>
                  </div>
                  <div className="card-footer bg-transparent">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => selectPaper('PHY405')}>
                      Select Paper
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-4 mb-3">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Computer Science - Data Structures</h5>
                    <p className="card-text">
                      <span className="badge bg-primary me-2">April 20, 2025</span>
                      <span className="badge bg-info">2 Hours</span>
                    </p>
                    <p className="card-text small text-muted">Paper Code: CS202</p>
                    <p className="card-text small">Time: 10:00 AM - 12:00 PM</p>
                  </div>
                  <div className="card-footer bg-transparent">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => selectPaper('CS202')}>
                      Select Paper
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-4 mb-3">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">English Literature - Modern Poetry</h5>
                    <p className="card-text">
                      <span className="badge bg-primary me-2">April 22, 2025</span>
                      <span className="badge bg-info">3 Hours</span>
                    </p>
                    <p className="card-text small text-muted">Paper Code: ENG307</p>
                    <p className="card-text small">Time: 9:00 AM - 12:00 PM</p>
                  </div>
                  <div className="card-footer bg-transparent">
                    <button className="btn btn-outline-primary btn-sm" onClick={() => selectPaper('ENG307')}>
                      Select Paper
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      <Modal 
        show={showPasswordModal} 
        onHide={() => setShowPasswordModal(false)}
        centered
      >
        <Modal.Header className="bg-primary text-white">
          <Modal.Title>Security Verification</Modal.Title>
          <Button 
            variant="close" 
            className="btn-close-white" 
            onClick={() => setShowPasswordModal(false)}
          />
        </Modal.Header>
        <Modal.Body>
          <p>Please enter your security verification code to access the paper.</p>
          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              placeholder="Enter security code"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleVerification}>
            Verify & Access
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SuperintendentPaperView;