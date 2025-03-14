import React, { useState, useEffect } from "react";
import "./story.css";

function App() {
  const [genre, setGenre] = useState("");
  const [story, setStory] = useState([]);
  const [inputWord, setInputWord] = useState("");
  const [score, setScore] = useState(0);
  const [chainLength, setChainLength] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [maxLength, setMaxLength] = useState(20);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);

  const genres = {
    "👽 Sci-Fi Horror": "sci-fi horror",
    "💀 Horror Comedy": "horror comedy",
    "💖 Romantic Drama": "romantic drama",
    "🚀 Space Opera": "epic space opera",
  };

  useEffect(() => {
    if (genre && timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver && genre) {
      endGame();
    }
  }, [timeLeft, gameOver, genre]);

  const endGame = () => {
    setGameOver(true);
    setShowScorePopup(true);
    setTimeout(() => {
      window.history.back();
    }, 3000);
  };

  const generateStoryPrompt = async (selectedGenre) => {
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mixtral-8x7b-32768",
            messages: [
              {
                role: "user",
                content: `Create a ${genres[selectedGenre]} story premise in one sentence (20 characters max). 
            End with a word starting with _ for continuation. Example: 'In the haunted spaceship, the crew heard _'`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const prompt = data.choices[0].message.content;
      setCurrentPrompt(prompt);
      setStory([prompt]);
      setMaxLength(20);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const extendStory = async (word) => {
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mixtral-8x7b-32768",
            messages: [
              {
                role: "user",
                content: `Continue this ${genre} story: "${story.join(
                  " "
                )} ${word}". 
              Create one suspenseful sentence (${maxLength} chars max). Maintain theme. 
              End with _ for next word starting with [LAST_LETTER].`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const newSentence = data.choices[0].message.content;
      setStory((prev) => [...prev, word, newSentence]);
      setChainLength((prev) => prev + 1);
      setMaxLength((prev) => Math.max(10, prev - 2));

      // Award bonus points for longer chains
      const basePoints = newSentence.toLowerCase().includes(genre.toLowerCase())
        ? 10
        : 5;
      const chainBonus = Math.floor(chainLength / 3) * 2; // Bonus points for every 3 links
      setScore((prev) => prev + basePoints + chainBonus);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleGenreSelect = async (selectedGenre) => {
    setGenre(selectedGenre);
    setTimeLeft(60);
    await generateStoryPrompt(selectedGenre);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputWord || gameOver) return;

    if (story.length > 1) {
      const lastLetter = story[story.length - 1].slice(-2, -1).toLowerCase();
      if (!inputWord.toLowerCase().startsWith(lastLetter)) {
        alert(`Word must start with ${lastLetter.toUpperCase()}!`);
        return;
      }
    }

    // Length validation
    if (inputWord.length > maxLength) {
      alert(`Keep words under ${maxLength} characters!`);
      return;
    }

    await extendStory(inputWord);
    setInputWord("");
  };

  const getLastLetter = () => {
    return story.length > 0
      ? story[story.length - 1].slice(-2, -1).toUpperCase()
      : "";
  };

  return (
    <div
      className={`App ${
        genre ? genre.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() : ""
      }`}
    >
      <div className="score-timer">
        <div className="score">
          🌟 Score: {score} | 🔗 Chain: {chainLength} | 📏 Max: {maxLength}
        </div>
        {genre && (
          <div className={`timer ${timeLeft <= 10 ? "timer-warning" : ""}`}>
            ⏱️ {timeLeft}s
          </div>
        )}
      </div>

      {!genre ? (
        <div className="genre-select">
          <h1>📖 Daily Story Chain</h1>
          <div className="genre-grid">
            {Object.keys(genres).map((g) => (
              <button
                key={g}
                className="genre-btn"
                onClick={() => handleGenreSelect(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="game-container">
          <h2>{genre}</h2>
          <div className="story-box">
            {story.map((line, index) => (
              <p key={index} className="story-line">
                {line.replace(/_/g, "")}
              </p>
            ))}
          </div>

          <div className="hint">
            {story.length > 0 &&
              `Next word must start with: ${getLastLetter()}`}
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder={`Enter word (max ${maxLength} chars)...`}
              maxLength={maxLength}
              autoFocus
              disabled={gameOver}
            />
            <button type="submit" className="submit-btn" disabled={gameOver}>
              🚀 Continue Story
            </button>
          </form>
        </div>
      )}

      {showScorePopup && (
        <div className="score-popup-overlay">
          <div className="score-popup">
            <h2>Time's Up!</h2>
            <div className="final-score">
              <span className="trophy">📖</span>
              Final Score: {score}
              <span className="trophy">🏆</span>
            </div>
            <p>Story Length: {chainLength} words</p>
            <p>Returning to previous page...</p>
          </div>
        </div>
      )}

      {/* Add CSS for new components */}
      <style jsx>{`
        .score-timer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          width: 100%;
        }

        .timer {
          font-weight: bold;
          font-size: 1.2rem;
          background-color: rgba(0, 0, 0, 0.2);
          padding: 5px 10px;
          border-radius: 10px;
        }

        .timer-warning {
          color: #ff4136;
          animation: pulse 1s infinite;
          background-color: rgba(255, 65, 54, 0.2);
          font-weight: bold;
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }

        .score-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .score-popup {
          background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          animation: popIn 0.5s ease-out;
          max-width: 90%;
          width: 400px;
          color: white;
        }

        @keyframes popIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .final-score {
          font-size: 2rem;
          font-weight: bold;
          margin: 20px 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .trophy {
          font-size: 2.5rem;
          margin: 0 10px;
        }

        .hint {
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 12px;
          font-weight: bold;
        }

        input:disabled,
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default App;
