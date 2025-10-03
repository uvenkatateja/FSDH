// Groq API Key Validation Utility for Vercel Deployment

export interface ApiKeyValidation {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

/**
 * Validates the Groq API key configuration
 * Checks for common issues in Vercel deployment
 */
export function validateGroqApiKey(): ApiKeyValidation {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  // Check if API key exists
  if (!apiKey) {
    return {
      isValid: false,
      error: 'VITE_GROQ_API_KEY environment variable is not set',
      suggestion: 'Add VITE_GROQ_API_KEY to your Vercel environment variables or .env file'
    };
  }

  // Check if API key is a placeholder
  if (apiKey === 'your_groq_api_key_here' || apiKey === 'your_actual_groq_api_key_here') {
    return {
      isValid: false,
      error: 'VITE_GROQ_API_KEY contains placeholder value',
      suggestion: 'Replace with your actual Groq API key from https://console.groq.com'
    };
  }

  // Check API key format (Groq keys typically start with 'gsk_')
  if (!apiKey.startsWith('gsk_')) {
    return {
      isValid: false,
      error: 'VITE_GROQ_API_KEY does not appear to be a valid Groq API key',
      suggestion: 'Groq API keys should start with "gsk_". Get your key from https://console.groq.com'
    };
  }

  // Check minimum length
  if (apiKey.length < 50) {
    return {
      isValid: false,
      error: 'VITE_GROQ_API_KEY appears to be too short',
      suggestion: 'Ensure you copied the complete API key from Groq console'
    };
  }

  // Check for common whitespace issues
  if (apiKey !== apiKey.trim()) {
    return {
      isValid: false,
      error: 'VITE_GROQ_API_KEY contains leading or trailing whitespace',
      suggestion: 'Remove any extra spaces from your API key'
    };
  }

  return {
    isValid: true
  };
}

/**
 * Test API key by making a simple request
 * Use this sparingly to avoid quota usage
 */
export async function testGroqApiKey(): Promise<ApiKeyValidation> {
  const validation = validateGroqApiKey();
  
  if (!validation.isValid) {
    return validation;
  }

  try {
    const { default: Groq } = await import('groq-sdk');
    
    const groq = new Groq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    // Make a minimal test request
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'test' }],
      model: 'llama-3.1-8b-instant',
      max_tokens: 1,
      temperature: 0
    });

    if (completion.choices?.[0]?.message) {
      return { isValid: true };
    } else {
      return {
        isValid: false,
        error: 'API key is valid but response format is unexpected',
        suggestion: 'Check Groq API status or try regenerating your API key'
      };
    }
  } catch (error: any) {
    if (error.status === 401) {
      return {
        isValid: false,
        error: 'API key authentication failed',
        suggestion: 'Your API key is invalid or expired. Generate a new one at https://console.groq.com'
      };
    } else if (error.status === 429) {
      return {
        isValid: false,
        error: 'API rate limit exceeded',
        suggestion: 'Your API key is valid but you have exceeded the rate limit. Try again later.'
      };
    } else if (error.message?.includes('fetch')) {
      return {
        isValid: false,
        error: 'Network error connecting to Groq API',
        suggestion: 'Check your internet connection and Groq API status'
      };
    } else {
      return {
        isValid: false,
        error: `API test failed: ${error.message}`,
        suggestion: 'Check Groq API status and your API key validity'
      };
    }
  }
}

/**
 * Get environment info for debugging
 */
export function getEnvironmentInfo() {
  return {
    hasApiKey: !!import.meta.env.VITE_GROQ_API_KEY,
    apiKeyPrefix: import.meta.env.VITE_GROQ_API_KEY?.substring(0, 8) + '...',
    environment: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    baseUrl: import.meta.env.BASE_URL
  };
}

/**
 * Log API key validation for debugging
 */
export function logApiKeyValidation() {
  const validation = validateGroqApiKey();
  const envInfo = getEnvironmentInfo();
  
  console.group('🔑 Groq API Key Validation');
  console.log('Environment:', envInfo);
  console.log('Validation:', validation);
  
  if (!validation.isValid) {
    console.error('❌ API Key Issue:', validation.error);
    console.info('💡 Suggestion:', validation.suggestion);
  } else {
    console.log('✅ API Key appears valid');
  }
  console.groupEnd();
  
  return validation;
}
