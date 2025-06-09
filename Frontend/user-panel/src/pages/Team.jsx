import React from 'react';
import assets from '../assets/assets.js'; // Adjust the path to your assets.js

const Team = () => {
  return (
    <div>
      <div className="container">
        <div className="text-center wow bounceInUp" data-wow-delay="0.1s">
          <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3">Our Team</small>
          <h1 className="display-5 mb-5">We have experienced Team</h1>
        </div>
        <div className="row g-4">
          <div className="col-lg-3 col-md-6 wow bounceInUp" data-wow-delay="0.1s">
            <div className="team-item rounded">
              <img className="img-fluid rounded-top" src={assets.team1} alt="Henry" />
              <div className="team-content text-center py-3 bg-dark rounded-bottom">
                <h4 className="text-primary">Henry</h4>
                <p className="text-white mb-0">Decoration Chef</p>
              </div>
              <div className="team-icon d-flex flex-column justify-content-center m-4">
                <a className="share btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fas fa-share-alt"></i></a>
                <a className="share-link btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fab fa-facebook-f"></i></a>
                <a className="share-link btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fab fa-twitter"></i></a>
                <a className="share-link btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 wow bounceInUp" data-wow-delay="0.3s">
            <div className="team-item rounded">
              <img className="img-fluid rounded-top" src={assets.team2} alt="Jemes Born" />
              <div className="team-content text-center py-3 bg-dark rounded-bottom">
                <h4 className="text-primary">Jemes Born</h4>
                <p className="text-white mb-0">Executive Chef</p>
              </div>
              <div className="team-icon d-flex flex-column justify-content-center m-4">
                <a className="share btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fas fa-share-alt"></i></a>
                <a className="share-link btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fab fa-facebook-f"></i></a>
                <a className="share-link btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fab fa-twitter"></i></a>
                <a className="share-link btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 wow bounceInUp" data-wow-delay="0.5s">
            <div className="team-item rounded">
              <img className="img-fluid rounded-top" src={assets.team3} alt="Martin Hill" />
              <div className="team-content text-center py-3 bg-dark rounded-bottom">
                <h4 className="text-primary">Martin Hill</h4>
                <p className="text-white mb-0">Kitchen Porter</p>
              </div>
              <div className="team-icon d-flex flex-column justify-content-center m-4">
                <a className="share btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fas fa-share-alt"></i></a>
                <a className="share-link btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fab fa-facebook-f"></i></a>
                <a className="share-link btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fab fa-twitter"></i></a>
                <a className="share-link btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-md-6 wow bounceInUp" data-wow-delay="0.7s">
            <div className="team-item rounded">
              <img className="img-fluid rounded-top" src={assets.team4} alt="Adam Smith" />
              <div className="team-content text-center py-3 bg-dark rounded-bottom">
                <h4 className="text-primary">Adam Smith</h4>
                <p className="text-white mb-0">Head Chef</p>
              </div>
              <div className="team-icon d-flex flex-column justify-content-center m-4">
                <a className="share btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fas fa-share-alt"></i></a>
                <a className="share-link btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fab fa-facebook-f"></i></a>
                <a className="share-link btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fab fa-twitter"></i></a>
                <a className="share-link btn btn-primary btn-md-square rounded-circle mb-2" href=""><i className="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
