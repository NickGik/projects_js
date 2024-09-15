// import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { UserProvider } from './context/UserContext';

import './index.scss';

const queryClient = new QueryClient();
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  // <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UserProvider>
    </QueryClientProvider>
  // </React.StrictMode>
);
