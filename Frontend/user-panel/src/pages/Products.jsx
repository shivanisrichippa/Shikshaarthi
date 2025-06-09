import React, { useEffect, useState } from 'react';
import assets from '../assets/assets.js';
import './Services.css';
import { Link } from "react-router-dom";

const productData = [
  { id: 1, name: 'Used Notebook', price: `₹${Math.floor(Math.random() * 200) + 50}`, description: 'Lightly used, with notes', imageUrl: assets.preown2 },
  { id: 2, name: 'Second-Hand Calculator', price: `₹${Math.floor(Math.random() * 500) + 100}`, description: 'Scientific calculator, good condition', imageUrl: assets.preown2 },
  { id: 3, name: 'Pre-Owned Geometry Set', price: `₹${Math.floor(Math.random() * 150) + 30}`, description: 'Complete set, minimal usage', imageUrl: assets.preown3 },
  { id: 4, name: 'Used Fountain Pen', price: `₹${Math.floor(Math.random() * 300) + 80}`, description: 'Smooth ink flow, includes refills', imageUrl: assets.preown },
  { id: 5, name: 'Second-Hand Backpack', price: `₹${Math.floor(Math.random() * 800) + 200}`, description: 'Spacious, durable', imageUrl: assets.preown2 },
  { id: 6, name: 'Pre-Owned Drawing Kit', price: `₹${Math.floor(Math.random() * 350) + 100}`, description: 'Includes pencils, colors, and sheets', imageUrl: assets.preown3 },
];

const ProductCard = ({ product }) => (
  <div className="col-md-6 col-lg-4 wow bounceInUp" data-wow-delay="0.1s">
    <div className="card border-0">
      <div className="card-img-top position-relative overflow-hidden">
        <img className="img-fluid rounded w-120" src={product.imageUrl} alt={product.name} />
        <div className="view-overlay d-flex justify-content-center align-items-center">
          <a href={`/product/${product.id}`} className="view-icon">
            <i className="fas fa-search-plus fa-2x"></i>
          </a>
        </div>
      </div>
      <div className="card-body text-center">
        <h4 className="card-title mb-2">{product.name}</h4>
        <p className="card-text mb-1"><strong>Price:</strong> {product.price}</p>
        <p className="card-text mb-2">{product.description}</p>
        
        <Link to={`/product/${product.id}`} className="btn btn-primary py-2 px-5 rounded-pill know-more-btn">
  Know more <i className="fas fa-arrow-right ps-2"></i>
</Link>


      </div>
    </div>
  </div>
);

const Products = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(productData);
  }, []);

  return (
    <div>
      {/* Heading Section */}
      <div className="container-fluid bg-light py-4 my-0 mt-0">
        <div className="container text-center">
          <small className="d-inline-block fw-bold text-dark text-uppercase bg-light border border-primary rounded-pill px-4 py-1 mb-3">
            Pre-Owned Stationery
          </small>
          <h1 className="display-5 mb-3">Available Products</h1>
          <h6 className="display-9 mb-1">Find affordable, quality second-hand stationery items!</h6>
        </div>
      </div>

      {/* Products List Section */}
      <div className="container-fluid py-1">
        <div className="container">
          <div className="row g-4">
            {products.length > 0 ? (
              products.map(product => <ProductCard key={product.id} product={product} />)
            ) : (
              <p className="text-center">No products available right now.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
