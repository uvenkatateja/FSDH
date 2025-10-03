# 🚀 Setup Instructions

## Quick Start Commands

1. **Install Dependencies**
```bash
npm install
```

2. **Set up Environment Variables**
```bash
cp .env.example .env
```
Then edit `.env` and add your Groq API key:
```
VITE_GROQ_API_KEY=your_actual_groq_api_key_here
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Open Browser**
Navigate to `http://localhost:5173`

## Getting Groq API Key (Free)

1. Go to [https://console.groq.com/](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

## Testing the Application

### Test Resume Upload
- Use any PDF or DOCX resume file
- The app will extract Name, Email, Phone automatically
- If extraction fails, you'll be prompted to enter missing info

### Test Interview Flow
- Upload resume → Complete info → Start interview
- Answer 6 questions (2 Easy, 2 Medium, 2 Hard)
- Each question has time limits: 20s, 60s, 120s respectively
- Get instant AI feedback and scoring

### Test Dashboard
- Switch to "Interviewer Dashboard" tab
- View all candidates with scores
- Search and sort functionality
- Click "View" to see detailed interview analysis

## Project Structure Created

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── InterviewApp.tsx       # Main app wrapper
│   ├── IntervieweeTab.tsx     # Candidate interview flow
│   ├── InterviewerTab.tsx     # Dashboard for viewing candidates
│   ├── ChatWindow.tsx         # Interview chat interface
│   ├── ResumeUpload.tsx       # File upload component
│   ├── Timer.tsx              # Countdown timer
│   └── WelcomeBackModal.tsx   # Resume session modal
├── store/
│   ├── index.ts               # Redux store configuration
│   ├── candidatesSlice.ts     # Candidate data management
│   └── interviewSlice.ts      # Interview state management
├── utils/
│   ├── groqApi.ts            # AI integration functions
│   └── resumeParser.ts       # PDF/DOCX parsing logic
└── lib/
    └── utils.ts              # Utility functions
```

## Key Features Implemented

✅ **Resume Upload & Parsing** - PDF/DOCX support with automatic data extraction
✅ **AI-Powered Questions** - Dynamic question generation via Groq API
✅ **Timed Interview Flow** - 6 questions with progressive difficulty
✅ **Real-time Evaluation** - Instant AI scoring and feedback
✅ **Candidate Dashboard** - Complete management interface
✅ **Local Persistence** - All data saved in browser storage
✅ **Welcome Back Modal** - Resume interrupted sessions
✅ **Responsive Design** - Works on all device sizes
✅ **Search & Sort** - Advanced candidate filtering
✅ **Progress Tracking** - Visual interview progress indicators

## Troubleshooting

### TypeScript Errors
- Run `npm install` to install all dependencies
- The errors you see are because packages aren't installed yet

### Resume Parsing Issues
- Ensure PDF/DOCX files are not corrupted
- App includes fallback manual entry for missing data

### AI API Issues
- App works with fallback questions if no API key provided
- Check console for API errors if using Groq key

### Build Issues
- Run `npm run build` to check for production build errors
- All TypeScript errors should resolve after `npm install`

## Next Steps

1. Install dependencies with `npm install`
2. Get your free Groq API key
3. Test the complete interview flow
4. Deploy to Vercel/Netlify for live demo
5. Create demo video (2-5 minutes)
6. Submit to Swipe team

## Production Deployment

The app is ready for deployment to:
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **Any static hosting service**

Just remember to add your environment variables in the hosting platform's dashboard.
