const mongoose = require("mongoose");

const ChannelSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            min: 3,
            max: 20,
        },
        description: {
            type: String,
            default: "",
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Channel",
            default: null,
        },
        type: {
            type: String,
            enum: ["public", "private"],
            default: "public",
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        joinRequests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Channel", ChannelSchema);
