import React from 'react';

const Footer = () => {
  return (
    <footer className="content-footer footer bg-footer-theme">
      <div className="container-xxl d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column">
        <div className="mb-2 mb-md-0">
          © {new Date().getFullYear()}, made with ❤️ by{' '}
          <a href="https://shikshaarthi.com" target="_blank" rel="noopener noreferrer" className="footer-link fw-bolder">
            Shikshaarthi
          </a>
        </div>
        <div>
          <a href="https://shikshaarthi.com" className="footer-link me-4" target="_blank" rel="noopener noreferrer">
            License
          </a>
          <a href="https://shikshaarthi.com" target="_blank" rel="noopener noreferrer" className="footer-link me-4">
            Users panel
          </a>
         
          <a
            href="https://shikshaarthi.com/contact"
            target="_blank" rel="noopener noreferrer"
            className="footer-link me-4"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;