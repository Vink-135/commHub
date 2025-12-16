# 💬 CommHub - Real-Time Communication Platform

> A feature-rich, modern real-time chat application built for seamless communication.

![CommHub Banner](/client/src/assets/logo.png) 

**CommHub** is a robust chat application that facilitates real-time messaging, file sharing, and channel-based communication. Built with the MERN stack and Socket.IO, it offers a premium, responsive user interface with dynamic animations.

---

## 🚀 Features

- **Real-Time Messaging**: Instant delivery of messages using Socket.IO.
- **Channels & Direct Messages**: Organize conversations in public channels or private DMs.
- **File Sharing**:
  - 🖼️ **Images**: Send images with in-chat previews and a full-screen modal viewer.
  - 📄 **Files**: Share PDFs and other documents with download options.
- **Message Management**:
  - 🗑️ **Delete Messages**: Remove messages for everyone in real-time.
- **Rich Media**:
  - 🎤 **Voice Messages**: Record and send audio notes.
  - 😄 **Emoji Picker**: Express yourself with a huge library of emojis.
- **Modern UI/UX**:
  - ✨ Glassmorphism & Neon aesthetics.
  - 📱 Fully responsive design for Desktop and Mobile.
  - 🎭 Smooth animations and transitions.
- **Authentication**: Secure Register and Login with avatar selection.

---

## 🛠️ Tech Stack

### Frontend
- **React.js**: Component-based UI library.
- **Vite**: Next-generation frontend tooling.
- **Socket.IO Client**: Real-time bidirectional event-based communication.
- **Axios**: Promise-based HTTP client.
- **CSS3 / Styled Components**: Advanced styling with animations and responsive layouts.

### Backend
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing users, messages, and channels.
- **Socket.IO**: Real-time server engine.
- **Multer**: Middleware for handling `multipart/form-data` (file uploads).

---

## ⚙️ Installation & Setup

Follow these steps to run CommHub locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/Vink-135/commHub.git
cd commHub
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the server:
```bash
npm start
# Server runs on http://localhost:5001
```

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Start the development server:
```bash
npm run dev
# App runs on http://localhost:5173
```

---



## 🤝 Contributing

Contributions are welcome! Please fork the repository and create a pull request for any feature enhancements or bug fixes.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
