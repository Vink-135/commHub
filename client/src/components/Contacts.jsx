import React, { useState, useEffect } from "react";
import "../styles/chat.css";
// import Logo from "../assets/logo.svg"; // Assuming no logo file yet

export default function Contacts({ contacts, changeChat, currentUser }) {
    const [currentUserName, setCurrentUserName] = useState(undefined);
    const [currentUserImage, setCurrentUserImage] = useState(undefined);
    const [currentSelected, setCurrentSelected] = useState(undefined);

    useEffect(() => {
        if (currentUser) {
            setCurrentUserImage(currentUser.avatarImage);
            setCurrentUserName(currentUser.username);
        }
    }, [currentUser]);

    const changeCurrentChat = (index, contact) => {
        setCurrentSelected(index);
        changeChat(contact);
    };

    return (
        <>
            {currentUserName && (
                <div className="contacts-container">
                    <div className="brand">
                        {/* <img src={Logo} alt="logo" /> */}
                        <h3>CommHub</h3>
                    </div>
                    <div className="contacts">
                        {contacts.map((contact, index) => {
                            return (
                                <div
                                    key={index}
                                    className={`contact ${index === currentSelected ? "selected" : ""
                                        }`}
                                    onClick={() => changeCurrentChat(index, contact)}
                                >
                                    <div className="avatar">
                                        <img
                                            src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                                            alt=""
                                        />
                                    </div>
                                    <div className="username">
                                        <h3>{contact.username}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="current-user">
                        <div className="avatar">
                            <img
                                src={`data:image/svg+xml;base64,${currentUserImage}`}
                                alt="avatar"
                            />
                        </div>
                        <div className="username">
                            <h2>{currentUserName}</h2>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
