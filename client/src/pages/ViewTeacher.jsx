import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

function TeacherTable({ state }) {
    const { contract } = state;
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        async function fetchTeachers() {
            if (!contract) return;

            try {
                const result = await contract.methods.getAllUsers().call();
                const userAddresses = result[0]; 
                const userDetails = result[1];
        
                console.log("All Users:", userAddresses, userDetails);

                const teacherList = userDetails
                  .map((user, index) => ({
                    name: user.name,
                    email: user.email,
                    contactNumber: user.contactNumber,
                    address: userAddresses[index],
                    role: Number(user.role), 
                  }))
                  .filter(user => user.role === 0); 
        
                console.log("Filtered Teachers:", teacherList);
                setTeachers(teacherList);
              } catch (error) {
                console.error("Error fetching Teachers:", error);
              }
            }

        fetchTeachers();
    }, [contract, state.accounts]); // Added state.accounts dependency

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
                    {teachers.length > 0 ? (
                        teachers.map((teacher, index) => (
                            <tr key={index}>
                                <th scope="row">{index + 1}</th>
                                <td>{teacher.name}</td>
                                <td>{teacher.address}</td>
                                <td>{teacher.email}</td>
                                <td>{teacher.contactNumber}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center">No teachers added yet.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default TeacherTable;
