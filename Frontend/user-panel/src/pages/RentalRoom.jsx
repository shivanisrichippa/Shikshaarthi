//from services to rentalrooms to singleroom
import React, { useEffect, useState } from 'react';
import assets from '../assets/assets.js';
import './Services.css';

const rentalRoomsData = [
  { id: 1, name: 'Room 1', price: `₹${Math.floor(Math.random() * 5000) + 3000}`, status: Math.random() > 0.5 ? 'Available' : 'Not Available', location: 'Hostel A', imageUrl: assets.r1 },
  { id: 2, name: 'Room 2', price: `₹${Math.floor(Math.random() * 5000) + 3000}`, status: Math.random() > 0.5 ? 'Available' : 'Not Available', location: 'Hostel A', imageUrl: assets.r2 },
  { id: 3, name: 'Room 3', price: `₹${Math.floor(Math.random() * 5000) + 3000}`, status: Math.random() > 0.5 ? 'Available' : 'Not Available', location: 'Hostel A', imageUrl: assets.r4 },
  { id: 4, name: 'Room 4', price: `₹${Math.floor(Math.random() * 5000) + 3000}`, status: Math.random() > 0.5 ? 'Available' : 'Not Available', location: 'Hostel A', imageUrl: assets.r3 },
];

const RoomCard = ({ room }) => (
  <div className="col-md-6 col-lg-3 wow bounceInUp" data-wow-delay="0.1s">
    <div className="card border-0">
      <div className="card-img-top position-relative overflow-hidden">
        <img className="img-fluid rounded w-100" src={room.imageUrl} alt={room.name} />
        <div className="view-overlay d-flex justify-content-center align-items-center">
          <a href={`/rooms/${room.id}`} className="view-icon">
            <i className="fas fa-search-plus fa-2x"></i>
          </a>
        </div>
      </div>
      <div className="card-body text-center">
        <h4 className="card-title mb-2">{room.name}</h4>
        <p className="card-text mb-1"><strong>Price:</strong> {room.price}</p>
        <p className="card-text mb-2"><strong>Status:</strong> {room.status}</p>
        <a href={`/rooms/${room.id}`} className="btn btn-primary py-2 px-5 rounded-pill know-more-btn">
          Know More <i className="fas fa-arrow-right ps-2"></i>
        </a>
      </div>
    </div>
  </div>
);

const RentalRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [userLocation, setUserLocation] = useState('Hostel A');

  useEffect(() => {
    // Filter rooms based on user location
    const filteredRooms = rentalRoomsData.filter(room => room.location === userLocation);
    setRooms(filteredRooms);
  }, [userLocation]);

  return (
    <div>
      {/* Heading Section */}
      <div className="container-fluid bg-light py-4 my-0 mt-0">
        <div className="container text-center">
          <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3">
            Our Services
          </small>
          <h1 className="display-5 mb-3">Rental Rooms</h1>
          <h6 className="display-9 mb-1">Based on your College Location these are the Rooms we found! </h6>
        </div>
      </div>

      {/* Rooms List Section */}
      <div className="container-fluid py-1">
        <div className="container">
          <div className="row g-4">
            {rooms.length > 0 ? (
              rooms.map(room => <RoomCard key={room.id} room={room} />)
            ) : (
              <p className="text-center">No rooms available at your location.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalRoom;
