import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import Router from './components/Router';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={
          <div className="flex items-center justify-center h-screen bg-background">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading Interview Platform...</p>
            </div>
          </div>
        } 
        persistor={persistor}
      >
        <Router />
      </PersistGate>
    </Provider>
  );
}

export default App;
