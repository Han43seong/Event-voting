import { useState, useEffect } from 'react';
import { ref, set, onValue, remove } from 'firebase/database';
import { database } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function AdminPage() {
  const [currentPoll, setCurrentPoll] = useState(null);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    showResults: true
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const pollRef = ref(database, 'currentPoll');
    const unsubscribe = onValue(pollRef, (snapshot) => {
      const data = snapshot.val();
      setCurrentPoll(data);
    });

    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
    }
  };

  const removeOption = (index) => {
    if (newPoll.options.length > 2) {
      const updatedOptions = newPoll.options.filter((_, i) => i !== index);
      setNewPoll({ ...newPoll, options: updatedOptions });
    }
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question.trim()) {
      alert('질문을 입력해주세요');
      return;
    }

    const validOptions = newPoll.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      alert('최소 2개의 옵션이 필요합니다');
      return;
    }

    const pollData = {
      question: newPoll.question.trim(),
      options: validOptions.map(opt => ({ text: opt.trim(), votes: 0 })),
      isActive: true,
      showResults: newPoll.showResults,
      totalVotes: 0,
      createdAt: Date.now()
    };

    try {
      await set(ref(database, 'currentPoll'), pollData);
      alert('투표가 생성되었습니다');
      setNewPoll({ question: '', options: ['', ''], showResults: true });
    } catch (error) {
      console.error('Error creating poll:', error);
      alert(`투표 생성 실패: ${error.message}`);
    }
  };

  const togglePollStatus = async () => {
    if (!currentPoll) return;
    try {
      await set(ref(database, 'currentPoll/isActive'), !currentPoll.isActive);
    } catch (error) {
      console.error('Error toggling poll status:', error);
    }
  };

  const toggleResultsVisibility = async () => {
    if (!currentPoll) return;
    try {
      await set(ref(database, 'currentPoll/showResults'), !currentPoll.showResults);
    } catch (error) {
      console.error('Error toggling results visibility:', error);
    }
  };

  const handleResetPoll = async () => {
    if (!window.confirm('투표 결과를 초기화하시겠습니까? 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const updates = {
        totalVotes: 0,
      };

      if (currentPoll && currentPoll.options) {
        currentPoll.options.forEach((_, index) => {
          updates[`options/${index}/votes`] = 0;
        });
      }

      await set(ref(database, 'currentPoll'), {
        ...currentPoll,
        ...updates,
        voters: null,
      });

      alert('투표 결과가 초기화되었습니다.');
    } catch (error) {
      console.error('Error resetting poll votes:', error);
      alert('초기화 실패');
    }
  };

  const handleDeletePoll = async () => {
    if (!window.confirm('이 투표를 완전히 삭제하시겠습니까?')) {
      return;
    }

    try {
      await remove(ref(database, 'currentPoll'));
      alert('투표가 삭제되었습니다');
    } catch (error) {
      console.error('Error deleting poll:', error);
      alert('삭제 실패');
    }
  };

  const getChartData = () => {
    if (!currentPoll || !currentPoll.options) return [];
    return currentPoll.options.map((option, index) => ({
      name: option.text.length > 20 ? option.text.substring(0, 20) + '...' : option.text,
      votes: option.votes || 0,
      percentage: currentPoll.totalVotes > 0 ? ((option.votes || 0) / currentPoll.totalVotes * 100).toFixed(1) : 0
    }));
  };

  const chartData = getChartData();
  const COLORS = ['#F0F0F0', '#333333', '#666666', '#999999', '#CCCCCC', '#EEEEEE'];

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="card-ol w-full max-w-md text-center">
          <h2 className="text-xl font-mono text-ol-accent mb-8 tracking-widest">시스템 접속</h2>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="input-ol text-center mb-8 tracking-widest"
          />
          <button
            className="btn-ol w-full"
            onClick={handleLogin}
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-12 border-b border-ol-gray pb-6">
        <h1 className="text-3xl font-bold tracking-tighter">관리자 대시보드</h1>
        <button
          className="btn-ol text-xs"
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Create Poll Section */}
        <div className="card-ol h-fit">
          <h2 className="text-lg font-mono text-ol-accent mb-8 border-b border-ol-gray pb-2">새 투표 생성</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-mono text-ol-dim mb-2 uppercase tracking-wider">질문</label>
              <input
                type="text"
                placeholder="투표 질문을 입력하세요"
                value={newPoll.question}
                onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                className="input-ol"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-ol-dim mb-2 uppercase tracking-wider">옵션</label>
              {newPoll.options.map((option, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder={`옵션 ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="input-ol"
                  />
                  {newPoll.options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="text-ol-dim hover:text-ol-accent px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {newPoll.options.length < 6 && (
                <button
                  onClick={addOption}
                  className="text-xs font-mono text-ol-dim hover:text-ol-accent mt-4 flex items-center tracking-wider"
                >
                  + 옵션 추가
                </button>
              )}
            </div>

            <div className="flex items-center pt-2">
              <input
                id="show-results-checkbox"
                type="checkbox"
                checked={newPoll.showResults}
                onChange={(e) => setNewPoll({ ...newPoll, showResults: e.target.checked })}
                className="accent-ol-accent h-4 w-4 bg-transparent border-ol-gray rounded focus:ring-ol-accent"
              />
              <label htmlFor="show-results-checkbox" className="ml-3 block text-xs font-mono text-ol-dim">
                결과 즉시 공개
              </label>
            </div>

            <div className="pt-4">
              <button
                className="btn-ol-accent w-full"
                onClick={handleCreatePoll}
              >
                투표 생성
              </button>
            </div>
          </div>
        </div>

        {/* Current Poll Status Section */}
        <div className="space-y-8">
          {currentPoll ? (
            <div className="card-ol">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-lg font-mono text-ol-accent mb-1">상태</h2>
                  <span className={`inline-block px-2 py-1 text-xs font-mono font-bold border ${currentPoll.isActive ? 'border-ol-accent text-ol-accent' : 'border-red-500 text-red-500'}`}>
                    {currentPoll.isActive ? '진행 중' : '종료됨'}
                  </span>
                </div>
                <button
                  className={`px-4 py-2 text-xs font-mono border transition-colors ${currentPoll.isActive ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white' : 'border-ol-accent text-ol-accent hover:bg-ol-accent hover:text-black'}`}
                  onClick={togglePollStatus}
                >
                  {currentPoll.isActive ? '투표 종료' : '투표 재개'}
                </button>
              </div>

              <div className="mb-8">
                <h3 className="font-bold text-xl mb-2">{currentPoll.question}</h3>
                <p className="text-ol-dim text-xs font-mono">총 투표 수: {currentPoll.totalVotes}</p>
              </div>

              <div className="h-64 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#888' }} />
                    <Tooltip
                      cursor={{ fill: '#333' }}
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', color: '#fff' }}
                    />
                    <Bar dataKey="votes" fill="#F0F0F0" radius={[2, 2, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  className="btn-ol text-xs col-span-2"
                  onClick={toggleResultsVisibility}
                >
                  {currentPoll.showResults ? '결과 숨기기' : '결과 보기'}
                </button>
                <button
                  className="px-4 py-2 border border-ol-dim text-ol-dim hover:border-white hover:text-white text-xs font-mono transition-colors"
                  onClick={handleResetPoll}
                >
                  투표 초기화
                </button>
                <button
                  className="px-4 py-2 border border-red-900 text-red-900 hover:border-red-500 hover:text-red-500 text-xs font-mono transition-colors"
                  onClick={handleDeletePoll}
                >
                  투표 삭제
                </button>
              </div>
            </div>
          ) : (
            <div className="card-ol text-center py-20 border-dashed border-ol-gray">
              <p className="text-ol-dim font-mono text-sm">진행 중인 투표 없음</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
