import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppBrand from './AppBrand.jsx';
import { MenuHeader } from '../common/MenuItem.jsx';
import './Sidebar.css'

/**
 * Helper function to determine if a given navigation path is active.
 * For the main dashboard, it requires an exact match. For others, it checks if the
 * current URL path starts with the given path.
 * @param {object} location - The location object from `useLocation()`.
 * @param {string} path - The path to check against.
 * @returns {boolean} - True if the path is active, false otherwise.
 */
const isActivePath = (location, path) => {
  if (path === '/admin/dashboard') { // Use a more specific path to avoid matching everything
    return location.pathname === path;
  }
  return location.pathname.startsWith(path);
};

const Sidebar = () => {
  const location = useLocation();

  /**
   * This effect hook is crucial for the interactivity of the sidebar menu,
   * especially for handling the open/close state of dropdowns.
   * It interfaces with the theme's JavaScript (`menu.js`).
   */
  useEffect(() => {
    const menuElement = document.getElementById('layout-menu');
    if (!menuElement) return;

    // The theme's JS should expose a `window.menu` object with an `update` method.
    // We call this to re-evaluate the menu state when the route changes.
    if (window.menu && typeof window.menu.update === 'function') {
      const timerId = setTimeout(() => {
        try {
          window.menu.update();
        } catch (e) {
          console.error("Error calling window.menu.update():", e);
        }
      }, 100); // A small delay ensures the DOM is ready for the script.
      return () => clearTimeout(timerId);
    } else {
      console.warn("Sneat Menu object (window.menu) not found. Sidebar dropdowns may not be interactive.");
    }
  }, [location.pathname]); // Re-run this effect whenever the URL path changes.

  // Array of paths that fall under the "Services Data" dropdown.
  // This is used to keep the parent menu item highlighted and open.
  const serviceSubMenuPaths = [
    '/admin/submissions/rental',
    '/admin/submissions/mess',
    '/admin/submissions/plumber',
    '/admin/submissions/laundry',
    '/admin/submissions/electrician',
    '/admin/submissions/medical'
  ];

  // Function to handle dropdown toggle
  const handleDropdownToggle = (e) => {
    e.preventDefault();
    const menuItem = e.currentTarget.closest('.menu-item');
    if (menuItem) {
      menuItem.classList.toggle('open');
    }
  };

  return (
    <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
      <AppBrand />
      <div className="menu-inner-shadow"></div>

      <ul className="menu-inner py-1">
        {/* Dashboard */}
        <li className={`menu-item ${isActivePath(location, '/admin/dashboard') ? 'active' : ''}`}>
          <Link to="/" className="menu-link">
            <i className="menu-icon tf-icons bx bx-home-circle"></i>
            <div data-i18n="Dashboard">Dashboard</div>
          </Link>
        </li>

        {/* User Management */}
        <MenuHeader text="User Management" />
        <li className={`menu-item ${isActivePath(location, '/admin/users') ? 'active' : ''}`}>
          <Link to="/admin/users" className="menu-link">
            <i className="menu-icon tf-icons bx bx-user"></i>
            <div data-i18n="UsersList">Users List</div>
          </Link>
        </li>

        {/* Admin Management */}
        <MenuHeader text="Admin Management" />
        <li className={`menu-item ${isActivePath(location, '/admin/admins/add') ? 'active' : ''}`}>
          <Link to="/admin/admins/add" className="menu-link">
            <i className="menu-icon tf-icons bx bx-user-plus"></i>
            <div data-i18n="AddAdmin">Add Admin</div>
          </Link>
        </li>
        <li className={`menu-item ${isActivePath(location, '/admin/notifications') ? 'active' : ''}`}>
          <Link to="/admin/notifications" className="menu-link">
            <i className="menu-icon tf-icons bx bx-bell"></i>
            <div data-i18n="Notifications">Notifications</div>
          </Link>
        </li>

        {/* Data Submissions */}
        <MenuHeader text="Data Submissions" />
        <li className={`menu-item ${isActivePath(location, '/admin/submissions/pending') ? 'active' : ''}`}>
          <Link to="/admin/submissions/pending" className="menu-link">
            <i className="menu-icon tf-icons bx bx-time-five"></i>
            <div data-i18n="PendingApprovals">Pending Approvals</div>
          </Link>
        </li>
        <li className={`menu-item ${isActivePath(location, '/admin/submissions/approved') ? 'active' : ''}`}>
          <Link to="/admin/submissions/approved" className="menu-link">
            <i className="menu-icon tf-icons bx bx-check-circle"></i>
            <div data-i18n="ApprovedSubmissions">Approved Submissions</div>
          </Link>
        </li>
        <li className={`menu-item ${isActivePath(location, '/admin/submissions/rejected') ? 'active' : ''}`}>
          <Link to="/admin/submissions/rejected" className="menu-link">
            <i className="menu-icon tf-icons bx bx-x-circle"></i>
            <div data-i18n="RejectedSubmissions">Rejected Submissions</div>
          </Link>
        </li>

       {/* Services Dropdown - FIXED */}
       <li className={`menu-item ${serviceSubMenuPaths.some(path => isActivePath(location, path)) ? 'active open' : ''}`}>
          
          {/* Fixed dropdown toggle with proper href and click handler */}
          <a href="#" className="menu-link menu-toggle" onClick={handleDropdownToggle}>
            <i className="menu-icon tf-icons bx bx-collection"></i>
            <div data-i18n="Services">Services Data</div>
          </a>

          <ul className="menu-sub">
            <li className={`menu-item ${isActivePath(location, '/admin/submissions/rental') ? 'active' : ''}`}>
              <Link to="/admin/submissions/rental" className="menu-link">
                <div>Rental Rooms</div>
              </Link>
            </li>
            <li className={`menu-item ${isActivePath(location, '/admin/submissions/mess') ? 'active' : ''}`}>
              <Link to="/admin/submissions/mess" className="menu-link">
                <div>Mess Service</div>
              </Link>
            </li>
            <li className={`menu-item ${isActivePath(location, '/admin/submissions/plumber') ? 'active' : ''}`}>
              <Link to="/admin/submissions/plumber" className="menu-link">
                <div>Plumber Service</div>
              </Link>
            </li>
            <li className={`menu-item ${isActivePath(location, '/admin/submissions/laundry') ? 'active' : ''}`}>
              <Link to="/admin/submissions/laundry" className="menu-link">
                <div>Laundry Service</div>
              </Link>
            </li>
            <li className={`menu-item ${isActivePath(location, '/admin/submissions/electrician') ? 'active' : ''}`}>
              <Link to="/admin/submissions/electrician" className="menu-link">
                <div>Electrician Service</div>
              </Link>
            </li>
            <li className={`menu-item ${isActivePath(location, '/admin/submissions/medical') ? 'active' : ''}`}>
              <Link to="/admin/submissions/medical" className="menu-link">
                <div>Medical Service</div>
              </Link>
            </li>
          </ul>
        </li>

        {/* Configuration */}
        <MenuHeader text="Configuration" />
        <li className={`menu-item ${isActivePath(location, '/admin/settings') ? 'active' : ''}`}>
          <Link to="/admin/settings" className="menu-link">
            <i className="menu-icon tf-icons bx bx-cog"></i>
            <div data-i18n="Settings">Settings</div>
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;