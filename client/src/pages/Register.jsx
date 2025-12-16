import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerRoute } from "../utils/APIRoutes";
import "../styles/auth.css";
import logo from "../assets/logo.png";

// Import avatars from src/assets
import avatar1 from "../assets/avatars/avatar1.png";
import avatar2 from "../assets/avatars/avatar2.png";
import avatar3 from "../assets/avatars/avatar3.png";
import avatar4 from "../assets/avatars/avatar4.png";
import avatar5 from "../assets/avatars/avatar5.png";
import avatar7 from "../assets/avatars/avatar7.png";
import avatar8 from "../assets/avatars/avatar8.png";
import avatar9 from "../assets/avatars/avatar9.png";
import avatar10 from "../assets/avatars/avatar10.png";

export default function Register() {
    const navigate = useNavigate();
    const [values, setValues] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // Define toast options
    const toastOptions = {
        position: "bottom-right",
        autoClose: 8000,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
    };

    const [selectedAvatar, setSelectedAvatar] = useState("");
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    // Custom avatars array using imported files
    const AVATAR_OPTIONS = [
        avatar1, avatar2, avatar3, avatar4, avatar5,
        avatar7, avatar8, avatar9, avatar10
    ];

    const handleChange = (event) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    };

    const handleValidation = () => {
        const { password, confirmPassword, username, email } = values;
        if (password !== confirmPassword) {
            toast.error("Password and confirm password should be same.", toastOptions);
            return false;
        } else if (username.length < 3) {
            toast.error("Username should be greater than 3 characters.", toastOptions);
            return false;
        } else if (password.length < 8) {
            toast.error("Password should be equal or greater than 8 characters.", toastOptions);
            return false;
        } else if (email === "") {
            toast.error("Email is required.", toastOptions);
            return false;
        } else if (!selectedAvatar) {
            toast.error("Please select an avatar.", toastOptions);
            return false;
        }
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (handleValidation()) {
            const { email, username, password } = values;
            try {
                // For local files, we need to convert to Base64 or just send text string?
                // The import gives us the path (e.g., /src/assets/...). 
                // But the backend expects a URL or Base64 string.
                // If it's a dev server, it's a path. In prod, it's a hashed filename.
                // We should convert image to base64 if we want to store it robustly in DB,
                // OR we just store the path if we are serving strict static.
                // However, importing in React gives the resolved URL.
                // We can just store 'selectedAvatar' which holds the resolved URL.

                const { data } = await axios.post(registerRoute, {
                    username,
                    email,
                    password,
                    avatarImage: selectedAvatar || avatar1,
                });

                if (data.status === false) {
                    toast.error(data.msg, toastOptions);
                }
                if (data.status === true) {
                    localStorage.setItem(
                        "chat-app-user",
                        JSON.stringify(data.user)
                    );
                    navigate("/chat");
                }
            } catch (err) {
                toast.error("Registration failed. Please try again.", toastOptions);
                console.error(err);
            }
        }
    };

    return (
        <>
            <div className="auth-container">
                <div className="auth-card glass-panel-heavy animate-entrance">
                    <div className="brand flex-center">
                        <div className="brand-logo-container">
                            <img src={logo} alt="logo" className="animate-float brand-logo" />
                        </div>
                        <h1>COMMHUB</h1>
                    </div>
                    <form onSubmit={(event) => handleSubmit(event)}>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Username"
                                name="username"
                                onChange={(e) => handleChange(e)}
                                className="glass-input"
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Email"
                                name="email"
                                onChange={(e) => handleChange(e)}
                                className="glass-input"
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                name="password"
                                onChange={(e) => handleChange(e)}
                                className="glass-input"
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                name="confirmPassword"
                                onChange={(e) => handleChange(e)}
                                className="glass-input"
                            />
                        </div>

                        {/* Avatar Selection */}
                        <div className="avatar-section">
                            <div className="avatar-selection-row">
                                <button
                                    type="button"
                                    className="glass-btn-secondary"
                                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                                >
                                    {selectedAvatar ? "CHANGE AVATAR" : "CHOOSE AVATAR"}
                                </button>
                                {selectedAvatar && (
                                    <div className="selected-avatar-preview-container">
                                        <img
                                            src={selectedAvatar}
                                            alt="Selected Avatar"
                                            className="selected-avatar-preview"
                                        />
                                    </div>
                                )}
                            </div>

                            {showAvatarPicker && (
                                <div className="avatar-picker glass-panel">
                                    {AVATAR_OPTIONS.map((avatar, index) => (
                                        <img
                                            key={index}
                                            src={avatar}
                                            alt={`Avatar ${index + 1}`}
                                            className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedAvatar(avatar);
                                                setShowAvatarPicker(false);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" className="glass-btn pulse-btn">CREATE USER</button>
                    </form>
                    <span className="auth-link">
                        Already have an account? <Link to="/login">LOGIN</Link>
                    </span>
                </div>
            </div>
            <ToastContainer />
        </>
    );
}


