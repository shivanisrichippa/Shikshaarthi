// admin-panel/src/pages/SendRewardEmail.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

// Mock API - In real app, this would be in services/adminApi.js
const sendRewardEmailAPI = async (emailData) => {
    const token = localStorage.getItem('adminToken');
    const API_URL = import.meta.env.VITE_BACKEND_AUTH_URL || 'http://localhost:3001';
    
    const response = await fetch(`${API_URL}/api/admin/send-reward-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(emailData)
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to send email.');
    }
    return data;
}

const SendRewardEmail = () => {
    const [searchParams] = useSearchParams();
    
    const [toEmail, setToEmail] = useState('');
    const [toName, setToName] = useState('');
    const [subject, setSubject] = useState("🎉 Congratulations from Shikshaarthi!");
    const [messageBody, setMessageBody] = useState('');
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        setToEmail(searchParams.get('email') || '');
        setToName(searchParams.get('name') || 'User');
        setMessageBody(`Hi ${searchParams.get('name') || 'User'},\n\nCongratulations! As a token of our appreciation for your contribution, here is your reward:\n\n[PASTE VOUCHER CODE/LINK HERE]\n\nThanks for being an awesome member of the Shikshaarthi community!\n\nBest,\nThe Shikshaarthi Team`);
    }, [searchParams]);

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setIsSending(true);
        const toastId = toast.loading("Sending email...");
        try {
            const emailData = {
                to: toEmail,
                subject,
                text: messageBody,
            };
            const result = await sendRewardEmailAPI(emailData);
            toast.success(result.message, { id: toastId });
            // Optionally clear the form or navigate away
            setMessageBody('');
        } catch (error) {
            toast.error(error.message, { id: toastId });
        } finally {
            setIsSending(false);
        }
    };
    
    return (
        <div className="container-xxl flex-grow-1 container-p-y">
            <h4 className="fw-bold py-3 mb-4"><span className="text-muted fw-light">Communication /</span> Send Reward Email</h4>
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Compose Email</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSendEmail}>
                        <div className="mb-3">
                            <label className="form-label">To</label>
                            <input type="email" className="form-control" value={toEmail} readOnly />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Subject</label>
                            <input type="text" className="form-control" value={subject} onChange={e => setSubject(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Message Body</label>
                            <textarea className="form-control" rows="10" value={messageBody} onChange={e => setMessageBody(e.target.value)} required></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isSending}>
                            {isSending ? 'Sending...' : 'Send Email'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SendRewardEmail;