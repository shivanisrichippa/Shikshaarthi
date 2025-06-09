// FILE: src/pages/Profile.jsx (CORRECTED)

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import tokenService from '../utils/tokenService'; // Ensure this path is correct

// --- Style & Configuration Constants ---
const goldColor = '#d4a762';
const blackColor = '#212529';
const whiteColor = '#fff';
const backendUrl = import.meta.env.VITE_BACKEND_AUTH_URL;

// --- Helper Functions ---
const levels = [
    { level: 1, name: "Bronze", minCoins: 0, maxCoins: 199, icon: '🥉' },
    { level: 2, name: "Silver", minCoins: 200, maxCoins: 299, icon: '🥈' },
    { level: 3, name: "Gold", minCoins: 300, maxCoins: 399, icon: '🥇' },
    { level: 4, name: "Platinum", minCoins: 400, maxCoins: 499, icon: '💎' },
    { level: 6, name: "Diamond", minCoins: 500, maxCoins: 699, icon: '✨' },
    { level: 7, name: "Master explorer", minCoins: 700, maxCoins: 999, icon: '✨' },
    { level: 8, name: "Legendry Shikshaarthi", minCoins: 1000, maxCoins: 1250, icon: '✨' },
];

const getUserLevel = (coins = 0) => {
    const currentLevel = levels.find(l => coins >= l.minCoins && coins <= l.maxCoins) || levels[0];
    const progress = Math.min(100, currentLevel.maxCoins === Infinity ? 100 : ((coins - currentLevel.minCoins) / (currentLevel.maxCoins - currentLevel.minCoins + 1)) * 100);
    return { ...currentLevel, progress };
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) { return 'Invalid Date'; }
};

// --- Main Profile Component ---
const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', contact: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    const navigate = useNavigate();

    const fetchProfile = useCallback(async (isSilent = false) => {
        if (!tokenService.getToken()) {
            if (!isSilent) toast.error("Authentication required.", { description: "Please log in to access your profile" });
            navigate('/login');
            return;
        }

        const fetchToast = !isSilent ? toast.loading("Fetching your profile...") : null;
        
        try {
            const token = tokenService.getToken();
            const response = await axios.get(`${backendUrl}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(response.data.user);
            setFormData({ fullName: response.data.user.fullName, contact: response.data.user.contact });
            
            if (fetchToast) {
                toast.success("Profile data updated!", { id: fetchToast });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Could not load your profile.";
            if (fetchToast) toast.error("Failed to load profile", { id: fetchToast, description: errorMessage });
            
            if (error.response?.status === 401) {
                tokenService.clearTokens();
                if (!isSilent) toast.error("Session expired", { description: "Please log in again." });
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                toast.info("Syncing your profile data...");
                fetchProfile(true); 
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchProfile]);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handlePasswordInputChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const handleToggleEdit = () => {
        if (isEditing) {
            setFormData({ fullName: user.fullName, contact: user.contact });
            toast.info("Edit mode cancelled", { description: "Your changes have been discarded" });
        } else {
            toast.info("Edit mode enabled", { description: "You can now modify your name and contact" });
        }
        setIsEditing(!isEditing);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Saving changes...");
        try {
            const token = tokenService.getToken();
            await axios.put(`${backendUrl}/api/auth/profile`, formData, { headers: { Authorization: `Bearer ${token}` } });
            setUser({ ...user, ...formData });
            setIsEditing(false);
            toast.success("Profile updated successfully!", { id: loadingToast });
        } catch (error) {
            toast.error("Failed to update profile", { id: loadingToast, description: error.response?.data?.error || "Update failed." });
        }
    };
    
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            return toast.error("All password fields are required.");
        }
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            return toast.error("New passwords do not match.");
        }
        if (passwordData.newPassword.length < 8) {
            return toast.error("Password must be at least 8 characters long.");
        }
        
        const loadingToast = toast.loading("Updating password...");
        try {
            const token = tokenService.getToken();
            await axios.post(`${backendUrl}/api/auth/change-password`, { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }, { headers: { Authorization: `Bearer ${token}` } });
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            toast.success("Password changed successfully!", { id: loadingToast });
        } catch (error) {
            toast.error("Password change failed", { id: loadingToast, description: error.response?.data?.error || "Failed to change password." });
        }
    };

    const handleLogout = () => {
        toast("Are you sure you want to log out?", {
            action: {
                label: "Logout",
                onClick: () => {
                    const logoutToast = toast.loading("Logging you out...");
                    tokenService.clearTokens();
                    toast.success("Logged out successfully", { id: logoutToast });
                    navigate('/login');
                }
            },
            cancel: { label: "Cancel" },
        });
    };
    
    // CORRECTED: The navigation path.
    const navigateToAddData = () => {
        toast.info("Redirecting...");
        navigate('/add-data');
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
            <Toaster position="top-right" richColors closeButton />
            <div className="spinner-border" style={{ width: "3.5rem", height: "3.5rem", color: goldColor }} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    if (!user) return (
        <div className="container text-center py-5">
            <Toaster position="top-right" richColors closeButton />
            <h2 className="text-danger">Failed to Load Profile</h2>
            <button onClick={() => navigate('/login')} className="btn" style={{ backgroundColor: goldColor, color: whiteColor, padding: '10px 20px' }}>Go to Login</button>
        </div>
    );
    
    // ** CORRECTION AND SAFEGURAD **
    // Ensure `submissionStats` and `redeemedRewards` are always defined to prevent runtime errors.
    const userLevel = getUserLevel(user.coins);
    const submissionStats = user.submissionStats || { approvedSubmissions: 0, rejectedSubmissions: 0, pendingSubmissions: 0 };
    const redeemedRewards = user.redeemedRewards || [];
    const userRole = user.role || 'user';

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: '#f4f6f9' }}>
            <Toaster position="top-right" richColors closeButton />
            <div className="container">
                 <div className="row justify-content-center mb-5">
                    <div className="col-lg-10 text-center">
                        <h1 className="display-4 fw-bold" style={{ color: blackColor }}>My Dashboard</h1>
                        <p className="fs-5 text-muted">Welcome back, {user.fullName.split(' ')[0]}! Here's your personal hub.</p>
                    </div>
                </div>
                <div className="row g-4">
                    {/* Left Column */}
                    <div className="col-lg-7">
                        {/* Profile Header Card */}
                        <div className="card shadow-sm border-0 mb-4">
                            <div className="card-body p-4">
                                <div className="d-flex flex-column flex-sm-row align-items-center">
                                    <div className="d-flex justify-content-center align-items-center rounded-circle me-sm-4 mb-3 mb-sm-0" style={{ width: '120px', height: '120px', backgroundColor: '#e9ecef' }}>
                                        <i className="fas fa-user" style={{ fontSize: '60px', color: goldColor }}></i>
                                    </div>
                                    <div className="text-center text-sm-start">
                                        <h2 className="mb-1" style={{ color: blackColor }}>{user.fullName}</h2>
                                        <p className="mb-2 text-muted"><i className="fas fa-envelope me-2"></i>{user.email}</p>
                                        <span className={`badge ${userRole === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
                                        {user.emailVerified && <span className="badge bg-success ms-2"><i className="fas fa-check-circle me-1"></i>Verified</span>}
                                        <p className="text-muted mt-2 small">Member since: {formatDate(user.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Information Card */}
                         <div className="card shadow-sm border-0">
                            <div className="card-header bg-white p-3 d-flex justify-content-between align-items-center">
                                <h5 className="mb-0"><i className="fas fa-user-cog me-2" style={{color: goldColor}}></i>Account Information</h5>
                                <button onClick={handleToggleEdit} className="btn btn-sm" style={{backgroundColor: isEditing ? '' : goldColor, color: isEditing ? blackColor : whiteColor, border: '1px solid #ccc' }}>
                                    {isEditing ? <><i className="fas fa-times me-1"></i>Cancel</> : <><i className="fas fa-edit me-1"></i>Edit</>}
                                </button>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleUpdateProfile}>
                                    <div className="row g-3">
                                        <div className="col-md-6"><label className="form-label">Full Name</label><input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="form-control" disabled={!isEditing} /></div>
                                        <div className="col-md-6"><label className="form-label">Mobile Number</label><input type="tel" name="contact" value={formData.contact} onChange={handleInputChange} className="form-control" disabled={!isEditing} /></div>
                                        <div className="col-md-6"><label className="form-label">College</label><input type="text" className="form-control" value={user.collegeName} disabled /></div>
                                        <div className="col-md-6"><label className="form-label">District</label><input type="text" className="form-control" value={user.district} disabled /></div>
                                        <div className="col-md-6"><label className="form-label">Tehsil</label><input type="text" className="form-control" value={user.tehsil} disabled /></div>
                                        <div className="col-md-6"><label className="form-label">Pincode</label><input type="text" className="form-control" value={user.pincode} disabled /></div>
                                    </div>
                                    {isEditing && (<button type="submit" className="btn mt-4" style={{ backgroundColor: goldColor, color: whiteColor }}><i className="fas fa-save me-2"></i>Save Changes</button>)}
                                </form>
                                <hr className="my-4"/>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div><h6 className="mb-0">Security</h6><p className="text-muted small mb-0">It's a good idea to use a strong password.</p></div>
                                    <button onClick={() => { setShowPasswordModal(true); }} className="btn btn-outline-dark"><i className="fas fa-key me-2"></i>Change Password</button>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone Card */}
                        <div className="card shadow-sm border-0 mt-4">
                            <div className="card-header bg-white p-3"><h5 className="mb-0 text-danger"><i className="fas fa-exclamation-triangle me-2"></i>Danger Zone</h5></div>
                            <div className="card-body p-4 d-flex justify-content-between align-items-center">
                                <div><h6 className="mb-1">Logout</h6><p className="text-muted small mb-0">This will end your current session.</p></div>
                                <button onClick={handleLogout} className="btn btn-danger"><i className="fas fa-sign-out-alt me-2"></i>Logout</button>
                            </div>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="col-lg-5">
                        {/* Contribute Card */}
                        <div className="card shadow-sm border-0 mb-4 text-center">
                             <div className="card-body p-4">
                                <i className="fas fa-cloud-upload-alt fa-3x mb-3" style={{ color: goldColor }}></i>
                                <h5 className="fw-bold" style={{color: blackColor}}>Contribute & Earn Coins</h5>
                                <p className="text-muted">Help the community by adding new information and get rewarded with Super Coins for every approved submission.</p>
                                <button onClick={navigateToAddData} className="btn" style={{backgroundColor: goldColor, color: whiteColor}}>
                                    <i className="fas fa-plus-circle me-2"></i>Add New Data
                                </button>
                            </div>
                        </div>

                        {/* Level & Coins Card */}
                        <div className="card shadow-sm border-0 mb-4 text-center">
                            <div className="card-body p-4">
                                <h5 className="mb-3" style={{color: blackColor}}>Your Level</h5>
                                <h1 className="display-3 fw-bold" style={{ color: goldColor }}>{userLevel.icon}</h1>
                                <h3 className="fw-bold mb-1">{userLevel.name} <span className="text-muted small">(Level {userLevel.level})</span></h3>
                                <div className="my-3">
                                    <div className="d-flex justify-content-between align-items-center text-muted small mb-1">
                                        <span>Progress</span>
                                        <span>{user.coins} / {userLevel.maxCoins === Infinity ? 'Max' : userLevel.maxCoins + 1}</span>
                                    </div>
                                    <div className="progress" style={{ height: '12px' }}><div className="progress-bar" role="progressbar" style={{ width: `${userLevel.progress}%`, backgroundColor: goldColor }}></div></div>
                                </div>
                                <div className="d-flex justify-content-around mt-4">
                                    <div><p className="mb-0 text-muted small">Current Coins</p><h5 className="fw-bold">{user.coins}</h5></div>
                                    <div><p className="mb-0 text-muted small">Total Earned</p><h5 className="fw-bold">{user.totalCoinsEarned || 0}</h5></div>
                                    <div><p className="mb-0 text-muted small">Total Spent</p><h5 className="fw-bold">{user.totalCoinsSpent || 0}</h5></div>
                                </div>
                            </div>
                        </div>

                      
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header"><h5 className="modal-title">Change Your Password</h5><button type="button" className="btn-close" onClick={() => setShowPasswordModal(false)}></button></div>
                            <form onSubmit={handleChangePassword}>
                                <div className="modal-body">
                                    <div className="mb-3"><label className="form-label">Current Password</label><input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordInputChange} className="form-control" required autoFocus/></div>
                                    <div className="mb-3"><label className="form-label">New Password</label><input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordInputChange} className="form-control" required minLength="8" /></div>
                                    <div className="mb-3"><label className="form-label">Confirm New Password</label><input type="password" name="confirmNewPassword" value={passwordData.confirmNewPassword} onChange={handlePasswordInputChange} className="form-control" required /></div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                                    <button type="submit" className="btn" style={{backgroundColor: goldColor, color: whiteColor}}>Update Password</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;