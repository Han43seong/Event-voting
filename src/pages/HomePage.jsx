import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin');
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] relative z-10">
      {/* Hero Section */}
      <div className="w-full max-w-4xl text-center mb-20">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
          미래를 결정하는<br />
          <span className="text-ol-accent">새로운 투표 시스템</span>
        </h1>
        <p className="text-xl text-ol-dim mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          투명하고 공정한 의사결정을 위한 차세대 플랫폼.<br />
          실시간 데이터 시각화와 함께하는 새로운 경험을 만나보세요.
        </p>
        <button
          className="btn-ol-accent text-lg px-10 py-4"
          onClick={() => navigate('/vote')}
        >
          투표 시작하기
        </button>
      </div>

      {/* Admin Access Section */}
      <div className="fixed bottom-8 right-8 z-50">
        {!showPasswordInput ? (
          <button
            className="text-xs font-mono text-ol-dim hover:text-ol-accent transition-colors opacity-50 hover:opacity-100"
            onClick={() => setShowPasswordInput(true)}
          >
            관리자 접속
          </button>
        ) : (
          <div className="card-ol p-4 min-w-[300px] animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono text-ol-accent">시스템 접속</span>
              <button
                onClick={() => setShowPasswordInput(false)}
                className="text-ol-dim hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
                className="input-ol text-center tracking-widest"
                autoFocus
              />
              <button
                className="btn-ol w-full text-xs"
                onClick={handleAdminAccess}
              >
                로그인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
