import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import VotePage from './pages/VotePage';
import HomePage from './pages/HomePage';
import Background3D from './components/Background3D';

export default App;

function App() {
    return (
        <Router>
            <div className="min-h-screen text-ol-text font-sans flex flex-col relative overflow-hidden">
                <Background3D />

                <header className="fixed top-0 w-full z-50 border-b border-ol-gray/30 backdrop-blur-sm bg-ol-base/50">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                        <a href="/" className="text-2xl font-bold tracking-tighter hover:text-ol-accent transition-colors">
                            WINTEK
                        </a>
                        <nav className="hidden md:flex space-x-8">
                            <a href="/" className="nav-link">{'\uD648'}</a>
                            <a href="/vote" className="nav-link">{'\uD22C\uD45C\uD558\uAE30'}</a>
                            <a href="/admin" className="nav-link">{'\uAD00\uB9AC\uC790'}</a>
                        </nav>
                    </div>
                </header>

                <main className="flex-grow pt-24 px-6 relative z-10">
                    <div className="max-w-7xl mx-auto w-full h-full">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/vote" element={<VotePage />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </main>

                <footer className="border-t border-ol-gray/30 backdrop-blur-sm bg-ol-base/50 py-8 mt-auto relative z-10">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <p className="text-xs font-mono text-ol-dim uppercase tracking-widest">
                            ? 2025 WINTEK. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </Router>
    );
}
