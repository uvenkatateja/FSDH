import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setWelcomeBack } from '../../store/interviewSlice';
import IntervieweeTab from '../../components/Interview/IntervieweeTab';
import InterviewerTab from '../../components/Interview/InterviewerTab';
import WelcomeBackModal from '../../components/WelcomeBackModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const InterviewApp = () => {
  const [activeTab, setActiveTab] = useState('interviewee');
  const dispatch = useDispatch();
  const { showWelcomeBack, candidateId: currentCandidateId, status } = useSelector((state: RootState) => state.currentInterview);

  useEffect(() => {
    // Check if there's an unfinished interview on app load
    if (currentCandidateId && status === 'in-progress') {
      dispatch(setWelcomeBack(true));
    }
  }, [currentCandidateId, status, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Swipe AI Interview</h1>
              <span className="text-sm text-gray-500">Powered by AI</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Full Stack Developer Assessment</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="interviewee" className="text-lg py-3">
              Interviewee Portal
            </TabsTrigger>
            <TabsTrigger value="interviewer" className="text-lg py-3">
              Interviewer Dashboard
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="interviewee" className="space-y-6">
            <IntervieweeTab />
          </TabsContent>
          
          <TabsContent value="interviewer" className="space-y-6">
            <InterviewerTab />
          </TabsContent>
        </Tabs>
      </main>

      {showWelcomeBack && <WelcomeBackModal onResume={() => dispatch(setWelcomeBack(false))} />}
    </div>
  );
};

export default InterviewApp;
