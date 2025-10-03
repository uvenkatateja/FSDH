import { useEffect, useState, useCallback } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { computeRemainingTime } from '../utils/groqApi';

interface TimerProps {
  question?: {
    startedAt: string | null;
    timeLimitSec: number;
    submittedAt: string | null;
  };
  isActive: boolean;
  isPaused: boolean;
  onTimeUp: () => void;
  onTick?: (remaining: number) => void;
  autoSubmit?: boolean;
}

const Timer = ({ question, isActive, isPaused, onTimeUp, onTick, autoSubmit = true }: TimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'warning' | 'critical'>('normal');

  // Calculate remaining time from question data
  const calculateRemainingTime = useCallback(() => {
    if (!question?.startedAt || question.submittedAt) return 0;
    return computeRemainingTime(question.startedAt, question.timeLimitSec);
  }, [question]);

  useEffect(() => {
    if (!isActive || isPaused || !question?.startedAt || question.submittedAt) {
      setTimeRemaining(0);
      return;
    }

    // Update time immediately
    const remaining = calculateRemainingTime();
    setTimeRemaining(remaining);

    const interval = setInterval(() => {
      const newRemaining = calculateRemainingTime();
      setTimeRemaining(newRemaining);
      
      if (onTick) {
        onTick(newRemaining);
      }
      
      if (newRemaining <= 0 && autoSubmit) {
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, question, onTimeUp, onTick, autoSubmit, calculateRemainingTime]);

  useEffect(() => {
    if (timeRemaining <= 10) {
      setUrgencyLevel('critical');
    } else if (timeRemaining <= 30) {
      setUrgencyLevel('warning');
    } else {
      setUrgencyLevel('normal');
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    switch (urgencyLevel) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-900 bg-gray-50 border-gray-200 dark:text-white dark:bg-gray-800 dark:border-gray-600';
    }
  };

  const getProgressColor = () => {
    switch (urgencyLevel) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-gray-900 dark:bg-white';
    }
  };

  if (!isActive) return null;

  return (
    <div className="space-y-2 min-w-0">
      <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border ${getTimerColor()}`}>
        {urgencyLevel === 'critical' ? (
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse flex-shrink-0" />
        ) : (
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        )}
        <span className="font-mono font-bold text-sm sm:text-lg whitespace-nowrap">
          {formatTime(timeRemaining)}
        </span>
        <span className="text-xs sm:text-sm opacity-75 hidden sm:inline">remaining</span>
      </div>
      
      {/* Progress bar - Responsive */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
        <div 
          className={`h-1.5 sm:h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ 
            width: `${Math.max(0, (timeRemaining / (question?.timeLimitSec || 300)) * 100)}%` 
          }}
        />
      </div>
    </div>
  );
};

// Auto-submit timer hook for use in components
export const useAutoSubmitTimer = (
  question: { startedAt: string | null; timeLimitSec: number; submittedAt: string | null } | null,
  onAutoSubmit: () => void,
  isActive: boolean = true
) => {
  useEffect(() => {
    if (!isActive || !question?.startedAt || question.submittedAt) return;

    const checkTime = () => {
      const remaining = computeRemainingTime(question.startedAt!, question.timeLimitSec);
      if (remaining <= 0) {
        onAutoSubmit();
      }
    };

    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [question, onAutoSubmit, isActive]);
};

// Timer utility functions
export const getTimeLimitForDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  switch (difficulty) {
    case 'easy': return 300; // 5 minutes
    case 'medium': return 600; // 10 minutes
    case 'hard': return 900; // 15 minutes
    default: return 300;
  }
};

export const formatTimeDisplay = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default Timer;
