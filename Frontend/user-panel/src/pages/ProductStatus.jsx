// import React from "react";
// import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaShoppingCart, FaMoneyCheckAlt } from "react-icons/fa";
// import assets from "../assets/assets.js";

// const ProductStatus = () => {
//   // Sample user product status data
//   const products = [
//     {
//       id: 1,
//       name: "Wireless Headphones",
//       price: 1500,
//       uploadDate: "2024-03-01",
//       status: "Verified",
//       statusDate: "2024-03-02",
//       paymentStatus: "Pending",
//       image: assets.preown3,
//     },
//     {
//       id: 2,
//       name: "Java Programming Book",
//       price: 500,
//       uploadDate: "2024-02-25",
//       status: "Order Placed",
//       statusDate: "2024-02-28",
//       paymentStatus: "Completed",
//       image:assets.preown2,
//     },
//     {
//       id: 3,
//       name: "Samsung Galaxy Watch",
//       price: 8000,
//       uploadDate: "2024-02-20",
//       status: "Sold",
//       statusDate: "2024-02-25",
//       paymentStatus: "Completed",
//       image: assets.preown2,
//     },
//     {
//       id: 4,
//       name: "HP Laptop",
//       price: 45000,
//       uploadDate: "2024-02-10",
//       status: "Rejected",
//       statusDate: "2024-02-12",
//       paymentStatus: "N/A",
//       image:assets.preown,
//     },
//   ];

//   // Status Icons & Colors
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "Verified":
//         return (
//           <span className="badge bg-success text-light d-flex align-items-center gap-2">
//             <FaCheckCircle /> Verified
//           </span>
//         );
//       case "Rejected":
//         return (
//           <span className="badge bg-danger text-light d-flex align-items-center gap-2">
//             <FaTimesCircle /> Rejected
//           </span>
//         );
//       case "Order Placed":
//         return (
//           <span className="badge bg-primary text-light d-flex align-items-center gap-2">
//             <FaShoppingCart /> Order Placed
//           </span>
//         );
//       case "Sold":
//         return (
//           <span className="badge bg-warning text-dark d-flex align-items-center gap-2">
//             <FaMoneyCheckAlt /> Sold
//           </span>
//         );
//       default:
//         return (
//           <span className="badge bg-secondary text-light d-flex align-items-center gap-2">
//             <FaHourglassHalf /> Pending
//           </span>
//         );
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="text-center mb-4 fw-bold text-dark">📦 My Product Status</h2>
//       <div className="table-responsive shadow-lg rounded" style={{ background: "#f8f9fa", padding: "15px", borderRadius: "10px" }}>
//         <table className="table table-hover text-center align-middle">
//           <thead className="table-dark">
//             <tr>
//               <th>Product</th>
//               <th>Name</th>
//               <th>Price</th>
//               <th>Uploaded Date</th>
//               <th>Status</th>
//               <th>Status Date</th>
//               <th>Payment Status</th>
//             </tr>
//           </thead>
//           <tbody className="fw-semibold">
//             {products.map((product) => (
//               <tr key={product.id} style={{ transition: "0.3s" }} className="table-light">
//                 <td>
//                   <img
//                     src={product.image}
//                     alt={product.name}
//                     className="img-thumbnail shadow"
//                     style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }}
//                   />
//                 </td>
//                 <td className="text-dark">{product.name}</td>
//                 <td className="text-dark">₹{product.price}</td>
//                 <td className="text-secondary">{product.uploadDate}</td>
//                 <td>{getStatusBadge(product.status)}</td>
//                 <td className="text-secondary">{product.statusDate}</td>
//                 <td
//                   className={`fw-bold ${
//                     product.paymentStatus === "Completed" ? "text-success" : "text-warning"
//                   }`}
//                 >
//                   {product.paymentStatus}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ProductStatus;









import React from "react";
import ProductRow from "../components/ProductRow";
import { products } from "../data/productData";

const ProductStatus = () => {
  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4 fw-bold text-dark">📦 My Product Status</h2>
      <div className="table-responsive shadow-lg rounded" style={{ background: "#f8f9fa", padding: "15px", borderRadius: "10px" }}>
        <table className="table table-hover text-center align-middle">
          <thead className="table-dark">
            <tr>
              <th>Product</th>
              <th>Name</th>
              <th>Price</th>
              <th>Uploaded Date</th>
              <th>Status</th>
              <th>Status Date</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody className="fw-semibold">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductStatus;

