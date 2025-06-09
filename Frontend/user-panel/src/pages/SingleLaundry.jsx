import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import laundryData from "../data/laundryData"; // Ensure this is correctly imported

const SingleLaundry = () => {
  const { id } = useParams(); // Get the ID from URL params
  const navigate = useNavigate();

  // Ensure laundryData exists and find the matching laundry
  const laundry = laundryData?.find((item) => item.id === parseInt(id));

  if (!laundry) {
    return <h2 className="text-center text-danger mt-5">Laundry Not Found</h2>;
  }

  const handleBooking = () => {
    navigate(`/laundry/placeorder/${id}`, { state: { laundry } });
  };

  return (
    <div className="container mt-5 py-5">
      <div className="row">
        {/* Left - Image Section */}
        <div className="col-md-6">
          <img
            src={laundry.images?.ownerPhoto || "default.jpg"}
            className="img-fluid rounded shadow"
            alt="Laundry"
            style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
          />
        </div>

        {/* Right - Laundry Details */}
        <div className="col-md-6 mt-3">
          <h2 className="fw-bold">{laundry.name}</h2>
          <p className="text-dark"><strong>Mobile:</strong> {laundry.mobile}</p>
          <p className="text-dark"><strong>Email:</strong> {laundry.email}</p>
          <p className="text-dark">
            <strong>Address:</strong> {laundry.address}, {laundry.district}, {laundry.state} - {laundry.pincode}
          </p>
          <p className="text-dark"><strong>Cost per Kg:</strong> ₹{laundry.costPerKg}</p>
          <p className="text-dark"><strong>Laundry Type:</strong> {laundry.laundryType}</p>
          <p className="text-dark"><strong>Ironing:</strong> {laundry.ironing ? "Yes" : "No"}</p>
          <p className="text-dark"><strong>Return Days:</strong> {laundry.returnDays}</p>
          <p className="text-dark"><strong>Total Amount:</strong> ₹{laundry.totalAmount}</p>

          <button className="btn btn-primary w-100" onClick={handleBooking}>Book Now</button>
        </div>
      </div>
    </div>
  );
};

export default SingleLaundry;