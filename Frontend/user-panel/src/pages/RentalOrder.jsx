//rental order is last to home 
import React from "react";
import { useLocation } from "react-router-dom";

const RentalOrder = () => {
  const location = useLocation();
  const roomData = location.state?.roomData || {
    ownerName: "Rahul Sharma",
    ownerMobile: "+91 9876543210",
    ownerEmail: "rahul.sharma@example.com",
  };

  return (
    <div className="container mt-5 py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="border p-4 rounded shadow">
            <h2 className="fw-bold text-dark text-center mb-4">Owner Details</h2>
            <p className="text-dark">
              <strong>Name:</strong> <span className="text-muted">{roomData.ownerName}</span>
            </p>
            <p className="text-dark">
              <strong>Mobile:</strong> <span className="text-muted">{roomData.ownerMobile}</span>
            </p>
            <p className="text-dark">
              <strong>Email:</strong> <span className="text-muted">{roomData.ownerEmail}</span>
            </p>
            <a href={`tel:${roomData.ownerMobile}`} className="btn btn-primary w-100 mt-3">Call Now</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalOrder;
