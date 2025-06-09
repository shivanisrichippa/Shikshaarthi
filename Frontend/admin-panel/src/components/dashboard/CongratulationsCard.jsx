import React from 'react';
import assets from '../../assets/assets.js';
const CongratulationsCard = () => {
  return (
    <div className="card">
      <div className="d-flex align-items-end row">
        <div className="col-sm-7">
          <div className="card-body">
            <h5 className="card-title text-primary">Congratulations John! 🎉</h5>
            <p className="mb-4">
              You have done <span className="fw-bold">72%</span> more sales today. Check your new badge in your profile.
            </p>
            <a href="#!" className="btn btn-sm btn-outline-primary">View Badges</a>
          </div>
        </div>
        <div className="col-sm-5 text-center text-sm-left">
          <div className="card-body pb-0 px-0 px-md-4">
            <img
              src={assets.manWithLaptopLightPng} // Make sure this path is correct relative to your public folder
              height="140"
              alt="View Badge User"
              data-app-dark-img={assets.manWithLaptopLightPng}
              data-app-light-img={assets.manWithLaptopLightPng}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CongratulationsCard;