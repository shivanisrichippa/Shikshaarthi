import React, { useEffect, useState } from "react";
import assets from "../assets/assets.js";
import "./Services.css";

const laundryData = [
  { id: 1, name: "Fresh Wash", costPerKg: "₹50", ironing: "Available", location: "Hostel A", imageUrl: assets.l1 },
  { id: 2, name: "Quick Clean", costPerKg: "₹40", ironing: "Not Available", location: "Hostel A", imageUrl: assets.l2 },
  { id: 3, name: "Sparkle Laundry", costPerKg: "₹60", ironing: "Available", location: "Hostel A", imageUrl: assets.l3 },
];

const LaundryCard = ({ service }) => (
  <div className="col-md-8 col-lg-4 wow bounceInUp" data-wow-delay="0.1s">
    <div className="card border-0">
      <div className="card-img-top position-relative overflow-hidden">
        <img className="img-fluid rounded w-100" src={service.imageUrl} alt={service.name} />
        <div className="view-overlay d-flex justify-content-center align-items-center">
          <a href={`/laundry/${service.id}`} className="view-icon">
            <i className="fas fa-search-plus fa-2x"></i>
          </a>
        </div>
      </div>
      <div className="card-body text-center">
        <h4 className="card-title mb-2">{service.name}</h4>
        <p className="card-text mb-1"><strong>Cost per Kg:</strong> {service.costPerKg}</p>
        <p className="card-text mb-2"><strong>Ironing:</strong> {service.ironing}</p>
        <a href={`/laundry/${service.id}`} className="btn btn-primary py-2 px-5 rounded-pill know-more-btn">
          Know More <i className="fas fa-arrow-right ps-2"></i>
        </a>
      </div>
    </div>
  </div>
);

const Laundry = () => {
  const [services, setServices] = useState([]);
  const [userLocation, setUserLocation] = useState("Hostel A");

  useEffect(() => {
    // Filter services based on user location
    const filteredServices = laundryData.filter(service => service.location === userLocation);
    setServices(filteredServices);
  }, [userLocation]);

  return (
    <div>
      {/* Heading Section */}
      <div className="container-fluid bg-light py-4 my-0 mt-0">
        <div className="container text-center">
          <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3">
            Our Services
          </small>
          <h1 className="display-5 mb-3">Laundry Services</h1>
          <h6 className="display-9 mb-1">Based on your College Location, these are the laundry services available!</h6>
        </div>
      </div>

      {/* Services List Section */}
      <div className="container-fluid py-1">
        <div className="container">
          <div className="row g-4">
            {services.length > 0 ? (
              services.map(service => <LaundryCard key={service.id} service={service} />)
            ) : (
              <p className="text-center">No laundry services available at your location.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Laundry;
