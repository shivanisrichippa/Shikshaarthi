import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import assets from "../assets/assets.js";

const initialCart = [
  {
    id: 1,
    name: "Used Notebook",
    price: 150,
    quantity: 1,
    image: assets.preown2,
  },
  {
    id: 2,
    name: "Second-Hand Calculator",
    price: 350,
    quantity: 1,
    image: assets.preown3,
  },
];

const Cart = () => {
  const [cartItems, setCartItems] = useState(initialCart);
  const navigate = useNavigate(); // Initialize useNavigate

  // Update Quantity
  const updateQuantity = (id, delta) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  // Remove Item
  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Calculate Total Price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="container mt-5 py-5">
      <div className="row">
        {/* Cart Items Section */}
        <div className="col-lg-8">
          <h3 className="fw-bold mb-4">Shopping Cart</h3>
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="d-flex align-items-center justify-content-between border-bottom py-3"
              >
                {/* Product Image */}
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  className="rounded shadow-sm"
                />

                {/* Product Details */}
                <div className="flex-grow-1 ms-3">
                  <h5 className="mb-1">{item.name}</h5>
                  <p className="text-muted mb-0">Price: ₹{item.price}</p>
                </div>

                {/* Quantity Controls */}
                <div className="d-flex align-items-center">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    -
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    +
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="btn btn-danger btn-sm ms-3"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p>Your cart is empty.</p>
          )}

          {/* View More Button */}
          <div className="mt-4">
            <button
              onClick={() => navigate("/product")} // Navigate to product listing page
              className="btn btn-primary py-2 px-4 rounded-pill"
            >
              View More Products
            </button>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="col-lg-4">
          <h4 className="fw-bold mb-3">Order Summary</h4>
          <table className="table">
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td>₹{calculateTotal()}</td>
              </tr>
              <tr>
                <td>Shipping</td>
                <td>Free</td>
              </tr>
              <tr className="fw-bold">
                <td>Total</td>
                <td>₹{calculateTotal()}</td>
              </tr>
            </tbody>
          </table>

          {/* Place Order Button */}
          <button
            onClick={() => navigate("/product/placeorder")} // Navigate to place order page
            className="btn btn-success w-100 py-2 rounded-pill mt-3"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
