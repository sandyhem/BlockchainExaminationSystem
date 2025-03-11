import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; 

function SuperintendentTable({ state }) {
  const { contract } = state;
  const [superintendents, setSuperintendents] = useState([]);

  useEffect(() => {
    async function fetchSuperintendents() {
      if (!contract) return;

      try {
        
        const result = await contract.methods.getAllUsers().call();
        const userAddresses = result[0]; 
        const userDetails = result[1]; 

        console.log("All Users:", userAddresses, userDetails);

        const superintendentList = userDetails
          .map((user, index) => ({
            name: user.name,
            email: user.email,
            contactNumber: user.contactNumber,
            address: userAddresses[index],
            role: Number(user.role),
          }))
          .filter(user => user.role === 1);

        console.log("Filtered Superintendents:", superintendentList);
        setSuperintendents(superintendentList);
      } catch (error) {
        console.error("Error fetching superintendents:", error);
      }
    }

    fetchSuperintendents();
  }, [contract]);

  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Account</th>
            <th scope="col">Email</th>
            <th scope="col">Phone</th>
          </tr>
        </thead>
        <tbody>
          {superintendents.length > 0 ? (
            superintendents.map((superintendent, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{superintendent.name}</td>
                <td>{superintendent.address}</td>
                <td>{superintendent.email}</td>
                <td>{superintendent.contactNumber}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No superintendents added yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SuperintendentTable;
