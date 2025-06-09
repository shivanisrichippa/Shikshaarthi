

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { submissionAPI } from '../services/adminApi';

// Helper for relative time (e.g., "5 minutes ago")
const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds} sec ago`;
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    return `${days} days ago`;
};

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // --- UPDATED: Default filter is now 'ALL' for a complete overview ---
    const [filter, setFilter] = useState('ALL'); 
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            // Using submissionAPI, but it fetches all notifications from the endpoint
            const response = await submissionAPI.getAdminNotifications();
            if (response.success) {
                const sortedNotifications = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setNotifications(sortedNotifications);
            } else {
                toast.error("Failed to load notifications.");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (e, notificationId) => {
        e.preventDefault();
        e.stopPropagation();
        
        const originalNotifications = [...notifications];
        setNotifications(currentNotifications => 
            currentNotifications.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );

        try {
            await submissionAPI.markNotificationAsRead(notificationId);
            toast.success("Notification marked as read.");
        } catch (error) {
            toast.error("Failed to update notification. Reverting.");
            setNotifications(originalNotifications);
        }
    };
    
    const handleNotificationClick = (link, notificationId) => {
        const notif = notifications.find(n => n._id === notificationId);
        if (notif && !notif.isRead) {
            // Mark as read in the background without waiting
            submissionAPI.markNotificationAsRead(notificationId).catch(err => console.error("Failed to mark as read on click:", err));
        }
        
        // Special navigation for submissions to go to the correct tab
        if (notif && notif.type === 'new_submission') {
            navigate('/admin/submissions/pending');
        } else if (link) { // Navigate to the link for all other types if it exists
            navigate(link);
        }
    }

    // --- UPDATED: Added icon for 'spin_wheel_win' ---
    const getIconForType = (type) => {
        switch (type) {
            case 'reward_redemption_request': return 'bx bx-gift text-success';
            case 'new_submission': return 'bx bxs-file-plus text-warning';
            case 'spin_wheel_win': return 'bx bx-trophy text-info';
            default: return 'bx bx-bell text-secondary';
        }
    };

    // Filtering logic based on notification type
    const filteredNotifications = notifications.filter(n => {
        if (filter === 'ALL') {
            return true; // Show all notifications
        }
        return n.type === filter;
    });

    // --- UPDATED: Added friendly name for 'spin_wheel_win' ---
    const getFriendlyFilterName = () => {
        switch (filter) {
            case 'new_submission':
                return 'pending submission';
            case 'reward_redemption_request':
                return 'coin redemption';
            case 'spin_wheel_win':
                return 'spin wheel prize';
            case 'ALL':
                return 'new';
            default:
                return 'new';
        }
    };

    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <div className="d-flex justify-content-between align-items-center py-3 mb-4 flex-wrap gap-2">
                <h4 className="fw-bold mb-0">Admin Notifications</h4>
                {/* --- UPDATED: Added a new filter button for Spin Wins --- */}
                <div className="btn-group" role="group" aria-label="Notification Filters">
                    <input type="radio" className="btn-check" name="notif-filter" id="filterAll" autoComplete="off" checked={filter === 'ALL'} onChange={() => setFilter('ALL')} />
                    <label className="btn btn-sm btn-outline-primary" htmlFor="filterAll">All</label>
                    
                    <input type="radio" className="btn-check" name="notif-filter" id="filterSubmissions" autoComplete="off" checked={filter === 'new_submission'} onChange={() => setFilter('new_submission')} />
                    <label className="btn btn-sm btn-outline-primary" htmlFor="filterSubmissions">
                        <i className="bx bxs-file-plus me-1"></i> Submissions
                    </label>

                    <input type="radio" className="btn-check" name="notif-filter" id="filterRedemptions" autoComplete="off" checked={filter === 'reward_redemption_request'} onChange={() => setFilter('reward_redemption_request')} />
                    <label className="btn btn-sm btn-outline-primary" htmlFor="filterRedemptions">
                        <i className="bx bx-gift me-1"></i> Redemptions
                    </label>

                    <input type="radio" className="btn-check" name="notif-filter" id="filterSpins" autoComplete="off" checked={filter === 'spin_wheel_win'} onChange={() => setFilter('spin_wheel_win')} />
                    <label className="btn btn-sm btn-outline-primary" htmlFor="filterSpins">
                        <i className="bx bx-trophy me-1"></i> Spin Wins
                    </label>
                </div>
            </div>

            <div className="card">
                <div className="list-group list-group-flush">
                    {isLoading ? (
                        <div className="list-group-item text-center p-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map(notif => (
                            <div 
                                key={notif._id} 
                                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start flex-wrap ${!notif.isRead ? 'list-group-item-light fw-semibold' : ''}`}
                                onClick={() => handleNotificationClick(notif.link, notif._id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-center">
                                    <div className="me-3">
                                        <i className={`bx-md ${getIconForType(notif.type)}`}></i>
                                    </div>
                                    <div className="w-100">
                                        <p className="mb-1">{notif.message}</p>
                                        <small className="text-muted">{timeAgo(notif.createdAt)}</small>
                                    </div>
                                </div>
                                <div className="ms-md-3 mt-2 mt-md-0 text-nowrap">
                                    {!notif.isRead && (
                                        <button 
                                            className="btn btn-xs btn-outline-secondary"
                                            onClick={(e) => handleMarkAsRead(e, notif._id)}
                                            title="Mark as read"
                                        >
                                            <i className="bx bx-check me-1"></i>Mark as Read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="list-group-item text-center p-5">
                            <i className="bx bx-check-double bx-lg text-success mb-3"></i>
                            <h5 className="mb-1">All Caught Up!</h5>
                            {/* --- UPDATED: Empty state message is now dynamic based on the filter --- */}
                            <p className="mb-0 text-muted">There are no {getFriendlyFilterName()} notifications.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;