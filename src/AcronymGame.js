import React, { useState, useEffect } from "react";
import "./AcronymGame.css";

const AcronymGame = () => {
  const [acronym, setAcronym] = useState("");
  const [userPhrase, setUserPhrase] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [upvotes, setUpvotes] = useState({});
  const [attempted, setAttempted] = useState([]);
  const [theme, setTheme] = useState("kidsafe");
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState("playing");
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const generateAcronym = async (nsfw = false) => {
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
                content: `Generate a random ${
                  nsfw ? "edgy" : "family-friendly"
                } 3-4 letter acronym. Reply only with the letters.`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const cleanAcronym = data.choices[0].message.content.replace(
        /[^A-Z]/g,
        ""
      );
      setAcronym(cleanAcronym.slice(0, 4));
      // Reset timer when getting a new acronym
      setTimeLeft(60);
      setGameState("playing");
    } catch (error) {
      // Fallback acronyms if API fails
      const fallback =
        theme === "nsfw" ? ["WTF", "NSFW", "OMG"] : ["LOL", "FYI", "DIY"];
      setAcronym(fallback[Math.floor(Math.random() * fallback.length)]);
      // Reset timer when getting a new acronym
      setTimeLeft(60);
      setGameState("playing");
    }
  };

  useEffect(() => {
    const day = new Date().getDay();
    const newTheme = day === 0 ? "nsfw" : "kidsafe";
    setTheme(newTheme);
    generateAcronym(newTheme === "nsfw");
  }, []);

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === "playing") {
      // Time's up - end the game
      endGame();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  const endGame = () => {
    setGameState("ended");

    // Calculate total score based on submissions and upvotes
    const score =
      Object.values(upvotes).reduce((sum, votes) => sum + votes, 0) +
      submissions.length * 5;
    setTotalScore(score);

    // Show score popup
    setShowScorePopup(true);

    // Set a timeout to navigate back after showing score popup
    setTimeout(() => {
      window.history.back();
    }, 5000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userPhrase.trim()) return;

    setSubmissions((prev) => [...prev, userPhrase]);
    setUpvotes((prev) => ({ ...prev, [userPhrase]: 0 }));
    setUserPhrase("");
  };

  const handleUpvote = (phrase) => {
    setUpvotes((prev) => ({ ...prev, [phrase]: (prev[phrase] || 0) + 1 }));
  };

  const handleReset = () => {
    setAttempted((prev) => [
      ...prev,
      {
        acronym,
        submissions: submissions.map((phrase) => ({
          phrase,
          upvotes: upvotes[phrase] || 0,
        })),
      },
    ]);
    generateAcronym(theme === "nsfw");
    setSubmissions([]);
    setUpvotes({});
  };

  return (
    <div className={`acronym-game ${theme}`}>
      <div className="header">
        <h1>Acronym Battle {theme.toUpperCase()}</h1>
        <div className="theme-notice">
          {theme === "nsfw" ? "🔞 NSFW Sunday" : "👪 Kidsafe Monday"}
        </div>
        <div className="timer">⏱️ Time left: {timeLeft}s</div>
      </div>

      <div className="game-area">
        <div className="current-acronym">
          <h2>Current Acronym: {acronym}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={userPhrase}
              onChange={(e) => setUserPhrase(e.target.value)}
              placeholder={`Create phrase for ${acronym}...`}
              maxLength="50"
              disabled={gameState === "ended"}
            />
            <button type="submit" disabled={gameState === "ended"}>
              Submit
            </button>
          </form>
          <button
            onClick={gameState === "ended" ? handleReset : handleReset}
            className="reset-btn"
            disabled={gameState === "ended"}
          >
            🔄 New Acronym
          </button>
        </div>

        <div className="submissions">
          <h3>Submissions ({submissions.length})</h3>
          {submissions.map((phrase, index) => (
            <div key={index} className="submission">
              <span>{phrase}</span>
              <button
                onClick={() => handleUpvote(phrase)}
                disabled={gameState === "ended"}
              >
                👍 {upvotes[phrase] || 0}
              </button>
            </div>
          ))}
        </div>

        <div className="attempted-list">
          <h3>Previous Battles</h3>
          {attempted.map((battle, index) => (
            <div key={index} className="attempted-item">
              <strong>{battle.acronym}:</strong>
              {battle.submissions.map((sub, i) => (
                <div key={i}>
                  {sub.phrase} ({sub.upvotes}👍)
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {showScorePopup && (
        <div className="score-popup-overlay">
          <div className="score-popup">
            <h2>Game Over!</h2>
            <div className="final-score">🏆 Final Score: {totalScore}</div>
            <p className="score-breakdown">
              {submissions.length} submissions ({submissions.length * 5} pts)
              <br />
              {Object.values(upvotes).reduce(
                (sum, votes) => sum + votes,
                0
              )}{" "}
              total upvotes
            </p>
            <p className="ending-message">
              Returning to previous page in 5 seconds...
            </p>
            <button
              onClick={() => {
                setShowScorePopup(false);
                handleReset();
              }}
              className="close-popup"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcronymGame;
