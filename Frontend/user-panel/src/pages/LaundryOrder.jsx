import React from "react";
import orderData from "../data/orderData"; // Adjust the path based on your folder structure

const LaundryOrder = () => {
  const order = orderData; // Use the order details from orderData.js

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card p-4 shadow-lg border-0 rounded" style={{ width: "500px", backgroundColor: "#f8f9fa" }}>
        <h2 className="text-center mb-3 text-primary">Laundry Order Details</h2>
        <hr />
        <div className="px-3">
          <p style={{ color: "#212529" }}><strong>User Name:</strong> {order.userName}</p>
          <p style={{ color: "#212529" }}><strong>Laundry Name:</strong> {order.laundryName}</p>
          <p style={{ color: "#212529" }}><strong>Amount:</strong> ₹{order.amount}</p>
          <p style={{ color: "#212529" }}><strong>Payment Status:</strong> {order.isPaid ? "Paid" : "Not Paid"}</p>
          <p style={{ color: "#212529" }}><strong>Payment Type:</strong> {order.paymentType}</p>
          <p style={{ color: "#212529" }}><strong>Cloths (Kg):</strong> {order.clothsKg}</p>
          <p style={{ color: "#212529" }}><strong>Pick-Up Date & Time:</strong> {order.pickupDate}, {order.pickupTime}</p>
          <p style={{ color: "#212529" }}><strong>Delivery Date & Time:</strong> {order.deliveryDate}, {order.deliveryTime}</p>
          <p style={{ color: "#212529" }}><strong>Laundry Contact:</strong> {order.laundryMobile}</p>
          <p style={{ color: "#212529" }}><strong>Laundry Address:</strong> {order.laundryAddress}</p>
        </div>
      </div>
    </div>
  );
};

export default LaundryOrder;
