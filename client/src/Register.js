import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faBrain } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/register', formData);
      alert("Registration Successful!");
      navigate('/'); // Redirect to login page
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || "Failed" });
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
          <h2>Create Account</h2>
          {status && <div className={`status-message ${status.type}`}>{status.message}</div>}
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input type="text" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} required />
            </div>
            <div className="input-group">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div className="input-group">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>
            <button type="submit" className="register-button">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;