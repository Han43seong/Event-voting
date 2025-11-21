import { useState, useEffect } from 'react';
import { ref, onValue, runTransaction } from 'firebase/database';
import { database } from '../firebase';

function VotePage() {
  const [poll, setPoll] = useState(null);
  const [votedOption, setVotedOption] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pollRef = ref(database, 'currentPoll');
    const unsubscribe = onValue(pollRef, (snapshot) => {
      const data = snapshot.val();
      setPoll(data);
      setLoading(false);

      // Check local storage for previous vote, but only for this specific poll
      if (data && data.createdAt) {
        const savedVoteData = localStorage.getItem('votedOption');
        if (savedVoteData) {
          try {
            const { pollId, optionIndex } = JSON.parse(savedVoteData);
            // Only restore vote if it's for the current poll
            if (pollId === data.createdAt) {
              setVotedOption(optionIndex);
            } else {
              // Clear old vote data if it's for a different poll
              setVotedOption(null);
            }
          } catch (e) {
            // Invalid saved data, clear it
            localStorage.removeItem('votedOption');
            setVotedOption(null);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleVote = async (index) => {
    if (votedOption !== null || !poll) return;

    const pollRef = ref(database, 'currentPoll');

    try {
      await runTransaction(pollRef, (currentData) => {
        if (currentData) {
          if (!currentData.options[index].votes) {
            currentData.options[index].votes = 0;
          }
          currentData.options[index].votes++;
          currentData.totalVotes++;

          // Record voter (simple IP-like check or just count)
          if (!currentData.voters) currentData.voters = {};
          const voterId = Math.random().toString(36).substr(2, 9);
          currentData.voters[voterId] = index;
        }
        return currentData;
      });

      setVotedOption(index);
      // Save vote with poll ID to prevent confusion between different polls
      localStorage.setItem('votedOption', JSON.stringify({
        pollId: poll.createdAt,
        optionIndex: index
      }));
    } catch (error) {
      console.error("투표 중 오류 발생:", error);
      alert("투표 처리에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-ol-accent font-mono animate-pulse">시스템 로딩 중...</div>
      </div>
    );
  }

  if (!poll || !poll.isActive) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="card-ol text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-ol-dim">진행 중인 투표가 없습니다</h2>
          <p className="text-ol-dim/70 font-mono text-sm">새로운 투표가 시작될 때까지 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="card-ol mb-8">
        <div className="flex items-center justify-between mb-8 border-b border-ol-gray pb-4">
          <span className="font-mono text-xs text-ol-accent tracking-widest">실시간 투표</span>
          <span className="font-mono text-xs text-ol-dim">총 투표 수: {poll.totalVotes}</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center leading-tight">
          {poll.question}
        </h2>

        <div className="space-y-4">
          {poll.options.map((option, index) => {
            const isSelected = votedOption === index;
            const percentage = poll.totalVotes > 0
              ? Math.round((option.votes / poll.totalVotes) * 100)
              : 0;

            return (
              <div key={index} className="relative group">
                {votedOption !== null ? (
                  // User has voted - show results based on showResults setting
                  poll.showResults ? (
                    // showResults is ON - Display percentages
                    <div className={`relative overflow-hidden border ${isSelected ? 'border-ol-accent' : 'border-ol-gray'} p-4 transition-all duration-500`}>
                      <div
                        className="absolute top-0 left-0 h-full bg-ol-gray/30 transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="relative flex justify-between items-center z-10">
                        <span className={`font-medium ${isSelected ? 'text-ol-accent' : 'text-ol-text'}`}>
                          {option.text}
                        </span>
                        <span className="font-mono font-bold">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    // showResults is OFF - Just show selected option
                    <div className={`relative overflow-hidden border ${isSelected ? 'border-ol-accent' : 'border-ol-gray'} p-6 transition-all duration-500`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-lg ${isSelected ? 'text-ol-accent font-medium' : 'text-ol-text'}`}>
                          {option.text}
                        </span>
                        {isSelected && (
                          <span className="text-ol-accent text-sm font-mono">✓ 선택함</span>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  // User hasn't voted yet - Show voting buttons
                  <button
                    onClick={() => handleVote(index)}
                    disabled={votedOption !== null}
                    className={`w-full text-left p-6 border border-ol-dim hover:border-ol-accent hover:bg-ol-accent/5 transition-all duration-300 group ${votedOption !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg group-hover:text-ol-accent transition-colors">{option.text}</span>
                      <span className="text-ol-dim group-hover:text-ol-accent transition-colors text-xl">→</span>
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {votedOption !== null && (
          <div className="mt-8 text-center animate-fade-in">
            <p className="text-ol-accent font-mono text-sm tracking-widest">
              투표가 완료되었습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VotePage;
