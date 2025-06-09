import React from 'react';

const RelatedProducts = ({ products }) => {
  return (
    <div className="mt-5 text-center">
      <h4 className="fw-bold mb-4">Related Products</h4>
      <div className="row justify-content-center">
        {products.map((related) => (
          <div key={related.id} className="col-md-4 col-lg-3 mb-4">
            <div
              className="card shadow-sm border rounded"
              style={{ maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}
            >
              <img
                src={related.imageUrl}
                alt={related.name}
                style={{ height: '200px', objectFit: 'cover' }}
                className="card-img-top rounded-top"
              />
              <div className="card-body text-center">
                <h5>{related.name}</h5>
                <p style={{ color: '#333' }}>{related.price}</p> {/* Dark text color */}
                <p style={{ color: '#333' }}>{related.description}</p> {/* Dark text color */}
                <button
                  onClick={() => alert(`Viewing details for ${related.name}`)}
                  className="btn btn-success py-2 px-4 rounded-pill"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(RelatedProducts);
