// import React, { useState, useEffect, lazy, Suspense } from "react";
// import { useParams } from "react-router-dom";
// import assets from "../assets/assets.js";


// const RelatedProducts = lazy(() => import("../components/RelatedProducts"));


// const productData = [
//   {
//     id: 1,
//     name: "Used Notebook",
//     price: "₹150",
//     description: "Lightly used notebook with handwritten notes.",
//     cod: "Available",
//     reviews: 4.2,
//     condition: "Good - Slightly worn but fully functional",
//     seller: "Verified Seller | Stationery Hub",
//     delivery: "Estimated delivery in 3-5 days",
//     category: "Stationery",
//     images: [assets.preown2, assets.preown3, assets.preown],
//     specifications: [
//       { key: "Brand", value: "ABC Stationery" },
//       { key: "Model", value: "Notebook123" },
//       { key: "Material", value: "Paper" },
//       { key: "Pages", value: "200" },
//     ],
//     reviewsCount: 100,
//     reviewsList: [
//       {
//         rating: 5,
//         review: "Excellent condition, exactly as described. Highly recommended!",
//         reviewer: "Rahul S.",
//       },
//       {
//         rating: 4,
//         review: "Good product, but delivery took a bit longer than expected.",
//         reviewer: "Priya K.",
//       },
//     ],
//     relatedProducts: [
//       {
//         id: 3,
//         name: "Pencil Set",
//         price: "₹50",
//         imageUrl: assets.preown2,
//         description: "A set of 12 pencils for drawing and writing.",
//       },
//       {
//         id: 4,
//         name: "Eraser",
//         price: "₹20",
//         imageUrl: assets.preown3,
//         description: "High-quality eraser for correcting mistakes.",
//       },
//     ],
//   },
// ];

// const SingleProduct = () => {
//   const { id } = useParams();
//   const [product, setProduct] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(null);

//   // Memoize product data lookup
//   useEffect(() => {
//     const foundProduct = productData.find((item) => item.id === parseInt(id));
//     setProduct(foundProduct);
//     if (foundProduct) {
//       setSelectedImage(foundProduct.images[0]);
//     }
//   }, [id]);


//   if (!product) return <h2 className="text-center">Product Not Found</h2>;

//    // Handle Add to Cart Navigation
//    const handleAddToCart = () => {
//     navigate("/product/cart"); // Navigate to cart page
//   };

//   return (
//     <div className="container mt-5 py-5">
//       {/* Product Section */}
//       <div className="row">
//         {/* Left - Image Gallery */}
//         <div className="col-md-6">
//           <div className="border p-3 rounded shadow">
//             <img
//               src={selectedImage}
//               className="img-fluid rounded mb-3"
//               alt={product.name}
//               style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
//             />
//             <div className="d-flex gap-2 justify-content-center">
//               {product.images?.map((img, index) => (
//                 <img
//                   key={index}
//                   src={img}
//                   className="rounded shadow"
//                   alt={`Thumbnail ${index + 1}`}
//                   onClick={() => setSelectedImage(img)}
//                   style={{
//                     width: "80px",
//                     height: "80px",
//                     cursor: "pointer",
//                     objectFit: "cover",
//                     border:
//                       selectedImage === img ? "3px solid #ff9900" : "1px solid #ddd",
//                   }}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Right - Product Details */}
//         <div className="col-md-6">
//           <h2 className="fw-bold text-dark mb-3">{product.name}</h2>
//           <h3 className="text-dark mb-3">{product.price}</h3>
//           <p className="text-dark"><strong>Category:</strong> {product.category}</p>
//           <p className="text-dark"><strong>COD:</strong> {product.cod}</p>
//           <p className="text-dark"><strong>Reviews:</strong> ⭐ {product.reviews} / 5</p>
//           <p className="text-dark"><strong>Condition:</strong> {product.condition}</p>
//           <p className="text-dark"><strong>Seller:</strong> {product.seller}</p>
//           <p className="text-dark"><strong>Delivery:</strong> {product.delivery}</p>
//           <p className="text-dark mb-4">{product.description}</p>

//           {/* Specifications */}
//           <h4 className="fw-bold mb-3">Specifications</h4>
//           <table className="table table-striped">
//             <tbody>
//               {product.specifications?.map((spec, index) => (
//                 <tr key={index}>
//                   <th className="text-dark">{spec.key}</th>
//                   <td className="text-dark">{spec.value}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Actions */}
//           <div className="d-flex gap-3 mt-4">
//             {/* Add to Cart Button */}
//             <button
//               onClick={handleAddToCart}
//               className="btn btn-warning py-2 px-4 rounded-pill"
//             >
//               Add to Cart
//             </button>

//             {/* Buy Now Button */}
//             <button
//               onClick={() => alert("Proceeding to buy now!")}
//               className="btn btn-success py-2 px-4 rounded-pill"
//             >
//               Buy Now
//             </button>
//           </div>

//         </div>
//       </div>

//       {/* Related Products Section */}
//       <Suspense fallback={<div>Loading Related Products...</div>}>
//         <RelatedProducts products={product.relatedProducts} />
//       </Suspense>
//     </div>
//   );
// };

// export default SingleProduct;


import React, { useState, useEffect, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import assets from "../assets/assets.js";

// Lazy load related components
const RelatedProducts = lazy(() => import("../components/RelatedProducts"));

// Sample product data (you can fetch from API if needed)
const productData = [
  {
    id: 1,
    name: "Used Notebook",
    price: "₹150",
    description: "Lightly used notebook with handwritten notes.",
    cod: "Available",
    reviews: 4.2,
    condition: "Good - Slightly worn but fully functional",
    seller: "Verified Seller | Stationery Hub",
    delivery: "Estimated delivery in 3-5 days",
    category: "Stationery",
    images: [assets.preown2, assets.preown3, assets.preown],
    specifications: [
      { key: "Brand", value: "ABC Stationery" },
      { key: "Model", value: "Notebook123" },
      { key: "Material", value: "Paper" },
      { key: "Pages", value: "200" },
    ],
    reviewsCount: 100,
    reviewsList: [
      {
        rating: 5,
        review: "Excellent condition, exactly as described. Highly recommended!",
        reviewer: "Rahul S.",
      },
      {
        rating: 4,
        review: "Good product, but delivery took a bit longer than expected.",
        reviewer: "Priya K.",
      },
    ],
    relatedProducts: [
      {
        id: 3,
        name: "Pencil Set",
        price: "₹50",
        imageUrl: assets.preown2,
        description: "A set of 12 pencils for drawing and writing.",
      },
      {
        id: 4,
        name: "Eraser",
        price: "₹20",
        imageUrl: assets.preown3,
        description: "High-quality eraser for correcting mistakes.",
      },
    ],
  },
];

const SingleProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Memoize product data lookup
  useEffect(() => {
    const foundProduct = productData.find((item) => item.id === parseInt(id));
    setProduct(foundProduct);
    if (foundProduct) {
      setSelectedImage(foundProduct.images[0]);
    }
  }, [id]);

  if (!product) return <h2 className="text-center">Product Not Found</h2>;

  // Handle Add to Cart Navigation
  const handleAddToCart = () => {
    navigate("/product/cart"); // Navigate to cart page
  };

  // Handle Buy Now Navigation
  const handleBuyNow = () => {
    navigate("/product/placeorder"); // Navigate to place order page
  };

  return (
    <div className="container mt-5 py-5">
      {/* Product Section */}
      <div className="row">
        {/* Left - Image Gallery */}
        <div className="col-md-6">
          <div className="border p-3 rounded shadow">
            <img
              src={selectedImage}
              className="img-fluid rounded mb-3"
              alt={product.name}
              style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
            />
            <div className="d-flex gap-2 justify-content-center">
              {product.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  className="rounded shadow"
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: "80px",
                    height: "80px",
                    cursor: "pointer",
                    objectFit: "cover",
                    border:
                      selectedImage === img ? "3px solid #ff9900" : "1px solid #ddd",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right - Product Details */}
        <div className="col-md-6">
          <h2 className="fw-bold text-dark mb-3">{product.name}</h2>
          <h3 className="text-dark mb-3">{product.price}</h3>
          <p className="text-dark"><strong>Category:</strong> {product.category}</p>
          <p className="text-dark"><strong>COD:</strong> {product.cod}</p>
          <p className="text-dark"><strong>Reviews:</strong> ⭐ {product.reviews} / 5</p>
          <p className="text-dark"><strong>Condition:</strong> {product.condition}</p>
          <p className="text-dark"><strong>Seller:</strong> {product.seller}</p>
          <p className="text-dark"><strong>Delivery:</strong> {product.delivery}</p>
          <p className="text-dark mb-4">{product.description}</p>

          {/* Specifications */}
          <h4 className="fw-bold mb-3">Specifications</h4>
          <table className="table table-striped">
            <tbody>
              {product.specifications?.map((spec, index) => (
                <tr key={index}>
                  <th className="text-dark">{spec.key}</th>
                  <td className="text-dark">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Actions */}
          <div className="d-flex gap-3 mt-4">
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="btn btn-warning py-2 px-4 rounded-pill"
            >
              Add to Cart
            </button>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              className="btn btn-success py-2 px-4 rounded-pill"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <Suspense fallback={<div>Loading Related Products...</div>}>
        <RelatedProducts products={product.relatedProducts} />
      </Suspense>
    </div>
  );
};

export default SingleProduct;
