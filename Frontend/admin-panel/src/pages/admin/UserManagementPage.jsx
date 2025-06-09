import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Mock API call function (replace with your actual API calls)
const fetchUsers = async (page = 1, limit = 10, searchTerm = '') => {
  console.log(`Fetching users: page=${page}, limit=${limit}, search=${searchTerm}`);
  // Replace with:
  // const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}&search=${searchTerm}`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
  // const data = await response.json();
  // return data;

  // Mock data based on your User model
  return new Promise(resolve => setTimeout(() => {
    const mockUsers = [
      { _id: '1', fullName: 'Shivani Sharma', email: 'shivani@example.com', collegeName: 'Modern College', district: 'Pune', tehsil: 'Pune City', coins: 150, subscriptionStatus: 'active', isActive: true, createdAt: new Date().toISOString() },
      { _id: '2', fullName: 'Rajesh Kumar', email: 'rajesh@example.com', collegeName: 'Fergusson College', district: 'Pune', tehsil: 'Pune City', coins: 0, subscriptionStatus: 'none', isActive: true, createdAt: new Date().toISOString() },
      { _id: '3', fullName: 'Admin User', email: 'admin@shiksharthi.com', collegeName: 'N/A', district: 'N/A', tehsil: 'N/A', coins: 0, subscriptionStatus: 'N/A', role: 'admin', isActive: true, createdAt: new Date().toISOString() },
    ];
    const filteredUsers = searchTerm
      ? mockUsers.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
      : mockUsers;
    resolve({ users: filteredUsers.slice((page - 1) * limit, page * limit), totalPages: Math.ceil(filteredUsers.length / limit), currentPage: page });
  }, 500));
};


const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchUsers(currentPage, 10, searchTerm)
      .then(data => {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch users. ' + err.message);
        setLoading(false);
      });
  }, [currentPage, searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    // useEffect will trigger fetch due to searchTerm change
  };


  if (loading) return <div className="container-xxl flex-grow-1 container-p-y">Loading users...</div>;
  if (error) return <div className="container-xxl flex-grow-1 container-p-y alert alert-danger">{error}</div>;

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Admin /</span> User Management</h4>

        {/* Search Bar */}
        <div className="card mb-4">
            <div className="card-body">
                <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
                    <div className="col-auto">
                        <label htmlFor="userSearch" className="col-form-label">Search Users</label>
                    </div>
                    <div className="col">
                        <input
                            type="text"
                            id="userSearch"
                            className="form-control"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="col-auto">
                        <button type="submit" className="btn btn-primary">Search</button>
                    </div>
                </form>
            </div>
        </div>


      {/* <!-- Basic Bootstrap Table --> */}
      <div className="card">
        <h5 className="card-header">Shiksharthi Users</h5>
        <div className="table-responsive text-nowrap">
          <table className="table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>College</th>
                <th>District</th>
                <th>Coins</th>
                <th>Subscription</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table-border-bottom-0">
              {users.length > 0 ? users.map(user => (
                <tr key={user._id}>
                  <td><strong>{user.fullName}</strong> {user.role === 'admin' && <span className="badge bg-label-danger ms-1">Admin</span>}</td>
                  <td>{user.email}</td>
                  <td>{user.collegeName}</td>
                  <td>{user.district}</td>
                  <td>{user.coins}</td>
                  <td><span className={`badge bg-label-${user.subscriptionStatus === 'active' ? 'success' : 'warning'}`}>{user.subscriptionStatus}</span></td>
                  <td><span className={`badge bg-label-${user.isActive ? 'primary' : 'secondary'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="dropdown">
                      <button type="button" className="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                        <i className="bx bx-dots-vertical-rounded"></i>
                      </button>
                      <div className="dropdown-menu">
                        <Link className="dropdown-item" to={`/users/view/${user._id}`}><i className="bx bx-show-alt me-1"></i> View Details</Link>
                        {/* <a className="dropdown-item" href="#!"><i className="bx bx-edit-alt me-1"></i> Edit</a> */}
                        {/* <a className="dropdown-item" href="#!"><i className="bx bx-trash me-1"></i> Suspend</a> */}
                      </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="9" className="text-center">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* <!--/ Basic Bootstrap Table --> */}

       {/* Pagination */}
       {totalPages > 1 && (
        <nav aria-label="Page navigation" className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
            </li>
            {[...Array(totalPages).keys()].map(num => (
              <li key={num + 1} className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(num + 1)}>{num + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
            </li>
          </ul>
        </nav>
      )}

    </div>
  );
};

export default UserManagementPage;