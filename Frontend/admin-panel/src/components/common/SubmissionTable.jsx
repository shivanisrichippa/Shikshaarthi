import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { submissionAPI } from '../../services/submissionApi';

// --- Helper Functions ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const getServiceTypeBadge = (serviceType = '') => {
    const colors = { mess: 'info', rental: 'success', plumber: 'primary', electrician: 'warning', laundry: 'secondary', medical: 'danger' };
    return colors[serviceType.toLowerCase()] || 'dark';
};
const getStatusBadge = (status = '') => {
    const colors = { pending: 'warning', verified: 'success', rejected: 'danger' };
    return colors[status.toLowerCase()] || 'secondary';
};

// --- Submission Detail Modal Component ---
const SubmissionDetailModal = ({ submissionId, show, onClose, onActionComplete }) => {
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [adminNotes, setAdminNotes] = useState('');
    const [actionInProgress, setActionInProgress] = useState(null);

    useEffect(() => {
        if (show && submissionId) {
            console.log('Loading submission details for:', submissionId);
            setIsLoading(true);
            submissionAPI.getSubmissionDetails(submissionId)
                .then(response => {
                    console.log('Submission details response:', response);
                    if (response.success) {
                        setDetails(response.data);
                        setFormData(response.data.serviceSpecificData || {});
                        setAdminNotes(response.data.rejectionReason || response.data.adminNotes || '');
                    } else {
                        toast.error(response.message || 'Failed to load submission details');
                        setDetails(null);
                    }
                })
                .catch(error => {
                    console.error('Error fetching submission details:', error);
                    toast.error(`Fetch Error: ${error.message}`);
                    setDetails(null);
                })
                .finally(() => setIsLoading(false));
        }
    }, [show, submissionId]);
    
    const handleAction = async (actionType) => {
        if (isEditing && actionType !== 'save') {
            toast.warning("Please save or cancel your edits first.");
            return;
        }

        // Validation for rejection
        if (actionType === 'reject' && !adminNotes.trim()) {
            toast.error("A reason for rejection is mandatory.");
            return;
        }

        let confirmationMessage = '';
        switch(actionType) {
            case 'approve':
                confirmationMessage = "Are you sure you want to approve this submission?";
                break;
            case 'reject':
                confirmationMessage = `Reject with reason: "${adminNotes}"?`;
                break;
            case 'save':
                break; // No confirmation needed
            default: return;
        }

        if (confirmationMessage && !window.confirm(confirmationMessage)) return;

        setActionInProgress(actionType);
        const toastId = toast.loading(`${actionType.charAt(0).toUpperCase() + actionType.slice(1)}ing submission...`);

        try {
            let response;
            console.log(`Executing ${actionType} action for submission:`, submissionId);
            
            if (actionType === 'save') {
                response = await submissionAPI.updateSubmissionData(submissionId, formData);
                console.log('Update response:', response);
            } else if (actionType === 'approve') {
                response = await submissionAPI.approveSubmission(submissionId, adminNotes);
                console.log('Approve response:', response);
            } else if (actionType === 'reject') {
                // Make sure we're sending the reason as expected by backend
                response = await submissionAPI.rejectSubmission(submissionId, adminNotes);
                console.log('Reject response:', response);
            }

            if (response && response.success) {
                toast.success(response.message || "Action completed successfully.", { id: toastId });
                if (actionType === 'save') {
                    setDetails(prev => ({ ...prev, serviceSpecificData: response.data }));
                    setIsEditing(false);
                } else {
                    // For approve/reject actions, close modal and refresh list
                    console.log('Action completed successfully, refreshing list...');
                    onActionComplete();
                    onClose();
                }
            } else {
                throw new Error(response?.message || "An unknown error occurred.");
            }
        } catch (error) {
            console.error(`Error during ${actionType}:`, error);
            toast.error(error.message || `Failed to ${actionType} submission`, { id: toastId });
        } finally {
            setActionInProgress(null);
        }
    };
    
    const renderFormFields = () => {
        if (!formData) return <p>No specific data available.</p>;

        const fieldsToExclude = ['_id', 'userId', 'centralSubmissionId', '__v', 'createdAt', 'updatedAt', 'imageUrls', 'location', 'imageMetadata'];

        const renderValue = (value) => {
            if (Array.isArray(value)) return value.join(', ');
            if (typeof value === 'boolean') return value ? 'Yes' : 'No';
            if (value !== null && typeof value === 'object') return JSON.stringify(value);
            return value || '';
        };

        return Object.entries(formData)
            .filter(([key]) => !fieldsToExclude.includes(key))
            .map(([key, value]) => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                    return Object.entries(value).map(([nestedKey, nestedValue]) => {
                        const nestedLabel = `${label} - ${nestedKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`;
                        return (
                            <div className="mb-3 col-md-6" key={`${key}.${nestedKey}`}>
                                <label className="form-label fw-semibold">{nestedLabel}</label>
                                <input type="text" className="form-control" value={renderValue(nestedValue)} readOnly={!isEditing} />
                            </div>
                        );
                    });
                }
                return (
                    <div className="mb-3 col-md-6" key={key}>
                        <label className="form-label fw-semibold">{label}</label>
                        <input type="text" className="form-control" value={renderValue(value)} onChange={(e) => setFormData({...formData, [key]: e.target.value})} readOnly={!isEditing} />
                    </div>
                );
            });
    };

    return (
        <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: show ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Review Submission: {details?.titlePreview || 'Loading...'}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {isLoading ? <div className="text-center p-5"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div></div> 
                        : !details ? <div className="alert alert-danger">Could not load submission details.</div> 
                        : (
                            <div className="row">
                                <div className="col-lg-7 border-end-lg">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h6 className="mb-0 text-primary">Submission Data</h6>
                                        {!isEditing && details.status === 'pending' && (
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => setIsEditing(true)}>
                                                <i className="bx bx-edit-alt me-1"></i>Edit Data
                                            </button>
                                        )}
                                    </div>
                                    <hr className="mt-0" />
                                    <div className="row">{renderFormFields()}</div>
                                    {isEditing && (
                                        <div className="d-flex justify-content-end gap-2 mt-3">
                                            <button className="btn btn-sm btn-label-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                                            <button className="btn btn-sm btn-primary" onClick={() => handleAction('save')} disabled={actionInProgress}>
                                                {actionInProgress === 'save' ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    )}
                                    <h6 className="mt-4 text-primary">Submitted Images</h6>
                                    <hr className="mt-0" />
                                    <div className="row g-2">
                                        {details.imageUrls && details.imageUrls.map((img, i) => (
                                            <div className="col-md-4 col-6" key={i}>
                                                <a href={img.url} target="_blank" rel="noopener noreferrer">
                                                    <img src={img.url} alt={`Img ${i + 1}`} className="img-fluid rounded shadow-sm border" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-lg-5 mt-4 mt-lg-0">
                                    <h6 className="text-primary">Submitter & Status</h6>
                                    <hr className="mt-0" />
                                    <p><strong>User:</strong> {details.userName} ({details.userEmail})</p>
                                    <p><strong>Service:</strong> <span className={`badge bg-${getServiceTypeBadge(details.serviceType)}`}>{details.serviceType?.toUpperCase()}</span></p>
                                    <p><strong>Status:</strong> <span className={`badge bg-label-${getStatusBadge(details.status)}`}>{details.status?.toUpperCase()}</span></p>
                                    <p><strong>Submitted:</strong> {formatDate(details.createdAt)}</p>
                                    {details.status !== 'pending' && <p><strong>Reason/Notes:</strong> {details.rejectionReason || details.adminNotes || 'N/A'}</p>}
                                    {details.status === 'pending' && (
                                        <>
                                            <h6 className="mt-4 text-primary">Admin Actions</h6>
                                            <hr className="mt-0" />
                                            <div className="mb-3">
                                                <label htmlFor="adminNotes" className="form-label">Notes / Rejection Reason</label>
                                                <textarea 
                                                    className="form-control" 
                                                    id="adminNotes" 
                                                    rows="3" 
                                                    placeholder="Mandatory for rejection, optional for approval." 
                                                    value={adminNotes} 
                                                    onChange={(e) => setAdminNotes(e.target.value)}
                                                ></textarea>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button 
                                                    className="btn btn-danger w-100" 
                                                    onClick={() => handleAction('reject')} 
                                                    disabled={!!actionInProgress || !adminNotes.trim()}
                                                >
                                                    {actionInProgress === 'reject' ? (
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                        <>
                                                            <i className="bx bx-x-circle me-1"></i>Reject
                                                        </>
                                                    )}
                                                </button>
                                                <button 
                                                    className="btn btn-success w-100" 
                                                    onClick={() => handleAction('approve')} 
                                                    disabled={!!actionInProgress}
                                                >
                                                    {actionInProgress === 'approve' ? (
                                                        <span className="spinner-border spinner-border-sm"></span>
                                                    ) : (
                                                        <>
                                                            <i className="bx bx-check-circle me-1"></i>Approve
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SubmissionTable = ({ title, statusFilter = '', serviceTypeFilter = '' }) => {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
    const [activeServiceFilter, setActiveServiceFilter] = useState(serviceTypeFilter);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchSubmissions = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = { page, limit: 10 };
            if (statusFilter) params.status = statusFilter;
            if (activeServiceFilter) params.serviceType = activeServiceFilter;
            
            console.log('Fetching submissions with params:', params);
            const response = await submissionAPI.getSubmissions(params);
            console.log('Submissions fetch response:', response);
            
            if (response.success) {
                setSubmissions(response.data);
                setPagination(response.pagination);
                setCurrentPage(page);
            } else {
                throw new Error(response.message);
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
            setError(err.message);
            toast.error(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, activeServiceFilter]);

    useEffect(() => {
        fetchSubmissions(1);
    }, [fetchSubmissions]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= pagination.totalPages) {
            fetchSubmissions(newPage);
        }
    };
    
    const handleActionComplete = async () => {
        console.log('Action completed, refreshing submissions list...');
        const targetPage = submissions.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        await fetchSubmissions(targetPage);
    };
    
    return (
        <div className="card">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center">
                <h5 className="mb-0">{title} ({pagination.totalDocs || 0})</h5>
                {!serviceTypeFilter && (
                    <div style={{minWidth: '200px'}}>
                        <select className="form-select" value={activeServiceFilter} onChange={(e) => setActiveServiceFilter(e.target.value)}>
                            <option value="">All Services</option>
                            <option value="mess">Mess</option>
                            <option value="rental">Rental</option>
                            <option value="plumber">Plumber</option>
                            <option value="electrician">Electrician</option>
                            <option value="laundry">Laundry</option>
                            <option value="medical">Medical</option>
                        </select>
                    </div>
                )}
            </div>
            <div className="table-responsive text-nowrap">
                {isLoading ? (
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary"></div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger m-4">Error: {error}</div>
                ) : submissions.length === 0 ? (
                    <div className="text-center p-5">
                        <i className='bx bx-check-double bx-lg text-success mb-3'></i>
                        <h5 className="mb-1">All Caught Up!</h5>
                        <p className="text-muted">No submissions found.</p>
                    </div>
                ) : (
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Submission</th>
                                <th>Service</th>
                                <th>Submitted By</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {submissions.map((sub) => (
                                <tr key={sub._id}>
                                    <td>
                                        <strong>{sub.titlePreview}</strong><br/>
                                        <small className="text-muted">{sub.locationPreview}</small>
                                    </td>
                                    <td>
                                        <span className={`badge bg-label-${getServiceTypeBadge(sub.serviceType)}`}>
                                            {sub.serviceType?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        {sub.userName}<br/>
                                        <small className="text-muted">{sub.userEmail}</small>
                                    </td>
                                    <td>{formatDate(sub.createdAt)}</td>
                                    <td>
                                        <span className={`badge bg-label-${getStatusBadge(sub.status)}`}>
                                            {sub.status?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-primary" onClick={() => setSelectedSubmissionId(sub._id)}>
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {pagination.totalPages > 1 && (
                <div className="card-footer d-flex justify-content-center">
                    <nav>
                        <ul className="pagination">
                            <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(pagination.currentPage - 1)}>«</button>
                            </li>
                            {[...Array(pagination.totalPages).keys()].map(num => (
                                <li key={num} className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageChange(num + 1)}>
                                        {num + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(pagination.currentPage + 1)}>»</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
            <SubmissionDetailModal 
                show={!!selectedSubmissionId} 
                submissionId={selectedSubmissionId} 
                onClose={() => setSelectedSubmissionId(null)} 
                onActionComplete={handleActionComplete} 
            />
        </div>
    );
};



// import React, { useState, useCallback, useEffect } from 'react';
// import { toast } from 'sonner';
// import { submissionAPI } from '../../services/submissionApi';

// // --- Helper Functions ---
// const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
// };
// const getServiceTypeBadge = (serviceType = '') => {
//     const colors = { mess: 'info', rental: 'success', plumber: 'primary', electrician: 'warning', laundry: 'secondary', medical: 'danger' };
//     return colors[serviceType.toLowerCase()] || 'dark';
// };
// const getStatusBadge = (status = '') => {
//     const colors = { pending: 'warning', verified: 'success', rejected: 'danger' };
//     return colors[status.toLowerCase()] || 'secondary';
// };

// // --- Submission Detail Modal Component (No changes needed) ---
// const SubmissionDetailModal = ({ submissionId, show, onClose, onActionComplete }) => {
//     const [details, setDetails] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [isEditing, setIsEditing] = useState(false);
//     const [formData, setFormData] = useState({});
//     const [adminNotes, setAdminNotes] = useState('');
//     const [actionInProgress, setActionInProgress] = useState(null);

//     useEffect(() => {
//         if (show && submissionId) {
//             setIsLoading(true);
//             submissionAPI.getSubmissionDetails(submissionId)
//                 .then(response => {
//                     if (response.success) {
//                         setDetails(response.data);
//                         setFormData(response.data.serviceSpecificData || {});
//                         setAdminNotes(response.data.rejectionReason || response.data.adminNotes || '');
//                     } else {
//                         toast.error(response.message || 'Failed to load submission details');
//                     }
//                 })
//                 .catch(error => toast.error(`Fetch Error: ${error.message}`))
//                 .finally(() => setIsLoading(false));
//         }
//     }, [show, submissionId]);
    
//     const handleAction = async (actionType) => {
//         if (isEditing && actionType !== 'save') {
//             toast.warning("Please save or cancel your edits first.");
//             return;
//         }
//         if (actionType === 'reject' && !adminNotes.trim()) {
//             toast.error("A reason for rejection is mandatory.");
//             return;
//         }
//         let confirmationMessage = '';
//         if (actionType === 'approve') confirmationMessage = "Are you sure you want to approve this submission?";
//         if (actionType === 'reject') confirmationMessage = `Reject with reason: "${adminNotes}"?`;
//         if (confirmationMessage && !window.confirm(confirmationMessage)) return;

//         setActionInProgress(actionType);
//         const toastId = toast.loading(`${actionType}ing submission...`);
//         try {
//             let response;
//             if (actionType === 'save') response = await submissionAPI.updateSubmissionData(submissionId, formData);
//             else if (actionType === 'approve') response = await submissionAPI.approveSubmission(submissionId, adminNotes);
//             else if (actionType === 'reject') response = await submissionAPI.rejectSubmission(submissionId, adminNotes);

//             if (response?.success) {
//                 toast.success(response.message || "Action completed.", { id: toastId });
//                 if (actionType === 'save') {
//                     setDetails(prev => ({ ...prev, serviceSpecificData: response.data }));
//                     setIsEditing(false);
//                 } else {
//                     onActionComplete();
//                     onClose();
//                 }
//             } else {
//                 throw new Error(response?.message || "An unknown error occurred.");
//             }
//         } catch (error) {
//             toast.error(error.message || `Failed to ${actionType} submission.`, { id: toastId });
//         } finally {
//             setActionInProgress(null);
//         }
//     };
    
//     const renderFormFields = () => {
//         if (!formData) return <p>No specific data available.</p>;
//         const fieldsToExclude = ['_id', 'userId', 'centralSubmissionId', '__v', 'createdAt', 'updatedAt', 'imageUrls', 'location', 'imageMetadata'];
//         return Object.entries(formData).filter(([key]) => !fieldsToExclude.includes(key)).map(([key, value]) => (
//             <div className="mb-3 col-md-6" key={key}>
//                 <label className="form-label fw-semibold">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
//                 <input type="text" className="form-control" value={Array.isArray(value) ? value.join(', ') : value || ''} onChange={(e) => setFormData({...formData, [key]: e.target.value})} readOnly={!isEditing} />
//             </div>
//         ));
//     };

//     return (
//         <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: show ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
//             <div className="modal-dialog modal-xl modal-dialog-scrollable">
//                 <div className="modal-content">
//                     <div className="modal-header">
//                         <h5 className="modal-title">Review Submission: {details?.titlePreview || 'Loading...'}</h5>
//                         <button type="button" className="btn-close" onClick={onClose} disabled={actionInProgress}></button>
//                     </div>
//                     <div className="modal-body">
//                         {isLoading ? <div className="text-center p-5"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div></div> 
//                         : !details ? <div className="alert alert-danger">Could not load submission details.</div> 
//                         : (
//                             <div className="row">
//                                 <div className="col-lg-7 border-end-lg">
//                                     <div className="d-flex justify-content-between align-items-center mb-2">
//                                         <h6 className="mb-0 text-primary">Submission Data</h6>
//                                         {!isEditing && details.status === 'pending' && <button className="btn btn-sm btn-outline-primary" onClick={() => setIsEditing(true)}><i className="bx bx-edit-alt me-1"></i>Edit</button>}
//                                     </div>
//                                     <hr className="mt-0" />
//                                     <div className="row">{renderFormFields()}</div>
//                                     {isEditing && (
//                                         <div className="d-flex justify-content-end gap-2 mt-3">
//                                             <button className="btn btn-sm btn-label-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
//                                             <button className="btn btn-sm btn-primary" onClick={() => handleAction('save')} disabled={actionInProgress}>{actionInProgress === 'save' ? 'Saving...' : 'Save Changes'}</button>
//                                         </div>
//                                     )}
//                                     <h6 className="mt-4 text-primary">Submitted Images</h6>
//                                     <hr className="mt-0" />
//                                     <div className="row g-2">{details.imageUrls?.map((img, i) => <div className="col-md-4 col-6" key={i}><a href={img.url} target="_blank" rel="noopener noreferrer"><img src={img.url} alt={`Img ${i + 1}`} className="img-fluid rounded shadow-sm border" /></a></div>)}</div>
//                                 </div>
//                                 <div className="col-lg-5 mt-4 mt-lg-0">
//                                     <h6 className="text-primary">Submitter & Status</h6>
//                                     <hr className="mt-0" />
//                                     <p><strong>User:</strong> {details.userEmail}</p>
//                                     <p><strong>Service:</strong> <span className={`badge bg-${getServiceTypeBadge(details.serviceType)}`}>{details.serviceType?.toUpperCase()}</span></p>
//                                     <p><strong>Status:</strong> <span className={`badge bg-label-${getStatusBadge(details.status)}`}>{details.status?.toUpperCase()}</span></p>
//                                     <p><strong>Submitted:</strong> {formatDate(details.createdAt)}</p>
//                                     {details.status !== 'pending' && <p><strong>Reason/Notes:</strong> {details.rejectionReason || details.adminNotes || 'N/A'}</p>}
//                                     {details.status === 'pending' && (
//                                         <>
//                                             <h6 className="mt-4 text-primary">Admin Actions</h6>
//                                             <hr className="mt-0" />
//                                             <div className="mb-3">
//                                                 <label htmlFor="adminNotes" className="form-label">Notes / Rejection Reason</label>
//                                                 <textarea className="form-control" id="adminNotes" rows="3" placeholder="Mandatory for rejection..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}></textarea>
//                                             </div>
//                                             <div className="d-flex gap-2">
//                                                 <button className="btn btn-danger w-100" onClick={() => handleAction('reject')} disabled={!!actionInProgress || !adminNotes.trim()}><i className="bx bx-x-circle me-1"></i>Reject</button>
//                                                 <button className="btn btn-success w-100" onClick={() => handleAction('approve')} disabled={!!actionInProgress}><i className="bx bx-check-circle me-1"></i>Approve</button>
//                                             </div>
//                                         </>
//                                     )}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // --- Main Table Component (Upgraded) ---
// export const SubmissionTable = ({ 
//     title, 
//     statusFilter: initialStatusFilter = '', 
//     serviceTypeFilter = '',
//     showStatusFilter = true,
//     showServiceFilter = true,
// }) => {
//     const [submissions, setSubmissions] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [pagination, setPagination] = useState({});
//     const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
//     const [currentPage, setCurrentPage] = useState(1);
    
//     // Internal state for the dropdowns, initialized by props
//     const [activeServiceFilter, setActiveServiceFilter] = useState(serviceTypeFilter);
//     const [activeStatusFilter, setActiveStatusFilter] = useState(initialStatusFilter);

//     const fetchSubmissions = useCallback(async (page = 1) => {
//         setIsLoading(true);
//         setError(null);
//         try {
//             const params = { page, limit: 10 };
//             if (activeStatusFilter) params.status = activeStatusFilter;
//             if (activeServiceFilter) params.serviceType = activeServiceFilter;
            
//             const response = await submissionAPI.getSubmissions(params);
            
//             if (response.success) {
//                 setSubmissions(response.data);
//                 setPagination(response.pagination);
//                 setCurrentPage(page);
//             } else {
//                 throw new Error(response.message);
//             }
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     }, [activeStatusFilter, activeServiceFilter]);

//     useEffect(() => {
//         fetchSubmissions(1);
//     }, [fetchSubmissions]);

//     const handlePageChange = (newPage) => {
//         if (newPage > 0 && newPage <= pagination.totalPages) {
//             fetchSubmissions(newPage);
//         }
//     };
    
//     const handleActionComplete = async () => {
//         const targetPage = submissions.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
//         await fetchSubmissions(targetPage);
//     };
    
//     return (
//         <div className="card">
//             <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
//                 <h5 className="mb-0">{title} ({pagination.totalDocs || 0})</h5>
//                 <div className="d-flex gap-2">
//                     {showServiceFilter && (
//                         <div style={{minWidth: '180px'}}>
//                             <select className="form-select form-select-sm" value={activeServiceFilter} onChange={(e) => setActiveServiceFilter(e.target.value)}>
//                                 <option value="">All Services</option>
//                                 <option value="mess">Mess</option>
//                                 <option value="rental">Rental</option>
//                                 <option value="plumber">Plumber</option>
//                                 <option value="electrician">Electrician</option>
//                                 <option value="laundry">Laundry</option>
//                                 <option value="medical">Medical</option>
//                             </select>
//                         </div>
//                     )}
//                     {showStatusFilter && (
//                          <div style={{minWidth: '180px'}}>
//                             <select className="form-select form-select-sm" value={activeStatusFilter} onChange={(e) => setActiveStatusFilter(e.target.value)}>
//                                 <option value="">All Statuses</option>
//                                 <option value="pending">Pending</option>
//                                 <option value="verified">Verified</option>
//                                 <option value="rejected">Rejected</option>
//                             </select>
//                         </div>
//                     )}
//                 </div>
//             </div>
//             <div className="table-responsive text-nowrap">
//                 {isLoading ? <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
//                 : error ? <div className="alert alert-danger m-4">Error: {error}</div>
//                 : submissions.length === 0 ? <div className="text-center p-5"><i className='bx bx-check-double bx-lg text-success mb-3'></i><h5>All Caught Up!</h5></div>
//                 : (
//                     <table className="table table-hover">
//                         <thead>
//                             <tr>
//                                 <th>Submission</th><th>Service</th><th>Submitted By</th><th>Date</th><th>Status</th><th>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="table-border-bottom-0">
//                             {submissions.map((sub) => (
//                                 <tr key={sub._id}>
//                                     <td><strong>{sub.titlePreview}</strong><br/><small className="text-muted">{sub.locationPreview}</small></td>
//                                     <td><span className={`badge bg-label-${getServiceTypeBadge(sub.serviceType)}`}>{sub.serviceType?.toUpperCase()}</span></td>
//                                     <td>{sub.userEmail}</td>
//                                     <td>{formatDate(sub.createdAt)}</td>
//                                     <td><span className={`badge bg-label-${getStatusBadge(sub.status)}`}>{sub.status?.toUpperCase()}</span></td>
//                                     <td><button className="btn btn-sm btn-primary" onClick={() => setSelectedSubmissionId(sub._id)}>Review</button></td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 )}
//             </div>
//             {pagination.totalPages > 1 && (
//                 <div className="card-footer d-flex justify-content-center">
//                     <nav>
//                         <ul className="pagination">
//                             <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>«</button></li>
//                             {[...Array(pagination.totalPages).keys()].map(num => <li key={num} className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}><button className="page-link" onClick={() => handlePageChange(num + 1)}>{num + 1}</button></li>)}
//                             <li className={`page-item ${currentPage === pagination.totalPages ? 'disabled' : ''}`}><button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>»</button></li>
//                         </ul>
//                     </nav>
//                 </div>
//             )}
//             <SubmissionDetailModal show={!!selectedSubmissionId} submissionId={selectedSubmissionId} onClose={() => setSelectedSubmissionId(null)} onActionComplete={handleActionComplete} />
//         </div>
//     );
// };
