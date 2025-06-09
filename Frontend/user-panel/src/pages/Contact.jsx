import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000); // Reset message after 3s
      setFormData({ name: "", email: "", message: "" });
    }
  };

  return (
    <div className="container-fluid contact py-3">
      <div className="container">
        <div className="p-5 bg-light rounded contact-form">
          <div className="row g-4">
            <div className="col-12 text-center">
              <small className="fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3 d-inline-block">
                Get in touch
              </small>
              <h1 className="display-5 mb-4">Contact Us For Any Queries!</h1>
            </div>
            <div className="col-md-6 col-lg-7">
              {submitted && <p className="alert alert-success">Message sent successfully!</p>}
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  className="w-100 form-control p-3 mb-4 border-primary bg-light"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  className="w-100 form-control p-3 mb-4 border-primary bg-light"
                  placeholder="Enter Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <textarea
                  name="message"
                  className="w-100 form-control p-3 border-primary bg-light"
                  rows="4"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
                <button
                  className="w-100 btn btn-primary p-3 border-primary bg-primary rounded-pill mt-3"
                  type="submit"
                >
                  Submit Now
                </button>
              </form>
            </div>
            <div className="col-md-6 col-lg-5">
              <div className="border border-primary p-4 rounded mb-4 d-flex align-items-start">
                <i className="fas fa-map-marker-alt fa-2x text-primary me-4"></i>
                <div>
                  <h4>Address</h4>
                  <p>123 Street, New York, USA</p>
                </div>
              </div>
              <div className="border border-primary p-4 rounded mb-4 d-flex align-items-start">
                <i className="fas fa-envelope fa-2x text-primary me-4"></i>
                <div>
                  <h4>Mail Us</h4>
                  <p className="mb-2">info@example.com</p>
                  <p className="mb-0">support@example.com</p>
                </div>
              </div>
              <div className="border border-primary p-4 rounded d-flex align-items-start">
                <i className="fa fa-phone-alt fa-2x text-primary me-4"></i>
                <div>
                  <h4>Telephone</h4>
                  <p className="mb-2">(+012) 3456 7890 123</p>
                  <p className="mb-0">(+704) 5555 0127 296</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
