import React, { useContext, useCallback } from 'react';
import { UserContext } from '../context/UserContext';
import { toast } from 'sonner';

/**
 * Custom hook for handling various logout scenarios
 * Provides different logout methods for different use cases
 */
export const useLogout = () => {
  const { 
    logoutAdmin, 
    silentLogout, 
    forceLogout, 
    sessionExpiredLogout,
    adminUser 
  } = useContext(UserContext);

  // Standard logout with confirmation
  const logoutWithConfirmation = useCallback(async () => {
    const confirmed = window.confirm(
      `Are you sure you want to log out, ${adminUser?.name || adminUser?.email || 'Admin'}?`
    );
    
    if (confirmed) {
      return await logoutAdmin('manual');
    }
    return false;
  }, [logoutAdmin, adminUser]);

  // Logout with custom toast
  const logoutWithCustomToast = useCallback(async (title, description) => {
    try {
      const logoutPromise = logoutAdmin('manual');
      
      await toast.promise(logoutPromise, {
        loading: 'Processing logout...',
        success: title || 'Successfully logged out!',
        error: 'Logout failed. Please try again.',
        description: description,
        duration: 3000,
      });
      
      return await logoutPromise;
    } catch (error) {
      console.error('Custom logout error:', error);
      return false;
    }
  }, [logoutAdmin]);

  // Handle API errors that require logout
  const handleApiErrorLogout = useCallback(async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    switch (status) {
      case 401:
        toast.error('Authentication Failed', {
          description: 'Your session has expired. Please log in again.',
          duration: 5000,
        });
        return await sessionExpiredLogout();
        
      case 403:
        toast.error('Access Denied', {
          description: 'You do not have permission to perform this action.',
          duration: 5000,
        });
        return await forceLogout({
          title: 'Access Denied 🚫',
          description: 'Your access has been revoked. Please contact your administrator.'
        });
        
      default:
        toast.error('Server Error', {
          description: message || 'An unexpected error occurred.',
          duration: 4000,
        });
        return false;
    }
  }, [sessionExpiredLogout, forceLogout]);

  // Logout due to inactivity
  const logoutDueToInactivity = useCallback(async () => {
    return await forceLogout({
      title: 'Session Timeout ⏰',
      description: 'You were logged out due to inactivity for security reasons.'
    });
  }, [forceLogout]);

  // Logout due to multiple sessions detected
  const logoutDueToMultipleSessions = useCallback(async () => {
    return await forceLogout({
      title: 'Multiple Sessions Detected 🔄',
      description: 'You have been logged out because another session was detected.'
    });
  }, [forceLogout]);

  // Quick logout (no confirmation, minimal UI feedback)
  const quickLogout = useCallback(async () => {
    toast.info('Logging out...', { duration: 1000 });
    return await logoutAdmin('manual');
  }, [logoutAdmin]);

  // Maintenance logout (for system maintenance)
  const maintenanceLogout = useCallback(async () => {
    return await forceLogout({
      title: 'System Maintenance 🔧',
      description: 'The system is undergoing maintenance. Please try again later.'
    });
  }, [forceLogout]);

  return {
    // Standard logout methods
    logout: logoutAdmin,
    logoutSilently: silentLogout,
    forceLogout,
    
    // Enhanced logout methods
    logoutWithConfirmation,
    logoutWithCustomToast,
    quickLogout,
    
    // Scenario-specific logout methods
    handleApiErrorLogout,
    logoutDueToInactivity,
    logoutDueToMultipleSessions,
    maintenanceLogout,
    sessionExpiredLogout,
  };
};

/**
 * Hook for automatic logout on API errors
 * Can be used with axios interceptors or in API error handlers
 */
export const useApiErrorHandler = () => {
  const { handleApiErrorLogout } = useLogout();

  const handleError = useCallback(async (error) => {
    console.error('API Error:', error);
    
    // Check if it's an authentication/authorization error
    if (error.response?.status === 401 || error.response?.status === 403) {
      return await handleApiErrorLogout(error);
    }
    
    // For other errors, just show a toast without logging out
    const message = error.response?.data?.message || error.message || 'An error occurred';
    toast.error('Request Failed', {
      description: message,
      duration: 4000,
    });
    
    return false;
  }, [handleApiErrorLogout]);

  return { handleError };
};

/**
 * Hook for session management
 * Handles session timeout and activity tracking
 */
export const useSessionManager = (options = {}) => {
  const { 
    timeoutMinutes = 30, 
    warningMinutes = 5,
    checkInterval = 60000 // 1 minute
  } = options;
  
  const { logoutDueToInactivity } = useLogout();
  
  const [lastActivity, setLastActivity] = React.useState(Date.now());
  const [warningShown, setWarningShown] = React.useState(false);

  // Update last activity time
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setWarningShown(false);
  }, []);

  // Check session timeout
  const checkTimeout = useCallback(() => {
    const now = Date.now();
    const timeSinceActivity = now - lastActivity;
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

    if (timeSinceActivity >= timeoutMs) {
      // Session expired
      logoutDueToInactivity();
    } else if (timeSinceActivity >= warningMs && !warningShown) {
      // Show warning
      setWarningShown(true);
      toast.warning('Session Expiring Soon', {
        description: `Your session will expire in ${warningMinutes} minutes due to inactivity.`,
        duration: 10000,
        action: {
          label: 'Stay Active',
          onClick: updateActivity
        }
      });
    }
  }, [lastActivity, timeoutMinutes, warningMinutes, warningShown, logoutDueToInactivity, updateActivity]);

  // Set up activity listeners and timeout checker
  React.useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    const interval = setInterval(checkTimeout, checkInterval);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(interval);
    };
  }, [updateActivity, checkTimeout, checkInterval]);

  return {
    updateActivity,
    lastActivity,
    timeUntilTimeout: Math.max(0, (timeoutMinutes * 60 * 1000) - (Date.now() - lastActivity))
  };
};