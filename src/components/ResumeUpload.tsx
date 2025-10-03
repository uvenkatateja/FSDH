import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { parseResume, validateContactInfo } from '../utils/resumeParser';

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  fullText: string;
}

interface ResumeUploadProps {
  onResumeProcessed: (data: ResumeData) => void;
  onMissingInfo: (missing: string[]) => void;
}

// Validate if the uploaded file contains a proper resume
const validateResumeQuality = (text: string, _filename: string): boolean => {
  if (!text || text.trim().length < 100) {
    return false; // Too short to be a resume
  }

  const lowerText = text.toLowerCase();
  
  // Check for resume-related keywords
  const resumeKeywords = [
    'experience', 'education', 'skills', 'work', 'employment', 'job', 'position',
    'university', 'college', 'degree', 'bachelor', 'master', 'project', 'developer',
    'engineer', 'manager', 'analyst', 'intern', 'graduate', 'professional'
  ];
  
  const keywordMatches = resumeKeywords.filter(keyword => lowerText.includes(keyword)).length;
  
  // Check for common non-resume content
  const invalidKeywords = [
    'lorem ipsum', 'sample text', 'test document', 'placeholder', 'dummy text',
    'example document', 'template', 'this is a test'
  ];
  
  const hasInvalidContent = invalidKeywords.some(keyword => lowerText.includes(keyword));
  
  // Must have at least 3 resume keywords and no invalid content
  return keywordMatches >= 3 && !hasInvalidContent;
};

const ResumeUpload = ({ onResumeProcessed, onMissingInfo }: ResumeUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [manualInfo, setManualInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (file) {
      await processFile(file);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        await processFile(file);
      }
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain' // Allow text files for testing
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a PDF, DOCX, or TXT file');
      }

      // Parse resume
      const data = await parseResume(file);
      
      // Validate resume quality
      const isValidResume = validateResumeQuality(data.fullText, file.name);
      if (!isValidResume) {
        throw new Error('This doesn\'t appear to be a valid resume. Please upload a proper resume with your professional experience, skills, and contact information.');
      }
      
      setResumeData(data);
      
      // Update manual info with extracted data
      setManualInfo({
        name: data.name,
        email: data.email,
        phone: data.phone
      });

      // Check for missing information
      const missing = validateContactInfo(data);
      
      if (missing.length > 0) {
        // Show manual input form for missing fields
        onMissingInfo(missing);
      } else {
        setSuccess(true);
        onResumeProcessed(data);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualInfoSubmit = () => {
    if (!resumeData) return;

    const updatedData = {
      ...resumeData,
      name: manualInfo.name || resumeData.name,
      email: manualInfo.email || resumeData.email,
      phone: manualInfo.phone || resumeData.phone
    };

    const missing = validateContactInfo(updatedData);
    
    if (missing.length === 0) {
      setSuccess(true);
      onResumeProcessed(updatedData);
    } else {
      setError(`Please fill in: ${missing.join(', ')}`);
    }
  };

  const missingFields = resumeData ? validateContactInfo({
    name: manualInfo.name || resumeData.name,
    email: manualInfo.email || resumeData.email,
    phone: manualInfo.phone || resumeData.phone
  }) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Resume
          </CardTitle>
          <CardDescription>
            Upload your professional resume (PDF or DOCX) with your experience, skills, and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-gray-900 bg-gray-50 dark:border-white dark:bg-gray-800'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isProcessing ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                <p className="text-gray-600">Processing your resume...</p>
              </div>
            ) : success ? (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-green-600 font-medium">Resume processed successfully!</p>
                <p className="text-sm text-gray-600">
                  All required information extracted. You can now start the interview.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drop your resume here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload a professional resume with your work experience, skills, and projects
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    ✅ Supports: PDF, DOCX, TXT • ✅ AI extracts: Contact info, skills, experience
                  </p>
                  
                </div>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="resume-upload"
                />
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button asChild className="w-full sm:w-auto">
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setResumeData({
                        name: '',
                        email: '',
                        phone: '',
                        fullText: 'No resume uploaded - manual entry'
                      });
                      onMissingInfo(['name', 'email', 'phone']);
                    }}
                  >
                    Skip & Enter Manually
                  </Button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Information Form */}
      {resumeData && missingFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Complete Your Information
            </CardTitle>
            <CardDescription>
              We couldn't extract all required information from your resume. Please fill in the missing details below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manual-name">
                  Full Name {missingFields.includes('name') && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="manual-name"
                  placeholder="Enter your full name"
                  value={manualInfo.name}
                  onChange={(e) => setManualInfo(prev => ({ ...prev, name: e.target.value }))}
                  className={missingFields.includes('name') ? 'border-red-300' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manual-email">
                  Email {missingFields.includes('email') && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="manual-email"
                  type="email"
                  placeholder="Enter your email"
                  value={manualInfo.email}
                  onChange={(e) => setManualInfo(prev => ({ ...prev, email: e.target.value }))}
                  className={missingFields.includes('email') ? 'border-red-300' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manual-phone">
                  Phone {missingFields.includes('phone') && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="manual-phone"
                  placeholder="Enter your phone number"
                  value={manualInfo.phone}
                  onChange={(e) => setManualInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className={missingFields.includes('phone') ? 'border-red-300' : ''}
                />
              </div>
            </div>
            
            <Button onClick={handleManualInfoSubmit} className="w-full">
              Continue to Interview
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResumeUpload;
