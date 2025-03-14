import React, { useState, useEffect } from "react";
import "./lies.css";

const COUNTRIES = {
  "🇺🇸 USA": "United States",
  "🇮🇳 India": "India",
  "🇧🇷 Brazil": "Brazil",
  "🇯🇵 Japan": "Japan",
  "🇩🇪 Germany": "Germany",
  "🇳🇬 Nigeria": "Nigeria",
  "🇦🇺 Australia": "Australia",
  "🇨🇦 Canada": "Canada",
};

const TwoTruthsLie = () => {
  const [country, setCountry] = useState("");
  const [facts, setFacts] = useState(["", "", ""]);
  const [submittedFacts, setSubmittedFacts] = useState([]);
  const [selectedLie, setSelectedLie] = useState(null);
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("setup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [showScorePopup, setShowScorePopup] = useState(false);

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameState === "voting" && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === "voting") {
      // Time's up - show results
      setGameState("results");
      setShowScorePopup(true);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  // Reset timer when game state changes
  useEffect(() => {
    if (gameState === "voting") {
      setTimeLeft(60);
    }
  }, [gameState]);

  // Return to previous page after game ends
  useEffect(() => {
    let navigationTimer;
    if (gameState === "results") {
      navigationTimer = setTimeout(() => {
        setShowScorePopup(true);
        // Set a timeout to navigate back after showing score popup
        setTimeout(() => {
          window.history.back();
        }, 5000);
      }, 3000);
    }
    return () => clearTimeout(navigationTimer);
  }, [gameState]);

  const validateFact = async (fact) => {
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
                content: `Is this statement about ${COUNTRIES[country]} true? Reply only "true" or "false". Statement: ${fact}`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const answer = data.choices[0].message.content.toLowerCase().trim();
      return answer.startsWith("true");
    } catch (err) {
      console.error("Validation error:", err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Shuffle facts first
      const shuffled = [...facts].sort(() => Math.random() - 0.5);

      // Validate shuffled facts
      const validation = await Promise.all(
        shuffled.map(async (fact) => ({
          fact,
          isTruth: await validateFact(fact),
        }))
      );

      if (validation.some((v) => v.isTruth === null)) {
        throw new Error("Failed to validate some facts");
      }

      setSubmittedFacts(shuffled);
      setResults(validation);
      setGameState("voting");
    } catch (err) {
      setError("Error validating facts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (index) => {
    if (!results.length) return;

    const isActuallyLie = !results[index].isTruth;
    const lieCount = results.filter((r) => !r.isTruth).length;

    if (lieCount === 0) {
      // All truths
      setScore((s) => s - 10);
      setError("Trick question! All statements were true! 🎭");
    } else if (lieCount === 3) {
      // All lies
      setScore((s) => s + 10);
      setError("Master liar! All statements were false! 😈");
    } else {
      if (isActuallyLie) {
        setScore((s) => s + 10);
        setError("");
      } else {
        setScore((s) => Math.max(0, s - 5));
        setError("Wrong choice! Try again! ❌");
      }
    }

    setSelectedLie(index);
    setTimeout(() => {
      setGameState("results");
      setShowScorePopup(true);
    }, 2000);
  };

  return (
    <div className="game-container">
      <div className="score">🏆 Score: {score}</div>
      {gameState === "voting" && (
        <div className="timer">⏱️ Time left: {timeLeft}s</div>
      )}

      {gameState === "setup" ? (
        <div className="setup-phase">
          <h2>Create Your Facts</h2>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="country-select"
          >
            <option value="">Select Country</option>
            {Object.keys(COUNTRIES).map((flag) => (
              <option key={flag} value={flag}>
                {flag}
              </option>
            ))}
          </select>

          <div className="facts-input">
            {[0, 1, 2].map((index) => (
              <textarea
                key={index}
                value={facts[index]}
                onChange={(e) => {
                  const newFacts = [...facts];
                  newFacts[index] = e.target.value;
                  setFacts(newFacts);
                }}
                placeholder={`Fact ${index + 1}`}
                minLength="10"
              />
            ))}
          </div>

          {error && <div className="error">{error}</div>}
          <button
            onClick={handleSubmit}
            className="submit-btn"
            disabled={loading || !country || facts.some((f) => f.length < 10)}
          >
            {loading ? "Validating..." : "Submit Facts"}
          </button>
        </div>
      ) : gameState === "voting" ? (
        <div className="voting-phase">
          <h2>{country} Facts</h2>
          {loading ? (
            <div className="loading">Analyzing facts... 🔍</div>
          ) : (
            <>
              <div className="facts-list">
                {submittedFacts.map((fact, index) => (
                  <button
                    key={index}
                    onClick={() => handleVote(index)}
                    className={`fact-card ${
                      selectedLie === index ? "selected" : ""
                    }`}
                  >
                    {fact}
                  </button>
                ))}
              </div>
              {error && <div className="error">{error}</div>}
            </>
          )}
        </div>
      ) : (
        <div className="results-phase">
          <h2>Results</h2>
          <div className="facts-results">
            {results.map((result, index) => (
              <div
                key={index}
                className={`result-card ${result.isTruth ? "truth" : "lie"}`}
              >
                <div className="fact">{submittedFacts[index]}</div>
                <div className="verdict">
                  {result.isTruth ? "✅ Verified Truth" : "❌ Proven Lie"}
                </div>
              </div>
            ))}
          </div>
          <p className="ending-message">
            Returning to previous page in 5 seconds...
          </p>
          <button
            onClick={() => {
              setGameState("setup");
              setFacts(["", "", ""]);
              setError("");
              setShowScorePopup(false);
            }}
            className="play-again"
          >
            Play Again
          </button>
        </div>
      )}

      {showScorePopup && (
        <div className="score-popup-overlay">
          <div className="score-popup">
            <h2>Game Over!</h2>
            <div className="final-score">🏆 Final Score: {score}</div>
            <button
              onClick={() => setShowScorePopup(false)}
              className="close-popup"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwoTruthsLie;
