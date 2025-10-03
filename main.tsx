import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { UserProvider } from './contexts/UserContext';
import './index.css';
import '@fontsource/comic-neue';
import '@fontsource/quicksand';
import '@fontsource/patrick-hand';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>
);