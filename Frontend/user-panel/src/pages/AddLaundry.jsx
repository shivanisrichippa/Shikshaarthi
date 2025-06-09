
import React, { useState, useEffect } from "react";
import { FaUpload, FaSpinner } from "react-icons/fa";
import { submitServiceDataApi } from "../services/api"; // Adjust path
import { Toaster, toast } from "sonner";

const AddLaundry = () => {
  const initialFormFields = {
    name: "",
    mobile: "",
    email: "",
    address: "",
    pincode: "",
    district: "",
    state: "",
    costPerKg: "",
    laundryType: "Regular",
    ironing: false,
    returnDays: "",
    serviceType: "Shop", // Shop or Individual
  };
  
  const initialImages = Array(5).fill(null);
  
  // Dynamic image labels based on service type
  const getImageLabels = (serviceType) => {
    if (serviceType === "Shop") {
      return [
        "Outside Image", 
        "Inside Image", 
        "Visiting Card/Info Board",
        "Additional Photo 1",
        "Additional Photo 2"
      ];
    } else { // Individual
      return [
        "Photo of the Person", 
        "Address Proof Photo", 
        "Aadhar Card Photo",
        "Visiting Card/Info (if any)",
        "Additional Photo"
      ];
    }
  };

  const [formFields, setFormFields] = useState(initialFormFields);
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStage, setSubmissionStage] = useState(""); // 'preparing', 'uploading', 'processing'

  const serviceType = "laundry";

  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image?.preview) URL.revokeObjectURL(image.preview);
      });
    };
  }, [images]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    // Reset images when service type changes
    if (name === "serviceType" && value !== formFields.serviceType) {
      // Clean up existing image previews
      images.forEach(image => {
        if (image?.preview) URL.revokeObjectURL(image.preview);
      });
      setImages(Array(5).fill(null));
    }
    
    setFormFields({ ...formFields, [name]: newValue });
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image is too large! Please choose an image smaller than 5MB.", {
          duration: 4000
        });
        e.target.value = null;
        return;
      }
      
      const newImages = [...images];
      if (newImages[index]?.preview) URL.revokeObjectURL(newImages[index].preview);
      newImages[index] = { file, preview: URL.createObjectURL(file) };
      setImages(newImages);
      
      const imageLabels = getImageLabels(formFields.serviceType);
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
    
    const imageLabels = getImageLabels(formFields.serviceType);
    toast.info(`${imageLabels[index] || `Image ${index + 1}`} removed`, {
      duration: 2000
    });
  };

  const validateForm = () => {
    // Validate required fields
    const requiredFields = ['name', 'mobile', 'address', 'district', 'state', 'pincode', 'costPerKg', 'returnDays'];
    const missingFields = requiredFields.filter(field => !formFields[field]?.toString().trim());
    
    if (missingFields.length > 0) {
      const fieldNames = {
        name: "Owner's name",
        mobile: "Mobile number",
        address: "Address",
        district: "District",
        state: "State",
        pincode: "Pincode",
        costPerKg: "Cost per Kg",
        returnDays: "Return days"
      };
      const missingFieldNames = missingFields.map(field => fieldNames[field]).join(", ");
      toast.error(`Please fill in: ${missingFieldNames}`, {
        duration: 5000
      });
      return false;
    }

    // Validate mobile number
    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobilePattern.test(formFields.mobile)) {
      toast.error("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9", {
        duration: 5000
      });
      return false;
    }

    // Validate email if provided
    if (formFields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formFields.email)) {
      toast.error("Please enter a valid email address", {
        duration: 5000
      });
      return false;
    }

    // Validate pincode
    const pincodePattern = /^\d{6}$/;
    if (!pincodePattern.test(formFields.pincode)) {
      toast.error("Please enter a valid 6-digit pincode", {
        duration: 5000
      });
      return false;
    }

    // Validate cost per kg
    const cost = parseFloat(formFields.costPerKg);
    if (isNaN(cost) || cost <= 0) {
      toast.error("Please enter a valid cost per kg (numbers only)", {
        duration: 5000
      });
      return false;
    }

    // Validate return days
    const days = parseInt(formFields.returnDays);
    if (isNaN(days) || days <= 0 || days > 30) {
      toast.error("Please enter valid return days (1-30 days)", {
        duration: 5000
      });
      return false;
    }

    return true;
  };

  const validateImages = () => {
    const imageFilesToUpload = images.filter(img => img?.file);
    const requiredImageCount = formFields.serviceType === "Shop" ? 3 : 3; // Minimum required images
    
    if (imageFilesToUpload.length < requiredImageCount) {
      const serviceTypeText = formFields.serviceType === "Shop" ? "shop" : "individual service";
      toast.error(`Please upload at least ${requiredImageCount} images for ${serviceTypeText} as per guidelines.`, {
        duration: 5000
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    // Validate form fields
    if (!validateForm()) return;
    
    // Validate images
    if (!validateImages()) return;
    
    setLoading(true);
    setSubmissionStage("preparing");

    const loadingToast = toast.loading("Preparing your laundry service submission...", {
      duration: Infinity
    });

    const imageFilesToUpload = images.filter(img => img?.file).map(img => img.file);

    // Calculate total amount
    const cost = parseFloat(formFields.costPerKg) || 0;
    const ironingCost = formFields.ironing ? cost * 0.5 : 0;
    const totalAmount = cost + ironingCost;

    const dataPayload = { 
      ...formFields,
      totalAmount: totalAmount.toFixed(2)
    };

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
      toast.success("Laundry service submitted successfully!", {
        id: loadingToast,
        description: "Your submission is under review. You'll earn coins and get a chance to spin the wheel upon approval!",
        duration: 8000
      });

      // Reset form on success
      setFormFields(initialFormFields);
      setImages(Array(5).fill(null));
      
    } catch (error) {
      console.error("AddLaundry: Submission error:", error);
      
      // Handle specific error cases with user-friendly messages
      let errorMessage = "Failed to submit laundry service. Please try again.";
      
      if (error.response?.status === 409) {
        errorMessage = "A laundry service with similar details already exists in this area. Please check for duplicates.";
      } else if (error.response?.status === 413) {
        errorMessage = "One or more images are too large. Please reduce image sizes and try again.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Please check your input and try again.";
      } else if (error.response?.status === 429) {
        errorMessage = "Too many submissions. Please wait a moment before submitting again.";
      } else if (error.message?.toLowerCase().includes('network')) {
        errorMessage = "Network connection issue. Please check your internet and try again.";
      } else if (error.message?.toLowerCase().includes('timeout')) {
        errorMessage = "Upload is taking too long. Please check your connection and try again.";
      }
      
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

  // Styles
  const containerStyle = {
    maxWidth: "800px",
    background: "#fff",
    color: "#333",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
  };

  const titleStyle = {
    color: "#D4A762",
    fontWeight: "bold",
  };

  const inputStyle = {
    color: "black",
    borderColor: "#ccc",
  };

  const imageUploadSlotStyle = {
    width: "100%",
    paddingTop: "100%",
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
    fontSize: "0.70rem",
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

  const imageLabels = getImageLabels(formFields.serviceType);

  return (
    <div className="container mt-4 mb-5 p-4 shadow-lg" style={containerStyle}>
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        toastOptions={{
          duration: 4000,
          style: { fontSize: '14px' }
        }}
      />
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <h2 className="text-center mb-4" style={titleStyle}>Add Laundry Service</h2>
      <p className="text-center text-muted mb-4">
        Help others find quality laundry services and earn rewards! Please provide accurate details.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" style={{color: 'black'}}>Service Type</label>
          <select 
            name="serviceType" 
            className="form-select" 
            style={inputStyle} 
            value={formFields.serviceType} 
            onChange={handleChange} 
            required 
            disabled={loading}
          >
            <option value="Shop">Shop (Laundry Business)</option>
            <option value="Individual">Individual (Personal Service)</option>
          </select>
          <div className="form-text">
            Choose "Shop" for laundry businesses or "Individual" for personal laundry services
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Laundry Owner Name</label>
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
            placeholder="Enter owner's full name"
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
        
        <div className="mb-3">
          <label className="form-label">Email (Optional)</label>
          <input 
            type="email" 
            name="email" 
            className="form-control" 
            style={inputStyle} 
            value={formFields.email} 
            onChange={handleChange} 
            disabled={loading}
            placeholder="Enter email address (optional)"
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

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Cost Per Kg (₹)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              name="costPerKg" 
              className="form-control" 
              style={inputStyle} 
              value={formFields.costPerKg} 
              onChange={handleChange} 
              required 
              disabled={loading}
              placeholder="Enter cost per kg"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Return in (Days)</label>
            <input 
              type="number" 
              min="1"
              max="30"
              name="returnDays" 
              className="form-control" 
              style={inputStyle} 
              value={formFields.returnDays} 
              onChange={handleChange} 
              required 
              disabled={loading}
              placeholder="Number of days"
            />
          </div>
        </div>
        
        <div className="mb-3">
          <label className="form-label" style={{color: 'black'}}>Laundry Type</label>
          <select 
            name="laundryType" 
            className="form-select" 
            style={inputStyle} 
            value={formFields.laundryType} 
            onChange={handleChange} 
            disabled={loading}
          >
            <option value="Regular">Regular</option>
            <option value="Dry Cleaning">Dry Cleaning</option>
            <option value="Heavy Wash">Heavy Wash</option>
          </select>
        </div>
        
        <div className="mb-3 form-check">
          <input 
            type="checkbox" 
            className="form-check-input" 
            name="ironing" 
            checked={formFields.ironing} 
            onChange={handleChange} 
            disabled={loading}
          />
          <label className="form-check-label">
            Include Ironing? (adds 50% extra cost)
          </label>
        </div>

        {formFields.costPerKg && (
          <div className="mb-3 p-3 bg-light rounded">
            <h6>Cost Summary:</h6>
            <div>Base cost: ₹{parseFloat(formFields.costPerKg || 0).toFixed(2)} per kg</div>
            {formFields.ironing && (
              <div>Ironing cost: ₹{(parseFloat(formFields.costPerKg || 0) * 0.5).toFixed(2)} per kg</div>
            )}
            <div className="fw-bold">
              Total: ₹{(parseFloat(formFields.costPerKg || 0) + (formFields.ironing ? parseFloat(formFields.costPerKg || 0) * 0.5 : 0)).toFixed(2)} per kg
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="form-label fw-semibold">
            Upload Images (Min 3, Max 5):
          </label>
          <p className="form-text text-muted" style={{fontSize: '0.85em'}}>
            {formFields.serviceType === "Shop" 
              ? "For Shop: Outside view, Inside view, Visiting card/Info board. Max 5MB per image."
              : "For Individual: Person photo, Address proof, Aadhar card, Visiting card (if any). Max 5MB per image."}
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
              Add Laundry Service
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
                : "Submitting laundry service details..."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddLaundry;