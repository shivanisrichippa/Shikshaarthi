
// src/pages/AddServiceForms/AddRoom.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaUpload, FaSpinner, FaTimes } from "react-icons/fa"; // Add FaTimes
import { submitServiceDataApi } from "../services/api"; // Adjust path
import { Toaster, toast } from "sonner";

const AddRoom = () => {
  const initialFormFields = {
    name: "",
    price: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    type: "", // PG, Hostel, Apartment, etc.
    sharing: "", // Single, Double, etc.
    rules: "",
    amenities: "", // Comma-separated string
    holderName: "", // Owner Name
    mobile: "",
    email: "", // Optional
  };
  const maxImages = 6;
  const initialImages = Array(maxImages).fill(null);
  // Adjusted image labels to be more generic but still guide the user
  const imageLabels = [
    "Main Area / Living Room*", "Second Angle of Main Area",
    "Bedroom 1*", "Bedroom 2 (if any)",
    "Washroom*", "Kitchen / Balcony / Other"
  ];

  const [formFields, setFormFields] = useState(initialFormFields);
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStage, setSubmissionStage] = useState("");

  const serviceType = "rental";

  // Cleanup Object URLs
  const cleanupImagePreviews = useCallback(() => {
    images.forEach(image => {
      if (image?.preview) URL.revokeObjectURL(image.preview);
    });
  }, [images]); // Re-run if images array identity changes (though content matters more for previews)

  useEffect(() => {
    return () => {
      cleanupImagePreviews();
    };
  }, [cleanupImagePreviews]); // Ensure cleanup runs on unmount

  const handleChange = (e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File is too large! Maximum 5MB allowed.");
        e.target.value = null; // Reset file input
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error("Invalid file type. Please upload JPG, PNG, or WEBP images.");
        e.target.value = null;
        return;
      }
      const newImages = [...images];
      // Revoke old preview URL if one exists for this slot
      if (newImages[index]?.preview) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages[index] = { file, preview: URL.createObjectURL(file), name: file.name };
      setImages(newImages);
      toast.success(`${imageLabels[index].replace(/\*|\(Opt.*\)/g, '').trim()} selected: ${file.name}`);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    if (newImages[index]?.preview) {
      URL.revokeObjectURL(newImages[index].preview);
    }
    const removedImageLabel = imageLabels[index].replace(/\*|\(Opt.*\)/g, '').trim();
    newImages[index] = null;
    setImages(newImages);
    toast.info(`${removedImageLabel} removed.`);
  };

  const validateForm = () => {
    const requiredFields = ['name', 'price', 'address', 'district', 'state', 'pincode', 'type', 'holderName', 'mobile'];
    for (const field of requiredFields) {
      if (!formFields[field]?.trim()) {
        const fieldLabel = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        toast.error(`Please fill in the '${fieldLabel}' field.`);
        return false;
      }
    }
    if (!/^[6-9]\d{9}$/.test(formFields.mobile)) {
      toast.error("Invalid owner mobile number. Must be 10 digits starting with 6-9.");
      return false;
    }
    if (!/^\d{6}$/.test(formFields.pincode)) {
      toast.error("Invalid pincode. Must be 6 digits.");
      return false;
    }
    if (formFields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formFields.email)) {
      toast.error("Invalid owner email format.");
      return false;
    }

    const imageFilesToUpload = images.filter(img => img?.file);
    const minRequiredImages = 3; // Example: Main Area, Bedroom, Washroom
    if (imageFilesToUpload.length < minRequiredImages) {
      toast.error(`Please upload at least ${minRequiredImages} images of the property (e.g., Main Area, Bedroom, Washroom).`, { duration: 6000 });
      return false;
    }
    if (imageFilesToUpload.length > maxImages) {
      toast.error(`You can upload a maximum of ${maxImages} images.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validateForm()) return;

    setLoading(true);
    setSubmissionStage("preparing");
    const loadingToastId = toast.loading("Preparing rental property submission...");

    const imageFilesToUpload = images.filter(img => img?.file).map(img => img.file);
    
    const dataPayload = { ...formFields };
    // Amenities are already a string from the form, no conversion needed if backend expects string.
    // If backend RentalData.schema.js expects amenities as an array:
    // if (dataPayload.amenities) {
    //   dataPayload.amenities = dataPayload.amenities.split(',').map(s => s.trim()).filter(s => s);
    // }

    try {
      await submitServiceDataApi(
        serviceType,
        dataPayload,
        imageFilesToUpload,
        (progress) => {
          setSubmissionProgress(progress);
          setSubmissionStage("uploading");
          toast.loading(progress === -1 ? "Uploading images..." : `Uploading images... ${progress}%`, { id: loadingToastId });
        },
        () => {
          setSubmissionStage("processing");
          toast.loading("Finalizing submission...", { id: loadingToastId });
        }
      );
      toast.success("Rental property details submitted successfully! Awaiting verification.", { id: loadingToastId, duration: 8000 });
      setFormFields(initialFormFields);
      setImages(Array(maxImages).fill(null)); // Reset images
    } catch (error) {
      // API interceptor typically handles displaying the error toast.
      // This explicit catch is for any specific component-level error handling or logging if needed.
      console.error("AddRoom: Submission error:", error);
      // Ensure loading toast is dismissed or updated if not handled by interceptor
      if (toast.isActive(loadingToastId) && !loadingToastId.toString().startsWith('success')) {
         toast.error(error.response?.data?.message || "Submission failed. Please review errors and try again.", { id: loadingToastId });
      }
    } finally {
      setLoading(false);
      setSubmissionProgress(0);
      setSubmissionStage("");
    }
  };

  // Inline styles from your original AddRoom component
  const containerStyle = { maxWidth: "800px", background: "#fff", color: "#333", border: "1px solid #e0e0e0", borderRadius: "8px", margin: "2rem auto", padding: "2rem" };
  const titleStyle = { color: "#D4A762", fontWeight: "bold", textAlign: "center", marginBottom: "1.5rem" };
  const inputStyle = { color: "black", borderColor: "#ccc" };
  const imageUploadGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "1rem", marginBottom: "1.5rem" };
  const imageUploadSlotStyle = { width: "100%", paddingTop: "100%", position: "relative", border: "2px dashed #D4A762", borderRadius: "8px", backgroundColor: "#f8f9fa", overflow: "hidden" };
  const imageUploadLabelStyle = { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", cursor: "pointer", textAlign: "center" };
  const imagePreviewStyle = { width: "100%", height: "100%", objectFit: "cover" };
  const removeImageButtonStyle = { position: "absolute", top: "5px", right: "5px", backgroundColor: "rgba(0, 0, 0, 0.7)", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", fontSize: "12px", lineHeight: "22px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", padding: 0, zIndex: 10 };
  const imagePlaceholderStyle = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#D4A762" };
  const placeholderTextStyle = { fontSize: "0.65rem", marginTop: "4px", color: "#555", lineHeight: "1.1", maxWidth: '90%', wordBreak: 'break-word', fontWeight: '500' };
  const submitButtonStyle = { backgroundColor: "#D4A762", borderColor: "#D4A762", color: "white", padding: "10px 15px", fontSize: "1.1rem", fontWeight: "bold", transition: "background-color 0.3s ease" };
  const disabledSubmitButtonStyle = { ...submitButtonStyle, backgroundColor: "#e0c69f", cursor: "not-allowed" };
  const spinnerInButtonStyle = { marginRight: "8px", animation: "spin 1s linear infinite" };
  const formTextMutedStyle = { fontSize: '0.85em', marginBottom: '0.5rem', display: 'block' };
  const requiredAsteriskStyle = { color: 'red', marginLeft: '2px' };


  return (
    <div className="container mt-4 mb-5 p-lg-4 p-3 shadow-lg" style={containerStyle}>
      <Toaster position="top-right" richColors closeButton toastOptions={{style: {fontSize: '1rem'}}}/>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      
      <h2 className="text-center mb-3" style={titleStyle}>Add Rental Property Details</h2>
      <p className="text-center text-muted mb-4">
        Contribute to the community and earn rewards! Fields with <span style={requiredAsteriskStyle}>*</span> are mandatory.
      </p>
      
      <form onSubmit={handleSubmit} noValidate>
        {/* Property Details - using your existing JSX structure from the prompt */}
        <div className="mb-3">
          <label className="form-label">Property/Room Name<span style={requiredAsteriskStyle}>*</span></label>
          <input type="text" name="name" className="form-control" style={inputStyle} value={formFields.name} onChange={handleChange} required disabled={loading} minLength={3} placeholder="e.g., Sunshine PG, 2BHK near College" />
        </div>
        <div className="mb-3">
          <label className="form-label">Price per Month (INR)<span style={requiredAsteriskStyle}>*</span></label>
          <input type="text" name="price" className="form-control" style={inputStyle} value={formFields.price} onChange={handleChange} required disabled={loading} placeholder="e.g., ₹8000/month or Contact for price" />
        </div>
        <div className="mb-3">
          <label className="form-label">Type of Room/Property<span style={requiredAsteriskStyle}>*</span></label>
          <select name="type" className="form-select" style={inputStyle} value={formFields.type} onChange={handleChange} required disabled={loading}>
            <option value="">-- Select Type --</option>
            <option value="PG">PG (Paying Guest)</option>
            <option value="Hostel">Hostel</option>
            <option value="Apartment">Apartment</option>
            <option value="Shared Room">Shared Room</option>
            <option value="House">Independent House</option>
            <option value="Flat">Flat</option>
            <option value="1BHK">1BHK</option>
            <option value="2BHK">2BHK</option>
            <option value="1RK">1RK</option>
            <option value="Single Room">Single Room (Independent)</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Sharing Basis (if applicable)</label>
          <input type="text" name="sharing" className="form-control" style={inputStyle} value={formFields.sharing} onChange={handleChange} disabled={loading} placeholder="e.g., Single, Double, Triple or No. of persons" />
        </div>
        <div className="mb-3">
          <label className="form-label">Key Rules (Optional)</label>
          <input type="text" name="rules" className="form-control" style={inputStyle} value={formFields.rules} onChange={handleChange} disabled={loading} placeholder="e.g., No smoking, Gate closing time" />
        </div>

        <h5 className="mt-4 mb-2 text-secondary">Property Address</h5>
        <div className="mb-3">
          <label className="form-label">Full Address<span style={requiredAsteriskStyle}>*</span></label>
          <input type="text" name="address" className="form-control" style={inputStyle} value={formFields.address} onChange={handleChange} required disabled={loading} minLength={10} placeholder="Complete address with landmarks" />
        </div>
        <div className="row g-3">
          <div className="col-md-4 mb-3">
            <label className="form-label">District<span style={requiredAsteriskStyle}>*</span></label>
            <input type="text" name="district" className="form-control" style={inputStyle} value={formFields.district} onChange={handleChange} required disabled={loading} placeholder="District name" />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">State<span style={requiredAsteriskStyle}>*</span></label>
            <input type="text" name="state" className="form-control" style={inputStyle} value={formFields.state} onChange={handleChange} required disabled={loading} placeholder="State name" />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Pincode<span style={requiredAsteriskStyle}>*</span></label>
            <input type="text" pattern="\d{6}" title="Must be a 6-digit number" name="pincode" className="form-control" style={inputStyle} value={formFields.pincode} onChange={handleChange} required disabled={loading} placeholder="6-digit pincode" />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Amenities (comma-separated)</label>
          <input type="text" name="amenities" className="form-control" style={inputStyle} value={formFields.amenities} onChange={handleChange} disabled={loading} placeholder="e.g., WiFi, AC, Attached Bathroom, Geyser" />
        </div>

        <h5 className="mt-4 mb-2 text-secondary">Property Owner Details</h5>
        <div className="row g-3"> {/* Added row and g-3 for better spacing */}
            <div className="col-md-6 mb-3">
                <label className="form-label">Owner Name<span style={requiredAsteriskStyle}>*</span></label>
                <input type="text" name="holderName" className="form-control" style={inputStyle} value={formFields.holderName} onChange={handleChange} required disabled={loading} minLength={3} placeholder="Full name of property owner" />
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label">Mobile Number<span style={requiredAsteriskStyle}>*</span></label>
                <input type="tel" pattern="[6-9]{1}[0-9]{9}" title="Must be 10 digits and start with 6-9" name="mobile" className="form-control" style={inputStyle} value={formFields.mobile} onChange={handleChange} required disabled={loading} placeholder="10-digit mobile number" />
            </div>
             <div className="col-md-12 mb-3"> {/* Full width for email */}
                <label className="form-label">Email (Optional)</label>
                <input type="email" name="email" className="form-control" style={inputStyle} value={formFields.email} onChange={handleChange} disabled={loading} placeholder="owner@example.com" />
            </div>
        </div>

        <div className="mt-4 mb-3"> {/* Adjusted margin for better flow */}
          <label className="form-label fw-semibold">
            Upload Images (Min 3, Max {maxImages} recommended):
          </label>
          <p className="form-text text-muted" style={formTextMutedStyle}>
            Required images marked with <span style={requiredAsteriskStyle}>*</span>. E.g., Living Area, Bedroom, Washroom. Max 5MB per image.
          </p>
          <div style={imageUploadGridStyle}> {/* Using grid style */}
            {images.map((image, index) => (
              <div key={index}> {/* Removed col classes, grid handles it */}
                <div style={imageUploadSlotStyle}>
                  <label htmlFor={`room-image-${index}`} style={imageUploadLabelStyle}>
                    {image?.preview ? (
                      <>
                        <img src={image.preview} alt={imageLabels[index].replace(/\*|\(Opt.*\)/g, '').trim()} style={imagePreviewStyle} />
                        <button type="button" style={removeImageButtonStyle} onClick={() => removeImage(index)} title="Remove image" disabled={loading}><FaTimes /></button>
                      </>
                    ) : (
                      <div style={imagePlaceholderStyle}>
                        <FaUpload size={30} />
                        <span style={placeholderTextStyle}>{imageLabels[index]}</span>
                      </div>
                    )}
                    <input id={`room-image-${index}`} type="file" accept="image/jpeg,image/png,image/webp" className="d-none" onChange={(e) => handleImageChange(e, index)} disabled={loading} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <button type="submit" className="btn w-100 mt-3" style={loading ? {...submitButtonStyle, ...disabledSubmitButtonStyle} : submitButtonStyle} disabled={loading}>
          {loading ? (
            <> <FaSpinner style={spinnerInButtonStyle} />
              {submissionStage === "uploading" ? (submissionProgress === -1 ? `Uploading...` : `Uploading... ${submissionProgress}%`) : submissionStage === "processing" ? "Finalizing..." : "Submitting..."}
            </>
          ) : "Add Property to Shiksharthi" }
        </button>
      </form>
    </div>
  );
};

export default AddRoom;