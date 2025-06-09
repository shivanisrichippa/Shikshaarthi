import React, { useEffect } from "react";
import WOW from "wow.js";
import "animate.css"; // Ensure animations work properly

const services = [
  {
    icon: "fas fa-home",
    title: "Rental Rooms",
    description: "Find nearby hostel rooms with pricing and availability.",
    link: "/launching",
  },
  {
    icon: "fas fa-utensils",
    title: "Mess Services",
    description: "Switch messes weekly, view menus, and pay per week.",
    link: "/launching",
  },
  {
    icon: "fas fa-shopping-cart",
    title: "Buy Pre-Owned Stationery",
    description: "Purchase second-hand books, notes, and accessories.",
    link: "/launching",
  },
  {
    icon: "fas fa-handshake",
    title: "Sell Pre-Owned Stationery",
    description: "Sell used stationery and educational materials easily.",
    link: "/launching",
  },
  {
    icon: "fas fa-hospital",
    title: "Medical Services",
    description: "Find nearby hospitals and medical shops with ease.",
    link: "/launching",
  },
  {
    icon: "fas fa-tshirt",
    title: "Laundry Services",
    description: "Find nearby laundry services for hassle-free washing.",
    link: "/launching",
  },
  {
    icon: "fas fa-bolt",
    title: "Electrician Services",
    description: "Get expert electricians for home repairs and installations.",
    link: "/launching",
  },
  {
    icon: "fas fa-wrench",
    title: "Plumber Services",
    description: "Hire professional plumbers for household repairs.",
    link: "/launching",
  },
];

const Services = () => {
  useEffect(() => {
    const wow = new WOW({
      live: false, // Prevents reinitializing animations unnecessarily
    });
    wow.init();
  }, []);

  return (
    <div className="container-fluid service py-6">
      <div className="container">
        <div className="text-center wow bounceInUp" data-wow-delay="0.1s">
          <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3">
            Our Services
          </small>
          <h1 className="display-5 mb-5">What We Offer</h1>
        </div>
        <div className="row g-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="col-lg-3 col-md-6 col-sm-12 wow bounceInUp"
              data-wow-delay={`${0.1 + index * 0.1}s`}
            >
              <div className="bg-light rounded service-item">
                <div className="service-content d-flex align-items-center justify-content-center p-4">
                  <div className="service-content-icon text-center">
                    <i className={`${service.icon} fa-7x text-primary mb-4`}></i>
                    <h4 className="mb-3">{service.title}</h4>
                    <p className="mb-4">{service.description}</p>
                    <a href={service.link} className="btn btn-primary px-4 py-2 rounded-pill">
                      Read More
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
