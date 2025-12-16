import React, { useState } from "react";
// import styled from "styled-components";
import { FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { createChannelRoute } from "../utils/APIRoutes";
import "../styles/chat.css"; // Reuse chat/modal styles

export default function CreateChannelModal({ closeModal, currentUser, parentChannel = null }) {
    const [channelName, setChannelName] = useState("");
    const [description, setDescription] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);

    const handleCreate = async () => {
        if (channelName.length < 3) {
            toast.error("Channel name must be > 3 characters");
            return;
        }

        try {
            const { data } = await axios.post(createChannelRoute, {
                name: channelName,
                description,
                type: isPrivate ? "private" : "public",
                admin: currentUser._id,
                parentId: parentChannel ? parentChannel._id : null
            });

            if (data.status) {
                toast.success(parentChannel ? "Subchannel Created!" : "Channel Created!");
                setTimeout(() => {
                    closeModal();
                    window.location.reload(); // Simple reload to refresh lists
                }, 1000);
            } else {
                toast.error(data.msg);
            }
        } catch (err) {
            toast.error("Error creating channel");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel-heavy animate-entrance">
                <div className="modal-header">
                    <h2>{parentChannel ? `Create Subchannel` : "Create Channel"}</h2>
                    <FaTimes onClick={closeModal} className="close-icon" />
                </div>
                <div className="modal-body">
                    <div className="input-group">
                        <label>Channel Name</label>
                        <input
                            className="glass-input"
                            type="text"
                            placeholder="e.g. project-x"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Description (Optional)</label>
                        <textarea
                            className="glass-input"
                            placeholder="What's this channel about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                        />
                    </div>
                    <div className="input-group toggle-group">
                        <label className="switch">
                            <input type="checkbox" checked={isPrivate} onChange={() => setIsPrivate(!isPrivate)} />
                            <span className="slider round"></span>
                        </label>
                        <span>{isPrivate ? "Private Channel (Invite Only)" : "Public Channel (Anyone can join)"}</span>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="glass-btn" onClick={handleCreate}>Create</button>
                </div>
            </div>
            <ToastContainer />
            <style>{`
            .modal-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(5px);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                width: 400px;
                padding: 2rem;
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                border-radius: 1.5rem;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .close-icon {
                cursor: pointer;
                color: var(--text-muted);
                transition: color 0.2s;
            }
            .close-icon:hover { color: var(--danger); }
            .input-group {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            .input-group label {
                font-size: 0.9rem;
                color: var(--text-muted);
                text-transform: uppercase;
                letter-spacing: 0.05rem;
            }
            textarea.glass-input {
                resize: none;
            }
            .toggle-group {
                flex-direction: row;
                align-items: center;
                gap: 1rem;
            }
            /* Switch */
            .switch {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 24px;
            }
            .switch input { opacity: 0; width: 0; height: 0; }
            .slider {
                position: absolute;
                cursor: pointer;
                top: 0; left: 0; right: 0; bottom: 0;
                background-color: rgba(255,255,255,0.2);
                transition: .4s;
            }
            .slider:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: .4s;
            }
            input:checked + .slider {
                background-color: var(--neon-primary);
            }
            input:checked + .slider:before {
                transform: translateX(26px);
            }
            .slider.round { border-radius: 34px; }
            .slider.round:before { border-radius: 50%; }
        `}</style>
        </div>
    );
}
