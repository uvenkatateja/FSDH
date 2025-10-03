import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InterviewQuestion {
  qId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  expected_points: string[]; // Updated to match API response
  timeLimitSec: number;
  startedAt: string | null;
  submittedAt: string | null; // null if not yet submitted
  answerText: string;
  score: number | null; // 0-10, null if not evaluated yet
  feedback: string;
  confidence?: number;
  found_points?: string[]; // Points found in evaluation
}

interface CurrentInterviewState {
  sessionId: string | null;
  candidateId: string | null;
  questions: InterviewQuestion[];
  currentIndex: number; // 0-based
  status: 'in-progress' | 'paused' | 'finished';
  createdAt: string | null;
  updatedAt: string | null;
  showWelcomeBack: boolean;
}

const initialState: CurrentInterviewState = {
  sessionId: null,
  candidateId: null,
  questions: [],
  currentIndex: 0,
  status: 'finished',
  createdAt: null,
  updatedAt: null,
  showWelcomeBack: false,
};

const currentInterviewSlice = createSlice({
  name: 'currentInterview',
  initialState,
  reducers: {
    startInterview: (state, action: PayloadAction<{ candidateId: string; questions: InterviewQuestion[] }>) => {
      const now = new Date().toISOString();
      state.sessionId = `uuid-session-${Date.now()}`;
      state.candidateId = action.payload.candidateId;
      state.questions = action.payload.questions;
      state.currentIndex = 0;
      state.status = 'in-progress';
      state.createdAt = now;
      state.updatedAt = now;
      state.showWelcomeBack = false;
      
      // Start first question
      if (state.questions.length > 0 && state.questions[0]) {
        state.questions[0].startedAt = now;
      }
    },
    nextQuestion: (state) => {
      const now = new Date().toISOString();
      if (state.currentIndex < state.questions.length - 1) {
        state.currentIndex += 1;
        const currentQuestion = state.questions[state.currentIndex];
        if (currentQuestion) {
          currentQuestion.startedAt = now;
        }
        state.updatedAt = now;
      } else {
        state.status = 'finished';
        state.updatedAt = now;
      }
    },
    updateAnswer: (state, action: PayloadAction<{ questionIndex: number; answerText: string }>) => {
      const question = state.questions[action.payload.questionIndex];
      if (question) {
        question.answerText = action.payload.answerText;
        state.updatedAt = new Date().toISOString();
      }
    },
    submitAnswer: (state, action: PayloadAction<{ 
      questionIndex: number; 
      score: number; 
      feedback: string;
      found_points?: string[];
      confidence?: number;
    }>) => {
      const now = new Date().toISOString();
      const question = state.questions[action.payload.questionIndex];
      if (question) {
        question.submittedAt = now;
        question.score = action.payload.score;
        question.feedback = action.payload.feedback;
        question.found_points = action.payload.found_points;
        question.confidence = action.payload.confidence;
        state.updatedAt = now;
      }
    },
    pauseInterview: (state) => {
      state.status = 'paused';
      state.updatedAt = new Date().toISOString();
    },
    resumeInterview: (state) => {
      state.status = 'in-progress';
      state.showWelcomeBack = false;
      state.updatedAt = new Date().toISOString();
    },
    endInterview: (state) => {
      state.status = 'finished';
      state.updatedAt = new Date().toISOString();
    },
    resetInterview: () => {
      return initialState;
    },
    setWelcomeBack: (state, action: PayloadAction<boolean>) => {
      state.showWelcomeBack = action.payload;
    },
  },
});

export const { 
  startInterview, 
  nextQuestion, 
  updateAnswer,
  submitAnswer,
  pauseInterview, 
  resumeInterview, 
  endInterview,
  resetInterview,
  setWelcomeBack
} = currentInterviewSlice.actions;

// Utility function for computing remaining time (timestamp-based)
export const computeRemainingTime = (startedAtISO: string, timeLimitSec: number): number => {
  const started = new Date(startedAtISO).getTime();
  const now = Date.now();
  const elapsedSec = Math.max(0, Math.floor((now - started) / 1000));
  return Math.max(0, timeLimitSec - elapsedSec);
};

export default currentInterviewSlice.reducer;