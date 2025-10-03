import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { addCandidate, updateCandidate } from '../../store/candidatesSlice';
import { startInterview, nextQuestion, endInterview, updateAnswer, submitAnswer, computeRemainingTime, setWelcomeBack, resumeInterview } from '../../store/interviewSlice';
import { validateContactInfo } from '../../utils/resumeParser';
import { generateQuestionsFromResume, generateSixQuestions, evaluateAnswer, generateFinalSummary } from '../../utils/groqApi';
import {
  UploadStepUI,
  InfoStepUI,
  GeneratingStepUI,
  ReadyStepUI,
  InterviewStepUI,
  CompletedStepUI
} from './InterviewTabUI';

const IntervieweeTab = () => {
  const dispatch = useDispatch();
  const interview = useSelector((state: RootState) => state.currentInterview);
  const candidates = useSelector((state: RootState) => state.candidates.candidates);

  // Derived values from interview state
  const currentCandidate = candidates.find(c => c.id === interview.candidateId);
  const currentQuestion = interview.questions[interview.currentIndex];
  const isActive = interview.status === 'in-progress';
  const timeRemaining = currentQuestion?.startedAt
    ? computeRemainingTime(currentQuestion.startedAt, currentQuestion.timeLimitSec)
    : 0;

  // Local state for UI flow
  const [step, setStep] = useState<'upload' | 'info' | 'generating' | 'ready' | 'interview' | 'completed'>('upload');
  const [candidateInfo, setCandidateInfo] = useState({ name: '', email: '', phone: '' });
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // ==================== HELPER FUNCTIONS ====================
  
  const extractTechnologies = (resumeText: string): string[] => {
    const text = resumeText.toLowerCase();
    const technologies = [
      'react', 'node.js', 'javascript', 'typescript', 'express', 'mongodb', 'postgresql',
      'sql', 'python', 'java', 'aws', 'docker', 'kubernetes', 'redis', 'graphql',
      'rest api', 'microservices', 'redux', 'next.js', 'vue', 'angular', 'mysql',
      'git', 'jenkins', 'ci/cd', 'jest', 'cypress', 'webpack', 'babel', 'html', 'css'
    ];
    return technologies.filter(tech => text.includes(tech));
  };

  const determineExperienceLevel = (resumeText: string): string => {
    const text = resumeText.toLowerCase();
    if (text.includes('senior') || text.includes('lead') || text.includes('architect')) {
      return 'Senior (5+ years)';
    } else if (text.includes('mid') || text.includes('intermediate') || 
               /\d{2,3}\+?\s*(years?|yrs?)/.test(text)) {
      return 'Mid-level (2-5 years)';
    } else {
      return 'Junior (0-2 years)';
    }
  };

  const extractKeyProjects = (resumeText: string): string[] => {
    const projectKeywords = ['project', 'built', 'developed', 'created', 'implemented', 'designed'];
    const lines = resumeText.split('\n');
    const projects = [];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (projectKeywords.some(keyword => lowerLine.includes(keyword)) && 
          line.length > 20 && line.length < 150) {
        projects.push(line.trim());
      }
    }
    return projects.slice(0, 3);
  };

  const generatePersonalizedMessage = (resumeText: string, technologies: string[]): string => {
    const experienceLevel = determineExperienceLevel(resumeText);
    const techCount = technologies.length;
    
    if (techCount >= 8) {
      return `Based on your ${experienceLevel.toLowerCase()} background with ${techCount} technologies, we've crafted challenging questions covering your expertise in ${technologies.slice(0, 3).join(', ')} and more.`;
    } else if (techCount >= 4) {
      return `Your resume shows strong experience with ${technologies.join(', ')}. We've prepared questions that match your ${experienceLevel.toLowerCase()} skill level.`;
    } else {
      return `We've analyzed your background and created questions tailored to your experience level and the technologies mentioned in your resume.`;
    }
  };

  const getEncouragingScoreMessage = (score: number, difficulty: string): string => {
    if (score >= 8) {
      return `🎉 Excellent! You demonstrated strong understanding of this ${difficulty} question.`;
    } else if (score >= 6) {
      return `👍 Good work! You covered the key concepts well for this ${difficulty} question.`;
    } else if (score >= 4) {
      return `✅ Nice effort! You showed basic understanding. Consider adding more technical details next time.`;
    } else {
      return `💪 Keep going! Every answer helps us understand your knowledge better.`;
    }
  };

  // ==================== EFFECTS ====================

  // Check for existing in-progress interview on mount
  useEffect(() => {
    const inProgressCandidate = candidates.find(c => c.status === 'in-progress');
    if (inProgressCandidate && !interview.candidateId && step === 'upload') {
      dispatch(setWelcomeBack(true));
      setStep('interview');
    }
  }, [candidates, interview.candidateId, step, dispatch]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive && timeRemaining > 0 && !isLoading) {
      timer = setInterval(() => {
        if (timeRemaining <= 1) {
          handleTimeUp();
        }
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      handleTimeUp();
    }
    return () => clearInterval(timer);
  }, [isActive, timeRemaining, isLoading]);

  // ==================== EVENT HANDLERS ====================

  const handleInfoSubmit = async () => {
    const missing = validateContactInfo(candidateInfo);
    if (missing.length > 0) {
      setMissingFields(missing);
      return;
    }

    const completeData = {
      ...candidateInfo,
      fullText: 'Manual entry - no resume uploaded',
      filename: 'manual-entry.txt'
    };

    await handleResumeProcessed(completeData);
  };

  const handleResumeProcessed = async (data: { name: string; email: string; phone: string; fullText: string; filename?: string }) => {
    setIsLoading(true);
    setStep('generating');

    try {
      const questions = data.fullText?.trim()
        ? await generateQuestionsFromResume(data.fullText)
        : await generateSixQuestions();

      const candidateId = `uuid-${Date.now()}`;

      const questionData = questions.map((q: any, index: number) => ({
        qId: q.qId || `${candidateId}-q${index}`,
        text: q.text || q.question,
        difficulty: q.difficulty,
        expected_points: q.expected_points || [],
        timeLimitSec: q.timeLimitSec || (q.difficulty === 'easy' ? 300 : q.difficulty === 'medium' ? 600 : 900),
        startedAt: null,
        submittedAt: null,
        answerText: '',
        score: null,
        feedback: ''
      }));

      dispatch(addCandidate({
        id: candidateId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        resumeText: data.fullText || 'Manual entry',
        resumeMeta: {
          filename: data.filename || 'manual-entry.txt',
          size: (data.fullText || '').length
        },
        finalScore: null,
        status: 'in-progress',
        summary: ''
      }));

      dispatch(endInterview());
      dispatch(startInterview({ candidateId, questions: questionData }));
      setStep('ready');
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please try again.');
      setStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentCandidate || !currentAnswer.trim()) {
      return;
    }

    setIsLoading(true);
    setIsEvaluating(true);
    try {
      const currentQuestionData = interview.questions[interview.currentIndex];
      if (!currentQuestionData) {
        return;
      }

      dispatch(updateAnswer({
        questionIndex: interview.currentIndex,
        answerText: currentAnswer
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));

      const evaluation = await evaluateAnswer(
        currentQuestionData.text,
        currentAnswer,
        currentQuestionData.difficulty,
        currentQuestionData.expected_points || []
      );

      if (typeof evaluation.score !== 'number' || evaluation.score < 0) {
        evaluation.score = currentAnswer.length > 20 ? 5 : 2;
        evaluation.feedback = 'Fallback scoring applied due to evaluation error.';
      }

      const encouragingMessage = getEncouragingScoreMessage(evaluation.score, currentQuestionData.difficulty);
      evaluation.feedback = `${encouragingMessage}\n\n${evaluation.feedback}`;

      dispatch(submitAnswer({
        questionIndex: interview.currentIndex,
        score: evaluation.score,
        feedback: evaluation.feedback,
        found_points: evaluation.found_points,
        confidence: evaluation.confidence
      }));

      setCurrentAnswer('');
      setIsEvaluating(false);
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (interview.currentIndex < 5) {
        dispatch(nextQuestion());
      } else {
        await completeInterview();
      }
    } catch (error) {
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsLoading(false);
      setIsEvaluating(false);
    }
  };

  const handleTimeUp = async () => {
    if (!currentCandidate) return;

    const currentQuestionData = interview.questions[interview.currentIndex];
    if (!currentQuestionData) return;

    const answer = currentAnswer.trim() || 'No answer provided (time expired)';
    const evaluation = await evaluateAnswer(currentQuestionData.text, answer, currentQuestionData.difficulty);

    dispatch(submitAnswer({
      questionIndex: interview.currentIndex,
      score: currentAnswer.trim() ? evaluation.score : 0,
      feedback: currentAnswer.trim() ? evaluation.feedback : 'Time expired without an answer.'
    }));

    dispatch(updateAnswer({
      questionIndex: interview.currentIndex,
      answerText: answer
    }));

    setCurrentAnswer('');

    if (interview.currentIndex < 5) {
      dispatch(nextQuestion());
    } else {
      await completeInterview();
    }
  };

  const completeInterview = async () => {
    if (!currentCandidate) {
      return;
    }

    setIsLoading(true);
    try {
      const processedQuestions = interview.questions.map(q => ({
        ...q,
        score: q.score || 0,
        feedback: q.feedback || 'No feedback available'
      }));

      const result = await generateFinalSummary(processedQuestions);

      dispatch(updateCandidate({
        id: currentCandidate.id,
        updates: {
          finalScore: result.finalScore,
          status: 'completed',
          summary: result.summary,
          questions: processedQuestions.map(q => ({
            id: q.qId,
            qId: q.qId,
            difficulty: q.difficulty,
            text: q.text,
            expected_points: q.expected_points,
            timeLimit: q.timeLimitSec,
            timeLimitSec: q.timeLimitSec,
            startedAt: q.startedAt,
            submittedAt: q.submittedAt,
            answer: q.answerText,
            answerText: q.answerText,
            score: q.score || 0,
            feedback: q.feedback,
            confidence: q.confidence,
            found_points: q.found_points,
            timeSpent: q.timeLimitSec
          }))
        }
      }));

      dispatch(endInterview());
      setStep('completed');
    } catch (error) {
      alert('Failed to complete interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setStep('upload');
    setCandidateInfo({ name: '', email: '', phone: '' });
    setMissingFields([]);
    setCurrentAnswer('');
    dispatch(endInterview());
  };

  // ==================== UI HANDLERS ====================

  const handleResumeInterview = async () => {
    const inProgressCandidate = candidates.find(c => c.status === 'in-progress');
    if (!inProgressCandidate) return;

    if (interview.candidateId === inProgressCandidate.id && interview.questions.length > 0) {
      dispatch(resumeInterview());
      setStep('interview');
    } else {
      try {
        setIsLoading(true);
        const questions = inProgressCandidate.resumeText?.trim()
          ? await generateQuestionsFromResume(inProgressCandidate.resumeText)
          : await generateSixQuestions();

        const questionData = questions.map((q: any, index: number) => ({
          qId: q.qId || `${inProgressCandidate.id}-q${index}`,
          text: q.text || q.question,
          difficulty: q.difficulty,
          expected_points: q.expected_points || [],
          timeLimitSec: q.timeLimitSec || (q.difficulty === 'easy' ? 300 : q.difficulty === 'medium' ? 600 : 900),
          startedAt: null,
          submittedAt: null,
          answerText: '',
          score: null,
          feedback: ''
        }));

        dispatch(endInterview());
        dispatch(startInterview({ candidateId: inProgressCandidate.id, questions: questionData }));
        setStep('interview');
      } catch (error) {
        alert('Failed to resume interview. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStartNewInterview = () => {
    const inProgressCandidate = candidates.find(c => c.status === 'in-progress');
    if (inProgressCandidate) {
      dispatch(updateCandidate({
        id: inProgressCandidate.id,
        updates: { status: 'completed' }
      }));
    }
  };

  // ==================== RENDER LOGIC ====================

  if (step === 'upload') {
    const inProgressCandidate = candidates.find(c => c.status === 'in-progress');
    return (
      <UploadStepUI
        inProgressCandidate={inProgressCandidate}
        isLoading={isLoading}
        onResumeInterview={handleResumeInterview}
        onStartNewInterview={handleStartNewInterview}
        onResumeProcessed={handleResumeProcessed}
        onMissingInfo={(missing) => {
          setMissingFields(missing);
          setStep('info');
        }}
      />
    );
  }

  if (step === 'info') {
    return (
      <InfoStepUI
        candidateInfo={candidateInfo}
        missingFields={missingFields}
        isLoading={isLoading}
        onCandidateInfoChange={setCandidateInfo}
        onSubmit={handleInfoSubmit}
        onGoBack={() => {
          setStep('upload');
          setCandidateInfo({ name: '', email: '', phone: '' });
          setMissingFields([]);
        }}
      />
    );
  }

  if (step === 'generating') {
    return <GeneratingStepUI />;
  }

  if (step === 'ready' && currentCandidate) {
    const technologies = extractTechnologies(currentCandidate.resumeText);
    const experienceLevel = determineExperienceLevel(currentCandidate.resumeText);
    const keyProjects = extractKeyProjects(currentCandidate.resumeText);
    const personalizedMessage = generatePersonalizedMessage(currentCandidate.resumeText, technologies);

    return (
      <ReadyStepUI
        candidate={currentCandidate}
        technologies={technologies}
        experienceLevel={experienceLevel}
        keyProjects={keyProjects}
        personalizedMessage={personalizedMessage}
        onStartInterview={() => setStep('interview')}
        onGoBack={() => {
          dispatch(endInterview());
          setStep('upload');
        }}
      />
    );
  }

  if (step === 'interview' && currentCandidate) {
    const progress = ((interview.currentIndex + 1) / 6) * 100;

    return (
      <InterviewStepUI
        currentQuestion={currentQuestion}
        progress={progress}
        currentIndex={interview.currentIndex}
        questions={interview.questions}
        currentAnswer={currentAnswer}
        isActive={isActive}
        isLoading={isLoading}
        isEvaluating={isEvaluating}
        onAnswerChange={setCurrentAnswer}
        onSubmit={handleAnswerSubmit}
        onTimeUp={handleTimeUp}
        onStopInterview={() => {
          dispatch(endInterview());
          setStep('upload');
        }}
      />
    );
  }

  if (step === 'completed' && currentCandidate) {
    const finalScore = currentCandidate.finalScore || 0;

    return (
      <CompletedStepUI
        candidate={currentCandidate}
        questions={interview.questions}
        finalScore={finalScore}
        onStartNew={resetInterview}
      />
    );
  }

  return null;
};

export default IntervieweeTab;
