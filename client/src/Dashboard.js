import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFire, 
  faCalendarCheck, 
  faChartLine, 
  faQuoteLeft, 
  faSignOutAlt,
  faFileAlt, 
  faPoll, 
  faBook, 
  faExternalLinkAlt 
} from '@fortawesome/free-solid-svg-icons';

// 1. Study Content Data (Keep this outside the component for better performance)
const STUDY_CONTENT = {
  "software-testing-(ste)": [
    {
      chapter: "Chapter 1: Basics of Testing",
      topics: ["Definition of Testing", "V-Model", "STLC Lifecycle"]
    },
    {
      chapter: "Chapter 2: Types of Testing",
      topics: ["White Box vs Black Box", "Unit Testing", "Integration Testing"]
    }
  ],
  "emerging-trends-(eti)": [
    {
      chapter: "Chapter 1: Artificial Intelligence",
      topics: ["Machine Learning Basics", "Neural Networks", "NLP Concepts"]
    }
  ]
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 2. Digital Clock Logic
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Auth & Real-Time Database Sync
  useEffect(() => {
    const fetchFreshUserData = async () => {
      const loggedInUser = JSON.parse(localStorage.getItem('user'));
      
      if (!loggedInUser) {
        navigate('/');
        return;
      }

      try {
        const statusRes = await axios.get(`http://localhost:5000/api/user-status/${loggedInUser.username}`);
        const streakRes = await axios.post(`http://localhost:5000/api/update-streak`, { 
          username: loggedInUser.username 
        });
        
        const updatedUser = { 
          ...loggedInUser, 
          ...statusRes.data, 
          streak_count: streakRes.data.streak_count 
        };
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error("Sync failed, using local storage backup:", err);
        setUser(loggedInUser);
      }
    };

    fetchFreshUserData();
    window.addEventListener('focus', fetchFreshUserData);
    return () => window.removeEventListener('focus', fetchFreshUserData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getProgressWidth = () => {
    if (!user) return "30%";
    const currentLevel = (user.learning_style || user.complexity_level || user.style || "").toLowerCase();
    if (currentLevel === "intermediate") return "70%";
    if (currentLevel === "advanced") return "100%";
    return "35%"; 
  };

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const subjects = [
    { name: "EMERGING TRENDS (ETI)", desc: "AI, IoT, Cloud Computing, and Blockchain.", icon: "🚀", color: "#3b82f6" },
    { name: "SOFTWARE TESTING (STE)", desc: "Verification, Validation, and QA Testing.", icon: "🛡️", color: "#a855f7" },
    { name: "CLIENT SIDE SCRIPTING (CSS)", desc: "JS, DOM, and interactive web development.", icon: "📜", color: "#10b981" },
    { name: "MOBILE APP DEVELOPMENT (MAD)", desc: "Android and mobile UI/UX design.", icon: "📱", color: "#ef4444" }
  ];

  if (!user) return null;

  return (
    <div className="dashboard-wrapper">
      <header className="dash-header">
        <div className="logo-brand">
          <span className="logo-white">Adaptive</span><span className="logo-blue">Learn</span>
        </div>

        <div className="digital-counter">
          <div className="counter-time">{timeString}</div>
          <div className="counter-date">{dateString}</div>
        </div>
        
        <div className="header-right">
          <div className="user-info-group">
            <div className="avatar-circle">{user.username?.charAt(0).toUpperCase()}</div>
            <div className="user-meta">
              <span className="user-name">{user.username}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="welcome-banner">
          <h1>Academic Dashboard</h1>
          <p>Select a module. Current Level: 
            <span className="style-tag" style={{ textTransform: 'uppercase', marginLeft: '10px' }}>
              {user.learning_style || user.complexity_level || user.style || "Beginner"}
            </span>
          </p>
        </div>

        <div className="dashboard-grid">
          <div className="subject-section">
            <div className="subject-cards">
              {subjects.map((sub, index) => (
                <div key={index} className="sub-card">
                  <div className="sub-icon-bg" style={{ backgroundColor: `${sub.color}20` }}>
                    <span className="emoji-icon">{sub.icon}</span>
                  </div>
                  <h4>{sub.name}</h4>
                  <p className="sub-desc">{sub.desc}</p>
                  
                  {/* 1. Enter Lab Button */}
                  <button 
                    className="study-btn" 
                    style={{ backgroundColor: sub.color }}
                    onClick={() => navigate(`/lab/${sub.name.toLowerCase().replace(/ /g, '-')}`)}
                  >
                    Enter Lab
                  </button>

                  {/* 2. Adaptive Quiz Button */}
                  <button 
                    className="study-btn" 
                    style={{ backgroundColor: '#10b981', marginTop: '10px' }}
                    onClick={() => navigate(`/quiz/${sub.name.toLowerCase().replace(/ /g, '-')}`)}
                  >
                    Take Adaptive Quiz
                  </button>

                  {/* 3. Study Material Button (Corrected Placement) */}
                  <button 
                    className="study-btn" 
                    style={{ backgroundColor: '#f39c12', marginTop: '10px' }}
                    onClick={() => navigate(`/study/${sub.name.toLowerCase().replace(/ /g, '-')}`)}
                  >
                    Study Material
                  </button>
                </div>
              ))}
            </div>

            {/* --- MSBTE RESOURCES SECTION --- */}
            <section className="resources-section" style={{ marginTop: '40px' }}>
              <h2 style={{ color: 'white', marginBottom: '20px' }}>MSBTE Resources</h2>
              <div className="resources-grid">
                <a href="https://result.msbte.ac.in/" target="_blank" rel="noreferrer" className="resource-card">
                  <FontAwesomeIcon icon={faPoll} className="icon" />
                  <span>Check Results</span>
                </a>

                <a href="https://econtent.msbte.edu.in/curriculum_search/" target="_blank" rel="noreferrer" className="resource-card">
                  <FontAwesomeIcon icon={faBook} className="icon" />
                  <span>Syllabus Search</span>
                </a>

                <a href="https://econtent.msbte.edu.in/question_papers/" target="_blank" rel="noreferrer" className="resource-card">
                  <FontAwesomeIcon icon={faFileAlt} className="icon" />
                  <span>Question Papers</span>
                </a>

                <a href="https://msbte.ac.in/" target="_blank" rel="noreferrer" className="resource-card">
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="icon" />
                  <span>Official Portal</span>
                </a>
              </div>
            </section>
          </div>

          <div className="sidebar-section">
            <div className="stat-card">
              <h3>
                <FontAwesomeIcon 
                  icon={faFire} 
                  className="streak-icon" 
                  style={{ color: user.streak_count > 0 ? '#ff4500' : '#bdc3c7' }} 
                /> 
                Daily Streak
              </h3>
              <div className="streak-val">{user.streak_count || 0} Days</div>
              <p className="streak-msg">
                {user.streak_count > 0 ? `Keep it up, ${user.username}!` : "Start your streak today!"}
              </p>
            </div>

            <div className="planner-card">
              <h3><FontAwesomeIcon icon={faCalendarCheck} /> Study Planner</h3>
              <ul>
                <li>Next: CSS Quiz at 4 PM</li>
                <li>Pending: Mobile App Lab</li>
              </ul>
            </div>

            <div className="progress-card">
              <h3><FontAwesomeIcon icon={faChartLine} /> Overall Progress</h3>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: getProgressWidth(),
                    transition: 'width 1s ease-in-out' 
                  }}
                >
                  {getProgressWidth()}
                </div>
              </div>
            </div>

            <div className="motivation-card">
              <FontAwesomeIcon icon={faQuoteLeft} className="quote-icon-bg" />
              <p>"Success is the sum of small efforts, repeated day in and day out."</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER SECTION --- */}
      <footer className="dash-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Developed By</h4>
            <p>MULI Y.D (23212620124)</p>
            <p>NAKIL S.S (24212620153)</p>
            <p>ONTAKKE R.V (23212620122)</p>
            <p>ZAMPLE A.R (23212620111)</p>
          </div>

          <div className="footer-section">
            <h4>Project Guide</h4>
            <p>Prof. M. Mamanabad</p>
            <p>Department of Computer Engineering</p>
          </div>

          <div className="footer-section">
            <h4>Organization</h4>
            <p className="org-name">S. V. S. M. D's K.K.I. Polytechnic, Akkalkot.</p>
            <p>MSBTE Diploma Project 2026</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 AdaptiveLearn AI. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;