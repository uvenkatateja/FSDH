import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Download,
  Trash2,
  User,
  Calendar,
  Star,
  Search,
  ArrowUpDown,
  ArrowLeft,
  Bot
} from 'lucide-react';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Candidate } from '../../store/candidatesSlice';
import { ThemeToggle } from '../theme-toggle';

// Simple inline select component to avoid import issues
const SimpleSelect: React.FC<{
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}> = ({ value, onValueChange, options, className }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className || ''}`}
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

export interface InterviewerTabUIProps {
  candidates: Candidate[];
  searchTerm: string;
  sortBy: 'name' | 'score' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  selectedCandidate: string | null;
  onClearCandidates: () => void;
  onSetSearchTerm: (term: string) => void;
  onSetSorting: (sorting: { sortBy: 'name' | 'score' | 'createdAt'; sortOrder: 'asc' | 'desc' }) => void;
  onSelectCandidate: (candidateId: string | null) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  filteredAndSortedCandidates: Candidate[];
}

// Dashboard Overview Component
const DashboardOverview: React.FC<{
  totalCandidates: number;
  completedCandidates: number;
  inProgressCandidates: number;
  pendingCandidates: number;
}> = ({ totalCandidates, completedCandidates, inProgressCandidates, pendingCandidates }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
    <Card>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{totalCandidates}</p>
          </div>
          <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-gray-900 dark:text-white" />
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Done</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{completedCandidates}</p>
          </div>
          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-500" />
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{inProgressCandidates}</p>
          </div>
          <Clock className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-gray-900 dark:text-white" />
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Wait</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">{pendingCandidates}</p>
          </div>
          <XCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-500" />
        </div>
      </CardContent>
    </Card>
  </div>
);

// Performance Overview Component
const PerformanceOverview: React.FC<{ candidate: Candidate }> = ({ candidate }) => {
  const totalScore = candidate.score || candidate.finalScore || 0;
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-primary">{totalScore}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Total Score</div>
          <div className="text-xs text-muted-foreground">out of 60</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {candidate.questions?.filter((q) => q.score >= 7).length || 0}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Strong</div>
          <div className="text-xs text-muted-foreground">7+ score</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {candidate.questions && candidate.questions.length > 0 
              ? Math.round(candidate.questions.reduce((sum: number, q) => sum + (q.timeSpent || 0), 0) / candidate.questions.length)
              : 0}s
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Avg Time</div>
          <div className="text-xs text-muted-foreground">per question</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-purple-600">
            {Math.round((totalScore / 60) * 100)}%
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Overall</div>
          <div className="text-xs text-muted-foreground">performance</div>
        </CardContent>
      </Card>
    </div>
  );
};

// Profile Card Component
const ProfileCard: React.FC<{ candidate: Candidate; getStatusColor: (status: string) => string; getStatusIcon: (status: string) => React.ReactNode }> = ({ candidate, getStatusColor, getStatusIcon }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <User className="h-5 w-5" />
        Candidate Profile
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <label className="text-sm font-medium text-muted-foreground">Name</label>
        <p className="font-medium">{candidate.name}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Email</label>
        <p className="font-medium">{candidate.email}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Phone</label>
        <p className="font-medium">{candidate.phone}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Position</label>
        <p className="font-medium">{candidate.position || 'Not specified'}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Interview Date</label>
        <p className="font-medium">{new Date(candidate.createdAt || candidate.timestamp || new Date()).toLocaleDateString()}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Final Score</label>
        <p className="text-2xl font-bold text-primary">{candidate.score || candidate.finalScore || 0}/60</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(((candidate.score || candidate.finalScore || 0) / 60) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {Math.round(((candidate.score || candidate.finalScore || 0) / 60) * 100)}% Overall Performance
        </p>
      </div>
      <Badge className={getStatusColor(candidate.status)}>
        {getStatusIcon(candidate.status)}
        <span className="ml-1 capitalize">{candidate.status}</span>
      </Badge>
    </CardContent>
  </Card>
);

// Chat History Component
const ChatHistory: React.FC<{ candidate: Candidate }> = ({ candidate }) => (
  <Card className="h-[400px] sm:h-[500px] lg:h-[600px]">
    <CardHeader className="pb-3 sm:pb-4">
      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
        <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="hidden sm:inline">Interview Chat History</span>
        <span className="sm:hidden">Chat History</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="p-0 h-[calc(100%-60px)] sm:h-[calc(100%-80px)]">
      <ScrollArea className="h-full p-3 sm:p-4">
        <div className="space-y-4 sm:space-y-6">
          {candidate.questions?.map((question: any, index: number) => (
            <div key={question.id} className="space-y-4">
              {/* Question */}
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                      <Badge variant={question.difficulty === 'easy' ? 'default' : question.difficulty === 'medium' ? 'secondary' : 'destructive'} className="text-xs">
                        {question.difficulty.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Q{index + 1}</span>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{question.timeLimit || question.timeLimitSec || 300}s</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed">{question.text}</p>
                  </div>
                </div>
              </div>
              
              {/* Answer */}
              <div className="flex items-start space-x-2 sm:space-x-3 justify-end">
                <div className="flex-1 text-right">
                  <div className="bg-muted rounded-lg p-3 sm:p-4 inline-block text-left max-w-[90%] sm:max-w-[80%]">
                    <p className="text-xs sm:text-sm leading-relaxed">{question.answer || question.answerText || 'No answer provided'}</p>
                    {question.score > 0 && (
                      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border">
                        <div className="flex flex-wrap items-center gap-2">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                          <span className="text-xs font-medium text-green-600">
                            {question.score}/10
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {question.timeSpent}s
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-3 sm:line-clamp-2">{question.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);

// Question Breakdown Component
const QuestionBreakdown: React.FC<{ candidate: Candidate }> = ({ candidate }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        Question-by-Question Breakdown
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidate.questions?.map((question: any, index: number) => (
          <Card key={question.id} className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={
                  question.difficulty === 'easy' ? 'default' :
                  question.difficulty === 'medium' ? 'secondary' : 'destructive'
                }>
                  {question.difficulty.toUpperCase()}
                </Badge>
                <span className="text-lg font-bold">
                  {question.score}/10
                </span>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                Question {index + 1}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    question.score >= 8 ? 'bg-green-500' :
                    question.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(question.score / 10) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{question.timeSpent}s / {question.timeLimit || question.timeLimitSec || 300}s</span>
              </div>
              {question.feedback && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {question.feedback}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Candidate List Component
const CandidateList: React.FC<{
  candidates: Candidate[];
  onSelectCandidate: (candidateId: string) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}> = ({ candidates, onSelectCandidate, getStatusColor, getStatusIcon }) => (
  <div className="space-y-3 sm:space-y-4">
    {candidates.map((candidate) => (
      <div
        key={candidate.id}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer gap-3 sm:gap-4"
        onClick={() => onSelectCandidate(candidate.id)}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-sm sm:text-base truncate">{candidate.name}</h4>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{candidate.position || 'Position not specified'}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
          <div className="text-left sm:text-right">
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">{new Date(candidate.createdAt || candidate.timestamp || new Date()).toLocaleDateString()}</span>
              <span className="xs:hidden">{new Date(candidate.createdAt || candidate.timestamp || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            {(candidate.score || candidate.finalScore || 0) > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                <span className="text-xs sm:text-sm font-medium">{candidate.score || candidate.finalScore || 0}/60</span>
              </div>
            )}
          </div>
          
          <Badge className={`${getStatusColor(candidate.status)} text-xs`}>
            {getStatusIcon(candidate.status)}
            <span className="ml-1 capitalize hidden xs:inline">{candidate.status}</span>
            <span className="ml-1 capitalize xs:hidden">
              {candidate.status === 'completed' ? '✓' : candidate.status === 'in-progress' ? '⏳' : '⏸'}
            </span>
          </Badge>
        </div>
      </div>
    ))}
  </div>
);

// Main InterviewerTabUI Component
const InterviewerTabUI: React.FC<InterviewerTabUIProps> = ({
  candidates,
  searchTerm,
  sortBy,
  sortOrder,
  selectedCandidate,
  onClearCandidates,
  onSetSearchTerm,
  onSetSorting,
  onSelectCandidate,
  getStatusColor,
  getStatusIcon,
  filteredAndSortedCandidates
}) => {
  const completedCandidates = candidates.filter(c => c.status === 'completed');
  const inProgressCandidates = candidates.filter(c => c.status === 'in-progress');
  const pendingCandidates = candidates.filter(c => c.status === 'pending');

  const selectedCandidateData = candidates.find(c => c.id === selectedCandidate);

  // If viewing detailed candidate view
  if (selectedCandidate && selectedCandidateData) {
    // Safety check for questions array
    if (!selectedCandidateData.questions || selectedCandidateData.questions.length === 0) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => onSelectCandidate(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{selectedCandidateData.name}</h2>
              <p className="text-muted-foreground">{selectedCandidateData.position}</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No interview data available for this candidate.</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              onClick={() => onSelectCandidate(null)}
              className="flex items-center gap-2 w-fit"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Back to Dashboard</span>
              <span className="xs:hidden">Back</span>
            </Button>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">{selectedCandidateData.name}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{selectedCandidateData.position || 'Position not specified'}</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>

        {/* Performance Overview */}
        <PerformanceOverview candidate={selectedCandidateData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <ProfileCard 
              candidate={selectedCandidateData} 
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          </div>

          {/* Chat History */}
          <div className="lg:col-span-2">
            <ChatHistory candidate={selectedCandidateData} />
          </div>
        </div>

        {/* Question Scores Breakdown */}
        <QuestionBreakdown candidate={selectedCandidateData} />

        {/* AI Summary */}
        {selectedCandidateData.summary && (
          <Card>
            <CardHeader>
              <CardTitle>AI Assessment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {selectedCandidateData.summary}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <DashboardOverview
        totalCandidates={candidates.length}
        completedCandidates={completedCandidates.length}
        inProgressCandidates={inProgressCandidates.length}
        pendingCandidates={pendingCandidates.length}
      />

      {/* Main Content */}
      <Tabs defaultValue="candidates" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-10 sm:h-12">
          <TabsTrigger value="candidates" className="text-xs sm:text-sm px-2 sm:px-4">Candidates</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-4">Analytics</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm px-2 sm:px-4">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="candidates" className="mt-3 sm:mt-4 lg:mt-6">
          <Card>
            <CardHeader className="pb-3 sm:pb-4 lg:pb-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Candidate Management</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      View and manage all interview candidates
                    </CardDescription>
                  </div>
                  <div className="hidden sm:block">
                    <ThemeToggle />
                  </div>
                </div>
                
                {/* Mobile-first controls */}
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Search - Full width on mobile */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search candidates..."
                      value={searchTerm}
                      onChange={(e) => onSetSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                  
                  {/* Controls row */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {/* Sort */}
                    <div className="flex items-center gap-2 flex-1">
                      <ArrowUpDown className="h-4 w-4 flex-shrink-0" />
                      <SimpleSelect 
                        value={`${sortBy}-${sortOrder}`} 
                        onValueChange={(value: string) => {
                          const [field, order] = value.split('-') as [typeof sortBy, typeof sortOrder];
                          onSetSorting({ sortBy: field, sortOrder: order });
                        }}
                        options={[
                          { value: "score-desc", label: "Score ↓" },
                          { value: "score-asc", label: "Score ↑" },
                          { value: "name-asc", label: "Name A-Z" },
                          { value: "name-desc", label: "Name Z-A" },
                          { value: "createdAt-desc", label: "Newest" },
                          { value: "createdAt-asc", label: "Oldest" }
                        ]}
                        className="flex-1 sm:w-40"
                      />
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <Download className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Export</span>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={onClearCandidates}
                        disabled={candidates.length === 0}
                        className="flex-1 sm:flex-none"
                      >
                        <Trash2 className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Clear All</span>
                      </Button>
                      <div className="sm:hidden">
                        <ThemeToggle />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {candidates.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No candidates yet</h3>
                  <p className="text-sm sm:text-base text-muted-foreground px-4">
                    Candidates will appear here once they start their interviews
                  </p>
                </div>
              ) : (
                <CandidateList
                  candidates={filteredAndSortedCandidates}
                  onSelectCandidate={onSelectCandidate}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-3 sm:mt-4 lg:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                Interview Analytics
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 sm:py-12">
                <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-sm sm:text-base text-muted-foreground px-4">
                  Detailed analytics and reporting features will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-3 sm:mt-4 lg:mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Interview Settings</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure interview parameters and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 sm:py-12">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Settings Panel</h3>
                <p className="text-sm sm:text-base text-muted-foreground px-4">
                  Interview configuration options will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewerTabUI;
