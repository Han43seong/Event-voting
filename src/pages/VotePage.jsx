import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue, runTransaction, get } from 'firebase/database';
import { database } from '../firebase';
import { generateDeviceId } from '../utils/fingerprint';

function VotePage() {
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    const initializeVoteCheck = async () => {
      try {
        const id = await generateDeviceId();
        setDeviceId(id);

        const voterRef = ref(database, `currentPoll/voters/${id}`);
        const snapshot = await get(voterRef);

        if (snapshot.exists()) {
          setVoted(true);
        }
      } catch (error) {
        console.error('투표 확인 오류:', error);
      }
    };

    initializeVoteCheck();

    const pollRef = ref(database, 'currentPoll');
    const unsubscribe = onValue(pollRef, (snapshot) => {
      const data = snapshot.val();
      setPoll(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleVote = async (optionIndex) => {
    if (voted || !poll || !poll.isActive || !deviceId) return;

    try {
      const voterRef = ref(database, `currentPoll/voters/${deviceId}`);
      const voterSnapshot = await get(voterRef);

      if (voterSnapshot.exists()) {
        alert('이미 투표하셨습니다. 투표는 한 번만 가능합니다.');
        setVoted(true);
        return;
      }

      const optionRef = ref(database, `currentPoll/options/${optionIndex}/votes`);
      await runTransaction(optionRef, (currentVotes) => {
        return (currentVotes || 0) + 1;
      });

      const totalRef = ref(database, 'currentPoll/totalVotes');
      await runTransaction(totalRef, (currentTotal) => {
        return (currentTotal || 0) + 1;
      });

      await runTransaction(voterRef, () => {
        return true;
      });

      setVoted(true);
      setSelectedOption(optionIndex);
    } catch (error) {
      console.error('투표 오류:', error);
      alert('투표 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-neo-black border-t-neo-pink"></div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="card-neo text-center max-w-2xl mx-auto mt-10">
        <div className="text-6xl mb-4">🗳️</div>
        <h2 className="text-3xl font-black mb-4">현재 진행 중인 투표가 없습니다</h2>
        <p className="text-xl mb-8">관리자가 투표를 생성할 때까지 기다려주세요.</p>
        <button
          className="btn-neo bg-neo-cyan hover:bg-neo-white"
          onClick={() => navigate('/')}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  if (!poll.isActive) {
    return (
      <div className="card-neo text-center max-w-2xl mx-auto mt-10 bg-gray-100">
        <div className="text-6xl mb-4">⏸️</div>
        <h2 className="text-3xl font-black mb-4">투표가 종료되었습니다</h2>
        <p className="text-xl mb-8">관리자가 투표를 다시 시작할 때까지 기다려주세요.</p>
        <button
          className="btn-neo bg-neo-cyan hover:bg-neo-white"
          onClick={() => navigate('/')}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  if (voted) {
    const totalVotes = poll.totalVotes || 0;

    return (
      <div className="card-neo max-w-3xl mx-auto mt-10 bg-neo-white">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">✅</div>
          <h2 className="text-3xl font-black mb-2">투표가 완료되었습니다!</h2>
          <p className="text-xl font-bold">참여해 주셔서 감사합니다.</p>
        </div>

        {poll.showResults && (
          <div className="space-y-6">
            <h3 className="text-2xl font-black border-b-3 border-neo-black pb-2">현재 투표 결과</h3>
            {poll.options.map((option, index) => {
              const votes = option.votes || 0;
              const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
              const isSelected = index === selectedOption;

              return (
                <div key={index} className={`relative p-4 border-3 border-neo-black ${isSelected ? 'bg-neo-yellow' : 'bg-white'}`}>
                  <div className="flex justify-between items-end mb-2 relative z-10">
                    <span className="text-xl font-bold">{option.text}</span>
                    <span className="text-lg font-black">{votes}표 ({percentage}%)</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 border-2 border-neo-black">
                    <div
                      className="h-full bg-neo-pink transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  {isSelected && <div className="absolute top-2 right-2 text-xs font-black bg-neo-black text-neo-white px-2 py-1">MY VOTE</div>}
                </div>
              );
            })}
            <div className="text-right font-black text-xl mt-4">총 {totalVotes}명 참여</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card-neo max-w-3xl mx-auto mt-10">
      <h2 className="text-3xl md:text-4xl font-black mb-2 text-center">{poll.question}</h2>
      <p className="text-xl text-center mb-8 font-bold bg-neo-yellow inline-block mx-auto px-4 border-2 border-neo-black transform -rotate-1">하나를 선택해주세요</p>

      <div className="grid gap-4">
        {poll.options.map((option, index) => (
          <button
            key={index}
            className="group relative w-full text-left p-6 bg-white border-3 border-neo-black shadow-neo hover:shadow-neo-lg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm"
            onClick={() => handleVote(index)}
          >
            <div className="flex items-center">
              <span className="flex items-center justify-center w-10 h-10 bg-neo-black text-neo-white font-black text-xl mr-4 group-hover:bg-neo-pink group-hover:text-neo-black transition-colors">
                {index + 1}
              </span>
              <span className="text-xl font-bold group-hover:underline decoration-4 underline-offset-4 decoration-neo-pink">{option.text}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="font-bold text-sm bg-gray-200 inline-block px-3 py-1 border-2 border-neo-black">💡 투표는 한 번만 가능합니다</p>
      </div>
    </div>
  );
}

export default VotePage;
