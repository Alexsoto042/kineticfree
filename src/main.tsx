import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';
import './i18n';
import App from './App.tsx';

import { App as CapacitorApp } from '@capacitor/app';
import { supabase } from './supabaseClient';
import { logger } from './lib/logger';

const mainLogger = logger.createContext('Main');

const handleDeepLink = async (urlStr: string) => {
    mainLogger.info('Handling deep link:', urlStr);
    
    try {
        const url = new URL(urlStr);
        const params = new URLSearchParams(url.search || url.hash.substring(1));
        const code = params.get('code');
        
        if (code) {
            mainLogger.debug('PKCE code found, exchanging for session...');
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
                mainLogger.error('Error exchanging code for session:', error);
            } else {
                mainLogger.info('Session exchanged successfully:', data);
                // Redirect to dashboard or home after successful login
                window.location.href = '/dashboard';
            }
        } else {
             // ... existing implicit flow logic ...
             const access_token = params.get('access_token');
             const refresh_token = params.get('refresh_token');
             if (access_token && refresh_token) {
                 const { error } = await supabase.auth.setSession({ access_token, refresh_token });
                 if (error) mainLogger.error('Auth Error:', error.message);
                 else mainLogger.debug('Login Successful');
             }
        }
    } catch (e) {
        console.error('Error parsing deep link:', e);
    }
};

const setupDeepLinkListener = async () => {
  await CapacitorApp.addListener('appUrlOpen', async (data) => {
    await handleDeepLink(data.url);
  });

  const launchUrl = await CapacitorApp.getLaunchUrl();
  if (launchUrl && launchUrl.url) {
      // alert('Launch URL: ' + launchUrl.url);
      await handleDeepLink(launchUrl.url);
  }
};

setupDeepLinkListener();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
