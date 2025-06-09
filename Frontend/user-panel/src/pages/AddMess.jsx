import React, { useState, useEffect } from "react";
import { FaUpload, FaSpinner } from "react-icons/fa";
import { submitServiceDataApi } from "../services/api"; // Adjust path
import { Toaster, toast } from "sonner";

const AddMess = () => {
  const initialFormFields = {
    name: "",
    description: "",
    price: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    messType: "",
    holderName: "",
    mobile: "",
  };
  const initialImages = Array(6).fill(null);
  const imageLabels = [
    "Mess Sitting Area 1", "Mess Sitting Area 2",
    "Thali Image 1", "Thali Image 2 (Diff. Food)", "Special Day Thali",
    "Mess Outside View"
  ];

  const [formFields, setFormFields] = useState(initialFormFields);
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStage, setSubmissionStage] = useState(""); // 'preparing', 'uploading', 'processing'

  const serviceType = "mess";

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

    // Show loading toast similar to SignUp component
    const loadingToast = toast.loading("Preparing your mess submission...", {
      duration: Infinity // Keep it until we manually dismiss
    });

    const imageFilesToUpload = images.filter(img => img?.file).map(img => img.file);

    if (imageFilesToUpload.length < 2) {
      toast.error("Please upload at least 2 images of the mess as per guidelines.", {
        id: loadingToast,
        duration: 5000
      });
      setLoading(false);
      setSubmissionStage("");
      return;
    }

    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'address', 'district', 'state', 'pincode', 'messType', 'holderName', 'mobile'];
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

      // Success toast similar to SignUp component
      toast.success("Mess submission successful!", {
        id: loadingToast,
        description: "Awaiting verification. You'll get coins and a chance to spin the wheel upon approval!",
        duration: 8000
      });

      // Reset form on success
      setFormFields(initialFormFields);
      setImages(Array(6).fill(null));
      
    } catch (error) {
      console.error("AddMess: Submission error:", error);
      
      // Error toast with detailed message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to submit mess details. Please try again.";
      
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

  // Inline styles (as per your original component's pattern)
  const containerStyle = {
    maxWidth: "800px",
    background: "#fff",
    color: "#333", // Adjusted for better contrast with white
    border: "1px solid #e0e0e0", // Softer border
    borderRadius: "8px", // Slightly more rounded
  };

  const titleStyle = {
    color: "#D4A762", // Shiksharthi Gold
    fontWeight: "bold",
  };

  const inputStyle = { // For form-control, form-select
    color: "black",
    borderColor: "#ccc", // Default border
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
    fontSize: "0.70rem", // Made smaller to fit better
    marginTop: "4px",
    color: "#6c757d",
    lineHeight: "1.2",
    maxWidth: '90%', // Prevent overflow
    wordBreak: 'break-word', // Break long labels
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
    animation: "spin 1s linear infinite", // Requires @keyframes spin to be defined globally or via <style>
  };

  return (
    // Using Bootstrap classes for layout (container, row, col, mb-3, etc.)
    // and inline styles for specific visual appearances.
    <div className="container mt-4 mb-5 p-4 shadow-lg" style={containerStyle}>
      {/* Toaster component with same config as SignUp */}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        toastOptions={{
          duration: 4000,
          style: { fontSize: '14px' }
        }}
      />
      
      {/* Global keyframes for spinner if not in global CSS */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <h2 className="text-center mb-4" style={titleStyle}>Add New Mess Details</h2>
      <p className="text-center text-muted mb-4">
        Contribute to the community and earn rewards! Please provide accurate details.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Mess Name</label>
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
            placeholder="Enter mess name"
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Specifications (e.g., Tiffin service, menu highlights, specialities)</label>
          <textarea 
            name="description" 
            className="form-control" 
            style={inputStyle} 
            value={formFields.description} 
            onChange={handleChange} 
            required 
            rows="3"
            disabled={loading}
            minLength={10}
            placeholder="Describe the mess services, food quality, specialities..."
          />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Price (per month, or text like "Contact for price")</label>
          <input 
            type="text" 
            name="price" 
            className="form-control" 
            style={inputStyle} 
            value={formFields.price} 
            onChange={handleChange} 
            required 
            disabled={loading}
            placeholder="e.g., ₹3000/month or Contact for price"
          />
        </div>
        
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
            placeholder="Complete address with landmarks"
          />
        </div>
        
        <div className="row">
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
        </div>
        
        <div className="mb-3">
          <label className="form-label" style={{color: 'black'}}>Mess Type</label>
          <select 
            name="messType" 
            className="form-select" 
            style={inputStyle} 
            value={formFields.messType} 
            onChange={handleChange} 
            required 
            disabled={loading}
          >
            <option value="">-- Select Mess Type --</option>
            <option value="Pure Veg">Pure Veg</option>
            <option value="Pure Non-Veg">Pure Non-Veg</option>
            <option value="Both Veg and Non-Veg">Both Veg and Non-Veg</option>
          </select>
        </div>

        <h4 className="mt-4 mb-3">Mess Owner Details</h4>
        <div className="mb-3">
          <label className="form-label">Owner Name</label>
          <input 
            type="text" 
            name="holderName" 
            className="form-control" 
            style={inputStyle} 
            value={formFields.holderName} 
            onChange={handleChange} 
            required 
            disabled={loading}
            minLength={3}
            placeholder="Full name of mess owner"
          />
        </div>
        
        <div className="mb-3">
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

        <div className="mb-4">
          <label className="form-label fw-semibold">
            Upload Images (Min 2, Max 6 recommended):
          </label>
          <p className="form-text text-muted" style={{fontSize: '0.85em'}}>
            Examples: 2 Mess Sitting Area, 3 Thali Images, 1 Mess Outside View. Max 5MB per image.
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
                        <FaUpload size={24} />
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
              Add Mess to Shiksharthi
            </>
          )}
        </button>
      </form>

      {/* Loading overlay for better UX - similar to SignUp */}
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
                : "Submitting mess details..."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMess;