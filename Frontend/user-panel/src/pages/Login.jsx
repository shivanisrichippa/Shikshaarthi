// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Toaster, toast } from "sonner";
// import tokenService from "../utils/tokenService";

// const backendUrl = import.meta.env.VITE_BACKEND_AUTH_URL;

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [validationErrors, setValidationErrors] = useState({});
//   const [showPassword, setShowPassword] = useState(false);
//   const [authChecking, setAuthChecking] = useState(true);
//   const navigate = useNavigate();

//   // Improved auth check with better error handling
//   useEffect(() => {
//     const checkExistingAuth = async () => {
//       try {
//         setAuthChecking(true);
//         console.log('Login: Checking existing authentication...');
        
//         // Check token service health first
//         const healthCheck = tokenService.healthCheck();
//         console.log('TokenService health:', healthCheck);
        
//         // Try to get auth with cache (less aggressive than before)
//         const authResult = await tokenService.getAuthWithCache();
        
//         if (authResult.success && authResult.user) {
//           console.log('Login: User already authenticated from', authResult.source || 'unknown source');
          
//           const userName = authResult.user?.fullName || 
//                           authResult.user?.firstName || 
//                           authResult.user?.email?.split('@')[0] || 'User';
          
//           // Show appropriate message based on source
//           const message = authResult.fromCache ? 
//             `Welcome back, ${userName}! (${authResult.source})` : 
//             `Welcome back, ${userName}!`;
          
//           toast.success(message);
          
//           // Start auto-refresh
//           tokenService.startAutoRefresh();
          
//           // Navigate with replace to prevent back button issues
//           navigate("/", { replace: true });
//           return;
//         } 
        
//         // Handle different types of auth failures
//         if (authResult.error) {
//           console.log('Login: Auth check failed:', authResult.error);
          
//           // Only clear tokens on explicit authentication failures, not network issues
//           const authFailureErrors = [
//             'Invalid refresh token',
//             'Token validation failed',
//             'User not found'
//           ];
          
//           if (authFailureErrors.includes(authResult.error)) {
//             console.log('Login: Clearing tokens due to auth failure');
//             tokenService.clearTokens();
//           } else {
//             console.log('Login: Keeping tokens due to network/temporary error');
//           }
//         }
        
//         console.log('Login: No valid authentication found, showing login form');
        
//       } catch (error) {
//         console.warn("Login: Auth check error:", error);
        
//         // Only clear tokens on authentication-related errors
//         if (error.message?.includes('401') || 
//             error.message?.includes('403') || 
//             error.message?.includes('Invalid token')) {
//           console.log('Login: Clearing tokens due to auth error');
//           tokenService.clearTokens();
//         } else {
//           console.log('Login: Keeping tokens due to network error');
//         }
//       } finally {
//         setAuthChecking(false);
//       }
//     };

//     // Add a small delay to prevent flash of login screen
//     const timer = setTimeout(checkExistingAuth, 100);
//     return () => clearTimeout(timer);
//   }, [navigate]);

//   // Listen for auth state changes from other tabs/components
//   useEffect(() => {
//     const handleAuthStateChange = (event) => {
//       const { isAuthenticated, user } = event.detail || {};
      
//       if (isAuthenticated && user && !authChecking) {
//         console.log('Login: Auth state changed in another context, redirecting...');
//         const userName = user?.fullName || user?.firstName || user?.email?.split('@')[0] || 'User';
//         toast.success(`Welcome back, ${userName}! (synced)`);
//         navigate("/", { replace: true });
//       }
//     };

//     window.addEventListener('authStateChanged', handleAuthStateChange);
    
//     return () => {
//       window.removeEventListener('authStateChanged', handleAuthStateChange);
//     };
//   }, [navigate, authChecking]);

//   // Handle page visibility changes (when user returns to tab)
//   useEffect(() => {
//     const handleVisibilityChange = async () => {
//       // Only check when page becomes visible and we're not already checking
//       if (!document.hidden && !authChecking && !loading) {
//         try {
//           console.log('Login: Page became visible, checking auth state...');
//           const authResult = await tokenService.getAuthWithCache();
          
//           if (authResult.success && authResult.user) {
//             console.log('Login: Found valid auth on visibility change');
//             navigate("/", { replace: true });
//           }
//         } catch (error) {
//           console.warn('Login: Visibility auth check failed:', error);
//           // Don't clear tokens on visibility check failures
//         }
//       }
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
    
//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//     };
//   }, [navigate, authChecking, loading]);

//   // Toggle password visibility
//   const togglePasswordVisibility = () => {
//     setShowPassword(prev => !prev);
//   };

//   // Real-time form validation
//   const validateField = (name, value) => {
//     const errors = { ...validationErrors };
    
//     switch (name) {
//       case 'email':
//         if (!value.trim()) {
//           errors.email = 'Email is required';
//         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
//           errors.email = 'Please enter a valid email address';
//         } else {
//           delete errors.email;
//         }
//         break;
        
//       case 'password':
//         if (!value) {
//           errors.password = 'Password is required';
//         } else if (value.length < 6) {
//           errors.password = 'Password must be at least 6 characters';
//         } else {
//           delete errors.password;
//         }
//         break;
        
//       default:
//         break;
//     }
    
//     setValidationErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
    
//     // Clear validation error when user starts typing
//     if (validationErrors[name]) {
//       validateField(name, value);
//     }
//   };

//   const handleBlur = (e) => {
//     const { name, value } = e.target;
//     validateField(name, value);
//   };

//   // Comprehensive form validation
//   const validateForm = () => {
//     const { email, password } = formData;
//     const errors = {};
    
//     // Email validation
//     if (!email.trim()) {
//       errors.email = 'Email is required';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       errors.email = 'Please enter a valid email address';
//     }
    
//     // Password validation
//     if (!password) {
//       errors.password = 'Password is required';
//     } else if (password.length < 6) {
//       errors.password = 'Password must be at least 6 characters';
//     }
    
//     setValidationErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   // Enhanced error handling
//   const getErrorMessage = (error) => {
//     if (!error) return "An unexpected error occurred";
    
//     // Network errors
//     if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
//       return "Unable to connect to server. Please check your internet connection.";
//     }
    
//     // Timeout errors
//     if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
//       return "Request timed out. Please try again.";
//     }
    
//     // HTTP errors
//     if (error.response) {
//       const status = error.response.status;
//       const message = error.response.data?.message;
      
//       switch (status) {
//         case 400:
//           return message || "Invalid login credentials provided.";
//         case 401:
//           return message || "Invalid email or password.";
//         case 403:
//           return message || "Account access is restricted.";
//         case 404:
//           return "Login service not found. Please contact support.";
//         case 429:
//           return message || "Too many login attempts. Please wait before trying again.";
//         case 500:
//         case 502:
//         case 503:
//         case 504:
//           return "Server is temporarily unavailable. Please try again later.";
//         default:
//           return message || `Server error (${status}). Please try again.`;
//       }
//     }
    
//     return error.message || "Login failed. Please try again.";
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
    
//     // Prevent double submission
//     if (loading) return;
    
//     // Validate form
//     if (!validateForm()) {
//       return;
//     }
    
//     setLoading(true);
//     const loadingToast = toast.loading("Signing you in...");

//     try {
//       console.log("Login: Attempting login for:", formData.email);

//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 30000);

//       try {
//         const { data } = await axios.post(
//           `${backendUrl}/api/auth/login`, 
//           {
//             email: formData.email.trim().toLowerCase(),
//             password: formData.password
//           }, 
//           {
//             signal: controller.signal,
//             timeout: 30000,
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             withCredentials: false
//           }
//         );
        
//         clearTimeout(timeoutId);
        
//         console.log("Login: Response received:", { 
//           hasToken: !!data.token, 
//           hasUser: !!data.user,
//           userName: data.user?.fullName || data.user?.email 
//         });
        
//         // Validate response data
//         if (!data || !data.token || !data.user) {
//           throw new Error("Invalid response from server - missing required data");
//         }
        
//         // Store authentication data using enhanced token service
//         const tokenStored = tokenService.setTokens(
//           data.token, 
//           data.user, 
//           data.refreshToken
//         );
        
//         if (!tokenStored) {
//           throw new Error("Failed to store authentication data");
//         }
        
//         console.log("Login: Successful - tokens stored with multi-layer storage");
        
//         // Start auto-refresh service
//         tokenService.startAutoRefresh();
        
//         // Clear form and validation errors
//         setFormData({ email: "", password: "" });
//         setValidationErrors({});
        
//         // Success notification
//         const userName = data.user?.fullName || data.user?.firstName || data.user?.email?.split('@')[0] || 'User';
//         toast.success(`Welcome back, ${userName}!`, { 
//           id: loadingToast,
//           duration: 2000
//         });
        
//         // Navigate after a brief delay
//         setTimeout(() => {
//           navigate("/", { replace: true });
//         }, 1000);
        
//       } catch (fetchError) {
//         clearTimeout(timeoutId);
//         throw fetchError;
//       }
      
//     } catch (error) {
//       console.error("Login: Error occurred:", error);
      
//       const errorMessage = getErrorMessage(error);
//       toast.error(errorMessage, { 
//         id: loadingToast,
//         duration: 5000
//       });
      
//       // Clear password on error (security best practice)
//       setFormData(prev => ({ ...prev, password: "" }));
      
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = () => {
//     navigate("/forgot-password");
//   };

//   const handleSignUpRedirect = () => {
//     navigate("/sign-up");
//   };


  

//   // Check if form is valid for submission
//   const isFormValid = () => {
//     const { email, password } = formData;
//     return email.trim() && 
//            password && 
//            Object.keys(validationErrors).length === 0 && 
//            !loading &&
//            !authChecking;
//   };

//   // Show loading spinner while checking auth
//   if (authChecking) {
//     return (
//       <div className="container-fluid d-flex justify-content-center align-items-center vh-100">
//         <div className="text-center">
//           <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <h5 className="text-muted">Checking authentication...</h5>
//           <small className="text-muted">Please wait while we verify your session</small>
//         </div>
//       </div>
//     );
//   }

  

//   return (
//     <div className="container-fluid d-flex justify-content-center align-items-center vh-100">
//       <Toaster 
//         position="top-right" 
//         richColors 
//         closeButton 
//         toastOptions={{
//           duration: 4000,
//           style: { fontSize: '14px' }
//         }}
//       />
//       <div className="container">
//         <div className="row justify-content-center">
//           <div className="col-md-6 col-lg-5">
//             <div className="border border-primary bg-light py-5 px-4 shadow-sm rounded text-center">
//               <small className="d-inline-block fw-bold text-dark text-uppercase border border-primary rounded-pill px-4 py-1 mb-3">
//                 Login
//               </small>
//               <h1 className="display-5 mb-4">Welcome Back</h1>
              
//               <div className="mb-3">
//                 <small className="text-muted">
//                   Please enter your credentials to continue
//                 </small>
//               </div>

//               <form className="row g-3" onSubmit={handleLogin} noValidate>
//                 <div className="col-12">
//                   <input
//                     type="email"
//                     name="email"
//                     className={`form-control border-primary p-2 text-dark ${validationErrors.email ? 'is-invalid' : ''}`}
//                     placeholder="Enter Your Email"
//                     value={formData.email}
//                     required
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     autoComplete="email"
//                     disabled={loading || authChecking}
//                     maxLength={254}
//                   />
//                   {validationErrors.email && (
//                     <div className="invalid-feedback text-start">
//                       {validationErrors.email}
//                     </div>
//                   )}
//                 </div>

//                 <div className="col-12">
//                   <div className="position-relative">
//                     <input
//                       type={showPassword ? "text" : "password"}
//                       name="password"
//                       className={`form-control border-primary p-2 text-dark pe-5 ${validationErrors.password ? 'is-invalid' : ''}`}
//                       placeholder="Password"
//                       value={formData.password}
//                       required
//                       onChange={handleChange}
//                       onBlur={handleBlur}
//                       autoComplete="current-password"
//                       disabled={loading || authChecking}
//                       maxLength={128}
//                     />
//                     <button
//                       type="button"
//                       className="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2 p-0 border-0"
//                       onClick={togglePasswordVisibility}
//                       disabled={loading || authChecking}
//                       style={{
//                         zIndex: 10,
//                         color: '#6c757d',
//                         background: 'transparent'
//                       }}
//                       aria-label={showPassword ? "Hide password" : "Show password"}
//                     >
//                       <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
//                     </button>
//                   </div>
//                   {validationErrors.password && (
//                     <div className="invalid-feedback text-start">
//                       {validationErrors.password}
//                     </div>
//                   )}
//                 </div>

//                 <div className="col-12 text-end">
//                   <button
//                     type="button"
//                     onClick={handleForgotPassword}
//                     className="btn btn-link text-primary fw-bold p-0 border-0 bg-transparent"
//                     disabled={loading || authChecking}
//                   >
//                     Forgot Password?
//                   </button>
//                 </div>

//                 <div className="col-12">
//                   <button
//                     type="submit"
//                     className="btn btn-primary px-5 py-3 rounded-pill w-100"
//                     disabled={!isFormValid()}
//                   >
//                     {loading ? (
//                       <>
//                         <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                         Signing In...
//                       </>
//                     ) : (
//                       <>
//                         <i className="fas fa-sign-in-alt me-2"></i>
//                         Login
//                       </>
//                     )}
//                   </button>
//                 </div>

//                 <div className="col-12">
//                   <p className="mb-0">
//                     Don't have an account?{" "}
//                     <button
//                       type="button"
//                       onClick={handleSignUpRedirect}
//                       className="btn btn-link text-primary fw-bold p-0 border-0 bg-transparent"
//                       disabled={loading || authChecking}
//                     >
//                       Sign Up
//                     </button>
//                   </p>
//                 </div>
//               </form>

//               <div className="mt-4">
//                 <small className="text-muted">
//                   <i className="fas fa-shield-alt me-1"></i>
//                   Your login is secured with encryption
//                 </small>
//               </div>

//               {/* Loading overlay for better UX */}
//               {loading && (
//                 <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75 rounded">
//                   <div className="text-center">
//                     <div className="spinner-border text-primary mb-2" role="status">
//                       <span className="visually-hidden">Loading...</span>
//                     </div>
//                     <div className="small text-muted">Authenticating...</div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;






import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import tokenService from "../utils/tokenService";

const backendUrl = import.meta.env.VITE_BACKEND_AUTH_URL;

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const navigate = useNavigate();

  // Handle successful login with redirect logic
  const handleSuccessfulLogin = (userData) => {
    // Check if there's a redirect path stored
    const redirectPath = sessionStorage.getItem('redirectAfterLogin');
    
    if (redirectPath) {
      // Clear the stored redirect path
      sessionStorage.removeItem('redirectAfterLogin');
      
      // Get user name for personalized message
      const userName = userData?.fullName || userData?.firstName || userData?.email?.split('@')[0] || 'User';
      
      // Show success message with redirect info
      const redirectDescription = redirectPath === '/add' ? 'Super Coins' : 
                                 redirectPath === '/profile' ? 'your profile' :
                                 redirectPath === '/dashboard' ? 'your dashboard' :
                                 `${redirectPath.replace('/', '')}`;
      
      toast.success(`Welcome back, ${userName}!`, {
        description: `Taking you to ${redirectDescription}...`,
        duration: 2000
      });
      
      // Redirect to the intended page
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);
    } else {
      // Default redirect (existing logic)
      const userName = userData?.fullName || userData?.firstName || userData?.email?.split('@')[0] || 'User';
      toast.success(`Welcome back, ${userName}!`, {
        duration: 2000
      });
      
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    }
  };

  // Improved auth check with better error handling
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        setAuthChecking(true);
        console.log('Login: Checking existing authentication...');
        
        // Check token service health first
        const healthCheck = tokenService.healthCheck();
        console.log('TokenService health:', healthCheck);
        
        // Try to get auth with cache (less aggressive than before)
        const authResult = await tokenService.getAuthWithCache();
        
        if (authResult.success && authResult.user) {
          console.log('Login: User already authenticated from', authResult.source || 'unknown source');
          
          // Use the redirect logic for already authenticated users
          handleSuccessfulLogin(authResult.user);
          return;
        } 
        
        // Handle different types of auth failures
        if (authResult.error) {
          console.log('Login: Auth check failed:', authResult.error);
          
          // Only clear tokens on explicit authentication failures, not network issues
          const authFailureErrors = [
            'Invalid refresh token',
            'Token validation failed',
            'User not found'
          ];
          
          if (authFailureErrors.includes(authResult.error)) {
            console.log('Login: Clearing tokens due to auth failure');
            tokenService.clearTokens();
          } else {
            console.log('Login: Keeping tokens due to network/temporary error');
          }
        }
        
        console.log('Login: No valid authentication found, showing login form');
        
      } catch (error) {
        console.warn("Login: Auth check error:", error);
        
        // Only clear tokens on authentication-related errors
        if (error.message?.includes('401') || 
            error.message?.includes('403') || 
            error.message?.includes('Invalid token')) {
          console.log('Login: Clearing tokens due to auth error');
          tokenService.clearTokens();
        } else {
          console.log('Login: Keeping tokens due to network error');
        }
      } finally {
        setAuthChecking(false);
      }
    };

    // Add a small delay to prevent flash of login screen
    const timer = setTimeout(checkExistingAuth, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Listen for auth state changes from other tabs/components
  useEffect(() => {
    const handleAuthStateChange = (event) => {
      const { isAuthenticated, user } = event.detail || {};
      
      if (isAuthenticated && user && !authChecking) {
        console.log('Login: Auth state changed in another context, redirecting...');
        // Use the redirect logic for auth state changes
        handleSuccessfulLogin(user);
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
      if (!document.hidden && !authChecking && !loading) {
        try {
          console.log('Login: Page became visible, checking auth state...');
          const authResult = await tokenService.getAuthWithCache();
          
          if (authResult.success && authResult.user) {
            console.log('Login: Found valid auth on visibility change');
            handleSuccessfulLogin(authResult.user);
          }
        } catch (error) {
          console.warn('Login: Visibility auth check failed:', error);
          // Don't clear tokens on visibility check failures
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate, authChecking, loading]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Real-time form validation
  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // Comprehensive form validation
  const validateForm = () => {
    const { email, password } = formData;
    const errors = {};
    
    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced error handling
  const getErrorMessage = (error) => {
    if (!error) return "An unexpected error occurred";
    
    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      return "Unable to connect to server. Please check your internet connection.";
    }
    
    // Timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return "Request timed out. Please try again.";
    }
    
    // HTTP errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;
      
      switch (status) {
        case 400:
          return message || "Invalid login credentials provided.";
        case 401:
          return message || "Invalid email or password.";
        case 403:
          return message || "Account access is restricted.";
        case 404:
          return "Login service not found. Please contact support.";
        case 429:
          return message || "Too many login attempts. Please wait before trying again.";
        case 500:
        case 502:
        case 503:
        case 504:
          return "Server is temporarily unavailable. Please try again later.";
        default:
          return message || `Server error (${status}). Please try again.`;
      }
    }
    
    return error.message || "Login failed. Please try again.";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    const loadingToast = toast.loading("Signing you in...");

    try {
      console.log("Login: Attempting login for:", formData.email);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const { data } = await axios.post(
          `${backendUrl}/api/auth/login`, 
          {
            email: formData.email.trim().toLowerCase(),
            password: formData.password
          }, 
          {
            signal: controller.signal,
            timeout: 30000,
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: false
          }
        );
        
        clearTimeout(timeoutId);
        
        console.log("Login: Response received:", { 
          hasToken: !!data.token, 
          hasUser: !!data.user,
          userName: data.user?.fullName || data.user?.email 
        });
        
        // Validate response data
        if (!data || !data.token || !data.user) {
          throw new Error("Invalid response from server - missing required data");
        }
        
        // Store authentication data using enhanced token service
        const tokenStored = tokenService.setTokens(
          data.token, 
          data.user, 
          data.refreshToken
        );
        
        if (!tokenStored) {
          throw new Error("Failed to store authentication data");
        }
        
        console.log("Login: Successful - tokens stored with multi-layer storage");
        
        // Start auto-refresh service
        tokenService.startAutoRefresh();
        
        // Clear form and validation errors
        setFormData({ email: "", password: "" });
        setValidationErrors({});
        
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        // Use the enhanced redirect logic
        handleSuccessfulLogin(data.user);
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
      
    } catch (error) {
      console.error("Login: Error occurred:", error);
      
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, { 
        id: loadingToast,
        duration: 5000
      });
      
      // Clear password on error (security best practice)
      setFormData(prev => ({ ...prev, password: "" }));
      
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleSignUpRedirect = () => {
    navigate("/sign-up");
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    const { email, password } = formData;
    return email.trim() && 
           password && 
           Object.keys(validationErrors).length === 0 && 
           !loading &&
           !authChecking;
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

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100">
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        toastOptions={{
          duration: 4000,
          style: { fontSize: '14px' }
        }}
      />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="border border-primary bg-light py-5 px-4 shadow-sm rounded text-center">
              <small className="d-inline-block fw-bold text-dark text-uppercase border border-primary rounded-pill px-4 py-1 mb-3">
                Login
              </small>
              <h1 className="display-5 mb-4">Welcome Back</h1>
              
              <div className="mb-3">
                <small className="text-muted">
                  Please enter your credentials to continue
                </small>
              </div>

              <form className="row g-3" onSubmit={handleLogin} noValidate>
                <div className="col-12">
                  <input
                    type="email"
                    name="email"
                    className={`form-control border-primary p-2 text-dark ${validationErrors.email ? 'is-invalid' : ''}`}
                    placeholder="Enter Your Email"
                    value={formData.email}
                    required
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="email"
                    disabled={loading || authChecking}
                    maxLength={254}
                  />
                  {validationErrors.email && (
                    <div className="invalid-feedback text-start">
                      {validationErrors.email}
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`form-control border-primary p-2 text-dark pe-5 ${validationErrors.password ? 'is-invalid' : ''}`}
                      placeholder="Password"
                      value={formData.password}
                      required
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="current-password"
                      disabled={loading || authChecking}
                      maxLength={128}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2 p-0 border-0"
                      onClick={togglePasswordVisibility}
                      disabled={loading || authChecking}
                      style={{
                        zIndex: 10,
                        color: '#6c757d',
                        background: 'transparent'
                      }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {validationErrors.password && (
                    <div className="invalid-feedback text-start">
                      {validationErrors.password}
                    </div>
                  )}
                </div>

                <div className="col-12 text-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="btn btn-link text-primary fw-bold p-0 border-0 bg-transparent"
                    disabled={loading || authChecking}
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary px-5 py-3 rounded-pill w-100"
                    disabled={!isFormValid()}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Login
                      </>
                    )}
                  </button>
                </div>

                <div className="col-12">
                  <p className="mb-0">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={handleSignUpRedirect}
                      className="btn btn-link text-primary fw-bold p-0 border-0 bg-transparent"
                      disabled={loading || authChecking}
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </form>

              <div className="mt-4">
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-1"></i>
                  Your login is secured with encryption
                </small>
              </div>

              {/* Loading overlay for better UX */}
              {loading && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75 rounded">
                  <div className="text-center">
                    <div className="spinner-border text-primary mb-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="small text-muted">Authenticating...</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;