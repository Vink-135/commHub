import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/welcome.css";

export default function Welcome() {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("chat-app-user")) {
            navigate("/chat");
        } else {
            // Redirect after animation (3s)
            const timer = setTimeout(() => {
                navigate("/login");
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [navigate]);

    return (
        <div className="welcome-container">
            <h1 className="welcome-text">
                WELCOME TO <span className="highlight">CommHub</span>
            </h1>
        </div>
    );
}
