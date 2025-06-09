// src/pages/Login.jsx - Enhanced with Sonner Toast UI
import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { toast } from 'sonner';

const AUTH_API_URL = import.meta.env.VITE_BACKEND_AUTH_URL || 'http://localhost:3001/api';

const Login = () => {
  const [email, setEmail] = useState('shivanisrichippa@gmail.com');
  const [password, setPassword] = useState('123456789');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdminContext } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs before proceeding
    if (!email.trim() || !password) {
      toast.error('Please fill in all fields', {
        description: 'Email and password are required to continue',
        duration: 4000,
      });
      return;
    }

    setLoading(true);

    // Show loading toast with promise-based approach
    const loginPromise = axios.post(`${AUTH_API_URL}/admin/login`, {
      email: email.trim().toLowerCase(),
      password,
    });

    toast.promise(loginPromise, {
      loading: 'Signing you in...',
      success: (response) => {
        const { user, token, refreshToken, message: successMessage } = response.data;

        if (user && user.role === 'admin' && token) {
          loginAdminContext(user, token, refreshToken);
          
          // Navigate with slight delay to show success message
          setTimeout(() => {
            const from = location.state?.from?.pathname || "/";
            navigate(from, { replace: true });
          }, 1000);

          return successMessage || `Welcome back, ${user.email}! 🎉`;
        } else {
          throw new Error('Login successful, but admin privileges are missing or token not received.');
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
        return `Authentication failed: ${message}`;
      },
      duration: 4000,
    });

    try {
      await loginPromise;
    } catch (err) {
      // Error is already handled by toast.promise
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '420px', 
        padding: '2.5rem', 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px', 
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div className="app-brand justify-content-center mb-4">
          <span className="app-brand-text demo text-body fw-bolder" 
                style={{fontSize: '2rem', color: '#667eea', textShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
            Shiksharthi Admin
          </span>
        </div>
        
        <h4 className="mb-2 text-center fw-normal" style={{color: '#4a5568'}}>
          Admin Portal Login
        </h4>
        <p className="mb-4 text-center text-muted small">
          Please sign-in to your account
        </p>

        <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-medium">Email</label>
            <input 
              type="email" 
              className="form-control" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required 
              autoFocus
              style={{
                borderRadius: '10px',
                border: '2px solid #e2e8f0',
                padding: '12px 16px',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          
          <div className="mb-3 form-password-toggle">
            <label className="form-label fw-medium" htmlFor="password">Password</label>
            <div className="input-group">
              <input 
                type={showPassword ? "text" : "password"}
                id="password" 
                className="form-control" 
                name="password"
                placeholder="············"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                style={{
                  borderRadius: '10px 0 0 10px',
                  border: '2px solid #e2e8f0',
                  padding: '12px 16px',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.nextElementSibling.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.nextElementSibling.style.borderColor = '#e2e8f0';
                }}
              />
              <span 
                className="input-group-text cursor-pointer" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  borderRadius: '0 10px 10px 0',
                  border: '2px solid #e2e8f0',
                  borderLeft: 'none',
                  background: '#f8fafc',
                  transition: 'all 0.3s ease',
                }}
              >
                <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`}></i>
              </span>
            </div>
          </div>
          
          <div className="mb-3">
            <button 
              className="btn d-grid w-100" 
              type="submit" 
              disabled={loading}
              style={{
                background: loading 
                  ? 'linear-gradient(135deg, #cbd5e0, #a0aec0)' 
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                color: 'white',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: loading 
                  ? 'none' 
                  : '0 4px 15px rgba(102, 126, 234, 0.4)',
                transform: loading ? 'none' : 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span className="ms-2">Signing In...</span>
                </>
              ) : (
                <>
                  <i className="bx bx-log-in me-2"></i>
                  Sign In
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center">
          <small className="text-muted" style={{
            background: 'rgba(102, 126, 234, 0.1)',
            padding: '8px 12px',
            borderRadius: '8px',
            display: 'inline-block'
          }}>
            💡 Default credentials pre-filled for testing
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;