import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Function to handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0); // Reset progress on new file selection
    }
  };

  // Function to simulate file upload
  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file before uploading!");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload process
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
      }
    }, 300); // Simulates upload progress every 300ms
  };

  const copyToClipboard = (inputId) => {
    const copyText = document.getElementById(inputId);
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(copyText.value);
    alert("Copied the text: " + copyText.value);
  };

  return (
    <div
      className="container-fluid vh-100 d-flex flex-column align-items-center justify-content-center"
      style={{ backgroundColor: "#ADD8E6" }} // Light blue background
    >
      <div className="card shadow-lg p-4 w-100 bg-white" style={{ maxWidth: "900px" }}>
        <h2 className="text-center text-success mb-4">Upload Exam Paper</h2>
        <div className="row">
          {/* File Upload Section */}
          <div className="col-md-6">
            <h4 className="text-primary">Upload Files</h4>
            <p className="text-muted">Upload exam papers securely.</p>
            <div className="border border-secondary border-dashed text-center p-4 rounded bg-light">
              <FontAwesomeIcon icon={faCloudUploadAlt} size="3x" className="text-secondary" />
              <p className="text-muted mt-3">Drag and drop files here</p>
              <p className="text-muted">- OR -</p>
              
              {/* Hidden File Input */}
              <input
                type="file"
                id="fileInput"
                className="d-none"
                onChange={handleFileChange}
              />
              
              {/* Browse Button to trigger File Input */}
              <button
                className="btn btn-success"
                onClick={() => document.getElementById("fileInput").click()}
              >
                Browse Files
              </button>

              {/* Display Selected File Name */}
              {selectedFile && (
                <p className="mt-2 text-success fw-bold">{selectedFile.name}</p>
              )}
            </div>

            {/* Upload Button */}
            <button
              className="btn btn-primary mt-3 w-100"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading} // Disable button if no file is selected or upload is in progress
            >
              Upload File
            </button>

            {/* Progress Bar */}
            {isUploading && (
              <div className="progress mt-3">
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: `${uploadProgress}%` }}
                  aria-valuenow={uploadProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {uploadProgress}%
                </div>
              </div>
            )}
          </div>

          {/* Form Fields Section */}
          <div className="col-md-6">
            {[
              { id: "examId", label: "Exam ID", value: "AU2022" },
              { id: "examName", label: "Exam Name", value: "End Semester" },
              { id: "subject", label: "Subject", value: "Distributed Systems" },
              { id: "teacherAddress", label: "Teacher Address", value: "0x1D1479C185d32EB90533a08b36B3CFa5F84A0E6B" },
//{ id: "cid", label: "CID", value: "cidvalue" },
            ].map((field) => (
              <div key={field.id} className="form-floating mb-3">
                <input
                  type="text"
                  id={field.id}
                  className="form-control"
                  value={field.value}
                  readOnly
                />
                <label htmlFor={field.id} className="fw-bold">{field.label}</label>
                <button
                  onClick={() => copyToClipboard(field.id)}
                  className="btn btn-outline-secondary mt-2 w-100"
                >
                  <FontAwesomeIcon icon={faCopy} /> Copy {field.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;