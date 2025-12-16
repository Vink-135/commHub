import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaUserCheck, FaUserTimes, FaCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { getChannelDetailsRoute, handleJoinRequestRoute, addMemberRoute } from "../utils/APIRoutes";
import "../styles/sidebar.css";

export default function ChannelInfoModal({ closeModal, channelId, currentUser, onlineUsers = [] }) {
    const [channelData, setChannelData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("members"); // members, requests

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const { data } = await axios.get(`${getChannelDetailsRoute}/${channelId}`);
                setChannelData(data);
                setIsLoading(false);
            } catch (err) {
                toast.error("Failed to load channel details");
                setIsLoading(false);
            }
        };
        if (channelId) fetchDetails();
    }, [channelId]);

    const handleRequestAction = async (userId, action) => {
        try {
            const { data } = await axios.post(handleJoinRequestRoute, {
                channelId,
                userId,
                action, // 'approve' or 'reject'
                adminId: currentUser._id
            });
            if (data.status) {
                toast.success(`Request ${action}ed`);
                setChannelData(data.channel); // Update local state
            } else {
                toast.error(data.msg);
            }
        } catch (err) {
            toast.error("Action failed");
        }
    };

    // Styles
    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    };
    const containerStyle = {
        background: 'rgba(29, 29, 45, 0.95)', padding: '2rem', borderRadius: '1rem',
        width: '500px', maxWidth: '90%', border: '1px solid var(--border-glass)',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '1rem',
        position: 'relative', maxHeight: '80vh'
    };
    const tabContainerStyle = { display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' };
    const tabStyle = (isActive) => ({
        cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '0.5rem',
        background: isActive ? 'var(--neon-primary)' : 'transparent',
        color: isActive ? 'white' : 'var(--text-muted)',
        fontWeight: isActive ? 'bold' : 'normal'
    });

    if (isLoading) return null;

    const isAdmin = channelData?.admin === currentUser._id;

    return (
        <div style={overlayStyle} onClick={closeModal}>
            <div style={containerStyle} onClick={e => e.stopPropagation()}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={closeModal}>
                    <FaTimes />
                </div>
                <h2 style={{ color: 'white' }}>{channelData.name} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({channelData.type})</span></h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{channelData.description || "No description"}</p>

                <div style={tabContainerStyle}>
                    <div style={tabStyle(activeTab === 'members')} onClick={() => setActiveTab('members')}>
                        Members ({channelData.members.length})
                    </div>
                    {isAdmin && channelData.type === 'private' && (
                        <div style={tabStyle(activeTab === 'requests')} onClick={() => setActiveTab('requests')}>
                            Requests ({channelData.joinRequests.length})
                        </div>
                    )}
                </div>

                <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {activeTab === 'members' && (
                        channelData.members.map(member => (
                            <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                <img src={member.avatarImage} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                                <div style={{ flex: 1 }}>
                                    <span style={{ color: 'white', display: 'block' }}>{member.username}</span>
                                </div>

                                {onlineUsers.includes(member._id) ? (
                                    <FaCircle style={{ color: 'var(--success)', fontSize: '0.6rem' }} title="Online" />
                                ) : (
                                    <FaCircle style={{ color: 'var(--text-muted)', fontSize: '0.6rem' }} title="Offline" />
                                )}

                                {channelData.admin === member._id && <span style={{ fontSize: '0.7rem', color: 'var(--neon-primary)', border: '1px solid var(--neon-primary)', padding: '0.1rem 0.3rem', borderRadius: '0.2rem' }}>Admin</span>}
                            </div>
                        ))
                    )}

                    {activeTab === 'requests' && (
                        channelData.joinRequests.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No pending requests</div>
                        ) : (
                            channelData.joinRequests.map(req => (
                                <div key={req._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <img src={req.avatarImage} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                                        <span style={{ color: 'white' }}>{req.username}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="glass-btn-secondary"
                                            style={{ padding: '0.3rem', color: 'var(--success)' }}
                                            onClick={() => handleRequestAction(req._id, 'approve')}
                                            title="Approve"
                                        >
                                            <FaUserCheck />
                                        </button>
                                        <button
                                            className="glass-btn-secondary"
                                            style={{ padding: '0.3rem', color: 'var(--danger)' }}
                                            onClick={() => handleRequestAction(req._id, 'reject')}
                                            title="Reject"
                                        >
                                            <FaUserTimes />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
