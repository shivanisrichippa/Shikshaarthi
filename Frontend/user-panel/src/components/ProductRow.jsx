import React from "react";
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaShoppingCart, FaMoneyCheckAlt } from "react-icons/fa";

const ProductRow = ({ product }) => {
  // Status Icons & Colors
  const getStatusBadge = (status) => {
    switch (status) {
      case "Verified":
        return (
          <span className="badge bg-success text-light d-flex align-items-center gap-2">
            <FaCheckCircle /> Verified
          </span>
        );
      case "Rejected":
        return (
          <span className="badge bg-danger text-light d-flex align-items-center gap-2">
            <FaTimesCircle /> Rejected
          </span>
        );
      case "Order Placed":
        return (
          <span className="badge bg-primary text-light d-flex align-items-center gap-2">
            <FaShoppingCart /> Order Placed
          </span>
        );
      case "Sold":
        return (
          <span className="badge bg-warning text-dark d-flex align-items-center gap-2">
            <FaMoneyCheckAlt /> Sold
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary text-light d-flex align-items-center gap-2">
            <FaHourglassHalf /> Pending
          </span>
        );
    }
  };

  return (
    <tr style={{ transition: "0.3s" }} className="table-light">
      <td>
        <img
          src={product.image}
          alt={product.name}
          className="img-thumbnail shadow"
          style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
        />
      </td>
      <td className="text-dark">{product.name}</td>
      <td className="text-dark">₹{product.price}</td>
      <td className="text-secondary">{product.uploadDate}</td>
      <td>{getStatusBadge(product.status)}</td>
      <td className="text-secondary">{product.statusDate}</td>
      <td
        className={`fw-bold ${product.paymentStatus === "Completed" ? "text-success" : "text-warning"}`}
      >
        {product.paymentStatus}
      </td>
    </tr>
  );
};

export default ProductRow;
