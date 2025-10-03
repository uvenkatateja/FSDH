export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeFile?: File;
  score: number;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  completedAt?: string;
  questions: Question[];
  summary?: string;
}

export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  answer?: string;
  score?: number;
  feedback?: string;
  timeSpent?: number;
}

export interface InterviewState {
  currentCandidate: Candidate | null;
  currentQuestionIndex: number;
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
}