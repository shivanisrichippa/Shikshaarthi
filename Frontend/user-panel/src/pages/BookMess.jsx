import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const messData = [
  {
    id: 1,
    name: "Mess A",
    price: 400,
  },
];

const getRandomUserName = () => {
  const names = ["Rahul Sharma", "Priya Mehta", "Anjali Verma", "Vikas Gupta", "Neha Singh"];
  return names[Math.floor(Math.random() * names.length)];
};

const getWeekRange = () => {
  const today = new Date();
  today.setDate(today.getDate() + 1); // Start from tomorrow

  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 6); // Add 6 more days

  const formatDate = (date) =>
    date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return { start: formatDate(today), end: formatDate(endDate) };
};

const BookMess = () => {
  const { id } = useParams();
  const navigate = useNavigate(); 

  const mess = messData.find((m) => m.id === parseInt(id));

  if (!mess) {
    return <h2 className="text-center mt-5 text-danger">Mess not found!</h2>;
  }

  const userName = getRandomUserName();
  const { start, end } = getWeekRange();

  // Dummy values for email & mobile (Replace with real data)
  const email = "testuser@example.com";
  const mobile = "9876543210";
  const paymentDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const handleBookMess = () => {
    const orderDetails = {
      userName,
      email,
      mobile,
      messName: mess.name,
      startDate: start,
      endDate: end,
      amount: mess.price,
      paymentDate,
    };

    navigate("/mess/orders", { state: orderDetails }); // ✅ FIXED: Proper navigation
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
      <div className="card p-4 shadow-lg border-0 rounded" style={{ width: "500px", backgroundColor: "#f8f9fa" }}>
        <h2 className="text-center mb-3 text-primary">Mess Payment</h2>
        <hr />
        <h4 className="text-center mb-3">{mess.name}</h4>
        <div className="px-3">
          <p style={{ color: "#212529" }}><strong>User Name:</strong> {userName}</p>
          <p style={{ color: "#212529", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <strong>Mess Duration:</strong> {start} - {end}
          </p>
          <p className="mb-4" style={{ color: "#212529" }}><strong>Amount:</strong> ₹{mess.price}</p>
        </div>
        <div className="text-center">
          <button className="btn btn-primary w-100 py-2" onClick={handleBookMess}>
            Proceed to Pay
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookMess;
