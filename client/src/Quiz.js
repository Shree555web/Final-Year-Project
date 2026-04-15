import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faCheckCircle, faTimesCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Quiz = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.post('http://localhost:5000/generate-quiz', {
          subject: subjectId.replace(/-/g, ' '),
          // Use learning_style to match your database object
          level: user.learning_style || user.complexity_level || "Beginner"
        });
        setQuestions(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Quiz Error:", err);
        alert("Failed to reach AI. Returning to dashboard.");
        navigate('/dashboard');
      }
    };
    fetchQuiz();
  }, [subjectId, navigate]);

  const handleAnswer = (selectedIndex) => {
    let newScore = score;
    if (selectedIndex === questions[currentStep].ans) {
      newScore = score + 1;
      setScore(newScore);
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish(newScore);
    }
  };

  const handleFinish = async (finalScore) => {
    // Standardize the current level check
    let currentLevel = user.learning_style || user.complexity_level || 'Beginner';
    let newLevel = currentLevel;
    
    if (finalScore >= 8) {
        if (currentLevel === 'Beginner') newLevel = 'Intermediate';
        else if (currentLevel === 'Intermediate') newLevel = 'Advanced';
    }
    
    const payload = {
      user_id: user.id,
      username: user.username,
      subject_name: subjectId.replace(/-/g, ' ').toUpperCase(),
      current_score: finalScore,
      complexity_level: newLevel // Backend expects this key
    };

    try {
      await axios.post('http://localhost:5000/api/save-progress', payload);

      // 🔥 THE FIX: Update all possible keys so Dashboard logic doesn't miss it
      const updatedUser = { 
        ...user, 
        learning_style: newLevel, 
        complexity_level: newLevel, 
        style: newLevel 
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser); 
      setShowResult(true);
    } catch (err) {
      console.error("Save failed:", err);
      setShowResult(true); 
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="form-card" style={{ textAlign: 'center' }}>
          <FontAwesomeIcon icon={faBrain} spin size="3x" style={{ color: '#38bdf8', marginBottom: '20px' }} />
          <h2>AI is crafting your {subjectId.toUpperCase()} quiz...</h2>
          <p>Analyzing your level: <b>{user.learning_style || "Beginner"}</b></p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="form-card" style={{ maxWidth: '700px', width: '90%' }}>
        {!showResult ? (
          <>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
               <button onClick={() => navigate('/dashboard')} className="back-btn" style={{ padding: '5px 10px' }}>
                 <FontAwesomeIcon icon={faArrowLeft} /> Exit
               </button>
               <span className="style-tag">Question {currentStep + 1} of {questions.length}</span>
            </header>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '25px', color: '#fff', lineHeight: '1.4' }}>
              {questions[currentStep].q}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questions[currentStep].options.map((option, index) => (
                <button
                  key={index}
                  className="register-button"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'left',
                    padding: '15px 20px'
                  }}
                  onClick={() => handleAnswer(index)}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            {score >= 8 ? (
              <>
                <FontAwesomeIcon icon={faCheckCircle} size="4x" style={{ color: '#10b981', marginBottom: '20px' }} />
                <h2 style={{ color: '#10b981' }}>Level Up!</h2>
                <p>Impressive! Your score: <b>{score}/{questions.length}</b></p>
                <p>Status: <b>{user.learning_style}</b></p>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faTimesCircle} size="4x" style={{ color: '#ef4444', marginBottom: '20px' }} />
                <h2>Quiz Completed</h2>
                <p>Your score: <b>{score}/{questions.length}</b></p>
                <p>Keep studying to reach the next level!</p>
              </>
            )}
            <button className="register-button" style={{ marginTop: '30px' }} onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;