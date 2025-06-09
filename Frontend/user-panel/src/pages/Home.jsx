import React from 'react';
import assets from '../assets/assets.js';
import Fact from './Fact.jsx';
import Services from './Services.jsx';
import Demo from './Demo.jsx';

import Team from './Team.jsx';
import Supercoin from './Supercoin.jsx';

// import Testimonials from './Testimonials.jsx';

const Home = () => {
  return (
    <div>
      <div className="container-fluid bg-light py-5 my-3 mt-0">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-7 col-md-12">
              <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-4 animated bounceInDown">
                Welcome to Shikshaarthi
              </small>
              <h1 className="display-1 mb-4 animated bounceInDown">
                <span className="text-primary">Shikshaarthi</span> Simplifying Life of Hostlers
              </h1>
              <a href="/sign-up" className="btn btn-primary border-0 rounded-pill py-3 px-4 px-md-5 me-4 animated bounceInLeft">
                Sign Up Now
              </a>
              <a href="/about" className="btn btn-primary border-0 rounded-pill py-3 px-4 px-md-5 animated bounceInLeft">
                Know More
              </a>
            </div>
            <div className="col-lg-5 col-md-12">
              <img src={assets.hero} className="img-fluid rounded animated zoomIn" alt="WhatsApp Preview" />
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-6">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-5 wow bounceInUp" data-wow-delay="0.1s">
              <img src={assets.about2} className="img-fluid rounded" alt="About Us" />
            </div>
            <div className="col-lg-7 wow bounceInUp" data-wow-delay="0.3s">
              <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3">
                About Us
              </small>
              <h1 className="display-5 mb-4">Shikshaarthi - Simplifying Lives Of Hostlers</h1>
              <p className="mb-4">
                Shikshaarthi is a pioneering website designed to streamline and simplify the lives of students, particularly those living away from home.
                Shikshaarthi is the one-stop solution for every problem faced by students during their college lives.
              </p>
              <div className="row g-4 text-dark mb-5">
                <div className="col-sm-6">
                  <i className="fas fa-share text-primary me-2"></i>Rental Rooms
                </div>
                <div className="col-sm-6">
                  <i className="fas fa-share text-primary me-2"></i>Mess Services
                </div>
                <div className="col-sm-6">
                  <i className="fas fa-share text-primary me-2"></i>Pre-Owned Stationary
                </div>
                <div className="col-sm-6">
                  <i className="fas fa-share text-primary me-2"></i>Household Services
                </div>
                <div className="col-sm-6">
                  <i className="fas fa-share text-primary me-2"></i>Health Services
                </div>
              </div>
              <a href="/about" className="btn btn-primary py-3 px-5 rounded-pill">
                About Us<i className="fas fa-arrow-right ps-2"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <Supercoin />
      
      {/* <SpinWheelComponent /> */}
      <Fact />
      <Services />
      <Demo />
      

    </div>
  );
};

export default Home;
