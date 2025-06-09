import React from 'react';
import { Link } from 'react-router-dom';
import assets from '../assets/assets.js'; // 1. Import the assets object

// --- Style & Configuration Constants ---
const goldColor = '#d4a762';
const blackColor = '#212529';
const whiteColor = '#fff';

/**
 * A reusable placeholder page for services that are not yet launched.
 * It informs the user that the feature is coming soon and provides a way back to the homepage.
 */
const Launching = () => {
  return (
    <div 
      className="container-fluid d-flex align-items-center justify-content-center" 
      style={{ 
        minHeight: '80vh', 
        backgroundColor: '#f8f9fa',
        textAlign: 'center' 
      }}
    >
      <div className="p-5">
        {/* --- LOGO INTEGRATION --- */}
        {/* 2. The rocket icon is replaced with your logo */}
        <div className="mb-5">
          <img 
            src={assets.logo} // Assuming the key is 'logo' in your assets file
            alt="Shikshaarthi Logo" 
            style={{ 
              height: '150px', // Adjust the height as needed
              objectFit: 'contain'
            }} 
          />
        </div>

        {/* Main Heading */}
        <h1 
          className="display-3 fw-bold" 
          style={{ color: blackColor }}
        >
          Service Launching Soon!
        </h1>

        {/* Informative Subtext */}
        <p 
          className="fs-4 text-muted mt-3 mb-4" 
          style={{ maxWidth: '700px', margin: 'auto' }}
        >
          Our team is working hard behind the scenes to build this amazing new feature for you. 
          It's going to be worth the wait!
        </p>

        {/* Call to Action Button */}
        <Link 
          to="/" 
          className="btn btn-lg" 
          style={{ 
            backgroundColor: goldColor, 
            color: whiteColor, 
            padding: '12px 30px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          <i className="fas fa-home me-2"></i>
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default Launching;