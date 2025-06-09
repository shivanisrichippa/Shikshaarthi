

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import tokenService from "../utils/tokenService"; // Import the token service

const backendUrl = import.meta.env.VITE_BACKEND_AUTH_URL;

const Navbar = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const navigate = useNavigate();

  // Initialize authentication state with multi-layer storage support
  const initializeAuth = async () => {
    try {
      setAuthChecking(true);
      console.log("Navbar: Initializing auth state with multi-layer storage...");
      
      // Check token service health first
      const healthCheck = tokenService.healthCheck();
      console.log('Navbar: TokenService health:', healthCheck);
      
      // Try to get auth with cache (uses multi-layer storage)
      const authResult = await tokenService.getAuthWithCache();
      
      if (authResult.success && authResult.user) {
        console.log('Navbar: User authenticated from', authResult.source || 'token service');
        
        setIsAuthenticated(true);
        setUserInfo(authResult.user);
        
        // Start auto-refresh if not already running
        if (!healthCheck.autoRefreshActive) {
          tokenService.startAutoRefresh();
        }
        
        console.log('Navbar: Auth state initialized successfully');
      } else {
        console.log('Navbar: No valid authentication found:', authResult.error || 'Unknown error');
        setIsAuthenticated(false);
        setUserInfo(null);
        
        // Clear any invalid tokens
        if (authResult.error === 'Invalid refresh token' || authResult.error === 'Token validation failed') {
          tokenService.clearTokens();
        }
      }
    } catch (error) {
      console.error("Navbar: Auth initialization failed:", error);
      
      // Only clear tokens on authentication-related errors
      if (error.message?.includes('401') || 
          error.message?.includes('403') || 
          error.message?.includes('Invalid token')) {
        console.log('Navbar: Clearing tokens due to auth error');
        tokenService.clearTokens();
      }
      
      setIsAuthenticated(false);
      setUserInfo(null);
    } finally {
      setAuthChecking(false);
      setIsInitialized(true);
    }
  };

  // Initialize auth state once during component mount
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized]);

  // Set up event listeners after initialization
  useEffect(() => {
    if (!isInitialized) return;

    // Listen for custom auth state changes (from login/logout)
    const handleAuthChange = (event) => {
      console.log("Navbar: Auth state changed:", event.detail);
      const { isAuthenticated: newAuthState, user } = event.detail;
      
      if (newAuthState) {
        // Re-initialize auth state when login occurs
        setTimeout(async () => {
          try {
            const authResult = await tokenService.getAuthWithCache();
            if (authResult.success && authResult.user) {
              setIsAuthenticated(true);
              setUserInfo(authResult.user);
              console.log('Navbar: Synced with login state');
            }
          } catch (error) {
            console.warn('Navbar: Failed to sync with login state:', error);
          }
        }, 100);
      } else {
        // Clear state immediately on logout
        setIsAuthenticated(false);
        setUserInfo(null);
        console.log('Navbar: Synced with logout state');
      }
    };

    // Listen for storage changes (for updates across tabs)
    const handleStorageChange = (e) => {
      if (e.key === tokenService.tokenKey || e.key === tokenService.cacheKey) {
        if (!e.newValue) {
          // Token was removed in another tab
          console.log("Navbar: Token removed in another tab");
          setIsAuthenticated(false);
          setUserInfo(null);
        } else if (e.newValue !== e.oldValue) {
          // Token was added/updated in another tab
          console.log("Navbar: Token updated in another tab");
          setTimeout(async () => {
            try {
              const authResult = await tokenService.getAuthWithCache();
              if (authResult.success && authResult.user) {
                setIsAuthenticated(true);
                setUserInfo(authResult.user);
                console.log('Navbar: Synced with cross-tab auth update');
              }
            } catch (error) {
              console.warn('Navbar: Failed to sync cross-tab auth:', error);
            }
          }, 100);
        }
      }
    };

    // Handle page visibility changes (when user returns to tab)
    const handleVisibilityChange = async () => {
      if (!document.hidden && !authChecking) {
        try {
          console.log('Navbar: Page became visible, checking auth state...');
          const authResult = await tokenService.getAuthWithCache();
          
          if (authResult.success && authResult.user) {
            if (!isAuthenticated) {
              console.log('Navbar: Found valid auth on visibility change');
              setIsAuthenticated(true);
              setUserInfo(authResult.user);
            }
          } else if (isAuthenticated) {
            console.log('Navbar: Lost auth on visibility change');
            setIsAuthenticated(false);
            setUserInfo(null);
          }
        } catch (error) {
          console.warn('Navbar: Visibility auth check failed:', error);
        }
      }
    };

    // Add event listeners
    window.addEventListener("authStateChanged", handleAuthChange);
    window.addEventListener("storage", handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Periodic token validation (every 3 minutes)
    const intervalId = setInterval(async () => {
      if (!authChecking) {
        try {
          const authResult = await tokenService.getAuthWithCache();
          
          if (authResult.success && authResult.user) {
            if (!isAuthenticated) {
              console.log('Navbar: Periodic check found valid auth');
              setIsAuthenticated(true);
              setUserInfo(authResult.user);
            } else if (authResult.user && JSON.stringify(authResult.user) !== JSON.stringify(userInfo)) {
              // Update user info if changed
              setUserInfo(authResult.user);
            }
          } else if (isAuthenticated) {
            console.log('Navbar: Periodic check found invalid auth');
            setIsAuthenticated(false);
            setUserInfo(null);
            
            // Show session expired message only on auth failures, not network errors
            if (authResult.error === 'Invalid refresh token' || authResult.error === 'Token validation failed') {
              toast.info("Session expired. Please log in again.");
            }
          }
        } catch (error) {
          console.warn('Navbar: Periodic token check failed:', error);
          // Don't clear auth on network errors unless token is actually expired
          if (tokenService.isTokenExpired() && isAuthenticated) {
            setIsAuthenticated(false);
            setUserInfo(null);
            toast.info("Session expired. Please log in again.");
          }
        }
      }
    }, 180000); // Check every 3 minutes

    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [isAuthenticated, userInfo, isInitialized, authChecking]);

  // Dispatch custom event to notify other components
  const dispatchAuthChange = (isAuthenticated) => {
    try {
      window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: { 
          isAuthenticated, 
          timestamp: Date.now(),
          user: isAuthenticated ? userInfo : null
        }
      }));
    } catch (error) {
      console.warn('Navbar: Failed to dispatch auth change event:', error);
    }
  };

  const handleLogout = async () => {
    const token = tokenService.getToken();

    setLoading(true);
    setShowModal(false);

    // Show initial loading toast
    const loadingToast = toast.loading("Logging you out...");

    try {
      // Attempt to call backend logout endpoint
      if (backendUrl && token) {
        try {
          await axios.post(
            `${backendUrl}/api/auth/logout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              timeout: 10000,
            }
          );
          console.log("Navbar: Server logout successful");
        } catch (backendError) {
          console.warn("Navbar: Backend logout failed, proceeding with local cleanup:", backendError);
        }
      }

      // Always clear local storage and update state
      tokenService.clearTokens();
      tokenService.stopAutoRefresh();
      
      // Clear session storage as well
      try {
        sessionStorage.clear();
      } catch (error) {
        console.warn('Navbar: Failed to clear session storage:', error);
      }
      
      setIsAuthenticated(false);
      setUserInfo(null);

      // Dispatch custom event to notify other components
      dispatchAuthChange(false);

      console.log("Navbar: Logout completed successfully");
      toast.success("Logged out successfully!", { id: loadingToast });

      // Small delay to ensure toast is visible before navigation
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);

    } catch (error) {
      console.error("Navbar: Logout error:", error);
      
      // Force cleanup even on error
      tokenService.clearTokens();
      tokenService.stopAutoRefresh();
      
      try {
        sessionStorage.clear();
      } catch (clearError) {
        console.warn('Navbar: Failed to clear session storage on error:', clearError);
      }
      
      setIsAuthenticated(false);
      setUserInfo(null);
      
      // Dispatch custom event even on error
      dispatchAuthChange(false);
      
      toast.success("Logged out successfully", { id: loadingToast });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
      
    } finally {
      setLoading(false);
    }
  };

  // Handle login button click (when user is not authenticated)
  const handleLoginClick = () => {
    toast.info("Redirecting to login page...");
    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  // Handle signup button click
  const handleSignupClick = () => {
    toast.info("Redirecting to sign up page...");
    setTimeout(() => {
      navigate("/sign-up");
    }, 500);
  };

  // Handle Super Coins click - redirect to login if not authenticated
  const handleSuperCoinsClick = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Store the intended destination for redirect after login
      sessionStorage.setItem('redirectAfterLogin', '/add');
      toast.info("Please log in to access Super Coins");
      navigate('/login');
      return;
    }
    
    // User is authenticated, proceed to super coins page
    toast.info("Opening Super Coins...");
    setTimeout(() => {
      navigate("/add");
    }, 500);
  };

  // Handle My Account click - redirect to login if not authenticated
  const handleAccountClick = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Store the intended destination for redirect after login
      sessionStorage.setItem('redirectAfterLogin', '/account');
      toast.info("Please log in to access your account");
      navigate('/login');
      return;
    }
    
    // User is authenticated, proceed to account page
    toast.info("Opening your account...");
    setTimeout(() => {
      navigate("/account");
    }, 500);
  };

  // Handle logout button click - show modal if authenticated
  const handleLogoutClick = () => {
    if (isAuthenticated) {
      setShowModal(true);
      toast.info("Please confirm logout action");
    } else {
      toast.error("No active session found. Please log in first.", {
        action: {
          label: 'Login',
          onClick: () => navigate('/login')
        }
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    toast.info("Logout cancelled");
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
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscPress);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  // Handle navigation clicks with toast feedback
  const handleNavClick = (path, label) => {
    toast.info(`Navigating to ${label}...`);
  };

  // Debug: Log current authentication state (remove in production)
  useEffect(() => {
    if (isInitialized && !authChecking) {
      console.log("Navbar auth state:", { 
        isAuthenticated, 
        userInfo: userInfo?.email, 
        hasToken: !!tokenService.getToken(),
        tokenExpired: tokenService.isTokenExpired(),
        isInitialized,
        healthCheck: tokenService.healthCheck()
      });
    }
  }, [isAuthenticated, userInfo, isInitialized, authChecking]);

  // Show loading spinner while checking auth (similar to login component)
  if (authChecking) {
    return (
      <nav className="navbar navbar-expand-lg navbar-light py-4 bg-white shadow-sm">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <h1 className="text-primary fw-bold mb-0">
              Shiksha<span className="text-dark">rthi</span>
            </h1>
          </Link>
          
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <small className="text-muted">Checking session...</small>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light py-4 bg-white shadow-sm">
        <div className="container">
          {/* Brand Logo with same styling */}
          <Link 
            to="/" 
            className="navbar-brand"
            onClick={() => handleNavClick('/', 'Home')}
          >
            <h1 className="text-primary fw-bold mb-0">
              Shikshaa<span className="text-dark">rthi</span>
            </h1>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="navbar-toggler py-2 px-3"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            onClick={() => toast.info("Mobile menu toggled")}
          >
            <span className="fa fa-bars text-primary"></span>
          </button>

          {/* Navbar Links - Show all links normally */}
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <div className="navbar-nav mx-auto">
              <Link 
                to="/" 
                className="nav-item nav-link active"
                onClick={() => handleNavClick('/', 'Home')}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="nav-item nav-link"
                onClick={() => handleNavClick('/about', 'About')}
              >
                About
              </Link>
              <Link 
                to="/services" 
                className="nav-item nav-link"
                onClick={() => handleNavClick('/services', 'Services')}
              >
                Services
              </Link>
              
              
              {/* Super Coins Link - Normal appearance, but checks auth on click */}
              <a
                href="/add"
                className="nav-item nav-link"
                onClick={handleSuperCoinsClick}
                style={{ cursor: 'pointer' }}
              >
                Super coins
              </a>
              <Link 
                to="/history" 
                className="nav-item nav-link"
                onClick={() => handleNavClick('/history', 'History')}
              >
               Submissions
              </Link>
             
              <a
                href="/account"
                className="nav-item nav-link"
                onClick={handleAccountClick}
                style={{ cursor: 'pointer' }}
              >
                My Account
              </a>
            </div>

            {/* Search and Auth Buttons
            <button
              className="btn btn-primary btn-md-square me-4 rounded-circle d-none d-lg-inline-flex"
              data-bs-toggle="modal"
              data-bs-target="#searchModal"
              onClick={() => toast.info("Opening search...")}
            >
              <i className="fas fa-search"></i>
            </button> */}

            {/* Authentication Buttons - Show based on auth state */}
            <div className="d-flex gap-2">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={handleSignupClick}
                    className="btn btn-outline-primary py-2 px-4 d-none d-xl-inline-block rounded-pill"
                    disabled={authChecking}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={handleLoginClick}
                    className="btn btn-primary py-2 px-4 d-none d-xl-inline-block rounded-pill"
                    disabled={authChecking}
                  >
                    <i className="fas fa-sign-in-alt me-1"></i>
                    Login
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogoutClick}
                  className="btn btn-primary py-2 px-4 d-none d-xl-inline-block rounded-pill"
                  disabled={loading}
                  title={`Logout ${userInfo?.email || userInfo?.fullName || 'user'}`}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-out-alt me-1"></i>
                      Logout
                      {userInfo?.firstName && (
                        <small className="ms-1">({userInfo.firstName})</small>
                      )}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Modal */}
        <div
          className="modal fade"
          id="searchModal"
          tabIndex="-1"
          aria-labelledby="searchModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-fullscreen">
            <div className="modal-content rounded-0">
              <div className="modal-header">
                <h5 className="modal-title" id="searchModalLabel">
                  Search by keyword
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => toast.info("Search closed")}
                ></button>
              </div>
              <div className="modal-body d-flex align-items-center">
                <div className="input-group w-75 mx-auto">
                  <input
                    type="search"
                    className="form-control bg-transparent p-3"
                    placeholder="Enter keywords"
                    aria-describedby="search-icon"
                    onFocus={() => toast.info("Start typing to search...")}
                  />
                  <span id="search-icon" className="input-group-text p-3">
                    <i className="fa fa-search"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
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
                  <p className="mb-2 text-muted fs-6">
                    Are you sure you want to logout from your account?
                  </p>
                  {userInfo && (
                    <small className="text-muted d-block mb-2">
                      <strong>Account:</strong> {userInfo.email || userInfo.fullName}
                    </small>
                  )}
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

export default Navbar; 






