// import React from 'react'
// import assets from '../assets/assets.js'
// const Testimonials = () => {
//   return (
//     <div>

       
// <div className="container-fluid py-6">
//             <div className="container">
//                 <div className="text-center wow bounceInUp" data-wow-delay="0.1s">
//                     <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3">Testimonial</small>
//                     <h1 className="display-5 mb-5">What Our Customers says!</h1>
//                 </div>
//                 <div className="owl-carousel owl-theme testimonial-carousel testimonial-carousel-1 mb-4 wow bounceInUp" data-wow-delay="0.1s">
//                     <div className="testimonial-item rounded bg-light">
//                         <div className="d-flex mb-3">
//                             <img src={assets.testimonial1} className="img-fluid rounded-circle flex-shrink-0" alt=""/>
//                             <div className="position-absolute" style="top: 15px; right: 20px;">
//                                 <i className="fa fa-quote-right fa-2x"></i>
//                             </div>
//                             <div className="ps-3 my-auto">
//                                 <h4 className="mb-0">Person Name</h4>
//                                 <p className="m-0">Profession</p>
//                             </div>
//                         </div>
//                         <div className="testimonial-content">
//                             <div className="d-flex">
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                             </div>
//                             <p className="fs-5 m-0 pt-3">Lorem ipsum dolor sit amet elit, sed do eiusmod tempor ut labore et dolore magna aliqua.</p>
//                         </div>
//                     </div>
//                     <div className="testimonial-item rounded bg-light">
//                         <div className="d-flex mb-3">
//                             <img src={assets.testimonial2} className="img-fluid rounded-circle flex-shrink-0" alt=""/>
//                             <div className="position-absolute" style="top: 15px; right: 20px;">
//                                 <i className="fa fa-quote-right fa-2x"></i>
//                             </div>
//                             <div className="ps-3 my-auto">
//                                 <h4 className="mb-0">Person Name</h4>
//                                 <p className="m-0">Profession</p>
//                             </div>
//                         </div>
//                         <div className="testimonial-content">
//                             <div className="d-flex">
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                             </div>
//                             <p className="fs-5 m-0 pt-3">Lorem ipsum dolor sit amet elit, sed do eiusmod tempor ut labore et dolore magna aliqua.</p>
//                         </div>
//                     </div>
//                     <div className="testimonial-item rounded bg-light">
//                         <div className="d-flex mb-3">
//                             <img src={assets.testimonial4} className="img-fluid rounded-circle flex-shrink-0" alt=""/>
//                             <div className="position-absolute" style="top: 15px; right: 20px;">
//                                 <i className="fa fa-quote-right fa-2x"></i>
//                             </div>
//                             <div className="ps-3 my-auto">
//                                 <h4 className="mb-0">Person Name</h4>
//                                 <p className="m-0">Profession</p>
//                             </div>
//                         </div>
//                         <div className="testimonial-content">
//                             <div className="d-flex">
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                             </div>
//                             <p className="fs-5 m-0 pt-3">Lorem ipsum dolor sit amet elit, sed do eiusmod tempor ut labore et dolore magna aliqua.</p>
//                         </div>
//                     </div>
//                     <div className="testimonial-item rounded bg-light">
//                         <div className="d-flex mb-3">
//                             <img src={assets.testimonial1} className="img-fluid rounded-circle flex-shrink-0" alt=""/>
//                             <div className="position-absolute" style="top: 15px; right: 20px;">
//                                 <i className="fa fa-quote-right fa-2x"></i>
//                             </div>
//                             <div className="ps-3 my-auto">
//                                 <h4 className="mb-0">Person Name</h4>
//                                 <p className="m-0">Profession</p>
//                             </div>
//                         </div>
//                         <div className="testimonial-content">
//                             <div className="d-flex">
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                             </div>
//                             <p className="fs-5 m-0 pt-3">Lorem ipsum dolor sit amet elit, sed do eiusmod tempor ut labore et dolore magna aliqua.</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="owl-carousel testimonial-carousel testimonial-carousel-2 wow bounceInUp" data-wow-delay="0.3s">
//                     <div className="testimonial-item rounded bg-light">
//                         <div className="d-flex mb-3">
//                             <img src="img/testimonial-1.jpg" className="img-fluid rounded-circle flex-shrink-0" alt=""/>
//                             <div className="position-absolute" style="top: 15px; right: 20px;">
//                                 <i className="fa fa-quote-right fa-2x"></i>
//                             </div>
//                             <div className="ps-3 my-auto">
//                                 <h4 className="mb-0">Person Name</h4>
//                                 <p className="m-0">Profession</p>
//                             </div>
//                         </div>
//                         <div className="testimonial-content">
//                             <div className="d-flex">
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                             </div>
//                             <p className="fs-5 m-0 pt-3">Lorem ipsum dolor sit amet elit, sed do eiusmod tempor ut labore et dolore magna aliqua.</p>
//                         </div>
//                     </div>
//                     <div className="testimonial-item rounded bg-light">
//                         <div className="d-flex mb-3">
//                             <img src={assets.testimonial2} className="img-fluid rounded-circle flex-shrink-0" alt=""/>
//                             <div className="position-absolute" style="top: 15px; right: 20px;">
//                                 <i className="fa fa-quote-right fa-2x"></i>
//                             </div>
//                             <div className="ps-3 my-auto">
//                                 <h4 className="mb-0">Person Name</h4>
//                                 <p className="m-0">Profession</p>
//                             </div>
//                         </div>
//                         <div className="testimonial-content">
//                             <div className="d-flex">
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                             </div>
//                             <p className="fs-5 m-0 pt-3">Lorem ipsum dolor sit amet elit, sed do eiusmod tempor ut labore et dolore magna aliqua.</p>
//                         </div>
//                     </div>
//                     <div className="testimonial-item rounded bg-light">
//                         <div className="d-flex mb-3">
//                             <img src={assets.testimonial3} className="img-fluid rounded-circle flex-shrink-0" alt=""/>
//                             <div className="position-absolute" style="top: 15px; right: 20px;">
//                                 <i className="fa fa-quote-right fa-2x"></i>
//                             </div>
//                             <div className="ps-3 my-auto">
//                                 <h4 className="mb-0">Person Name</h4>
//                                 <p className="m-0">Profession</p>
//                             </div>
//                         </div>
//                         <div className="testimonial-content">
//                             <div className="d-flex">
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                             </div>
//                             <p className="fs-5 m-0 pt-3">Lorem ipsum dolor sit amet elit, sed do eiusmod tempor ut labore et dolore magna aliqua.</p>
//                         </div>
//                     </div>
//                     <div className="testimonial-item rounded bg-light">
//                         <div className="d-flex mb-3">
//                             <img src={assets.testimonial4} className="img-fluid rounded-circle flex-shrink-0" alt=""/>
//                             <div className="position-absolute" style="top: 15px; right: 20px;">
//                                 <i className="fa fa-quote-right fa-2x"></i>
//                             </div>
//                             <div className="ps-3 my-auto">
//                                 <h4 className="mb-0">Person Name</h4>
//                                 <p className="m-0">Profession</p>
//                             </div>
//                         </div>
//                         <div className="testimonial-content">
//                             <div className="d-flex">
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                                 <i className="fas fa-star text-primary"></i>
//                             </div>
//                             <p className="fs-5 m-0 pt-3">Lorem ipsum dolor sit amet elit, sed do eiusmod tempor ut labore et dolore magna aliqua.</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
       

      
//     </div>
//   )
// }

// export default Testimonials

import React from 'react';
import assets from '../assets/assets.js';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Person Name 1',
      profession: 'Profession 1',
      image: assets.testimonial1,
      feedback: 'Lorem ipsum dolor sit amet elit, sed do eiusmod tempor ut labore et dolore magna aliqua.'
    },
    {
      name: 'Person Name 2',
      profession: 'Profession 2',
      image: assets.testimonial2,
      feedback: 'Lorem ipsum dolor sit amet elit, sed do eiusmod tempor ut labore et dolore magna aliqua.'
    },
    {
      name: 'Person Name 3',
      profession: 'Profession 3',
      image: assets.testimonial3,
      feedback: 'Lorem ipsum dolor sit amet elit, sed do eiusmod tempor ut labore et dolore magna aliqua.'
    },
    {
      name: 'Person Name 4',
      profession: 'Profession 4',
      image: assets.testimonial4,
      feedback: 'Lorem ipsum dolor sit amet elit, sed do eiusmod tempor ut labore et dolore magna aliqua.'
    },
  ];

  return (
    <div className="container-fluid py-6">
      <div className="container">
        <div className="text-center wow bounceInUp" data-wow-delay="0.1s">
          <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3">
            Testimonial
          </small>
          <h1 className="display-5 mb-5">What Our Customers Say!</h1>
        </div>

        <div className="owl-carousel owl-theme testimonial-carousel testimonial-carousel-1 mb-4 wow bounceInUp" data-wow-delay="0.1s">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-item rounded bg-light">
              <div className="d-flex mb-3">
                <img
                  src={testimonial.image}
                  className="img-fluid rounded-circle flex-shrink-0"
                  alt={testimonial.name}
                />
                <div className="position-absolute" style={{ top: '15px', right: '20px' }}>
                  <i className="fa fa-quote-right fa-2x"></i>
                </div>
                <div className="ps-3 my-auto">
                  <h4 className="mb-0">{testimonial.name}</h4>
                  <p className="m-0">{testimonial.profession}</p>
                </div>
              </div>
              <div className="testimonial-content">
                <div className="d-flex">
                  <i className="fas fa-star text-primary"></i>
                  <i className="fas fa-star text-primary"></i>
                  <i className="fas fa-star text-primary"></i>
                  <i className="fas fa-star text-primary"></i>
                  <i className="fas fa-star text-primary"></i>
                </div>
                <p className="fs-5 m-0 pt-3">{testimonial.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
