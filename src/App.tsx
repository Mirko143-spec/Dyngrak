import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Navbar } from './components/layout/Navbar'
import Landing from './pages/Landing'
import Results from './pages/Results'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/resultat" element={<Results />} />
          <Route path="/profil" element={<Navigate to="/" replace />} />
          <Route path="/kalkylator" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
