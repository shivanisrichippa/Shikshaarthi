import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import plumberData from "../data/plumberData";

const PlumberPlaceOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const plumber = plumberData?.find((item) => item.id === parseInt(id));

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    repairDescription: "",
    address: "",
    street: "",
    district: "",
    state: "",
    pincode: "",
    preferredDate: "",
    preferredTime: "",
    paymentMethod: "COD",
  });

  if (!plumber) {
    return <h2 className="text-center text-danger mt-5">Plumber Not Found</h2>;
  }

  const serviceCharge = 250; // Base service charge
  const totalAmount = serviceCharge;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Navigate to the /plumber/orders page after form submission
    navigate("/plumber/orders");
  };

  return (
    <div className="container mt-5 py-5">
      <h2 className="fw-bold text-center">Book a Plumber</h2>
      <div className="row justify-content-center">
        <div className="col-md-8 p-4 border rounded shadow-sm">
          <form onSubmit={handleSubmit}>
            {/* User Details */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">Name</label>
              <input
                type="text"
                name="name"
                className="form-control text-dark"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">Contact Number</label>
              <input
                type="text"
                name="contact"
                className="form-control text-dark"
                value={formData.contact}
                onChange={handleChange}
                required
              />
            </div>

            {/* Repair Description */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">Repair Description</label>
              <textarea
                name="repairDescription"
                className="form-control text-dark"
                rows="3"
                value={formData.repairDescription}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* Address Details */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">Address</label>
              <input
                type="text"
                name="address"
                className="form-control text-dark"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">Street</label>
              <input
                type="text"
                name="street"
                className="form-control text-dark"
                value={formData.street}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label text-dark fw-bold">District</label>
              <input
                type="text"
                name="district"
                className="form-control text-dark"
                value={formData.district}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label text-dark fw-bold">State</label>
              <input
                type="text"
                name="state"
                className="form-control text-dark"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label text-dark fw-bold">Pincode</label>
              <input
                type="text"
                name="pincode"
                className="form-control text-dark"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>

            {/* Preferred Appointment Details */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">Preferred Date</label>
              <input
                type="date"
                name="preferredDate"
                className="form-control text-dark"
                value={formData.preferredDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">Preferred Time</label>
              <input
                type="time"
                name="preferredTime"
                className="form-control text-dark"
                value={formData.preferredTime}
                onChange={handleChange}
                required
              />
            </div>

            {/* Payment Method */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">Payment Method</label>
              <select
                name="paymentMethod"
                className="form-control text-dark"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="COD">Cash on Delivery</option>
                <option value="Razorpay">Razorpay</option>
              </select>
            </div>

            {/* Total Amount */}
            <div className="border p-3 mb-3 rounded text-center bg-light">
              <h4 className="fw-bold">Total Amount: ₹{totalAmount}</h4>
            </div>

            <button className="btn btn-primary w-100" style={{ backgroundColor: "#D4A762", borderColor: "#D4A762" }}>
              Place Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlumberPlaceOrder;
