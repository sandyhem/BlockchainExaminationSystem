import React, { useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";

const DownloadPrivateIPFS = () => {
  const [cid, setCid] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  const secretKey = import.meta.env.VITE_AES_KEY;

  const decryptFile = (encryptedText) => {
    try {
      console.log("Encrypted Text Input:", encryptedText);
      
      // Decrypt the text
      const decrypted = CryptoJS.AES.decrypt(encryptedText, CryptoJS.enc.Utf8.parse(secretKey), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      
      console.log("Decrypted WordArray:", decrypted);
      
      // Convert the decrypted WordArray to a Uint8Array
      const decryptedBytes = new Uint8Array(decrypted.sigBytes);
      for (let i = 0; i < decrypted.sigBytes; i++) {
        decryptedBytes[i] = (decrypted.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      }
      
      console.log("Decrypted Bytes:", decryptedBytes);
      return decryptedBytes;
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  };

  const fetchFileFromIPFS = async () => {
    if (!cid) {
      alert("Please enter a CID.");
      return;
    }

    setLoading(true);
    console.log("Fetching file for CID:", cid);

    try {
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
      console.log("Fetching from IPFS URL:", ipfsUrl);
      const response = await axios.get(ipfsUrl, { responseType: "text" });
      console.log("Response received:", response);

      const encryptedText = response.data;
      const decryptedBytes = decryptFile(encryptedText);
      if (!decryptedBytes) {
        alert("Decryption failed.");
        setLoading(false);
        return;
      }

      const fileBlob = new Blob([decryptedBytes], { type: "application/pdf" });
      console.log("Blob Created:", fileBlob);

      const url = URL.createObjectURL(fileBlob);
      console.log("Generated Object URL:", url);
      setFileUrl(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Check console for details.");
    }

    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Pinata Private IPFS</h2>
      <input
        type="text"
        value={cid}
        onChange={(e) => setCid(e.target.value)}
        placeholder="Enter IPFS CID"
      />
      <button onClick={fetchFileFromIPFS} disabled={loading}>
        {loading ? "Fetching & Decrypting..." : "Fetch Private PDF"}
      </button>
      {fileUrl && (
        <div>
          <a href={fileUrl} download="decrypted.pdf">Download PDF</a>
          <iframe
            src={fileUrl}
            style={{ width: "80%", height: "600px", marginTop: "20px" }}
            title="Decrypted PDF"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default DownloadPrivateIPFS;