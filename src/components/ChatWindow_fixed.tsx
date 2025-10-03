import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Bot, User, Clock, CheckCircle, Send } from 'lucide-react';

interface Question {
  qId: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answerText: string;
  score: number | null;
  feedback: string;
  timeLimitSec: number;
  startedAt: string | null;
  submittedAt: string | null;
  expected_points: string[];
  confidence?: number;
  found_points?: string[];
}

interface ChatWindowProps {
  questions: Question[];
  currentQuestionIndex: number;
  currentAnswer: string;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isEvaluating?: boolean;
}

const ChatWindow = ({ 
  questions,
  currentQuestionIndex, 
  currentAnswer, 
  onAnswerChange, 
  onSubmit, 
  isLoading,
  isEvaluating = false
}: ChatWindowProps) => {
  const currentQuestion = questions[currentQuestionIndex];

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'default';
      case 'medium': return 'secondary';
      case 'hard': return 'destructive';
      default: return 'outline';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && currentAnswer.trim() && !isLoading) {
      onSubmit();
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Modern Chat Interface - AI Inspired */}
      <div className="xl:col-span-3 space-y-4">
        {/* Conversation Container */}
        <div className="relative flex flex-col h-[calc(100vh-280px)] min-h-[500px] bg-background border rounded-lg">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 sm:p-6">
            <div className="space-y-6 pb-4">
              {/* Previous Q&As */}
              {questions.slice(0, currentQuestionIndex).map((q, index) => (
                <div key={q.qId} className="space-y-4">
                  {/* Question */}
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 max-w-[90%]">
                      <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 sm:p-5">
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge variant={getDifficultyVariant(q.difficulty)}>
                            {q.difficulty.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Question {index + 1}</span>
                        </div>
                        <p className="text-sm sm:text-base leading-relaxed">{q.text}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Answer */}
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="flex-1 max-w-[90%] text-right">
                      <div className="bg-muted rounded-lg p-4 sm:p-5 inline-block text-left">
                        <p className="text-sm sm:text-base leading-relaxed">{q.answerText}</p>
                        {q.score !== null && q.score >= 0 && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className={`h-4 w-4 ${q.score >= 6 ? 'text-green-500' : q.score >= 4 ? 'text-yellow-500' : 'text-blue-500'}`} />
                              <span className={`text-xs font-medium ${q.score >= 6 ? 'text-green-600' : q.score >= 4 ? 'text-yellow-600' : 'text-blue-600'}`}>
                                Score: {q.score}/10
                              </span>
                              {q.score >= 8 && <span className="text-xs">🎉</span>}
                              {q.score >= 6 && q.score < 8 && <span className="text-xs">👍</span>}
                              {q.score >= 4 && q.score < 6 && <span className="text-xs">✅</span>}
                              {q.score < 4 && <span className="text-xs">💪</span>}
                            </div>
                            <p className="text-xs text-muted-foreground">{q.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Current Question */}
              {currentQuestion && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 max-w-[95%]">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge variant={getDifficultyVariant(currentQuestion.difficulty)}>
                          {currentQuestion.difficulty.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Question {currentQuestionIndex + 1}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{Math.floor(currentQuestion.timeLimitSec / 60)}:{(currentQuestion.timeLimitSec % 60).toString().padStart(2, '0')}</span>
                        </div>
                      </div>
                      <p className="text-base sm:text-lg leading-relaxed font-medium">{currentQuestion.text}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Evaluation Loading State */}
              {isEvaluating && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-blue-600 border-blue-300">
                          EVALUATING
                        </Badge>
                      </div>
                      <p className="text-sm text-blue-700">
                        🤖 Analyzing your answer and providing feedback...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Answer Input Area */}
          <div className="border-t p-4 sm:p-6">
            <Textarea
              placeholder="Type your detailed answer here... (Ctrl+Enter to submit)"
              value={currentAnswer}
              onChange={(e) => onAnswerChange(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[150px] sm:min-h-[180px] resize-none text-base"
              disabled={isLoading}
            />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{currentAnswer.length} characters</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-xs">Ctrl+Enter to submit</span>
              </div>
              
              <Button 
                onClick={onSubmit}
                disabled={isLoading || isEvaluating || !currentAnswer.trim()}
                className="px-6 w-full sm:w-auto"
                size="default"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEvaluating ? 'Evaluating...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Answer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Question Progress */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <h3 className="font-semibold mb-4 text-base">Interview Progress</h3>
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div 
                  key={question.qId} 
                  className={`flex items-center justify-between p-2 rounded-lg border ${
                    index === currentQuestionIndex 
                      ? 'bg-primary/10 border-primary/20' 
                      : index < currentQuestionIndex 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-muted/50 border-border'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      index === currentQuestionIndex 
                        ? 'bg-primary text-primary-foreground' 
                        : index < currentQuestionIndex 
                          ? 'bg-green-500 text-white' 
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {index < currentQuestionIndex ? '✓' : index + 1}
                    </div>
                    <Badge variant={getDifficultyVariant(question.difficulty)} className="text-xs">
                      {question.difficulty}
                    </Badge>
                  </div>
                  {index < currentQuestionIndex && (
                    <span className="text-xs font-medium text-green-600">
                      {question.score}/10
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardContent className="p-4 sm:p-5">
            <h3 className="font-semibold mb-3 text-base">💡 Interview Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Be specific and detailed in your answers</li>
              <li>• Use examples when possible</li>
              <li>• Press Ctrl+Enter to submit quickly</li>
              <li>• Watch the timer in the top right</li>
              <li>• Explain your thought process</li>
              <li>• Mention relevant technologies</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatWindow;
