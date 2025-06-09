// src/pages/UserAccount.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { userAPI, coinAPI, emailAPI } from '../services/adminApi';
import { toast } from 'sonner';

// --- Reusable Modal Component for Sending Email ---
const SendRewardEmailModal = ({ isOpen, onClose, user }) => {
    const [subject, setSubject] = useState("🎉 Congratulations from Shikshaarthi!");
    const [messageBody, setMessageBody] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (user) {
            setMessageBody(`Hi ${user.fullName || 'User'},\n\nCongratulations! As a token of our appreciation for your contribution, here is your reward:\n\n[PASTE VOUCHER CODE/LINK HERE]\n\nThanks for being an awesome member of the Shikshaarthi community!\n\nBest,\nThe Shikshaarthi Team`);
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setIsSending(true);
        const toastId = toast.loading("Sending email...");
        try {
            const emailData = { to: user.email, subject, text: messageBody };
            const result = await emailAPI.sendRewardEmail(emailData);
            toast.success(result.message, { id: toastId });
            onClose();
        } catch (error) {
            toast.error(error.message, { id: toastId });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Send Reward to {user.fullName}</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close" disabled={isSending}></button>
                    </div>
                    <form onSubmit={handleSendEmail}>
                        <div className="modal-body">
                            <div className="mb-3"><label className="form-label">To</label><input type="email" className="form-control" value={user.email || ''} readOnly /></div>
                            <div className="mb-3"><label className="form-label">Subject</label><input type="text" className="form-control" value={subject} onChange={e => setSubject(e.target.value)} required /></div>
                            <div className="mb-3"><label className="form-label">Message Body</label><textarea className="form-control" rows="10" value={messageBody} onChange={e => setMessageBody(e.target.value)} required></textarea></div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={isSending}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isSending}>
                                {isSending ? <><span className="spinner-border spinner-border-sm me-1"></span>Sending...</> : 'Send Email'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// --- Main UserAccount Component ---
const UserAccount = () => {
  const { userId } = useParams();
  const location = useLocation();

  // --- STATE MANAGEMENT ---
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDeactivation, setConfirmDeactivation] = useState(false);
  const [coinTransactions, setCoinTransactions] = useState([]);
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await userAPI.getUserById(userId);
        if (response.success) {
          setUserData(response.data);
          setFormData(response.data);
        } else {
          throw new Error(response.message);
        }
      } catch (err) {
        setError(err.message);
        toast.error(`Failed to load user: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const fetchCoinTransactions = async () => {
      if (!userId) return;
      setLoadingTransactions(true);
      try {
        // MOCK DATA until backend is ready. When ready, uncomment the real call.
        // const response = await coinAPI.getUserTransactions(userId);
        // setCoinTransactions(response.data || []);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockTransactions = [
          { _id: 'tx1', type: 'submission_reward', amount: 100, description: 'Data submission reward for Mess', transactionDate: new Date(Date.now() - 86400000 * 2).toISOString(), serviceType: 'mess' },
          { _id: 'tx2', type: 'reward_redemption', amount: -50, description: 'Redeemed voucher for Bronze level', transactionDate: new Date(Date.now() - 86400000).toISOString(), serviceType: null },
          { _id: 'tx3', type: 'login_bonus', amount: 50, description: 'Welcome bonus for creating account', transactionDate: new Date(Date.now() - 86400000 * 3).toISOString(), serviceType: null },
        ];
        setCoinTransactions(mockTransactions);

      } catch (err) {
        console.error('Error fetching coin transactions:', err);
        toast.error("Could not load coin transaction history.");
        setCoinTransactions([]);
      } finally {
        setLoadingTransactions(false);
      }
    };
    fetchCoinTransactions();
  }, [userId]);

  // NEW: Fetch redemption history
  useEffect(() => {
    const fetchRedemptionHistory = async () => {
      if (!userId) return;
      setLoadingRedemptions(true);
      try {
        const response = await coinAPI.getUserRedemptionHistory(userId);
        if (response.success) {
          setRedemptionHistory(response.data || []);
        } else {
          throw new Error(response.message);
        }
      } catch (err) {
        console.error('Error fetching redemption history:', err);
        toast.error("Could not load redemption history.");
        setRedemptionHistory([]);
      } finally {
        setLoadingRedemptions(false);
      }
    };
    fetchRedemptionHistory();
  }, [userId]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading("Saving changes...");
    try {
      const dataToUpdate = {
        fullName: formData.fullName,
        contact: formData.contact,
        collegeName: formData.collegeName,
        district: formData.district,
        tehsil: formData.tehsil,
        pincode: formData.pincode,
      };
      const response = await userAPI.updateUser(userId, dataToUpdate);
      if (response.success) {
        setUserData(response.data);
        setFormData(response.data);
        setIsEditing(false);
        toast.success('User details updated successfully!', { id: toastId });
      } else { throw new Error(response.message); }
    } catch (err) {
      toast.error(`Error updating user: ${err.message}`, { id: toastId });
    } finally { setIsSaving(false); }
  };
  
  const handleCancelEdit = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  const handleDeactivateAccount = async (e) => {
    e.preventDefault();
    if (!confirmDeactivation) {
      toast.warning('Please confirm the action by checking the box.');
      return;
    }
    const action = userData.isActive ? 'Deactivating' : 'Activating';
    const toastId = toast.loading(`${action} account...`);
    try {
      const response = await userAPI.toggleUserStatus(userId);
      if (response.success) {
        setUserData(prev => ({ ...prev, isActive: response.data.isActive }));
        toast.success(`Account successfully ${response.data.isActive ? 'activated' : 'deactivated'}.`, { id: toastId });
        setConfirmDeactivation(false);
      } else { throw new Error(response.message); }
    } catch (err) {
      toast.error(`Error: ${err.message}`, { id: toastId });
    }
  };

  const formatTransactionType = (type) => (type || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const getTransactionBadgeColor = (amount) => (amount > 0 ? 'success' : 'danger');
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'fulfilled': return 'success';
      case 'pending_fulfillment': return 'warning';
      case 'failed': return 'danger';
      case 'cancelled': return 'secondary';
      default: return 'info';
    }
  };
  
  // --- RENDER LOGIC ---
  if (isLoading) return <div className="text-center p-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  if (error) return <div className="alert alert-danger mx-4"><strong>Error:</strong> {error}</div>;
  if (!userData) return <div className="alert alert-warning mx-4">User data could not be loaded.</div>;

  const accountPagePath = `/admin/users/${userId}/manage`;
  const notificationsPagePath = `/admin/users/${userId}/notifications`;

  return (
    <>
      <div className="container-xxl flex-grow-1 container-p-y">
        <h4 className="fw-bold py-3 mb-4">
          <span className="text-muted fw-light">Admin / Users / {userData.fullName} / </span>Account
        </h4>

        <div className="row">
          <div className="col-md-12">
            <ul className="nav nav-pills flex-column flex-md-row mb-3">
                <li className="nav-item"><Link className={`nav-link ${location.pathname === accountPagePath ? 'active' : ''}`} to={accountPagePath}><i className="bx bx-user me-1"></i> Account</Link></li>
                <li className="nav-item"><Link className="nav-link" to={notificationsPagePath}><i className="bx bx-bell me-1"></i> Notifications</Link></li>
                <li className="nav-item"><Link className="nav-link" to={`/maintenance`}><i className="bx bx-link-alt me-1"></i> Connections</Link></li>
                <li className="nav-item"><Link className="nav-link" to={`/maintenance`}><i className="bx bx-key me-1"></i> Change Password</Link></li>
            </ul>

            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Profile Details</h5>
                <div className="d-flex align-items-center gap-2">
                  <button type="button" className="btn btn-success btn-sm" onClick={() => setIsEmailModalOpen(true)}>
                      <i className="bx bx-mail-send me-1"></i> Send Reward
                  </button>
                  {!isEditing ? (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsEditing(true)}><i className="bx bx-edit-alt me-1"></i> Edit</button>
                  ) : (
                    <div className="d-flex gap-2">
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleCancelEdit} disabled={isSaving}>Cancel</button>
                        <button type="submit" form="formAccountSettings" className="btn btn-primary btn-sm" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="card-body">
                <form id="formAccountSettings" onSubmit={handleSaveChanges}>
                  <div className="row">
                    <div className="mb-3 col-md-6"><label className="form-label">Full Name</label><input className="form-control" name="fullName" value={formData.fullName || ''} onChange={handleInputChange} readOnly={!isEditing} /></div>
                    <div className="mb-3 col-md-6"><label className="form-label">E-mail</label><input className="form-control" value={userData.email || ''} readOnly /></div>
                    <div className="mb-3 col-md-6"><label className="form-label">Contact</label><input className="form-control" name="contact" value={formData.contact || ''} onChange={handleInputChange} readOnly={!isEditing} /></div>
                    <div className="mb-3 col-md-6"><label className="form-label">College</label><input className="form-control" name="collegeName" value={userData.collegeName || ''} onChange={handleInputChange} readOnly={!isEditing} /></div>
                    <div className="mb-3 col-md-6"><label className="form-label">District</label><input className="form-control" name="district" value={userData.district || ''} onChange={handleInputChange} readOnly={!isEditing} /></div>
                    <div className="mb-3 col-md-6"><label className="form-label">Tehsil</label><input className="form-control" name="tehsil" value={userData.tehsil || ''} onChange={handleInputChange} readOnly={!isEditing} /></div>
                    <div className="mb-3 col-md-6"><label className="form-label">Pincode</label><input className="form-control" name="pincode" value={userData.pincode || ''} onChange={handleInputChange} readOnly={!isEditing} maxLength="6" /></div>
                  </div>
                </form>
              </div>
            </div>

            <div className="card mb-4">
              <h5 className="card-header">Account Information</h5>
              <div className="card-body"><div className="row">
                <div className="col-md-6 mb-3"><strong>Role:</strong> {userData.role?.toUpperCase()}</div>
                <div className="col-md-6 mb-3"><strong>Subscription:</strong> <span className={`badge bg-${userData.subscriptionStatus === 'active' ? 'success' : 'warning'}`}>{userData.subscriptionStatus?.toUpperCase() || 'NONE'}</span></div>
                <div className="col-md-6 mb-3"><strong>Current Coins:</strong> <span className="fw-bold text-primary">{userData.coins || 0}</span> <i className="bx bx-coin"></i></div>
                <div className="col-md-6 mb-3"><strong>Total Earned:</strong> {userData.totalCoinsEarned || 0}</div>
                <div className="col-md-6 mb-3"><strong>Total Spent:</strong> {userData.totalCoinsSpent || 0}</div>
                <div className="col-md-6 mb-3"><strong>Account Status:</strong> {userData.isActive ? <span className="text-success">Active</span> : <span className="text-danger">Inactive</span>}</div>
                <div className="col-md-6 mb-3"><strong>Verification:</strong> {userData.isVerified ? <span className="text-success">Verified <i className="bx bx-check-circle"></i></span> : <span className="text-warning">Not Verified</span>}</div>
                <div className="col-md-6 mb-3"><strong>Joined On:</strong> {formatDate(userData.createdAt)}</div>
              </div></div>
            </div>

            <div className="card mb-4">
              <h5 className="card-header">Submission Statistics</h5>
              <div className="card-body"><div className="row">
                <div className="col-md-6 mb-3"><strong>Total Submissions:</strong> {userData.submissionStats?.totalSubmissions || 0}</div>
                <div className="col-md-6 mb-3"><strong>Approved Submissions:</strong> <span className="text-success">{userData.submissionStats?.approvedSubmissions || 0}</span></div>
                <div className="col-md-6 mb-3"><strong>Rejected Submissions:</strong> <span className="text-danger">{userData.submissionStats?.rejectedSubmissions || 0}</span></div>
                <div className="col-md-6 mb-3"><strong>Last Submission:</strong> {formatDate(userData.submissionStats?.lastSubmissionAt)}</div>
              </div></div>
            </div>
            

            {/* NEW: Reward Redemption History Card */}
            <div className="card mb-4">
              <h5 className="card-header d-flex justify-content-between align-items-center">
                Reward Redemption History
                {loadingRedemptions && <div className="spinner-border spinner-border-sm text-primary" role="status"></div>}
              </h5>
              <div className="card-body">
                {loadingRedemptions ? (
                  <div className="text-center p-4">Loading Redemption History...</div>
                ) : redemptionHistory.length > 0 ? (
                  <div className="table-responsive text-nowrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Reward</th>
                          <th>Level</th>
                          <th>Coins Spent</th>
                          <th>Status</th>
                          <th>Fulfillment Details</th>
                        </tr>
                      </thead>
                      <tbody className="table-border-bottom-0">
                        {redemptionHistory.map((redemption) => (
                          <tr key={redemption._id}>
                            <td>{formatDate(redemption.redeemedAt)}</td>
                            <td>
                              <div className="fw-medium">{redemption.rewardName}</div>
                            </td>
                            <td>
                              <span className="badge bg-primary">Level {redemption.levelId}</span>
                            </td>
                            <td>
                              <span className="fw-bold text-danger">-{redemption.coinsDeducted}</span>
                            </td>
                            <td>
                              <span className={`badge bg-${getStatusBadgeColor(redemption.status)}`}>
                                {redemption.status.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </td>
                            <td>
                              {redemption.fulfillmentDetails ? (
                                <small className="text-muted">{redemption.fulfillmentDetails}</small>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bx bx-gift bx-lg text-muted"></i>
                    <p className="text-muted mt-2">No reward redemptions found for this user.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h5 className="card-header">{userData.isActive ? 'Deactivate Account' : 'Activate Account'}</h5>
              <div className="card-body">
                <div className="mb-3 col-12 mb-0"><div className="alert alert-warning"><h6 className="alert-heading fw-bold mb-1">Are you sure?</h6><p className="mb-0">This will {userData.isActive ? "prevent the user from logging in" : "allow the user to log in again"} and toggle their status.</p></div></div>
                <form id="formAccountDeactivation" onSubmit={handleDeactivateAccount}><div className="form-check mb-3"><input className="form-check-input" type="checkbox" id="accountActivation" checked={confirmDeactivation} onChange={(e) => setConfirmDeactivation(e.target.checked)} /><label className="form-check-label" htmlFor="accountActivation">I confirm I want to change the account status.</label></div><button type="submit" className={`btn ${userData.isActive ? 'btn-danger' : 'btn-success'}`} disabled={!confirmDeactivation}>{userData.isActive ? 'Deactivate Account' : 'Activate Account'}</button></form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SendRewardEmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
        user={userData} 
      />
    </>
  );
};

export default UserAccount;