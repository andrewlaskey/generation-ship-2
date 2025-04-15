import './style.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/react/App';

const appContainer = document.getElementById('app');

ReactDOM.createRoot(appContainer!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
