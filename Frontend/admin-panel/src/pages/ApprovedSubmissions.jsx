import React from 'react';
import { SubmissionTable } from '../components/common/SubmissionTable';

const ApprovedSubmissions = () => {
    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Data Submissions /</span> Approved Submissions
            </h4>
            <SubmissionTable 
                title="Approved Submissions"
                statusFilter="verified" 
                showStatusFilter={false} // Hide status dropdown, it's always verified
            />
        </div>
    );
};

export default ApprovedSubmissions;