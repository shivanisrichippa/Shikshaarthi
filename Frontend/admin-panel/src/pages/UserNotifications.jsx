import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import assets from '../assets/assets.js'; // For default avatar or icons

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// Helper for relative time
const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const weeks = Math.round(days / 7);
    const months = Math.round(days / 30.4375); // Average days in month
    const years = Math.round(days / 365.25); // Account for leap years

    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    if (weeks < 5) return `${weeks} weeks ago`;
    if (months < 12) return `${months} months ago`;
    return `${years} years ago`;
};

// --- Helper function to generate mock data ---
const generateMockData = (currentUserId) => {
    const firstNames = ["Aarav", "Priya", "Rohan", "Sneha", "Vikram", "Deepika", "Arjun", "Mira"];
    const lastNames = ["Sharma", "Singh", "Patel", "Kumar", "Reddy", "Verma", "Gupta", "Joshi"];
    const notificationTypes = ["SECURITY_ALERT", "ACCOUNT_CHANGE", "COIN_TRANSACTION", "SUSPICIOUS_ACTIVITY", "SYSTEM_MESSAGE", "USER_REPORT", "NEW_FEATURE"];
    const severities = ["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
    
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const getRandomBool = () => Math.random() < 0.5;

    // Generate mock user
    let mockUser;
    if (currentUserId === "user123" || currentUserId === "all") { // 'all' for a generic case if needed
        mockUser = {
            _id: "user123",
            fullName: 'Aarav Sharma',
            email: 'aarav.sharma@example.com',
            avatarUrl: assets.avatar1, // This property will exist but won't be used for display
        };
    } else if (currentUserId === "user456") {
         mockUser = {
            _id: "user456",
            fullName: 'Priya Singh',
            email: 'priya.singh@example.com',
            avatarUrl: assets.avatar2 || assets.avatar1, 
        };
    } else {
        const randomFirstName = getRandomElement(firstNames);
        const randomLastName = getRandomElement(lastNames);
        mockUser = {
            _id: currentUserId,
            fullName: `${randomFirstName} ${randomLastName}`,
            email: `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}@example.com`,
            avatarUrl: assets[`avatar${getRandomInt(1,3)}`] || assets.avatar1,
        };
    }

    // Generate mock notifications for this user
    const mockNotifications = [];
    const numNotifications = getRandomInt(5, 15); 

    for (let i = 0; i < numNotifications; i++) {
        const type = getRandomElement(notificationTypes);
        const severity = getRandomElement(severities);
        const timestamp = new Date(Date.now() - getRandomInt(0, 30) * 24 * 60 * 60 * 1000 - getRandomInt(0, 23) * 60 * 60 * 1000).toISOString(); 
        let title = "";
        let message = "";
        let relatedLink = null;

        switch (type) {
            case "SECURITY_ALERT":
                title = getRandomBool() ? "Unusual Login Detected" : "Password Change Attempt";
                message = `A security event (${title.toLowerCase()}) was detected on the account from IP ${getRandomInt(1,255)}.${getRandomInt(0,255)}.${getRandomInt(0,255)}.${getRandomInt(0,255)}.`;
                if (getRandomBool()) relatedLink = `/admin/users/${currentUserId}/security-logs`;
                break;
            case "ACCOUNT_CHANGE":
                title = getRandomBool() ? "Profile Information Updated" : "Contact Details Changed";
                message = `User ${mockUser.fullName} updated their ${getRandomBool() ? "profile picture" : "phone number"}.`;
                break;
            case "COIN_TRANSACTION":
                const amount = getRandomInt(10, 5000);
                const action = getRandomBool() ? "earned" : "spent";
                title = `Coin Transaction: ${action === "earned" ? "Credit" : "Debit"}`;
                message = `User ${action} ${amount} coins. Reason: ${getRandomBool() ? "Data Submission" : "Reward Redemption"}. Current Balance: ${getRandomInt(0, 10000)} coins.`;
                break;
            case "SUSPICIOUS_ACTIVITY":
                title = "Suspicious Activity Flagged";
                message = `System flagged potentially suspicious activity related to ${getRandomBool() ? "API usage" : "login patterns"}. Please review.`;
                if (getRandomBool()) relatedLink = `/admin/users/${currentUserId}/activity-log`;
                break;
            case "SYSTEM_MESSAGE":
                title = getRandomBool() ? "Platform Maintenance Scheduled" : "Terms of Service Update";
                message = `Important: ${title}. More details available in the announcements section.`;
                break;
            case "USER_REPORT":
                title = "User Report Received";
                message = `A report was submitted by another user concerning ${mockUser.fullName}'s activity. Report ID: REP-${getRandomInt(1000,9999)}.`;
                relatedLink = `/admin/reports/REP-${getRandomInt(1000,9999)}`;
                break;
            case "NEW_FEATURE":
                title = "New Feature Rollout Feedback";
                message = `User ${mockUser.fullName} provided feedback on the new 'Analytics Dashboard' feature.`;
                break;
            default:
                title = "Generic Notification";
                message = "This is a generic notification message for the user.";
        }

        mockNotifications.push({
            _id: `notif_${currentUserId}_${i + 1}_${Date.now()}`,
            userId: currentUserId,
            timestamp,
            type,
            title,
            message,
            severity,
            isAcknowledgedByAdmin: getRandomBool(),
            relatedLink
        });
    }
    return { mockUser, mockNotifications };
};


const UserNotifications = () => {
  const { userId } = useParams(); 
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL'); 
  const [typeFilter, setTypeFilter] = useState('ALL'); 

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      console.log(`Fetching data for user ID: ${userId}`);
      try {
        await new Promise(resolve => setTimeout(resolve, 700)); 

        const { mockUser, mockNotifications } = generateMockData(userId);
        
        setUser(mockUser);
        setNotifications(mockNotifications);

      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]); 

  const handleAcknowledge = async (notificationId) => {
    console.log(`Acknowledging notification ${notificationId} for user ${userId}`);
    setNotifications(prev => 
      prev.map(n => n._id === notificationId ? { ...n, isAcknowledgedByAdmin: true } : n)
    );
  };
  
  const handleUnacknowledge = async (notificationId) => {
    console.log(`Unacknowledging notification ${notificationId} for user ${userId}`);
    setNotifications(prev => 
      prev.map(n => n._id === notificationId ? { ...n, isAcknowledgedByAdmin: false } : n)
    );
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'danger fw-bold';
      case 'HIGH': return 'danger';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'secondary'; 
    }
  };
  
  const getNotificationIcon = (type) => {
     switch (type?.toUpperCase()) {
      case 'SECURITY_ALERT': return 'bx bx-shield-quarter';
      case 'ACCOUNT_CHANGE': return 'bx bx-user-circle';
      case 'COIN_TRANSACTION': return 'bx bx-coin-stack';
      case 'SUSPICIOUS_ACTIVITY': return 'bx bx-error-alt';
      case 'SYSTEM_MESSAGE': return 'bx bx-info-circle';
      case 'USER_REPORT': return 'bx bx-flag';
      case 'NEW_FEATURE': return 'bx bx-bulb';
      default: return 'bx bx-bell';
    }
  }

  const filteredNotifications = notifications.filter(n => {
    const statusMatch = filter === 'ALL' || 
                        (filter === 'ACKNOWLEDGED' && n.isAcknowledgedByAdmin) ||
                        (filter === 'UNACKNOWLEDGED' && !n.isAcknowledgedByAdmin);
    const typeMatch = typeFilter === 'ALL' || n.type === typeFilter;
    return statusMatch && typeMatch;
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); 


  if (isLoading) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y d-flex justify-content-center align-items-center" style={{minHeight: '300px'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container-xxl flex-grow-1 container-p-y alert alert-danger">{error}</div>;
  }

  if (!user) {
     return <div className="container-xxl flex-grow-1 container-p-y alert alert-warning">User data could not be loaded.</div>;
  }

  const notificationTypesForFilter = ['ALL', ...new Set(notifications.map(n => n.type))];


  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <h4 className="fw-bold py-3 mb-2">
        <span className="text-muted fw-light">Admin / Users / {user.fullName} /</span> Notifications
      </h4>
      
      <div className="card mb-4">
        <div className="card-body d-flex align-items-center flex-wrap">
            {/* User avatar image removed here */}
            <div className="me-auto mb-2 mb-md-0">
                <h5 className="mb-0">{user.fullName}</h5>
                <small className="text-muted">{user.email}</small>
            </div>
            <Link to={`/admin/users/${userId}/manage`} className="btn btn-sm btn-outline-primary">Manage User</Link>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <ul className="nav nav-pills flex-column flex-md-row mb-3">
            <li className="nav-item">
              <Link className="nav-link" to={`/admin/users/${userId}/manage`}>
                <i className="bx bx-user me-1"></i> Account
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to={`/admin/users/${userId}/notifications`}>
                <i className="bx bx-bell me-1"></i> User Notifications
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`/maintenance`}>
              <i className="bx bx-link-alt me-1"></i> Connections
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to={`maintenance`}>
              <i className="bx bx-key me-1"></i> Change Password
              </Link>
            </li>
          </ul>

          <div className="card">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
              <h5 className="mb-0">Notifications for {user.fullName}</h5>
              <div className="d-flex gap-2">
                <select className="form-select form-select-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{minWidth: '150px'}}>
                  {notificationTypesForFilter.map(type => (
                    <option key={type} value={type}>{type === 'ALL' ? 'All Types' : type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
                <select className="form-select form-select-sm" value={filter} onChange={e => setFilter(e.target.value)} style={{minWidth: '180px'}}>
                  <option value="ALL">All Statuses</option>
                  <option value="UNACKNOWLEDGED">Unacknowledged</option>
                  <option value="ACKNOWLEDGED">Acknowledged</option>
                </select>
              </div>
            </div>

            <div className="card-body p-0">
              {filteredNotifications.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {filteredNotifications.map(notif => (
                    <li key={notif._id} className={`list-group-item d-flex justify-content-between align-items-start flex-wrap ${!notif.isAcknowledgedByAdmin ? 'list-group-item-light fw-semibold' : ''}`}>
                      <div className="d-flex mb-2 mb-md-0">
                        <div className="me-3 pt-1">
                          <i className={`${getNotificationIcon(notif.type)} fs-3 text-${getSeverityBadge(notif.severity)}`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex w-100 justify-content-between">
                            <h6 className={`mb-1 ${!notif.isAcknowledgedByAdmin ? 'text-primary' : ''}`}>{notif.title}</h6>
                            <small className="text-muted ms-2 text-nowrap">{timeAgo(notif.timestamp)}</small>
                          </div>
                          <p className="mb-1 small text-muted">{notif.message}</p>
                          <small>
                            <span className={`badge bg-label-${getSeverityBadge(notif.severity)} me-2`}>{notif.severity}</span>
                            <span className="text-muted">Type: {notif.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            {notif.relatedLink && <Link to={notif.relatedLink} className="ms-2 small">Details <i className="bx bx-link-external bx-xs"></i></Link>}
                          </small>
                        </div>
                      </div>
                      <div className="ms-md-3 text-nowrap pt-1 align-self-center">
                        {notif.isAcknowledgedByAdmin ? (
                          <button className="btn btn-sm btn-icon btn-outline-secondary rounded-pill" title="Mark as Unacknowledged" onClick={() => handleUnacknowledge(notif._id)}>
                            <i className="bx bx-check-double"></i>
                          </button>
                        ) : (
                          <button className="btn btn-sm btn-icon btn-primary rounded-pill" title="Acknowledge" onClick={() => handleAcknowledge(notif._id)}>
                            <i className="bx bx-check"></i>
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center p-5">
                  <i className="bx bx-bell-off bx-lg text-muted mb-3"></i>
                  <h5 className="mb-1">No Notifications</h5>
                  <p className="mb-0 text-muted">There are no notifications for this user matching the current filters.</p>
                </div>
              )}
            </div>
            {notifications.length > 0 && (
                <div className="card-footer text-muted small d-flex justify-content-between">
                    <span>Displaying {filteredNotifications.length} of {notifications.length} total notifications for this user.</span>
                    {/* Placeholder for pagination controls */}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotifications;