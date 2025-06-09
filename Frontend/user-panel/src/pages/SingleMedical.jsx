import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import assets from "../assets/assets.js";

const medicalData = [
  {
    id: 1,
    name: "City Hospital",
    address: "456 Main Road, Kolhapur, Maharashtra, 416008",
    latitude: 16.704987,
    longitude: 74.243253,
    image: assets.medical, // Single Image
    availability: "24/7",
    helpline: "+91 98765 43210",
    serviceType: "Emergency, OPD, Pharmacy, Diagnostic Labs",
  },
];

const SingleMedical = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const medical = medicalData.find((m) => m.id === parseInt(id));

  if (!medical) {
    return <h2 className="text-center mt-5 text-dark">Medical service not found!</h2>;
  }

  return (
    <div className="container mt-5 py-5 text-dark">
      <div className="row">
        {/* Left - Image Section */}
        <div className="col-md-6">
          <div className="border p-3 rounded">
            <img
              src={medical.image}
              className="img-fluid rounded shadow mb-3"
              alt="Medical Preview"
              style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
            />
          </div>
        </div>

        {/* Right - Medical Details */}
        <div className="col-md-6">
          <h2 className="fw-bold text-dark mb-3">{medical.name}</h2>
          <p><strong>Location:</strong> {medical.address}</p>

          {/* Google Maps Embed */}
          <iframe
            title="Medical Location"
            src={`https://www.google.com/maps?q=${medical.latitude},${medical.longitude}&output=embed`}
            width="100%"
            height="250"
            className="rounded border shadow-sm mb-3"
            style={{ border: "1px solid #ddd" }}
          ></iframe>

          <p><strong>Availability:</strong> {medical.availability}</p>
          <p><strong>Helpline:</strong> {medical.helpline}</p>
          <p><strong>Service Type:</strong> {medical.serviceType}</p>

          {/* Book Appointment Button */}
         
        </div>
      </div>
    </div>
  );
};

export default SingleMedical;