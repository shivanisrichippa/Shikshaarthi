import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import assets from '../../assets/assets.js';
import { UserContext } from '../../context/UserContext';
import { toast } from 'sonner';

const Navbar = () => {
  const navigate = useNavigate();
  const { adminUser, logoutAdminContext } = useContext(UserContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleMobileMenu = (e) => {
    e.preventDefault();
    const layoutMenu = document.querySelector('.layout-menu');
    if (layoutMenu) {
      if (document.documentElement.classList.contains('layout-menu-expanded')) {
        document.documentElement.classList.remove('layout-menu-expanded');
      } else {
        document.documentElement.classList.add('layout-menu-expanded');
      }
    }
    console.log("Mobile menu toggled");
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Show loading toast
      const logoutPromise = new Promise(async (resolve, reject) => {
        try {
          // Add a small delay for better UX
          await new Promise(resolve => setTimeout(resolve, 800));
          await logoutAdminContext();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      await toast.promise(logoutPromise, {
        loading: 'Signing you out...',
        success: () => {
          // Navigate after showing success message
          setTimeout(() => {
            navigate('/admin/login', { replace: true });
          }, 1000);
          return `Goodbye ${adminUser?.email || 'Admin'}! You've been logged out successfully. 👋`;
        },
        error: 'Failed to logout. Please try again.',
        duration: 3000,
      });

    } catch (error) {
      console.error('Logout failed:', error);
      // Force navigation even if logout fails
      setTimeout(() => {
        navigate('/admin/login', { replace: true });
      }, 500);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav
      className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
      id="layout-navbar"
    >
      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
        <a className="nav-item nav-link px-0 me-xl-4" href="#" onClick={toggleMobileMenu}>
          <i className="bx bx-menu bx-sm"></i>
        </a>
      </div>

      <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
        {/* Search Bar */}
        <div className="navbar-nav align-items-center">
          <div className="nav-item d-flex align-items-center">
            <i className="bx bx-search fs-4 lh-0"></i>
            <input
              type="text"
              className="form-control border-0 shadow-none"
              placeholder="Search..."
              aria-label="Search..."
            />
          </div>
        </div>

        {/* Navbar Icons and User Dropdown */}
        <ul className="navbar-nav flex-row align-items-center ms-auto">
          <li className="nav-item navbar-dropdown dropdown-user dropdown">
            <a className="nav-link dropdown-toggle hide-arrow" href="#" data-bs-toggle="dropdown">
              <div className="avatar avatar-online">
                <img 
                  src={assets.person || 'https://via.placeholder.com/40'} 
                  alt="User Avatar" 
                  className="w-px-40 h-auto rounded-circle" 
                />
              </div>
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <Link className="dropdown-item" to="/admin/profile">
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar avatar-online">
                        <img 
                          src={assets.person || 'https://via.placeholder.com/40'} 
                          alt="User Avatar" 
                          className="w-px-40 h-auto rounded-circle" 
                        />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <span className="fw-semibold d-block">
                        {adminUser?.name || adminUser?.email || 'Admin'}
                      </span>
                      <small className="text-muted">
                        {adminUser?.role || 'Admin'}
                      </small>
                    </div>
                  </div>
                </Link>
              </li>
              <li><div className="dropdown-divider"></div></li>
              <li>
                <Link className="dropdown-item" to="/admin/admins/add">
                  <i className="bx bx-user me-2"></i>
                  <span className="align-middle">Add Admin</span>
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/admin/settings">
                  <i className="bx bx-cog me-2"></i>
                  <span className="align-middle">Settings</span>
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/admin/notifications">
                  <span className="d-flex align-items-center align-middle">
                    <i className="flex-shrink-0 bx bx-bell me-2"></i>
                    <span className="flex-grow-1 align-middle">Notifications</span>
                    <span className="flex-shrink-0 badge badge-center rounded-pill bg-danger w-px-20 h-px-20">
                      4
                    </span>
                  </span>
                </Link>
              </li>
              <li>
                <div className="dropdown-divider"></div>
              </li>
              <li>
                <button 
                  className="dropdown-item w-100 text-start border-0 bg-transparent"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  style={{
                    color: isLoggingOut ? '#6c757d' : '#d63384',
                    cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    padding: '0.5rem 1rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoggingOut) {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoggingOut) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {isLoggingOut ? (
                    <>
                      <span 
                        className="spinner-border spinner-border-sm me-2" 
                        role="status" 
                        aria-hidden="true"
                      ></span>
                      <span className="align-middle">Signing Out...</span>
                    </>
                  ) : (
                    <>
                      <i className="bx bx-power-off me-2"></i>
                      <span className="align-middle">Log Out</span>
                    </>
                  )}
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;