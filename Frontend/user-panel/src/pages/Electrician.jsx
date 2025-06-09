import React, { useEffect, useState } from "react";
import assets from "../assets/assets.js";
import "./Services.css";

const electricianData = [
  { id: 1, name: "Rajesh Kumar", contact: "+91 9876543210", location: "Hostel A", imageUrl: assets.e1 },
  { id: 2, name: "Amit Sharma", contact: "+91 8765432109", location: "Hostel A", imageUrl: assets.e2 },
  { id: 3, name: "Sunil Verma", contact: "+91 7654321098", location: "Hostel A", imageUrl: assets.e3 },
];

const ElectricianCard = ({ service }) => (
  <div className="col-md-8 col-lg-4 wow bounceInUp" data-wow-delay="0.1s">
    <div className="card border-0">
      <div className="card-img-top position-relative overflow-hidden">
        <img className="img-fluid rounded w-100" src={service.imageUrl} alt={service.name} />
        <div className="view-overlay d-flex justify-content-center align-items-center">
          <a href={`tel:${service.contact}`} className="view-icon">
            <i className="fas fa-phone fa-2x"></i>
          </a>
        </div>
      </div>
      <div className="card-body text-center">
        <h4 className="card-title mb-2">{service.name}</h4>
        <p className="card-text mb-1"><strong>Contact:</strong> {service.contact}</p>
        <a href={`/electrician/${service.id}`} className="btn btn-primary py-2 px-5 rounded-pill know-more-btn">
          Know more <i className="fas fa-phone ps-2"></i>
        </a>
      </div>
    </div>
  </div>
);

const Electrician = () => {
  const [services, setServices] = useState([]);
  const [userLocation, setUserLocation] = useState("Hostel A");

  useEffect(() => {
    // Filter electricians based on user location
    const filteredServices = electricianData.filter(service => service.location === userLocation);
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
          <h1 className="display-5 mb-3">Electrician Services</h1>
          <h6 className="display-9 mb-1">Based on your College Location, these are the available electricians!</h6>
        </div>
      </div>

      {/* Services List Section */}
      <div className="container-fluid py-1">
        <div className="container">
          <div className="row g-4">
            {services.length > 0 ? (
              services.map(service => <ElectricianCard key={service.id} service={service} />)
            ) : (
              <p className="text-center">No electricians available at your location.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Electrician;
