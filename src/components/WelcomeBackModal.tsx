import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { resumeInterview, endInterview, setWelcomeBack, computeRemainingTime } from '../store/interviewSlice';
import { updateCandidate } from '../store/candidatesSlice';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, Play, X, Clock } from 'lucide-react';

interface WelcomeBackModalProps {
  onResume: () => void;
}

const WelcomeBackModal = ({ onResume }: WelcomeBackModalProps) => {
  const dispatch = useDispatch();
  const interview = useSelector((state: RootState) => state.currentInterview);
  const candidates = useSelector((state: RootState) => state.candidates.candidates);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  const currentCandidate = candidates.find(c => c.id === interview.candidateId);
  const currentQuestion = interview.questions[interview.currentIndex];
  const answeredCount = interview.questions.filter(q => q.submittedAt).length;

  // Calculate remaining time for current question
  useEffect(() => {
    if (!currentCandidate || !currentQuestion) {
      dispatch(setWelcomeBack(false));
      return;
    }

    if (currentQuestion.startedAt && !currentQuestion.submittedAt) {
      const remaining = computeRemainingTime(currentQuestion.startedAt, currentQuestion.timeLimitSec);
      setTimeRemaining(remaining);
      
      // Update every second
      const interval = setInterval(() => {
        const newRemaining = computeRemainingTime(currentQuestion.startedAt!, currentQuestion.timeLimitSec);
        setTimeRemaining(newRemaining);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [currentCandidate, currentQuestion, dispatch]);

  const handleResume = () => {
    dispatch(resumeInterview());
    dispatch(setWelcomeBack(false));
    onResume();
  };

  const handleEndSession = () => {
    if (currentCandidate) {
      // Mark as completed (discarded)
      dispatch(updateCandidate({
        id: currentCandidate.id,
        updates: {
          status: 'completed',
          summary: 'Interview session ended by candidate.'
        }
      }));
    }
    dispatch(endInterview());
    dispatch(setWelcomeBack(false));
  };

  if (!currentCandidate) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white dark:bg-gray-900 animate-fade-in-up">
        <CardHeader className="text-center pb-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse opacity-20"></div>
              <AlertCircle className="h-16 w-16 text-blue-500 relative z-10" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome Back!
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Ready to continue your interview?
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="text-center space-y-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-xl shadow-lg">
              <p className="text-sm font-medium opacity-90 mb-1">
                {interview.status === 'paused' ? 'Paused interview for:' : 'Unfinished interview for:'}
              </p>
              <p className="font-bold text-xl">{currentCandidate.name}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{interview.currentIndex + 1}</p>
                <p className="text-xs text-gray-500">Current Q</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{answeredCount}</p>
                <p className="text-xs text-gray-500">Answered</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-600">{6 - answeredCount}</p>
                <p className="text-xs text-gray-500">Remaining</p>
              </div>
            </div>
            
            {currentQuestion && !currentQuestion.submittedAt && timeRemaining !== null && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-3 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {timeRemaining > 0 
                      ? `${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')} remaining on current question`
                      : 'Time expired on current question'}
                  </span>
                </div>
              </div>
            )}
            
            {currentQuestion?.answerText && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-3 rounded-lg text-left">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">Your draft answer:</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 line-clamp-2">{currentQuestion.answerText}</p>
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 p-4 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                Your progress has been automatically saved. You can continue where you left off 
                or start fresh with a new interview.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleResume} 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Play className="mr-2 h-5 w-5" />
              Continue Interview
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleEndSession}
              className="w-full h-12 border-2 border-red-300 hover:border-red-400 text-red-700 dark:text-red-300 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            >
              <X className="mr-2 h-5 w-5" />
              End Session (Discard)
            </Button>
          </div>
          
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              💡 <strong>Tip:</strong> Your progress is automatically saved. You can resume anytime.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeBackModal;
