import React, { useState, useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import axios from "axios";
import { addMessageRoute, getMessageRoute, deleteMessageRoute, host } from "../utils/APIRoutes";
import { v4 as uuidv4 } from "uuid";
import { FaHashtag, FaArrowLeft, FaUserPlus, FaInfoCircle, FaFileDownload } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import AddMemberModal from "./AddMemberModal";
import ChannelInfoModal from "./ChannelInfoModal";
import ImagePreviewModal from "./ImagePreviewModal"; // Added import
import "../styles/chat.css";

// Moved TypingIndicator component outside or to its own file as per user's implied intent
const TypingIndicator = ({ typingUser }) => {
    if (!typingUser) return null;
    return (
        <div className="typing-indicator" style={{
            padding: '0 2rem',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            fontStyle: 'italic',
            marginBottom: '0.5rem'
        }}>
            {typingUser} is typing...
        </div>
    );
};

export default function ChatContainer({ currentChat, currentChatType, currentUser, socket, onlineUsers = [], handleChatBack }) {
    const [messages, setMessages] = useState([]);
    const scrollRef = useRef();
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // Channel Info Modal
    const [previewImage, setPreviewImage] = useState(null); // Added state for image preview

    useEffect(() => {
        // ... (rest is same)

        // (Around render)
        const fetchMsgs = async () => {
            if (currentChat) {
                const response = await axios.post(getMessageRoute, {
                    from: currentUser._id,
                    to: currentChat._id,
                    type: currentChatType, // 'channel' or 'dm'
                });
                setMessages(response.data);
            }
        };
        fetchMsgs();

        // Socket: Join Channel Room
        if (currentChatType === 'channel' && socket.current) {
            socket.current.emit("join-channel", currentChat._id);
        }

    }, [currentChat, currentChatType]);

    const handleSendMsg = async (msg) => {
        try {
            const { data } = await axios.post(addMessageRoute, {
                from: currentUser._id,
                to: currentChat._id,
                message: msg,
                type: currentChatType,
            });

            if (data.status) {
                // Use the returned message data to ensure we have the _id
                const newMessage = {
                    fromSelf: true,
                    message: msg,
                    _id: data.msg._id, // Important: capture the ID
                    createdAt: data.msg.createdAt,
                    sender: currentUser
                };

                socket.current.emit(currentChatType === 'channel' ? "send-channel-msg" : "send-msg", {
                    to: currentChat._id,
                    from: currentUser._id,
                    msg,
                    senderName: currentUser.username,
                    avatar: currentUser.avatarImage,
                    type: currentChatType === 'channel' ? 'channel' : 'dm'
                });

                setMessages((prev) => [...prev, newMessage]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    useEffect(() => {
        const socketInstance = socket.current;
        if (socketInstance) {
            const handleMsgReceive = (msg) => {
                setArrivalMessage({ fromSelf: false, message: msg });
            };
            const handleChannelMsgReceive = (data) => {
                // NOTE: The 'data' from server is { to, from, msg ... }
                if (data.from !== currentUser._id) { // Don't double add self-message if broadcasted back?
                    setArrivalMessage({
                        fromSelf: false,
                        message: data.msg,
                        channelId: data.to,
                        sender: { _id: data.from, username: data.senderName, avatarImage: data.avatar }, // Added sender info
                        createdAt: new Date().toISOString() // Added timestamp
                    });
                }
            };
            const handleMsgDeleted = (id) => { // Added listener for deleted messages
                setMessages((prev) => prev.filter((msg) => msg._id !== id));
            };

            socketInstance.on("msg-recieve", handleMsgReceive);
            socketInstance.on("channel-msg-recieve", handleChannelMsgReceive);
            socketInstance.on("msg-deleted", handleMsgDeleted); // Register new listener

            return () => {
                socketInstance.off("msg-recieve", handleMsgReceive);
                socketInstance.off("channel-msg-recieve", handleChannelMsgReceive);
                socketInstance.off("msg-deleted", handleMsgDeleted); // Clean up new listener
            };
        }
    }, [currentUser._id]); // Depend on currentUser._id to ensure correct closure for `data.from !== currentUser._id`

    useEffect(() => {
        if (arrivalMessage) {
            // If it's a channel msg, verify it belongs to current channel
            if (arrivalMessage.channelId) {
                if (currentChat && currentChat._id === arrivalMessage.channelId) {
                    setMessages((prev) => [...prev, arrivalMessage]);
                }
            } else {
                // DM
                setMessages((prev) => [...prev, arrivalMessage]);
            }
        }
    }, [arrivalMessage, currentChat]); // Added currentChat to dependencies for correct check

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Typing Logic
    const [typingUser, setTypingUser] = useState(null);
    const typingTimeout = useRef(null); // Corrected: useRef object

    const handleTyping = (isTyping) => {
        if (socket.current) {
            if (isTyping) {
                socket.current.emit("typing", {
                    to: currentChat._id,
                    from: currentUser.username,
                    type: currentChatType
                });
            } else {
                /* We handle stop logic via timeout usually or explicit blur, 
                   but here we just emit typing on change. 
                   Proper way: debounce or send stop after delay. */
                /* For simplicity, we assume continuous typing sends "typing". 
                   We need a timeout here to send "stop-typing". */
            }

            // Debounced stop-typing
            clearTimeout(typingTimeout.current); // Access .current
            typingTimeout.current = setTimeout(() => { // Assign to .current
                socket.current.emit("stop-typing", {
                    to: currentChat._id,
                    from: currentUser.username,
                    type: currentChatType
                });
            }, 1000);
        }
    };

    useEffect(() => {
        if (socket.current) {
            const handleDisplayTyping = (data) => {
                if (data.to === currentChat?._id || data.to === currentUser._id) { // Channel ID or My ID (DM)
                    // If DM, check from sender. 
                    if (data.from !== currentUser.username) {
                        setTypingUser(data.from);
                    }
                }
            };
            const handleHideTyping = () => {
                setTypingUser(null);
            };

            socket.current.on("display-typing", handleDisplayTyping);
            socket.current.on("hide-typing", handleHideTyping);

            return () => {
                socket.current.off("display-typing", handleDisplayTyping);
                socket.current.off("hide-typing", handleHideTyping);
            };
        }
    }, [currentChat, currentUser]); // Added currentChat and currentUser to dependencies to ensure correct closure values

    const formatTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
        return date.toLocaleDateString();
    };

    const handleDeleteMessage = async (msgId) => {
        try {
            const { data } = await axios.post(deleteMessageRoute, {
                id: msgId,
                from: currentUser._id
            });

            if (data.status) {
                // Emit socket event
                socket.current.emit("msg-delete", {
                    id: msgId,
                    to: currentChat._id,
                    type: currentChat.username ? "dm" : "channel"
                });
                // Remove locally
                setMessages((prev) => prev.filter((msg) => msg._id !== msgId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const renderMessages = () => {
        let lastDate = null;
        return messages.map((message, index) => {
            const isVoiceMessage = typeof message.message === 'object' && message.message.type === 'voice';
            const isImage = typeof message.message === 'object' && message.message.type === 'image';
            const isFile = typeof message.message === 'object' && message.message.type === 'file';

            const messageDate = formatDate(message.createdAt);
            const showDateDivider = messageDate !== lastDate;
            lastDate = messageDate;

            return (
                <div key={message._id || index}> {/* Prefer unique ID if available */}
                    {showDateDivider && (
                        <div className="date-divider">
                            <span>{messageDate}</span>
                        </div>
                    )}
                    <div ref={scrollRef}>
                        <div className={`message ${message.fromSelf ? "sended" : "recieved"} `}>
                            <div className="content">
                                {message.fromSelf && (
                                    <div className="delete-icon" onClick={() => handleDeleteMessage(message._id)}>
                                        <MdDelete />
                                    </div>
                                )}
                                {!message.fromSelf && message.sender && (
                                    <div className="message-sender" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--neon-primary)', marginBottom: '0.2rem' }}>
                                        {message.sender.username}
                                    </div>
                                )}
                                {isVoiceMessage ? (
                                    <div className="voice-message">
                                        <div className="voice-icon">🎤</div>
                                        <audio controls className="voice-player">
                                            <source src={message.message.audioUrl} type="audio/webm" />
                                        </audio>
                                        <span className="voice-duration">{message.message.duration}s</span>
                                    </div>
                                ) : isImage ? (
                                    <div className="image-message">
                                        <img
                                            src={`${host}${message.message.fileUrl} `}
                                            alt={message.message.fileName}
                                            onClick={() => setPreviewImage(`${host}${message.message.fileUrl} `)}
                                            style={{ maxWidth: '200px', cursor: 'pointer', borderRadius: '8px' }}
                                        />
                                    </div>
                                ) : isFile ? (
                                    <div className="file-message" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                                        <FaFileDownload style={{ fontSize: '1.5rem' }} />
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{message.message.fileName}</div>
                                            <a href={`${host}${message.message.fileUrl} `} download target="_blank" rel="noreferrer" style={{ color: 'var(--neon-secondary)', fontSize: '0.8rem' }}>
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <p>{message.message}</p>
                                )}
                                <div className="message-time" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textAlign: 'right', marginTop: '0.2rem' }}>
                                    {formatTime(message.createdAt || new Date().toISOString())}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="chat-area">
            <div className="chat-header">
                <div className="mobile-back-btn" onClick={handleChatBack}>
                    <FaArrowLeft />
                </div>
                <div
                    className="user-details"
                    onClick={() => currentChatType === 'channel' && setIsInfoModalOpen(true)}
                    style={{ cursor: currentChatType === 'channel' ? 'pointer' : 'default' }}
                >
                    {currentChatType === 'channel' ? (
                        <div className="avatar channel-icon-large">
                            <FaHashtag />
                        </div>
                    ) : (
                        <div className="avatar">
                            <img
                                src={currentChat.avatarImage?.startsWith('http') || currentChat.avatarImage?.startsWith('/') || currentChat.avatarImage?.startsWith('data:')
                                    ? currentChat.avatarImage
                                    : `data: image / svg + xml; base64, ${currentChat.avatarImage} `}
                                alt=""
                            />
                            <div className={`status - indicator ${onlineUsers.includes(String(currentChat._id)) ? 'online' : 'offline'} `}></div>
                        </div>
                    )}

                    <div className="username">
                        <h3>{currentChatType === 'channel' ? currentChat.name : currentChat.username}</h3>
                        {currentChatType === 'channel' && <span className="channel-desc">{currentChat.description}</span>}
                    </div>
                </div>

                {currentChatType === 'channel' && currentChat.type === 'private' && currentChat.admin === currentUser._id && (
                    <button
                        className="glass-btn-secondary"
                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}
                        onClick={(e) => { e.stopPropagation(); setIsAddMemberModalOpen(true); }}
                        title="Add Member"
                    >
                        <FaUserPlus />
                        <span className="hidden-mobile">Add Member</span>
                    </button>
                )}
                {currentChatType === 'channel' && (
                    <button
                        className="glass-btn-secondary"
                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: currentChat.type !== 'private' || currentChat.admin !== currentUser._id ? 'auto' : '0.5rem' }}
                        onClick={(e) => { e.stopPropagation(); setIsInfoModalOpen(true); }}
                        title="Channel Info"
                    >
                        <FaInfoCircle />
                        <span className="hidden-mobile">Info</span>
                    </button>
                )}
            </div>

            <div className="chat-messages">
                {renderMessages()}
            </div>

            <div className="chat-footer">
                <TypingIndicator typingUser={typingUser} />
                <ChatInput handleSendMsg={handleSendMsg} handleTyping={handleTyping} />
            </div>
            {isAddMemberModalOpen && (
                <AddMemberModal
                    closeModal={() => setIsAddMemberModalOpen(false)}
                    currentChannel={currentChat}
                    currentUser={currentUser}
                />
            )}
            {isInfoModalOpen && currentChatType === 'channel' && (
                <ChannelInfoModal
                    closeModal={() => setIsInfoModalOpen(false)}
                    channelId={currentChat._id}
                    currentUser={currentUser}
                    onlineUsers={onlineUsers}
                />
            )}
            <ImagePreviewModal
                isOpen={!!previewImage}
                imageUrl={previewImage}
                onClose={() => setPreviewImage(null)}
            />
        </div>
    );
}
