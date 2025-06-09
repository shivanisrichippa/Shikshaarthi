import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import electricianData from "../data/electricianData"; // Ensure this is correctly imported

const SingleElectrician = () => {
  const { id } = useParams(); // Get the ID from URL params
  const navigate = useNavigate();

  // Ensure electricianData exists and find the matching electrician
  const electrician = electricianData?.find((item) => item.id === parseInt(id));

  if (!electrician) {
    return <h2 className="text-center text-danger mt-5">Electrician Not Found</h2>;
  }

  const handleBooking = () => {
    navigate(`/electrician/placeorder/${id}`, { state: { electrician } });
  };

  return (
    <div className="container mt-5 py-5">
      <div className="row">
        {/* Left - Image Section */}
        <div className="col-md-6">
          <img
            src={electrician.imageUrl || "default.jpg"}
            className="img-fluid rounded shadow"
            alt="Electrician"
            style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
          />
        </div>

        {/* Right - Electrician Details */}
        <div className="col-md-6 mt-3">
          <h2 className="fw-bold">{electrician.name}</h2>
          <p className="text-dark"><strong>Expertise in:</strong> {electrician.expertise}</p>
          <p className="text-dark"><strong>Mobile:</strong> {electrician.mobile}</p>
          <p className="text-dark"><strong>Email:</strong> {electrician.email}</p>
          <p className="text-dark"><strong>Experience:</strong> {electrician.experience} years</p>
          <p className="text-dark"><strong>Address:</strong> {electrician.address}, {electrician.district}, {electrician.state} - {electrician.pincode}</p>
          <p className="text-dark"><strong>Availability Hours:</strong> {electrician.availability}</p>

          <button className="btn btn-primary w-100" onClick={handleBooking}>Book Now</button>
        </div>
      </div>
    </div>
  );
};

export default SingleElectrician;