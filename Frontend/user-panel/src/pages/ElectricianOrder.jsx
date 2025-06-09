import React from "react";
import electricianOrderData from "../data/electricianOrderData"; // Adjust the path based on your folder structure

const ElectricianOrder = () => {
  const order = electricianOrderData; // Use the order details from electricianOrderData.js

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card p-4 shadow-lg border-0 rounded" style={{ width: "500px", backgroundColor: "#f8f9fa" }}>
        <h2 className="text-center mb-3 text-primary">Electrician Order Details</h2>
        <hr />
        <div className="px-3">
          <p style={{ color: "#212529" }}><strong>User Name:</strong> {order.userName}</p>
          <p style={{ color: "#212529" }}><strong>Electrician Name:</strong> {order.electricianName}</p>
          <p style={{ color: "#212529" }}><strong>Electrician Contact:</strong> {order.electricianContact}</p>
          <p style={{ color: "#212529" }}><strong>Amount:</strong> ₹{order.amount}</p>
          <p style={{ color: "#212529" }}><strong>Payment Status:</strong> {order.isPaid ? "Paid" : "Not Paid"}</p>
          <p style={{ color: "#212529" }}><strong>Payment Type:</strong> {order.paymentType}</p>
          <p style={{ color: "#212529" }}><strong>Purpose:</strong> {order.purpose}</p>
          <p style={{ color: "#212529" }}><strong>Booked Date & Time:</strong> {order.bookedDate}, {order.bookedTime}</p>
          <p style={{ color: "#212529" }}><strong>Electrician Address:</strong> {order.electricianAddress}</p>
        </div>
      </div>
    </div>
  );
};

export default ElectricianOrder;
