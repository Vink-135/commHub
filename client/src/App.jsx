import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from "./pages/Register";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Welcome from "./pages/Welcome";

function App() {
    return (
        <Router>
            <div className="app-container" style={{ height: '100%', width: '100%' }}>
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Welcome />} />
                    <Route path="/chat" element={<Chat />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
