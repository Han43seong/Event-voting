import { useState, useEffect } from 'react';
import { ref, set, onValue, remove } from 'firebase/database';
import { database } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

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
      const updates = {
        totalVotes: 0,
      };

      if (poll && poll.options) {
        poll.options.forEach((_, index) => {
          updates[`options/${index}/votes`] = 0;
        });
      }

      await set(ref(database, 'currentPoll'), {
        ...poll,
        ...updates,
        voters: null,
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

  const COLORS = ['#FF90E8', '#FFC900', '#00F0FF', '#93c5fd', '#fcd34d', '#fca5a5'];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tight bg-neo-black text-neo-white inline-block px-6 py-2 transform -rotate-1">
          🎛️ 관리자 대시보드
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 투표 생성 섹션 */}
        <div className="card-neo bg-neo-white">
          <h2 className="text-2xl font-black mb-6 border-b-3 border-neo-black pb-2">📝 새 투표 만들기</h2>

          <div className="mb-6">
            <label className="block font-bold mb-2">질문</label>
            <input
              type="text"
              placeholder="투표 질문을 입력하세요"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input-neo"
            />
          </div>

          <div className="mb-6">
            <label className="block font-bold mb-2">선택지 (최소 2개, 최대 6개)</label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`선택지 ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="input-neo"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="px-4 bg-red-500 text-white font-bold border-3 border-neo-black shadow-neo-sm hover:shadow-neo active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button onClick={addOption} className="mt-4 text-sm font-bold underline decoration-2 underline-offset-4 hover:text-neo-pink">
                ➕ 선택지 추가
              </button>
            )}
          </div>

          <div className="mb-8">
            <label className="flex items-center gap-3 font-bold cursor-pointer select-none">
              <div className={`w-6 h-6 border-3 border-neo-black flex items-center justify-center ${showResults ? 'bg-neo-black' : 'bg-white'}`}>
                {showResults && <span className="text-neo-white text-sm">✓</span>}
              </div>
              <input
                type="checkbox"
                checked={showResults}
                onChange={(e) => setShowResults(e.target.checked)}
                className="hidden"
              />
              <span>투표 후 참가자에게 결과 표시</span>
            </label>
          </div>

          <button onClick={createPoll} className="btn-neo w-full bg-neo-yellow hover:bg-neo-pink">
            🚀 투표 생성하기
          </button>
        </div>

        <div className="space-y-8">
          {/* 현재 투표 상태 */}
          {poll ? (
            <div className="card-neo bg-neo-white">
              <div className="flex justify-between items-start mb-6 border-b-3 border-neo-black pb-4">
                <h2 className="text-2xl font-black">📊 현재 투표</h2>
                <div className={`px-3 py-1 font-black border-2 border-neo-black ${poll.isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`}>
                  {poll.isActive ? '진행 중' : '종료됨'}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">{poll.question}</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-100 p-3 border-2 border-neo-black">
                    <span className="block text-xs font-bold text-gray-500">총 투표</span>
                    <span className="block text-xl font-black">{poll.totalVotes || 0}</span>
                  </div>
                  <div className="bg-gray-100 p-3 border-2 border-neo-black">
                    <span className="block text-xs font-bold text-gray-500">참여자</span>
                    <span className="block text-xl font-black">{voterCount}</span>
                  </div>
                  <div className="bg-gray-100 p-3 border-2 border-neo-black">
                    <span className="block text-xs font-bold text-gray-500">선택지</span>
                    <span className="block text-xl font-black">{poll.options.length}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={togglePoll}
                  className={`btn-neo text-sm py-2 px-2 ${poll.isActive ? 'bg-neo-pink' : 'bg-green-400'}`}
                >
                  {poll.isActive ? '⏸️ 투표 중지' : '▶️ 투표 시작'}
                </button>

                <button
                  onClick={toggleShowResults}
                  className="btn-neo bg-neo-cyan text-sm py-2 px-2"
                >
                  {poll.showResults ? '👁️ 결과 숨기기' : '👁️‍🗨️ 결과 표시'}
                </button>

                <button
                  onClick={resetVotes}
                  className="btn-neo bg-orange-400 text-sm py-2 px-2"
                >
                  🔄 기록 초기화
                </button>

                <button
                  onClick={resetPoll}
                  className="btn-neo bg-red-500 text-white text-sm py-2 px-2"
                >
                  🗑️ 투표 삭제
                </button>
              </div>
            </div>
          ) : (
            <div className="card-neo bg-gray-100 text-center py-12">
              <div className="text-6xl mb-4 grayscale opacity-50">📭</div>
              <p className="font-bold text-gray-500">현재 진행 중인 투표가 없습니다.</p>
              <p className="text-sm text-gray-400">왼쪽에서 새로운 투표를 만들어보세요!</p>
            </div>
          )}

          {/* 실시간 결과 */}
          {poll && (
            <div className="card-neo bg-neo-white">
              <h2 className="text-xl font-black mb-4">📈 실시간 결과</h2>

              <div className="h-64 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                    <YAxis tick={{ fontSize: 12, fontWeight: 'bold' }} />
                    <Tooltip
                      contentStyle={{
                        border: '3px solid #000',
                        boxShadow: '4px 4px 0px 0px #000',
                        fontWeight: 'bold'
                      }}
                    />
                    <Bar dataKey="votes" name="득표수">
                      {getChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={2} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {poll.options.map((option, index) => {
                  const votes = option.votes || 0;
                  const percentage = poll.totalVotes > 0 ? ((votes / poll.totalVotes) * 100).toFixed(1) : 0;

                  return (
                    <div key={index} className="flex justify-between items-center p-2 border-b-2 border-gray-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black w-6 text-center bg-neo-black text-neo-white rounded-full text-xs py-1">#{index + 1}</span>
                        <span className="font-bold text-sm">{option.text}</span>
                      </div>
                      <div className="text-sm font-mono font-bold">
                        {votes}표 ({percentage}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
