import React, { useState } from 'react';
import { SubmissionTable } from '../components/common/SubmissionTable';

const MessData = () => {
    const [activeTab, setActiveTab] = useState('all');

    const renderTable = () => {
        const props = {
            serviceTypeFilter: "mess",
            showServiceFilter: false, // Always hide service filter on this page
        };

        switch (activeTab) {
            case 'pending':
                return <SubmissionTable key="pending-mess" title="Pending Mess Submissions" {...props} statusFilter="pending" showStatusFilter={false} />;
            case 'verified':
                return <SubmissionTable key="verified-mess" title="Verified Mess Submissions" {...props} statusFilter="verified" showStatusFilter={false} />;
            default:
                return <SubmissionTable key="all-mess" title="All Mess Submissions" {...props} showStatusFilter={true} />;
        }
    };

    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Services Data /</span> Mess Submissions
            </h4>

            <ul className="nav nav-pills flex-column flex-md-row mb-3">
                <li className="nav-item">
                    <a className={`nav-link ${activeTab === 'all' ? 'active' : ''}`} href="#!" onClick={() => setActiveTab('all')}>
                        <i className="bx bx-list-ul me-1"></i> All
                    </a>
                </li>
                <li className="nav-item">
                    <a className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`} href="#!" onClick={() => setActiveTab('pending')}>
                       <i className="bx bx-time-five me-1"></i> Pending
                    </a>
                </li>
                <li className="nav-item">
                    <a className={`nav-link ${activeTab === 'verified' ? 'active' : ''}`} href="#!" onClick={() => setActiveTab('verified')}>
                        <i className="bx bx-check-double me-1"></i> Verified
                    </a>
                </li>
            </ul>

            {renderTable()}
        </div>
    );
};

export default MessData;