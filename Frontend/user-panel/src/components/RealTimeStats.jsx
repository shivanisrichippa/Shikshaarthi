// components/RealTimeStats.js
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const RealTimeStats = () => {
  const [stats, setStats] = useState({
    users: 689,
    happyUsers: 507,
    serviceProviders: 100
  });
  const [displayStats, setDisplayStats] = useState({
    users: 689,
    happyUsers: 507,
    serviceProviders: 100
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const socketRef = useRef(null);
  const animationRefs = useRef({});

  useEffect(() => {
    // Initialize WebSocket connection
    const initializeSocket = () => {
      socketRef.current = io(process.env.REACT_APP_STATS_SERVICE_URL || 'http://localhost:3003', {
        transports: ['websocket', 'polling']
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to stats service');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from stats service');
        setIsConnected(false);
      });

      socketRef.current.on('stats_update', (newStats) => {
        console.log('Received stats update:', newStats);
        setStats({
          users: newStats.users,
          happyUsers: newStats.happyUsers,
          serviceProviders: newStats.serviceProviders
        });
        setLastUpdated(new Date(newStats.lastUpdated));
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });
    };

    // Fetch initial stats from REST API
    const fetchInitialStats = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_STATS_SERVICE_URL || 'http://localhost:3003'}/api/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            users: data.users,
            happyUsers: data.happyUsers,
            serviceProviders: data.serviceProviders
          });
          setDisplayStats({
            users: data.users,
            happyUsers: data.happyUsers,
            serviceProviders: data.serviceProviders
          });
          setLastUpdated(new Date(data.lastUpdated));
        }
      } catch (error) {
        console.error('Failed to fetch initial stats:', error);
        // Fallback to mock data if API is not available
        simulateLiveUpdates();
      }
    };

    // Fallback simulation for demo purposes
    const simulateLiveUpdates = () => {
      const interval = setInterval(() => {
        const mockStats = {
          users: Math.floor(Math.random() * 100) + stats.users,
          happyUsers: Math.floor(Math.random() * 50) + stats.happyUsers,
          serviceProviders: Math.floor(Math.random() * 10) + stats.serviceProviders
        };
        
        setStats(mockStats);
        setLastUpdated(new Date());
        setIsConnected(true);
      }, 5000);

      return () => clearInterval(interval);
    };

    fetchInitialStats();
    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      // Clear any running animations
      Object.values(animationRefs.current).forEach(clearInterval);
    };
  }, []);

  // Animate counter updates
  useEffect(() => {
    const animateCounter = (key, startValue, endValue) => {
      if (startValue === endValue) return;
      
      // Clear previous animation for this key
      if (animationRefs.current[key]) {
        clearInterval(animationRefs.current[key]);
      }

      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepDuration = duration / steps;
      const increment = (endValue - startValue) / steps;

      let currentStep = 0;
      animationRefs.current[key] = setInterval(() => {
        currentStep++;
        const currentValue = Math.floor(startValue + (increment * currentStep));
        
        setDisplayStats(prev => ({
          ...prev,
          [key]: currentStep === steps ? endValue : currentValue
        }));

        if (currentStep >= steps) {
          clearInterval(animationRefs.current[key]);
          delete animationRefs.current[key];
        }
      }, stepDuration);
    };

    // Animate each stat individually
    ['users', 'happyUsers', 'serviceProviders'].forEach(key => {
      if (stats[key] !== displayStats[key]) {
        animateCounter(key, displayStats[key], stats[key]);
      }
    });
  }, [stats]);

  const refreshStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_STATS_SERVICE_URL || 'http://localhost:3003'}/api/stats/refresh`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Stats refreshed:', data);
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  return (
    <div>
      <div className="container-fluid faqt py-4 position-relative">
        {/* Connection Status and Controls */}
        <div className="position-absolute top-0 end-0 p-3 d-flex gap-2">
          <button 
            className="btn btn-sm btn-outline-primary" 
            onClick={refreshStats}
            title="Refresh Statistics"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
          <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
            <i className={`fas ${isConnected ? 'fa-wifi' : 'fa-wifi-slash'} me-1`}></i>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>

        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              <div className="row g-4">
                {/* Happy Customers */}
                <div className="col-sm-4 wow bounceInUp" data-wow-delay="0.3s">
                  <div className={`faqt-item bg-primary rounded p-4 text-center position-relative overflow-hidden ${isConnected ? 'live-update' : ''}`}>
                    {isConnected && <div className="live-indicator"></div>}
                    <i className="fas fa-users fa-4x mb-4 text-white position-relative"></i>
                    <h1 className="display-4 fw-bold text-white position-relative counter-number">
                      {displayStats.users.toLocaleString()}
                    </h1>
                    <p className="text-dark text-uppercase fw-bold mb-0 position-relative">Happy Customers</p>
                    <div className="position-absolute bottom-0 end-0 p-2">
                      <i className="fas fa-arrow-up text-success"></i>
                    </div>
                  </div>
                </div>
                
                {/* Active Users */}
                <div className="col-sm-4 wow bounceInUp" data-wow-delay="0.5s">
                  <div className={`faqt-item bg-primary rounded p-4 text-center position-relative overflow-hidden ${isConnected ? 'live-update' : ''}`}>
                    {isConnected && <div className="live-indicator"></div>}
                    <i className="fas fa-users-cog fa-4x mb-4 text-white position-relative"></i>
                    <h1 className="display-4 fw-bold text-white position-relative counter-number">
                      {displayStats.happyUsers.toLocaleString()}
                    </h1>
                    <p className="text-dark text-uppercase fw-bold mb-0 position-relative">Active Users</p>
                    <div className="position-absolute bottom-0 end-0 p-2">
                      <i className="fas fa-arrow-up text-success"></i>
                    </div>
                  </div>
                </div>
                
                {/* Service Providers */}
                <div className="col-sm-4 wow bounceInUp" data-wow-delay="0.7s">
                  <div className={`faqt-item bg-primary rounded p-4 text-center position-relative overflow-hidden ${isConnected ? 'live-update' : ''}`}>
                    {isConnected && <div className="live-indicator"></div>}
                    <i className="fas fa-check fa-4x mb-4 text-white position-relative"></i>
                    <h1 className="display-4 fw-bold text-white position-relative counter-number">
                      {displayStats.serviceProviders.toLocaleString()}
                    </h1>
                    <p className="text-dark text-uppercase fw-bold mb-0 position-relative">Service Providers</p>
                    <div className="position-absolute bottom-0 end-0 p-2">
                      <i className="fas fa-arrow-up text-success"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-5 wow bounceInUp" data-wow-delay="0.1s">
              <div className="video">
                <button 
                  type="button" 
                  className="btn btn-play position-relative" 
                  data-bs-toggle="modal" 
                  data-src="https://www.youtube.com/embed/DWRcNpR6Kdc" 
                  data-bs-target="#videoModal"
                >
                  <span></span>
                  <div className="position-absolute top-0 start-0 w-100 h-100 rounded-circle bg-primary opacity-25 animate-ping"></div>
                </button>
              </div>
            </div>
          </div>
          
          {/* Real-time update indicator */}
          <div className="row mt-4">
            <div className="col-12 text-center">
              <small className="text-muted d-flex align-items-center justify-content-center gap-2">
                <i className="fas fa-clock"></i>
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                {isConnected && (
                  <>
                    <i className="fas fa-circle text-success pulse-dot"></i>
                    <span>Live updates active</span>
                  </>
                )}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <div className="modal fade" id="videoModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content rounded-0">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Youtube Video</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="ratio ratio-16x9">
                <iframe 
                  className="embed-responsive-item" 
                  src="" 
                  id="video" 
                  allowFullScreen 
                  allow="autoplay"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .live-indicator {
          position: absolute;
          top: 10px;
          left: 10px;
          width: 12px;
          height: 12px;
          background: #28a745;
          border-radius: 50%;
          animation: pulse-glow 2s infinite;
          z-index: 10;
        }
        
        .live-indicator::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: #28a745;
          border-radius: 50%;
          opacity: 0.3;
          animation: pulse-ring 2s infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .pulse-dot {
          animation: pulse-dot 1.5s infinite;
          font-size: 6px !important;
        }
        
        @keyframes pulse-dot {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
        
        .live-update {
          position: relative;
        }
        
        .live-update::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
          animation: shimmer 3s infinite;
          pointer-events: none;
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .counter-number {
          transition: all 0.3s ease;
          font-weight: 900;
        }
        
        .faqt-item {
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .faqt-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        .live-update:hover {
          border-color: rgba(40, 167, 69, 0.3);
        }
        
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .btn-play {
          position: relative;
          z-index: 1;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .position-absolute.top-0.end-0 {
            position: relative !important;
            display: flex;
            justify-content: center;
            margin-bottom: 1rem;
          }
          
          .counter-number {
            font-size: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RealTimeStats;