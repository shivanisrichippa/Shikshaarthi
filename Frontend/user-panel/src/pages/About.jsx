import React from "react";
import assets from "../assets/assets"; // Adjust the path if needed

const ServiceSection = ({ title, description, image, reverse }) => (
  <div className={`row g-5 align-items-center mb-5 ${reverse ? "flex-lg-row-reverse" : ""} wow bounceInUp`} data-wow-delay="0.1s">
    <div className="col-lg-5">
      <img src={image} className="img-fluid rounded" alt={title} />
    </div>
    <div className="col-lg-7">
      <h2 className="text-primary">{title}</h2>
      <p>{description}</p>
    </div>
  </div>
);

const About = () => {
  const services = [
    {
      title: "Mess Services",
      description:
        "Easily switch messes on a weekly basis, view updated menus, and pay conveniently without hassle. Choose from verified hostel messes offering a variety of cuisines.",
      image: assets.mess,
      reverse: false,
    },
    {
      title: "Rental Rooms",
      description:
        "Browse through available hostels and PG accommodations with real images, pricing, and proximity to colleges. We help students find comfortable and affordable living spaces.",
      image: assets.r4,
      reverse: true,
    },
    {
      title: "Household Services",
      description:
        "Facing issues in your room? Find plumbers, electricians, cleaners, and other essential household services right from the platform.",
      image: assets.household,
      reverse: false,
    },
    {
      title: "Medical Services",
      description:
        "Search for nearby medical shops, hospitals, and emergency services. Get information on the availability of medicines and healthcare facilities.",
      image: assets.medical,
      reverse: true,
    },
    {
      title: "Pre-Owned Stationary",
      description:
        "Buy and sell second-hand books, notebooks, and study materials at affordable rates. Save money while promoting a sustainable cycle of resources.",
      image: assets.preown2,
      reverse: false,
    },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="container text-center py-4">
        <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 wow fadeIn" data-wow-delay="0.1s">
          About Us
        </small>
        <h1 className="display-5 my-3 wow fadeIn" data-wow-delay="0.2s">Shikshaarthi - Simplifying Life for Hostelers</h1>
        <p className="text-muted px-md-5 wow fadeIn" data-wow-delay="0.3s">
          Shikshaarthi is your go-to platform for managing hostel life efficiently. From
          accommodation to mess services, medical assistance, and stationary needs,
          we have got you covered!
        </p>
      </div>

      <div className="container mt-5">
        {services.map((service, index) => (
          <ServiceSection key={index} {...service} />
        ))}
      </div>
    </div>
  );
};

export default About;
