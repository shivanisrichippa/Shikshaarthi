import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import laundryData from "../data/laundryData";

const LaundryPlaceOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const laundry = laundryData?.find((item) => item.id === parseInt(id));

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    address: "",
    street: "",
    state: "",
    pincode: "",
    clothWeight: "",
    ironing: false,
    pickupDate: "",
    pickupTime: "",
    paymentMethod: "COD",
  });

  if (!laundry) {
    return <h2 className="text-center text-danger mt-5">Laundry Not Found</h2>;
  }

  const costPerKg = laundry.costPerKg;
  const ironingCost = formData.ironing ? 50 : 0;
  const totalAmount = formData.clothWeight * costPerKg + ironingCost;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const calculateDeliveryDate = (pickupDate) => {
    if (!pickupDate) return "";
    const date = new Date(pickupDate);
    date.setDate(date.getDate() + 2);
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Navigate to the /laundry/orders page after form submission
    navigate("/laundry/orders");
  };

  return (
    <div className="container mt-5 py-5">
      <h2 className="fw-bold text-center">Place Your Order</h2>
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
                style={{ color: "black" }}
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
                style={{ color: "black" }}
              />
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
                style={{ color: "black" }}
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
                style={{ color: "black" }}
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
                style={{ color: "black" }}
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
                style={{ color: "black" }}
              />
            </div>

            {/* Order Details */}
            <div className="mb-3">
              <label className="form-label fw-bold text-dark">Cloths in Kg</label>
              <input
                type="number"
                name="clothWeight"
                className="form-control text-dark"
                value={formData.clothWeight}
                onChange={handleChange}
                style={{ color: "black" }}
              />
            </div>
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                name="ironing"
                className="form-check-input"
                checked={formData.ironing}
                onChange={handleChange}
              />
              <label className="form-check-label fw-bold text-dark">With Ironing (+₹50)</label>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold text-dark">Pickup Date</label>
              <input
                type="date"
                name="pickupDate"
                className="form-control text-dark"
                value={formData.pickupDate}
                onChange={handleChange}
                style={{ color: "black" }}
              />
            </div>
            <div className="mb-3"> 
              <label className="form-label fw-bold text-dark">Delivery Date</label>
              <input
                type="date"
                className="form-control text-dark"
                value={calculateDeliveryDate(formData.pickupDate)}
                readOnly
                style={{ color: "black" }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold text-dark">Available Pickup Time</label>
              <input
                type="time"
                name="pickupTime"
                className="form-control text-dark"
                value={formData.pickupTime}
                onChange={handleChange}
                style={{ color: "black" }}
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
                style={{ color: "black" }}
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

export default LaundryPlaceOrder;
