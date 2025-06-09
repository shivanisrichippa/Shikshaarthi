import React from 'react';
import { SubmissionTable } from '../components/common/SubmissionTable';

const RejectedSubmissions = () => {
    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <h4 className="fw-bold py-3 mb-4">
                <span className="text-muted fw-light">Data Submissions /</span> Rejected Submissions
            </h4>
            <SubmissionTable 
                title="Rejected Submissions"
                statusFilter="rejected"
                showStatusFilter={false} // Hide status dropdown, it's always rejected
            />
        </div>
    );
};

export default RejectedSubmissions;