InterviewAI/
├── frontend/                     # React Web Application
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   ├── src/
│   │   ├── api/                  # API client and endpoints
│   │   │   ├── client.js         # Axios instance with auth interceptor
│   │   │   ├── auth.js           # Auth API calls
│   │   │   ├── interview.js      # Interview API calls
│   │   │   └── resume.js         # Resume API calls
│   │   │
│   │   ├── components/           # Reusable UI components
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   │
│   │   │   ├── interview/
│   │   │   │   ├── QuestionBubble.jsx
│   │   │   │   ├── AnswerInput.jsx
│   │   │   │   ├── FeedbackCard.jsx
│   │   │   │   └── VoiceControls.jsx     # Web Speech API controls
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── ScoreChart.jsx        # Recharts line chart
│   │   │   │   ├── SkillsRadar.jsx       # Recharts radar chart
│   │   │   │   └── StatsCard.jsx
│   │   │   │
│   │   │   └── resume/
│   │   │       ├── ResumeTextInput.jsx
│   │   │       ├── JobDescriptionInput.jsx
│   │   │       └── AtsScoreDisplay.jsx
│   │   │
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useAuth.js        # Auth state management
│   │   │   ├── useSpeechRecognition.js   # Web Speech API hook
│   │   │   ├── useSpeechSynthesis.js     # Web Speech API hook
│   │   │   └── useInterviewSession.js    # Interview state logic
│   │   │
│   │   ├── pages/                # Page-level components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Interview.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ResumeCheck.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── services/             # Client-side services
│   │   │   ├── speechToText.js   # Whisper API integration (future)
│   │   │   └── textToSpeech.js   # Voice output service
│   │   │
│   │   ├── store/                # State management (Zustand/Redux)
│   │   │   ├── useAuthStore.js
│   │   │   └── useInterviewStore.js
│   │   │
│   │   ├── styles/               # Global styles
│   │   │   ├── globals.css       # Tailwind CSS
│   │   │   └── theme.js          # Material UI theme
│   │   │
│   │   ├── utils/                # Helper functions
│   │   │   ├── constants.js      # Role definitions, question types
│   │   │   ├── validators.js     # Input validation
│   │   │   └── formatters.js     # Date, score formatters
│   │   │
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── Routes.jsx            # Route definitions
│   │
│   ├── .env                      # Frontend environment variables
│   ├── .gitignore
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                      # Node.js + Express API
│   ├── config/                   # Configuration files
│   │   ├── db.js                 # MongoDB connection
│   │   ├── openai.js             # OpenAI client instance
│   │   ├── huggingface.js        # Hugging Face client (future)
│   │   └── env.config.js         # Environment validation
│   │
│   ├── controllers/              # Route controllers
│   │   ├── authController.js
│   │   ├── interviewController.js
│   │   ├── resumeController.js
│   │   └── analyticsController.js
│   │
│   ├── middleware/               # Custom middleware
│   │   ├── auth.js               # JWT verification
│   │   ├── errorHandler.js       # Global error handler
│   │   └── requestLogger.js      # Morgan logger config
│   │
│   ├── models/                   # MongoDB schemas
│   │   ├── User.js
│   │   ├── InterviewSession.js
│   │   └── ResumeAnalysis.js
│   │
│   ├── routes/                   # API routes
│   │   ├── auth.js
│   │   ├── interview.js
│   │   ├── resume.js
│   │   └── analytics.js
│   │
│   ├── services/                 # Business logic & AI integrations
│   │   ├── openaiService.js      # GPT-4 for Q&A, feedback, resume
│   │   ├── huggingfaceService.js # Sentiment analysis (future)
│   │   └── scoringService.js     # Custom ML pipeline (future)
│   │
│   ├── ml/                       # Custom ML pipeline (future)
│   │   ├── models/               # Trained model files
│   │   ├── pipelines/            # Feature engineering scripts
│   │   └── notebooks/            # Jupyter notebooks for experiments
│   │
│   ├── utils/                    # Backend utilities
│   │   ├── logger.js             # Winston logger
│   │   ├── validators.js         # Request validation
│   │   └── calculator.js         # Score calculations
│   │
│   ├── uploads/                  # Temp file storage
│   │   └── .gitkeep
│   │
│   ├── .env                      # Backend environment variables
│   ├── .gitignore
│   ├── package.json
│   ├── server.js                 # Express app entry point
│   └── ecosystem.config.js       # PM2 production config
│
├── shared/                       # Shared between frontend & backend
│   ├── constants/
│   │   ├── roles.js              # Role definitions
│   │   └── questionBank.js       # Sample questions
│   └── types/                    # TypeScript interfaces (if using TS)
│       └── interview.d.ts
│
├── docs/                         # Documentation
│   ├── API.md                    # API endpoints documentation
│   ├── deployment.md             # Deployment guide
│   └── architecture.md           # System architecture
│
├── scripts/                      # Deployment & utility scripts
│   ├── deploy.sh                 # Production deployment script
│   └── seed.js                   # Seed database with sample data
│
├── .gitignore                    # Root gitignore
├── docker-compose.yml            # MongoDB + backend containers (optional)
└── README.md


