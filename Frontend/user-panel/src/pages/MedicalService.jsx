import React, { useEffect, useState } from 'react';
import assets from '../assets/assets.js'; // Import images
import './Services.css'; // Import Services.css for styling

const medicalData = [
  { id: 1, name: 'City Hospital', type: 'Multi-Specialty Hospital', location: 'Downtown', imageUrl: assets.medical },
  { id: 2, name: 'LifeCare Pharmacy', type: '24/7 Medical Store', location: 'Near College Gate', imageUrl: assets.medical2 },
  { id: 3, name: 'Sunrise Clinic', type: 'General Physician & Diagnostics', location: 'Main Road', imageUrl: assets.medical3 },
  { id: 4, name: 'MediPlus Pharmacy', type: 'Health & Wellness Store', location: 'Shopping Complex', imageUrl: assets.medical2 },
];

const MedicalCard = ({ service }) => (
  <div className="col-md-6 col-lg-3 mb-4">
    <div className="card custom-card">
      {/* Image Section */}
      <div className="card-img-top">
        <img src={service.imageUrl} alt={service.name} />
        <div className="view-overlay">
          <a href={`/medical/${service.id}`} className="view-icon">
            <i className="fas fa-search-plus"></i>
          </a>
        </div>
      </div>

      {/* Card Body */}
      <div className="card-body text-center">
        <h5 className="card-title">{service.name}</h5>
        <p className="card-text"><strong>Type:</strong> {service.type}</p>
        <p className="card-text"><strong>Location:</strong> {service.location}</p>
       
        <a href={`/medical/${service.id}`} className="btn btn-primary py-2 px-5 rounded-pill know-more-btn">
          Know More <i className="fas fa-arrow-right ps-2"></i>
        </a>
      </div>
    </div>
  </div>
);

const MedicalService = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    setServices(medicalData);
  }, []);

  return (
    <div>
      {/* Header Section */}
      <div className="container-fluid bg-light py-5">
        <div className="container text-center">
          <small className="section-heading">
            Your Health, Our Priority 💙
          </small>
          <h1 className="display-5 fw-bold text-primary">Medical Services</h1>
          <h6 className="lead text-muted">
            Explore the best hospitals, clinics, and medical shops near you! 🏥💊
          </h6>
        </div>
      </div>

      {/* Medical Services List */}
      <div className="container-fluid py-4">
        <div className="container">
          <div className="row g-4">
            {services.length > 0 ? (
              services.map(service => <MedicalCard key={service.id} service={service} />)
            ) : (
              <p className="text-center text-danger">No medical services available at your location.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalService;
