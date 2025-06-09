
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/adminApi'; // Using the API service

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

const Users = () => {
  // Component State
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  const debounceTimeout = useRef(null);

  const fetchUsers = useCallback(async (page = 1, search = searchTerm) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userAPI.getAllUsers({
        page,
        limit: 10,
        role: roleFilter,
        status: statusFilter,
        verified: verificationFilter,
        search: search.trim(),
      });

      if (response.success) {
        setUsers(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalUsers(response.pagination.totalUsers);
        setCurrentPage(response.pagination.currentPage);
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err.message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [roleFilter, statusFilter, verificationFilter]); // Removed searchTerm and fetchUsers from deps for debounce

  // Effect for initial load and when filters (excluding search) change
  useEffect(() => {
    fetchUsers(1, searchTerm);
  }, [roleFilter, statusFilter, verificationFilter]);

  // Effect for handling debounced search
  useEffect(() => {
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchUsers(1, searchTerm);
    }, 500);

    return () => clearTimeout(debounceTimeout.current);
  }, [searchTerm, fetchUsers]);

  // Effect for handling pagination changes
  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
  }, [currentPage]);

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user: ${userName}? This is a soft delete.`)) {
      try {
        const response = await userAPI.deleteUser(userId);
        if (response.success) {
          alert(response.message);
          fetchUsers(currentPage); 
        } else { throw new Error(response.message); }
      } catch (err) { alert(`Error: ${err.message}`); }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const response = await userAPI.toggleUserStatus(userId);
      if (response.success) {
        alert(response.message);
        setUsers(prevUsers => prevUsers.map(user => 
          user._id === userId ? { ...user, isActive: response.data.isActive } : user
        ));
      } else { throw new Error(response.message); }
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  const handleToggleVerification = async (userId) => {
    try {
      const response = await userAPI.toggleUserVerification(userId);
      if (response.success) {
        alert(response.message);
        // CORRECTED: Update 'emailVerified' to match the backend schema
        setUsers(prevUsers => prevUsers.map(user => 
          user._id === userId ? { ...user, emailVerified: response.data.emailVerified } : user
        ));
      } else { throw new Error(response.message); }
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Admin /</span> User Management</h4>

      <div className="card">
        <div className="card-header">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <h5 className="mb-0">All Users ({totalUsers})</h5>
            </div>
            <hr className="mt-3 mb-2"/>
            <div className="row g-3 align-items-center">
                <div className="col-md-4"><input type="text" className="form-control" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                <div className="col-md-2"><select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}><option value="ALL">All Roles</option><option value="user">User</option><option value="admin">Admin</option></select></div>
                <div className="col-md-2"><select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="ALL">All Statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>
                <div className="col-md-2"><select className="form-select" value={verificationFilter} onChange={e => setVerificationFilter(e.target.value)}><option value="ALL">All Verification</option><option value="VERIFIED">Verified</option><option value="UNVERIFIED">Unverified</option></select></div>
                <div className="col-md-2"><button className="btn btn-outline-secondary w-100" onClick={() => {setSearchTerm(''); setRoleFilter('ALL'); setStatusFilter('ALL'); setVerificationFilter('ALL');}}>Clear</button></div>
            </div>
        </div>
        
        <div className="table-responsive text-nowrap">
          {isLoading ? (
            <div className="text-center p-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>
          ) : error ? (
            <div className="text-center p-5"><div className="alert alert-danger mx-4"><strong>Error:</strong> {error}</div></div>
          ) : users.length === 0 ? (
            <div className="text-center p-5"><i className='bx bx-user-x bx-lg text-muted mb-3'></i><h5 className="mb-1">No Users Found</h5><p className="text-muted">No users match the current filters.</p></div>
          ) : (
            <table className="table table-hover">
              <thead><tr><th>User</th><th>Role</th><th>Account Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody className="table-border-bottom-0">
                {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className={`me-2 ${user.isOnline ? 'bg-success' : 'bg-secondary'}`} style={{ width: '8px', height: '8px', borderRadius: '50%' }} title={user.isOnline ? 'Online' : 'Offline'}></div>
                        <div>
                          <Link to={`/admin/users/${user._id}/manage`} className="fw-semibold text-heading">{user.fullName}</Link>
                          <div className="text-muted small">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge bg-label-${user.role === 'admin' ? 'danger' : 'info'}`}>{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}</span></td>
                    <td>
                        <span className={`badge me-1 bg-label-${user.isActive ? 'success' : 'danger'}`}>{user.isActive ? 'Active' : 'Disabled'}</span>
                        <span className={`badge bg-label-${user.emailVerified ? 'primary' : 'warning'}`}>{user.emailVerified ? 'Verified' : 'verified'}</span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="dropdown">
                        <button type="button" className="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i className="bx bx-dots-vertical-rounded"></i></button>
                        <div className="dropdown-menu">
                          <Link className="dropdown-item" to={`/admin/users/${user._id}/manage`}><i className="bx bx-show-alt me-1"></i> View/Edit</Link>
                          <button className="dropdown-item" onClick={() => handleToggleStatus(user._id)}>{user.isActive ? <><i className="bx bx-toggle-right me-1 text-danger"></i> Deactivate</> : <><i className="bx bx-toggle-left me-1 text-success"></i> Activate</>}</button>
                          <button className="dropdown-item" onClick={() => handleToggleVerification(user._id)}>{user.emailVerified ? <><i className="bx bx-user-x me-1"></i> Unverify</> : <><i className="bx bx-user-check me-1"></i> Verify</>}</button>
                          <div className="dropdown-divider"></div>
                          <button className="dropdown-item text-danger" onClick={() => handleDeleteUser(user._id, user.fullName)}><i className="bx bx-trash me-1"></i> Delete User</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {totalPages > 1 && !isLoading && !error && (
            <div className="card-footer d-flex justify-content-center">
                <nav aria-label="Page navigation">
                    <ul className="pagination mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>«</button></li>
                        {[...Array(totalPages).keys()].map(number => (
                            <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                                <button onClick={() => setCurrentPage(number + 1)} className="page-link">{number + 1}</button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}><button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>»</button></li>
                    </ul>
                </nav>
            </div>
        )}
      </div>
    </div>
  );
};

export default Users;