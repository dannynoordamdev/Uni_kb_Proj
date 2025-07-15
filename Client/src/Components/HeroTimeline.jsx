import React from "react";
import "./Herotimeline.css"; // Zorg ervoor dat je het CSS-bestand importeert
import manuscriptImage from 'C:/Users/danny/Desktop/Uni_kb_Proj/Client/src/assets/two.jpg';

const scrollToNext = () => {
  const nextSection = document.getElementById("timeline-section");
  if (nextSection) {
    nextSection.scrollIntoView({ behavior: "smooth" });
  }
};

const HeroTimeline = () => (
  <section className="hero-section">
    {/* Left: Content */}
    <div className="hero-content">
      <h1 className="hero-title">
        Reis door de Tijd
      </h1>
      <h2 className="hero-subtitle">
        Verken de geschiedenis aan de hand van unieke, gedigitaliseerde verluchtingen.
      </h2>
      <button onClick={scrollToNext} className="hero-button">
        Begin met tijdreizen ↓
      </button>
    </div>

    {/* Right: Vertical Image */}
    <div className="hero-image-container">
      <div className="hero-image-box">
        <img
          src={manuscriptImage}
          alt="Digitized Manuscript"
          className="hero-image"
        />
      </div>
    </div>
  </section>
);

export default HeroTimeline;