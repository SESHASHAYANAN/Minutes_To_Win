import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Story from "./story";
import Lies from "./lies";
import Pet from "./pet";
import StoryGame from "./StoryGame";
import AcronymGame from "./AcronymGame";
import Dice from "./Dice";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dice" element={<Dice />} />
        <Route path="/story" element={<Story />} />
        <Route path="/lies" element={<Lies />} />
        <Route path="/pet" element={<Pet />} />
        <Route path="/story-game" element={<StoryGame />} />
        <Route path="/acronym-game" element={<AcronymGame />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
