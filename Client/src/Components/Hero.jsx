import { useNavigate } from 'react-router-dom';
import '../Components/Hero.css';
import Navbar from './Navbar';
import React from 'react';

const Hero = () => {
    let navigate = useNavigate();
    const timelineNavigate = () => {
        navigate('/tijdlijn');
    }
    const scrollToNext = () => {
    const nextSection = document.getElementById("worldmap-container");
    const top = nextSection.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
            top: top - 20, 
            behavior: "smooth"
        });
    }


    return (
        <div className="hero">
            <Navbar />
            <div className="hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">Middeleeuwse Handschriften<br />en Verluchtingen.</h1>
                    <p className="hero-subtitle">Bekijk bijzondere Manuscripten door middel van visualisaties.</p>
                    <div className="space">
                    <button onClick={timelineNavigate} className="hero-button">Verken de tijdlijn</button>
                    <button onClick={scrollToNext} className="hero-button">Manuscript in kaart</button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Hero;