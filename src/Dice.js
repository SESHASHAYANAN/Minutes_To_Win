import React, { useState, useEffect } from "react";
import "./styles.css";

const CATEGORY_EMOJIS = {
  "🎬 Cinema": "🎥",
  "🎮 Games": "🕹️",
  "📚 Studies": "📖",
  "🔬 Science": "🧪",
  "🍳 Kitchen": "🍳",
  "🎨 Art": "🎨",
  "🏛 History": "🏺",
  "🎵 Music": "🎧",
  "🕹 Retro": "👾",
  "🌍 Travel": "✈️",
};

function App() {
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [question, setQuestion] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [emojiEffect, setEmojiEffect] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);

  const fetchQuestion = async (category = "") => {
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
                content: `Generate a Reddit treasure hunt question with answer link. 
            Include: question, 5 emojis, 3 clues, answer URL, type, category.
            Format as JSON: {question: "", emojis: "", clues: [], answer: "", type: "", category: ""}`,
              },
            ],
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();
      const q = JSON.parse(data.choices[0].message.content);
      setQuestion(q);
      setHintsUsed(0);
      setShowAnswer(false);
      setAnswer("");
      setFeedback("");
      setEmojiEffect(CATEGORY_EMOJIS[category] || "");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (selectedCategory) fetchQuestion(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    // Timer countdown
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      endGame();
    }
  }, [timeLeft, gameOver]);

  const endGame = () => {
    setGameOver(true);
    setShowScorePopup(true);
    // Show score popup for 3 seconds before navigating back
    setTimeout(() => {
      window.history.back();
    }, 3000);
  };

  const validateAnswer = (userAnswer) => {
    const cleanAnswer = userAnswer.toLowerCase().trim();
    return cleanAnswer === question.answer.toLowerCase();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateAnswer(answer)) {
      const points = 10 - hintsUsed * 3;
      setScore((prev) => prev + points);
      setFeedback(`🎉 Correct! +${points}pts`);

      // Instead of waiting to fetch a new question, immediately fetch
      // to maximize gameplay in limited time
      fetchQuestion(selectedCategory);
    } else {
      setFeedback("❌ Incorrect. Try again!");
    }
  };

  return (
    <div className="App">
      <div className="emoji-effect">{emojiEffect}</div>

      <header className="header">
        <h1>
          Reddit Treasure Hunt <span className="pirate">🏴‍☠️</span>
        </h1>
        <div className="score-timer">
          <div className="score">💰 Score: {score}</div>
          <div className={`timer ${timeLeft <= 10 ? "timer-warning" : ""}`}>
            ⏱️ {timeLeft}s
          </div>
        </div>
      </header>

      <div className="category-grid">
        {Object.entries(CATEGORY_EMOJIS).map(([category, emoji]) => (
          <button
            key={category}
            className={`category-btn ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            <span className="emoji">{emoji}</span>
            {category.split(" ")[1]}
          </button>
        ))}
      </div>

      {question && (
        <div className="question-card">
          <div className="question-header">
            <span className="category">{question.category}</span>
            <span className="type">{question.type}</span>
          </div>

          <div className="question-content">
            <h2>{question.question}</h2>
            <div className="emoji-hint">{question.emojis}</div>

            <div className="hint-section">
              {question.clues.slice(0, hintsUsed).map((clue, i) => (
                <div key={i} className="hint">
                  🔍 {clue}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter answer..."
                autoFocus
              />
              <div className="action-buttons">
                <button
                  type="button"
                  className="hint-btn"
                  onClick={() => setHintsUsed((prev) => Math.min(prev + 1, 3))}
                >
                  🧩 Hint ({3 - hintsUsed} left)
                </button>
                <button type="submit">🚀 Submit</button>
                <button
                  type="button"
                  className="answer-btn"
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  {showAnswer ? "❌ Hide Answer" : "📜 Reveal Answer"}
                </button>
              </div>
            </form>

            {showAnswer && (
              <div className="answer-reveal">
                <a
                  href={question.answer}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔗 {question.answer}
                </a>
              </div>
            )}

            <div
              className={`feedback ${
                feedback.includes("🎉") ? "success" : "error"
              }`}
            >
              {feedback}
            </div>
          </div>
        </div>
      )}

      {showScorePopup && (
        <div className="score-popup-overlay">
          <div className="score-popup">
            <h2>Game Over!</h2>
            <div className="final-score">
              <span className="trophy">🏆</span>
              Your Score: {score}
              <span className="trophy">🏆</span>
            </div>
            <p>Returning to previous page...</p>
          </div>
        </div>
      )}

      {/* Add CSS for the new components */}
      <style jsx>{`
        .score-timer {
          display: flex;
          justify-content: space-between;
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
        }

        .timer {
          font-weight: bold;
          font-size: 1.2rem;
        }

        .timer-warning {
          color: #ff5252;
          animation: pulse 1s infinite;
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
          background-color: #fff;
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
          animation: popIn 0.5s ease-out;
          max-width: 90%;
          width: 400px;
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
          color: #ff9800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .trophy {
          font-size: 2.5rem;
          margin: 0 10px;
        }
      `}</style>
    </div>
  );
}

export default App;
