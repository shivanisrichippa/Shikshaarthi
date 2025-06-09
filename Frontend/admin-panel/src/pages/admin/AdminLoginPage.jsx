// src/pages/admin/AdminLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get location object

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // MOCK:
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (email === 'shivanisrichippa@gmail.com' && password === '123456789') {
        const data = { token: 'fake-admin-jwt-token', user: { role: 'admin', fullName: 'Admin User' } };

        if (data.token) { // Assuming successful login means a token is returned
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user)); // Store user info

          // Redirect to the page the user was trying to access, or dashboard
          const from = location.state?.from?.pathname || "/dashboard";
          navigate(from, { replace: true });
        } else {
          setError('Invalid credentials or not an admin account.');
        }
      } else {
        setError('Invalid admin credentials.');
      }
    } catch (err) {
      setError('Login failed. Please try again. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the AdminLoginPage component (styling, form) remains the same ...
  // Ensure your AppBrand component is correctly imported or replicated if used here
  // For simplicity, I'll keep the text brand:
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f5f5f9' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.15)' }}>
        <div className="app-brand justify-content-center mb-4">
          <a href="/" className="app-brand-link gap-2" onClick={(e) => e.preventDefault()}> {/* Prevent default if it's just for branding */}
            {/* <AppBrandLogo />  You could make the SVG a component */}
            <span className="app-brand-text demo text-body fw-bolder">Shiksharthi Admin</span>
          </a>
        </div>
        <h4 className="mb-2 text-center">Admin Portal</h4>
        <p className="mb-4 text-center">Please sign-in to your account</p>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="mb-3 form-password-toggle">
            <div className="d-flex justify-content-between">
              <label className="form-label" htmlFor="password">Password</label>
            </div>
            <div className="input-group input-group-merge">
              <input
                type="password"
                id="password"
                className="form-control"
                name="password"
                placeholder="············"
                aria-describedby="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <button className="btn btn-primary d-grid w-100" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;