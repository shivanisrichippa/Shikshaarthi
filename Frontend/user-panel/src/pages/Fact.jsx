import React from 'react'

const Fact = () => {
  return (
    <div>
        <div className="container-fluid faqt py-4">
    <div className="container">
        <div className="row g-4 align-items-center">
            <div className="col-lg-7">
               <div className="row g-4">
                    <div className="col-sm-4 wow bounceInUp" data-wow-delay="0.3s">
                        <div className="faqt-item bg-primary rounded p-4 text-center">
                            <i className="fas fa-users fa-4x mb-4 text-white"></i>
                            <h1 className="display-4 fw-bold" data-toggle="counter-up">689</h1>
                            <p className="text-dark text-uppercase fw-bold mb-0">Happy Customers</p>
                        </div>
                    </div>
                    <div className="col-sm-4 wow bounceInUp" data-wow-delay="0.5s">
                        <div className="faqt-item bg-primary rounded p-4 text-center">
                            <i className="fas fa-users-cog fa-4x mb-4 text-white"></i>
                            <h1 className="display-4 fw-bold" data-toggle="counter-up">507</h1>
                            <p className="text-dark text-uppercase fw-bold mb-0">Happy Users</p>
                        </div>
                    </div>
                    <div className="col-sm-4 wow bounceInUp" data-wow-delay="0.7s">
                        <div className="faqt-item bg-primary rounded p-4 text-center">
                            <i className="fas fa-check fa-4x mb-4 text-white"></i>
                            <h1 className="display-4 fw-bold" data-toggle="counter-up">100</h1>
                            <p className="text-dark text-uppercase fw-bold mb-0">Service Providers</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-lg-5 wow bounceInUp" data-wow-delay="0.1s">
                <div className="video">
                    <button type="button" className="btn btn-play" data-bs-toggle="modal" data-src="https://www.youtube.com/embed/DWRcNpR6Kdc" data-bs-target="#videoModal">
                        <span></span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
\
<div className="modal fade" id="videoModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div className="modal-dialog">
        <div className="modal-content rounded-0">
            <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Youtube Video</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              
                <div className="ratio ratio-16x9">
                    <iframe className="embed-responsive-item" src="" id="video" allowfullscreen allowscriptaccess="always"
                        allow="autoplay"></iframe>
                </div>
            </div>
        </div>
    </div>
</div>

      
    </div>
  )
}

export default Fact



// import React, { useState, useEffect, useRef } from 'react';
// import statsService from '../services/statsService';
// import { useAnimatedCounter, useStaggeredCounters } from '../hooks/useAnimatedCounter';

// // Individual counter component with animation
// const AnimatedCounter = ({ 
//   icon, 
//   endValue, 
//   label, 
//   delay = 0,
//   shouldAnimate = false,
//   formatValue = null 
// }) => {
//   const { displayValue, isAnimating } = useAnimatedCounter(
//     endValue, 
//     2000, 
//     shouldAnimate,
//     formatValue
//   );

//   return (
//     <div className="col-sm-4 wow bounceInUp" data-wow-delay={`${delay}s`}>
//       <div className="faqt-item bg-primary rounded p-4 text-center">
//         <i className={`${icon} fa-4x mb-4 text-white`}></i>
//         <h1 className={`display-4 fw-bold ${isAnimating ? 'text-white' : 'text-white'}`} data-toggle="counter-up">
//           {displayValue}
//         </h1>
//         <p className="text-dark text-uppercase fw-bold mb-0">{label}</p>
//       </div>
//     </div>
//   );
// };

// // Error boundary component
// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError(error) {
//     return { hasError: true };
//   }

//   componentDidCatch(error, errorInfo) {
//     console.error('Fact component error:', error, errorInfo);
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="alert alert-warning text-center">
//           <h5>Unable to load statistics</h5>
//           <p>Please refresh the page to try again.</p>
//         </div>
//       );
//     }

//     return this.props.children;
//   }
// }

// const Fact = () => {
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     activeUsers: 0,
//     serviceProviders: 0,
//     verifiedUsers: 0,
//     totalSubmissions: 0
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [hasAnimated, setHasAnimated] = useState(false);
//   const [isVisible, setIsVisible] = useState(false);
  
//   const sectionRef = useRef(null);
//   const observerRef = useRef(null);

//   // Format large numbers with K/M suffixes
//   const formatNumber = (num) => {
//     if (num >= 1000000) {
//       return (num / 1000000).toFixed(1) + 'M';
//     } else if (num >= 1000) {
//       return (num / 1000).toFixed(1) + 'K';
//     }
//     return num.toString();
//   };

//   // Counter configurations
//   const counterConfigs = [
//     {
//       icon: "fas fa-users",
//       value: stats.totalUsers || 689,
//       label: "Happy Customers",
//       delay: 0.3
//     },
//     {
//       icon: "fas fa-users-cog", 
//       value: stats.activeUsers || 507,
//       label: "Happy Users",
//       delay: 0.5
//     },
//     {
//       icon: "fas fa-check",
//       value: stats.serviceProviders || 100,
//       label: "Service Providers", 
//       delay: 0.7
//     }
//   ];

//   const staggeredCounters = useStaggeredCounters(counterConfigs, isVisible && !loading, 300);

//   // Intersection Observer for scroll-triggered animation
//   useEffect(() => {
//     observerRef.current = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting && !hasAnimated) {
//             setIsVisible(true);
//             setHasAnimated(true);
//           }
//         });
//       },
//       {
//         threshold: 0.3,
//         rootMargin: '50px'
//       }
//     );

//     if (sectionRef.current) {
//       observerRef.current.observe(sectionRef.current);
//     }

//     return () => {
//       if (observerRef.current) {
//         observerRef.current.disconnect();
//       }
//     };
//   }, [hasAnimated]);

//   // Fetch platform statistics
//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const platformStats = await statsService.getStatsWithCache();
        
//         if (platformStats.error) {
//           console.warn('Using fallback stats due to API error:', platformStats.errorMessage);
//           setError('Using cached data - some statistics may not be current');
//         }
        
//         setStats(platformStats);
//       } catch (err) {
//         console.error('Failed to fetch stats:', err);
//         setError('Unable to load current statistics');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStats();
//   }, []);

//   // Auto-refresh stats every 5 minutes
//   useEffect(() => {
//     const interval = setInterval(async () => {
//       try {
//         const freshStats = await statsService.getPlatformStats();
//         if (!freshStats.error) {
//           setStats(freshStats);
//         }
//       } catch (err) {
//         console.warn('Background stats refresh failed:', err);
//       }
//     }, 5 * 60 * 1000);

//     return () => clearInterval(interval);
//   }, []);

//   // Handle video modal
//   useEffect(() => {
//     const handleVideoModal = () => {
//       const videoModal = document.getElementById('videoModal');
//       const videoFrame = document.getElementById('video');
      
//       if (videoModal) {
//         videoModal.addEventListener('show.bs.modal', function (event) {
//           const button = event.relatedTarget;
//           const videoSrc = button.getAttribute('data-src');
//           if (videoFrame && videoSrc) {
//             videoFrame.src = videoSrc + '?autoplay=1';
//           }
//         });
        
//         videoModal.addEventListener('hide.bs.modal', function () {
//           if (videoFrame) {
//             videoFrame.src = '';
//           }
//         });
//       }
//     };

//     // Set up modal handlers after component mounts
//     setTimeout(handleVideoModal, 100);
    
//     return () => {
//       const videoModal = document.getElementById('videoModal');
//       if (videoModal) {
//         videoModal.removeEventListener('show.bs.modal', () => {});
//         videoModal.removeEventListener('hide.bs.modal', () => {});
//       }
//     };
//   }, []);

//   return (
//     <ErrorBoundary>
//       <div ref={sectionRef}>
//         <div className="container-fluid faqt py-4">
//           <div className="container">
//             {error && (
//               <div className="alert alert-warning text-center mb-4">
//                 <small><i className="fas fa-exclamation-triangle me-2"></i>{error}</small>
//               </div>
//             )}
            
//             <div className="row g-4 align-items-center">
//               <div className="col-lg-7">
//                 <div className="row g-4">
//                   {loading ? (
//                     // Loading skeleton
//                     Array.from({ length: 3 }).map((_, index) => (
//                       <div key={index} className="col-sm-4 wow bounceInUp" data-wow-delay={`${0.3 + index * 0.2}s`}>
//                         <div className="faqt-item bg-primary rounded p-4 text-center">
//                           <div className="fa-4x mb-4 text-white">
//                             <div className="spinner-border text-white" role="status">
//                               <span className="visually-hidden">Loading...</span>
//                             </div>
//                           </div>
//                           <h1 className="display-4 fw-bold text-white">---</h1>
//                           <p className="text-dark text-uppercase fw-bold mb-0">Loading...</p>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     staggeredCounters.map((counter, index) => (
//                       <AnimatedCounter
//                         key={index}
//                         icon={counter.icon}
//                         endValue={counter.value}
//                         label={counter.label}
//                         delay={counter.delay}
//                         shouldAnimate={counter.shouldAnimate}
//                         formatValue={formatNumber}
//                       />
//                     ))
//                   )}
//                 </div>
//               </div>
              
//               <div className="col-lg-5 wow bounceInUp" data-wow-delay="0.1s">
//                 <div className="video">
//                   <button 
//                     type="button" 
//                     className="btn btn-play" 
//                     data-bs-toggle="modal" 
//                     data-src="https://www.youtube.com/embed/DWRcNpR6Kdc" 
//                     data-bs-target="#videoModal"
//                   >
//                     <span></span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Video Modal */}
//         <div className="modal fade" id="videoModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
//           <div className="modal-dialog">
//             <div className="modal-content rounded-0">
//               <div className="modal-header">
//                 <h5 className="modal-title" id="exampleModalLabel">Youtube Video</h5>
//                 <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//               </div>
//               <div className="modal-body">
//                 <div className="ratio ratio-16x9">
//                   <iframe 
//                     className="embed-responsive-item" 
//                     src="" 
//                     id="video" 
//                     allowFullScreen 
//                     allowScriptAccess="always"
//                     allow="autoplay"
//                   ></iframe>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default Fact;