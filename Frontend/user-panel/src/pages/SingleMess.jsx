

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import assets from "../assets/assets.js";

const messData = [
  {
    id: 1,
    name: "Mess A",
    price: "₹400/week",
    address: "123 Hostel Street, Kolhapur, Maharashtra, 416008",
    latitude: 16.704987, // Random location near Kolhapur
    longitude: 74.243253,
    images: [assets.event4, assets.event5, assets.event3, assets.event6],
    timings: {
      breakfast: "7:00 AM - 9:30 AM",
      lunch: "12:00 PM - 2:30 PM",
      dinner: "7:30 PM - 10:00 PM",
    },
    menu: {
      Monday: { breakfast: "Poha & Tea", lunch: "Dal Rice & Sabji", dinner: "Paneer Masala & Roti" },
      Tuesday: { breakfast: "Idli Sambar", lunch: "Rajma Rice", dinner: "Aloo Paratha & Curd" },
      Wednesday: { breakfast: "Upma", lunch: "Veg Biryani", dinner: "Dal Tadka & Roti" },
      Thursday: { breakfast: "Bread Butter & Tea", lunch: "Chole Rice", dinner: "Bhindi Sabji & Chapati" },
      Friday: { breakfast: "Aloo Poori", lunch: "Mix Veg", dinner: "Paneer Butter Masala & Roti" },
      Saturday: { breakfast: "Dosa", lunch: "Dal Makhani & Rice", dinner: "Egg Curry & Chapati" },
      Sunday: { breakfast: "Pav Bhaji", lunch: "Special Veg Thali", dinner: "Kadhi Chawal" },
    },
  },
];

const SingleMess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const mess = messData.find((m) => m.id === parseInt(id));
  const [selectedImage, setSelectedImage] = useState(mess?.images[0]);

  if (!mess) {
    return <h2 className="text-center mt-5 text-dark">Mess not found!</h2>;
  }

  // ✅ Correctly define handleBookMess inside the component
  const handleBookMess = () => {
    navigate(`/mess/payment/${mess.id}`);
  };

  return (
    <div className="container mt-5 py-5 text-dark">
      <div className="row">
        {/* Left - Image Gallery */}
        <div className="col-md-6">
          <div className="border p-3 rounded">
            <img
              src={selectedImage}
              className="img-fluid rounded shadow mb-3"
              alt="Mess Preview"
              style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
            />
            <div className="d-flex gap-2 justify-content-center mt-3">
              {mess.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  className="rounded shadow"
                  alt="Mess Thumbnail"
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: "80px",
                    height: "80px",
                    cursor: "pointer",
                    objectFit: "cover",
                    border: selectedImage === img ? "3px solid #ff9900" : "1px solid #ddd",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right - Mess Details */}
        <div className="col-md-6">
          <h2 className="fw-bold text-dark mb-3">{mess.name}</h2>
          <h3 className="text-dark mb-3">{mess.price}</h3>
          <p>
            <strong>Location:</strong> {mess.address}
          </p>

          {/* Google Maps Embed */}
          <iframe
            title="Mess Location"
            src={`https://www.google.com/maps?q=${mess.latitude},${mess.longitude}&output=embed`}
            width="100%"
            height="250"
            className="rounded border shadow-sm mb-3"
            style={{ border: "1px solid #ddd" }}
          ></iframe>

          <p>
            <strong>Mess Timings:</strong>
            <ul>
              <li>Breakfast: {mess.timings.breakfast}</li>
              <li>Lunch: {mess.timings.lunch}</li>
              <li>Dinner: {mess.timings.dinner}</li>
            </ul>
          </p>
          <p className="text-danger">
            ⚠ You can change your mess even if you have not completed one week, but you need to pay for the full week.
          </p>

          {/* ✅ Fixed Button */}
          <button className="btn btn-primary w-100" onClick={handleBookMess}>
            Book Mess
          </button>
        </div>
      </div>

      {/* Mess Menu */}
      <div className="mt-5">
        <h3 className="text-center mb-4 text-dark">Weekly Mess Menu</h3>
        <div className="table-responsive">
          <table className="table table-bordered text-center text-dark">
            <thead className="bg-primary text-white">
              <tr>
                <th>Day</th>
                <th>Breakfast</th>
                <th>Lunch</th>
                <th>Dinner</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(mess.menu).map(([day, meals], index) => (
                <tr key={index}>
                  <td className="fw-bold text-dark">{day}</td>
                  <td>{meals.breakfast}</td>
                  <td>{meals.lunch}</td>
                  <td>{meals.dinner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SingleMess;
