import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import VotePage from './pages/VotePage';
import HomePage from './pages/HomePage';

export default App;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-neo-yellow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <nav className="mb-8 flex justify-between items-center bg-neo-white border-3 border-neo-black shadow-neo p-4">
            <a href="/" className="text-2xl font-black uppercase hover:text-neo-pink transition-colors">
              Event Voting
            </a>
            <div className="space-x-4">
              <a href="/vote" className="font-bold hover:underline decoration-2 underline-offset-4">Vote</a>
              <a href="/admin" className="font-bold hover:underline decoration-2 underline-offset-4">Admin</a>
            </div>
          </nav>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/vote" element={<VotePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
