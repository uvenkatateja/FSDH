import { useSelector } from 'react-redux';
import { RootState } from '../store';
import IntervieweeTab from '../components/Interview/IntervieweeTab.tsx';
import InterviewerTab from '../components/Interview/InterviewerTab.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, UserCheck } from 'lucide-react';

const InterviewPage = () => {
  const { candidates } = useSelector((state: RootState) => state.candidates);
  const candidateCount = candidates.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-2 sm:p-4 lg:p-6 h-screen flex flex-col max-w-7xl">

        {/* Tabs - Mobile Responsive */}
        <Tabs defaultValue="interviewee" className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-4 lg:mb-6 flex-shrink-0 h-10 sm:h-12">
            <TabsTrigger value="interviewee" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden xs:inline sm:hidden">Take</span>
              <span className="hidden sm:inline">Interviewee</span>
              <span className="xs:hidden sm:hidden">📝</span>
            </TabsTrigger>
            <TabsTrigger value="interviewer" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden xs:inline sm:hidden">View</span>
              <span className="hidden sm:inline">Dashboard</span>
              <span className="xs:hidden sm:hidden">📊</span>
              {candidateCount > 0 && (
                <span className="ml-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs px-1 py-0.5 sm:px-1.5 sm:py-0.5 lg:px-2 lg:py-1 rounded-full min-w-[16px] sm:min-w-[20px] text-center">
                  {candidateCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Tab Content - Full height and responsive */}
          <TabsContent value="interviewee" className="mt-0 flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col">
            <IntervieweeTab />
          </TabsContent>
          
          <TabsContent value="interviewer" className="mt-0 flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col">
            <InterviewerTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InterviewPage;
