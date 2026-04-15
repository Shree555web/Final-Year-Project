import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faBrain } from '@fortawesome/free-solid-svg-icons'; // Swapped faEnvelope for faUser
import { useNavigate, Link } from 'react-router-dom';

function Login({ onLoginSuccess }) {
  const navigate = useNavigate(); 
  
  // Updated to use Username instead of Email
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Sending 'username' to match your MySQL table logic
      const res = await axios.post('http://localhost:5000/login', { 
        username, 
        password 
      });
      
      localStorage.setItem('user', JSON.stringify(res.data.user)); 
      
      if (onLoginSuccess) onLoginSuccess(res.data.user);
      
      navigate('/dashboard'); 
    } catch (err) {
      // This will now show "Invalid password" or "Username not found" specifically
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="app-container">
      <div className="card-container">
        <div className="logo-section">
          <FontAwesomeIcon icon={faBrain} className="logo-icon" />
          <h1 className="logo-text">Adaptive AI</h1>
        </div>
        <div className="form-card">
          <h2>Welcome Back</h2>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              {/* Changed icon to User icon */}
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="register-button">Login</button>
            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
              <span style={{ color: '#94a3b8' }}>Don't have an account? </span>
              <Link to="/register" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '600' }}>
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;