// src/pages/AddAdmin.jsx - Enhanced with Sonner Toast Notifications
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const AUTH_API_URL = import.meta.env.VITE_BACKEND_AUTH_URL || 'http://localhost:3001/api';

const AddAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors', {
        description: 'Check all required fields and validation messages',
        duration: 4000,
      });
      return;
    }
    
    setIsSubmitting(true);
    setFormErrors({});

    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Authentication required', {
        description: 'Redirecting to login page...',
        duration: 3000,
      });
      navigate('/admin/login');
      return;
    }

    const adminDataToSubmit = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    // Use toast.promise for the API call
    const createAdminPromise = axios.post(`${AUTH_API_URL}/admin/create`, adminDataToSubmit, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    toast.promise(createAdminPromise, {
      loading: 'Creating new admin account...',
      success: (response) => {
        // Reset form on success
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
        });

        // Navigate after a short delay to show the success message
        setTimeout(() => {
          navigate('/');
        }, 1500);

        return {
          title: '✅ Admin account created successfully!',
          description: `New admin: ${adminDataToSubmit.email}`,
        };
      },
      error: (error) => {
        console.error('Create admin error:', error);
        const message = error.response?.data?.message || "Failed to create admin. Please try again.";
        
        if (error.response?.status === 401) {
          // Token expired or invalid
          setTimeout(() => {
            navigate('/admin/login');
          }, 2000);
          return {
            title: 'Authentication Error',
            description: 'Your session has expired. Redirecting to login...',
          };
        } else {
          setFormErrors({ api: message });
          return {
            title: 'Failed to create admin',
            description: message,
          };
        }
      },
      duration: 4000,
    });

    try {
      await createAdminPromise;
    } catch (error) {
      // Error is already handled by toast.promise
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="d-flex justify-content-between align-items-center py-3 mb-4">
        <h4 className="fw-bold mb-0">
          <span className="text-muted fw-light">Admin /</span> Add New Admin
        </h4>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb breadcrumb-style1 mb-0">
            <li className="breadcrumb-item">
              <Link to="/admin/dashboard">Dashboard</Link>
            </li>
            <li className="breadcrumb-item active">Add Admin</li>
          </ol>
        </nav>
      </div>

      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-10 col-md-12">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bx bx-user-plus me-2"></i>
                Create New Administrator
              </h5>
              <Link to="/admin/dashboard" className="btn btn-sm btn-outline-secondary">
                <i className="bx bx-arrow-back me-1"></i>
                Back to Dashboard
              </Link>
            </div>
            
            <div className="card-body">
              {formErrors.api && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bx bx-error-circle me-2"></i>
                  {formErrors.api}
                  <button type="button" className="btn-close" onClick={() => setFormErrors(prev => ({ ...prev, api: '' }))}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label fw-medium" htmlFor="email">
                        <i className="bx bx-envelope me-1"></i>
                        Admin Email Address
                      </label>
                      <input 
                        type="email" 
                        className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                        id="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        placeholder="Enter admin email address"
                        autoComplete="email"
                      />
                      {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium" htmlFor="password">
                        <i className="bx bx-lock-alt me-1"></i>
                        Password
                      </label>
                      <div className="input-group">
                        <input 
                          type={showPassword ? "text" : "password"}
                          className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                          id="password" 
                          name="password" 
                          value={formData.password} 
                          onChange={handleChange}
                          placeholder="Enter secure password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`}></i>
                        </button>
                        {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
                      </div>
                      <div className="form-text">
                        <small>Password must be at least 8 characters with uppercase, lowercase, and number.</small>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-4">
                      <label className="form-label fw-medium" htmlFor="confirmPassword">
                        <i className="bx bx-lock me-1"></i>
                        Confirm Password
                      </label>
                      <div className="input-group">
                        <input 
                          type={showConfirmPassword ? "text" : "password"}
                          className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                          id="confirmPassword" 
                          name="confirmPassword" 
                          value={formData.confirmPassword} 
                          onChange={handleChange}
                          placeholder="Confirm password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <i className={`bx ${showConfirmPassword ? 'bx-hide' : 'bx-show'}`}></i>
                        </button>
                        {formErrors.confirmPassword && <div className="invalid-feedback">{formErrors.confirmPassword}</div>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Link to="/admin/dashboard" className="btn btn-outline-secondary">
                    <i className="bx bx-x me-1"></i>
                    Cancel
                  </Link>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating Admin...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-user-plus me-1"></i>
                        Create Admin Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Help Card */}
          <div className="card mt-4">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bx bx-info-circle me-2 text-info"></i>
                Important Notes
              </h6>
              <ul className="mb-0 text-muted small">
                <li>New admin accounts will have full administrative privileges</li>
                <li>Admin users can create additional admin accounts</li>
                <li>Ensure email addresses are valid as they will be used for account recovery</li>
                <li>Passwords should be strong and secure</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdmin;