// // File: src/pages/SignUp.jsx
// import React, { useState, useEffect } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";
// import { Toaster, toast } from "sonner";
// import { ErrorBoundary } from "../components/ErrorBoundary";

// const backendUrl = import.meta.env.VITE_BACKEND_AUTH_URL;

// const ResetPassword = () => {
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState({
//     resetting: false
//   });

//   const navigate = useNavigate();
//   const location = useLocation();
  
//   // Get data from navigation state
//   const { email, tempUserId, verified } = location.state || {};

//   // Redirect if accessed without proper data
//   useEffect(() => {
//     if (!email || !tempUserId || !verified) {
//       toast.error("Invalid access. Please start the password reset process again.");
//       navigate('/forgot-password');
//     }
//   }, [email, tempUserId, verified, navigate]);

//   const getPasswordStrength = () => {
//     if (newPassword.length === 0) return null;
//     if (newPassword.length < 6) return { strength: "weak", color: "danger", text: "Too short" };
//     if (newPassword.length < 8) return { strength: "fair", color: "warning", text: "Fair" };
//     if (newPassword.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
//       return { strength: "strong", color: "success", text: "Strong" };
//     }
//     return { strength: "good", color: "info", text: "Good" };
//   };

//   const handleResetPassword = async (e) => {
//     e.preventDefault();

//     if (!newPassword.trim() || !confirmPassword.trim()) {
//       toast.error("Please fill in all password fields");
//       return;
//     }

//     if (newPassword.length < 8) {
//       toast.error("Password must be at least 8 characters long");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     setLoading(prev => ({ ...prev, resetting: true }));

//     try {
//       const response = await axios.post(`${backendUrl}/api/auth/reset-password`, {
//         tempUserId,
//         email,
//         newPassword: newPassword.trim()
//       });

//       if (response.data.success) {
//         toast.success("Password reset successfully!");
//         setTimeout(() => {
//           navigate("/login", { 
//             state: { 
//               message: "Password reset successfully. Please login with your new password.",
//               email: email 
//             }
//           });
//         }, 2000);
//       }

//     } catch (error) {
//       console.error('Reset password error:', error);
//       const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to reset password";
//       toast.error(errorMessage);
      
//       // If session expired or invalid, redirect back to forgot password
//       if (error.response?.status === 404) {
//         setTimeout(() => {
//           navigate('/forgot-password');
//         }, 2000);
//       }
//     } finally {
//       setLoading(prev => ({ ...prev, resetting: false }));
//     }
//   };

//   const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
//   const passwordsDontMatch = newPassword && confirmPassword && newPassword !== confirmPassword;
//   const passwordStrength = getPasswordStrength();

//   // Don't render if we don't have required data
//   if (!email || !tempUserId || !verified) {
//     return null;
//   }

//   return (
//     <ErrorBoundary>
//       <div className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
//         <div className="card shadow-lg p-4" style={{ maxWidth: "500px", width: "100%" }}>
//           <Toaster position="top-right" richColors closeButton />
//           <div className="text-center mb-4">
//             <div className="mb-3">
//               <div className="d-inline-flex align-items-center justify-content-center bg-success rounded-circle" 
//                    style={{ width: "80px", height: "80px" }}>
//                 <i className="fas fa-lock text-white" style={{ fontSize: "2rem" }}></i>
//               </div>
//             </div>
//             <h2 className="text-primary mb-3">Create New Password</h2>
//             <p className="text-muted">
//               Your identity has been verified. Please create a new secure password for your account.
//             </p>
//             <small className="text-success">
//               <i className="fas fa-check-circle me-1"></i>
//               Email verified: <strong>{email}</strong>
//             </small>
//           </div>

//           <form onSubmit={handleResetPassword}>
//             <div className="form-floating mb-3">
//               <input
//                 type="password"
//                 className="form-control"
//                 id="newPassword"
//                 placeholder="New Password"
//                 required
//                 minLength={8}
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//                 autoComplete="new-password"
//               />
//               <label htmlFor="newPassword">New Password (min 8 characters)</label>
//             </div>

//             {passwordStrength && (
//               <div className="mb-3">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <small className="text-muted">Password strength:</small>
//                   <span className={`badge bg-${passwordStrength.color}`}>
//                     {passwordStrength.text}
//                   </span>
//                 </div>
//                 <div className="progress" style={{ height: "4px" }}>
//                   <div 
//                     className={`progress-bar bg-${passwordStrength.color}`}
//                     style={{ 
//                       width: passwordStrength.strength === "weak" ? "25%" : 
//                              passwordStrength.strength === "fair" ? "50%" :
//                              passwordStrength.strength === "good" ? "75%" : "100%"
//                     }}
//                   ></div>
//                 </div>
//               </div>
//             )}

//             <div className="form-floating mb-4">
//               <input
//                 type="password"
//                 className={`form-control ${passwordsMatch ? 'is-valid' : passwordsDontMatch ? 'is-invalid' : ''}`}
//                 id="confirmPassword"
//                 placeholder="Confirm Password"
//                 required
//                 minLength={8}
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 autoComplete="new-password"
//               />
//               <label htmlFor="confirmPassword">Confirm New Password</label>
//               {passwordsMatch && (
//                 <div className="valid-feedback">
//                   <i className="fas fa-check me-1"></i>Passwords match
//                 </div>
//               )}
//               {passwordsDontMatch && (
//                 <div className="invalid-feedback">
//                   <i className="fas fa-times me-1"></i>Passwords do not match
//                 </div>
//               )}
//             </div>

//             <button
//               type="submit"
//               className="btn btn-success w-100 mb-3 py-3"
//               disabled={loading.resetting || !passwordsMatch || newPassword.length < 8}
//               style={{ fontSize: "1.1rem", fontWeight: "600" }}
//             >
//               {loading.resetting ? (
//                 <>
//                   <span className="spinner-border spinner-border-sm me-2" role="status"></span>
//                   Updating Password...
//                 </>
//               ) : (
//                 <>
//                   <i className="fas fa-key me-2"></i>
//                   Update Password
//                 </>
//               )}
//             </button>

//             <div className="text-center">
//               <small className="text-muted">
//                 <i className="fas fa-info-circle me-1"></i>
//                 Once updated, you'll be redirected to the login page
//               </small>
//             </div>
//           </form>

//           <div className="text-center mt-4">
//             <small className="text-muted">
//               <Link to="/login" className="text-decoration-none">
//                 <i className="fas fa-arrow-left me-1"></i>
//                 Back to Login
//               </Link>
//             </small>
//           </div>
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default ResetPassword;




// File: src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { ErrorBoundary } from "../components/ErrorBoundary";

const backendUrl = import.meta.env.VITE_BACKEND_AUTH_URL;

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState({
    resetting: false,
    validating: true
  });
  const [validSession, setValidSession] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  const navigate = useNavigate();

  // Validate session and redirect if unauthorized
  useEffect(() => {
    const validateSession = () => {
      try {
        const resetToken = sessionStorage.getItem('passwordResetToken');
        
        if (!resetToken) {
          toast.error("Unauthorized access. Please go through the password reset process.");
          navigate('/forgot-password', { replace: true });
          return;
        }

        // Decode and validate the token
        const tokenData = JSON.parse(atob(resetToken));
        const currentTime = Date.now();

        // Check if token is expired (10 minutes)
        if (!tokenData.expiry || currentTime > tokenData.expiry) {
          toast.error("Reset session has expired. Please start the process again.");
          sessionStorage.removeItem('passwordResetToken');
          navigate('/forgot-password', { replace: true });
          return;
        }

        // Check if all required fields are present
        if (!tokenData.email || !tokenData.tempUserId || !tokenData.verified) {
          toast.error("Invalid session data. Please restart the password reset process.");
          sessionStorage.removeItem('passwordResetToken');
          navigate('/forgot-password', { replace: true });
          return;
        }

        // Additional security: Check if timestamp is reasonable (not too old, not future)
        const tokenAge = currentTime - tokenData.timestamp;
        const maxAge = 15 * 60 * 1000; // 15 minutes max age
        
        if (tokenAge > maxAge || tokenAge < 0) {
          toast.error("Reset session is invalid. Please start over.");
          sessionStorage.removeItem('passwordResetToken');
          navigate('/forgot-password', { replace: true });
          return;
        }

        // Session is valid
        setSessionData(tokenData);
        setValidSession(true);
        setLoading(prev => ({ ...prev, validating: false }));

      } catch (error) {
        console.error('Session validation error:', error);
        toast.error("Invalid session. Please restart the password reset process.");
        sessionStorage.removeItem('passwordResetToken');
        navigate('/forgot-password', { replace: true });
      }
    };

    validateSession();

    // Set up periodic validation (every 30 seconds)
    const validationInterval = setInterval(validateSession, 30000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(validationInterval);
    };
  }, [navigate]);

  // Prevent direct access by monitoring page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !validSession) {
        // User returned to tab without valid session
        toast.error("Session expired. Please restart the password reset process.");
        navigate('/forgot-password', { replace: true });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [validSession, navigate]);

  // Clean up session storage on component unmount
  useEffect(() => {
    return () => {
      // Only clear if we're navigating away (not just re-rendering)
      const currentPath = window.location.pathname;
      if (currentPath !== '/reset-password') {
        sessionStorage.removeItem('passwordResetToken');
      }
    };
  }, []);

  const getPasswordStrength = () => {
    if (newPassword.length === 0) return null;
    if (newPassword.length < 6) return { strength: "weak", color: "danger", text: "Too short" };
    if (newPassword.length < 8) return { strength: "fair", color: "warning", text: "Fair" };
    if (newPassword.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return { strength: "strong", color: "success", text: "Strong" };
    }
    return { strength: "good", color: "info", text: "Good" };
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!sessionData) {
      toast.error("Session expired. Please restart the password reset process.");
      navigate('/forgot-password', { replace: true });
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(prev => ({ ...prev, resetting: true }));

    try {
      const response = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        tempUserId: sessionData.tempUserId,
        email: sessionData.email,
        newPassword: newPassword.trim()
      });

      if (response.data.success) {
        toast.success("Password reset successfully!");
        
        // Clear the session token
        sessionStorage.removeItem('passwordResetToken');
        
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              message: "Password reset successfully. Please login with your new password.",
              email: sessionData.email 
            },
            replace: true
          });
        }, 2000);
      }

    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to reset password";
      toast.error(errorMessage);
      
      // If session expired or invalid, redirect back to forgot password
      if (error.response?.status === 404 || error.response?.status === 401) {
        sessionStorage.removeItem('passwordResetToken');
        setTimeout(() => {
          navigate('/forgot-password', { replace: true });
        }, 2000);
      }
    } finally {
      setLoading(prev => ({ ...prev, resetting: false }));
    }
  };

  // Show loading while validating session
  if (loading.validating || !validSession || !sessionData) {
    return (
      <ErrorBoundary>
        <div className="container min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Validating session...</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsDontMatch = newPassword && confirmPassword && newPassword !== confirmPassword;
  const passwordStrength = getPasswordStrength();

  return (
    <ErrorBoundary>
      <div className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
        <div className="card shadow-lg p-4" style={{ maxWidth: "500px", width: "100%" }}>
          <Toaster position="top-right" richColors closeButton />
          <div className="text-center mb-4">
            <div className="mb-3">
              <div className="d-inline-flex align-items-center justify-content-center bg-success rounded-circle" 
                   style={{ width: "80px", height: "80px" }}>
                <i className="fas fa-lock text-white" style={{ fontSize: "2rem" }}></i>
              </div>
            </div>
            <h2 className="text-primary mb-3">Create New Password</h2>
            <p className="text-muted">
              Your identity has been verified. Please create a new secure password for your account.
            </p>
            <small className="text-success">
              <i className="fas fa-check-circle me-1"></i>
              Email verified: <strong>{sessionData.email}</strong>
            </small>
          </div>

          <form onSubmit={handleResetPassword}>
            <div className="form-floating mb-3">
              <input
                type="password"
                className="form-control"
                id="newPassword"
                placeholder="New Password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <label htmlFor="newPassword">New Password (min 8 characters)</label>
            </div>

            {passwordStrength && (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">Password strength:</small>
                  <span className={`badge bg-${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="progress" style={{ height: "4px" }}>
                  <div 
                    className={`progress-bar bg-${passwordStrength.color}`}
                    style={{ 
                      width: passwordStrength.strength === "weak" ? "25%" : 
                             passwordStrength.strength === "fair" ? "50%" :
                             passwordStrength.strength === "good" ? "75%" : "100%"
                    }}
                  ></div>
                </div>
              </div>
            )}

            <div className="form-floating mb-4">
              <input
                type="password"
                className={`form-control ${passwordsMatch ? 'is-valid' : passwordsDontMatch ? 'is-invalid' : ''}`}
                id="confirmPassword"
                placeholder="Confirm Password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <label htmlFor="confirmPassword">Confirm New Password</label>
              {passwordsMatch && (
                <div className="valid-feedback">
                  <i className="fas fa-check me-1"></i>Passwords match
                </div>
              )}
              {passwordsDontMatch && (
                <div className="invalid-feedback">
                  <i className="fas fa-times me-1"></i>Passwords do not match
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-success w-100 mb-3 py-3"
              disabled={loading.resetting || !passwordsMatch || newPassword.length < 8}
              style={{ fontSize: "1.1rem", fontWeight: "600" }}
            >
              {loading.resetting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Updating Password...
                </>
              ) : (
                <>
                  <i className="fas fa-key me-2"></i>
                  Update Password
                </>
              )}
            </button>

            <div className="text-center">
              <small className="text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Once updated, you'll be redirected to the login page
              </small>
            </div>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">
              <Link to="/login" className="text-decoration-none">
                <i className="fas fa-arrow-left me-1"></i>
                Back to Login
              </Link>
            </small>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ResetPassword;