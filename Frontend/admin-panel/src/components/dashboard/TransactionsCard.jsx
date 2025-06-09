import React from 'react';
import assets from '../../assets/assets.js'; // Adjust path as necessary

const TransactionsCard = () => {
  const transactions = [
    { id: 1, type: 'Paypal', description: 'Send money', amount: '+82.6', currency: 'USD', icon: assets.paypalPng, trend: 'up' },
    { id: 2, type: 'Wallet', description: "Mac'D", amount: '+270.69', currency: 'USD', icon: assets.walletPng, trend: 'up' },
    { id: 3, type: 'Transfer', description: 'Refund', amount: '+637.91', currency: 'USD', icon: assets.chartPng, trend: 'up' },
    { id: 4, type: 'Credit Card', description: 'Ordered Food', amount: '-838.71', currency: 'USD', icon: assets.ccsuccessPng, trend: 'down' },
    { id: 5, type: 'Wallet', description: 'Starbucks', amount: '+203.33', currency: 'USD', icon: assets.walletPng, trend: 'up' },
    { id: 6, type: 'Mastercard', description: 'Ordered Food', amount: '-92.45', currency: 'USD', icon: assets.ccwarningPng, trend: 'down' },
  ];

  return (
    <div className="card h-100">
      <div className="card-header d-flex align-items-center justify-content-between">
        <h5 className="card-title m-0 me-2">Transactions</h5>
        <div className="dropdown">
          <button
            className="btn p-0"
            type="button"
            id="transactionID"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <i className="bx bx-dots-vertical-rounded"></i>
          </button>
          <div className="dropdown-menu dropdown-menu-end" aria-labelledby="transactionID">
            <a className="dropdown-item" href="#">Last 28 Days</a>
            <a className="dropdown-item" href="#">Last Month</a>
            <a className="dropdown-item" href="#">Last Year</a>
          </div>
        </div>
      </div>
      <div className="card-body">
        <ul className="p-0 m-0">
          {transactions.map((transaction) => (
            <li className="d-flex mb-4 pb-1" key={transaction.id}>
              <div className="avatar flex-shrink-0 me-3">
                <img src={transaction.icon} alt={transaction.type} className="rounded" />
              </div>
              <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                <div className="me-2">
                  <small className="text-muted d-block mb-1">{transaction.type}</small>
                  <h6 className="mb-0">{transaction.description}</h6>
                </div>
                <div className={`user-progress d-flex align-items-center gap-1 ${transaction.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                  <h6 className="mb-0">{transaction.amount}</h6>
                  <span className="text-muted">{transaction.currency}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TransactionsCard;