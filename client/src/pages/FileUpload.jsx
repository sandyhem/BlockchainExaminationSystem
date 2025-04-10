import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import CryptoJS from "crypto-js";

const FileUpload = ({ state, paper }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [cid, setCid] = useState("");
  // const [secretKey, setSecretKey] = useState("");
  //  console.log(paper);

  const secretKey = import.meta.env.VITE_AES_KEY;

  const encryptFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        alert("Please select a file to encrypt!");
        reject("No file selected");
        return;
      }

      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const wordArray = CryptoJS.lib.WordArray.create(
          new Uint8Array(reader.result)
        );
        const encrypted = CryptoJS.AES.encrypt(
          wordArray,
          CryptoJS.enc.Utf8.parse(secretKey),
          {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
          }
        ).toString();

        const blob = new Blob([encrypted], { type: "text/plain" });
        resolve(blob);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadToPrivateIPFS = async () => {
    if (!file) {
      alert("Please select a PDF file.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const encryptedBlob = await encryptFile(file);
      const formData = new FormData();
      formData.append("file", encryptedBlob, `${file.name}.enc`);
      formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));
      formData.append(
        "pinataMetadata",
        JSON.stringify({ name: file.name, keyvalues: { private: "true" } })
      );

      const pinataApiUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
      const jwtToken = import.meta.env.VITE_PINATA_JWT;

      const response = await axios.post(pinataApiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${jwtToken}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setCid(response.data.IpfsHash);

      try {
        console.log(state)
        const gasPrice = await state.web3.eth.getGasPrice();
        await state.contract.methods
          .uploadPaper(paper.paperId, response.data.IpfsHash)
          .send({ from: state.account, gasPrice });

      } catch (error) {
        console.error("Transaction failed:", error);
        // alert(error);
        if (error.message.includes("execution reverted")) {
          const errorMessage = error.message
            .split("reverted with reason string '")[1]
            ?.split("'")[0];
          alert(`Transaction failed: ${errorMessage || "Unknown error"}`);
        } else {
          alert("Transaction failed. Check console for details.");
        }
      }
      alert("Encrypted file uploaded successfully to private IPFS!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check console for details.");
    }

    setIsUploading(false);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadProgress(0);
    }
  };

  const copyToClipboard = (inputId) => {
    const copyText = document.getElementById(inputId);
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    alert("Copied the text: " + copyText.value);
  };

  return (
    <div
      className="container-fluid vh-100 my-1  d-flex flex-column align-items-center justify-content-center"
      style={{ backgroundColor: "#ADD8E6" }}
    >
      <div
        className="card shadow-lg p-4  w-100 bg-white"
        style={{ maxWidth: "900px" }}
      >
        <h2 className="text-center text-success mb-4">Upload Exam Paper</h2>
        <div className="row">
          {/* File Upload Section */}
          <div className="col-md-6">
            <h4 className="text-primary">Upload Files</h4>
            <p className="text-muted">Upload exam papers securely.</p>
            <div className="border border-secondary border-dashed text-center p-4 rounded bg-light">
              <FontAwesomeIcon
                icon={faCloudUploadAlt}
                size="3x"
                className="text-secondary"
              />
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
              {file && <p className="mt-2 text-success fw-bold">{file.name}</p>}
            </div>

            {/* Upload Button */}

            <button
              className="btn btn-primary mt-3 w-100"
              onClick={()=>{
                // setSecretKey(paper.key);
                uploadToPrivateIPFS()}}
              disabled={!file || isUploading}
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
              { id: "examId", label: "Exam ID", value: paper.examId },
              { id: "examName", label: "Exam Name", value: paper.examName },
              { id: "subject", label: "Subject", value: paper.subject },
              {
                id: "teacherAddress",
                label: "Teacher Address",
                value: state.account,
              },
              // { id: "cid", label: "CID", value: cid },
            ].map((field) => (
              <div key={field.id} className="form-floating mb-3">
                <input
                  type="text"
                  id={field.id}
                  className="form-control"
                  value={field.value}
                  readOnly
                />
                <label htmlFor={field.id} className="fw-bold">
                  {field.label}
                </label>
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
