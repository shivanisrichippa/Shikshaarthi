


import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { ErrorBoundary } from "../components/ErrorBoundary";
import OTPVerification from "../components/OTPVerification";
import tokenService from "../utils/tokenService";

const backendUrl = import.meta.env.VITE_BACKEND_AUTH_URL;

const SignUp = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    contact: "",
    collegeName: "",
    district: "",
    tehsil: "",
    pincode: ""
  });

  const [tempUserId, setTempUserId] = useState("");
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);
  const [districtTehsilsMap, setDistrictTehsilsMap] = useState({});
  const [collegesList, setCollegesList] = useState([]);
  const [loading, setLoading] = useState({
    districts: true,
    colleges: false,
    sendingOtp: false
  });
  const [showCollegesDropdown, setShowCollegesDropdown] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const collegeInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  // Enhanced authentication check using tokenService
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        setAuthChecking(true);
        console.log('SignUp: Checking existing authentication...');
        
        // Check token service health first
        const healthCheck = tokenService.healthCheck();
        console.log('TokenService health:', healthCheck);
        
        // Try to get auth with cache
        const authResult = await tokenService.getAuthWithCache();
        
        if (authResult.success && authResult.user) {
          console.log('SignUp: User already authenticated from', authResult.source || 'unknown source');
          
          // Get user name for personalized message
          const userName = authResult.user?.fullName || authResult.user?.firstName || authResult.user?.email?.split('@')[0] || 'User';
          
          toast.success(`Welcome back, ${userName}!`, {
            description: "You're already logged in",
            duration: 2000
          });
          
          // Redirect to home
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 1000);
          return;
        } 
        
        // Handle different types of auth failures
        if (authResult.error) {
          console.log('SignUp: Auth check failed:', authResult.error);
          
          // Only clear tokens on explicit authentication failures
          const authFailureErrors = [
            'Invalid refresh token',
            'Token validation failed',
            'User not found'
          ];
          
          if (authFailureErrors.includes(authResult.error)) {
            console.log('SignUp: Clearing tokens due to auth failure');
            tokenService.clearTokens();
          }
        }
        
        console.log('SignUp: No valid authentication found, showing signup form');
        
      } catch (error) {
        console.warn("SignUp: Auth check error:", error);
        
        // Only clear tokens on authentication-related errors
        if (error.message?.includes('401') || 
            error.message?.includes('403') || 
            error.message?.includes('Invalid token')) {
          console.log('SignUp: Clearing tokens due to auth error');
          tokenService.clearTokens();
        }
      } finally {
        setAuthChecking(false);
      }
    };

    // Add a small delay to prevent flash of signup screen
    const timer = setTimeout(checkExistingAuth, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Listen for auth state changes from other tabs/components
  useEffect(() => {
    const handleAuthStateChange = (event) => {
      const { isAuthenticated, user } = event.detail || {};
      
      if (isAuthenticated && user && !authChecking) {
        console.log('SignUp: Auth state changed in another context, redirecting...');
        const userName = user?.fullName || user?.firstName || user?.email?.split('@')[0] || 'User';
        
        toast.success(`Welcome back, ${userName}!`, {
          description: "You're already logged in",
          duration: 2000
        });
        
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1000);
      }
    };

    window.addEventListener('authStateChanged', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, [navigate, authChecking]);

  // Handle page visibility changes (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      // Only check when page becomes visible and we're not already checking
      if (!document.hidden && !authChecking && !loading.sendingOtp) {
        try {
          console.log('SignUp: Page became visible, checking auth state...');
          const authResult = await tokenService.getAuthWithCache();
          
          if (authResult.success && authResult.user) {
            console.log('SignUp: Found valid auth on visibility change');
            const userName = authResult.user?.fullName || authResult.user?.firstName || authResult.user?.email?.split('@')[0] || 'User';
            
            toast.success(`Welcome back, ${userName}!`, {
              description: "You're already logged in",
              duration: 2000
            });
            
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 1000);
          }
        } catch (error) {
          console.warn('SignUp: Visibility auth check failed:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate, authChecking, loading.sendingOtp]);

  // Click outside handler for college dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (collegeInputRef.current && !collegeInputRef.current.contains(e.target) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCollegesDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // District data fetch
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(
          "https://gist.githubusercontent.com/maheshwarLigade/f0ae609cf7e68480622c2acc20b06a7f/raw/Maharashtra-Districts-Tahasil-English.json"
        );
        const data = response.data;
        setDistricts(data.map((d) => d.name));
        setDistrictTehsilsMap(
          data.reduce((acc, curr) => {
            acc[curr.name] = curr.tahasil;
            return acc;
          }, {})
        );
      } catch (error) {
        console.error('Error fetching districts:', error);
        toast.error("Failed to load district data");
      } finally {
        setLoading((prev) => ({ ...prev, districts: false }));
      }
    };
    fetchDistricts();
  }, []);

  // College search effect
  useEffect(() => {
    const controller = new AbortController();
    const fetchColleges = async () => {
      if (formData.district && formData.collegeName.length > 1) {
        setLoading(prev => ({ ...prev, colleges: true }));
        try {
          const response = await axios.get(`${backendUrl}/api/colleges`, {
            params: {
              district: formData.district,
              college: formData.collegeName
            },
            signal: controller.signal,
            timeout: 10000
          });
          setCollegesList(response.data || []);
          setShowCollegesDropdown(true);
        } catch (error) {
          if (!axios.isCancel(error)) {
            console.error('Error fetching colleges:', error);
            toast.error("Couldn't load colleges for this area");
          }
        } finally {
          setLoading(prev => ({ ...prev, colleges: false }));
        }
      } else {
        setCollegesList([]);
        setShowCollegesDropdown(false);
      }
    };
    
    const debounceTimer = setTimeout(fetchColleges, 300);
    return () => {
      controller.abort();
      clearTimeout(debounceTimer);
    };
  }, [formData.district, formData.collegeName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "district") {
      setTehsils(districtTehsilsMap[value] || []);
      setFormData(prev => ({ 
        ...prev, 
        tehsil: "", 
        collegeName: "",
        pincode: ""
      }));
      setCollegesList([]);
      setShowCollegesDropdown(false);
    }
  };

  const handleCollegeSelect = (college) => {
    setFormData(prev => ({ ...prev, collegeName: college }));
    setShowCollegesDropdown(false);
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'email', 'password', 'contact', 'collegeName', 'district', 'tehsil', 'pincode'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields`);
      return false;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    // Contact validation
    const cleanContact = formData.contact.replace(/\D/g, "");
    if (cleanContact.length !== 10) {
      toast.error("Please enter a valid 10-digit contact number");
      return false;
    }

    // Pincode validation
    const cleanPincode = formData.pincode.replace(/\D/g, "");
    if (cleanPincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }

    return true;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading.sendingOtp) return;
    
    if (!validateForm()) return;

    setLoading(prev => ({ ...prev, sendingOtp: true }));
    const loadingToast = toast.loading("Sending verification code...");

    try {
      console.log("SignUp: Sending OTP for:", formData.email);

      // First check if email is available
      const emailCheck = await axios.post(`${backendUrl}/api/auth/check-email`, {
        email: formData.email.toLowerCase().trim(),
      });

      if (!emailCheck.data?.success) {
        throw new Error(emailCheck.data?.message || "Email is already registered");
      }

      // Validate college
      const collegeValidation = await axios.post(`${backendUrl}/api/auth/validate-college`, {
        collegeName: formData.collegeName.trim(),
        district: formData.district.trim()
      });

      if (!collegeValidation.data.valid) {
        if (!window.confirm("This college is not in our verified list. Continue anyway?")) {
          toast.dismiss(loadingToast);
          return;
        }
      }

      // Send OTP
      const response = await axios.post(`${backendUrl}/api/auth/send-otp`, {
        email: formData.email.toLowerCase().trim(),
        formData: {
          ...formData,
          contact: formData.contact.replace(/\D/g, ""),
          pincode: formData.pincode.replace(/\D/g, ""),
        }
      });

      if (response.data.tempUserId) {
        setTempUserId(response.data.tempUserId);
        setStep(2);
        toast.success("Verification code sent to your email!", { id: loadingToast });
      } else {
        throw new Error("Failed to send verification code");
      }

    } catch (error) {
      console.error("SignUp: OTP send error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to send verification code";
      toast.error(errorMessage, { id: loadingToast, duration: 5000 });
    } finally {
      setLoading(prev => ({ ...prev, sendingOtp: false }));
    }
  };

  // Enhanced success handler using tokenService
  const handleOTPVerificationSuccess = (token, user, refreshToken = null) => {
    try {
      console.log("SignUp: OTP verification successful, storing tokens...");
      
      // Use tokenService to store tokens with multi-layer storage
      const tokenStored = tokenService.setTokens(token, user, refreshToken);
      
      if (!tokenStored) {
        throw new Error("Failed to store authentication data");
      }
      
      console.log("SignUp: Tokens stored successfully with multi-layer storage");
      
      // Start auto-refresh service
      tokenService.startAutoRefresh();
      
      // Get user name for personalized message
      const userName = user?.fullName || user?.firstName || user?.email?.split('@')[0] || 'User';
      
      toast.success(`Welcome to our platform, ${userName}!`, {
        description: "Registration completed successfully",
        duration: 3000
      });
      
      // Navigate to home after successful registration
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
      
    } catch (error) {
      console.error("SignUp: Error in success handler:", error);
      toast.error("Registration completed but login failed. Please try logging in manually.");
      
      // Fallback to login page
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    }
  };

  const goBackToForm = () => {
    setStep(1);
    setTempUserId("");
  };

  // Show loading spinner while checking auth
  if (authChecking) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Checking authentication...</h5>
          <small className="text-muted">Please wait while we verify your session</small>
        </div>
      </div>
    );
  }

  // OTP Verification Step
  if (step === 2) {
    return (
      <OTPVerification
        email={formData.email}
        tempUserId={tempUserId}
        onSuccess={handleOTPVerificationSuccess}
        onBack={goBackToForm}
        type="registration"
      />
    );
  }

  // Main Registration Form
  return (
    <ErrorBoundary>
      <div className="container min-vh-100 d-flex align-items-center justify-content-center py-4">
        <div className="card shadow-lg p-4" style={{ maxWidth: "600px", width: "100%" }}>
          <Toaster 
            position="top-right" 
            richColors 
            closeButton 
            toastOptions={{
              duration: 4000,
              style: { fontSize: '14px' }
            }}
          />
          <h2 className="text-center mb-4 text-primary">Student Registration</h2>

          <form onSubmit={handleSendOTP}>
            <div className="row g-3">
              {/* Personal Info */}
              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    name="fullName"
                    placeholder="Full Name"
                    required
                    minLength={3}
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={loading.sendingOtp || authChecking}
                  />
                  <label htmlFor="fullName">Full Name</label>
                </div>

                <div className="form-floating mt-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading.sendingOtp || authChecking}
                  />
                  <label htmlFor="email">Email Address</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading.sendingOtp || authChecking}
                  />
                  <label htmlFor="password">Password (min 6 characters)</label>
                </div>

                <div className="form-floating mt-3">
                  <input
                    type="tel"
                    className="form-control"
                    id="contact"
                    name="contact"
                    placeholder="Contact"
                    required
                    pattern="[0-9]{10}"
                    value={formData.contact}
                    onChange={handleChange}
                    disabled={loading.sendingOtp || authChecking}
                  />
                  <label htmlFor="contact">Contact Number (10 digits)</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    className="form-select"
                    id="district"
                    name="district"
                    required
                    value={formData.district}
                    onChange={handleChange}
                    disabled={loading.districts || loading.sendingOtp || authChecking}
                  >
                    <option value="">{loading.districts ? "Loading..." : "Select District"}</option>
                    {districts.map((district, idx) => (
                      <option key={idx} value={district}>{district}</option>
                    ))}
                  </select>
                  <label htmlFor="district">District</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    className="form-select"
                    id="tehsil"
                    name="tehsil"
                    required
                    value={formData.tehsil}
                    onChange={handleChange}
                    disabled={!formData.district || loading.sendingOtp || authChecking}
                  >
                    <option value="">Select Tehsil</option>
                    {tehsils.map((tehsil, idx) => (
                      <option key={idx} value={tehsil}>{tehsil}</option>
                    ))}
                  </select>
                  <label htmlFor="tehsil">Tehsil</label>
                </div>
              </div>

              {/* College Search */}
              <div className="col-md-12 position-relative" ref={collegeInputRef}>
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="collegeName"
                    name="collegeName"
                    placeholder="Search College"
                    required
                    value={formData.collegeName}
                    onChange={handleChange}
                    disabled={loading.colleges || loading.sendingOtp || authChecking}
                    autoComplete="off"
                    onFocus={() => collegesList.length > 0 && setShowCollegesDropdown(true)}
                  />
                  <label htmlFor="collegeName">
                    {loading.colleges ? "Searching colleges..." : "Search College"}
                  </label>
                </div>

                {showCollegesDropdown && (
                  <div 
                    ref={dropdownRef}
                    className="position-absolute w-100 bg-white border rounded mt-1 shadow-lg"
                    style={{ 
                      zIndex: 1000, 
                      maxHeight: "250px", 
                      overflowY: "auto",
                      top: "100%",
                      left: 0
                    }}
                  >
                    {collegesList.length > 0 ? (
                      collegesList.map((college, index) => (
                        <div
                          key={index}
                          className="list-group-item list-group-item-action py-2 px-3 hover-bg-light"
                          onClick={() => handleCollegeSelect(college)}
                          style={{ cursor: "pointer" }}
                        >
                          {college}
                        </div>
                      ))
                    ) : (
                      <div className="list-group-item py-2 px-3 text-muted">
                        {loading.colleges ? "Searching..." : "No colleges found"}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="col-md-12">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control"
                    id="pincode"
                    name="pincode"
                    placeholder="Pincode"
                    required
                    pattern="[0-9]{6}"
                    value={formData.pincode}
                    onChange={handleChange}
                    disabled={loading.sendingOtp || authChecking}
                  />
                  <label htmlFor="pincode">6-digit college pincode</label>
                </div>
              </div>

              <div className="col-12 text-center mt-4">
                <button 
                  className="btn btn-success w-100 py-3 bg-primary border-primary" 
                  type="submit" 
                  disabled={loading.sendingOtp || authChecking}
                  style={{ fontSize: "1.1rem", fontWeight: "600" }}
                >
                  {loading.sendingOtp ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Sending verification code...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Send Verification Code
                    </>
                  )}
                </button>
              </div>

              <div className="col-12 text-center mt-3">
                <small className="text-muted">
                  Already have an account? <Link to="/login" className="text-decoration-none">Login here</Link>
                </small>
              </div>
            </div>
          </form>

          <div className="mt-4 text-center">
            <small className="text-muted">
              <i className="fas fa-shield-alt me-1"></i>
              Your data is secured with encryption
            </small>
          </div>

          {/* Loading overlay for better UX */}
          {loading.sendingOtp && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75 rounded">
              <div className="text-center">
                <div className="spinner-border text-primary mb-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div className="small text-muted">Sending verification code...</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SignUp;