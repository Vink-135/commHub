import React, { useState } from "react";
import axios from "axios";
import { FaTimes, FaSearch, FaComment } from "react-icons/fa";
import { toast } from "react-toastify";
import { searchUsersRoute } from "../utils/APIRoutes";
import "../styles/sidebar.css";

export default function SearchUserModal({ closeModal, currentUser, handleStartDM }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            const { data } = await axios.get(`${searchUsersRoute}?query=${query}`);
            // Filter out self if returned
            const filtered = data.filter(u => u._id !== currentUser._id);
            setResults(filtered);
        } catch (err) {
            toast.error("Error searching users");
        } finally {
            setIsSearching(false);
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
                <h2 style={{ color: 'white' }}>Start a Direct Message</h2>

                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="Search for users..."
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
                        results.map(user => (
                            <div key={user._id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <img src={user.avatarImage} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                                    <span style={{ color: 'white', fontWeight: 'bold' }}>{user.username}</span>
                                </div>

                                <button
                                    className="glass-btn-secondary"
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                    onClick={() => handleStartDM(user)}
                                >
                                    <FaComment /> Start DM
                                </button>
                            </div>
                        ))
                    ) : isSearching ? (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Searching...</div>
                    ) : (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                            {query ? "No users found" : "Type to search..."}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
