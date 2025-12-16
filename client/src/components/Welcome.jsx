import React, { useState, useEffect } from "react";
import "../styles/welcome.css";
import welcomeHand from "../assets/welcome-hand.png";

export default function Welcome({ currentUser }) {
    const [userName, setUserName] = useState("");

    useEffect(() => {
        if (currentUser) {
            setUserName(currentUser.username);
        }
    }, [currentUser]);

    return (
        <div className="welcome-container">
            <div className="welcome-content">
                <img src={welcomeHand} alt="Welcome" className="animate-float" style={{ height: '12rem' }} />
                <h1>Welcome, {userName}!</h1>
                <h3>Please select a chat to start messaging.</h3>
            </div>
        </div>
    );
}
