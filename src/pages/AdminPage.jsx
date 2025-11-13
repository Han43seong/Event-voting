import { useState, useEffect } from 'react';
import { ref, set, onValue, remove } from 'firebase/database';
import { database } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './AdminPage.css';

function AdminPage() {
  const [poll, setPoll] = useState(null);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [showResults, setShowResults] = useState(true);
  const [voterCount, setVoterCount] = useState(0);

  useEffect(() => {
    const pollRef = ref(database, 'currentPoll');
    const unsubscribe = onValue(pollRef, (snapshot) => {
      const data = snapshot.val();
      setPoll(data);

      // 투표자 수 계산
      if (data && data.voters) {
        const count = Object.keys(data.voters).length;
        setVoterCount(count);
      } else {
        setVoterCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const createPoll = async () => {
    if (!question.trim()) {
      alert('질문을 입력해주세요.');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      alert('최소 2개의 선택지를 입력해주세요.');
      return;
    }

    const newPoll = {
      question: question.trim(),
      options: validOptions.map(opt => ({
        text: opt.trim(),
        votes: 0
      })),
      isActive: true,
      showResults: showResults,
      totalVotes: 0,
      createdAt: Date.now()
    };

    try {
      await set(ref(database, 'currentPoll'), newPoll);
      alert('투표가 생성되었습니다!');
      setQuestion('');
      setOptions(['', '']);
    } catch (error) {
      console.error('투표 생성 오류:', error);
      alert('투표 생성 중 오류가 발생했습니다.');
    }
  };

  const togglePoll = async () => {
    if (!poll) return;
    
    try {
      await set(ref(database, 'currentPoll/isActive'), !poll.isActive);
    } catch (error) {
      console.error('투표 상태 변경 오류:', error);
    }
  };

  const toggleShowResults = async () => {
    if (!poll) return;
    
    try {
      await set(ref(database, 'currentPoll/showResults'), !poll.showResults);
    } catch (error) {
      console.error('결과 표시 변경 오류:', error);
    }
  };

  const resetVotes = async () => {
    if (!window.confirm('투표 기록만 초기화하시겠습니까? (투표 수와 투표자 기록이 리셋됩니다)')) {
      return;
    }

    try {
      // 투표 수 초기화
      const updates = {
        totalVotes: 0,
      };

      // 각 선택지의 투표 수 초기화
      if (poll && poll.options) {
        poll.options.forEach((_, index) => {
          updates[`options/${index}/votes`] = 0;
        });
      }

      await set(ref(database, 'currentPoll'), {
        ...poll,
        ...updates,
        voters: null, // 투표자 기록 삭제
      });

      alert('투표 기록이 초기화되었습니다.');
    } catch (error) {
      console.error('투표 기록 초기화 오류:', error);
      alert('초기화 중 오류가 발생했습니다.');
    }
  };

  const resetPoll = async () => {
    if (!window.confirm('투표를 완전히 삭제하시겠습니까? 모든 투표 데이터가 삭제됩니다.')) {
      return;
    }

    try {
      await remove(ref(database, 'currentPoll'));
      alert('투표가 삭제되었습니다.');
    } catch (error) {
      console.error('투표 삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const getChartData = () => {
    if (!poll || !poll.options) return [];
    
    return poll.options.map((option, index) => ({
      name: option.text.length > 20 ? option.text.substring(0, 20) + '...' : option.text,
      votes: option.votes || 0,
      percentage: poll.totalVotes > 0 ? ((option.votes || 0) / poll.totalVotes * 100).toFixed(1) : 0
    }));
  };

  const COLORS = ['#a78bfa', '#f0abfc', '#86efac', '#93c5fd', '#fcd34d', '#fca5a5'];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🎛️ 관리자 대시보드</h1>
      </div>

      <div className="admin-content">
        {/* 투표 생성 섹션 */}
        <div className="admin-card">
          <h2>📝 새 투표 만들기</h2>
          
          <div className="form-group">
            <label>질문</label>
            <input
              type="text"
              placeholder="투표 질문을 입력하세요"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input-text"
            />
          </div>

          <div className="form-group">
            <label>선택지 (최소 2개, 최대 6개)</label>
            {options.map((option, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  placeholder={`선택지 ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="input-text"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="btn-remove"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            
            {options.length < 6 && (
              <button onClick={addOption} className="btn-add">
                ➕ 선택지 추가
              </button>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showResults}
                onChange={(e) => setShowResults(e.target.checked)}
              />
              <span>투표 후 참가자에게 결과 표시</span>
            </label>
          </div>

          <button onClick={createPoll} className="btn btn-create">
            🚀 투표 생성하기
          </button>
        </div>

        {/* 현재 투표 상태 */}
        {poll && (
          <div className="admin-card">
            <div className="card-header">
              <h2>📊 현재 투표</h2>
              <div className={`status-badge ${poll.isActive ? 'active' : 'inactive'}`}>
                {poll.isActive ? '진행 중' : '종료됨'}
              </div>
            </div>

            <div className="poll-info">
              <h3>{poll.question}</h3>
              <div className="poll-stats">
                <div className="stat-item">
                  <span className="stat-label">총 투표 수</span>
                  <span className="stat-value">{poll.totalVotes || 0}표</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">실제 투표자 수</span>
                  <span className="stat-value">{voterCount}명</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">선택지 수</span>
                  <span className="stat-value">{poll.options.length}개</span>
                </div>
              </div>
            </div>

            <div className="control-buttons">
              <button
                onClick={togglePoll}
                className={`btn ${poll.isActive ? 'btn-stop' : 'btn-start'}`}
              >
                {poll.isActive ? '⏸️ 투표 중지' : '▶️ 투표 시작'}
              </button>

              <button
                onClick={toggleShowResults}
                className="btn btn-toggle"
              >
                {poll.showResults ? '👁️ 결과 숨기기' : '👁️‍🗨️ 결과 표시'}
              </button>

              <button
                onClick={resetVotes}
                className="btn btn-warning"
              >
                🔄 투표 기록 초기화
              </button>

              <button
                onClick={resetPoll}
                className="btn btn-reset"
              >
                🗑️ 투표 삭제
              </button>
            </div>
          </div>
        )}

        {/* 실시간 결과 */}
        {poll && (
          <div className="admin-card results-card">
            <h2>📈 실시간 투표 결과</h2>
            
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="votes" name="득표수">
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="results-table">
              {poll.options.map((option, index) => {
                const votes = option.votes || 0;
                const percentage = poll.totalVotes > 0 ? ((votes / poll.totalVotes) * 100).toFixed(1) : 0;
                
                return (
                  <div key={index} className="result-row">
                    <div className="result-info">
                      <span className="result-rank">#{index + 1}</span>
                      <span className="result-option">{option.text}</span>
                    </div>
                    <div className="result-stats">
                      <span className="result-votes">{votes}표</span>
                      <span className="result-percentage">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!poll && (
          <div className="admin-card empty-state">
            <h2>📭</h2>
            <p>현재 진행 중인 투표가 없습니다.</p>
            <p className="sub-text">위에서 새로운 투표를 만들어보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
