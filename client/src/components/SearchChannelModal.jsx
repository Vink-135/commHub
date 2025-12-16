import React, { useState } from "react";
import axios from "axios";
import { FaTimes, FaHashtag, FaLock, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import { searchChannelsRoute, joinChannelRoute, requestJoinChannelRoute } from "../utils/APIRoutes";
import "../styles/sidebar.css";

export default function SearchChannelModal({ closeModal, currentUser }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            const { data } = await axios.get(`${searchChannelsRoute}?query=${query}`);
            setResults(data);
        } catch (err) {
            toast.error("Error searching channels");
        } finally {
            setIsSearching(false);
        }
    };

    const handleJoin = async (channel) => {
        try {
            if (channel.type === "public") {
                const { data } = await axios.post(joinChannelRoute, {
                    channelId: channel._id,
                    userId: currentUser._id
                });
                if (data.status) {
                    toast.success(`Joined ${channel.name}`);
                    closeModal();
                    window.location.reload();
                }
            } else {
                // Private channel request
                const { data } = await axios.post(requestJoinChannelRoute, {
                    channelId: channel._id,
                    userId: currentUser._id
                });
                if (data.status) {
                    toast.success(`Your request to join #${channel.name} has been sent successfully.`);
                } else {
                    toast.error(data.msg || "Failed to send request");
                }
            }
        } catch (err) {
            toast.error("Action failed");
        }
    };

    // Styles (Inline to avoid styled-components dependency issues)
    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    };
    const containerStyle = {
        background: 'rgba(29, 29, 45, 0.95)', padding: '2rem', borderRadius: '1rem',
        width: '500px', maxWidth: '90%', border: '1px solid var(--border-glass)',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '1.5rem',
        position: 'relative', maxHeight: '80vh'
    };
    const inputStyle = {
        background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)',
        padding: '0.8rem', borderRadius: '0.5rem', color: 'white', width: '100%', outline: 'none'
    };

    return (
        <div style={overlayStyle} onClick={closeModal}>
            <div style={containerStyle} onClick={e => e.stopPropagation()}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={closeModal}>
                    <FaTimes />
                </div>
                <h2 style={{ color: 'white' }}>Search Channels</h2>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="Search by channel name..."
                        style={inputStyle}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button type="submit" className="glass-btn-secondary" style={{ padding: '0.8rem' }}>
                        <FaSearch />
                    </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto', maxHeight: '400px', paddingRight: '0.5rem' }} className="custom-scrollbar">
                    {results.length > 0 ? (
                        results.map(channel => {
                            const isMember = channel.members.includes(currentUser._id);
                            const isRequested = channel.joinRequests && channel.joinRequests.includes(currentUser._id);

                            return (
                                <div key={channel._id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>
                                            {channel.type === 'private' ? <FaLock /> : <FaHashtag />}
                                        </span>
                                        <div>
                                            <div style={{ color: 'white', fontWeight: 'bold' }}>{channel.name}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                {channel.members.length} members
                                            </div>
                                        </div>
                                    </div>

                                    {isMember ? (
                                        <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>Joined</span>
                                    ) : isRequested ? (
                                        <span style={{ color: 'var(--warning)', fontSize: '0.8rem' }}>Pending</span>
                                    ) : (
                                        <button
                                            className="glass-btn-secondary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                            onClick={() => handleJoin(channel)}
                                        >
                                            {channel.type === 'public' ? 'Join' : 'Request'}
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    ) : isSearching ? (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Searching...</div>
                    ) : (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                            {query ? "No results found" : "Type to search..."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
