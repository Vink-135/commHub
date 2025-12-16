const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
    {
        message: {
            text: { type: String, required: false },
            audioUrl: { type: String, required: false },
            duration: { type: Number, required: false },
            fileUrl: { type: String, required: false }, // For files/images
            fileName: { type: String, required: false },
            fileSize: { type: String, required: false },
            type: { type: String, default: "text" }, // "text", "voice", "image", "file"
        },
        // For Direct Messages (1-to-1)
        users: Array,
        // For Channel Messages
        channelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel",
            required: false,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Messages", MessageSchema);
