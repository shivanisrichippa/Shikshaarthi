import React from "react";

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

const getProgressWidth = (status) => {
  switch (status) {
    case "Confirmed":
      return "25%";
    case "Shipped":
      return "50%";
    case "Out for Delivery":
      return "75%";
    case "Delivered":
      return "100%";
    default:
      return "0%";
  }
};

const OrderTracking = ({ status = "Pending", trackingSteps = [] }) => {
  return (
    <div>
      {/* Progress Bar */}
      <div className="progress mt-3" style={{ height: "5px" }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{ width: getProgressWidth(status) }}
          aria-valuenow="50"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>

      {/* Tracking Steps */}
      <div className="d-flex justify-content-between small text-muted mt-2">
        {trackingSteps.length > 0 ? (
          trackingSteps.map((step, index) => (
            <span key={index} className={step === status ? "fw-bold text-dark" : ""}>
              {step}
            </span>
          ))
        ) : (
          <span>No tracking info available</span>
        )}
      </div>

      {/* Status Badge */}
      <span className={getStatusBadge(status)}>{status}</span>
    </div>
  );
};

export default OrderTracking;
