import React, { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const storedAdmin = localStorage.getItem('adminUser');
      return storedAdmin ? JSON.parse(storedAdmin) : null;
    } catch (e) {
      console.error("Error parsing adminUser from localStorage", e);
      return null;
    }
  });
  
  const [isAdminAuthLoading, setIsAdminAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminDataString = localStorage.getItem('adminUser');
    
    if (token && adminDataString) {
      try {
        const parsedAdmin = JSON.parse(adminDataString);
        if (parsedAdmin && parsedAdmin.role === 'admin') {
          setAdminUser(parsedAdmin);
        } else {
          clearAdminStorage();
          setAdminUser(null);
        }
      } catch (e) {
        console.error("Failed to parse stored admin user data on init:", e);
        clearAdminStorage();
        setAdminUser(null);
      }
    }
    setIsAdminAuthLoading(false);
  }, []);

  const clearAdminStorage = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminPreferences');
    localStorage.removeItem('adminSettings');
    localStorage.removeItem('adminLoginTime');
  };

  const loginAdminContext = (adminData, adminToken, adminRefreshToken) => {
    try {
      localStorage.setItem('adminUser', JSON.stringify(adminData));
      localStorage.setItem('adminToken', adminToken);
      if (adminRefreshToken) {
        localStorage.setItem('adminRefreshToken', adminRefreshToken);
      }
      setAdminUser(adminData);
      localStorage.setItem('adminLoginTime', new Date().toISOString());
      console.log('Admin login successful:', adminData.email);
    } catch (error) {
      console.error('Error during admin login:', error);
      toast.error('Login failed due to storage error');
    }
  };

  // Standard logout method
  const logoutAdminContext = useCallback(async () => {
    try {
      const currentUser = adminUser?.email || 'Admin';
      
      // Optional: Make API call to backend logout endpoint
      /*
      try {
        const token = localStorage.getItem('adminToken');
        if (token) {
          await fetch(`${import.meta.env.VITE_BACKEND_AUTH_URL}/admin/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      } catch (apiError) {
        console.warn('Backend logout failed:', apiError);
      }
      */

      clearAdminStorage();
      setAdminUser(null);
      
      console.log(`Admin logged out: ${currentUser}`);
      
      window.dispatchEvent(new CustomEvent('adminLogout', { 
        detail: { user: currentUser } 
      }));
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      clearAdminStorage();
      setAdminUser(null);
      throw error;
    }
  }, [adminUser]);

  // Silent logout (no notifications)
  const silentLogout = useCallback(async () => {
    try {
      clearAdminStorage();
      setAdminUser(null);
      return true;
    } catch (error) {
      console.error('Silent logout error:', error);
      return false;
    }
  }, []);

  // Force logout with custom message
  const forceLogout = useCallback(async (options = {}) => {
    try {
      const { title = 'Session Ended', description = 'You have been logged out.' } = options;
      
      clearAdminStorage();
      setAdminUser(null);
      
      toast.error(title, {
        description,
        duration: 5000,
      });
      
      window.dispatchEvent(new CustomEvent('adminForceLogout', { 
        detail: { reason: title } 
      }));
      
      return true;
    } catch (error) {
      console.error('Force logout error:', error);
      return false;
    }
  }, []);

  // Session expired logout
  const sessionExpiredLogout = useCallback(async () => {
    return await forceLogout({
      title: 'Session Expired',
      description: 'Your session has expired. Please log in again.'
    });
  }, [forceLogout]);

  // Enhanced logout with different types
  const logoutAdmin = useCallback(async (type = 'manual', options = {}) => {
    try {
      switch (type) {
        case 'manual':
          return await logoutAdminContext();
        case 'silent':
          return await silentLogout();
        case 'force':
          return await forceLogout(options);
        case 'expired':
          return await sessionExpiredLogout();
        default:
          return await logoutAdminContext();
      }
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }, [logoutAdminContext, silentLogout, forceLogout, sessionExpiredLogout]);

  const isAdminAuthenticated = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    const user = adminUser;
    
    if (!token || !user || user.role !== 'admin') {
      return false;
    }
    
    // Optional: Check token expiry
    /*
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      if (tokenPayload.exp && tokenPayload.exp < now) {
        console.warn('Token expired');
        return false;
      }
    } catch (e) {
      console.warn('Token validation failed:', e);
      return false;
    }
    */
    
    return true;
  }, [adminUser]);
  
  const getAdminToken = () => localStorage.getItem('adminToken');
  const getAdminRefreshToken = () => localStorage.getItem('adminRefreshToken');

  const checkSessionValidity = useCallback(() => {
    const loginTime = localStorage.getItem('adminLoginTime');
    if (!loginTime) return true;
    
    const loginDate = new Date(loginTime);
    const now = new Date();
    const sessionDuration = now - loginDate;
    const MAX_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    
    if (sessionDuration > MAX_SESSION_DURATION) {
      console.warn('Session expired due to inactivity');
      toast.warning('Your session has expired. Please log in again.');
      sessionExpiredLogout();
      return false;
    }
    
    return true;
  }, [sessionExpiredLogout]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAdminAuthenticated()) {
        checkSessionValidity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAdminAuthenticated, checkSessionValidity]);

  const value = {
    adminUser,
    setAdminUser,
    loginAdminContext,
    logoutAdminContext,
    logoutAdmin,
    silentLogout,
    forceLogout,
    sessionExpiredLogout,
    isAdminAuthenticated,
    getAdminToken,
    getAdminRefreshToken,
    isAdminAuthLoading,
    checkSessionValidity,
  };

  return (
    <UserContext.Provider value={value}>
      {!isAdminAuthLoading ? children : (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 style={{ color: '#667eea', marginBottom: '0.5rem' }}>Shiksharthi Admin</h5>
            <p style={{ color: '#6c757d', margin: 0 }}>Initializing...</p>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
};