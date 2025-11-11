import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    // 간단한 비밀번호 체크 (실제로는 환경변수 사용 권장)
    if (password === 'hshs0508') {
      navigate('/admin');
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">🗳️ 실시간 투표 시스템</h1>
        <p className="home-subtitle">행사 참여자 투표 시스템에 오신 것을 환영합니다</p>
        
        <div className="home-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/vote')}
          >
            <span className="btn-icon">📱</span>
            투표 참여하기
          </button>

          {!showPasswordInput ? (
            <button 
              className="btn btn-secondary"
              onClick={() => setShowPasswordInput(true)}
            >
              <span className="btn-icon">👤</span>
              관리자 로그인
            </button>
          ) : (
            <div className="admin-login">
              <input
                type="password"
                placeholder="관리자 비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
                className="password-input"
                autoFocus
              />
              <button 
                className="btn btn-admin"
                onClick={handleAdminAccess}
              >
                로그인
              </button>
            </div>
          )}
        </div>

        <div className="home-footer">
          <p>기본 관리자 비밀번호: <code>admin1234</code></p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
