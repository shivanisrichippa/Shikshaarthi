

import React, { useState, useEffect } from "react";
import { FaUpload, FaSpinner } from "react-icons/fa";
import { submitServiceDataApi } from "../services/api"; // Adjust path
import { Toaster, toast } from "sonner";

const AddMedical = () => {
  const initialFormFields = {
    name: "",
    type: "",
    address: "",
    area: "",
    landmark: "",
    pincode: "",
    district: "",
    state: "",
    services: "",
    facilities: "",
    specialization: "",
    website: "",
    contactPerson: "",
    mobile: "",
    alternateMobile: "",
    email: "",
    operatingHours: { open: "", close: "" },
    paymentMethods: [],
    specializedServices: [],
  };
  
  const initialImages = Array(5).fill(null);
  const imageLabels = [
    "Outside Image 1 (Hospital/Clinic/Medical Store)",
    "Outside Image 2 (Hospital/Clinic/Medical Store)", 
    "Inside View 1 (Hospital/Clinic/Medical Store)",
    "Inside View 2 (Hospital/Clinic/Medical Store)",
    "Visiting Card or Information Board"
  ];

  const [formFields, setFormFields] = useState(initialFormFields);
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStage, setSubmissionStage] = useState(""); // 'preparing', 'uploading', 'processing'

  const serviceType = "medical";
  const paymentOptions = ["Cash", "Card", "UPI", "Insurance"];
  const serviceOptions = ["Ambulance", "ICU", "Home Delivery", "Online Consultation", "Pharmacy"];

  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image?.preview) URL.revokeObjectURL(image.preview);
      });
    };
  }, [images]);

  const handleChange = (e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  };

  const handleOperatingHoursChange = (e) => {
    setFormFields({
      ...formFields,
      operatingHours: { ...formFields.operatingHours, [e.target.name]: e.target.value }, // Updates NESTED
    });
  };
  const handleCheckboxChange = (e, category) => {
    const { value, checked } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [category]: checked
        ? [...prev[category], value]
        : prev[category].filter((item) => item !== value),
    }));
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large! Maximum 5MB allowed.", {
          duration: 4000
        });
        e.target.value = null;
        return;
      }
      const newImages = [...images];
      if (newImages[index]?.preview) URL.revokeObjectURL(newImages[index].preview);
      newImages[index] = { file, preview: URL.createObjectURL(file) };
      setImages(newImages);
      
      // Show success toast for successful image upload
      toast.success(`${imageLabels[index] || `Image ${index + 1}`} uploaded successfully!`, {
        duration: 3000
      });
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    if (newImages[index]?.preview) URL.revokeObjectURL(newImages[index].preview);
    newImages[index] = null;
    setImages(newImages);
    
    // Show info toast for image removal
    toast.info(`${imageLabels[index] || `Image ${index + 1}`} removed`, {
      duration: 2000
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    setLoading(true);
    setSubmissionStage("preparing");

    // Show loading toast
    const loadingToast = toast.loading("Preparing your medical facility submission...", {
      duration: Infinity
    });

    const imageFilesToUpload = images.filter(img => img?.file).map(img => img.file);

    if (imageFilesToUpload.length < 3) {
      toast.error("Please upload at least 3 images of the medical facility as per guidelines.", {
        id: loadingToast,
        duration: 5000
      });
      setLoading(false);
      setSubmissionStage("");
      return;
    }

    // Validate required fields
    const requiredFields = ['name', 'type', 'address', 'pincode', 'district', 'state', 'mobile'];
    const missingFields = requiredFields.filter(field => !formFields[field]?.trim());
    
    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields", {
        id: loadingToast,
        duration: 5000
      });
      setLoading(false);
      setSubmissionStage("");
      return;
    }

    // Validate mobile number
    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobilePattern.test(formFields.mobile)) {
      toast.error("Please enter a valid 10-digit mobile number starting with 6-9", {
        id: loadingToast,
        duration: 5000
      });
      setLoading(false);
      setSubmissionStage("");
      return;
    }

    // Validate pincode
    const pincodePattern = /^\d{6}$/;
    if (!pincodePattern.test(formFields.pincode)) {
      toast.error("Please enter a valid 6-digit pincode", {
        id: loadingToast,
        duration: 5000
      });
      setLoading(false);
      setSubmissionStage("");
      return;
    }

    // Validate email if provided
    if (formFields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formFields.email)) {
      toast.error("Please enter a valid email address", {
        id: loadingToast,
        duration: 5000
      });
      setLoading(false);
      setSubmissionStage("");
      return;
    }

    const dataPayload = { ...formFields };

    try {
      await submitServiceDataApi(
        serviceType,
        dataPayload,
        imageFilesToUpload,
        (progress) => { // onUploadProgress callback
          setSubmissionProgress(progress);
          setSubmissionStage("uploading");
          toast.loading(`Uploading images... ${progress}%`, {
            id: loadingToast
          });
        },
        () => { // onProcessing callback
          setSubmissionStage("processing");
          toast.loading("Processing your submission on the server...", {
            id: loadingToast
          });
        }
      );

      // Success toast
      toast.success("Medical facility submission successful!", {
        id: loadingToast,
        description: "Awaiting verification. You'll get coins and a chance to spin the wheel upon approval!",
        duration: 8000
      });

      // Reset form on success
      setFormFields(initialFormFields);
      setImages(Array(5).fill(null));
      
    } catch (error) {
      console.error("AddMedical: Submission error:", error);
      
      // Error toast with detailed message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to submit medical facility details. Please try again.";
      
      toast.error("Submission failed", {
        id: loadingToast,
        description: errorMessage,
        duration: 6000
      });
    } finally {
      setLoading(false);
      setSubmissionProgress(0);
      setSubmissionStage("");
    }
  };

  // Inline styles
  const containerStyle = {
    maxWidth: "800px",
    background: "#fff",
    color: "#333",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
  };

  const titleStyle = {
    color: "#D4A762", // Shiksharthi Gold
    fontWeight: "bold",
  };

  const inputStyle = {
    color: "black",
    borderColor: "#ccc",
  };

  const imageUploadSlotStyle = {
    width: "100%",
    paddingTop: "100%", // Square aspect ratio
    position: "relative",
    border: "2px dashed #D4A762",
    borderRadius: "8px",
    backgroundColor: "#f8f9fa",
    overflow: "hidden",
  };

  const imageUploadLabelStyle = {
    position: "absolute",
    top: 0, left: 0, width: "100%", height: "100%",
    display: "flex", flexDirection: "column",
    justifyContent: "center", alignItems: "center",
    cursor: "pointer", textAlign: "center",
  };

  const imagePreviewStyle = {
    width: "100%", height: "100%", objectFit: "cover",
  };

  const removeImageButtonStyle = {
    position: "absolute", top: "5px", right: "5px",
    backgroundColor: "rgba(0, 0, 0, 0.6)", color: "white",
    border: "none", borderRadius: "50%",
    width: "24px", height: "24px",
    fontSize: "12px", lineHeight: "22px",
    textAlign: "center", cursor: "pointer", padding: 0,
    display: "flex", justifyContent: "center", alignItems: "center",
  };

  const imagePlaceholderStyle = {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    color: "#D4A762",
  };

  const placeholderTextStyle = {
    fontSize: "0.65rem",
    marginTop: "4px",
    color: "#6c757d",
    lineHeight: "1.2",
    maxWidth: '90%',
    wordBreak: 'break-word',
  };

  const submitButtonStyle = {
    backgroundColor: "#D4A762", borderColor: "#D4A762", color: "white",
    padding: "10px 15px", fontSize: "1.1rem", fontWeight: "bold",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  };

  const disabledSubmitButtonStyle = {
    ...submitButtonStyle,
    backgroundColor: "#e0c69f", borderColor: "#e0c69f", cursor: "not-allowed",
  };

  const spinnerInButtonStyle = {
    marginRight: "8px",
    animation: "spin 1s linear infinite",
  };

  return (
    <div className="container mt-4 mb-5 p-4 shadow-lg" style={containerStyle}>
      {/* Toaster component */}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        toastOptions={{
          duration: 4000,
          style: { fontSize: '14px' }
        }}
      />
      
      {/* Global keyframes for spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <h2 className="text-center mb-4" style={titleStyle}>Add Medical Shop / Hospital</h2>
      <p className="text-center text-muted mb-4">
        Contribute to the community and earn rewards! Please provide accurate details.
      </p>
      
      <form onSubmit={handleSubmit}>
        {/* Facility Information */}
        <h5 className="mb-3">Facility Information</h5>
        
        <div className="mb-3">
          <label className="form-label">Facility Name</label>
          <input 
            type="text" 
            name="name" 
            className="form-control" 
            style={inputStyle} 
            value={formFields.name} 
            onChange={handleChange} 
            required 
            disabled={loading}
            minLength={3}
            placeholder="Enter facility name"
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Type</label>
          <select 
            name="type" 
            className="form-select" 
            style={inputStyle} 
            value={formFields.type} 
            onChange={handleChange} 
            required 
            disabled={loading}
          >
            <option value="">Select Type</option>
            <option value="Medical Shop">Medical Shop</option>
            <option value="Hospital">Hospital</option>
            <option value="Clinic">Clinic</option>
            <option value="Diagnostic Center">Diagnostic Center</option>
          </select>
        </div>

        {/* Address Information */}
        <h5 className="mt-4 mb-3">Address Information</h5>
        
        <div className="mb-3">
          <label className="form-label">Address</label>
          <input 
            type="text" 
            name="address" 
            className="form-control" 
            style={inputStyle} 
            value={formFields.address} 
            onChange={handleChange} 
            required 
            disabled={loading}
            minLength={10}
            placeholder="Complete address"
          />
        </div>
        
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Area</label>
            <input 
              type="text" 
              name="area" 
              className="form-control" 
              style={inputStyle} 
              value={formFields.area} 
              onChange={handleChange} 
              disabled={loading}
              placeholder="Area/Locality"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Landmark</label>
            <input 
              type="text" 
              name="landmark" 
              className="form-control" 
              style={inputStyle} 
              value={formFields.landmark} 
              onChange={handleChange} 
              disabled={loading}
              placeholder="Nearby landmark"
            />
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Pincode</label>
            <input 
              type="text" 
              pattern="\d{6}" 
              title="Must be a 6-digit number" 
              name="pincode" 
              className="form-control" 
              style={inputStyle} 
              value={formFields.pincode} 
              onChange={handleChange} 
              required 
              disabled={loading}
              placeholder="6-digit pincode"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">District</label>
            <input 
              type="text" 
              name="district" 
              className="form-control" 
              style={inputStyle} 
              value={formFields.district} 
              onChange={handleChange} 
              required 
              disabled={loading}
              placeholder="District name"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">State</label>
            <input 
              type="text" 
              name="state" 
              className="form-control" 
              style={inputStyle} 
              value={formFields.state} 
              onChange={handleChange} 
              required 
              disabled={loading}
              placeholder="State name"
            />
          </div>
        </div>

        {/* Services & Facilities */}
        <h5 className="mt-4 mb-3">Services & Facilities</h5>
        
        <div className="mb-3">
          <label className="form-label">Services Offered</label>
          <textarea 
            name="services" 
            className="form-control" 
            style={inputStyle} 
            value={formFields.services} 
            onChange={handleChange} 
            disabled={loading}
            rows="2"
            placeholder="Describe services offered (e.g., General medicine, Surgery, etc.)"
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Facilities Available</label>
          <textarea 
            name="facilities" 
            className="form-control" 
            style={inputStyle} 
            value={formFields.facilities} 
            onChange={handleChange} 
            disabled={loading}
            rows="2"
            placeholder="Describe facilities (e.g., X-Ray, Lab, Parking, etc.)"
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Specialization</label>
          <input 
            type="text" 
            name="specialization" 
            className="form-control" 
            style={inputStyle} 
            value={formFields.specialization} 
            onChange={handleChange} 
            disabled={loading}
            placeholder="Medical specialization (e.g., Cardiology, Orthopedics)"
          />
        </div>

        {/* Contact Details */}
        <h5 className="mt-4 mb-3">Contact Details</h5>
        
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Contact Person</label>
            <input 
              type="text" 
              name="contactPerson" 
              className="form-control" 
              style={inputStyle} 
              value={formFields.contactPerson} 
              onChange={handleChange} 
              disabled={loading}
              placeholder="Contact person name"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Mobile Number</label>
            <input 
              type="tel" 
              pattern="[6-9]{1}[0-9]{9}" 
              title="Must be 10 digits and start with 6-9" 
              name="mobile" 
              className="form-control" 
              style={inputStyle} 
              value={formFields.mobile} 
              onChange={handleChange} 
              required 
              disabled={loading}
              placeholder="10-digit mobile number"
            />
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Alternate Mobile</label>
            <input 
              type="tel" 
              name="alternateMobile" 
              className="form-control" 
              style={inputStyle} 
              value={formFields.alternateMobile} 
              onChange={handleChange} 
              disabled={loading}
              placeholder="Alternate mobile number"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              name="email" 
              className="form-control" 
              style={inputStyle} 
              value={formFields.email} 
              onChange={handleChange} 
              disabled={loading}
              placeholder="Email address"
            />
          </div>
        </div>
        
        <div className="mb-3">
          <label className="form-label">Website (Optional)</label>
          <input 
            type="url" 
            name="website" 
            className="form-control" 
            style={inputStyle} 
            value={formFields.website} 
            onChange={handleChange} 
            disabled={loading}
            placeholder="Website URL"
          />
        </div>

        {/* Operating Hours */}
        <h5 className="mt-4 mb-3">Operating Hours</h5>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Opening Time</label>
            <input 
              type="time" 
              name="open" 
              className="form-control" 
              style={inputStyle} 
              value={formFields.operatingHours.open} 
              onChange={handleOperatingHoursChange} 
              disabled={loading}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Closing Time</label>
            <input 
              type="time" 
              name="close" 
              className="form-control" 
              style={inputStyle} 
              value={formFields.operatingHours.close} 
              onChange={handleOperatingHoursChange} 
              disabled={loading}
            />
          </div>
        </div>

        {/* Payment Methods & Specialized Services */}
        <h5 className="mt-4 mb-3">Payment Methods & Specialized Services</h5>
        
        <div className="mb-3">
          <label className="form-label">Payment Methods</label>
          {paymentOptions.map((option) => (
            <div key={option} className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                value={option} 
                checked={formFields.paymentMethods.includes(option)} 
                onChange={(e) => handleCheckboxChange(e, 'paymentMethods')} 
                disabled={loading}
              />
              <label className="form-check-label">{option}</label>
            </div>
          ))}
        </div>
        
        <div className="mb-3">
          <label className="form-label">Specialized Services</label>
          {serviceOptions.map((option) => (
            <div key={option} className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                value={option} 
                checked={formFields.specializedServices.includes(option)} 
                onChange={(e) => handleCheckboxChange(e, 'specializedServices')} 
                disabled={loading}
              />
              <label className="form-check-label">{option}</label>
            </div>
          ))}
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="form-label fw-semibold">
            Upload Images (Min 3, Max 5 required):
          </label>
          <p className="form-text text-muted" style={{fontSize: '0.85em'}}>
            2 Outside Images + 2 Inside Images + 1 Visiting Card/Information Board. Max 5MB per image.
          </p>
          <div className="row g-2">
            {images.map((image, index) => (
              <div key={index} className="col-6 col-sm-4 col-md-2">
                <div style={imageUploadSlotStyle}>
                  <label style={imageUploadLabelStyle}>
                    {image?.preview ? (
                      <>
                        <img 
                          src={image.preview} 
                          alt={imageLabels[index] || `Preview ${index + 1}`} 
                          style={imagePreviewStyle} 
                        />
                        <button 
                          type="button" 
                          style={removeImageButtonStyle} 
                          onClick={() => removeImage(index)} 
                          title="Remove image"
                          disabled={loading}
                        >
                          ✖
                        </button>
                      </>
                    ) : (
                      <div style={imagePlaceholderStyle}>
                        <FaUpload size={20} />
                        <span style={placeholderTextStyle}>
                          {imageLabels[index] || `Image ${index + 1}`}
                        </span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp,image/gif" 
                      className="d-none" 
                      onChange={(e) => handleImageChange(e, index)} 
                      disabled={loading}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          className="btn w-100 mt-3"
          style={loading ? disabledSubmitButtonStyle : submitButtonStyle}
          disabled={loading}
        >
          {loading ? (
            <>
              <FaSpinner style={spinnerInButtonStyle} />
              {submissionStage === "uploading"
                ? `Uploading... ${submissionProgress}%`
                : submissionStage === "processing"
                ? "Processing..."
                : "Submitting..."}
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane me-2"></i>
              Add Medical Facility to Shiksharthi
            </>
          )}
        </button>
      </form>

      {/* Loading overlay */}
      {loading && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75 rounded">
          <div className="text-center">
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="small text-muted">
              {submissionStage === "uploading"
                ? `Uploading images... ${submissionProgress}%`
                : submissionStage === "processing"
                ? "Processing your submission..."
                : "Submitting medical facility details..."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMedical;