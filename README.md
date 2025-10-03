# 🚀 Swipe AI Interview Assistant

An AI-powered interview platform built with React, Redux, and Groq AI for conducting technical interviews with real-time evaluation and comprehensive candidate management.

## ✨ Key Features

### 🎯 **Smart Resume-Based Questions**
- **Resume Upload**: Drag & drop PDF/DOCX resume parsing
- **AI Question Generation**: Questions tailored to candidate's experience
- **Smart Data Extraction**: Automatically extracts Name, Email, Phone
- **Missing Info Collection**: Prompts for incomplete data before starting

### 📊 **Intelligent Interview Flow**
- **6 Personalized Questions**: AI generates based on resume content
- **Adaptive Difficulty**: Easy (20s) → Medium (60s) → Hard (120s)
- **Real-time AI Scoring**: Instant evaluation and feedback
- **Auto-submission**: Questions auto-submit when time expires

### 💾 **Complete Interview Management**
- **Interviewer Dashboard**: View all candidates with detailed analytics
- **Progress Tracking**: Real-time interview progress indicators
- **Persistent Storage**: All data saved locally across sessions
- **Welcome Back Modal**: Resume interrupted interviews

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: Redux Toolkit + Redux Persist
- **UI Components**: shadcn/ui + Tailwind CSS
- **AI Integration**: Groq SDK (Llama 3.1)
- **Resume Parsing**: pdf-parse + mammoth
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install**
```bash
git clone <your-repo-url>
cd swipe-internship
npm install
```

2. **Set up Groq API (Optional)**
```bash
# Copy environment file
cp .env.example .env

# Add your Groq API key to .env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:5173`

## 🔑 Getting Groq API Key (Free)

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Generate an API key
4. Add it to your `.env` file

**Note**: The app works with fallback questions if no API key is provided.

## 📱 How to Use

### For Candidates (Interviewee Tab)
1. **Upload Resume**: Drop your PDF/DOCX resume
2. **Complete Info**: Fill any missing contact details
3. **AI Question Generation**: Wait for personalized questions
4. **Take Interview**: Answer 6 tailored questions with timers
5. **Get Results**: Receive detailed AI feedback and scoring

### For Interviewers (Dashboard Tab)
1. **View Candidates**: See all candidates with scores and status
2. **Search & Sort**: Filter by name, email, score, or date
3. **Detailed Analysis**: Click "View" for complete interview breakdown
4. **Track Progress**: Monitor completion status and performance

## 🎨 Key Improvements Made

### ✅ **Fixed AI Integration Issues**
- Proper JSON parsing from AI responses
- Handles markdown formatting in AI outputs
- Robust error handling for API failures
- Resume-based question generation

### ✅ **Enhanced UI/UX**
- Responsive design for all screen sizes
- Better progress tracking and visual feedback
- Improved chat interface with message history
- Professional completion summary with analytics

### ✅ **Smart Interview Flow**
- Questions generated from resume content
- Proper timer management and auto-submission
- Real-time scoring and feedback
- Complete interview state persistence

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn UI components
│   ├── IntervieweeTab.tsx # Candidate interview flow
│   ├── InterviewerTab.tsx # Dashboard for interviewers
│   ├── ChatWindow.tsx   # Interview chat interface
│   ├── ResumeUpload.tsx # File upload component
│   ├── Timer.tsx        # Interview timer
│   └── WelcomeBackModal.tsx # Resume session modal
├── store/               # Redux store and slices
│   ├── candidatesSlice.ts # Candidate data management
│   └── interviewSlice.ts  # Interview state management
├── utils/               # Utility functions
│   ├── groqApi.ts       # AI integration with error handling
│   └── resumeParser.ts  # PDF/DOCX parsing
└── pages/               # Page components
    ├── HomePage.tsx     # Landing page
    └── InterviewPage.tsx # Main interview interface
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Features Implemented
- ✅ Resume-based AI question generation
- ✅ Real-time AI scoring and feedback
- ✅ Responsive interview interface
- ✅ Complete candidate management dashboard
- ✅ Persistent data storage
- ✅ Timer-based auto-submission
- ✅ Welcome back modal for interrupted sessions

## 🚀 Deployment

The app can be deployed to any static hosting service:
- **Vercel** (Recommended)



---

**Built with ❤️ for Swipe Internship Assignment**

*Features resume-based AI question generation, real-time scoring, and comprehensive interview management.*