import { Home, Users, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationProps {
  currentPage: 'home' | 'interview';
  onNavigate: (page: 'home' | 'interview') => void;
}

const Navigation = ({ currentPage, onNavigate }: NavigationProps) => {
  if (currentPage === 'home') {
    return null; // Landing page has its own navigation
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-white">Back to Home</span>
            </Button>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-900 dark:text-white" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                Interview Platform
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
