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
        className="hero-vertical-container"
        style={{
            height: `calc(100vh - ${navbarHeight}px)`, // full viewport minus navbar
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: "linear-gradient(#273d5a, #122a46)",
            position: "relative",
            overflow: "hidden",
            padding: "0 4rem", // more side padding for bigger screens
            gap: "4rem",
        }}
    >
        {/* Left: Content */}
        <div
            style={{
                flex: 1,
                zIndex: 2,
                color: "#fff",
                maxWidth: 600,
                paddingRight: "2rem",
                textAlign: "left",
            }}
        >
            <h1 style={{
                fontSize: "3.8rem", // bigger title
                fontWeight: 700,
                marginBottom: 20,
                letterSpacing: "0.01em",
                lineHeight: 1.1,
            }}>
                Reis door de Tijd
            </h1>
            <h2 style={{
                color: "#f0f0f0",
                fontWeight: 400,
                fontSize: "1.6rem", // bigger subtitle
                marginBottom: 36,
                lineHeight: 1.4,
            }}>
                Verken de geschiedenis aan de hand van unieke, gedigitaliseerde verluchtingen.
            </h2>
            <button
                onClick={scrollToNext} className="button"
            >
                Begin met tijdreizen ↓
            </button>
        </div>

        {/* Right: Vertical Image */}
        <div
            style={{
                flex: "0 0 360px", // wider image container
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
            }}
        >
            <div style={{
                width: 360,
                height: 480, // taller vertical image
                borderRadius: "48px",
                overflow: "hidden",
                boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
                background: "#fff",
                border: "8px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <img
                    src="src/assets/two.jpg"
                    alt="Digitized Manuscript"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            </div>
        </div>

       
    </section>
);

export default HeroTimeline;
