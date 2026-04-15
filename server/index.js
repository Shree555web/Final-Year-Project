const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

// --- 1. CORS CONFIGURATION ---
// Allows your React app (on port 3000) to talk to this Node server (on port 5000)
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

// --- 2. MYSQL DATABASE CONNECTION ---
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fyp'
});

db.connect((err) => {
    if (err) {
        console.error("❌ MySQL Connection Failed:", err);
        return;
    }
    console.log("✅ Connected to MySQL Database");
});

// --- 3. AUTHENTICATION ROUTE ---
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = ?";
    
    db.query(query, [username], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        
        if (result.length > 0) {
            const user = result[0];
            // Supports actual password or 'akhtar' as a master override
            if (password === user.password || password === 'akhtar') {
                res.json({ message: "Login successful", user: user });
            } else {
                res.status(401).json({ message: "Invalid password" });
            }
        } else {
            res.status(401).json({ message: "Username not found" });
        }
    });
});

// --- 4. USER STATUS SYNC (Crucial for Dashboard Progress Bar) ---
app.get('/api/user-status/:username', (req, res) => {
    const sql = "SELECT complexity_level, style, streak_count FROM users WHERE username = ?";
    db.query(sql, [req.params.username], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ message: "User not found" });
        res.json(result[0]);
    });
});

// --- 5. UNIFIED PROGRESS & LEVEL UPDATE ---
app.post('/api/save-progress', (req, res) => {
    const { user_id, username, subject_name, complexity_level, current_score } = req.body;

    // First: Update the main 'users' table so the Dashboard Badge & Bar changes
    const updateStyleSql = "UPDATE users SET complexity_level = ?, style = ? WHERE username = ?";
    
    db.query(updateStyleSql, [complexity_level, complexity_level, username], (err, result) => {
        if (err) {
            console.error("❌ Error updating user level:", err);
            return res.status(500).json({ error: "Failed to update user level" });
        }

        // Second: Save the specific quiz history into 'student_progress' table
        const saveProgressSql = `
            INSERT INTO student_progress (user_id, subject_name, complexity_level, current_score) 
            VALUES (?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE complexity_level = ?, current_score = ?
        `;

        db.query(
            saveProgressSql, 
            [user_id, subject_name, complexity_level, current_score, complexity_level, current_score], 
            (err2, result2) => {
                if (err2) {
                    console.error("❌ Error saving progress history:", err2);
                    return res.status(500).json({ error: "Failed to save history" });
                }
                
                res.json({ 
                    message: "Level and Progress updated successfully!", 
                    newLevel: complexity_level 
                });
            }
        );
    });
});

// --- 6. STREAK CALCULATION LOGIC ---
app.post('/api/update-streak', (req, res) => {
    const { username } = req.body;
    const today = new Date().toISOString().split('T')[0];

    db.query("SELECT last_login_date, streak_count FROM users WHERE username = ?", [username], (err, result) => {
        if (err || result.length === 0) return res.status(500).send(err);

        let { last_login_date, streak_count } = result[0];
        const lastLogin = last_login_date ? new Date(last_login_date).toISOString().split('T')[0] : null;

        // If they already logged in today, return current streak
        if (lastLogin === today) {
            return res.json({ streak_count });
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Increment if they logged in yesterday, otherwise reset to 1
        if (lastLogin === yesterdayStr) {
            streak_count += 1;
        } else {
            streak_count = 1;
        }

        db.query(
            "UPDATE users SET streak_count = ?, last_login_date = ? WHERE username = ?",
            [streak_count, today, username],
            () => res.json({ streak_count })
        );
    });
});

// --- 7. AI CHAT & QUIZ GENERATION (GROQ API) ---
app.post('/chat', async (req, res) => {
    const { message, subject, history, userStyle } = req.body;
    
    // Log the request to see if it's hitting the server
    console.log(`📩 Message received for ${subject}: ${message}`);

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: `You are an expert tutor for ${subject}. Level: ${userStyle}.` },
                // Filter history to ensure it's in the correct format for Groq
                ...history.filter(msg => msg.role !== 'system').map(msg => ({
                    role: msg.role === 'ai' ? 'assistant' : 'user',
                    content: msg.content
                })),
                { role: "user", content: message }
            ]
        }, {
            headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
            timeout: 25000 // 25 second timeout
        });

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error("❌ Groq API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "AI service is currently unavailable." });
    }
});

app.post('/generate-quiz', async (req, res) => {
    const { subject, level } = req.body;
    const prompt = `Generate a 10-question multiple choice quiz for ${subject}. Difficulty: ${level}. Return ONLY a JSON array: [{"q": "Question?", "options": ["A", "B", "C", "D"], "ans": 0}]`;

    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" } 
        }, {
            headers: { 
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const parsed = JSON.parse(response.data.choices[0].message.content);
        // Handle different JSON structures returned by AI
        const questions = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.quiz || []);
        res.json(questions);
    } catch (error) {
        console.error("Quiz Generation Error:", error.message);
        res.status(500).json({ error: "AI Quiz generation failed" });
    }
});

// --- 8. DAILY MOTIVATIONAL QUOTE ---
app.get('/daily-quote', async (req, res) => {
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: "Provide one short motivational quote for students. Max 15 words." }]
        }, {
            headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
        });
        res.json({ quote: response.data.choices[0].message.content });
    } catch (error) {
        res.json({ quote: "Success is the sum of small efforts, repeated day in and day out." });
    }
});

// --- SERVER START ---
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AI Server running on http://localhost:${PORT}`);
});
// Get all previous chats for a sidebar
app.get('/api/chat-history/:userId', (req, res) => {
    const sql = "SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY last_message_at DESC";
    db.query(sql, [req.params.userId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Create a new chat session entry
app.post('/api/new-chat', (req, res) => {
    const { user_id, subject_name, title } = req.body;
    
    // Check if any data is missing before running the query
    if (!user_id || !subject_name) {
        console.log("⚠️ Missing data:", { user_id, subject_name });
        return res.status(400).json({ error: "Missing user_id or subject_name" });
    }

    const sql = "INSERT INTO chat_sessions (user_id, subject_name, title) VALUES (?, ?, ?)";
    
    db.query(sql, [user_id, subject_name, title || 'New Chat'], (err, result) => {
        if (err) {
            console.error("❌ SQL INSERT ERROR:", err.message); // This will tell you why it's failing
            return res.status(500).json({ error: err.message });
        }
        console.log("✅ Chat Session Saved, ID:", result.insertId);
        res.json({ sessionId: result.insertId });
    });
});
// 1. Save a new chat session
// SAVE a new chat session to the database
app.post('/api/new-chat', (req, res) => {
    const { user_id, subject_name, title } = req.body;
    const sql = "INSERT INTO chat_sessions (user_id, subject_name, title) VALUES (?, ?, ?)";

    db.query(sql, [user_id, subject_name, title], (err, result) => {
        if (err) {
            console.error("❌ SQL Error:", err);
            return res.status(500).json({ error: "Failed to save session" });
        }
        res.json({ sessionId: result.insertId });
    });
});

// FETCH chat history for the sidebar
app.get('/api/chat-history/:userId', (req, res) => {
    const sql = "SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY last_message_at DESC";
    db.query(sql, [req.params.userId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});