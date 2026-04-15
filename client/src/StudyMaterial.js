import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faBookOpen, 
  faChevronRight, 
  faChevronDown, 
  faRobot, 
  faTimes, 
  faSync,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import Groq from "groq-sdk";

// Initialize Groq with your active key
const groq = new Groq({ 
  apiKey: "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", 
  dangerouslyAllowBrowser: true 
});

const STUDY_CONTENT = {
  "emerging-trends-(eti)": [
    { 
      chapter: "Unit - I: Introduction of AI and ML", 
      topics: [
        "1.1 Introduction of AI: Concept", "Scope of AI", "Types of AI", "Applications of AI",
        "1.2 Machine Learning: Concept", "Types: Supervised, Unsupervised, Reinforcement", "Applications of Machine Learning", "Concept of Deep Learning", "Difference between AI, ML and DL",
        "1.3 Generative AI: Concept", "Self-attention mechanism", "Encoder Decoder Structure", "Types of Generative AI: Text, Image, Music, Video",
        "1.4 AI & ML in Digital security", "AI Powered cyber attacks", "Protection measures: MFA, Strong Passwords"
      ] 
    },
    { 
      chapter: "Unit - II: Internet of Things (IoT)", 
      topics: [
        "2.1 Introduction of IoT: Definition and Characteristics", "Features and Applications of IoT", "Advantages and limitations",
        "2.2 Design of IoT: Physical and Logical design", "Architecture of IoT",
        "2.3 Sensors and actuators used in IoT",
        "2.4 5G Network in IoT communication", "Next Generation Network Architecture", "Media Gateway and Application Server",
        "2.5 IoT and Cloud Computing: Architecture"
      ] 
    },
    {
      chapter: "Unit - III: Blockchain Technology",
      topics: [
        "3.1 Basics of Blockchain: Decentralization, Transparency, Immutability", "Traditional vs Blockchain System",
        "3.2 Blockchain Architecture",
        "3.3 Types: Public, Private, Consortium, and Hybrid",
        "3.4 Applications: Finance, Healthcare, Supply chain, Gaming",
        "3.5 Smart Contracts & Cryptocurrencies", "3.6 Challenges in Blockchain"
      ]
    },
    {
      chapter: "Unit - IV: Immersive Tech & Sustainable Computing",
      topics: [
        "4.1 Introduction to Immersive Technology: AR, VR, MR, XR", "Haptic Technology",
        "4.2 Applications of Immersive Technology",
        "4.3 Green Computing: Importance and E-waste management",
        "4.4 Quantum Computing: Introduction and Applications"
      ]
    },
    {
      chapter: "Unit - V: Digital Forensics and Ethical Hacking",
      topics: [
        "5.1 Introduction to digital forensics",
        "5.2 Rules and Process of Investigation",
        "5.3 Models: DFRWS, ADFM, IDIP, EEDIP, UMDFPM",
        "5.4 Ethical Hacking: Definition and Types of hackers",
        "5.5 Types of Hacking: AI phishing, Ransomware 2.0, Deepfake Tech",
        "5.6 Cyber Laws: NCSP 2013, IT Act 2000-2023, CCPWC Scheme"
      ]
    }
  ],
  "software-testing-(ste)": [
    {
      chapter: "Unit - I: Software Testing and Testing Methods",
      topics: [
        "1.1 Software Testing: Objectives and SRS",
        "1.2 Terminology: Failure, Error, Fault, Defect, and Bug",
        "1.3 Test Case: Entry and Exit Criteria",
        "1.4 Methods: Static vs Dynamic Testing",
        "1.5 White Box Testing: Inspections, Walkthroughs, and Reviews",
        "Code Coverage and Complexity Testing",
        "1.6 Black Box Testing: Requirement Based Testing",
        "Boundary Value Analysis and Equivalence Partitioning"
      ]
    },
    {
      chapter: "Unit - II: Types and Levels of Testing",
      topics: [
        "2.1 Unit Testing: Drivers and Stubs",
        "2.2 Integration Testing: Top-Down, Bottom-Up, and Bi-Directional",
        "2.3 System Testing",
        "2.4 Acceptance Testing: Alpha and Beta Testing",
        "2.5 Special Testing: Performance, Load, and Stress Testing",
        "Regression, Security, and GUI Testing",
        "Database, Sanity, and Smoke Testing"
      ]
    },
    {
      chapter: "Unit - III: Test Management",
      topics: [
        "3.1 Test Life Cycle (STLC)",
        "3.2 Test Planning: Approach, Criteria, and Responsibilities",
        "Staffing, Resources, and Test Deliverables",
        "3.3 Test Infrastructure and People Management",
        "3.4 Test Process: Base Lining and Case Specification",
        "3.5 Test Reporting: Execution and Summary Reports"
      ]
    },
    {
      chapter: "Unit - IV: Defect Management",
      topics: [
        "4.1 Defect Classification and Management Process",
        "4.2 Defect Life Cycle and Defect Templates",
        "4.3 Estimating Impact and Techniques for Finding Defects",
        "Reporting a Defect"
      ]
    },
    {
      chapter: "Unit - V: Testing Tools and Measurements",
      topics: [
        "5.1 Manual vs Automation Testing: Pros and Cons",
        "5.2 Criteria and Steps for Tool Selection",
        "5.3 Selenium: Introduction and Components",
        "5.4 Selenium IDE: Features and Limitations",
        "5.5 Selenium WebDriver: Advantages and Disadvantages",
        "5.6 Metrics: Product Metrics and Process Metrics"
      ]
    }
  ],
  "client-side-scripting-(css)": [
    {
      chapter: "Unit - I: Fundamental of Client Side Scripting",
      topics: [
        "1.1 Introduction to Scripting: Web Architecture",
        "Role of Client and Server: Static vs Dynamic pages",
        "1.2 History: Inline scripting and JavaScript",
        "1.3 Introduction to AJAX: Architecture and Actions",
        "1.4 Basics of JSON: Objects and Scheme",
        "1.5 Webpage with Python: Django and Flask framework"
      ]
    },
    {
      chapter: "Unit - II: Angular Basics",
      topics: [
        "2.1 Introduction to AngularJS: Expressions and MVC",
        "Variables Scope and Applications",
        "2.2 AngularJS Forms: Fields, Select tags, and Buttons",
        "Form Validation in Angular",
        "2.3 AngularJS Data Binding: Two-way Binding and ng-model",
        "2.4 Filters: Built-In, Custom, and Chaining Filters",
        "2.5 AngularJS Events: Mouse and Click events"
      ]
    },
    {
      chapter: "Unit - III: Working with AngularJS",
      topics: [
        "3.1 AngularJS Tables: style, orderBy, and uppercase Filters",
        "Table Indexing using $even and $odd",
        "3.2 AngularJS Controllers: Role and Modules",
        "Business Logic vs Presentation Logic",
        "3.3 Attaching Properties and Functions to $scope",
        "3.4 Nested Controllers and Filters in Controllers",
        "3.5 Using Controllers in External Files"
      ]
    },
    {
      chapter: "Unit - IV: Introduction of React Framework",
      topics: [
        "4.1 React Framework: Features, Architecture, and Forms",
        "4.2 Components: Functional vs Class components",
        "Passing and using Props",
        "4.3 Lifecycle: Mounting, Updating, and Unmounting",
        "4.4 React Hooks: useState, useEffect, and useContext"
      ]
    },
    {
      chapter: "Unit - V: Working with React Framework",
      topics: [
        "5.1 Event handling: Arrow functions vs Regular functions",
        "5.2 Working with Forms: Handling and Submitting",
        "Form Validation in React",
        "5.3 Lists and Keys: Using map() for rendering",
        "5.4 CSS: Styling Libraries and Frameworks",
        "Bootstrap and Material-UI integration"
      ]
    }
  ],
  "mobile-app-development-(mad)": [
    {
      chapter: "Unit - I: Basics of Android OS",
      topics: [
        "1.1 Introduction to Android Operating System",
        "1.2 Need and features of Android",
        "1.3 Android Architecture Framework",
        "1.4 Android IDEs: Android Studio, Eclipse, Visual Studio with Xamarin"
      ]
    },
    {
      chapter: "Unit - II: Introduction to Android Environment",
      topics: [
        "2.1 Use of Java JDK and introduction to Android SDK",
        "2.2 Android Tools: ADT, AVD, and Emulators",
        "2.3 Dalvik Virtual Machine (DVM) vs JVM",
        "2.4 Terminology: ART, OTA, FOTA, GPS, GCM",
        "2.5 Android Directory Structure"
      ]
    },
    {
      chapter: "Unit - III: Design UI in Android",
      topics: [
        "3.1 GUI Components: TextView, EditText, Buttons, Toggle, Checkbox",
        "RadioButtons, Progress bar, Custom Toast Messages",
        "3.2 Layout Types: Constraint, Linear, Frame, Relative Layouts",
        "3.3 View Types: ListView, GridView, ImageView, ScrollView",
        "3.4 Splash Screen: Basics and Styles"
      ]
    },
    {
      chapter: "Unit - IV: Android Components and Database Connectivity",
      topics: [
        "4.1 Major Components: Intent, Activity, Services, Broadcast Receiver",
        "4.2 Component Life Cycle: Activity, Services, Receiver",
        "4.3 Database: SQLite vs Firebase Connectivity",
        "Creating and extracting data from databases"
      ]
    },
    {
      chapter: "Unit - V: Android Application Deployment",
      topics: [
        "5.1 Advanced Concepts: Fragments, LBS, SMS, Camera, Bluetooth",
        "5.2 Security Concepts: Security Model and Permissions",
        "5.3 Application Deployment: Google Play Store publishing process"
      ]
    }
  ]
};

const StudyMaterial = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const chapters = STUDY_CONTENT[subjectId] || [];

  const [openChapters, setOpenChapters] = useState({});
  const [aiContent, setAiContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");

  const toggleChapter = (index) => {
    setOpenChapters(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const fetchAiMaterial = async (topic) => {
    setLoading(true);
    setSelectedTopic(topic);
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert MSBTE Diploma Professor writing a comprehensive textbook. 
            For the given topic, provide a deep-dive explanation including:
            1. **In-depth Definition & Theory**: Detailed background of the concept.
            2. **Technical Architecture/Working**: Explain how it works step-by-step.
            3. **Detailed Key Features/Components**: Use bullet points for clarity.
            4. **Real-world Examples/Use Cases**: Provide 2-3 practical scenarios.
            5. **Comparison/Logic**: If applicable, compare with related technologies.
            6. **Exam-Oriented Important Points**: Highlight what is frequently asked in MSBTE exams.
            
            Use professional formatting with bold headings and structured lists.`
          },
          {
            role: "user",
            content: `Provide a detailed masterclass on the topic: "${topic}" for the subject "${subjectId.replace(/-/g, ' ')}".`
          }
        ],
        model: "llama-3.3-70b-versatile",
      });
      setAiContent(chatCompletion.choices[0]?.message?.content || "No content found.");
    } catch (error) {
      setAiContent("AI connection failed. Ensure your Groq Key is valid.");
    } finally {
      setLoading(false);
    }
  };

  const isSubHeading = (text) => /^\d+\.\d+/.test(text);

  return (
    <div style={{ padding: '40px', backgroundColor: '#131314', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
      
      {/* Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: '#303134', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <h1 style={{ color: '#8ab4f8', margin: 0, fontSize: '1.5rem' }}>
          <FontAwesomeIcon icon={faBookOpen} style={{ marginRight: '15px' }} />
          {subjectId ? subjectId.replace(/-/g, ' ').toUpperCase() : "STUDY MATERIAL"}
        </h1>
      </div>

      <p style={{ textAlign: 'center', color: '#9aa0a6', marginBottom: '30px' }}>
        <FontAwesomeIcon icon={faLightbulb} style={{ color: '#f39c12' }} /> Tip: Tap a sub-topic to get AI-generated exam notes.
      </p>

      {/* Accordion Syllabus */}
      <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {chapters.map((ch, i) => (
          <div key={i} style={{ background: '#1e1f20', borderRadius: '12px', border: '1px solid #3c4043', overflow: 'hidden' }}>
            <div 
              onClick={() => toggleChapter(i)} 
              style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: openChapters[i] ? '#2d2f31' : 'transparent' }}
            >
              <h3 style={{ margin: 0, color: '#c2e7ff', fontSize: '1.1rem' }}>{ch.chapter}</h3>
              <FontAwesomeIcon icon={openChapters[i] ? faChevronDown : faChevronRight} style={{ color: '#8ab4f8' }} />
            </div>

            {openChapters[i] && (
              <div style={{ background: '#18191a', padding: '10px 20px 20px 20px', borderTop: '1px solid #3c4043' }}>
                {ch.topics.map((t, j) => (
                  <div 
                    key={j} 
                    onClick={() => fetchAiMaterial(t)}
                    style={{ 
                      padding: '12px', 
                      margin: '4px 0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: isSubHeading(t) ? '1rem' : '0.9rem',
                      fontWeight: isSubHeading(t) ? 'bold' : 'normal',
                      color: isSubHeading(t) ? '#8ab4f8' : '#e8eaed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2d2f31'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <FontAwesomeIcon icon={faRobot} style={{ color: isSubHeading(t) ? '#8ab4f8' : '#5f6368', fontSize: '0.8rem' }} />
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Modal */}
      {(loading || aiContent) && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#1e1f20', width: '100%', maxWidth: '750px', maxHeight: '85vh', borderRadius: '15px', padding: '30px', position: 'relative', border: '1px solid #3c4043', overflowY: 'auto' }}>
            
            <button onClick={() => {setAiContent(null); setLoading(false);}} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#9aa0a6', fontSize: '1.4rem', cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
               <FontAwesomeIcon icon={faRobot} style={{ color: '#8ab4f8', fontSize: '1.5rem' }} />
               <h2 style={{ color: '#8ab4f8', margin: 0, fontSize: '1.3rem' }}>{selectedTopic}</h2>
            </div>

            <hr style={{ border: '0.5px solid #3c4043', marginBottom: '20px' }} />

            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <FontAwesomeIcon icon={faSync} spin style={{ fontSize: '2.5rem', color: '#8ab4f8', marginBottom: '20px' }} />
                <p>Generating expert notes...</p>
              </div>
            ) : (
              <div style={{ whiteSpace: 'pre-line', lineHeight: '1.8', color: '#e8eaed', fontSize: '1rem' }}>
                {aiContent}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterial;