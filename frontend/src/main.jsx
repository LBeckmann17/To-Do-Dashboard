import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { TasksProvider } from './context/TasksContext'
import { ShoppingProvider } from './context/ShoppingContext'
import { CleaningProvider } from './context/CleaningContext'
import App from './App'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TasksProvider>
        <ShoppingProvider>
          <CleaningProvider>
            <App />
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: 'var(--elevated)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontFamily: 'var(--sans)',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </CleaningProvider>
        </ShoppingProvider>
      </TasksProvider>
    </BrowserRouter>
  </StrictMode>
)
