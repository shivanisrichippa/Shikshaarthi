// import React, { useEffect, useState } from 'react';
// import assets from '../assets/assets.js';
// import './Services.css';

// const messData = [
//   { id: 1, name: 'Mess A', price: `₹${Math.floor(Math.random() * 500) + 100}/week`, address: 'Near College Gate', location: 'A', imageUrl: assets.event4 },
//   { id: 2, name: 'Mess B', price: `₹${Math.floor(Math.random() * 500) + 100}/week`, address: 'Main Road', location: 'A', imageUrl: assets.event5 },
//   { id: 3, name: 'Mess C', price: `₹${Math.floor(Math.random() * 500) + 100}/week`, address: 'Inside Campus', location: 'A', imageUrl: assets.event3 },
//   { id: 4, name: 'Mess D', price: `₹${Math.floor(Math.random() * 500) + 100}/week`, address: 'Backside of Hostel', location: 'A', imageUrl: assets.event6 },
// ];

// const MessCard = ({ mess }) => (
//   <div className="col-md-6 col-lg-3 wow bounceInUp" data-wow-delay="0.1s">
//     <div className="card border-0">
//       <div className="card-img-top position-relative overflow-hidden">
//         <img className="img-fluid rounded w-100" src={mess.imageUrl} alt={mess.name} />
//         <div className="view-overlay d-flex justify-content-center align-items-center">
//           <a href={`/mess/${mess.id}`} className="view-icon">
//             <i className="fas fa-search-plus fa-2x"></i>
           
//           </a>
//         </div>
//       </div>
//       <div className="card-body text-center">
//         <h4 className="card-title mb-2">{mess.name}</h4>
//         <p className="card-text mb-1"><strong>Price per Week:</strong> {mess.price}</p>
//         <p className="card-text mb-2"><strong>Address:</strong> {mess.address}</p>
//         <a href={`/mess/${mess.id}`} className="btn btn-primary py-2 px-5 rounded-pill know-more-btn">
//           Mess Menu <i className="fas fa-arrow-right ps-2"></i>
//         </a>
//       </div>
//     </div>
//   </div>
// );

// const Mess = () => {
//   const [messes, setMesses] = useState([]);
//   const [userLocation, setUserLocation] = useState('A');

//   useEffect(() => {
//     const filteredMesses = messData.filter(mess => mess.location === userLocation);
//     setMesses(filteredMesses);
//   }, [userLocation]);

//   return (
//     <div>
//       {/* Heading Section */}
//       <div className="container-fluid bg-light py-4 my-0 mt-0">
//         <div className="container text-center">
//           <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3">
//             Our Services
//           </small>
//           <h1 className="display-5 mb-3">Mess Services</h1>
//           <h6 className="display-9 mb-1">Based on your College Location, these are the Mess Services we found!</h6>
//         </div>
//       </div>

//       {/* Mess List Section */}
//       <div className="container-fluid py-1">
//         <div className="container">
//           <div className="row g-4">
//             {messes.length > 0 ? (
//               messes.map(mess => <MessCard key={mess.id} mess={mess} />)
//             ) : (
//               <p className="text-center">No mess services available at your location.</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Mess;









import React, { useEffect, useState } from 'react';
import assets from '../assets/assets.js';
import './Services.css';

const messData = [
  { id: 1, name: 'Mess A', price: `₹${Math.floor(Math.random() * 500) + 100}/week`, address: 'Near College Gate', location: 'A', imageUrl: assets.event4 },
  { id: 2, name: 'Mess B', price: `₹${Math.floor(Math.random() * 500) + 100}/week`, address: 'Main Road', location: 'A', imageUrl: assets.event5 },
  { id: 3, name: 'Mess C', price: `₹${Math.floor(Math.random() * 500) + 100}/week`, address: 'Inside Campus', location: 'A', imageUrl: assets.event3 },
  { id: 4, name: 'Mess D', price: `₹${Math.floor(Math.random() * 500) + 100}/week`, address: 'Backside of Hostel', location: 'A', imageUrl: assets.event6 },
];

const MessCard = ({ mess, isServiceAvailable }) => (
  <div className="col-md-6 col-lg-3 wow bounceInUp" data-wow-delay="0.1s">
    <div className="card border-0">
      <div className="card-img-top position-relative overflow-hidden">
        <img className="img-fluid rounded w-100" src={mess.imageUrl} alt={mess.name} />
        <div className="view-overlay d-flex justify-content-center align-items-center">
          <a href={`/mess/${mess.id}`} className="view-icon" onClick={(e) => {
            if (!isServiceAvailable) {
              e.preventDefault();
              alert("Service is available only from 6 AM to 10 PM. Please book the mess for tomorrow.");
            }
          }}>
            <i className="fas fa-search-plus fa-2x"></i>
          </a>
        </div>
      </div>
      <div className="card-body text-center">
        <h4 className="card-title mb-2">{mess.name}</h4>
        <p className="card-text mb-1"><strong>Price per Week:</strong> {mess.price}</p>
        <p className="card-text mb-2"><strong>Address:</strong> {mess.address}</p>
        <a href={`/mess/${mess.id}`} className="btn btn-primary py-2 px-5 rounded-pill know-more-btn" onClick={(e) => {
          if (!isServiceAvailable) {
            e.preventDefault();
            alert("Service is available only from 6 AM to 10 PM. Please book the mess for tomorrow.");
          }
        }}>
          Mess Menu <i className="fas fa-arrow-right ps-2"></i>
        </a>
      </div>
    </div>
  </div>
);

const Mess = () => {
  const [messes, setMesses] = useState([]);
  const [userLocation, setUserLocation] = useState('A');
  const [isServiceAvailable, setIsServiceAvailable] = useState(false);

  useEffect(() => {
    const filteredMesses = messData.filter(mess => mess.location === userLocation);
    setMesses(filteredMesses);

    const currentTime = new Date().getHours();
    setIsServiceAvailable(currentTime >= 6 && currentTime < 22);
  }, [userLocation]);

  return (
    <div>
      {/* Heading Section */}
      <div className="container-fluid bg-light py-4 my-0 mt-0">
        <div className="container text-center">
          <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3">
            Our Services
          </small>
          <h1 className="display-5 mb-3">Mess Services</h1>
          <h6 className="display-9 mb-4">Based on your College Location, these are the Mess Services we found! <br />
            
          </h6>
          <h6 className="display-9 mb-1 text-danger">
Service is available only from 6 AM to 10 PM. <br />
            
          </h6>
        </div>
      </div>

      {/* Mess List Section */}
      <div className="container-fluid py-1">
        <div className="container">
          <div className="row g-4">
            {messes.length > 0 ? (
              messes.map(mess => <MessCard key={mess.id} mess={mess} isServiceAvailable={isServiceAvailable} />)
            ) : (
              <p className="text-center">No mess services available at your location.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mess;
