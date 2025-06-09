import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const backendUrl = import.meta.env.VITE_BACKEND_AUTH_URL;

const LogOut = ({ className = "btn btn-outline-danger", children = "Logout" }) => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };

    checkAuthStatus();

    // Listen for storage changes (for real-time updates across tabs)
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        setIsAuthenticated(!!e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically for token validity (optional)
    const intervalId = setInterval(checkAuthStatus, 5000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Validate token format (basic JWT validation)
  const isValidTokenFormat = (token) => {
    if (!token) return false;
    const parts = token.split('.');
    return parts.length === 3;
  };

  // Check if token is expired (basic check)
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp && payload.exp < currentTime;
    } catch (error) {
      return true; // If we can't parse, consider it expired
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    // Handle case where user is not logged in
    if (!token) {
      toast.error("You are not logged in. Please create an account or sign in first.", {
        action: {
          label: 'Sign Up',
          onClick: () => navigate('/sign-up')
        }
      });
      return;
    }

    // Check token format
    if (!isValidTokenFormat(token)) {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      toast.error("Invalid session. Please log in again.");
      navigate("/login");
      return;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      toast.error("Your session has expired. Please log in again.");
      navigate("/login");
      return;
    }

    setLoading(true);
    setShowModal(false);

    try {
      // Attempt to call backend logout endpoint
      const logoutPromise = axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );

      // Set a timeout for the logout request
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 8000)
      );

      try {
        await Promise.race([logoutPromise, timeoutPromise]);
      } catch (backendError) {
        console.warn("Backend logout failed, proceeding with local cleanup:", backendError);
        // Continue with local cleanup even if backend fails
      }

      // Always clear local storage and update state
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      
      // Clear any other user-related data if exists
      localStorage.removeItem("user");
      localStorage.removeItem("userPreferences");
      
      // Clear session storage as well
      sessionStorage.clear();

      // Show success message
      toast.success("Successfully logged out!");

      // Small delay to ensure toast is visible before navigation
      setTimeout(() => {
        navigate("/login");
      }, 500);

    } catch (error) {
      console.error("Logout error:", error);
      
      // Force cleanup even on error
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userPreferences");
      sessionStorage.clear();
      setIsAuthenticated(false);
      
      // Handle different error scenarios
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        toast.success("Logged out successfully (offline mode)");
      } else if (error.response?.status === 401) {
        toast.success("Session ended - logged out successfully");
      } else if (error.message === 'Request timeout') {
        toast.success("Logged out successfully (server response delayed)");
      } else {
        toast.success("Logged out successfully");
      }

      setTimeout(() => {
        navigate("/login");
      }, 500);
      
    } finally {
      setLoading(false);
    }
  };

  // Handle case where user clicks logout but isn't authenticated
  const handleUnauthenticatedClick = () => {
    toast.error("No active session found. Please create an account to get started.", {
      duration: 4000,
      action: {
        label: 'Create Account',
        onClick: () => navigate('/sign-up')
      }
    });
  };

  // Handle button click - show modal if authenticated
  const handleButtonClick = () => {
    if (isAuthenticated) {
      setShowModal(true);
    } else {
      handleUnauthenticatedClick();
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscPress = (e) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscPress);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscPress);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  return (
    <>
      <button
        onClick={handleButtonClick}
        className={className}
        disabled={loading}
        title={isAuthenticated ? "Logout from your account" : "No active session"}
      >
        {loading ? "Logging out..." : children}
      </button>

      {/* Logout Confirmation Modal */}
      {showModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleBackdropClick}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-2">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="bi bi-box-arrow-right me-2 text-warning"></i>
                  Confirm Logout
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  disabled={loading}
                ></button>
              </div>
              
              <div className="modal-body py-4">
                <div className="text-center">
                  <div className="mb-3">
                    <i className="bi bi-question-circle-fill text-warning" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <p className="mb-0 text-muted fs-6">
                    Are you sure you want to logout from your account?
                  </p>
                  <small className="text-muted">
                    You'll need to login again to access your dashboard.
                  </small>
                </div>
              </div>
              
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary px-4 py-2"
                  onClick={closeModal}
                  disabled={loading}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4 py-2"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-right me-1"></i>
                      Yes, Logout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bootstrap Icons CDN if not already included */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css"
      />
    </>
  );
};

export default LogOut;


