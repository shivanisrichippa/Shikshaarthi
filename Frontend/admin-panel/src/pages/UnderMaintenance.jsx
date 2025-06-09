// src/components/UnderMaintenancePage.jsx
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import assets from '../assets/assets.js';
import { Link } from 'react-router-dom'; 


const UnderMaintenance = () => {

  
  useEffect(() => {
    // Example: If theme's main.js or menu.js needs to run for specific UI elements on this page
    // This is a simplified approach. In a real app, you'd look for React-idiomatic ways.
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    // Scripts from the original HTML's end of body
    // Note: jQuery and Popper might not be needed with Bootstrap 5's own JS bundle,
    // and React-Bootstrap components handle their own logic.
    // This is a direct translation; evaluate if these are truly needed for *this specific page*
    // and if there are React-friendly alternatives.
    const loadThemeScripts = async () => {
      try {
        // await loadScript('/assets/vendor/libs/jquery/jquery.js'); // Consider if needed
        // await loadScript('/assets/vendor/libs/popper/popper.js'); // Consider if needed
        // await loadScript('/assets/vendor/js/bootstrap.js');     // Consider if needed, React-Bootstrap is preferred
        // await loadScript('/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js');
        // await loadScript('/assets/vendor/js/menu.js');          // Theme specific menu logic
        // await loadScript('/assets/js/main.js');             // Theme specific main logic
        // await loadScript('https://buttons.github.io/buttons.js');
        console.log('Theme utility scripts loaded (simulated for maintenance page)');
      } catch (error) {
        console.error('Failed to load theme scripts:', error);
      }
    };

    // loadThemeScripts(); // Uncomment if you confirm these scripts are essential for this page's visuals
                          // and don't conflict.

    // Cleanup function for scripts if they were added
    return () => {
      // Example: document.querySelector(`script[src="/assets/js/main.js"]`)?.remove();
    };
  }, []);


  useEffect(() => {
    document.documentElement.lang = 'en';
    document.documentElement.classList.add('light-style');
    document.documentElement.dir = 'ltr';
   
    document.body.classList.add('misc-admin-page'); // Example if page-misc.css needs it

    return () => {
      document.documentElement.classList.remove('light-style');
      document.documentElement.dir = '';
      document.body.classList.remove('misc-admin-page');
    };
  }, []);


  return (
    <>
    
      {/* Content */}
      <div className="container-xxl container-p-y">
        <div className="misc-wrapper">
          <h2 className="mb-2 mx-2">Under Maintenance!</h2>
          <p className="mb-4 mx-2">Sorry for the inconvenience but we're performing some maintenance at the moment</p>
         
          <Link to="/" className="btn btn-primary">Back to home</Link>
          <div className="mt-4">
            <img
              src={assets.girlDoingYogaLightPng}
              alt="girl-doing-yoga-light"
              width="500"
              className="img-fluid"
              data-app-dark-img={assets.girlDoingYogaLightPng}// Keep data attributes
              data-app-light-img={assets.girlDoingYogaLightPng}
            />
          </div>
        </div>
      </div>
     

      
    </>
  );
};

export default UnderMaintenance;