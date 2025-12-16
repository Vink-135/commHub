import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { uploadRoute } from "../utils/APIRoutes";
import { IoMdSend } from "react-icons/io";
import { BsEmojiSmileFill } from "react-icons/bs";
import { MdAttachFile } from "react-icons/md";
import { FaMicrophone, FaStop } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import "../styles/chat.css";

export default function ChatInput({ handleSendMsg, handleTyping }) {
    const [msg, setMsg] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    const handleEmojiPickerhideShow = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleEmojiClick = (emojiData) => {
        setMsg(prevMsg => prevMsg + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const sendChat = (event) => {
        event.preventDefault();
        if (msg.length > 0) {
            handleSendMsg(msg);
            setMsg("");
        }
    };

    const handleChange = (e) => {
        setMsg(e.target.value);
        if (handleTyping) handleTyping(e.target.value.length > 0);
    }

    const handleFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const { data } = await axios.post(uploadRoute, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (data.status) {
                    const isImage = file.type.startsWith("image/");
                    const msgType = isImage ? "image" : "file";

                    handleSendMsg({
                        type: msgType,
                        fileUrl: data.fileUrl,
                        fileName: data.fileName,
                        fileSize: data.fileSize,
                        message: `📎 ${data.fileName}` // Fallback text
                    });
                }
            } catch (error) {
                console.error("File upload failed:", error);
            }
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);

                // Send voice message with audio URL
                handleSendMsg({
                    type: 'voice',
                    audioUrl: audioUrl,
                    duration: recordingTime
                });

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            // Simulate audio level animation
            const animateLevel = () => {
                setAudioLevel(Math.random() * 100);
                animationRef.current = requestAnimationFrame(animateLevel);
            };
            animateLevel();

        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Please allow microphone access to record voice messages");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            setAudioLevel(0);
        }
    };

    const handleVoiceRecord = () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="chat-input-container">
            {showEmojiPicker && (
                <div className="emoji-picker-wrapper">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            )}

            {isRecording ? (
                <div className="recording-container">
                    <div className="recording-info">
                        <FaStop onClick={stopRecording} className="stop-icon" />
                        <div className="recording-waveform">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="wave-bar"
                                    style={{
                                        height: `${Math.random() * audioLevel}%`,
                                        animationDelay: `${i * 0.05}s`
                                    }}
                                />
                            ))}
                        </div>
                        <span className="recording-time">{formatTime(recordingTime)}</span>
                        <button onClick={stopRecording} className="send-btn">
                            <IoMdSend />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="input-container">
                    <div className="input-actions-left">
                        <BsEmojiSmileFill onClick={handleEmojiPickerhideShow} />
                        <MdAttachFile onClick={handleFileUpload} />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept="image/*,video/*,.pdf,.doc,.docx"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Type your message here"
                        onChange={handleChange}
                        value={msg}
                        onKeyPress={(e) => e.key === 'Enter' && sendChat(e)}
                    />
                    <div className="input-actions-right">
                        {msg.length > 0 ? (
                            <button onClick={sendChat} className="send-btn">
                                <IoMdSend />
                            </button>
                        ) : (
                            <div onClick={handleVoiceRecord} className="mic-icon">
                                <FaMicrophone />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
