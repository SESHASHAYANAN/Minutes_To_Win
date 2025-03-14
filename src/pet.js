import React, { useState, useEffect } from "react";
import "./PetGame.css";

const PETS = {
  "🦞 Lobster": {
    stages: ["lazy", "buff", "legendary"],
    images: {
      lazy: "🦞💤",
      buff: "🦞💪",
      legendary: "🦞👑",
    },
    riddles: {
      hungry: "🍖 What needs filling to keep me going?",
      thirsty: "💧 I'm drying up, need liquid...",
      sleepy: "😴 Darkness calls, need to...",
      playful: "🎾 What bounces but never stops?",
    },
  },
  "🐄 Cow": {
    stages: ["happy", "hungry", "thin"],
    images: {
      happy: "🐄😊",
      hungry: "🐄🍽️",
      thin: "🐄🦴",
    },
  },
  "🐘 Elephant": {
    stages: ["baby", "adult", "elder"],
    images: {
      baby: "🐘🍼",
      adult: "🐘🌟",
      elder: "🐘👴",
    },
    riddles: {
      hungry: "🌿 Tall plants are my delight, what am I craving?",
      thirsty: "🚿 My trunk needs filling with...",
      playful: "💦 What makes a splash but isn't rain?",
    },
  },
  "🐢 Turtle": {
    stages: ["slow", "steady", "winner"],
    images: {
      slow: "🐢⏱️",
      steady: "🐢🏃‍♂️",
      winner: "🐢🏆",
    },
  },
  "🐬 Dolphin": {
    stages: ["playful", "curious", "intelligent"],
    images: {
      playful: "🐬🎮",
      curious: "🐬🔍",
      intelligent: "🐬🧠",
    },
    riddles: {
      hungry: "🐟 Silver swimmers are my target, what do I seek?",
      playful: "🌊 I ride these for fun, what are they?",
    },
  },
  "🦁 Lion": {
    stages: ["cub", "young", "king"],
    images: {
      cub: "🦁🍼",
      young: "🦁🌱",
      king: "🦁👑",
    },
  },
  "🐸 Frog": {
    stages: ["tadpole", "jumpy", "croaker"],
    images: {
      tadpole: "🐸🥄",
      jumpy: "🐸🏃‍♂️",
      croaker: "🐸🎵",
    },
    riddles: {
      hungry: "🦟 Buzzing snacks I love to catch, what are they?",
      sleepy: "🍃 I need a green pad to rest upon...",
    },
  },
  "🐧 Penguin": {
    stages: ["chick", "sliding", "swimming"],
    images: {
      chick: "🐧🍼",
      sliding: "🐧🏂",
      swimming: "🐧🏊‍♂️",
    },
  },
  "🦊 Fox": {
    stages: ["kit", "sly", "wise"],
    images: {
      kit: "🦊🍼",
      sly: "🦊😏",
      wise: "🦊🧠",
    },
    riddles: {
      hungry: "🐁 Quick and small, my favorite meal is...",
      playful: "❄️ I pounce through this white blanket, what is it?",
    },
  },
  "🦉 Owl": {
    stages: ["nestling", "nocturnal", "sage"],
    images: {
      nestling: "🦉🥚",
      nocturnal: "🦉🌙",
      sage: "🦉🧙‍♂️",
    },
  },
  "🦅 Eagle": {
    stages: ["eaglet", "soaring", "hunter"],
    images: {
      eaglet: "🦅🥚",
      soaring: "🦅☁️",
      hunter: "🦅🎯",
    },
    riddles: {
      hungry: "🐇 From high above I spot my nimble prey...",
      sleepy: "🌲 My nest atop this giant brings me rest...",
    },
  },
  "🐙 Octopus": {
    stages: ["hatchling", "tentacled", "genius"],
    images: {
      hatchling: "🐙🥚",
      tentacled: "🐙🦑",
      genius: "🐙🧠",
    },
  },
  "🦒 Giraffe": {
    stages: ["calf", "growing", "towering"],
    images: {
      calf: "🦒🍼",
      growing: "🦒📏",
      towering: "🦒🌈",
    },
    riddles: {
      hungry: "🌴 My snack grows high above the ground...",
      thirsty: "💧 To drink, I must do what awkward pose?",
    },
  },
  "🦘 Kangaroo": {
    stages: ["joey", "hopper", "boxer"],
    images: {
      joey: "🦘👶",
      hopper: "🦘🏃‍♂️",
      boxer: "🦘🥊",
    },
  },
  "🦥 Sloth": {
    stages: ["baby", "sleepy", "zen"],
    images: {
      baby: "🦥🍼",
      sleepy: "🦥😴",
      zen: "🦥🧘‍♂️",
    },
    riddles: {
      hungry: "🍃 Green delights hanging from branches are my...",
      sleepy: "🌴 What do I hold onto while I dream?",
      playful: "⏱️ Why am I never late? Because I take my...",
    },
  },
};

const ACTIONS = [
  { emoji: "🍔", type: "feed", riddle: "I need energy to move..." },
  { emoji: "🚰", type: "water", riddle: "Parched and dry..." },
  { emoji: "🎾", type: "play", riddle: "Bounce me around..." },
  { emoji: "🛌", type: "sleep", riddle: "Eyes heavy..." },
  { emoji: "🛁", type: "clean", riddle: "Feeling dirty..." },
  { emoji: "💊", type: "medicine", riddle: "Under the weather..." },
  { emoji: "🎓", type: "train", riddle: "Teach me tricks..." },
  { emoji: "🎵", type: "music", riddle: "Rhythm in my soul..." },
  { emoji: "🚶", type: "walk", riddle: "Need to stretch..." },
  { emoji: "🪀", type: "toy", riddle: "Boredom strikes..." },
  { emoji: "🧼", type: "groom", riddle: "Looking scruffy..." },
  { emoji: "🧩", type: "puzzle", riddle: "Mental challenge..." },
  { emoji: "🛡️", type: "protect", riddle: "Scary noises..." },
  { emoji: "🌞", type: "sunbathe", riddle: "Need vitamin D..." },
  { emoji: "❄️", type: "cool", riddle: "Overheating..." },
];

const PetGame = () => {
  const [pet, setPet] = useState(null);
  const [status, setStatus] = useState({
    hunger: 50,
    thirst: 50,
    energy: 100,
    hygiene: 75,
    happiness: 50,
    health: 100,
  });
  const [stage, setStage] = useState(0);
  const [timer, setTimer] = useState(30);
  const [score, setScore] = useState(100);
  const [feedback, setFeedback] = useState("");
  const [currentRiddle, setCurrentRiddle] = useState("");
  const [gameTimer, setGameTimer] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [showScorePopup, setShowScorePopup] = useState(false);

  // Game timer effect
  useEffect(() => {
    if (!pet || gameOver) return;

    const interval = setInterval(() => {
      setGameTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setGameOver(true);
          setShowScorePopup(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pet, gameOver]);

  // Return to previous page after game ends
  useEffect(() => {
    if (gameOver && showScorePopup) {
      const timeout = setTimeout(() => {
        setShowScorePopup(false);
        // Add a small delay before navigating back
        setTimeout(() => {
          window.history.back();
        }, 1500);
      }, 5000); // Show score popup for 5 seconds

      return () => clearTimeout(timeout);
    }
  }, [gameOver, showScorePopup]);

  // Regular pet needs timer
  useEffect(() => {
    if (!pet || gameOver) return;

    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 0) {
          degradeStatus();
          return 30;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pet, gameOver]);

  const degradeStatus = () => {
    setStatus((s) => ({
      hunger: Math.max(0, s.hunger - 5),
      thirst: Math.max(0, s.thirst - 7),
      energy: Math.max(0, s.energy - 3),
      hygiene: Math.max(0, s.hygiene - 4),
      happiness: Math.max(0, s.happiness - 6),
      health: Math.max(0, s.health - (s.hunger < 20 ? 15 : 5)),
    }));
    setScore((s) => Math.max(0, s - 10));
  };

  const adoptPet = (selectedPet) => {
    setPet(selectedPet);
    generateNewRiddle();
  };

  const handleAction = async (action) => {
    if (gameOver) return;

    updateStatus(action.type);
    generateNewRiddle();
    const response = await getPetResponse(action.type);
    setFeedback(response);
  };

  const updateStatus = (actionType) => {
    const updates = {
      feed: { hunger: +20, health: +5 },
      water: { thirst: +20 },
      play: { happiness: +15, energy: -10 },
      sleep: { energy: +30 },
      clean: { hygiene: +25 },
      medicine: { health: +20 },
      train: { happiness: +10 },
      music: { happiness: +15 },
      walk: { energy: -15, happiness: +10 },
      toy: { happiness: +20 },
      groom: { hygiene: +20 },
      puzzle: { happiness: +15 },
      protect: { happiness: +10 },
      sunbathe: { health: +10 },
      cool: { health: +10 },
    };

    setStatus((s) => {
      const newValues = {};
      for (const [key, value] of Object.entries(s)) {
        if (updates[actionType][key]) {
          newValues[key] = Math.min(
            100,
            Math.max(0, value + updates[actionType][key])
          );
        } else {
          newValues[key] = value;
        }
      }
      return newValues;
    });

    setScore((s) => s + 10);
    setTimer(30);
  };

  const generateNewRiddle = () => {
    const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    setCurrentRiddle(randomAction.riddle);
  };

  const getPetResponse = async (action) => {
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
                content: `How does my ${pet} feel after ${action}? Respond in 10 words with emoji.`,
              },
            ],
          }),
        }
      );
      return (await response.json()).choices[0].message.content;
    } catch (error) {
      return "💤 Zzz... (API Error)";
    }
  };

  // Calculate final grade based on score
  const getFinalGrade = () => {
    if (score >= 200) return "S+";
    if (score >= 180) return "S";
    if (score >= 160) return "A+";
    if (score >= 140) return "A";
    if (score >= 120) return "B+";
    if (score >= 100) return "B";
    if (score >= 80) return "C+";
    if (score >= 60) return "C";
    if (score >= 40) return "D";
    return "F";
  };

  return (
    <div className="pet-game">
      <div className="score-timer-container">
        <div className="score">🏆 Score: {score}</div>
        <div className="game-timer">⏳ Game ends in: {gameTimer}s</div>
      </div>

      {!pet ? (
        <div className="adoption-center">
          <h2>Adopt Your Virtual Pet! 🐾</h2>
          <div className="pet-grid">
            {Object.keys(PETS).map((pet) => (
              <div key={pet} className="pet-card" onClick={() => adoptPet(pet)}>
                <span className="pet-emoji">
                  {PETS[pet].images[PETS[pet].stages[0]]}
                </span>
                <h3>{pet}</h3>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="pet-care">
          <h2>Care for your {pet}!</h2>
          <div className="riddle">{currentRiddle}</div>

          <div className="pet-display">
            <span
              className={`main-pet-emoji ${status.health < 50 ? "sick" : ""}`}
            >
              {PETS[pet].images[PETS[pet].stages[stage]]}
            </span>
            <div className="status-bars">
              {Object.entries(status).map(([stat, value]) => (
                <div key={stat} className="status-bar">
                  <div className="label">
                    {stat === "hunger"
                      ? "🍖"
                      : stat === "thirst"
                      ? "💧"
                      : stat === "energy"
                      ? "⚡"
                      : stat === "hygiene"
                      ? "✨"
                      : stat === "happiness"
                      ? "😊"
                      : "❤️"}{" "}
                    {stat}
                  </div>
                  <div className="bar">
                    <div className="fill" style={{ width: `${value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="action-grid">
            {ACTIONS.map((action, index) => (
              <button
                key={index}
                className="action-btn"
                onClick={() => handleAction(action)}
                title={action.riddle}
                disabled={gameOver}
              >
                <span className="action-emoji">{action.emoji}</span>
                {action.type}
              </button>
            ))}
          </div>

          <div className="timer">⏳ Next need in: {timer}s</div>
          {feedback && <div className="feedback">{feedback}</div>}
        </div>
      )}

      {showScorePopup && (
        <div className="score-popup-overlay">
          <div className="score-popup">
            <h2>Game Over!</h2>
            <div className="final-score">
              <div className="pet-emoji-large">
                {pet && PETS[pet].images[PETS[pet].stages[stage]]}
              </div>
              <div className="score-details">
                <h3>Final Score: {score}</h3>
                <h3>Grade: {getFinalGrade()}</h3>
                <p>Thanks for taking care of your pet!</p>
                <p>Returning to previous page in a moment...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetGame;
