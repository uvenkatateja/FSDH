import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import candidatesReducer from './candidatesSlice';
import currentInterviewReducer from './interviewSlice';

// Use localStorage (can be upgraded to IndexedDB with localforage)
// To use IndexedDB: npm install localforage, then import and configure
const persistStorage = storage;

// BroadcastChannel for cross-tab syncing
const broadcastChannel = typeof BroadcastChannel !== 'undefined' 
  ? new BroadcastChannel('swipe-interview-sync')
  : null;

const candidatesPersistConfig = {
  key: 'candidates',
  storage: persistStorage,
};

const currentInterviewPersistConfig = {
  key: 'currentInterview',
  storage: persistStorage,
};
const persistedCandidatesReducer = persistReducer(candidatesPersistConfig, candidatesReducer);
const persistedCurrentInterviewReducer = persistReducer(currentInterviewPersistConfig, currentInterviewReducer);

export const store = configureStore({
  reducer: {
    candidates: persistedCandidatesReducer,
    currentInterview: persistedCurrentInterviewReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Subscribe to state changes and broadcast to other tabs
let previousState: any = null;
store.subscribe(() => {
  const currentState = store.getState();
  
  // Only broadcast if state actually changed
  if (previousState !== currentState && broadcastChannel) {
    broadcastChannel.postMessage({
      type: 'STATE_UPDATE',
      payload: {
        candidates: currentState.candidates,
        currentInterview: currentState.currentInterview
      },
      timestamp: Date.now()
    });
  }
  
  previousState = currentState;
});

// Listen for broadcasts from other tabs
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event.data.type === 'STATE_UPDATE') {

      // The redux-persist will handle the actual state update
      // This just logs for debugging
    }
  };
}

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export broadcast channel for manual syncing if needed
export { broadcastChannel };