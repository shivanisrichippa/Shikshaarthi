//frontend/ utils/tokenService.js

const backendUrl = import.meta.env.VITE_BACKEND_AUTH_URL;

class TokenService {
  constructor() {
    this.tokenKey = 'auth_token';
    this.userKey = 'auth_user';
    this.refreshTokenKey = 'refresh_token';
    this.tokenExpiryKey = 'token_expiry';
    this.cacheKey = 'auth_cache';
    this.sessionKey = 'auth_session';
    
    // Memory storage as fallback
    this.memoryStorage = {
      token: null,
      user: null,
      refreshToken: null,
      expiry: null,
      timestamp: null
    };
    
    // Initialize storage availability check
    this.storageAvailable = this.checkStorageAvailability();
    
    // Listen for storage events (cross-tab sync)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    }
  }

  // Check if localStorage and sessionStorage are available
  checkStorageAvailability() {
    const test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return {
        localStorage: true,
        sessionStorage: true
      };
    } catch (e) {
      return {
        localStorage: false,
        sessionStorage: false
      };
    }
  }

  // Handle storage changes from other tabs
  handleStorageChange(e) {
    if (e.key === this.tokenKey && !e.newValue && this.memoryStorage.token) {
      // Token removed in another tab, clear memory storage too
      this.clearMemoryStorage();
      this.dispatchAuthStateChange(false);
    }
  }

  // Handle page unload - persist to sessionStorage
  handleBeforeUnload() {
    if (this.memoryStorage.token && this.storageAvailable.sessionStorage) {
      try {
        sessionStorage.setItem(this.sessionKey, JSON.stringify(this.memoryStorage));
      } catch (error) {
        console.warn('Failed to persist auth to session storage:', error);
      }
    }
  }

  // Clear memory storage
  clearMemoryStorage() {
    this.memoryStorage = {
      token: null,
      user: null,
      refreshToken: null,
      expiry: null,
      timestamp: null
    };
  }

  // Multi-layer storage setter
  setTokens(token, user, refreshToken = null) {
    try {
      if (!token || !user) {
        console.error('TokenService: Invalid token or user data');
        return false;
      }

      // Parse token to get expiry
      const tokenPayload = this.parseJWT(token);
      const expiryTime = tokenPayload?.exp ? tokenPayload.exp * 1000 : Date.now() + (24 * 60 * 60 * 1000);

      const authData = {
        token,
        user,
        refreshToken,
        expiry: expiryTime,
        timestamp: Date.now()
      };

      // 1. Memory storage (always available)
      this.memoryStorage = { ...authData };

      // 2. LocalStorage (persistent)
      if (this.storageAvailable.localStorage) {
        try {
          localStorage.setItem(this.tokenKey, token);
          localStorage.setItem(this.userKey, JSON.stringify(user));
          localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
          if (refreshToken) {
            localStorage.setItem(this.refreshTokenKey, refreshToken);
          }
          localStorage.setItem(this.cacheKey, JSON.stringify(authData));
        } catch (error) {
          console.warn('Failed to store in localStorage:', error);
        }
      }

      // 3. SessionStorage (tab-specific backup)
      if (this.storageAvailable.sessionStorage) {
        try {
          sessionStorage.setItem(this.sessionKey, JSON.stringify(authData));
        } catch (error) {
          console.warn('Failed to store in sessionStorage:', error);
        }
      }

      // 4. Cookies as ultimate fallback (basic token only)
      try {
        const expires = new Date(expiryTime).toUTCString();
        document.cookie = `auth_backup=${token}; expires=${expires}; path=/; SameSite=Strict`;
      } catch (error) {
        console.warn('Failed to store in cookies:', error);
      }

      console.log('TokenService: Tokens stored successfully in multiple locations');
      this.dispatchAuthStateChange(true);
      return true;
    } catch (error) {
      console.error('TokenService: Error storing tokens:', error);
      return false;
    }
  }

  // Multi-layer storage getter with fallback chain
  getAuthData() {
    // 1. Try memory storage first (fastest)
    if (this.memoryStorage.token && !this.isTokenExpired(this.memoryStorage.expiry)) {
      return { ...this.memoryStorage, source: 'memory' };
    }

    // 2. Try localStorage
    if (this.storageAvailable.localStorage) {
      try {
        const cached = localStorage.getItem(this.cacheKey);
        if (cached) {
          const authData = JSON.parse(cached);
          if (authData.token && !this.isTokenExpired(authData.expiry)) {
            // Restore to memory
            this.memoryStorage = { ...authData };
            return { ...authData, source: 'localStorage' };
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    // 3. Try sessionStorage
    if (this.storageAvailable.sessionStorage) {
      try {
        const sessionData = sessionStorage.getItem(this.sessionKey);
        if (sessionData) {
          const authData = JSON.parse(sessionData);
          if (authData.token && !this.isTokenExpired(authData.expiry)) {
            // Restore to memory and localStorage
            this.memoryStorage = { ...authData };
            if (this.storageAvailable.localStorage) {
              this.restoreToLocalStorage(authData);
            }
            return { ...authData, source: 'sessionStorage' };
          }
        }
      } catch (error) {
        console.warn('Failed to read from sessionStorage:', error);
      }
    }

    // 4. Try cookies as last resort
    try {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_backup='));
      if (authCookie) {
        const token = authCookie.split('=')[1];
        if (token && !this.isTokenExpired()) {
          console.log('TokenService: Recovered token from cookies');
          return { token, source: 'cookies' };
        }
      }
    } catch (error) {
      console.warn('Failed to read from cookies:', error);
    }

    return null;
  }

  // Restore data to localStorage from other sources
  restoreToLocalStorage(authData) {
    if (!this.storageAvailable.localStorage) return;
    
    try {
      localStorage.setItem(this.tokenKey, authData.token);
      localStorage.setItem(this.userKey, JSON.stringify(authData.user));
      localStorage.setItem(this.tokenExpiryKey, authData.expiry.toString());
      if (authData.refreshToken) {
        localStorage.setItem(this.refreshTokenKey, authData.refreshToken);
      }
      localStorage.setItem(this.cacheKey, JSON.stringify(authData));
      console.log('TokenService: Restored data to localStorage');
    } catch (error) {
      console.warn('Failed to restore to localStorage:', error);
    }
  }

  // Get token with fallback chain
  getToken() {
    const authData = this.getAuthData();
    return authData?.token || null;
  }

  // Get user with fallback chain
  getUser() {
    const authData = this.getAuthData();
    return authData?.user || null;
  }

  // Get refresh token with fallback chain
  getRefreshToken() {
    const authData = this.getAuthData();
    return authData?.refreshToken || null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    const authData = this.getAuthData();
    return !!(authData?.token && authData?.user);
  }

  // Check if token is expired
  isTokenExpired(customExpiry = null) {
    try {
      let expiry;
      
      if (customExpiry) {
        expiry = customExpiry;
      } else {
        const authData = this.getAuthData();
        if (!authData?.expiry) return true;
        expiry = authData.expiry;
      }

      const now = Date.now();
      const buffer = 60000; // 1 minute buffer
      return now >= (expiry - buffer);
    } catch (error) {
      console.error('TokenService: Error checking token expiry:', error);
      return true;
    }
  }

  // Parse JWT token
  parseJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('TokenService: Error parsing JWT:', error);
      return null;
    }
  }

  // Clear all tokens from all storage locations
  clearTokens() {
    try {
      // Clear memory
      this.clearMemoryStorage();

      // Clear localStorage
      if (this.storageAvailable.localStorage) {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.tokenExpiryKey);
        localStorage.removeItem(this.cacheKey);
      }

      // Clear sessionStorage
      if (this.storageAvailable.sessionStorage) {
        sessionStorage.removeItem(this.sessionKey);
      }

      // Clear cookies
      try {
        document.cookie = 'auth_backup=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } catch (error) {
        console.warn('Failed to clear cookies:', error);
      }

      console.log('TokenService: All tokens cleared from all storage locations');
      this.dispatchAuthStateChange(false);
    } catch (error) {
      console.error('TokenService: Error clearing tokens:', error);
    }
  }

  // Enhanced token refresh with better error handling
  async ensureValidToken() {
    try {
      console.log('TokenService: Ensuring valid token...');
      
      // Check current token
      const authData = this.getAuthData();
      if (authData?.token && !this.isTokenExpired(authData.expiry)) {
        console.log('TokenService: Current token is valid, source:', authData.source);
        return { success: true, user: authData.user };
      }

      console.log('TokenService: Token expired or missing, attempting refresh...');
      
      // Try refresh token
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        console.log('TokenService: No refresh token available');
        return { success: false, error: 'No refresh token' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(`${backendUrl}/api/auth/refresh-token`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.log('TokenService: Refresh failed with status:', response.status);
          if (response.status === 401 || response.status === 403) {
            this.clearTokens();
            return { success: false, error: 'Invalid refresh token' };
          }
          return { success: false, error: 'Refresh request failed' };
        }

        const data = await response.json();
        
        if (data.success && data.token && data.user) {
          console.log('TokenService: Token refreshed successfully');
          this.setTokens(data.token, data.user, data.refreshToken);
          return { success: true, user: data.user };
        }

        return { success: false, error: 'Invalid refresh response' };
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('TokenService: Error ensuring valid token:', error);
      
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timeout' };
      }
      
      return { success: false, error: error.message };
    }
  }

  // Get auth with caching support
  async getAuthWithCache(forceRefresh = false) {
    if (!forceRefresh) {
      const authData = this.getAuthData();
      if (authData?.token && !this.isTokenExpired(authData.expiry)) {
        return { 
          success: true, 
          user: authData.user, 
          fromCache: true,
          source: authData.source 
        };
      }
    }

    const result = await this.ensureValidToken();
    return result;
  }

  // Get authorization header
  getAuthHeader() {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  }

  // Check if token needs refresh
  needsRefresh() {
    try {
      const authData = this.getAuthData();
      if (!authData?.expiry) return false;

      const now = Date.now();
      const refreshBuffer = 5 * 60 * 1000; // 5 minutes buffer

      return now >= (authData.expiry - refreshBuffer);
    } catch (error) {
      console.error('TokenService: Error checking refresh need:', error);
      return false;
    }
  }

  // Auto-refresh with improved logic
  startAutoRefresh() {
    // Clear any existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Check and refresh every 2 minutes
    this.refreshInterval = setInterval(async () => {
      try {
        if (this.isAuthenticated() && this.needsRefresh()) {
          console.log('TokenService: Auto-refreshing token...');
          const result = await this.ensureValidToken();
          if (!result.success) {
            console.warn('TokenService: Auto-refresh failed:', result.error);
            // Don't clear tokens on network errors, only on auth errors
            if (result.error === 'Invalid refresh token') {
              this.clearTokens();
            }
          }
        }
      } catch (error) {
        console.warn('TokenService: Auto-refresh error:', error);
      }
    }, 2 * 60 * 1000);

    console.log('TokenService: Auto-refresh started');
  }

  // Stop auto-refresh
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('TokenService: Auto-refresh stopped');
    }
  }

  // Dispatch auth state change events
  dispatchAuthStateChange(isAuthenticated) {
    try {
      window.dispatchEvent(new CustomEvent('authStateChanged', {
        detail: { 
          isAuthenticated, 
          timestamp: Date.now(),
          user: isAuthenticated ? this.getUser() : null
        }
      }));
    } catch (error) {
      console.warn('TokenService: Failed to dispatch auth change event:', error);
    }
  }

  // Health check method
  healthCheck() {
    return {
      memoryStorage: !!this.memoryStorage.token,
      localStorage: this.storageAvailable.localStorage && !!localStorage.getItem(this.tokenKey),
      sessionStorage: this.storageAvailable.sessionStorage && !!sessionStorage.getItem(this.sessionKey),
      isAuthenticated: this.isAuthenticated(),
      tokenExpired: this.isTokenExpired(),
      autoRefreshActive: !!this.refreshInterval
    };
  }
}

// Export singleton instance
const tokenService = new TokenService();

// Global error handler for auth failures
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.response?.status === 401) {
      console.log('Global auth error detected, checking token validity...');
      tokenService.ensureValidToken().catch(() => {
        // Token refresh failed, user needs to login again
        tokenService.clearTokens();
      });
    }
  });
}

export default tokenService;