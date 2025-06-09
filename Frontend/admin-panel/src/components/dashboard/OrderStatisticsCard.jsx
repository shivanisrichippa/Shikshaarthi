import React from 'react';

const orderItems = [
    { id: 1, icon: "bx-mobile-alt", category: "Electronic", subText: "Mobile, Earbuds, TV", amount: "82.5k", bgClass: "bg-label-primary" },
    { id: 2, icon: "bx-closet", category: "Fashion", subText: "T-shirt, Jeans, Shoes", amount: "23.8k", bgClass: "bg-label-success" },
    { id: 3, icon: "bx-home-alt", category: "Decor", subText: "Fine Art, Dining", amount: "849k", bgClass: "bg-label-info" },
    { id: 4, icon: "bx-football", category: "Sports", subText: "Football, Cricket Kit", amount: "99", bgClass: "bg-label-secondary" }
];


const OrderStatisticsCard = () => {
  return (
    <div className="card h-100">
      <div className="card-header d-flex align-items-center justify-content-between pb-0">
        <div className="card-title mb-0">
          <h5 className="m-0 me-2">Order Statistics</h5>
          <small className="text-muted">42.82k Total Sales</small>
        </div>
        <div className="dropdown">
          <button
            className="btn p-0"
            type="button"
            id="orederStatistics"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <i className="bx bx-dots-vertical-rounded"></i>
          </button>
          <div className="dropdown-menu dropdown-menu-end" aria-labelledby="orederStatistics">
            <a className="dropdown-item" href="#!">Select All</a>
            <a className="dropdown-item" href="#!">Refresh</a>
            <a className="dropdown-item" href="#!">Share</a>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex flex-column align-items-center gap-1">
            <h2 className="mb-2">8,258</h2>
            <span>Total Orders</span>
          </div>
          <div id="orderStatisticsChart"></div> {/* Chart */}
        </div>
        <ul className="p-0 m-0">
          {orderItems.map(item => (
            <li key={item.id} className={`d-flex ${item.id !== orderItems.length ? 'mb-4 pb-1' : ''}`}>
              <div className="avatar flex-shrink-0 me-3">
                <span className={`avatar-initial rounded ${item.bgClass}`}>
                  <i className={`bx ${item.icon}`}></i>
                </span>
              </div>
              <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                <div className="me-2">
                  <h6 className="mb-0">{item.category}</h6>
                  <small className="text-muted">{item.subText}</small>
                </div>
                <div className="user-progress">
                  <small className="fw-semibold">{item.amount}</small>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderStatisticsCard;