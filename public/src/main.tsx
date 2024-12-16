import { StrictMode } from 'react'
import './index.css'
import "leaflet/dist/leaflet.css";
import 'react-toastify/dist/ReactToastify.css';
import { createRoot } from 'react-dom/client'
import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import store from './stores'
import { ThemeProvider } from './components/theme/theme-provider'
import { router } from './configs/route'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <CookiesProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </ThemeProvider>
      </CookiesProvider>
    </Provider>
  </StrictMode>
)
