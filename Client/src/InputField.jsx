import React from "react";

const InputField = () => {
    return (
        <div style={styles.container}>
            <input
                type="text"
                placeholder="Search Google or type a URL"
                style={styles.input}
            />
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",   // <--- stick to bottom
        padding: "20px",
        backgroundColor: "#f8f9fa",
        height: "100vh",
        boxSizing: "border-box",
        width: "50%"   // important to handle padding correctly
    },
    
    input: {
        width: "100%",
        maxWidth: "600px",
        padding: "12px 20px",
        fontSize: "16px",
        borderRadius: "24px",
        border: "1px solid #dfe1e5",
        outline: "none",
        boxShadow: "0 1px 6px rgba(32, 33, 36, 0.28)",
        transition: "box-shadow 0.2s ease-in-out",
        backgroundColor: "#fff",
        color: "#202124",
    },
};

export default InputField;