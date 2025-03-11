import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure this import is correct

const ViewPaperRequests = ({ paperRequests }) => {
    return (
        <div className="container mt-4"> {/* Check if this div has Bootstrap container styling */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>View Paper Requests</h1>
                <a href="#" className="btn btn-primary">Create Paper Request</a> {/* Check if this button is styled */}
            </div>
            <div className="table-responsive"> {/* Check if the table is responsive */}
                <table className="table table-striped table-bordered"> {/* Check if the table has Bootstrap styles */}
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Exam ID</th>
                            <th scope="col">Exam Name</th>
                            <th scope="col">Subject</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paperRequests.length > 0 ? (
                            paperRequests.map((request, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{request.examId}</td>
                                    <td>{request.examName}</td>
                                    <td>{request.subject}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">No paper requests available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewPaperRequests;