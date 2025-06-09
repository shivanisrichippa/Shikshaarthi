// // src/pages/AdminDashboard.jsx
// import React, { useContext } from 'react';
// import { UserContext } from '../context/UserContext'; // Adjust path

// // You can import dashboard components as you did in Home.jsx
// import CongratulationsCard from '../components/dashboard/CongratulationsCard';
// import StatsCard from '../components/dashboard/StatsCard';
// import OrderStatisticsCard from '../components/dashboard/OrderStatisticsCard'; // Adjust path
// import { Link } from 'react-router-dom'; // If you need links
// import ProfileReportCard from '../components/dashboard/ProfileReportCard'; // Adjust path
// import TotalRevenueCard from '../components/dashboard/TotalRevenueCard'; // Adjust path
// import ExpenseOverveiwCard from '../components/dashboard/ExpenseOverviewCard'; // Adjust path
// import TransactionsCard from '../components/dashboard/TransactionsCard'; // Adjust path
// import assets from '../assets/assets'; // Adjust path

// const Home = () => {
//   const { adminUser } = useContext(UserContext);

//   return (
//     <div className="container-xxl flex-grow-1 container-p-y">
//       <div className="row mb-4">
//         <div className="col-lg-12">
//           <CongratulationsCard name={adminUser?.fullName || adminUser?.email || 'Admin'} />
//         </div>
//       </div>
//       <div className="row">
//         {/* Example Stats - Replace with actual data fetching later */}
//         <div className="col-md-4 mb-4">
//           <StatsCard
//             title="Total Users"
//             value="1,256" /* Replace with dynamic data */
//             percentage="+12%"
//             iconSrc={assets.usersIcon || 'https://via.placeholder.com/40'} /* Placeholder for assets */
//             iconAlt="Total Users"
//             cardId="totalUsersCard"
//           />
//         </div>
//         <div className="col-md-4 mb-4">
//           <StatsCard
//             title="Pending Submissions"
//             value="78" /* Replace with dynamic data */
//             percentage="-5%"
//             trend="down"
//             iconSrc={assets.pendingIcon || 'https://via.placeholder.com/40'}  /* Placeholder for assets */
//             iconAlt="Pending Submissions"
//             cardId="pendingSubmissionsCard"
//           />
//         </div>
//         <div className="col-md-4 mb-4">
//           <StatsCard
//             title="Verified Submissions"
//             value="540" /* Replace with dynamic data */
//             percentage="+18%"
//             iconSrc={assets.verifiedIcon || 'https://via.placeholder.com/40'} /* Placeholder for assets */
//             iconAlt="Verified Submissions"
//             cardId="verifiedSubmissionsCard"
//           />
//         </div>
//       </div>
//       {/* You can add more dashboard widgets here, e.g., charts, recent activity lists */}
//       <div className="row">
//         <div className="col-12">
//           <div className="card">
//             <div className="card-header">
//               <h5 className="card-title mb-0">Quick Links</h5>
//             </div>
//             <div className="card-body">
//               <p>More admin-specific content and quick links can go here.</p>
//               {/* Example: <Link to="/admin/users" className="btn btn-primary me-2">Manage Users</Link> */}
//               {/* Example: <Link to="/admin/submissions/pending" className="btn btn-info">Review Submissions</Link> */}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';

// Import all the required dashboard components
import CongratulationsCard from '../components/dashboard/CongratulationsCard';
import StatsCard from '../components/dashboard/StatsCard'; // Re-used for all small stat boxes
import TotalRevenueCard from '../components/dashboard/TotalRevenueCard';
import ProfileReportCard from '../components/dashboard/ProfileReportCard';
import OrderStatisticsCard from '../components/dashboard/OrderStatisticsCard';
import ExpenseOverviewCard from '../components/dashboard/ExpenseOverviewCard'; // Note: corrected typo from Overveiw
import TransactionsCard from '../components/dashboard/TransactionsCard';
import assets from '../assets/assets'; // Assuming this holds all your image assets

// Renamed to AdminDashboard for clarity, as it's in AdminDashboard.jsx
const Home = () => {
  const { adminUser } = useContext(UserContext);

  // Note: Values and percentages are hardcoded as in the HTML.
  // You would replace these with dynamic data from your backend.

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="row">
        {/* Congratulations Card */}
        <div className="col-lg-8 mb-4 order-0">
          <CongratulationsCard
            name={adminUser?.fullName || adminUser?.email || 'John'}
            // Assuming your component can take these extra props from the HTML
            salesIncrease="72%"
            badgeLink="#"
          />
        </div>

        <div className="col-lg-4 col-md-4 order-1">
          <div className="row">
            {/* Profit Stats Card */}
            <div className="col-lg-6 col-md-12 col-6 mb-4">
               <StatsCard
                title="Profit"
                value="$12,628"
                percentage="+72.80%"
                iconSrc={assets.chartSuccessIcon || 'path/to/chart-success.png'}
                iconAlt="Profit"
                cardId="profitCard"
              />
            </div>
            {/* Sales Stats Card */}
            <div className="col-lg-6 col-md-12 col-6 mb-4">
              <StatsCard
                title="Sales"
                value="$4,679"
                percentage="+28.42%"
                iconSrc={assets.walletInfoIcon || 'path/to/wallet-info.png'}
                iconAlt="Sales"
                cardId="salesCard"
              />
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="col-12 col-lg-8 order-2 order-md-3 order-lg-2 mb-4">
          <TotalRevenueCard />
        </div>

        {/* Payments, Transactions Stats & Profile Report */}
        <div className="col-12 col-md-8 col-lg-4 order-3 order-md-2">
          <div className="row">
             {/* Payments Stats Card */}
            <div className="col-6 mb-4">
               <StatsCard
                title="Payments"
                value="$2,456"
                percentage="-14.82%"
                trend="down"
                iconSrc={assets.paypalIcon || 'path/to/paypal.png'}
                iconAlt="Payments"
                cardId="paymentsCard"
              />
            </div>
             {/* Transactions Stats Card */}
            <div className="col-6 mb-4">
              <StatsCard
                title="Transactions"
                value="$14,857"
                percentage="+28.14%"
                iconSrc={assets.ccPrimaryIcon || 'path/to/cc-primary.png'}
                iconAlt="Transactions"
                cardId="transactionsStatCard"
              />
            </div>
             {/* Profile Report Card */}
            <div className="col-12 mb-4">
              <ProfileReportCard />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Order Statistics */}
        <div className="col-md-6 col-lg-4 col-xl-4 order-0 mb-4">
          <OrderStatisticsCard />
        </div>

        {/* Expense Overview */}
        <div className="col-md-6 col-lg-4 order-1 mb-4">
          <ExpenseOverviewCard />
        </div>

        {/* Transactions List */}
        <div className="col-md-6 col-lg-4 order-2 mb-4">
          <TransactionsCard />
        </div>
      </div>
    </div>
  );
};

export default Home;