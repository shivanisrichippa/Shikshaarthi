import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { ErrorBoundary } from "../components/ErrorBoundary";

const backendUrl = import.meta.env.VITE_BACKEND_AUTH_URL;

const VerifyResetOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState({
    verifying: false,
    resending: false
  });
  const [resendCooldown, setResendCooldown] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from navigation state
  const { email, tempUserId, from } = location.state || {};

  // Redirect if accessed without proper data
  useEffect(() => {
    if (!email || !tempUserId) {
      toast.error("Invalid access. Please start the password reset process again.");
      navigate('/forgot-password');
    }
  }, [email, tempUserId, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    setLoading(prev => ({ ...prev, verifying: true }));

    try {
      const response = await axios.post(`${backendUrl}/api/auth/verify-reset-otp`, {
        tempUserId,
        email,
        otp: otp.trim()
      });

      if (response.data.success) {
        toast.success("Verification successful!");
        
        // Navigate to reset password page
        setTimeout(() => {
          navigate('/reset-password', {
            state: {
              email,
              tempUserId,
              verified: true
            }
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
      setLoading(prev => ({ ...prev, verifying: false }));
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setLoading(prev => ({ ...prev, resending: true }));

    try {
      const response = await axios.post(`${backendUrl}/api/auth/resend-reset-otp`, {
        tempUserId,
        email
      });

      if (response.data.success) {
        toast.success("New verification code sent!");
        setResendCooldown(60); // 1 minute cooldown
        setOtp(""); // Clear current OTP
      }
      
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.error || "Failed to resend verification code";
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, resending: false }));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render if we don't have required data
  if (!email || !tempUserId) {
    return null;
  }

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
                disabled={loading.verifying}
              />
              <label htmlFor="otp">Verification Code</label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3 py-3"
              disabled={loading.verifying || !otp || otp.length !== 6}
              style={{ fontSize: "1.1rem", fontWeight: "600" }}
            >
              {loading.verifying ? (
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
                disabled={resendCooldown > 0 || loading.resending}
                style={{ textDecoration: resendCooldown > 0 ? 'none' : 'underline' }}
              >
                {loading.resending ? (
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
                onClick={() => navigate('/forgot-password')}
                disabled={loading.verifying}
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
};

export default VerifyResetOTP;