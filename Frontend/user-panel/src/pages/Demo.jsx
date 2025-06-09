import React, { useState, useMemo } from "react";
import assets from "../assets/assets.js"; // Import your assets

const services = [
  { id: "tab-1", name: "All", category: "all" },
  { id: "tab-2", name: "Mess", category: "mess" },
  { id: "tab-3", name: "Rental", category: "rental" },
  { id: "tab-4", name: "Household", category: "household" },
  { id: "tab-5", name: "Medical", category: "medical" },
  { id: "tab-6", name: "Stationary", category: "stationary" },
];

const events = [
  { img: assets.mess, title: "Mess Service ", category: "mess", id: "event-1" },
  // { img: assets.event1, title: "Mess Service 2", category: "mess", id: "event-2" },
  // { img: assets.event5, title: "Mess Service 3", category: "mess", id: "event-3" },
  { img: assets.r1, title: "Rental Room ", category: "rental", id: "event-4" },
  // { img: assets.r4, title: "Rental Room 2", category: "rental", id: "event-5" },
  // { img: assets.r2, title: "Rental Room 3", category: "rental", id: "event-6" },
  { img: assets.household, title: "Household Service ", category: "household", id: "event-7" },
  // { img: assets.electrican, title: "Household Service 2", category: "household", id: "event-8" },
  // { img: assets.laundry, title: "Household Service 3", category: "household", id: "event-9" },
  { img: assets.medical, title: "Medical Service ", category: "medical", id: "event-10" },
  // { img: assets.medical2, title: "Medical Service 2", category: "medical", id: "event-11" },
  // { img: assets.medical3, title: "Medical Service 3", category: "medical", id: "event-12" },
  { img: assets.preown, title: "Pre-Owned Stationary ", category: "stationary", id: "event-13" },
  // { img: assets.preown2, title: "Pre-Owned Stationary 2", category: "stationary", id: "event-14" },
  // { img: assets.preown3, title: "Pre-Owned Stationary 3", category: "stationary", id: "event-15" },
];

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const Demo = () => {
  const [activeTab, setActiveTab] = useState("all");

  // Prevent re-shuffling on each render
  const shuffledEvents = useMemo(() => shuffleArray(events), []);

  return (
    <div className="container-fluid event py-6">
      <div className="container">
        <div className="text-center wow bounceInUp" data-wow-delay="0.1s">
          <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3">
            Latest Events
          </small>
          <h1 className="display-5 mb-5">Demo of Services We Offer</h1>
        </div>

        {/* Tabs */}
        <div className="tab-class text-center">
          <ul className="nav nav-pills d-inline-flex flex-wrap justify-content-center mb-5 wow bounceInUp" data-wow-delay="0.1s">
            {services.map((service) => (
              <li className="nav-item px-1" key={service.id}>
                <button
                  className={`d-flex mx-1 px-3 py-2 border border-primary bg-light rounded-pill ${
                    activeTab === service.category ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(service.category)}
                >
                  <span className="text-dark">{service.name}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Filtered & Shuffled Images */}
          <div className="row g-4">
            {shuffledEvents
              .filter((event) => activeTab === "all" || event.category === activeTab)
              .map((event, idx) => (
                <div className="col-md-6 col-lg-3 wow bounceInUp" data-wow-delay={`${0.1 + idx * 0.05}s`} key={event.id}>
                  <div className="event-img position-relative">
                    <img 
                      className="img-fluid rounded w-100" 
                      src={event.img} 
                      alt={event.title} 
                      style={{ height: "300px", objectFit: "cover" }} 
                    />
                    <div className="event-overlay d-flex flex-column p-4">
                      <h4 className="me-auto">{event.title}</h4>
                      <a href={event.img} data-lightbox={`event-${idx}`} className="my-auto">
                        <i className="fas fa-search-plus text-dark fa-2x"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
