import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Mock API call
const fetchPendingSubmissions = async (page = 1, limit = 10) => {
  console.log("Fetching pending submissions");
  // API: GET /api/admin/rewards/submissions?status=pending&page=${page}&limit=${limit}
  return new Promise(resolve => setTimeout(() => {
    resolve({
      submissions: [
        { _id: 'sub1', userId: 'user123', userFullName: 'Anita Desai', type: 'mess', data: { name: 'Good Food Mess', location: 'FC Road' }, submittedAt: new Date().toISOString(), status: 'pending' },
        { _id: 'sub2', userId: 'user456', userFullName: 'Vikram Batra', type: 'rental_room', data: { name: 'Cozy Room PG', location: 'Shivaji Nagar' }, submittedAt: new Date().toISOString(), status: 'pending' },
      ],
      totalPages: 1,
      currentPage: 1
    });
  }, 500));
};

const PendingSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add pagination state if needed: currentPage, totalPages

  useEffect(() => {
    setLoading(true);
    fetchPendingSubmissions()
      .then(data => {
        setSubmissions(data.submissions);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch submissions. ' + err.message);
        setLoading(false);
      });
  }, []);

  const handleApprove = async (submissionId) => {
    console.log(`Approving submission ${submissionId}`);
    // API: PATCH /api/admin/rewards/submissions/${submissionId}  Body: { status: 'approved' }
    // After success, refetch or remove from list
    alert(`Submission ${submissionId} approved (mock).`);
    setSubmissions(prev => prev.filter(s => s._id !== submissionId));
  };

  const handleReject = async (submissionId) => {
    const reason = prompt("Enter reason for rejection (optional):");
    console.log(`Rejecting submission ${submissionId} with reason: ${reason}`);
    // API: PATCH /api/admin/rewards/submissions/${submissionId}  Body: { status: 'rejected', reason: reason }
    // After success, refetch or remove from list
    alert(`Submission ${submissionId} rejected (mock).`);
    setSubmissions(prev => prev.filter(s => s._id !== submissionId));
  };


  if (loading) return <div className="container-xxl flex-grow-1 container-p-y">Loading submissions...</div>;
  if (error) return <div className="container-xxl flex-grow-1 container-p-y alert alert-danger">{error}</div>;

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Admin / Rewards /</span> Pending Submissions</h4>
      <div className="card">
        <h5 className="card-header">Data Submissions for Approval</h5>
        <div className="table-responsive text-nowrap">
          <table className="table">
            <thead>
              <tr>
                <th>Submitted By</th>
                <th>Type</th>
                <th>Data Preview</th>
                <th>Submitted At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table-border-bottom-0">
              {submissions.length > 0 ? submissions.map(sub => (
                <tr key={sub._id}>
                  <td>{sub.userFullName || sub.userId}</td>
                  <td><span className="badge bg-label-info">{sub.type.replace('_', ' ').toUpperCase()}</span></td>
                  <td>
                    <small>
                      {sub.data.name ? `Name: ${sub.data.name}` : ''}
                      {sub.data.location ? `, Loc: ${sub.data.location}` : ''}
                      {/* Add more preview fields as needed */}
                    </small>
                  </td>
                  <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-sm btn-success me-1" onClick={() => handleApprove(sub._id)}>Approve</button>
                    <button className="btn btn-sm btn-danger me-1" onClick={() => handleReject(sub._id)}>Reject</button>
                    <Link to={`/submissions/view/${sub._id}`} className="btn btn-sm btn-outline-secondary">View</Link>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="text-center">No pending submissions.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PendingSubmissionsPage;