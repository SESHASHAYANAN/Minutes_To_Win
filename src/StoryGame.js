import React, { useState, useEffect } from "react";
import "./StoryGame.css";

const StoryGame = () => {
  const [story, setStory] = useState([]);
  const [inputEmojis, setInputEmojis] = useState("");
  const [turnTimer, setTurnTimer] = useState(30);
  const [gameTimer, setGameTimer] = useState(60); // 60-second game timer
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState("start");
  const [gameOver, setGameOver] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);

  const generateStoryPart = async (context = "") => {
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
                content: context
                  ? `Continue this story in 1-2 short sentences (be quick and concise): "${context}"`
                  : "Begin a random story in 1-2 short sentences",
              },
            ],
          }),
        }
      );

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error:", error);
      return "Once upon a time...";
    }
  };

  const validateEmojis = async (emojis, context) => {
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
                content: `Rate 1-10 how well these emojis ${emojis} represent the story: "${context}". Reply only with a number.`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      return parseInt(data.choices[0].message.content) || 0;
    } catch (error) {
      return 0;
    }
  };

  // Game timer effect
  useEffect(() => {
    if (phase !== "start" && !gameOver) {
      const interval = setInterval(() => {
        setGameTimer((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            endGame();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, gameOver]);

  // AI turn effect
  useEffect(() => {
    if (phase === "ai-turn" && !gameOver) {
      const generateNext = async () => {
        const newText = await generateStoryPart(
          story.length > 0 ? story[story.length - 1]?.content : ""
        );
        setStory([...story, { type: "text", content: newText }]);
        setPhase("user-turn");
        setTurnTimer(Math.min(30, gameTimer - 5)); // Ensure turn timer doesn't exceed game timer
      };
      generateNext();
    }
  }, [phase, gameOver]);

  // Turn timer effect
  useEffect(() => {
    if (phase === "user-turn" && !gameOver) {
      const interval = setInterval(() => {
        setTurnTimer((t) => {
          if (t <= 1) {
            clearInterval(interval);
            if (inputEmojis) {
              endTurn();
            } else {
              // Auto-submit random emojis if time runs out
              const randomEmojis = ["😊", "😂", "😮", "😍", "🤔"];
              setInputEmojis(randomEmojis[Math.floor(Math.random() * randomEmojis.length)]);
              setTimeout(() => endTurn(), 500);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, inputEmojis, gameOver]);

  const endGame = () => {
    setGameOver(true);
    setShowScorePopup(true);
    
    // Navigate back after 3 seconds
    setTimeout(() => {
      window.history.back();
    }, 3000);
  };

  const startGame = async () => {
    const initialStory = await generateStoryPart();
    setStory([{ type: "text", content: initialStory }]);
    setPhase("user-turn");
    setTurnTimer(30);
    setGameTimer(60); // Reset game timer
  };

  const endTurn = async () => {
    if (phase === "user-turn" && inputEmojis && !gameOver) {
      const rating = await validateEmojis(
        inputEmojis,
        story[story.length - 1].content
      );
      
      // Award bonus points based on time left
      const timeBonus = Math.floor(turnTimer / 5);
      const totalPoints = rating + timeBonus;
      
      setScore((s) => s + totalPoints);
      setStory([...story, { type: "emojis", content: inputEmojis }]);
      setInputEmojis("");
      
      // Check if game should end due to time
      if (gameTimer <= 10) {
        endGame();
      } else {
        setPhase("ai-turn");
      }
    }
  };

  return (
    <div className="story-game">
      <div className="header">
        <div className="score">🏆 Points: {score}</div>
        <div className={`game-timer ${gameTimer <= 10 ? "warning" : ""}`}>
          ⏳ Game: {gameTimer}s
        </div>
        {phase === "user-turn" && (
          <div className={`turn-timer ${turnTimer <= 5 ? "warning" : ""}`}>
            ⌛ Turn: {turnTimer}s
          </div>
        )}
      </div>

      {phase === "start" ? (
        <div className="start-screen">
          <h1>📖 Collaborative Story Game</h1>
          <p>You have 60 seconds to create a story together with AI!</p>
          <p>AI writes the story, you respond with emojis that match the mood.</p>
          <button onClick={startGame} className="start-btn">
            🚀 Start Story
          </button>
        </div>
      ) : (
        <div className="game-area">
          <div className="story-flow">
            {story.map((segment, index) => (
              <div key={index} className={`segment ${segment.type}`}>
                {segment.type === "text" ? (
                  <div className="text-bubble">{segment.content}</div>
                ) : (
                  <div className="emoji-bubble">{segment.content}</div>
                )}
              </div>
            ))}
          </div>

          {phase === "user-turn" && !gameOver && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                endTurn();
              }}
              className="emoji-form"
            >
              <input
                type="text"
                value={inputEmojis}
                onChange={(e) => setInputEmojis(e.target.value)}
                placeholder="Your emoji response (max 5)..."
                className="emoji-input"
                maxLength="5"
                autoFocus
              />
              <button type="submit" className="submit-btn">
                ✨ Continue Story
              </button>
            </form>
          )}
          
          {phase === "ai-turn" && !gameOver && (
            <div className="loading-indicator">
              <p>AI is writing... ✍️</p>
            </div>
          )}
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
            <p>Story Length: {Math.floor(story.length/2)} exchanges</p>
            <p>Returning to previous page...</p>
          </div>
        </div>
      )}

      {/* Add CSS for new components */}
      <style jsx>{`
        .header {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          margin-bottom: 15px;
        }
        
        .game-timer, .turn-timer {
          font-weight: bold;
          padding: 5px 10px;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.2);
        }
        
        .warning {
          color: #ff4136;
          animation: pulse 1s infinite;
          background: rgba(255, 65, 54, 0.2);
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
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
          background: linear-gradient(135deg, #6a11cb, #2575fc);
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
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
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
        
        .loading-indicator {
          text-align: center;
          padding: 20px;
          font-style: italic;
          animation: bounce 1s infinite alternate;
        }
        
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-5px); }
        }
        
        .start-screen p {
          margin: 10px 0;
          font-size: 1.1rem;
          max-width: 600px;
          text-align: center;
        }
        
        .emoji-input {
          font-size: 24px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default StoryGame;