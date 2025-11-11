import { useState, useEffect } from 'react';
import { ref, onValue, runTransaction } from 'firebase/database';
import { database } from '../firebase';
import './VotePage.css';

function VotePage() {
  const [poll, setPoll] = useState(null);
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 이미 투표했는지 확인
    const hasVoted = sessionStorage.getItem('hasVoted');
    if (hasVoted) {
      setVoted(true);
    }

    // 실시간으로 투표 데이터 감지
    const pollRef = ref(database, 'currentPoll');
    const unsubscribe = onValue(pollRef, (snapshot) => {
      const data = snapshot.val();
      setPoll(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleVote = async (optionIndex) => {
    if (voted || !poll || !poll.isActive) return;

    try {
      // 트랜잭션으로 투표 수 증가
      const optionRef = ref(database, `currentPoll/options/${optionIndex}/votes`);
      await runTransaction(optionRef, (currentVotes) => {
        return (currentVotes || 0) + 1;
      });

      // 총 투표 수 증가
      const totalRef = ref(database, 'currentPoll/totalVotes');
      await runTransaction(totalRef, (currentTotal) => {
        return (currentTotal || 0) + 1;
      });

      setVoted(true);
      setSelectedOption(optionIndex);
      sessionStorage.setItem('hasVoted', 'true');
    } catch (error) {
      console.error('투표 오류:', error);
      alert('투표 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <div className="vote-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>투표 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="vote-container">
        <div className="no-poll">
          <h2>🗳️</h2>
          <p>현재 진행 중인 투표가 없습니다.</p>
          <p className="sub-text">관리자가 투표를 시작할 때까지 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (!poll.isActive) {
    return (
      <div className="vote-container">
        <div className="no-poll">
          <h2>⏸️</h2>
          <p>투표가 종료되었습니다.</p>
        </div>
      </div>
    );
  }

  if (voted) {
    const totalVotes = poll.totalVotes || 0;
    
    return (
      <div className="vote-container">
        <div className="vote-card success">
          <div className="success-icon">✅</div>
          <h2>투표가 완료되었습니다!</h2>
          <p className="thank-you">참여해 주셔서 감사합니다.</p>
          
          {poll.showResults && (
            <div className="results">
              <h3>현재 투표 결과</h3>
              {poll.options.map((option, index) => {
                const votes = option.votes || 0;
                const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
                const isSelected = index === selectedOption;
                
                return (
                  <div key={index} className={`result-item ${isSelected ? 'selected' : ''}`}>
                    <div className="result-header">
                      <span className="option-text">{option.text}</span>
                      <span className="result-count">{votes}표 ({percentage}%)</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              <div className="total-votes">총 {totalVotes}명 참여</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="vote-container">
      <div className="vote-card">
        <h2 className="poll-question">{poll.question}</h2>
        <p className="poll-subtitle">하나를 선택해주세요</p>
        
        <div className="options">
          {poll.options.map((option, index) => (
            <button
              key={index}
              className="option-btn"
              onClick={() => handleVote(index)}
            >
              <span className="option-number">{index + 1}</span>
              <span className="option-text">{option.text}</span>
            </button>
          ))}
        </div>
        
        <div className="vote-footer">
          <p>💡 투표는 한 번만 가능합니다</p>
        </div>
      </div>
    </div>
  );
}

export default VotePage;
