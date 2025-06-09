import React from "react";
import { useLocation } from "react-router-dom";

const MessOrders = () => {
  const location = useLocation();
  const order = location.state;

  if (!order) {
    return <h2 className="text-center mt-5 text-danger">No order found!</h2>;
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card p-4 shadow-lg border-0 rounded" style={{ width: "500px", backgroundColor: "#f8f9fa" }}>
        <h2 className="text-center mb-3 text-primary">Order Details</h2>
        <hr />
        <div className="px-3">
          <p style={{ color: "#212529" }}><strong>User Name:</strong> {order.userName}</p>
          <p style={{ color: "#212529" }}><strong>Email:</strong> {order.email}</p>
          <p style={{ color: "#212529" }}><strong>Mobile:</strong> {order.mobile}</p>
          <p style={{ color: "#212529" }}><strong>Mess Name:</strong> {order.messName}</p>
          <p style={{ color: "#212529" }}><strong>Booked Duration:</strong> {order.startDate} - {order.endDate}</p>
          <p style={{ color: "#212529" }}><strong>Amount Paid:</strong> ₹{order.amount}</p>
          <p style={{ color: "#212529" }}><strong>Payment Date:</strong> {order.paymentDate}</p>
        </div>
      </div>
    </div>
  );
};

export default MessOrders;
