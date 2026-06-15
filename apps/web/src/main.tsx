import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Lato, sans-serif',
            fontSize: '14px',
            color: '#0D2B45',
            background: '#fff',
            boxShadow: '0 4px 24px rgba(13,43,69,0.12)',
            border: '1px solid #E6F3FA',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
)
