import React from 'react';
import { SubmissionTable } from '../components/common/SubmissionTable';

const PendingApprovals = () => {
    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Data Submissions /</span> Pending Approval
            </h4>
            <SubmissionTable 
                title="Pending Submissions"
                statusFilter="pending"
                showStatusFilter={false} // Hide status dropdown, it's always pending
            />
        </div>
    );
};

export default PendingApprovals;