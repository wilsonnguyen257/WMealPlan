// src/components/Hero.tsx
import React from 'react';
import './Hero.css';

interface HeroProps {
  onStartClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartClick }) => {
  return (
    <section className="hero-section">
      <div className="container">
        <h1 className="hero-title">AI Weekly Meal Planner</h1>
        <p className="hero-subtitle">
          Generate a simple weekly meal plan and shopping list with AI.
        </p>
        <button onClick={onStartClick} className="primary-btn">
          Start Planning
        </button>
      </div>
    </section>
  );
};

export default Hero;
