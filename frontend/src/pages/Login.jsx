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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="glass-card animate-fade-in" style={{ textAlign: 'center', width: '100%', maxWidth: '420px', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px rgba(0,255,165,0.3))' }}>💸</div>
            <h1 className="logo" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Split Clone</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                Effortless expense splitting for groups and friends.
            </p>
            
            <button onClick={handleLogin} style={{ width: '100%', marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 800 }}>G</span> Sign in with Google
            </button>
            
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
               Having trouble? <span onClick={loginWithRedirect} style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }}>Try Redirect Login</span>
            </div>
        </div>
    </div>
  );
};

export default Login;
