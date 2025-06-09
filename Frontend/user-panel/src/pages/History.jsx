// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'sonner';
// import tokenService from '../utils/tokenService';

// // --- Style & Configuration ---
// const goldColor = '#d4a762';
// const blackColor = '#212529';
// const whiteColor = '#fff';
// const rewardsApiUrl = import.meta.env.VITE_BACKEND_REWARDS_URL || "http://localhost:3002/api/rewards";

// // --- Helper Components & Functions ---
// const COIN_REWARDS_MAP = { rental: 20, mess: 15, medical: 10, plumber: 15, electrician: 15, laundry: 15 };

// const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
// };

// const StatusBadge = ({ status }) => {
//     const styles = {
//         pending: { backgroundColor: '#ffc107', color: blackColor },
//         verified: { backgroundColor: '#28a745', color: whiteColor },
//         rejected: { backgroundColor: '#dc3545', color: whiteColor },
//     };
//     const currentStyle = styles[status] || { backgroundColor: '#6c757d', color: whiteColor };
//     return (
//         <span className="badge" style={{ ...currentStyle, fontSize: '0.8rem', textTransform: 'capitalize', padding: '0.5em 0.8em' }}>
//             <i className={`fas ${status === 'pending' ? 'fa-hourglass-half' : status === 'verified' ? 'fa-check-circle' : 'fa-times-circle'} me-2`}></i>
//             {status}
//         </span>
//     );
// };

// const SubmissionCard = ({ submission, onViewDetails }) => {
//     const coinsAwarded = COIN_REWARDS_MAP[submission.serviceType] || 0;
//     const statusColors = { verified: '#28a745', rejected: '#dc3545', pending: '#ffc107' };

//     return (
//         <div 
//             className="card shadow-sm border-0 mb-3" 
//             onClick={() => onViewDetails(submission)}
//             style={{ borderLeft: `5px solid ${statusColors[submission.status]}`, cursor: 'pointer', transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out' }}
//             onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'; }}
//             onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
//         >
//             <div className="card-body p-3">
//                 <div className="d-flex justify-content-between align-items-center">
//                     <h5 className="mb-0" style={{ color: blackColor }}>{submission.titlePreview}</h5>
//                     <StatusBadge status={submission.status} />
//                 </div>
//                 <hr className="my-2" />
//                 <div className="row g-2 align-items-center">
//                     <div className="col-sm-5"><p className="mb-0 text-muted small"><i className="fas fa-tag me-2"></i>{submission.serviceType.charAt(0).toUpperCase() + submission.serviceType.slice(1)}</p></div>
//                     <div className="col-sm-4"><p className="mb-0 text-muted small"><i className="far fa-calendar-alt me-2"></i>{formatDate(submission.createdAt)}</p></div>
//                     <div className="col-sm-3 text-sm-end">
//                         {submission.status === 'verified' ? (
//                             <strong style={{ color: goldColor }}><i className="fas fa-coins me-1"></i>+{coinsAwarded}</strong>
//                         ) : (
//                             <p className="mb-0 text-muted small">View Details <i className="fas fa-arrow-right"></i></p>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const SubmissionDetailModal = ({ submission, onClose }) => {
//     if (!submission) return null;
//     const coinsAwarded = COIN_REWARDS_MAP[submission.serviceType] || 0;

//     return (
//         <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
//             <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
//                 <div className="modal-content border-0 shadow-lg">
//                     <div className="modal-header border-0 pb-0">
//                         <h4 className="modal-title" style={{color: blackColor}}>{submission.titlePreview}</h4>
//                         <button type="button" className="btn-close" onClick={onClose}></button>
//                     </div>
//                     <div className="modal-body p-4">
//                         <div className="row mb-3">
//                             <div className="col-md-4"><p className="text-muted small mb-1">Status</p><StatusBadge status={submission.status} /></div>
//                             <div className="col-md-4"><p className="text-muted small mb-1">Submitted</p><h6>{formatDate(submission.createdAt)}</h6></div>
//                             <div className="col-md-4"><p className="text-muted small mb-1">Reward</p><h6>{submission.status === 'verified' ? <span style={{color: goldColor}}>+{coinsAwarded} Coins</span> : 'N/A'}</h6></div>
//                         </div>

//                         {(submission.adminNotes || submission.rejectionReason) && (
//                             <div className="p-3 rounded mb-3" style={{ backgroundColor: '#f8f9fa', borderLeft: `4px solid ${goldColor}` }}>
//                                 <h6 className="mb-1"><i className="fas fa-user-shield me-2"></i>Admin's Message:</h6>
//                                 <p className="mb-0 text-muted fst-italic">"{submission.adminNotes || submission.rejectionReason}"</p>
//                             </div>
//                         )}
                        
//                         <h6 className="mt-4">Submitted Images</h6>
//                         <div className="d-flex flex-wrap gap-2">
//                             {submission.imageUrls && submission.imageUrls.length > 0 ? (
//                                 submission.imageUrls.map((img, index) => (
//                                     <a key={index} href={img.url} target="_blank" rel="noopener noreferrer">
//                                         <img src={img.url} alt={`Submission ${index + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}/>
//                                     </a>
//                                 ))
//                             ) : (<p className="text-muted">No images were submitted.</p>)}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// const Loader = () => (
//     <div className="text-center py-5">
//         <div className="spinner-border" style={{ width: "3.5rem", height: "3.5rem", color: goldColor }} role="status">
//             <span className="visually-hidden">Loading...</span>
//         </div>
//         <p className="mt-3 text-muted">Fetching your history...</p>
//     </div>
// );

// const EmptyState = ({ onActionClick, filterStatus }) => (
//     <div className="text-center py-5 card shadow-sm border-0" style={{background: `linear-gradient(135deg, ${whiteColor} 0%, #fef8f0 100%)`}}>
//         <div className="card-body">
//             <i className="fas fa-file-alt fa-4x mb-4" style={{color: '#e0e0e0'}}></i>
//             <h4 className="mb-3">No Submissions Here</h4>
//             <p className="text-muted">You have no '{filterStatus}' submissions to show right now.</p>
//             <button onClick={onActionClick} className="btn mt-2" style={{backgroundColor: goldColor, color: whiteColor, padding: '10px 25px'}}>
//                 <i className="fas fa-plus-circle me-2"></i>Contribute to Earn Coins
//             </button>
//         </div>
//     </div>
// );


// // --- Main History Page Component ---
// const History = () => {
//     const [submissions, setSubmissions] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [pagination, setPagination] = useState({});
//     const [currentPage, setCurrentPage] = useState(1);
//     const [filterStatus, setFilterStatus] = useState('all');
//     const [selectedSubmission, setSelectedSubmission] = useState(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchSubmissions = async () => {
//             if (!tokenService.getToken()) {
//                 toast.error("Authentication required. Please log in.");
//                 navigate('/login');
//                 return;
//             }
//             setLoading(true);
//             setError(null);
//             const fetchToast = toast.loading(`Fetching ${filterStatus} submissions...`);

//             try {
//                 // ***** THE FIX IS HERE *****
//                 // Conditionally build the params object.
//                 const params = {
//                     page: currentPage,
//                     limit: 10,
//                 };
//                 // Only add the status parameter if the filter is NOT 'all'.
//                 if (filterStatus !== 'all') {
//                     params.status = filterStatus;
//                 }

//                 const response = await axios.get(`${rewardsApiUrl}/submissions/me`, {
//                     headers: { Authorization: `Bearer ${tokenService.getToken()}` },
//                     params // Use the correctly built params object
//                 });

//                 setSubmissions(response.data.data);
//                 setPagination(response.data.pagination);
//                 toast.success("Submissions loaded!", { id: fetchToast });
//             } catch (err) {
//                 const errorMessage = err.response?.data?.message || "Failed to fetch submission history.";
//                 setError(errorMessage);
//                 toast.error(errorMessage, { id: fetchToast });
//                 if (err.response?.status === 401) {
//                     tokenService.clearTokens(); navigate('/login');
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchSubmissions();
//     }, [currentPage, filterStatus, navigate]);

//     const handleFilterChange = (status) => {
//         toast.info(`Filtering by: ${status}`);
//         setFilterStatus(status);
//         setCurrentPage(1);
//     };

//     const handlePageChange = (newPage) => {
//         if (newPage > 0 && newPage <= pagination.totalPages) {
//             setCurrentPage(newPage);
//         }
//     };
    
//     return (
//         <div className="container-fluid py-5" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
//             {selectedSubmission && <SubmissionDetailModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />}
//             <div className="container">
//                 <div className="text-center mb-5">
//                     <h1 className="display-4 fw-bold color-primary" >My Submissions</h1>
//                     <p className="fs-8">Track the status of your contributions and see the rewards you've earned.</p>
//                 </div>
                
//                 <div className="card shadow-sm border-0">
//                     <div className="card-header bg-white p-3">
//                          <div className="nav nav-pills justify-content-center">
//                             {['all', 'pending', 'verified', 'rejected'].map(status => (
//                                 <div className="nav-item" key={status}>
//                                     <button
//                                         onClick={() => handleFilterChange(status)}
//                                         className={`nav-link mx-1 ${filterStatus === status ? 'active' : ''}`}
//                                         style={filterStatus === status ? { backgroundColor: goldColor, color: whiteColor } : { color: blackColor }}
//                                     >
//                                         {status.charAt(0).toUpperCase() + status.slice(1)}
//                                     </button>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                     <div className="card-body p-3 p-md-4">
//                         {loading && <Loader />}
//                         {error && <div className="alert alert-danger text-center">{error}</div>}
//                         {!loading && !error && submissions.length === 0 && (
//                             <EmptyState onActionClick={() => navigate('/add-data')} filterStatus={filterStatus}/>
//                         )}
//                         {!loading && submissions.length > 0 && (
//                             <>
//                                 {submissions.map(sub => <SubmissionCard key={sub._id} submission={sub} onViewDetails={setSelectedSubmission}/>)}
//                                 {pagination.totalPages > 1 && (
//                                     <div className="d-flex justify-content-between align-items-center mt-4">
//                                         <button className="btn btn-outline-dark" onClick={() => handlePageChange(currentPage - 1)} disabled={!pagination.hasPrevPage}>
//                                             <i className="fas fa-arrow-left me-2"></i>Previous
//                                         </button>
//                                         <span className="text-muted">Page {pagination.page} of {pagination.totalPages}</span>
//                                         <button className="btn btn-outline-dark" onClick={() => handlePageChange(currentPage + 1)} disabled={!pagination.hasNextPage}>
//                                             Next<i className="fas fa-arrow-right ms-2"></i>
//                                         </button>
//                                     </div>
//                                 )}
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default History;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import tokenService from '../utils/tokenService';
import { getMySubmissions, getMyRedemptions, getMySpinHistory } from '../services/api';

// --- Style & Configuration ---
const goldColor = '#d4a762';
const blackColor = '#212529';
const whiteColor = '#fff';

// --- Helper Functions & Components ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ActivityIcon = ({ type, status }) => {
    const iconMap = {
        submission: {
            verified: { icon: 'fa-check-circle', color: '#28a745' },
            rejected: { icon: 'fa-times-circle', color: '#dc3545' },
            pending: { icon: 'fa-hourglass-half', color: '#ffc107' },
        },
        redemption: { icon: 'fa-gift', color: '#0d6efd' },
        spin_win: { icon: 'fa-star', color: goldColor },
    };
    const { icon, color } = iconMap[type]?.[status] || iconMap[type] || { icon: 'fa-history', color: '#6c757d' };
    return <i className={`fas ${icon} fa-2x me-3`} style={{ color }}></i>;
};

const ActivityCard = ({ activity, onSubmissionClick }) => {
    let title, description, value;
    const isSubmission = activity.activityType === 'submission';

    switch (activity.activityType) {
        case 'submission':
            title = `Submission: ${activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}`;
            description = `"${activity.titlePreview}" - ${activity.serviceType}`;
            value = activity.status === 'verified' ? `+${activity.coinsAwarded || 0} 🪙` : null;
            break;
        case 'redemption':
            title = 'Reward Claimed';
            description = `Redeemed "${activity.rewardName}"`;
            value = `-${activity.coinsDeducted} 🪙`;
            break;
        case 'spin_win':
            title = 'Spin Wheel Prize!';
            description = `You won "${activity.prizeValue}"`;
            value = activity.prizeValue.includes('Cash') || activity.prizeValue.includes('Cashback') ? `+${parseInt(activity.prizeValue.match(/\d+/)[0])} 🪙` : '🎁';
            break;
        default:
            title = 'Unknown Activity';
            description = 'An unknown activity occurred.';
    }
    
    // Define dynamic styles for clickable submissions
    const cardStyle = {
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: isSubmission ? 'pointer' : 'default',
        borderLeft: isSubmission ? `4px solid ${ {verified: '#28a745', rejected: '#dc3545', pending: '#ffc107'}[activity.status] || '#6c757d'}` : 'none'
    };

    return (
        <div
            className="card shadow-sm border-0 mb-3"
            style={cardStyle}
            onClick={() => isSubmission && onSubmissionClick(activity)}
            onMouseOver={e => isSubmission && (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseOut={e => isSubmission && (e.currentTarget.style.transform = 'scale(1)')}
        >
            <div className="card-body p-3">
                <div className="d-flex align-items-center">
                    <ActivityIcon type={activity.activityType} status={activity.status} />
                    <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                            <h6 className="mb-0" style={{ color: blackColor }}>{title}</h6>
                            {value && <strong style={{ color: value.startsWith('+') ? '#28a745' : '#dc3545' }}>{value}</strong>}
                        </div>
                        <p className="mb-1 text-muted small">{description}</p>
                        <small className="text-muted">{formatDate(activity.date)}</small>
                    </div>
                    {isSubmission && <i className="fas fa-chevron-right text-muted ms-2"></i>}
                </div>
            </div>
        </div>
    );
};

// ** NEW: The detailed modal, integrated from your old code **
const SubmissionDetailModal = ({ submission, onClose }) => {
    if (!submission) return null;
    const COIN_REWARDS_MAP = { rental: 20, mess: 15, medical: 10, plumber: 15, electrician: 15, laundry: 15 };
    const coinsAwarded = COIN_REWARDS_MAP[submission.serviceType] || 0;

    const statusBadgeStyles = {
        pending: { backgroundColor: '#ffc107', color: blackColor },
        verified: { backgroundColor: '#28a745', color: whiteColor },
        rejected: { backgroundColor: '#dc3545', color: whiteColor },
    };
    const currentStyle = statusBadgeStyles[submission.status] || { backgroundColor: '#6c757d', color: whiteColor };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-0 pb-0">
                        <h4 className="modal-title" style={{color: blackColor}}>{submission.titlePreview}</h4>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="row mb-3">
                            <div className="col-md-4"><p className="text-muted small mb-1">Status</p>
                                <span className="badge" style={{ ...currentStyle, fontSize: '0.8rem', padding: '0.5em 0.8em' }}>
                                    {submission.status}
                                </span>
                            </div>
                            <div className="col-md-4"><p className="text-muted small mb-1">Submitted</p><h6>{formatDate(submission.createdAt)}</h6></div>
                            <div className="col-md-4"><p className="text-muted small mb-1">Reward</p><h6>{submission.status === 'verified' ? <span style={{color: goldColor}}>+{coinsAwarded} Coins</span> : 'N/A'}</h6></div>
                        </div>

                        {/* ** THIS IS THE KEY PART FOR THE ADMIN MESSAGE ** */}
                        {(submission.adminNotes || submission.rejectionReason) && (
                            <div className="p-3 rounded mb-3" style={{ backgroundColor: '#f8f9fa', borderLeft: `4px solid ${goldColor}` }}>
                                <h6 className="mb-1"><i className="fas fa-user-shield me-2"></i>Admin's Message:</h6>
                                <p className="mb-0 text-muted fst-italic">"{submission.adminNotes || submission.rejectionReason}"</p>
                            </div>
                        )}
                        
                        <h6 className="mt-4">Submitted Images</h6>
                        <div className="d-flex flex-wrap gap-2">
                            {submission.imageUrls && submission.imageUrls.length > 0 ? (
                                submission.imageUrls.map((img, index) => (
                                    <a key={index} href={img.url} target="_blank" rel="noopener noreferrer">
                                        <img src={img.url} alt={`Submission ${index + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}/>
                                    </a>
                                ))
                            ) : (<p className="text-muted">No images were submitted.</p>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Loader = () => (
    <div className="text-center py-5">
        <div className="spinner-border" style={{ width: "3.5rem", height: "3.5rem", color: goldColor }} role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Fetching your activity...</p>
    </div>
);

const EmptyState = ({ onActionClick, filter }) => (
    <div className="text-center py-5 card shadow-sm border-0" style={{background: `linear-gradient(135deg, ${whiteColor} 0%, #fef8f0 100%)`}}>
        <div className="card-body">
            <i className="fas fa-file-alt fa-4x mb-4" style={{color: '#e0e0e0'}}></i>
            <h4 className="mb-3">No Activity Found</h4>
            <p className="text-muted">You have no '{filter}' history to show right now.</p>
            <button onClick={onActionClick} className="btn mt-2" style={{backgroundColor: goldColor, color: whiteColor, padding: '10px 25px'}}>
                <i className="fas fa-plus-circle me-2"></i>Contribute to Earn Rewards
            </button>
        </div>
    </div>
);

// --- Main History Page Component ---
const History = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [selectedSubmission, setSelectedSubmission] = useState(null); // ** NEW: State for modal
    const navigate = useNavigate();

    const COIN_REWARDS_MAP = { rental: 20, mess: 15, medical: 10, plumber: 15, electrician: 15, laundry: 15 };

    const fetchAllActivities = useCallback(async () => {
        if (!tokenService.getToken()) {
            toast.error("Authentication required.");
            navigate('/login');
            return;
        }
        setLoading(true);
        setError(null);
        const fetchToast = toast.loading(`Fetching your activity history...`);

        try {
            const [submissionsRes, redemptionsRes, spinsRes] = await Promise.all([
                getMySubmissions({ limit: 50, status: 'all' }), // Explicitly fetch all statuses
                getMyRedemptions(),
                getMySpinHistory(),
            ]);
            
            // The API response for submissions is nested under `data.data`
            const submissionActivities = (submissionsRes.data.data || []).map(sub => ({
                ...sub,
                activityType: 'submission',
                date: sub.updatedAt || sub.createdAt,
                coinsAwarded: COIN_REWARDS_MAP[sub.serviceType] || 0
            }));

            const redemptionActivities = (redemptionsRes.data.redeemedRewards || []).map(red => ({
                ...red,
                activityType: 'redemption',
                date: red.redeemedAt
            }));

            const spinActivities = (spinsRes.data.spinHistory || []).map(spin => ({
                ...spin,
                activityType: 'spin_win',
                date: spin.spunAt
            }));

            const allActivities = [...submissionActivities, ...redemptionActivities, ...spinActivities]
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            setActivities(allActivities);
            toast.success("Activity history loaded!", { id: fetchToast });

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to fetch your history.";
            setError(errorMessage);
            toast.error(errorMessage, { id: fetchToast });
            if (err.response?.status === 401) {
                tokenService.clearTokens();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchAllActivities();
    }, [fetchAllActivities]);

    const filteredActivities = useMemo(() => {
        if (filter === 'all') return activities;
        if (filter === 'submissions') return activities.filter(a => a.activityType === 'submission');
        if (filter === 'rewards') return activities.filter(a => a.activityType === 'redemption' || a.activityType === 'spin_win');
        return activities;
    }, [activities, filter]);
    
    return (
        <div className="container-fluid py-5" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
            {/* ** NEW: Render the modal when a submission is selected ** */}
            {selectedSubmission && <SubmissionDetailModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />}
            
            <div className="container">
                <div className="text-center mb-5">
                    <h1 className="display-4 fw-bold" style={{ color: blackColor }}>My Activity</h1>
                    <p className="fs-5 text-muted">Track your contributions, rewards, and wins all in one place.</p>
                </div>
                
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white p-3">
                         <div className="nav nav-pills justify-content-center">
                            {['all', 'submissions', 'rewards'].map(status => (
                                <div className="nav-item" key={status}>
                                    <button
                                        onClick={() => setFilter(status)}
                                        className={`nav-link mx-1 ${filter === status ? 'active' : ''}`}
                                        style={filter === status ? { backgroundColor: goldColor, color: whiteColor } : { color: blackColor }}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card-body p-3 p-md-4">
                        {loading && <Loader />}
                        {error && <div className="alert alert-danger text-center">{error}</div>}
                        {!loading && !error && filteredActivities.length === 0 && (
                            <EmptyState onActionClick={() => navigate('/add-data')} filter={filter} />
                        )}
                        {!loading && filteredActivities.length > 0 && (
                            <>
                                {filteredActivities.map(activity => (
                                    <ActivityCard 
                                        key={`${activity.activityType}-${activity._id}`} 
                                        activity={activity} 
                                        onSubmissionClick={setSelectedSubmission} // ** NEW: Pass handler to card
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;