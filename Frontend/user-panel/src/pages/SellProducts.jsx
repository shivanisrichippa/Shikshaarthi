import React, { useState } from "react";
import { FaUpload } from "react-icons/fa"; // Upload Icon

const SellProducts = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    deliveryDays: "",
    category: "",
    exchangeOrReturn: false,
    holderName: "",
    mobile: "",
    email: "",
    images: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    e.target.style.color = "black";
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const imageFile = { file, preview: URL.createObjectURL(file) };
      const newImages = [...formData.images];
      newImages[index] = imageFile;
      setFormData((prevState) => ({ ...prevState, images: newImages }));
    }
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages[index] = null;
    setFormData((prevState) => ({ ...prevState, images: newImages }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="container mt-4 p-4 shadow rounded text-dark" style={{ maxWidth: "600px", background: "#fff" }}>
      <h2 className="text-center mb-3">Sell Product</h2>
      <form onSubmit={handleSubmit}>
        {/* Product Information */}
        <div className="mb-3">
          <label className="form-label">Product Name</label>
          <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Price</label>
          <input type="number" className="form-control" name="price" value={formData.price} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Delivery in Days</label>
          <input type="number" className="form-control" name="deliveryDays" value={formData.deliveryDays} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Category</label>
          <select className="form-control" name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Others">Others</option>
          </select>
        </div>
        <div className="mb-3 form-check">
          <input type="checkbox" className="form-check-input" name="exchangeOrReturn" checked={formData.exchangeOrReturn} onChange={handleChange} />
          <label className="form-check-label">Exchange or Return Available</label>
        </div>

        {/* Image Upload Section */}
        <div className="mb-3">
          <label className="form-label">Upload Product Images (Max: 4)</label>
          <div className="d-flex gap-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="position-relative" style={{ width: "100px", height: "100px" }}>
                <label className="d-flex justify-content-center align-items-center border rounded" 
                  style={{ width: "100%", height: "100%", cursor: "pointer", background: "#f8f9fa" }}>
                  {formData.images[index] ? (
                    <>
                      <img src={formData.images[index].preview} alt="Uploaded" className="img-thumbnail" 
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }} />
                      <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0"
                        onClick={() => removeImage(index)}>✖</button>
                    </>
                  ) : (
                    <FaUpload size={30} className="text-muted" />
                  )}
                  <input type="file" accept="image/*" className="d-none" onChange={(e) => handleImageChange(e, index)} />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Details */}
        <div className="mb-3">
          <label className="form-label">Name of Seller</label>
          <input type="text" className="form-control" name="holderName" value={formData.holderName} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Mobile Number</label>
          <input type="text" className="form-control" name="mobile" value={formData.mobile} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <button type="submit" className="btn btn-primary w-100">Sell Product</button> 

        {/* <button type="submit" className="btn btn-primary w-100">Sell Product</button>   naviagte to /product/status */}
      </form>
    </div>
  );
};

export default SellProducts;
