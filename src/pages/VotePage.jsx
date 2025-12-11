import { useState, useEffect } from 'react';
import { ref, onValue, runTransaction } from 'firebase/database';
import { database } from '../firebase';

function VotePage() {
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
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
              setSelectedOption(null);
            }
          } catch (e) {
            // Invalid saved data, clear it
            localStorage.removeItem('votedOption');
            setVotedOption(null);
            setSelectedOption(null);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectOption = (index) => {
    if (votedOption !== null) return;
    setSelectedOption(index);
  };

  const handleConfirmVote = async () => {
    if (selectedOption === null || votedOption !== null || !poll) return;

    const pollRef = ref(database, 'currentPoll');

    try {
      await runTransaction(pollRef, (currentData) => {
        if (currentData) {
          if (!currentData.options[selectedOption].votes) {
            currentData.options[selectedOption].votes = 0;
          }
          currentData.options[selectedOption].votes++;
          currentData.totalVotes++;

          // Record voter (simple IP-like check or just count)
          if (!currentData.voters) currentData.voters = {};
          const voterId = Math.random().toString(36).substr(2, 9);
          currentData.voters[voterId] = selectedOption;
        }
        return currentData;
      });

      setVotedOption(selectedOption);
      // Save vote with poll ID to prevent confusion between different polls
      localStorage.setItem('votedOption', JSON.stringify({
        pollId: poll.createdAt,
        optionIndex: selectedOption
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
            const hasVoted = votedOption !== null;
            const isSelected = hasVoted ? votedOption === index : selectedOption === index;
            const percentage = poll.totalVotes > 0
              ? Math.round((option.votes / poll.totalVotes) * 100)
              : 0;

            return (
              <div key={index} className="relative group">
                {hasVoted ? (
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
                  // User hasn't voted yet - Show voting buttons (Selection Mode)
                  <button
                    onClick={() => handleSelectOption(index)}
                    className={`w-full text-left p-6 border transition-all duration-300 group ${isSelected
                        ? 'border-ol-accent bg-ol-accent/10 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                        : 'border-ol-dim hover:border-ol-accent hover:bg-ol-accent/5'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-lg transition-colors ${isSelected ? 'text-ol-accent font-bold' : 'group-hover:text-ol-accent'}`}>
                        {option.text}
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'border-ol-accent' : 'border-ol-dim'}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-ol-accent" />}
                      </div>
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Area */}
        {votedOption === null ? (
          <div className="mt-12 pt-6 border-t border-ol-gray/30 flex justify-center">
            <button
              onClick={handleConfirmVote}
              disabled={selectedOption === null}
              className={`w-full md:w-auto px-12 py-4 font-mono font-bold text-lg tracking-wider transition-all duration-300 ${selectedOption !== null
                  ? 'bg-ol-accent text-black hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                  : 'bg-ol-dim/20 text-ol-dim cursor-not-allowed'
                }`}
            >
              {selectedOption !== null ? '투표 확인' : '옵션을 선택하세요'}
            </button>
          </div>
        ) : (
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
