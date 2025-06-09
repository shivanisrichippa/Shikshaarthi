import React from 'react';
import assets from '../../assets/assets.js';

const StatsCard = ({ title, value, percentage, iconSrc, iconAlt, trend = "up", trendColor = "success", cardId }) => {
  return (
    <div className="card">
      <div className="card-body">
        <div className="card-title d-flex align-items-start justify-content-between">
          <div className="avatar flex-shrink-0">
            <img src={iconSrc} alt={iconAlt} className="rounded" />
          </div>
          <div className="dropdown">
            <button
              className="btn p-0"
              type="button"
              id={cardId}
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="bx bx-dots-vertical-rounded"></i>
            </button>
            <div className="dropdown-menu dropdown-menu-end" aria-labelledby={cardId}>
              <a className="dropdown-item" href="#!">View More</a>
              <a className="dropdown-item" href="#!">Delete</a>
            </div>
          </div>
        </div>
        <span className="fw-semibold d-block mb-1">{title}</span>
        <h3 className={`card-title ${title === "Sales" || title === "Payments" ? 'text-nowrap ' : ''}mb-2`}>{value}</h3>
        <small className={`text-${trendColor} fw-semibold`}>
          <i className={`bx bx-${trend}-arrow-alt`}></i> {percentage}
        </small>
      </div>
    </div>
  );
};

export default StatsCard;