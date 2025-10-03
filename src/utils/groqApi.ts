import Groq from 'groq-sdk';
import { v4 as uuidv4 } from 'uuid';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Difficulty weights for scoring
const DIFFICULTY_WEIGHTS = {
  easy: 1,
  medium: 2,
  hard: 3
} as const;

// Clamp score to valid range [0, 10]
function clampScore(score: number): number {
  return Math.max(0, Math.min(10, score));
}

// Helper function to clean AI response and extract JSON
function cleanAndParseJSON(response: string): any {
  try {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Remove leading/trailing whitespace
    cleaned = cleaned.trim();

    // Try to find JSON object or array in the response
    const jsonObjectMatch = cleaned.match(/\{[\s\S]*\}/);
    const jsonArrayMatch = cleaned.match(/\[[\s\S]*\]/);

    if (jsonArrayMatch) {
      cleaned = jsonArrayMatch[0];
    } else if (jsonObjectMatch) {
      cleaned = jsonObjectMatch[0];
    }

    return JSON.parse(cleaned);
  } catch (error) {

    return null;
  }
}

// Generate 6 questions based on resume content with better prompting
export async function generateSixQuestions() {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    throw new Error('Groq API key is required. Please add VITE_GROQ_API_KEY to your .env file.');
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a technical interviewer for Full-Stack React/Node roles. Generate exactly 6 questions: 2 easy, 2 medium, 2 hard. Each question should have 3-5 expected key points for evaluation. Return ONLY a JSON array with this exact format:\n[{"qId":"uuid","difficulty":"easy","text":"question text","expected_points":["point1","point2","point3"]}]',
        },
        {
          role: 'user',
          content: 'Generate 6 Full-Stack React/Node.js interview questions covering: React fundamentals, hooks, state management, Node.js backend, Express.js, REST APIs, async programming, and system design. Include specific expected answer points for each question.',
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      console.log('📝 AI Response received:', response.substring(0, 200) + '...');
      const parsed = cleanAndParseJSON(response);
      if (parsed && Array.isArray(parsed) && parsed.length >= 6) {
        // Add UUIDs if not present and ensure proper format
        const questions = parsed.slice(0, 6).map(q => ({
          qId: q.qId || uuidv4(),
          difficulty: q.difficulty,
          text: q.text,
          expected_points: Array.isArray(q.expected_points) ? q.expected_points : [],
          timeLimitSec: q.difficulty === 'easy' ? 300 : q.difficulty === 'medium' ? 600 : 900, // 5, 10, 15 minutes
          startedAt: null,
          submittedAt: null,
          answerText: '',
          score: null,
          feedback: '',
          confidence: null
        })); return questions;
      } else {
        throw new Error('AI failed to generate questions in correct format. Please try again.');
      }
    } else {
      throw new Error('No response received from AI. Please try again.');
    }
  } catch (error) {
    throw error;
  }
}

// Generate questions based on resume content with better analysis
export async function generateQuestionsFromResume(resumeText: string) {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    throw new Error('Groq API key is required. Please add VITE_GROQ_API_KEY to your .env file.');
  }

  console.log('🤖 Generating AI questions from resume...', resumeText.substring(0, 100) + '...');

  try {
    // Extract key technologies and experience from resume for better targeting
    const techKeywords = extractTechnologies(resumeText);
    const experienceLevel = determineExperienceLevel(resumeText); const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a technical interviewer creating personalized questions based on a candidate's resume. 

Generate exactly 6 questions:
- 2 EASY: Basic concepts from their tech stack
- 2 MEDIUM: Practical application and problem-solving  
- 2 HARD: Architecture, optimization, and advanced concepts

Each question must have 4-6 specific expected answer points for accurate evaluation.

Return ONLY a JSON array:
[{"qId":"uuid","difficulty":"easy","text":"question text","expected_points":["specific point 1","specific point 2","specific point 3","specific point 4"]}]`,
        },
        {
          role: 'user',
          content: `Create interview questions for this candidate:

RESUME ANALYSIS:
- Technologies: ${techKeywords.join(', ')}
- Experience Level: ${experienceLevel}
- Key Skills: React, Node.js, TypeScript, Express, MongoDB

RESUME CONTENT:
${resumeText.substring(0, 1500)}

Focus questions on their actual experience with these technologies. Make expected_points very specific and measurable.`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 2500,
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      console.log('📝 AI Response received:', response.substring(0, 200) + '...');
      const parsed = cleanAndParseJSON(response);
      if (parsed && Array.isArray(parsed) && parsed.length >= 6) {
        // Add UUIDs if not present and ensure proper format
        const questions = parsed.slice(0, 6).map(q => ({
          qId: q.qId || uuidv4(),
          difficulty: q.difficulty,
          text: q.text,
          expected_points: Array.isArray(q.expected_points) ? q.expected_points : [],
          timeLimitSec: q.difficulty === 'easy' ? 300 : q.difficulty === 'medium' ? 600 : 900, // 5, 10, 15 minutes
          startedAt: null,
          submittedAt: null,
          answerText: '',
          score: null,
          feedback: '',
          confidence: null
        })); return questions;
      } else {
        throw new Error('AI failed to generate questions in correct format. Please try again.');
      }
    } else {
      throw new Error('No response received from AI. Please try again.');
    }
  } catch (error) {
    throw error;
  }
}

// Helper function to extract technologies from resume
function extractTechnologies(resumeText: string): string[] {
  const text = resumeText.toLowerCase();
  const technologies = [
    'react', 'node.js', 'javascript', 'typescript', 'express', 'mongodb', 'postgresql',
    'sql', 'python', 'java', 'aws', 'docker', 'kubernetes', 'redis', 'graphql',
    'rest api', 'microservices', 'redux', 'next.js', 'vue', 'angular', 'mysql',
    'git', 'jenkins', 'ci/cd', 'jest', 'cypress', 'webpack', 'babel'
  ];

  return technologies.filter(tech => text.includes(tech));
}

// Helper function to determine experience level
function determineExperienceLevel(resumeText: string): string {
  const text = resumeText.toLowerCase();

  if (text.includes('senior') || text.includes('lead') || text.includes('architect')) {
    return 'Senior (5+ years)';
  } else if (text.includes('mid') || text.includes('intermediate') ||
    /\d{2,3}\+?\s*(years?|yrs?)/.test(text)) {
    return 'Mid-level (2-5 years)';
  } else {
    return 'Junior (0-2 years)';
  }
}

export async function generateQuestion(difficulty: 'easy' | 'medium' | 'hard') {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    throw new Error('Groq API key is required.');
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Generate a ${difficulty} technical interview question for a Full Stack React/Node.js developer. 
          Return ONLY a JSON object with "question" field. No markdown formatting.`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      const parsed = cleanAndParseJSON(response);
      if (parsed && parsed.question) {
        return { question: parsed.question, difficulty };
      }
    }
    throw new Error('Failed to generate question');
  } catch (error) {
    throw error;
  }
}

// Improved keyword-based fallback scoring with guaranteed reasonable scores
function keywordBasedScoring(_question: string, answer: string, expectedPoints: string[] = []): { score: number; feedback: string } {
  if (!answer || !answer.trim()) {
    return {
      score: 0,
      feedback: 'No answer provided.'
    };
  }

  const answerLower = answer.toLowerCase();
  const wordCount = answer.trim().split(/\s+/).length;

  console.log('📝 Answer analysis:', { wordCount, answerPreview: answer.substring(0, 100) });

  // Base score for providing an answer
  let score = 2; // Start with 2 points for attempting to answer

  // Extract keywords from expected points
  const expectedKeywords = expectedPoints.map(p => p.toLowerCase());

  // Technical keywords relevant to Full-Stack development
  const technicalKeywords = [
    'react', 'node', 'javascript', 'typescript', 'api', 'database', 'async', 'promise',
    'component', 'state', 'props', 'hook', 'usestate', 'useeffect', 'express', 'mongodb',
    'sql', 'rest', 'graphql', 'function', 'method', 'class', 'object', 'array',
    'server', 'client', 'frontend', 'backend', 'http', 'https', 'json', 'redux',
    'authentication', 'authorization', 'middleware', 'routing', 'endpoint', 'cors',
    'npm', 'yarn', 'webpack', 'babel', 'jsx', 'dom', 'virtual', 'lifecycle', 'html',
    'css', 'framework', 'library', 'module', 'import', 'export', 'variable', 'const',
    'let', 'var', 'if', 'else', 'loop', 'for', 'while', 'return', 'callback'
  ];

  // Count expected keyword matches (most important)
  let expectedMatches = 0;
  if (expectedKeywords.length > 0) {
    expectedMatches = expectedKeywords.filter(keyword => answerLower.includes(keyword)).length;
    const expectedRatio = expectedMatches / expectedKeywords.length;
    score += expectedRatio * 4; // Up to 4 additional points
  }

  // Count technical keyword matches
  const technicalMatches = technicalKeywords.filter(keyword => answerLower.includes(keyword));
  const technicalScore = Math.min(technicalMatches.length * 0.2, 2); // Up to 2 points
  score += technicalScore;

  // Length and quality bonus
  if (wordCount >= 100) score += 1.5;
  else if (wordCount >= 50) score += 1;
  else if (wordCount >= 20) score += 0.5;

  // Structure and explanation bonus
  if (answerLower.includes('example') || answerLower.includes('for example')) score += 0.5;
  if (answerLower.includes('because') || answerLower.includes('reason') || answerLower.includes('why')) score += 0.5;
  if (answerLower.includes('first') || answerLower.includes('second') || answerLower.includes('also') || answerLower.includes('additionally')) score += 0.5;

  // Ensure minimum reasonable score for substantial answers
  if (wordCount >= 30 && technicalMatches.length > 0 && score < 4) {
    score = 4; // Minimum score for technical answers with substance
  }

  // Clamp to valid range
  const finalScore = clampScore(Math.round(score));

  console.log('🎯 Final keyword scoring:', {
    baseScore: 2,
    expectedMatches,
    technicalMatches: technicalMatches.length,
    wordCount,
    rawScore: score.toFixed(1),
    finalScore
  });

  // Generate feedback based on score
  let feedback = '';
  if (finalScore >= 8) {
    feedback = 'Excellent answer with comprehensive technical coverage and good detail.';
  } else if (finalScore >= 6) {
    feedback = 'Good answer covering key concepts with adequate technical depth.';
  } else if (finalScore >= 4) {
    feedback = 'Basic understanding demonstrated, but could include more technical details and examples.';
  } else if (finalScore >= 2) {
    feedback = 'Limited technical knowledge shown. Answer needs more depth and relevant concepts.';
  } else {
    feedback = 'Answer lacks technical accuracy and key concepts. Significant improvement needed.';
  }

  return { score: finalScore, feedback };
}

// Evaluate candidate answer with improved scoring
export async function evaluateAnswer(
    question: string,
    answer: string,
    difficulty: string,
    expectedPoints: string[] = []
  ) {
    console.log('🔍 Starting evaluation with:', {
      question: question.substring(0, 100),
      answer: answer.substring(0, 100),
      difficulty,
      expectedPoints,
      answerLength: answer?.length || 0
    });

    // If answer is empty, return 0 immediately
    if (!answer || !answer.trim()) {
      return {
        score: 0,
        feedback: 'No answer provided.',
        found_points: [],
        confidence: 1.0,
        status: 'completed'
      };
    }

  // Quick test - if answer has substance, ensure minimum score
  // const hasSubstance = answer.trim().length > 20;
  
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    const fallback = keywordBasedScoring(question, answer, expectedPoints);
    return {
      ...fallback,
      found_points: [],
      confidence: 0.5,
      status: 'completed'
    };
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert technical interviewer evaluating a ${difficulty} difficulty question. 

Scoring Guidelines:
- 0-3: Poor/incorrect answer, major gaps
- 4-6: Basic understanding, some correct points
- 7-8: Good answer, covers most key points
- 9-10: Excellent answer, comprehensive and accurate

Return ONLY this JSON format:
{"score": <number 0-10>, "feedback": "<brief evaluation>", "found_points": ["<points mentioned>"], "confidence": <0.0-1.0>}`,
        },
        {
          role: 'user',
          content: `Question: ${question}

Expected Key Points: ${JSON.stringify(expectedPoints)}

Candidate Answer: ${answer}

Evaluate the answer quality, technical accuracy, and coverage of expected points.`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 400
    });

    const response = completion.choices[0]?.message?.content;
    
    if (response) {
      const parsed = cleanAndParseJSON(response);
      
      if (parsed && typeof parsed.score === 'number') {
        const result = {
          score: clampScore(parsed.score),
          feedback: parsed.feedback || 'Evaluation completed.',
          found_points: Array.isArray(parsed.found_points) ? parsed.found_points : [],
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
          status: 'completed'
        };
        
        return result;
      }
    }

    // If AI response is invalid, fallback to keyword scoring
    const fallback = keywordBasedScoring(question, answer, expectedPoints);
    return {
      ...fallback,
      found_points: [],
      confidence: 0.5,
      status: 'completed'
    };

  } catch (error) {
    // For any errors, use keyword fallback to ensure scoring works
    const fallback = keywordBasedScoring(question, answer, expectedPoints);
    return {
      ...fallback,
      found_points: [],
      confidence: 0.5,
      status: 'completed'
    };
  }

  // Final safety net - should never reach here, but just in case
  const emergencyFallback = keywordBasedScoring(question, answer, expectedPoints);
  return {
    ...emergencyFallback,
    found_points: [],
    confidence: 0.3,
    status: 'completed'
  };
}

// Calculate weighted final score with improved logic
export function calculateFinalScore(questions: any[]): { finalScore: number; rawScore: number } {
  console.log('📊 Calculating final score for questions:', questions.map(q => ({
    difficulty: q.difficulty,
    score: q.score,
    hasAnswer: !!q.answerText
  })));

  let weightedSum = 0;
  let maxPossible = 0;
  let validQuestions = 0;

  questions.forEach((q, index) => {
    const weight = DIFFICULTY_WEIGHTS[q.difficulty as keyof typeof DIFFICULTY_WEIGHTS] || 1;
    const score = clampScore(q.score || 0);

    console.log(`Question ${index + 1} (${q.difficulty}): score=${score}, weight=${weight}`);

    weightedSum += score * weight;
    maxPossible += 10 * weight;

    if (q.answerText || q.score > 0) {
      validQuestions++;
    }
  });

  // Ensure we have a reasonable score even if some questions weren't answered
  const rawScore = maxPossible > 0 ? weightedSum / maxPossible : 0;

  // Convert to percentage (0-100)
  const finalScore = Math.max(0, Math.round(rawScore * 100));

  console.log('📊 Final Score Calculation:', {
    totalQuestions: questions.length,
    validQuestions,
    weightedSum: weightedSum.toFixed(1),
    maxPossible,
    rawScore: rawScore.toFixed(3),
    finalScore
  });

  return { finalScore, rawScore };
}

// Generate final summary with improved analysis
export async function generateFinalSummary(questions: any[]) {
  console.log('📊 Generating final summary for questions:', questions.map(q => ({
    difficulty: q.difficulty,
    score: q.score,
    hasAnswer: !!q.answerText
  })));

  // Calculate weighted score
  const { finalScore } = calculateFinalScore(questions);

  // Analyze performance by difficulty
  const easyQuestions = questions.filter(q => q.difficulty === 'easy');
  const mediumQuestions = questions.filter(q => q.difficulty === 'medium');
  const hardQuestions = questions.filter(q => q.difficulty === 'hard');

  const easyPassed = easyQuestions.filter(q => (q.score || 0) >= 6).length;
  const mediumPassed = mediumQuestions.filter(q => (q.score || 0) >= 6).length;
  const hardPassed = hardQuestions.filter(q => (q.score || 0) >= 6).length;

  const totalPassed = easyPassed + mediumPassed + hardPassed;

  if (!import.meta.env.VITE_GROQ_API_KEY) {
    // Enhanced fallback summary without AI
    let summary = `Interview completed with ${finalScore}% overall score. `;

    if (finalScore >= 80) {
      summary += `Excellent performance across all difficulty levels. Strong technical knowledge demonstrated.`;
    } else if (finalScore >= 60) {
      summary += `Good performance with solid understanding of key concepts. Some areas for improvement in advanced topics.`;
    } else if (finalScore >= 40) {
      summary += `Basic understanding shown but needs improvement in technical depth and problem-solving skills.`;
    } else {
      summary += `Significant gaps in technical knowledge. Recommend additional study and practice before next interview.`;
    }

    return { finalScore, summary };
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Analyze interview performance and provide a professional summary. Return JSON:
{"finalScore": <0-100>, "summary": "<2-3 sentence professional assessment>"}

Focus on:
- Overall technical competency
- Strengths and areas for improvement
- Performance across difficulty levels`,
        },
        {
          role: 'user',
          content: `Interview Results:
- Overall Score: ${finalScore}%
- Questions Passed: ${totalPassed}/6
- Easy Questions: ${easyPassed}/${easyQuestions.length} passed
- Medium Questions: ${mediumPassed}/${mediumQuestions.length} passed  
- Hard Questions: ${hardPassed}/${hardQuestions.length} passed

Question Details: ${JSON.stringify(questions.map(q => ({
            difficulty: q.difficulty,
            score: q.score || 0,
            feedback: q.feedback?.substring(0, 100) || 'No feedback'
          })))}`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 400
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      const parsed = cleanAndParseJSON(response);
      if (parsed && parsed.summary) {
        return {
          finalScore, // Use our calculated score
          summary: parsed.summary
        };
      }
    }

    // Fallback if parsing fails
    let summary = `Interview completed with ${finalScore}% overall score. `;

    if (finalScore >= 80) {
      summary += `Excellent performance across all difficulty levels. Strong technical knowledge demonstrated.`;
    } else if (finalScore >= 60) {
      summary += `Good performance with solid understanding of key concepts. Some areas for improvement in advanced topics.`;
    } else if (finalScore >= 40) {
      summary += `Basic understanding shown but needs improvement in technical depth and problem-solving skills.`;
    } else {
      summary += `Significant gaps in technical knowledge. Recommend additional study and practice before next interview.`;
    }

    return { finalScore, summary };

  } catch (error) {
    // Enhanced fallback summary
    let summary = `Interview completed with ${finalScore}% overall score. `;

    if (finalScore >= 80) {
      summary += `Excellent performance across all difficulty levels. Strong technical knowledge demonstrated.`;
    } else if (finalScore >= 60) {
      summary += `Good performance with solid understanding of key concepts. Some areas for improvement in advanced topics.`;
    } else if (finalScore >= 40) {
      summary += `Basic understanding shown but needs improvement in technical depth and problem-solving skills.`;
    } else {
      summary += `Significant gaps in technical knowledge. Recommend additional study and practice before next interview.`;
    }

    return { finalScore, summary };
  }
}

// Timer and auto-submit utility functions
export const startQuestion = (question: any, saveStateCallback: () => void) => {
  question.startedAt = new Date().toISOString();
  question.submittedAt = null;
  saveStateCallback();

  const interval = setInterval(() => {
    const remaining = computeRemainingTime(question.startedAt, question.timeLimitSec);
    if (remaining <= 0) {
      clearInterval(interval);
      handleTimeout(question, saveStateCallback);
    }
  }, 1000);

  return interval;
};

export const handleTimeout = async (question: any, saveStateCallback: () => void) => {
  question.answerText = question.answerText || "";
  question.submittedAt = new Date().toISOString();
  saveStateCallback();

  // Evaluate the answer (even if empty)
  try {
    const evaluation = await evaluateAnswer(
      question.text,
      question.answerText,
      question.difficulty,
      question.expected_points
    );

    question.score = evaluation.score;
    question.feedback = evaluation.feedback;
    question.confidence = evaluation.confidence;
    saveStateCallback();
  } catch (error) {
    question.score = 0;
    question.feedback = 'Auto-evaluation failed due to timeout.';
    saveStateCallback();
  }
};

// Compute remaining time for a question
export const computeRemainingTime = (startedAtISO: string, timeLimitSec: number): number => {
  const started = new Date(startedAtISO).getTime();
  const now = Date.now();
  const elapsedSec = Math.max(0, Math.floor((now - started) / 1000));
  return Math.max(0, timeLimitSec - elapsedSec);
};