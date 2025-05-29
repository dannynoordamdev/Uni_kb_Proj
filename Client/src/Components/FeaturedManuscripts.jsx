import React from "react";

const FeaturedManuscripts = () => (
    <section
        className="hero-container"
        style={{
            backgroundImage: "linear-gradient(#273d5a, #122a46)",
            position: "relative",
            overflow: "hidden",
            height: `200vh`,
        }}
    >
        {/* Wig shape at the top */}
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "15vw",
                backgroundColor: "#f0f0f0",
                clipPath: "polygon(0 0, 100% 0, 0 100%)",
                zIndex: 1,
            }}
        />

        {/* Content: Title + Cards */}
        <div
            className="featured"
            style={{
                zIndex: 2,
                position: "relative",
                padding: "4rem 2rem",
                maxWidth: "1200px",
                margin: "0 auto",
                color: "white",
                display: "flex",
                flexDirection: "column",
                justifyContent: "start",
                height: "100%",
            }}
        >
            <h1
                className="hero-title"
                style={{ textAlign: "center", marginBottom: "2rem" }}
            >
                Topstukken
            </h1>

            {/* Grid of cards */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "2rem",
                }}
            >
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        style={{
                            backgroundColor: "white",
                            borderRadius: "1rem",
                            padding: "2rem",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                            color: "#122a46",
                            transition: "transform 0.3s ease",
                            width: "250px",
                            height: "500px",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = "translateY(-5px)")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "translateY(0)")
                        }
                    >
                        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
                            Manuscript {item}
                        </h2>
                        <p style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                            Dit is een korte beschrijving van topstuk {item}. Meer informatie
                            volgt later.
                        </p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default FeaturedManuscripts;
