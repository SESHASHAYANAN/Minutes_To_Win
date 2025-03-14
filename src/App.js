import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dice.css";

const Dice = () => {
  const [number, setNumber] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const navigate = useNavigate();

  // Map dice numbers to available routes
  const routes = {
    1: "/dice", // App (Home)
    2: "/story",
    3: "/lies",
    4: "/pet",
    5: "/story-game",
    6: "/acronym-game",
  };

  const rollDice = () => {
    if (!isRolling) {
      setIsRolling(true);
      setTimeout(() => {
        const newNumber = Math.floor(Math.random() * 6) + 1;
        setNumber(newNumber);
        setIsRolling(false);

        // Navigate to the corresponding page after dice stops rolling
        setTimeout(() => {
          navigate(routes[newNumber]);
        }, 1000);
      }, 1000);
    }
  };

  return (
    <div className="dice-container">
      <h1 className="header">Orca Dice</h1>

      <div className={`dice ${isRolling ? "rolling" : ""}`}>
        <div className="dice-face" data-number={number}>
          {[...Array(9)].map((_, i) => (
            <div key={i + 1} className={`dot dot-${i + 1}`}></div>
          ))}
        </div>
      </div>

      <button
        className={`roll-button ${isRolling ? "disabled" : ""}`}
        onClick={rollDice}
        disabled={isRolling}
      >
        {isRolling ? "Rolling..." : "🎲 Roll Dice"}
      </button>

      <div className="result">
        <span className="result-text">Result:</span>
        <span className="result-number">{number}</span>
      </div>

      <div className="page-guide">
        <h3>Page Guide:</h3>
        <ul>
          <li>1️⃣ -dice</li>
          <li>2️⃣ - Story</li>
          <li>3️⃣ - Lies</li>
          <li>4️⃣ - Pet</li>
          <li>5️⃣ - Story Game</li>
          <li>6️⃣ - Acronym Game</li>
        </ul>
      </div>
    </div>
  );
};

export default Dice;
