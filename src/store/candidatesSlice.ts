import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position?: string; // Job position applied for
  resumeMeta: {
    filename: string;
    size: number;
  };
  resumeText: string;
  createdAt: string;
  timestamp?: string; // Alternative timestamp field for backward compatibility
  finalScore: number | null; // 0-100, null if not finished
  score?: number; // Individual score field for compatibility
  summary: string; // empty string if not finished
  status: 'pending' | 'in-progress' | 'completed';
  lastUpdated: string;
  questions?: InterviewQuestion[]; // Interview questions and answers
}

// Import InterviewQuestion interface for questions property
interface InterviewQuestion {
  id: string;
  qId?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  expected_points?: string[];
  timeLimit?: number;
  timeLimitSec?: number;
  startedAt?: string | null;
  submittedAt?: string | null;
  answer?: string;
  answerText?: string;
  score: number;
  feedback?: string;
  confidence?: number;
  found_points?: string[];
  timeSpent?: number;
}

interface CandidatesState {
  candidates: Candidate[];
  searchTerm: string;
  sortBy: 'name' | 'score' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

const initialState: CandidatesState = {
  candidates: [],
  searchTerm: '',
  sortBy: 'score',
  sortOrder: 'desc',
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Omit<Candidate, 'createdAt' | 'lastUpdated'> & { id?: string }>) => {
      const now = new Date().toISOString();
      const { id, ...candidateData } = action.payload;
      const candidate: Candidate = {
        id: id || `uuid-${Date.now()}`,
        createdAt: now,
        lastUpdated: now,
        ...candidateData,
      };
      state.candidates.push(candidate);
    },
    updateCandidate: (state, action: PayloadAction<{
      id: string;
      updates: Partial<Candidate>;
    }>) => {
      const candidate = state.candidates.find(c => c.id === action.payload.id);
      if (candidate) {
        Object.assign(candidate, action.payload.updates);
        candidate.lastUpdated = new Date().toISOString();
      }
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'name' | 'score' | 'createdAt'>) => {
      state.sortBy = action.payload;
    },
    setSorting: (state, action: PayloadAction<{
      sortBy: 'name' | 'score' | 'createdAt';
      sortOrder: 'asc' | 'desc';
    }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    clearCandidates: (state) => {
      state.candidates = [];
    },
  },
});

export const { 
  addCandidate, 
  updateCandidate, 
  setSearchTerm, 
  setSortBy,
  setSorting,
  clearCandidates
} = candidatesSlice.actions;

export default candidatesSlice.reducer;