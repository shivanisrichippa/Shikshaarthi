import React from "react";
import OrderTracking from "./OrderTracking";

const OrderCard = ({ order }) => {
  return (
    <div className="col-md-8 col-lg-6 mb-4">
      <div className="card shadow-sm border rounded-3 p-3">
        <div className="d-flex align-items-center">
          <img
            src={order.image}
            alt={order.name}
            className="rounded me-3"
            style={{ width: "100px", height: "100px", objectFit: "contain" }}
          />
          <div>
            <h5 className="fw-bold">{order.name}</h5>
            <p className="text-dark mb-1"><strong>Price:</strong> {order.price}</p>
            <p className="text-dark mb-1"><strong>Order Date:</strong> {order.orderDate}</p>
            <p className="text-dark mb-1"><strong>Delivery Date:</strong> {order.deliveryDate}</p>
            <p className="text-dark mb-1"><strong>Payment:</strong> {order.paymentMethod}</p>
            <span className={`badge ${getStatusBadge(order.orderStatus)}`}>
              {order.orderStatus}
            </span>
          </div>
        </div>

        {/* Tracking Progress */}
        <OrderTracking status={order.orderStatus} trackingSteps={order.trackingStatus} />

        {/* Action Buttons */}
        <div className="d-flex justify-content-between mt-3">
          <button className="btn btn-outline-primary btn-sm w-50 mx-1">Track Order</button>
          <button className="btn btn-danger btn-sm w-50 mx-1">Cancel Order</button>
        </div>
      </div>
    </div>
  );
};

const getStatusBadge = (status) => {
  switch (status) {
    case "Confirmed":
      return "badge bg-primary";
    case "Shipped":
      return "badge bg-warning text-dark";
    case "Out for Delivery":
      return "badge bg-info text-dark";
    case "Delivered":
      return "badge bg-success";
    default:
      return "badge bg-secondary";
  }
};

export default OrderCard;
