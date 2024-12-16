import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';
import App from './App.tsx';
import 'leaflet/dist/leaflet.css';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import initExtensions from './extensions/index.ts';
import axios from 'axios';
import AuthProvider from 'react-auth-kit';
import createStore from 'react-auth-kit/createStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store/index.ts';

const authStore = createStore({
  authName: '_auth',
  authType: 'cookie',
  cookieDomain: window.location.hostname,
  // cookieSecure: window.location.protocol === 'https:',
  cookieSecure: false,
});

initExtensions();

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CookiesProvider>
        <Provider store={store}>
          <AuthProvider store={authStore}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </Provider>
      </CookiesProvider>
    </QueryClientProvider>
  </StrictMode>,
);

/*

*/
