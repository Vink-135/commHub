import React, { useState, useEffect } from "react";
// import styled from "styled-components";
import { FaHashtag, FaLock, FaPlus, FaCircle, FaChevronDown, FaChevronRight, FaTrash, FaSearch } from "react-icons/fa";
import CreateChannelModal from "./CreateChannelModal";
import SearchChannelModal from "./SearchChannelModal";
import SearchUserModal from "./SearchUserModal";
import "../styles/sidebar.css";
import axios from "axios";
import { deleteChannelRoute, deleteUserRoute } from "../utils/APIRoutes";
import { toast } from "react-toastify";

import logo from "../assets/logo.png";

export default function Sidebar({ currentUser, contacts, channels, changeChat, socket, onlineUsers = [], handleStartDM }) {
    const [currentSelected, setCurrentSelected] = useState(undefined);
    const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isUserSearchModalOpen, setIsUserSearchModalOpen] = useState(false);
    const [parentChannelForModal, setParentChannelForModal] = useState(null);
    const [expandedChannels, setExpandedChannels] = useState([]);

    const toggleChannelExpansion = (channelId) => {
        if (expandedChannels.includes(channelId)) {
            setExpandedChannels(expandedChannels.filter(id => id !== channelId));
        } else {
            setExpandedChannels([...expandedChannels, channelId]);
        }
    };

    const getTypeStr = (avatar) => {
        if (!avatar) return "";
        return avatar.startsWith('http') || avatar.startsWith('/') || avatar.startsWith('data:')
            ? avatar
            : `data:image/svg+xml;base64,${avatar}`;
    };

    const changeCurrentChat = (index, contact) => {
        setCurrentSelected(index);
        changeChat(contact);
    };

    const openCreateChannel = () => {
        setParentChannelForModal(null);
        setIsChannelModalOpen(true);
    };

    const openCreateSubChannel = (channel) => {
        setParentChannelForModal(channel);
        setIsChannelModalOpen(true);
    };

    const handleDeleteChannel = async (channelId) => {
        if (confirm("Are you sure you want to delete this channel? This cannot be undone.")) {
            try {
                const { data } = await axios.post(deleteChannelRoute, {
                    channelId,
                    userId: currentUser._id,
                });
                if (data.status) {
                    toast.success(data.msg);
                    window.location.reload(); // Reload to refresh list
                } else {
                    toast.error(data.msg);
                }
            } catch (err) {
                toast.error("Error deleting channel");
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (confirm("Are you sure you want to delete this USER? This cannot be undone and will remove them from the database.")) {
            try {
                // Assuming route is /delete/:id
                const { data } = await axios.delete(`${deleteUserRoute}/${userId}`);
                if (data.status) {
                    toast.success(data.msg);
                    window.location.reload();
                } else {
                    toast.error(data.msg);
                }
            } catch (err) {
                toast.error("Error deleting user");
            }
        }
    };

    return (
        <>
            <div className="sidebar-container glass-panel">
                <div className="sidebar-brand">
                    <img src={logo} alt="logo" />
                    <h3>CommHub</h3>
                </div>

                <div className="sidebar-sections">
                    {/* Channels */}
                    <div className="channels-section">
                        <div className="section-title">
                            <span>CHANNELS</span>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <FaSearch
                                    className="add-channel-icon"
                                    onClick={() => setIsSearchModalOpen(true)}
                                    title="Search Channels"
                                />
                                <FaPlus
                                    className="add-channel-icon"
                                    onClick={openCreateChannel}
                                    title="Create Channel"
                                />
                            </div>
                        </div>
                        <div className="channel-list">
                            {channels
                                .filter(channel => !channel.parentId) // Get only parents
                                .map((channel, index) => {
                                    const subChannels = channels.filter(c => c.parentId === channel._id);
                                    const isExpanded = expandedChannels.includes(channel._id);

                                    return (
                                        <div key={channel._id} className="channel-group">
                                            {/* Parent Channel */}
                                            <div
                                                className={`channel-item ${index === currentSelected ? "selected" : ""}`}
                                                onClick={() => changeCurrentChat(index, channel)}
                                            >
                                                <div className="flex-row items-center gap-2" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                                                    {subChannels.length > 0 && (
                                                        <span
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleChannelExpansion(channel._id);
                                                            }}
                                                            style={{ cursor: 'pointer', fontSize: '0.8rem', opacity: 0.7 }}
                                                        >
                                                            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                                        </span>
                                                    )}
                                                    <span className="channel-icon">
                                                        {channel.type === "private" ? <FaLock /> : <FaHashtag />}
                                                    </span>
                                                    <span className="chat-name" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{channel.name}</span>
                                                </div>

                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <FaPlus
                                                        className="subchannel-add-icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openCreateSubChannel(channel);
                                                        }}
                                                        title="Create subchannel"
                                                    />
                                                    {channel.admin === currentUser._id && (
                                                        <FaTrash
                                                            className="subchannel-add-icon" // Reusing hover logic
                                                            style={{ fontSize: '0.8rem', color: 'var(--danger)' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteChannel(channel._id);
                                                            }}
                                                            title="Delete Channel"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Subchannels */}
                                            {isExpanded && subChannels.length > 0 && (
                                                <div className="sub-channel-list" style={{ marginLeft: '1.5rem', borderLeft: '1px solid var(--border-glass)' }}>
                                                    {subChannels.map(sub => (
                                                        <div
                                                            key={sub._id}
                                                            className={`channel-item sub-item ${sub._id === (currentSelected && currentSelected._id) ? "selected" : ""}`}
                                                            onClick={() => changeCurrentChat(null, sub)} // Handle sub selection
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.95em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, overflow: 'hidden' }}>
                                                                <span className="channel-icon" style={{ fontSize: '0.9rem' }}>
                                                                    {sub.type === "private" ? <FaLock /> : <FaHashtag />}
                                                                </span>
                                                                <span className="chat-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.name}</span>
                                                            </div>
                                                            {sub.admin === currentUser._id && (
                                                                <FaTrash
                                                                    className="subchannel-add-icon"
                                                                    style={{ fontSize: '0.7rem', color: 'var(--danger)', opacity: 0.8 }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteChannel(sub._id);
                                                                    }}
                                                                    title="Delete Subchannel"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                        </div>
                    </div>

                    {/* DMs */}
                    <div className="dms-section">
                        <div className="section-title">
                            <span>DIRECT MESSAGES</span>
                            <FaPlus
                                className="add-channel-icon"
                                onClick={() => setIsUserSearchModalOpen(true)}
                                title="Start a Direct Message"
                            />
                        </div>
                        <div className="contact-list">
                            {contacts.map((contact, index) => {
                                const listIndex = index + channels.length;
                                return (
                                    <div
                                        className={`contact ${listIndex === currentSelected ? "selected" : ""}`}
                                        key={contact._id}
                                        onClick={() => changeCurrentChat(listIndex, contact)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1, overflow: 'hidden' }}>
                                            <img
                                                src={getTypeStr(contact.avatarImage)}
                                                className="avatar"
                                                alt="avatar"
                                            />
                                            <span className="chat-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.username}</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {onlineUsers.includes(String(contact._id)) ? (
                                                <FaCircle style={{ color: 'var(--success)', fontSize: '0.6rem' }} />
                                            ) : (
                                                <FaCircle style={{ color: 'var(--danger)', fontSize: '0.6rem' }} />
                                            )}
                                            <FaTrash
                                                className="subchannel-add-icon"
                                                style={{ fontSize: '0.8rem', color: 'var(--danger)' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteUser(contact._id);
                                                }}
                                                title="Delete User (Admin)"
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="current-user">
                    <div className="current-user-info">
                        <div className="avatar">
                            <img
                                src={currentUser?.avatarImage?.startsWith('data:') || currentUser?.avatarImage?.startsWith('http') || currentUser?.avatarImage?.startsWith('/')
                                    ? currentUser.avatarImage
                                    : `data:image/svg+xml;base64,${currentUser?.avatarImage}`}
                                alt="avatar"
                            />
                        </div>
                        <div className="username">
                            <h2>{currentUser?.username}</h2>
                        </div>
                    </div>
                    <button
                        className="logout-btn"
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/login';
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {isChannelModalOpen && (
                <CreateChannelModal
                    closeModal={() => setIsChannelModalOpen(false)}
                    currentUser={currentUser}
                    parentChannel={parentChannelForModal}
                />
            )}

            {isSearchModalOpen && (
                <SearchChannelModal
                    closeModal={() => setIsSearchModalOpen(false)}
                    currentUser={currentUser}
                />
            )}

            {isUserSearchModalOpen && (
                <SearchUserModal
                    closeModal={() => setIsUserSearchModalOpen(false)}
                    currentUser={currentUser}
                    handleStartDM={(user) => {
                        handleStartDM(user);
                        setIsUserSearchModalOpen(false);
                    }}
                />
            )}
        </>
    );
}
