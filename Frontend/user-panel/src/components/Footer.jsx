import React from "react";
import { Link } from "react-router-dom";
import assets from "../assets/assets.js"; // Adjust the import path as necessary

const Footer = () => {
  const services = [
    { name: "Mess Service", path: "/launching" },
    { name: "Rental Rooms", path:  "/launching"  },
    { name: "Medical Service", path:  "/launching"  },
    { name: "Pre-Owned Stationary", path:  "/launching" },
    { name: "Household Services", path:  "/launching" },
  ];

  const contactInfo = [
    { icon: "fa-map-marker-alt", text: "Maharashtra, Kolhapur" },
    { icon: "fa-phone-alt", text: "+91 8329628404" },
    { icon: "fas fa-envelope", text: "shiksharthi.company@gmail.com" },
    { icon: "fa-clock", text: "24/7 Service" },
  ];

  return (
    <footer className="bg-light">
      <div className="container py-6 my-6">
        <div className="row">
          {/* Brand Section */}
          <FooterSection title="Shikshaarthi">
            <h1 className="text-primary fw-bold mb-2">
              Shiksha<span className="text-dark">rthi</span>
            </h1>
            <p className="mb-4">Simplifying Lives Of Hostelers</p>
            <div className="d-flex">
              {["facebook-f", "twitter", "instagram", "linkedin-in"].map(
                (platform) => (
                  <a
                    key={platform}
                    href="#"
                    className="btn btn-primary btn-sm-square me-2 rounded-circle"
                    aria-label={platform}
                  >
                    <i className={`fab fa-${platform}`}></i>
                  </a>
                )
              )}
            </div>
          </FooterSection>

          {/* Services Section */}
          <FooterSection title="Special Services">
            {services.map((service) => (
              <Link key={service.name} to={service.path} className="text-body mb-2 d-block">
                <i className="fa fa-check text-primary me-2"></i> {service.name}
              </Link>
            ))}
          </FooterSection>

          {/* Contact Section */}
          <FooterSection title="Contact Us">
            {contactInfo.map((info, index) => (
              <p key={index} className="mb-2">
                <i className={`fa ${info.icon} text-primary me-2`}></i> {info.text}
              </p>
            ))}
          </FooterSection>

          {/* Logo Section */}
          <FooterSection title="Our Logo">
            <div className="d-flex justify-content-center">
              <img
                src={assets.logo}
                className="img-fluid"
                alt="Shikshaarthi Logo"
                width="150"
              />
            </div>
          </FooterSection>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-dark text-light py-2">
        <div className="container text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()}{" "}
            <Link to="/" className="text-light">
              Shikshaarthi
            </Link>
            , All rights reserved.
          </p>
          <p>
            Designed By{" "}
            <a className="text-light border-bottom" href="https://www.linkedin.com/in/shivanisrichippa">
              Shivanisri Chippa
            </a>{" "}
            | Telangana
          </p>
        </div>
      </div>

      {/* Back to Top Button */}
      <a href="/" className="btn btn-primary rounded-circle back-to-top">
        <i className="fa fa-arrow-up"></i>
      </a>
    </footer>
  );
};

// Reusable Footer Section Component
const FooterSection = ({ title, children }) => (
  <div className="col-lg-3 col-md-6">
    <div className="footer-item">
      <h4 className="mb-4">{title}</h4>
      {children}
    </div>
  </div>
);

export default Footer;
