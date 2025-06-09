//single room to rentalorder
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import assets from "../assets/assets.js";

const roomData = {
  id: 1,
  name: "Spacious AC Room for Boys",
  price: "₹4500/month",
  status: "Available",
  address: "Pune, Maharashtra - Near COEP Hostel",
  description:
    "Fully furnished room with study table, wardrobe, attached washroom, and Wi-Fi. 24x7 water & electricity. Ideal for students.",
  images: [assets.r1, assets.r2, assets.r3, assets.r4],
};

const SingleRoom = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(roomData.images[0]);

  return (
    <div className="container mt-5 py-5">
      <div className="row">
        {/* Left - Image Gallery */}
        <div className="col-md-6">
          <div className="border p-3 rounded">
            <img
              src={selectedImage}
              className="img-fluid rounded shadow mb-3"
              alt="Room Preview"
              style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
            />
            <div className="d-flex gap-2 justify-content-center mt-3">
              {roomData.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  className="rounded shadow"
                  alt="Room Thumbnail"
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: "80px",
                    height: "80px",
                    cursor: "pointer",
                    objectFit: "cover",
                    border: selectedImage === img ? "3px solid #ff9900" : "1px solid #ddd",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right - Room Details */}
        <div className="col-md-6">
          <div className="text-center mb-4 wow bounceInUp" data-wow-delay="0.1s">
            <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3">
              Our Services
            </small>
          </div>
          <h2 className="fw-bold text-dark mb-3" style={{ fontSize: "2rem" }}>
            {roomData.name}
          </h2>
          <h3 className="text-dark mb-3" style={{ fontSize: "1.75rem", color: "#4f4f4f" }}>
            {roomData.price}
          </h3>
          <p className="mt-2 text-dark">
            <strong>Status:</strong>{" "}
            <span className={`badge ${roomData.status === "Available" ? "bg-success" : "bg-danger"}`}>
              {roomData.status}
            </span>
          </p>
          <p className="text-muted" style={{ fontWeight: "lighter" }}>
  <strong className="text-dark" style={{ fontWeight: "bold" }}>Location: </strong> 
  <span className="text-muted" style={{ fontWeight: "lighter" }}>{roomData.address}</span>
</p>

          <p className="text-muted mb-4" style={{ fontWeight: "lighter" }}>
            {roomData.description}
          </p>

          <a href="/rooms-order" className="btn btn-primary py-3 px-5 rounded-pill w-100">
            I'm Interested <i className="fas fa-handshake ps-2"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default SingleRoom;
