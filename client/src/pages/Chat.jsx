import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { allUsersRoute, host, getChannelsRoute, getContactsRoute } from "../utils/APIRoutes";
import Sidebar from "../components/Sidebar";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import "../styles/chatpage.css";

function Chat() {
    const navigate = useNavigate();
    const socket = useRef();

    const [contacts, setContacts] = useState([]);
    const [channels, setChannels] = useState([]);

    const [currentChat, setCurrentChat] = useState(undefined);
    const [currentChatType, setCurrentChatType] = useState(undefined);

    const [currentUser, setCurrentUser] = useState(undefined);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        const checkUser = async () => {
            if (!localStorage.getItem("chat-app-user")) {
                navigate("/login");
            } else {
                setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
            }
        };
        checkUser();
    }, []);

    useEffect(() => {
        if (currentUser) {
            socket.current = io(host);
            socket.current.emit("add-user", currentUser._id);

            socket.current.on("online-users", (users) => {
                setOnlineUsers(users);
            });
        }
    }, [currentUser]);

    const fetchContactsAndChannels = async () => {
        if (currentUser) {
            try {
                // Fetch only contacts with message history
                const dataUsers = await axios.get(`${getContactsRoute}/${currentUser._id}`);
                setContacts(dataUsers.data);

                const dataChannels = await axios.get(`${getChannelsRoute}/${currentUser._id}`);
                setChannels(dataChannels.data);
            } catch (err) {
                console.error("Error fetching contacts/channels:", err);
            }
        }
    };

    useEffect(() => {
        fetchContactsAndChannels();
    }, [currentUser]);

    const handleChatChange = (chat) => {
        // Determine type based on whether it has a 'name' property (channel) or 'username' (DM)
        const type = chat.name ? 'channel' : 'dm';
        setCurrentChat(chat);
        setCurrentChatType(type);
    };

    const handleStartDM = (user) => {
        // Add user to contacts if not already present so they appear in sidebar
        const exists = contacts.find(c => c._id === user._id);
        if (!exists) {
            setContacts(prev => [user, ...prev]);
        }
        handleChatChange(user);
    };

    return (
        <div className={`chat-page-container ${currentChat ? 'chat-active' : 'sidebar-active'}`}>
            <div className={`sidebar-wrapper ${currentChat ? 'hidden-on-mobile' : ''}`}>
                <Sidebar
                    contacts={contacts}
                    channels={channels}
                    changeChat={handleChatChange}
                    currentUser={currentUser}
                    socket={socket}
                    onlineUsers={onlineUsers}
                    handleStartDM={handleStartDM}
                />
            </div>
            {currentChat === undefined ? (
                <div className={`welcome-wrapper ${currentChat ? 'hidden-on-mobile' : ''}`}>
                    <Welcome currentUser={currentUser} />
                </div>
            ) : (
                <div className={`chat-wrapper ${!currentChat ? 'hidden-on-mobile' : ''}`} style={{ height: '100%', width: '100%' }}>
                    <ChatContainer
                        currentChat={currentChat}
                        currentChatType={currentChatType}
                        currentUser={currentUser}
                        socket={socket}
                        onlineUsers={onlineUsers}
                        handleChatBack={() => setCurrentChat(undefined)}
                    />
                </div>
            )}
        </div>
    );
}

export default Chat;
