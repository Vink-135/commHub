const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Vite default port
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/channels', require('./routes/channels'));
app.use('/api/upload', require('./routes/upload'));

// Serve static files
app.use('/uploads', express.static('uploads'));

// Database Connection
connectDB();

// Basic Route
app.get('/', (req, res) => {
    res.send('CommHub API is running');
});

global.onlineUsers = new Map();

io.on('connection', (socket) => {
    global.chatSocket = socket;

    socket.on("add-user", (userId) => {
        global.onlineUsers.set(userId, socket.id);
        io.emit("online-users", Array.from(global.onlineUsers.keys()));
    });

    // Channel Rooms
    socket.on("join-channel", (channelId) => {
        socket.join(channelId);
        console.log(`User ${socket.id} joined channel ${channelId}`);
    });

    socket.on("leave-channel", (channelId) => {
        socket.leave(channelId);
    });

    socket.on("send-channel-msg", (data) => {
        // data = { to: channelId, msg: 'content', from: userId, senderName, avatar }
        socket.to(data.to).emit("channel-msg-recieve", data);
    });

    socket.on("typing", (data) => {
        // data = { to: channelId/userId, from: username, type: 'channel'/'dm' }
        if (data.type === 'channel') {
            socket.to(data.to).emit("display-typing", data);
        } else {
            const sendUserSocket = global.onlineUsers.get(data.to);
            if (sendUserSocket) {
                socket.to(sendUserSocket).emit("display-typing", data);
            }
        }
    });

    socket.on("stop-typing", (data) => {
        if (data.type === 'channel') {
            socket.to(data.to).emit("hide-typing", data);
        } else {
            const sendUserSocket = global.onlineUsers.get(data.to);
            if (sendUserSocket) {
                socket.to(sendUserSocket).emit("hide-typing", data);
            }
        }
    });
    // DM Logic
    socket.on("send-msg", (data) => {
        const sendUserSocket = global.onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.msg);
        }
    });

    socket.on("msg-delete", (data) => {
        if (data.type === 'channel') {
            socket.to(data.to).emit("msg-deleted", data.id);
        } else {
            const sendUserSocket = global.onlineUsers.get(data.to);
            if (sendUserSocket) {
                socket.to(sendUserSocket).emit("msg-deleted", data.id);
            }
        }
    });

    socket.on("disconnect", () => {
        let disconnectedUserId;
        for (const [userId, socketId] of global.onlineUsers.entries()) {
            if (socketId === socket.id) {
                disconnectedUserId = userId;
                break;
            }
        }
        if (disconnectedUserId) {
            global.onlineUsers.delete(disconnectedUserId);
            io.emit("online-users", Array.from(global.onlineUsers.keys()));
        }
    });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
