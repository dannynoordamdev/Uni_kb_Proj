import React, { useState } from 'react'; 
import '../Components/Hero.css';
import kbLogo from '../assets/kb-logo-zw.svg'; 

const Hero = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="hero">
            <nav className="navbar">
                <a href="/" aria-label="KB, nationale bibliotheek van Nederland" className="logo-link"> 
                    <img src={kbLogo} alt="KB Logo" className="kb-logo-zw" />
                </a>
                <button className="hamburger-menu" onClick={toggleMobileMenu} aria-expanded={isMobileMenuOpen} aria-controls="mobile-nav">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </button>
                <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`} id="mobile-nav"> 
                    <a href="#" className="nav-link">Handschriften</a>
                    <a href="#" className="nav-link">Visualisaties</a>
                    <a href="#" className="nav-link">Over ons</a>
                    <a href="#" className="nav-link">Contact</a>
                </div>
            </nav>
            <div className="hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">Middeleeuwse Handschriften<br />en Verluchtingen.</h1>
                    <p className="hero-subtitle">Bekijk bijzondere Manuscripten door middel van visualisaties.</p>
                    <button className="hero-button">Begin met tijdreizen</button>
                </div>
            </div>
        </div>
    );
};

export default Hero;