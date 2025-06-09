import React, { useState } from "react";

const PlaceOrder = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    contactInfo: "",
    address: "",
    pincode: "",
    city: "",
    paymentMethod: "Cash on Delivery",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Order Details:", formData);
    alert("Order placed successfully!");
  };

  return (
    <div className="container mt-5 py-5">
      <h2 className="fw-bold text-center mb-4 text-dark">Place Your Order</h2>
      <div className="row justify-content-center">
        {/* Form Section */}
        <div className="col-md-8">
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label text-dark">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Mobile Number */}
            <div className="mb-3">
              <label htmlFor="mobile" className="form-label text-dark">
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your mobile number"
                required
              />
            </div>

            {/* Contact Info */}
            <div className="mb-3">
              <label htmlFor="contactInfo" className="form-label text-dark">
                Contact Info (Email or Alternate Number)
              </label>
              <input
                type="text"
                id="contactInfo"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your email or alternate number"
              />
            </div>

            {/* Address */}
            <div className="mb-3">
              <label htmlFor="address" className="form-label text-dark">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
                rows={3}
                placeholder="Enter your address"
                required
              ></textarea>
            </div>

            {/* Pincode */}
            <div className="mb-3">
              <label htmlFor="pincode" className="form-label text-dark">
                Pincode
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your pincode"
                required
              />
            </div>

            {/* City */}
            <div className="mb-3">
              <label htmlFor="city" className="form-label text-dark">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your city"
                required
              />
            </div>

            {/* Payment Method */}
            <div className="mb-3">
              <label htmlFor="paymentMethod" className="form-label text-dark">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="form-select text-dark"
              >
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="Credit/Debit Card">Credit/Debit Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            {/* Submit Button */}
            <button type="submit" className={`btn btn-primary py-2 px-9 rounded-pill w-100 mt-3`}>
              Place Order<i className={`fas fa-arrow-right ps-2`}></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
