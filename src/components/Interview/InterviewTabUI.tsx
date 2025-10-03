import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { CheckCircle, Clock, User, FileText } from 'lucide-react';
import ResumeUpload from '../ResumeUpload';
import ChatWindow from '../ChatWindow_fixed';
import Timer from '../Timer';
import { ThemeToggle } from '../theme-toggle';

// Types for props
interface CandidateInfo {
  name: string;
  email: string;
  phone: string;
}

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

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeText: string;
  finalScore: number | null;
  status: string;
  summary: string;
}

// Upload Step UI Component
export const UploadStepUI: React.FC<{
  inProgressCandidate?: Candidate;
  isLoading: boolean;
  onResumeInterview: () => void;
  onStartNewInterview: () => void;
  onResumeProcessed: (data: any) => void;
  onMissingInfo: (missing: string[]) => void;
}> = ({
  inProgressCandidate,
  isLoading,
  onResumeInterview,
  onStartNewInterview,
  onResumeProcessed,
  onMissingInfo
}) => (
  <div className="max-w-4xl mx-auto space-y-6">
    {inProgressCandidate && (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Clock className="h-5 w-5" />
            Resume Previous Interview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 mb-4">
            You have an ongoing interview for <strong>{inProgressCandidate.name}</strong>.
            Would you like to continue where you left off?
          </p>
          <div className="flex gap-3">
            <Button
              onClick={onResumeInterview}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Resume Interview'}
            </Button>
            <Button
              variant="outline"
              onClick={onStartNewInterview}
            >
              Start New Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    )}

    <ResumeUpload
      onResumeProcessed={onResumeProcessed}
      onMissingInfo={onMissingInfo}
    />
  </div>
);

// Info Step UI Component
export const InfoStepUI: React.FC<{
  candidateInfo: CandidateInfo;
  missingFields: string[];
  isLoading: boolean;
  onCandidateInfoChange: (info: CandidateInfo) => void;
  onSubmit: () => void;
  onGoBack: () => void;
}> = ({
  candidateInfo,
  missingFields,
  isLoading,
  onCandidateInfoChange,
  onSubmit,
  onGoBack
}) => (
  <div className="max-w-md mx-auto">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Complete Your Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resume Quality Notice */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-yellow-600 mt-0.5">⚠️</div>
            <div className="text-sm">
              <p className="font-medium text-yellow-800 mb-1">Resume Information Missing</p>
              <p className="text-yellow-700">
                We couldn't extract your contact details from the uploaded resume. 
                Please fill in the information below or upload a clearer resume.
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={candidateInfo.name}
            onChange={(e) => onCandidateInfoChange({ ...candidateInfo, name: e.target.value })}
            placeholder="Enter your full name"
            className={missingFields.includes('name') ? 'border-red-500' : ''}
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={candidateInfo.email}
            onChange={(e) => onCandidateInfoChange({ ...candidateInfo, email: e.target.value })}
            placeholder="Enter your email"
            className={missingFields.includes('email') ? 'border-red-500' : ''}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={candidateInfo.phone}
            onChange={(e) => onCandidateInfoChange({ ...candidateInfo, phone: e.target.value })}
            placeholder="Enter your phone number"
            className={missingFields.includes('phone') ? 'border-red-500' : ''}
          />
        </div>

        {missingFields.length > 0 && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-sm text-red-700">
              Please fill in the required fields: {missingFields.join(', ')}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onGoBack}
            className="flex-1"
          >
            ← Upload Different Resume
          </Button>
          <Button 
            onClick={onSubmit} 
            className="flex-1" 
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Continue to Interview'}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Generating Step UI Component
export const GeneratingStepUI: React.FC = () => (
  <div className="max-w-2xl mx-auto">
    <Card>
      <CardContent className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold mb-2">Generating Your Interview Questions</h3>
        <p className="text-gray-600 mb-4">
          We're analyzing your resume and creating personalized technical questions...
        </p>
        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
          <p>This may take 10-30 seconds depending on your resume content.</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Ready Step UI Component
export const ReadyStepUI: React.FC<{
  candidate: Candidate;
  technologies: string[];
  experienceLevel: string;
  keyProjects: string[];
  personalizedMessage: string;
  onStartInterview: () => void;
  onGoBack: () => void;
}> = ({
  candidate,
  technologies,
  experienceLevel,
  keyProjects,
  personalizedMessage,
  onStartInterview,
  onGoBack
}) => (
  <div className="max-w-2xl mx-auto">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Ready to Start Interview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">Interview Setup Complete!</h3>
          <p className="text-green-700 text-sm">
            {personalizedMessage}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Candidate Profile</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Name:</strong> {candidate.name}</p>
              <p><strong>Email:</strong> {candidate.email}</p>
              <p><strong>Phone:</strong> {candidate.phone}</p>
              <p><strong>Experience:</strong> {experienceLevel}</p>
              {technologies.length > 0 && (
                <p><strong>Key Technologies:</strong> {technologies.slice(0, 4).join(', ')}{technologies.length > 4 ? ` +${technologies.length - 4} more` : ''}</p>
              )}
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">Interview Structure</h4>
            <div className="text-sm text-orange-700 space-y-1">
              <p>📝 6 Personalized Questions</p>
              <p>⏱️ Easy: 5min | Medium: 10min | Hard: 15min</p>
              <p>🎯 Tailored to your {experienceLevel.split(' ')[0]} level</p>
              <p>📊 AI-powered evaluation</p>
              {technologies.length > 0 && (
                <p>🔧 Focus: {technologies.slice(0, 2).join(' & ')} ecosystem</p>
              )}
            </div>
          </div>
        </div>

        {keyProjects.length > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">🚀 Key Projects Identified</h4>
            <div className="text-sm text-purple-700 space-y-1">
              {keyProjects.map((project, index) => (
                <p key={index}>• {project.length > 80 ? project.substring(0, 80) + '...' : project}</p>
              ))}
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h4>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>Each question has a time limit - answer will auto-submit when time expires</li>
            <li>You cannot go back to previous questions once submitted</li>
            <li>Take your time to read each question carefully</li>
            <li>Provide detailed explanations and examples when possible</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={onStartInterview} 
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            🚀 Start Interview
          </Button>
          <Button 
            onClick={onGoBack} 
            variant="outline" 
            size="lg"
          >
            ← Go Back
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Interview Step UI Component
export const InterviewStepUI: React.FC<{
  currentQuestion?: Question;
  progress: number;
  currentIndex: number;
  questions: Question[];
  currentAnswer: string;
  isActive: boolean;
  isLoading: boolean;
  isEvaluating: boolean;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  onTimeUp: () => void;
  onStopInterview: () => void;
}> = ({
  currentQuestion,
  progress,
  currentIndex,
  questions,
  currentAnswer,
  isActive,
  isLoading,
  isEvaluating,
  onAnswerChange,
  onSubmit,
  onTimeUp,
  onStopInterview
}) => (
  <div className="min-h-screen bg-background">
    {/* Header with Progress */}
    <div className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold">Interview in Progress</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Question {currentIndex + 1} of 6 • {currentQuestion?.difficulty?.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Timer
              question={questions[currentIndex]}
              isActive={isActive}
              isPaused={isLoading}
              onTimeUp={onTimeUp}
              autoSubmit={true}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={onStopInterview}
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-950"
            >
              Stop Interview
            </Button>
          </div>
        </div>
        
        {/* Progress Bar in Header */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>

    {/* Main Content - Full Width */}
    <div className="max-w-7xl mx-auto px-4 py-6">
      <ChatWindow
        questions={questions}
        currentQuestionIndex={currentIndex}
        currentAnswer={currentAnswer}
        onAnswerChange={onAnswerChange}
        onSubmit={onSubmit}
        isLoading={isLoading}
        isEvaluating={isEvaluating}
      />
    </div>
  </div>
);

// Completed Step UI Component
export const CompletedStepUI: React.FC<{
  candidate: Candidate;
  questions: Question[];
  finalScore: number;
  onStartNew: () => void;
}> = ({
  candidate,
  questions,
  finalScore,
  onStartNew
}) => (
  <div className="max-w-4xl mx-auto space-y-6">
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl">Interview Completed!</CardTitle>
        <p className="text-muted-foreground">Thank you for completing the AI-powered interview</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{finalScore}%</div>
                <div className="text-sm text-muted-foreground">Final Score</div>
                <div className="text-xs text-muted-foreground">Weighted Average</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{questions.filter(q => (q.score || 0) >= 6).length}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
                <div className="text-xs text-muted-foreground">out of 6</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">6</div>
                <div className="text-sm text-muted-foreground">Questions</div>
                <div className="text-xs text-muted-foreground">completed</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              AI Assessment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {candidate.summary}
            </p>
          </CardContent>
        </Card>

        {/* Question Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Question Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {questions.map((question, index) => (
                <Card key={question.qId} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={
                        question.difficulty === 'easy' ? 'default' :
                          question.difficulty === 'medium' ? 'secondary' : 'destructive'
                      }>
                        {question.difficulty.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-semibold">
                        {question.score || 0}/10
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Question {index + 1}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{Math.floor(question.timeLimitSec / 60)}:{(question.timeLimitSec % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center">
          <Button onClick={onStartNew} size="lg">
            Start New Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
