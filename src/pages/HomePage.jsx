import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      navigate('/admin');
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="card-neo w-full max-w-2xl text-center bg-neo-pink">
        <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tighter">
          🗳️ Event Voting
        </h1>
        <p className="text-xl font-bold mb-8 bg-neo-white inline-block px-4 py-1 border-3 border-neo-black shadow-neo-sm transform -rotate-1">
          실시간 행사 투표 시스템
        </p>

        <div className="space-y-6">
          <button
            className="btn-neo w-full md:w-auto bg-neo-cyan text-2xl py-4 px-12 hover:bg-neo-white"
            onClick={() => navigate('/vote')}
          >
            <span className="mr-2">📱</span>
            투표 참여하기
          </button>

          <div className="mt-12 pt-8 border-t-3 border-neo-black border-dashed">
            {!showPasswordInput ? (
              <button
                className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-neo-white transition-colors"
                onClick={() => setShowPasswordInput(true)}
              >
                관리자 로그인
              </button>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center animate-fade-in">
                <input
                  type="password"
                  placeholder="관리자 비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
                  className="input-neo max-w-xs"
                  autoFocus
                />
                <button
                  className="btn-neo bg-neo-black text-neo-white hover:bg-gray-800 py-3 px-6 text-base"
                  onClick={handleAdminAccess}
                >
                  로그인
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default HomePage;
