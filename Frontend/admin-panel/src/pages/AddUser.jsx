import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AddUser = () => {
  const navigate = useNavigate();
  const initialFormData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact: '',
    collegeName: '',
    district: '',
    tehsil: '',
    pincode: '',
    role: 'user',
    subscriptionStatus: 'none',
    coins: 0,
    isActive: true,
    isVerified: false,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear specific error when user starts typing
    if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required.';
    else if (formData.fullName.trim().length < 3) errors.fullName = 'Full name must be at least 3 characters.';

    if (!formData.email.trim()) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format.';
    
    if (!formData.password) errors.password = 'Password is required.';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters.';
    
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    
    if (!formData.contact.trim()) errors.contact = 'Contact number is required.';
    else if (!/^\d{10}$/.test(formData.contact)) errors.contact = 'Contact number must be 10 digits.';

    if (!formData.collegeName.trim()) errors.collegeName = 'College name is required.';
    if (!formData.district.trim()) errors.district = 'District is required.';
    if (!formData.tehsil.trim()) errors.tehsil = 'Tehsil is required.';
    
    if (!formData.pincode.trim()) errors.pincode = 'Pincode is required.';
    else if (!/^\d{6}$/.test(formData.pincode)) errors.pincode = 'Pincode must be 6 digits.';

    if (formData.coins < 0) errors.coins = 'Coins cannot be negative.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        return;
    }
    setIsSubmitting(true);
    console.log('Submitting new user data:', formData);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // On successful API call:
      alert('User created successfully! (Simulated)');
      // In a real app, you might get the created user object back
      // and potentially add it to a global state or users list if needed.
      navigate('/admin/users'); // Navigate to the users list page
    } catch (error) {
      console.error("Error creating user:", error);
      alert('Failed to create user. Please try again. (Simulated)');
      // Handle API error (e.g., display error message to user)
      setFormErrors(prev => ({ ...prev, api: "Failed to create user. Email might already exist."}));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <h4 className="fw-bold py-3 mb-4">
        <span className="text-muted fw-light">Admin / Users /</span> Add New User
      </h4>

      <div className="row">
        <div className="col-xl">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Create New User Profile</h5>
              <Link to="/admin/users" className="btn btn-sm btn-outline-secondary">
                <i className="bx bx-arrow-back me-1"></i> Cancel
              </Link>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="fullName">Full Name</label>
                  <div className="input-group input-group-merge">
                    <span className="input-group-text"><i className="bx bx-user"></i></span>
                    <input
                      type="text"
                      className={`form-control ${formErrors.fullName ? 'is-invalid' : ''}`}
                      id="fullName"
                      name="fullName"
                      placeholder="e.g., Aarav Sharma"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    {formErrors.fullName && <div className="invalid-feedback">{formErrors.fullName}</div>}
                  </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="email">Email</label>
                  <div className="input-group input-group-merge">
                    <span className="input-group-text"><i className="bx bx-envelope"></i></span>
                    <input
                      type="email"
                      className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      placeholder="aarav.sharma@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                  </div>
                  <div className="form-text">User will use this email to log in.</div>
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="password">Password</label>
                  <div className="input-group input-group-merge">
                    <span className="input-group-text"><i className="bx bx-key"></i></span>
                    <input
                      type="password"
                      className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      placeholder="············"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-group input-group-merge">
                    <span className="input-group-text"><i className="bx bx-key"></i></span>
                    <input
                      type="password"
                      className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="············"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {formErrors.confirmPassword && <div className="invalid-feedback">{formErrors.confirmPassword}</div>}
                  </div>
                </div>

                {/* Contact Number */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="contact">Contact Number</label>
                  <div className="input-group input-group-merge">
                    <span className="input-group-text"><i className="bx bx-phone"></i></span>
                    <input
                      type="text"
                      className={`form-control ${formErrors.contact ? 'is-invalid' : ''}`}
                      id="contact"
                      name="contact"
                      placeholder="e.g., 9876543210"
                      value={formData.contact}
                      onChange={handleChange}
                      maxLength="10"
                    />
                     {formErrors.contact && <div className="invalid-feedback">{formErrors.contact}</div>}
                  </div>
                </div>

                {/* College Name */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="collegeName">College Name</label>
                  <div className="input-group input-group-merge">
                    <span className="input-group-text"><i className="bx bxs-institution"></i></span> {/* Or bx-buildings */}
                    <input
                      type="text"
                      className={`form-control ${formErrors.collegeName ? 'is-invalid' : ''}`}
                      id="collegeName"
                      name="collegeName"
                      placeholder="e.g., Indian Institute of Technology"
                      value={formData.collegeName}
                      onChange={handleChange}
                    />
                    {formErrors.collegeName && <div className="invalid-feedback">{formErrors.collegeName}</div>}
                  </div>
                </div>

                {/* District */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="district">District</label>
                  <div className="input-group input-group-merge">
                    <span className="input-group-text"><i className="bx bx-map-alt"></i></span>
                    <input
                      type="text"
                      className={`form-control ${formErrors.district ? 'is-invalid' : ''}`}
                      id="district"
                      name="district"
                      placeholder="e.g., Pune"
                      value={formData.district}
                      onChange={handleChange}
                    />
                    {formErrors.district && <div className="invalid-feedback">{formErrors.district}</div>}
                  </div>
                </div>

                {/* Tehsil */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="tehsil">Tehsil</label>
                  <div className="input-group input-group-merge">
                    <span className="input-group-text"><i className="bx bx-map"></i></span>
                    <input
                      type="text"
                      className={`form-control ${formErrors.tehsil ? 'is-invalid' : ''}`}
                      id="tehsil"
                      name="tehsil"
                      placeholder="e.g., Haveli"
                      value={formData.tehsil}
                      onChange={handleChange}
                    />
                    {formErrors.tehsil && <div className="invalid-feedback">{formErrors.tehsil}</div>}
                  </div>
                </div>

                {/* Pincode */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="pincode">Pincode</label>
                  <div className="input-group input-group-merge">
                    <span className="input-group-text"><i className="bx bx-map-pin"></i></span>
                    <input
                      type="text"
                      className={`form-control ${formErrors.pincode ? 'is-invalid' : ''}`}
                      id="pincode"
                      name="pincode"
                      placeholder="e.g., 411001"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength="6"
                    />
                    {formErrors.pincode && <div className="invalid-feedback">{formErrors.pincode}</div>}
                  </div>
                </div>
                
                <hr className="my-4" />
                <h6 className="mb-3 text-muted">Account Settings</h6>

                {/* Role */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="role">Role</label>
                  <div className="input-group input-group-merge">
                    <span className="input-group-text"><i className="bx bx-shield-quarter"></i></span>
                    <select 
                        id="role" 
                        name="role" 
                        className="form-select" 
                        value={formData.role} 
                        onChange={handleChange}
                    >
                      <option value="user">User</option>
                      <option value="provider">Provider</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Subscription Status */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="subscriptionStatus">Subscription Status</label>
                   <div className="input-group input-group-merge">
                    <span className="input-group-text"><i className="bx bx-purchase-tag-alt"></i></span>
                    <select 
                        id="subscriptionStatus" 
                        name="subscriptionStatus" 
                        className="form-select" 
                        value={formData.subscriptionStatus} 
                        onChange={handleChange}
                    >
                      <option value="none">None</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>

                {/* Initial Coins */}
                <div className="mb-3">
                  <label className="form-label" htmlFor="coins">Initial Coins</label>
                   <div className="input-group input-group-merge">
                    <span className="input-group-text"><i className="bx bx-coin-stack"></i></span>
                    <input
                      type="number"
                      className={`form-control ${formErrors.coins ? 'is-invalid' : ''}`}
                      id="coins"
                      name="coins"
                      min="0"
                      value={formData.coins}
                      onChange={handleChange}
                    />
                    {formErrors.coins && <div className="invalid-feedback">{formErrors.coins}</div>}
                  </div>
                </div>

                {/* Statuses */}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <div className="form-check mt-3">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="isActive"> Account Active </label>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-check mt-3">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                id="isVerified"
                                name="isVerified"
                                checked={formData.isVerified}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="isVerified"> Email Verified </label>
                        </div>
                    </div>
                </div>
                
                {formErrors.api && <div className="alert alert-danger mt-3">{formErrors.api}</div>}

                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Creating...</>
                  ) : (
                    <><i className="bx bx-user-plus me-1"></i> Create User</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;