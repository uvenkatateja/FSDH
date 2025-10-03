import { useState, useEffect } from 'react';
import HomePage from '../pages/HomePage';
import InterviewPage from '../pages/InterviewPage';
import Navigation from './Navigation';

type Route = 'home' | 'interview';

const Router = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');

  useEffect(() => {
    // Handle initial route from URL hash
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove #
      
      switch (hash) {
        case 'interview':
        case 'get-started':
          setCurrentRoute('interview');
          break;
        case 'home':
        case '':
        default:
          setCurrentRoute('home');
          break;
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Handle initial load
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Navigation function for programmatic routing
  const navigate = (route: Route) => {
    setCurrentRoute(route);
    window.location.hash = route === 'home' ? '' : route;
  };

  // Expose navigation globally for components to use
  useEffect(() => {
    (window as any).navigate = navigate;
  }, []);

  const renderPage = () => {
    switch (currentRoute) {
      case 'interview':
        return <InterviewPage />;
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentRoute} onNavigate={navigate} />
      {renderPage()}
    </div>
  );
};

export default Router;
