import React, { useEffect, useState } from 'react';
import registerservice from '../FireStore/services/registerservice';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function UserManage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const userData = await registerservice.getUsers();
        console.log("fetch:", userData);
        if (userData) {
          setUsers(userData);
          setFilteredUsers(userData);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      result = result.filter(user => 
        user.address && user.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, statusFilter, users]);

  const handleApprove = async (userId) => {
    try {
      // await registerservice.updateUserStatus(userId, 'approved');
      // Update local state to reflect the change
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'approved' } : user
      ));
    } catch (err) {
      console.error("Error approving user:", err);
      setError("Failed to approve user");
    }
  };

  const handleDeny = async (userId) => {
    try {
      // await registerservice.updateUserStatus(userId, 'denied');
      // Update local state to reflect the change
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'denied' } : user
      ));
    } catch (err) {
      console.error("Error denying user:", err);
      setError("Failed to deny user");
    }
  };

  const handleRevoke = async (userId) => {
    try {
      await registerservice.updateUserStatus(userId, 'revoked');
      // Update local state to reflect the change
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'revoked' } : user
      ));
    } catch (err) {
      console.error("Error revoking user:", err);
      setError("Failed to revoke user");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-info';
      case 'approved':
        return 'bg-primary';
      case 'denied':
        return 'bg-danger';
      case 'revoked':
        return 'bg-secondary';
      default:
        return 'bg-info';
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
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

  return (
    <div className="container mt-4">
      <div className="card border-primary mb-4">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">User Management</h2>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-primary text-white">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-primary"
                  placeholder="Search by address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <select 
                className="form-select border-primary"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="alert alert-info">No users found</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-primary">
                  <tr>
                    <th>Name</th>
                    <th>UnivID</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name || 'N/A'}</td>
                      <td>{user.univID || 'N/A'}</td>
                      <td>{user.email || 'N/A'}</td>
                      <td>{user.phone || 'N/A'}</td>
                      <td>{user.address || 'N/A'}</td>
                      <td>{user.role === "1" ? "Teacher" : "Superintendent"}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(user.generate == 1 ? 'pending' : '')}`}>
                          {user.generate == 1 ?'requested':''}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          {user.generate == 1 && (
                            <>
                              <button 
                                className="btn btn-sm btn-outline-primary" 
                                onClick={() => handleApprove(user.id)}
                                title="Approve User"
                              >
                                <i className="bi bi-check-circle"></i> Approve
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger" 
                                onClick={() => handleDeny(user.id)}
                                title="Deny User"
                              >
                                <i className="bi bi-x-circle"></i> Deny
                              </button>
                            </>
                          )}
                          {/* need to be from metamask */}
                          {user.status === 'approved' && (
                            <button 
                              className="btn btn-sm btn-outline-secondary" 
                              onClick={() => handleRevoke(user.id)}
                              title="Revoke User"
                            >
                              <i className="bi bi-slash-circle"></i> Revoke
                            </button>
                          )}
                          {(user.status === 'denied' || user.status === 'revoked') && (
                            <button 
                              className="btn btn-sm btn-outline-primary" 
                              onClick={() => handleApprove(user.id)}
                              title="Reinstate User"
                            >
                              <i className="bi bi-arrow-counterclockwise"></i> Reinstate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card-footer bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-primary">Total Users: {users.length}</small>
            <small className="text-primary">Filtered Users: {filteredUsers.length}</small>
          </div>
        </div>
      </div>
    </div>
  );
}