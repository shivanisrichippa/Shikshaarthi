import React from "react";
import { Link } from "react-router-dom";
import assets from '../assets/assets.js';
import path from "path";

const services = [
  { id: 1, name: "Mess Services", img: assets.mess, path: "mess" },
  { id: 2, name: "Rental Rooms", img: assets.r1, path: "room" },
  { id: 3, name: "Medical Services", img: assets.medical, path: "medical" },
  { id: 4, name: "Plumber Services", img: assets.household, path: "plumber" },
  { id: 5, name: "Electrician Services", img: assets.electrican, path: "electrician" },
  { id: 6, name: "Laundry Services", img: assets.laundry, path: "laundry" },

 
];

const Add = () => {
  return (
    <div className="container-fluid bg-light py-5 my-6 mt-0">
      <div className="container-fluid blog py-4">
        <div className="container">
          <div className="text-center">
            <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3">
              Earn Rewards
            </small>
            <h1 className="display-5 mb-5">Upload and Earn Supercoins</h1>
          </div>

          <div className="row gx-4 justify-content-center">
            {services.map((service) => (
              <div className="col-md-6 col-lg-4" key={service.id}>
                <div className="blog-item">
                  <div className="overflow-hidden rounded" style={{ width: "100%", height: "250px" }}>
                    <img src={service.img} className="img-fluid w-100 h-100" style={{ objectFit: "cover" }} alt={service.name} />
                  </div>
                  <div className="blog-content mx-4 d-flex rounded bg-light">
                    <div className="text-dark bg-primary rounded-start">
                      <div className="h-100 p-3 d-flex flex-column justify-content-center text-center">
                        <p className="fw-bold mb-0">Upload</p>
                      </div>
                    </div>
                    <Link to={`/add/${service.path}`} className="h5 lh-base my-auto h-100 p-3 text-decoration-none text-dark">
                      {service.name}
                    </Link>
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

export default Add;
