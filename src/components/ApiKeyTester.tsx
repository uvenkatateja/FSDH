    import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, CheckCircle, Loader2, Key, ExternalLink } from 'lucide-react';
import { validateGroqApiKey, testGroqApiKey, getEnvironmentInfo, logApiKeyValidation } from '../utils/apiKeyValidator';

/**
 * API Key Testing Component for Vercel Deployment Debugging
 * Use this component to verify Groq API key configuration
 */
const ApiKeyTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  
  const envInfo = getEnvironmentInfo();
  const validation = validateGroqApiKey();

  const handleTestApiKey = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await testGroqApiKey();
      setTestResult(result);
      logApiKeyValidation();
    } catch (error) {
      setTestResult({
        isValid: false,
        error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestion: 'Check your internet connection and try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (isValid: boolean) => {
    if (isValid) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = (isValid: boolean) => {
    return isValid ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Groq API Key Validator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Use this tool to verify your Groq API key configuration for Vercel deployment
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Environment Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Environment:</strong> {envInfo.environment}
            </div>
            <div>
              <strong>Has API Key:</strong> {envInfo.hasApiKey ? '✅ Yes' : '❌ No'}
            </div>
            <div>
              <strong>API Key Preview:</strong> {envInfo.apiKeyPrefix || 'Not set'}
            </div>
            <div>
              <strong>Mode:</strong> {envInfo.isDev ? 'Development' : 'Production'}
            </div>
          </div>

          {/* Validation Result */}
          <div className={`p-3 rounded-lg border ${getStatusColor(validation.isValid)}`}>
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(validation.isValid)}
              <strong>
                {validation.isValid ? 'API Key Format Valid' : 'API Key Issue Detected'}
              </strong>
            </div>
            {validation.error && (
              <p className="text-sm mb-2">
                <strong>Error:</strong> {validation.error}
              </p>
            )}
            {validation.suggestion && (
              <p className="text-sm">
                <strong>Suggestion:</strong> {validation.suggestion}
              </p>
            )}
          </div>

          {/* Test Button */}
          <div className="flex gap-2">
            <Button 
              onClick={handleTestApiKey}
              disabled={isLoading || !validation.isValid}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              {isLoading ? 'Testing API Key...' : 'Test API Connection'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.open('https://console.groq.com', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Groq Console
            </Button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-3 rounded-lg border ${getStatusColor(testResult.isValid)}`}>
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(testResult.isValid)}
                <strong>
                  {testResult.isValid ? 'API Connection Successful' : 'API Connection Failed'}
                </strong>
              </div>
              {testResult.error && (
                <p className="text-sm mb-2">
                  <strong>Error:</strong> {testResult.error}
                </p>
              )}
              {testResult.suggestion && (
                <p className="text-sm">
                  <strong>Suggestion:</strong> {testResult.suggestion}
                </p>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-semibold text-blue-900 mb-2">For Vercel Deployment:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Get your API key from <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline">Groq Console</a></li>
              <li>2. Add VITE_GROQ_API_KEY to Vercel Environment Variables</li>
              <li>3. Ensure the key starts with 'gsk_'</li>
              <li>4. Set for Production, Preview, and Development environments</li>
              <li>5. Redeploy your application after adding the key</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyTester;
