// src/pages/admin/AdminDashboardPage.jsx
import React, { useEffect, useState } from 'react';

// We'll use StatsCard and other card components if they are generic enough.
// Otherwise, we can inline the structure.
import StatsCard from '../../components/dashboard/StatsCard.jsx'; // Assuming this is flexible

// Mock API call function for dashboard stats (replace with actual API calls)
const fetchAdminDashboardStats = async () => {
  console.log("Fetching admin dashboard stats...");
  // Replace with:
  // const response = await fetch(`/api/admin/platform-stats`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
  // const data = await response.json();
  // return data;

  return new Promise(resolve => setTimeout(() => {
    resolve({
      totalUsers: { value: 1250, trend: "+5 since yesterday" },
      pendingSubmissions: { value: 32, trend: "New" },
      approvedToday: { value: 15, trend_percentage: "+10%" },
      rejectedToday: { value: 2, trend_percentage: "-5%" },
      totalOrdersMock: { value: 8258 }, // From original template
      totalSalesMock: { value: "42.82k" }, // From original template
      profileReportTotalMock: { value: "$84,686k", trend_percentage: "68.2%" }, // From original template
      // ... other stats for charts
    });
  }, 500));
};


const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAdminDashboardStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch admin stats:", err);
      setLoading(false);
      // Handle error display if needed
    });
  }, []);


  useEffect(() => {
    // This attempts to re-run the chart initialization script from the template.
    // This is a common approach when migrating static templates.
    // For a more robust solution, integrate a React charting library.

    // Check if the script is already loaded to avoid duplicates if navigation happens
    if (!document.getElementById('dashboard-analytics-script')) {
        const script = document.createElement('script');
        script.id = 'dashboard-analytics-script';
        script.src = '/assets/js/dashboards-analytics.js'; // Ensure this path is correct in your public folder
        script.async = true;
        // script.onload = () => console.log("Dashboard analytics script loaded.");
        // script.onerror = () => console.error("Failed to load dashboard analytics script.");
        document.body.appendChild(script);

        return () => {
          // Cleanup the script when the component unmounts
          const existingScript = document.getElementById('dashboard-analytics-script');
          if (existingScript) {
            document.body.removeChild(existingScript);
          }
        };
    }
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount.

  if (loading || !stats) {
    return (
      <div className="container-xxl flex-grow-1 container-p-y text-center">
        <h4>Loading Dashboard Data...</h4>
        {/* You can add a spinner here */}
      </div>
    );
  }

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="row">
        {/* Section 1: "Congratulations John! / Welcome Admin" Card (col-lg-8) */}
        <div className="col-lg-8 mb-4 order-0">
          <div className="card">
            <div className="d-flex align-items-end row">
              <div className="col-sm-7">
                <div className="card-body">
                  <h5 className="card-title text-primary">Welcome to Shiksharthi Admin! 🎉</h5>
                  <p className="mb-4">
                    You have <span className="fw-bold">{stats.pendingSubmissions.value} pending</span> data submissions to review.
                    Keep up the great work managing the platform.
                  </p>
                  <a href="#!" onClick={(e) => {e.preventDefault(); /* Navigate to pending submissions */}} className="btn btn-sm btn-outline-primary">View Submissions</a>
                </div>
              </div>
              <div className="col-sm-5 text-center text-sm-left">
                <div className="card-body pb-0 px-0 px-md-4">
                  <img
                    src="/assets/img/illustrations/man-with-laptop-light.png" // Ensure path is correct
                    height="140"
                    alt="View Badge User"
                    data-app-dark-img="illustrations/man-with-laptop-dark.png"
                    data-app-light-img="illustrations/man-with-laptop-light.png"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Stats Cards Side (col-lg-4) */}
        <div className="col-lg-4 col-md-4 order-1">
          <div className="row">
            <div className="col-lg-6 col-md-12 col-6 mb-4">
              <StatsCard
                title="Total Users"
                value={stats.totalUsers.value.toLocaleString()}
                percentage={stats.totalUsers.trend}
                iconSrc="/assets/img/icons/unicons/user-plus.png" // Custom icon
                iconAlt="Total Users"
                cardId="cardTotalUsers"
              />
            </div>
            <div className="col-lg-6 col-md-12 col-6 mb-4">
              <StatsCard
                title="Pending Submissions"
                value={stats.pendingSubmissions.value}
                percentage={stats.pendingSubmissions.trend} // e.g., "+3 New"
                iconSrc="/assets/img/icons/unicons/file-question-alt.png" // Custom icon
                iconAlt="Pending Submissions"
                cardId="cardPendingSubmissions"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Total Revenue Card -> "Submission Overview" (col-12 col-lg-8) */}
        <div className="col-12 col-lg-8 order-2 order-md-3 order-lg-2 mb-4">
          <div className="card">
            <div className="row row-bordered g-0">
              <div className="col-md-8">
                <h5 className="card-header m-0 me-2 pb-3">Platform Activity Overview</h5>
                {/* This div is targeted by dashboards-analytics.js */}
                <div id="totalRevenueChart" className="px-2"></div>
              </div>
              <div className="col-md-4">
                <div className="card-body">
                  <div className="text-center">
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-outline-primary dropdown-toggle"
                        type="button"
                        id="growthReportId" // Used by JS
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        Last 30 Days
                      </button>
                      <div className="dropdown-menu dropdown-menu-end" aria-labelledby="growthReportId">
                        <a className="dropdown-item" href="#!">Last 7 Days</a>
                        <a className="dropdown-item" href="#!">Last Quarter</a>
                        <a className="dropdown-item" href="#!">This Year</a>
                      </div>
                    </div>
                  </div>
                </div>
                {/* This div is targeted by dashboards-analytics.js */}
                <div id="growthChart"></div>
                <div className="text-center fw-semibold pt-3 mb-2">Overall Platform Engagement</div>
                <div className="d-flex px-xxl-4 px-lg-2 p-4 gap-xxl-3 gap-lg-1 gap-3 justify-content-between">
                  <div className="d-flex">
                    <div className="me-2">
                      <span className="badge bg-label-primary p-2"><i className="bx bx-data text-primary"></i></span>
                    </div>
                    <div className="d-flex flex-column">
                      <small>Submissions</small>
                      <h6 className="mb-0">1.2k</h6> {/* Example Data */}
                    </div>
                  </div>
                  <div className="d-flex">
                    <div className="me-2">
                      <span className="badge bg-label-info p-2"><i className="bx bx-user-check text-info"></i></span>
                    </div>
                    <div className="d-flex flex-column">
                      <small>New Signups</small>
                      <h6 className="mb-0">85</h6> {/* Example Data */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Section 2: END "Total Revenue Card" */}

        {/* Section 2: More Stats Cards & Profile Report -> "Quick Stats & Top Contributors" (col-12 col-md-8 col-lg-4) */}
        <div className="col-12 col-md-8 col-lg-4 order-3 order-md-2">
          <div className="row">
            <div className="col-6 mb-4">
               <StatsCard
                title="Approved Today"
                value={stats.approvedToday.value}
                percentage={stats.approvedToday.trend_percentage}
                iconSrc="/assets/img/icons/unicons/file-check-alt.png"
                iconAlt="Approved Submissions"
                cardId="cardOpt4" // Ensure unique IDs if used by JS
              />
            </div>
            <div className="col-6 mb-4">
              <StatsCard
                title="Rejected Today"
                value={stats.rejectedToday.value}
                percentage={stats.rejectedToday.trend_percentage}
                iconSrc="/assets/img/icons/unicons/file-times-alt.png"
                iconAlt="Rejected Submissions"
                trend={parseFloat(stats.rejectedToday.trend_percentage) < 0 ? "down" : "up"} // Logic for arrow
                trendColor={parseFloat(stats.rejectedToday.trend_percentage) < 0 ? "success" : "danger"} // Less rejection is good
                cardId="cardOpt1" // Ensure unique IDs
              />
            </div>
            <div className="col-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between flex-sm-row flex-column gap-3">
                    <div className="d-flex flex-sm-column flex-row align-items-start justify-content-between">
                      <div className="card-title">
                        <h5 className="text-nowrap mb-2">Top Contributors</h5>
                        <span className="badge bg-label-warning rounded-pill">This Month</span>
                      </div>
                      <div className="mt-sm-auto">
                        <small className="text-success text-nowrap fw-semibold">
                          <i className="bx bx-chevron-up"></i> {stats.profileReportTotalMock.trend_percentage}
                        </small>
                        <h3 className="mb-0">{stats.profileReportTotalMock.value} Coins</h3> {/* Example: Total coins by top */}
                      </div>
                    </div>
                    {/* This div is targeted by dashboards-analytics.js */}
                    <div id="profileReportChart"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Section 2: END "More Stats Cards & Profile Report" */}
      </div>

      <div className="row">
        {/* Section 3: Order Statistics -> "Submission Category Stats" (col-md-6 col-lg-4 col-xl-4) */}
        <div className="col-md-6 col-lg-4 col-xl-4 order-0 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center justify-content-between pb-0">
              <div className="card-title mb-0">
                <h5 className="m-0 me-2">Submission by Category</h5>
                <small className="text-muted">{stats.totalSalesMock} Total Submissions</small> {/* Example */}
              </div>
              <div className="dropdown">
                <button
                  className="btn p-0"
                  type="button"
                  id="orederStatistics" // Used by JS
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i className="bx bx-dots-vertical-rounded"></i>
                </button>
                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="orederStatistics">
                  <a className="dropdown-item" href="#!">Last Week</a>
                  <a className="dropdown-item" href="#!">Last Month</a>
                  <a className="dropdown-item" href="#!">All Time</a>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex flex-column align-items-center gap-1">
                  <h2 className="mb-2">{stats.totalOrdersMock.value}</h2> {/* Example: Total submissions */}
                  <span>Total Unique Data Points</span>
                </div>
                 {/* This div is targeted by dashboards-analytics.js */}
                <div id="orderStatisticsChart"></div>
              </div>
              <ul className="p-0 m-0">
                <li className="d-flex mb-4 pb-1">
                  <div className="avatar flex-shrink-0 me-3">
                    <span className="avatar-initial rounded bg-label-primary"><i className="bx bx-building-house"></i></span> {/* Rental Room Icon */}
                  </div>
                  <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                    <div className="me-2">
                      <h6 className="mb-0">Rental Rooms</h6>
                      <small className="text-muted">PGs, Flats, Single Rooms</small>
                    </div>
                    <div className="user-progress">
                      <small className="fw-semibold">825</small> {/* Example */}
                    </div>
                  </div>
                </li>
                <li className="d-flex mb-4 pb-1">
                  <div className="avatar flex-shrink-0 me-3">
                    <span className="avatar-initial rounded bg-label-success"><i className="bx bx-restaurant"></i></span> {/* Mess Icon */}
                  </div>
                  <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                    <div className="me-2">
                      <h6 className="mb-0">Mess Services</h6>
                      <small className="text-muted">Tiffins, Weekly/Monthly</small>
                    </div>
                    <div className="user-progress">
                      <small className="fw-semibold">238</small> {/* Example */}
                    </div>
                  </div>
                </li>
                <li className="d-flex mb-4 pb-1">
                  <div className="avatar flex-shrink-0 me-3">
                    <span className="avatar-initial rounded bg-label-info"><i className="bx bx-plus-medical"></i></span> {/* Medical Icon */}
                  </div>
                  <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                    <div className="me-2">
                      <h6 className="mb-0">Medical Info</h6>
                      <small className="text-muted">Clinics, Pharmacies</small>
                    </div>
                    <div className="user-progress">
                      <small className="fw-semibold">849</small> {/* Example */}
                    </div>
                  </div>
                </li>
                <li className="d-flex">
                  <div className="avatar flex-shrink-0 me-3">
                    <span className="avatar-initial rounded bg-label-secondary"><i className="bx bx-wrench"></i></span> {/* Misc Icon */}
                  </div>
                  <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                    <div className="me-2">
                      <h6 className="mb-0">Miscellaneous</h6>
                      <small className="text-muted">Plumbers, Electricians, Laundry</small>
                    </div>
                    <div className="user-progress">
                      <small className="fw-semibold">99</small> {/* Example */}
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Section 3: END "Order Statistics Card" */}

        {/* Section 3: Expense Overview -> "Coin Distribution / System Logs" (col-md-6 col-lg-4) */}
        <div className="col-md-6 col-lg-4 order-1 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <ul className="nav nav-pills" role="tablist">
                <li className="nav-item">
                  <button
                    type="button"
                    className="nav-link active"
                    role="tab"
                    data-bs-toggle="tab"
                    data-bs-target="#navs-tabs-line-card-income" // Used by JS
                    aria-controls="navs-tabs-line-card-income"
                    aria-selected="true"
                  >
                    Coin Rewards
                  </button>
                </li>
                <li className="nav-item">
                  <button type="button" className="nav-link" role="tab">System</button> {/* Tab for System Health/Logs */}
                </li>
                <li className="nav-item">
                  <button type="button" className="nav-link" role="tab">Activity</button> {/* Tab for Recent Admin Activity */}
                </li>
              </ul>
            </div>
            <div className="card-body px-0">
              <div className="tab-content p-0">
                <div className="tab-pane fade show active" id="navs-tabs-line-card-income" role="tabpanel">
                  <div className="d-flex p-4 pt-3">
                    <div className="avatar flex-shrink-0 me-3">
                      <img src="/assets/img/icons/unicons/coin-stack.png" alt="Coins" /> {/* Custom Icon */}
                    </div>
                    <div>
                      <small className="text-muted d-block">Total Coins Awarded</small>
                      <div className="d-flex align-items-center">
                        <h6 className="mb-0 me-1">15,459</h6> {/* Example Data */}
                        <small className="text-success fw-semibold">
                          <i className="bx bx-chevron-up"></i>
                          5.2%
                        </small>
                      </div>
                    </div>
                  </div>
                   {/* This div is targeted by dashboards-analytics.js */}
                  <div id="incomeChart"></div>
                  <div className="d-flex justify-content-center pt-4 gap-2">
                    <div className="flex-shrink-0">
                       {/* This div is targeted by dashboards-analytics.js */}
                      <div id="expensesOfWeek"></div>
                    </div>
                    <div>
                      <p className="mb-n1 mt-1">Coins Awarded This Week</p>
                      <small className="text-muted">250 more than last week</small> {/* Example Data */}
                    </div>
                  </div>
                </div>
                {/* Add tab-pane for System and Activity if needed */}
              </div>
            </div>
          </div>
        </div>
        {/* Section 3: END "Expense Overview Card" */}

        {/* Section 3: Transactions -> "Recent Admin Actions / Critical Logs" (col-md-6 col-lg-4) */}
        <div className="col-md-6 col-lg-4 order-2 mb-4">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="card-title m-0 me-2">Recent Actions / Logs</h5>
              <div className="dropdown">
                <button
                  className="btn p-0"
                  type="button"
                  id="transactionID" // Used by JS
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i className="bx bx-dots-vertical-rounded"></i>
                </button>
                <div className="dropdown-menu dropdown-menu-end" aria-labelledby="transactionID">
                  <a className="dropdown-item" href="#!">Last 24 Hours</a>
                  <a className="dropdown-item" href="#!">Last 7 Days</a>
                  <a className="dropdown-item" href="#!">All Logs</a>
                </div>
              </div>
            </div>
            <div className="card-body">
              <ul className="p-0 m-0">
                <li className="d-flex mb-4 pb-1">
                  <div className="avatar flex-shrink-0 me-3">
                    <img src="/assets/img/avatars/5.png" alt="User" className="rounded" /> {/* Admin Avatar */}
                  </div>
                  <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                    <div className="me-2">
                      <small className="text-muted d-block mb-1">ADMIN ACTION</small>
                      <h6 className="mb-0">Approved 'Mess ABC' data</h6>
                    </div>
                    <div className="user-progress d-flex align-items-center gap-1">
                      <small className="text-muted">10:30 AM</small>
                    </div>
                  </div>
                </li>
                <li className="d-flex mb-4 pb-1">
                  <div className="avatar flex-shrink-0 me-3">
                     <span className="avatar-initial rounded bg-label-warning"><i className="bx bx-error"></i></span>
                  </div>
                  <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                    <div className="me-2">
                      <small className="text-muted d-block mb-1">SYSTEM LOG</small>
                      <h6 className="mb-0">High DB CPU Usage</h6>
                    </div>
                     <div className="user-progress d-flex align-items-center gap-1">
                      <small className="text-danger">CRITICAL</small>
                    </div>
                  </div>
                </li>
                 {/* ... more list items for logs ... */}
                 <li className="d-flex mb-4 pb-1">
                  <div className="avatar flex-shrink-0 me-3">
                    <img src="/assets/img/avatars/1.png" alt="User" className="rounded" /> {/* Admin Avatar */}
                  </div>
                  <div className="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                    <div className="me-2">
                      <small className="text-muted d-block mb-1">USER MANAGEMENT</small>
                      <h6 className="mb-0">User 'test@example.com' signed up</h6>
                    </div>
                    <div className="user-progress d-flex align-items-center gap-1">
                        <small className="text-muted">09:15 AM</small>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Section 3: END "Transactions Card" */}
      </div>
    </div>
  );
};

export default AdminDashboardPage;