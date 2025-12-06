import React from 'react';
import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const { user, loginWithPopup, loginWithRedirect } = useAuth();

  if (user) return <Navigate to="/" />;

  const handleLogin = async () => {
      try {
          await loginWithPopup();
      } catch (e) {
          if (e.message === "Popup blocked") {
              console.warn("Popup blocked, switching to redirect...");
              loginWithRedirect();
          }
      }
  };

  return (
    <div className="login-container">
        <div className="glass-card animate-fade-in" style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💸</div>
            <h1 className="logo" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Split Clone</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Effortless expense splitting for groups and friends.
            </p>
            
            <button onClick={handleLogin} style={{ width: '100%', marginBottom: '1rem', fontSize: '1.1rem' }}>
                <span style={{ marginRight: '10px' }}>G</span> Sign in with Google
            </button>
            
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
               Having trouble? <span onClick={loginWithRedirect} style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--primary)' }}>Try Redirect Login</span>
            </div>
        </div>
    </div>
  );
};

export default Login;
