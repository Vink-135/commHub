import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/APIRoutes";
import logo from "../assets/logo.png";
import "../styles/auth.css"; // We'll update this global css or verify it uses global vars

export default function Login() {
    const navigate = useNavigate();
    const [values, setValues] = useState({ username: "", password: "" });

    useEffect(() => {
        if (localStorage.getItem("chat-app-user")) {
            navigate("/chat");
        }
    }, []);

    const handleChange = (event) => {
        setValues({ ...values, [event.target.name]: event.target.value });
    };

    const handleValidation = () => {
        const { password, username } = values;
        if (password === "") {
            toast.error("Username and Password are required.", { theme: "dark" });
            return false;
        } else if (username.length === "") {
            toast.error("Username and Password are required.", { theme: "dark" });
            return false;
        }
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (handleValidation()) {
            const { username, password } = values;
            const { data } = await axios.post(loginRoute, { username, password });
            if (data.status === false) {
                toast.error(data.msg, { theme: "dark" });
            }
            if (data.status === true) {
                localStorage.setItem(
                    "chat-app-user",
                    JSON.stringify(data.user)
                );
                navigate("/chat");
            }
        }
    };

    return (
        <>
            <div className="auth-container flex-center">
                <div className="auth-card glass-panel-heavy animate-entrance">
                    <div className="brand flex-center">
                        <img src={logo} alt="logo" className="animate-float brand-logo" />
                        <h1>COMMHUB</h1>
                    </div>
                    <form onSubmit={(event) => handleSubmit(event)}>
                        <input
                            type="text"
                            placeholder="Username"
                            name="username"
                            onChange={(e) => handleChange(e)}
                            min="3"
                            className="glass-input"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            onChange={(e) => handleChange(e)}
                            className="glass-input"
                        />
                        <button type="submit" className="glass-btn">LOG IN</button>
                    </form>
                    <span className="auth-link">
                        Don't have an account? <Link to="/register">Create One</Link>
                    </span>
                </div>
            </div>
            <ToastContainer />
        </>
    );
}
