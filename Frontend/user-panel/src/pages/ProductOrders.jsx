import React, { useState, useEffect } from "react";
import OrderCard from "../components/OrderCard";
import assets from "../assets/assets.js";
import SkeletonLoader from "../components/SkeletonLoader.jsx";

// Sample order data (Replace with API data in future)
const orderData = [
  {
    id: 1,
    name: "Used Notebook",
    price: "₹150",
    image: assets.preown2,
    orderDate: "March 08, 2025",
    deliveryDate: "March 12, 2025",
    paymentMethod: "Cash on Delivery",
    orderStatus: "Shipped",
    trackingStatus: ["Confirmed", "Shipped", "Out for Delivery", "Delivered"],
  },
  {
    id: 2,
    name: "Second-Hand Calculator",
    price: "₹350",
    image: assets.preown3,
    orderDate: "March 07, 2025",
    deliveryDate: "March 11, 2025",
    paymentMethod: "Credit/Debit Card",
    orderStatus: "Out for Delivery",
    trackingStatus: ["Confirmed", "Shipped", "Out for Delivery", "Delivered"],
  },
  {
    id: 3,
    name: "Pre-Owned Geometry Set",
    price: "₹200",
    image: assets.preown2,
    orderDate: "March 06, 2025",
    deliveryDate: "March 10, 2025",
    paymentMethod: "UPI Payment",
    orderStatus: "Delivered",
    trackingStatus: ["Confirmed", "Shipped", "Out for Delivery", "Delivered"],
  },
];

const ProductOrders = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch delay
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <div className="container mt-3 py-5">
      <h2 className="fw-bold text-center mb-4">Your Product Orders</h2>
      <div className="d-flex flex-column align-items-center">
        {loading ? (
          <SkeletonLoader count={3} /> // Show skeleton loader while fetching data
        ) : (
          orderData.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
};

export default ProductOrders;
