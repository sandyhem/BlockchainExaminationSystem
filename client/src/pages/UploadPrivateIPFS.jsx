import React, { useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";

const UploadPrivateIPFS = () => {
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState("");
  const [loading, setLoading] = useState(false);

  const secretKey = import.meta.env.VITE_AES_KEY;

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

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
        const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(reader.result));
        const encrypted = CryptoJS.AES.encrypt(wordArray, CryptoJS.enc.Utf8.parse(secretKey), {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        }).toString();

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

    setLoading(true);

    try {
      const encryptedBlob = await encryptFile(file);
      const formData = new FormData();
      formData.append("file", encryptedBlob, `${file.name}.enc`);
      formData.append("pinataOptions", JSON.stringify({ cidVersion: 1}));
      formData.append("pinataMetadata", JSON.stringify({ name: file.name, keyvalues: { private: "true" } }));

      const pinataApiUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
      const jwtToken = import.meta.env.VITE_PINATA_JWT;

      const response = await axios.post(pinataApiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      setCid(response.data.IpfsHash);
      alert("Encrypted file uploaded successfully to private IPFS!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Check console for details.");
    }

    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Upload Private File to IPFS</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={uploadToPrivateIPFS} disabled={loading}>
        {loading ? "Encrypting & Uploading..." : "Upload Encrypted PDF"}
      </button>
      {cid && <p>CID: {cid}</p>}
    </div>
  );
};

export default UploadPrivateIPFS;