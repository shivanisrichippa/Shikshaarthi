import React from "react";

const SkeletonLoader = ({ count = 3 }) => {
  return (
    <div>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="card shadow-sm p-3 mb-3">
          <div className="d-flex align-items-center">
            <div className="skeleton-img" style={{ width: "100px", height: "100px", backgroundColor: "#ddd" }}></div>
            <div className="ms-3 w-100">
              <div className="skeleton-text mb-2" style={{ width: "60%", height: "15px", backgroundColor: "#ddd" }}></div>
              <div className="skeleton-text mb-2" style={{ width: "80%", height: "15px", backgroundColor: "#ddd" }}></div>
              <div className="skeleton-text mb-2" style={{ width: "40%", height: "15px", backgroundColor: "#ddd" }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
