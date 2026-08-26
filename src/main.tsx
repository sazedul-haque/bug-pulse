import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AgentProvider } from './context/AgentContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AgentProvider>
          <App />
        </AgentProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
