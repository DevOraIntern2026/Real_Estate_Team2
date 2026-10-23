import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import '@/styles/index.css'
import App from '@/app/App'
// import { installUnauthorizedRedirect } from "./features/dashboard/api/session";

const queryClient = new QueryClient()
// installUnauthorizedRedirect("/login"); 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  </StrictMode>,
)
