import React from "react";

const scrollToNext = () => {
    const nextSection = document.getElementById("timeline-section");
    if (nextSection) {
        nextSection.scrollIntoView({ behavior: "smooth" });
    }
};

const navbarHeight = 80;

const HeroTimeline = () => (
    <section
        className="hero-container"
        style={{
            backgroundImage: "linear-gradient(to right, #273d5a, #122a46)",
            position: "relative",
            overflow: "hidden",
            height: `calc(100vh - ${navbarHeight}px)`



            
        }}
    >
        {/* Wig-vorm onderaan */}
        <div
            style={{
                content: "''",
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "15vw",
                backgroundColor: "#f0f0f0",
                clipPath: "polygon(0 100%, 100% 100%, 100% 0)",
                zIndex: 1,
            }}
        />
        {/* Content */}
        <div
            className="hero-content"
            style={{
                position: "relative",
                zIndex: 2,
                padding: "2rem",
                maxWidth: "800px",
                textAlign: "center",
                animation: "fadeIn 1s ease-in-out",
                color: "white",
            }}
        >
            <h1 className="hero-title">Reis door de Tijd</h1>
            <h2 className="hero-subtitle" style={{color: "#fff"}}>Manuscripten door de tijd heen.</h2>
            <p
                style={{
                    fontSize: "1.35rem",
                    fontWeight: 300,
                    lineHeight: 1.7,
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                }}
            >
                Bekijk welke manuscripten zich op de tijdlijn bevinden, en welke prachtige verluchtingen zich daarbij tonen.
            </p>
            <button
                onClick={scrollToNext}
                className="hero-button"
                style={{
                    marginTop: "1.5rem",
                }}
            >
                Bekijk de tijdlijn ↓
            </button>
        </div>
    </section>
);

export default HeroTimeline;
