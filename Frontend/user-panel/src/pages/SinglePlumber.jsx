import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import plumberData from "../data/plumberData"; // Ensure this is correctly imported

const SinglePlumber = () => {
  const { id } = useParams(); // Get the ID from URL params
  const navigate = useNavigate();

  // Ensure plumberData exists and find the matching plumber
  const plumber = plumberData?.find((item) => item.id === parseInt(id));

  if (!plumber) {
    return <h2 className="text-center text-danger mt-5">Plumber Not Found</h2>;
  }

  const handleBooking = () => {
    navigate(`/plumber/placeorder/${id}`, { state: { plumber } });
  };

  return (
    <div className="container mt-5 py-5">
      <div className="row">
        {/* Left - Image Section */}
        <div className="col-md-6">
          <img
            src={plumber.imageUrl || "default.jpg"}
            className="img-fluid rounded shadow"
            alt="Plumber"
            style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
          />
        </div>

        {/* Right - Plumber Details */}
        <div className="col-md-6 mt-3">
          <h2 className="fw-bold">{plumber.name}</h2>
          <p className="text-dark"><strong>Expertise in:</strong> {plumber.expertise}</p>
          <p className="text-dark"><strong>Mobile:</strong> {plumber.mobile}</p>
          <p className="text-dark"><strong>Email:</strong> {plumber.email}</p>
          <p className="text-dark"><strong>Experience:</strong> {plumber.experience} years</p>
          <p className="text-dark"><strong>Address:</strong> {plumber.address}, {plumber.district}, {plumber.state} - {plumber.pincode}</p>
          <p className="text-dark"><strong>Availability Hours:</strong> {plumber.availability}</p>

          <button className="btn btn-primary w-100" onClick={handleBooking}>Book Now</button>
        </div>
      </div>
    </div>
  );
};

export default SinglePlumber;
