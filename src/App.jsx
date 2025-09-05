import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [finished, setFinished] = useState(false);
  const [name, setName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef(null);

  // Fetch leaderboard on mount
  useEffect(() => {
    fetch('/api/save-score')
      .then(res => res.json())
      .then(data => setLeaderboard(data.top10 || []));
  }, []);

  function startGame() {
    setStarted(true);
    setCount(0);
    setTimeLeft(5);
    setFinished(false);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setFinished(true);
          setStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleClick() {
    if (started && !finished) setCount(c => c + 1);
  }

  function handleReset() {
    setCount(0);
    setTimeLeft(5);
    setStarted(false);
    setFinished(false);
    clearInterval(timerRef.current);
  }

  async function handleSave() {
    if (!name) {
      alert('Please enter your name!');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/save-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score: count }),
    });
    const data = await res.json();
    setLeaderboard(data.top10 || []);
    setSaving(false);
  }

  return (
    <div style={{ textAlign: 'center', marginTop: 40 }}>
      <h2>Speed Counter</h2>
      <p>Click as many times as you can in 5 seconds!</p>
      <div style={{ fontSize: 24, margin: '16px 0' }}>Time left: {timeLeft}s</div>
      <button
        onClick={started ? handleClick : startGame}
        disabled={finished}
        style={{ padding: '16px 32px', fontSize: 20, margin: '12px 0' }}
      >
        {started ? 'Click me!' : 'Start'}
      </button>
      <div style={{ fontSize: 24, margin: '16px 0' }}>Clicks: {count}</div>
      {finished && (
        <div style={{ marginTop: 12 }}>
          <input
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ marginRight: 8, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={handleReset} style={{ marginLeft: 8 }}>
            Try Again
          </button>
        </div>
      )}
      <h3 style={{ marginTop: 40 }}>Top 10 Leaderboard</h3>
      <ol style={{ textAlign: 'left', maxWidth: 300, margin: '0 auto' }}>
        {leaderboard.map((entry, i) => (
          <li key={i}>
            {entry.name}: {entry.score}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default App;
 