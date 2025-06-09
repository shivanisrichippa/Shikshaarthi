// // File: src/pages/SignUp.jsx
// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Toaster, toast } from "sonner";
// import { ErrorBoundary } from "../components/ErrorBoundary";

// const backendUrl = import.meta.env.VITE_BACKEND_AUTH_URL;

// const ForgotPassword = () => {
//   const [step, setStep] = useState(1); // 1: Email Input, 2: OTP Verification
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [tempUserId, setTempUserId] = useState(""); // Store tempUserId from backend
//   const [loading, setLoading] = useState({
//     sendingOtp: false,
//     verifyingOtp: false,
//     resendingOtp: false
//   });
//   const [resendCooldown, setResendCooldown] = useState(0);

//   const navigate = useNavigate();

//   const validateEmail = (email) => {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   };

//   // Handle email submission and send OTP
//   const handleSendOTP = async (e) => {
//     e.preventDefault();
    
//     if (!email.trim()) {
//       toast.error("Please enter your email address");
//       return;
//     }

//     if (!validateEmail(email)) {
//       toast.error("Please enter a valid email address");
//       return;
//     }

//     setLoading(prev => ({ ...prev, sendingOtp: true }));

//     try {
//       const response = await axios.post(`${backendUrl}/api/auth/forgot-password`, {
//         email: email.toLowerCase().trim()
//       });

//       if (response.data.success) {
//         // Store tempUserId returned from backend
//         setTempUserId(response.data.tempUserId);
//         setStep(2); // Move to OTP verification step
//         toast.success("Reset code sent to your email!");
//         setResendCooldown(60); // Start cooldown timer
//       }

//     } catch (error) {
//       const errorMessage = error.response?.data?.error || "Failed to send reset code";
//       toast.error(errorMessage);
//     } finally {
//       setLoading(prev => ({ ...prev, sendingOtp: false }));
//     }
//   };

//   // Handle OTP verification
//   const handleVerifyOTP = async (e) => {
//     e.preventDefault();

//     if (!otp || otp.length !== 6) {
//       toast.error("Please enter a valid 6-digit verification code");
//       return;
//     }

//     setLoading(prev => ({ ...prev, verifyingOtp: true }));

//     try {
//       const response = await axios.post(`${backendUrl}/api/auth/verify-reset-otp`, {
//         tempUserId,
//         email: email.toLowerCase().trim(),
//         otp: otp.trim()
//       });

//       if (response.data.success) {
//         toast.success("Verification successful!");
        
//         // Navigate to reset password page with necessary data
//         setTimeout(() => {
//           navigate('/reset-password', {
//             state: {
//               email: email.toLowerCase().trim(),
//               tempUserId,
//               verified: true
//             }
//           });
//         }, 1000);
//       }

//     } catch (error) {
//       console.error('OTP verification error:', error);
//       const errorMessage = error.response?.data?.error || error.response?.data?.message || "Verification failed";
//       toast.error(errorMessage);
      
//       // Clear OTP on error
//       setOtp("");
//     } finally {
//       setLoading(prev => ({ ...prev, verifyingOtp: false }));
//     }
//   };

//   // Handle resend OTP
//   const handleResendOTP = async () => {
//     if (resendCooldown > 0) return;

//     setLoading(prev => ({ ...prev, resendingOtp: true }));

//     try {
//       const response = await axios.post(`${backendUrl}/api/auth/resend-reset-otp`, {
//         tempUserId,
//         email: email.toLowerCase().trim()
//       });

//       if (response.data.success) {
//         toast.success("New reset code sent to your email!");
//         setResendCooldown(60); // Reset cooldown
//         setOtp(""); // Clear current OTP
//       }
      
//     } catch (error) {
//       console.error('Resend OTP error:', error);
//       const errorMessage = error.response?.data?.error || "Failed to resend verification code";
//       toast.error(errorMessage);
//     } finally {
//       setLoading(prev => ({ ...prev, resendingOtp: false }));
//     }
//   };

//   const goBackToEmail = () => {
//     setStep(1);
//     setOtp("");
//     setTempUserId("");
//     setResendCooldown(0);
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   // Cooldown timer effect
//   React.useEffect(() => {
//     if (resendCooldown > 0) {
//       const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [resendCooldown]);

//   // OTP Verification Step (Step 2)
//   if (step === 2) {
//     return (
//       <ErrorBoundary>
//         <div className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
//           <div className="card shadow-lg p-4" style={{ maxWidth: "500px", width: "100%" }}>
//             <Toaster position="top-right" richColors closeButton />
//             <div className="text-center mb-4">
//               <div className="mb-3">
//                 <div className="d-inline-flex align-items-center justify-content-center bg-success rounded-circle" 
//                      style={{ width: "80px", height: "80px" }}>
//                   <i className="fas fa-shield-alt text-white" style={{ fontSize: "2rem" }}></i>
//                 </div>
//               </div>
//               <h2 className="text-primary mb-3">Verify Reset Code</h2>
//               <p className="text-muted">
//                 We've sent a 6-digit verification code to<br />
//                 <strong className="text-dark">{email}</strong>
//               </p>
//               <small className="text-muted">
//                 Check your inbox and spam folder
//               </small>
//             </div>

//             <form onSubmit={handleVerifyOTP}>
//               <div className="form-floating mb-3">
//                 <input
//                   type="text"
//                   className="form-control text-center fw-bold"
//                   id="otp"
//                   placeholder="Enter 6-digit code"
//                   required
//                   maxLength={6}
//                   value={otp}
//                   onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//                   style={{ 
//                     letterSpacing: "0.5em", 
//                     fontSize: "1.5rem",
//                     height: "60px"
//                   }}
//                   autoComplete="one-time-code"
//                   inputMode="numeric"
//                   disabled={loading.verifyingOtp}
//                 />
//                 <label htmlFor="otp">Verification Code</label>
//               </div>

//               <button
//                 type="submit"
//                 className="btn btn-primary w-100 mb-3 py-3"
//                 disabled={loading.verifyingOtp || !otp || otp.length !== 6}
//                 style={{ fontSize: "1.1rem", fontWeight: "600" }}
//               >
//                 {loading.verifyingOtp ? (
//                   <>
//                     <span className="spinner-border spinner-border-sm me-2" role="status"></span>
//                     Verifying...
//                   </>
//                 ) : (
//                   <>
//                     <i className="fas fa-check me-2"></i>
//                     Verify Code
//                   </>
//                 )}
//               </button>

//               <div className="text-center mb-3">
//                 <button
//                   type="button"
//                   className="btn btn-link p-0"
//                   onClick={handleResendOTP}
//                   disabled={resendCooldown > 0 || loading.resendingOtp}
//                   style={{ textDecoration: resendCooldown > 0 ? 'none' : 'underline' }}
//                 >
//                   {loading.resendingOtp ? (
//                     <>
//                       <span className="spinner-border spinner-border-sm me-1" role="status"></span>
//                       Sending...
//                     </>
//                   ) : resendCooldown > 0 ? (
//                     <small>Resend in {formatTime(resendCooldown)}</small>
//                   ) : (
//                     <small>Didn't receive the code? Resend</small>
//                   )}
//                 </button>
//               </div>
              
//               <div className="text-center">
//                 <button
//                   type="button"
//                   className="btn btn-outline-secondary"
//                   onClick={goBackToEmail}
//                   disabled={loading.verifyingOtp}
//                 >
//                   <i className="fas fa-arrow-left me-2"></i>
//                   Back to Email
//                 </button>
//               </div>
//             </form>

//             <div className="text-center mt-4">
//               <small className="text-muted">
//                 Remember your password?{" "}
//                 <Link to="/login" className="text-decoration-none">
//                   Sign In
//                 </Link>
//               </small>
//             </div>
//           </div>
//         </div>
//       </ErrorBoundary>
//     );
//   }

//   // Email Input Step (Step 1)
//   return (
//     <ErrorBoundary>
//       <div className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
//         <div className="card shadow-lg p-4" style={{ maxWidth: "500px", width: "100%" }}>
//           <Toaster position="top-right" richColors closeButton />
//           <div className="text-center mb-4">
//             <div className="mb-3">
//               <div className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle" 
//                    style={{ width: "80px", height: "80px" }}>
//                 <i className="fas fa-envelope text-white" style={{ fontSize: "2rem" }}></i>
//               </div>
//             </div>
//             <h2 className="text-primary mb-3">Forgot Password?</h2>
//             <p className="text-muted">
//               Enter your email address and we'll send you a reset code
//             </p>
//           </div>

//           <form onSubmit={handleSendOTP}>
//             <div className="form-floating mb-4">
//               <input
//                 type="email"
//                 className="form-control"
//                 id="email"
//                 placeholder="Email Address"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 autoComplete="email"
//               />
//               <label htmlFor="email">Email Address</label>
//             </div>

//             <button
//               type="submit"
//               className="btn btn-primary w-100 mb-3 py-3"
//               disabled={loading.sendingOtp}
//               style={{ fontSize: "1.1rem", fontWeight: "600" }}
//             >
//               {loading.sendingOtp ? (
//                 <>
//                   <span className="spinner-border spinner-border-sm me-2" role="status"></span>
//                   Sending Reset Code...
//                 </>
//               ) : (
//                 <>
//                   <i className="fas fa-paper-plane me-2"></i>
//                   Send Reset Code
//                 </>
//               )}
//             </button>

//             <div className="text-center">
//               <small className="text-muted">
//                 Remember your password?{" "}
//                 <Link to="/login" className="text-decoration-none">
//                   Sign In
//                 </Link>
//               </small>
//             </div>
//           </form>

//           <div className="text-center mt-4">
//             <small className="text-muted">
//               Need an account?{" "}
//               <Link to="/register" className="text-decoration-none">
//                 Create Account
//               </Link>
//             </small>
//           </div>
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default ForgotPassword;








// File: src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { ErrorBoundary } from "../components/ErrorBoundary";

const backendUrl = import.meta.env.VITE_BACKEND_AUTH_URL;

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email Input, 2: OTP Verification
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [tempUserId, setTempUserId] = useState(""); // Store tempUserId from backend
  const [loading, setLoading] = useState({
    sendingOtp: false,
    verifyingOtp: false,
    resendingOtp: false
  });
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle email submission and send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(prev => ({ ...prev, sendingOtp: true }));

    try {
      const response = await axios.post(`${backendUrl}/api/auth/forgot-password`, {
        email: email.toLowerCase().trim()
      });

      if (response.data.success) {
        // Store tempUserId returned from backend
        setTempUserId(response.data.tempUserId);
        setStep(2); // Move to OTP verification step
        toast.success("Reset code sent to your email!");
        setResendCooldown(60); // Start cooldown timer
      }

    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to send reset code";
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, sendingOtp: false }));
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    setLoading(prev => ({ ...prev, verifyingOtp: true }));

    try {
      const response = await axios.post(`${backendUrl}/api/auth/verify-reset-otp`, {
        tempUserId,
        email: email.toLowerCase().trim(),
        otp: otp.trim()
      });

      if (response.data.success) {
        toast.success("Verification successful!");
        
        // Create a secure session token for navigation
        const resetToken = btoa(JSON.stringify({
          email: email.toLowerCase().trim(),
          tempUserId,
          verified: true,
          timestamp: Date.now(),
          expiry: Date.now() + (10 * 60 * 1000) // 10 minutes
        }));
        
        // Store in sessionStorage for navigation security
        sessionStorage.setItem('passwordResetToken', resetToken);
        
        // Navigate to reset password page
        setTimeout(() => {
          navigate('/reset-password', {
            replace: true // Prevent back navigation to OTP page
          });
        }, 1000);
      }

    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Verification failed";
      toast.error(errorMessage);
      
      // Clear OTP on error
      setOtp("");
    } finally {
      setLoading(prev => ({ ...prev, verifyingOtp: false }));
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setLoading(prev => ({ ...prev, resendingOtp: true }));

    try {
      const response = await axios.post(`${backendUrl}/api/auth/resend-reset-otp`, {
        tempUserId,
        email: email.toLowerCase().trim()
      });

      if (response.data.success) {
        toast.success("New reset code sent to your email!");
        setResendCooldown(60); // Reset cooldown
        setOtp(""); // Clear current OTP
      }
      
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.error || "Failed to resend verification code";
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, resendingOtp: false }));
    }
  };

  const goBackToEmail = () => {
    setStep(1);
    setOtp("");
    setTempUserId("");
    setResendCooldown(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cooldown timer effect
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      // Clear any sensitive data when component unmounts
      if (step === 1) {
        sessionStorage.removeItem('passwordResetToken');
      }
    };
  }, [step]);

  // OTP Verification Step (Step 2)
  if (step === 2) {
    return (
      <ErrorBoundary>
        <div className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
          <div className="card shadow-lg p-4" style={{ maxWidth: "500px", width: "100%" }}>
            <Toaster position="top-right" richColors closeButton />
            <div className="text-center mb-4">
              <div className="mb-3">
                <div className="d-inline-flex align-items-center justify-content-center bg-success rounded-circle" 
                     style={{ width: "80px", height: "80px" }}>
                  <i className="fas fa-shield-alt text-white" style={{ fontSize: "2rem" }}></i>
                </div>
              </div>
              <h2 className="text-primary mb-3">Verify Reset Code</h2>
              <p className="text-muted">
                We've sent a 6-digit verification code to<br />
                <strong className="text-dark">{email}</strong>
              </p>
              <small className="text-muted">
                Check your inbox and spam folder
              </small>
            </div>

            <form onSubmit={handleVerifyOTP}>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control text-center fw-bold"
                  id="otp"
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  style={{ 
                    letterSpacing: "0.5em", 
                    fontSize: "1.5rem",
                    height: "60px"
                  }}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  disabled={loading.verifyingOtp}
                />
                <label htmlFor="otp">Verification Code</label>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mb-3 py-3"
                disabled={loading.verifyingOtp || !otp || otp.length !== 6}
                style={{ fontSize: "1.1rem", fontWeight: "600" }}
              >
                {loading.verifyingOtp ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check me-2"></i>
                    Verify Code
                  </>
                )}
              </button>

              <div className="text-center mb-3">
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || loading.resendingOtp}
                  style={{ textDecoration: resendCooldown > 0 ? 'none' : 'underline' }}
                >
                  {loading.resendingOtp ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    <small>Resend in {formatTime(resendCooldown)}</small>
                  ) : (
                    <small>Didn't receive the code? Resend</small>
                  )}
                </button>
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={goBackToEmail}
                  disabled={loading.verifyingOtp}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Email
                </button>
              </div>
            </form>

            <div className="text-center mt-4">
              <small className="text-muted">
                Remember your password?{" "}
                <Link to="/login" className="text-decoration-none">
                  Sign In
                </Link>
              </small>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Email Input Step (Step 1)
  return (
    <ErrorBoundary>
      <div className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
        <div className="card shadow-lg p-4" style={{ maxWidth: "500px", width: "100%" }}>
          <Toaster position="top-right" richColors closeButton />
          <div className="text-center mb-4">
            <div className="mb-3">
              <div className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle" 
                   style={{ width: "80px", height: "80px" }}>
                <i className="fas fa-envelope text-white" style={{ fontSize: "2rem" }}></i>
              </div>
            </div>
            <h2 className="text-primary mb-3">Forgot Password?</h2>
            <p className="text-muted">
              Enter your email address and we'll send you a reset code
            </p>
          </div>

          <form onSubmit={handleSendOTP}>
            <div className="form-floating mb-4">
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <label htmlFor="email">Email Address</label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3 py-3"
              disabled={loading.sendingOtp}
              style={{ fontSize: "1.1rem", fontWeight: "600" }}
            >
              {loading.sendingOtp ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Sending Reset Code...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane me-2"></i>
                  Send Reset Code
                </>
              )}
            </button>

            <div className="text-center">
              <small className="text-muted">
                Remember your password?{" "}
                <Link to="/login" className="text-decoration-none">
                  Sign In
                </Link>
              </small>
            </div>
          </form>

          <div className="text-center mt-4">
            <small className="text-muted">
              Need an account?{" "}
              <Link to="/register" className="text-decoration-none">
                Create Account
              </Link>
            </small>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ForgotPassword;