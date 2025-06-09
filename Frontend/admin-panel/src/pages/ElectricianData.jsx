import React, { useState } from 'react';
import { SubmissionTable } from '../components/common/SubmissionTable';

const ElectricianData = () => {
    const [activeTab, setActiveTab] = useState('all');

    const renderTable = () => {
        const props = {
            serviceTypeFilter: "electrician",
            showServiceFilter: false, // Always hide service filter on this page
        };

        switch (activeTab) {
            case 'pending':
                return <SubmissionTable key="pending-electrician" title="Pending Electrician Submissions" {...props} statusFilter="pending" showStatusFilter={false} />;
            case 'verified':
                return <SubmissionTable key="verified-electrician" title="Verified Electrician Submissions" {...props} statusFilter="verified" showStatusFilter={false} />;
           
        }
    };

    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Services Data /</span> Electrician Submissions
            </h4>

            <ul className="nav nav-pills flex-column flex-md-row mb-3">
               
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

export default ElectricianData;