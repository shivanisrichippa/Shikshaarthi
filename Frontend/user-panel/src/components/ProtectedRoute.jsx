// File: src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const ProtectedRoute = ({ 
  children, 
  requireAuth = false, 
  requirePasswordReset = false,
  redirectTo = '/login',
  message = 'Access denied. Please authenticate first.'
}) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const validateAccess = () => {
      try {
        // Check for authentication requirement
        if (requireAuth) {
          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          if (!token) {
            toast.error(message);
            setIsAuthorized(false);
            setIsValidating(false);
            return;
          }
          
          // Additional token validation can be added here
          // For now, we'll assume token presence means authenticated
        }

        // Check for password reset requirement
        if (requirePasswordReset) {
          const resetToken = sessionStorage.getItem('passwordResetToken');
          
          if (!resetToken) {
            toast.error('Unauthorized access. Please go through the password reset process.');
            setIsAuthorized(false);
            setIsValidating(false);
            return;
          }

          try {
            const tokenData = JSON.parse(atob(resetToken));
            const currentTime = Date.now();

            // Validate token structure and expiry
            if (!tokenData.email || !tokenData.tempUserId || !tokenData.verified || 
                !tokenData.expiry || currentTime > tokenData.expiry) {
              toast.error('Reset session has expired. Please start the process again.');
              sessionStorage.removeItem('passwordResetToken');
              setIsAuthorized(false);
              setIsValidating(false);
              return;
            }

            // Check token age
            const tokenAge = currentTime - tokenData.timestamp;
            const maxAge = 15 * 60 * 1000; // 15 minutes
            
            if (tokenAge > maxAge || tokenAge < 0) {
              toast.error('Reset session is invalid. Please start over.');
              sessionStorage.removeItem('passwordResetToken');
              setIsAuthorized(false);
              setIsValidating(false);
              return;
            }
          } catch (error) {
            console.error('Token validation error:', error);
            toast.error('Invalid session. Please restart the password reset process.');
            sessionStorage.removeItem('passwordResetToken');
            setIsAuthorized(false);
            setIsValidating(false);
            return;
          }
        }

        // If we reach here, access is authorized
        setIsAuthorized(true);
        setIsValidating(false);

      } catch (error) {
        console.error('Access validation error:', error);
        toast.error('Session validation failed. Please try again.');
        setIsAuthorized(false);
        setIsValidating(false);
      }
    };

    validateAccess();
  }, [requireAuth, requirePasswordReset, message]);

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="container min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Validating access...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authorized
  if (!isAuthorized) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;