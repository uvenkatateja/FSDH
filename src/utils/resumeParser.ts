import mammoth from 'mammoth';
import Groq from 'groq-sdk';
import pdfToText from 'react-pdftotext';
import { validateGroqApiKey } from './apiKeyValidator';

// Validate API key and initialize Groq client
const apiKeyValidation = validateGroqApiKey();
if (!apiKeyValidation.isValid && import.meta.env.DEV) {
  console.warn('⚠️ Resume Parser - Groq API Key Issue:', apiKeyValidation.error);
}

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});



export async function parseResume(file: File) {
  let text = '';
  
  try {

    
    if (file.type === 'application/pdf') {
      text = await parsePDF(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await parseDOCX(file);
    } else if (file.type === 'text/plain') {
      text = await parseText(file);
    } else {
      throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT.');
    }



    // If we got text, use Groq AI to extract contact information
    if (text.trim()) {

      return await extractContactInfoWithAI(text);
    } else {
      // If no text extracted, try to extract info from filename using AI

      return await extractContactInfoFromFilename(file.name);
    }
  } catch (error) {

    // Return empty data so user can enter manually
    return {
      name: '',
      email: '',
      phone: '',
      fullText: `File: ${file.name} (parsing failed - please enter information manually)`
    };
  }
}

async function parsePDF(file: File): Promise<string> {
  try {

    
    const text = await pdfToText(file);

    
    if (text && text.trim().length > 0) {
      return text.trim();
    } else {

      return '';
    }
    
  } catch (error) {

    return '';
  }
}


async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function parseText(file: File): Promise<string> {
  return await file.text();
}

// AI-powered contact information extraction using Groq with exact prompt template
async function extractContactInfoWithAI(text: string) {
  try {
    if (!import.meta.env.VITE_GROQ_API_KEY) {

      return extractContactInfoRegex(text);
    }


    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a resume parser. Extract ONLY name, email and phone from the following resume text. Return EXACT JSON:\n{"name": "", "email": "", "phone": ""}'
        },
        {
          role: 'user',
          content: text.substring(0, 2000) // Limit text to avoid token limits
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 200
    });

    const response = completion.choices[0]?.message?.content;

    
    if (response) {
      try {
        const parsed = JSON.parse(response);

        const result = {
          name: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          fullText: text
        };

        return result;
      } catch (parseError) {

        return extractContactInfoRegex(text);
      }
    }
  } catch (error) {

  }

  // Fallback to regex extraction
  return extractContactInfoRegex(text);
}

// Try to extract name from filename using AI
async function extractContactInfoFromFilename(filename: string) {
  try {
    if (!import.meta.env.VITE_GROQ_API_KEY) {

      return extractNameFromFilename(filename);
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Extract a person's name from this filename if possible. Return JSON with "name", "email", and "phone" fields. If name cannot be determined from filename, return empty string for name. Always return empty strings for email and phone since they cannot be determined from filename. Only return the JSON object, no other text.`
        },
        {
          role: 'user',
          content: `Filename: ${filename}`
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 100
    });

    const response = completion.choices[0]?.message?.content;
    if (response) {
      try {
        const parsed = JSON.parse(response);
        return {
          name: parsed.name || '',
          email: '',
          phone: '',
          fullText: `Filename: ${filename} (no content extracted - please enter information manually)`
        };
      } catch (parseError) {

      }
    }
  } catch (error) {

  }

  // Fallback to simple filename parsing
  return extractNameFromFilename(filename);
}

// Simple filename-based name extraction
function extractNameFromFilename(filename: string) {
  // Remove extension and common resume keywords
  let name = filename
    .replace(/\.(pdf|docx|doc|txt)$/i, '')
    .replace(/[_-]/g, ' ')
    .replace(/\b(resume|cv|curriculum|vitae)\b/gi, '')
    .trim();

  // Basic cleanup - capitalize first letters
  name = name.split(' ')
    .filter(word => word.length > 1)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return {
    name: name || '',
    email: '',
    phone: '',
    fullText: `Filename: ${filename} (no content extracted - please enter information manually)`
  };
}

// Regex-based fallback extraction
function extractContactInfoRegex(text: string) {

  
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const nameRegex = /^([A-Z][a-z]+ [A-Z][a-z]+)/m;

  const email = text.match(emailRegex)?.[0] || '';
  const phone = text.match(phoneRegex)?.[0] || '';
  const name = text.match(nameRegex)?.[0] || '';



  return {
    name,
    email,
    phone,
    fullText: text,
  };
}

export function validateContactInfo(data: { name: string; email: string; phone: string; fullText?: string }) {
  const missing = [];
  if (!data.name?.trim()) missing.push('name');
  if (!data.email?.trim()) missing.push('email');
  if (!data.phone?.trim()) missing.push('phone');
  return missing;
}