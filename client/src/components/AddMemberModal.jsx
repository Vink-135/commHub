import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { allUsersRoute, addMemberRoute } from "../utils/APIRoutes";
import "../styles/sidebar.css"; // Reuse sidebar styles for glass effect

export default function AddMemberModal({ closeModal, currentChannel, currentUser }) {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await axios.get(`${allUsersRoute}/${currentUser._id}`);
                // Safe check for members array structure
                const memberIds = currentChannel.members.map(m => typeof m === 'object' ? m._id : m);

                const nonMembers = data.filter(user => !memberIds.includes(user._id));
                setUsers(nonMembers);
                setIsLoading(false);
            } catch (err) {
                toast.error("Failed to load users");
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, [currentUser, currentChannel]);

    const handleAddMember = async (user) => {
        try {
            const { data } = await axios.post(addMemberRoute, {
                channelId: currentChannel._id,
                memberId: user._id,
                adminId: currentUser._id
            });

            if (data.status) {
                toast.success(`${user.username} added successfully!`);
                setUsers(prev => prev.filter(u => u._id !== user._id));
            } else {
                toast.error(data.msg);
            }
        } catch (err) {
            toast.error("Error adding member");
        }
    };

    // Styles
    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    };

    const containerStyle = {
        background: 'rgba(29, 29, 45, 0.95)',
        padding: '2rem',
        borderRadius: '1rem',
        width: '400px',
        maxWidth: '90%',
        border: '1px solid var(--border-glass)',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        position: 'relative',
        maxHeight: '80vh'
    };

    const closeButtonStyle = {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        fontSize: '1.2rem'
    };

    const listStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        overflowY: 'auto',
        paddingRight: '0.5rem',
        maxHeight: '300px'
    };

    const itemStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.8rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '0.5rem',
        border: '1px solid transparent',
        transition: 'all 0.2s ease'
    };

    return (
        <div style={overlayStyle} onClick={closeModal}>
            <div style={containerStyle} onClick={(e) => e.stopPropagation()}>
                <div style={closeButtonStyle} onClick={closeModal}>
                    <FaTimes />
                </div>
                <h2 style={{ color: 'white' }}>Add Members</h2>

                {isLoading ? (
                    <div style={{ color: 'white' }}>Loading...</div>
                ) : users.length > 0 ? (
                    <div style={listStyle} className="custom-scrollbar">
                        {users.map(user => (
                            <div key={user._id} style={itemStyle} className="user-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <img
                                        src={user.avatarImage}
                                        alt=""
                                        style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                                    />
                                    <span style={{ color: 'var(--text-main)' }}>{user.username}</span>
                                </div>
                                <button
                                    className="glass-btn-secondary"
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                    onClick={() => handleAddMember(user)}
                                >
                                    Add
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ color: 'var(--text-muted)' }}>No users to add.</div>
                )}
            </div>
        </div>
    );
}
