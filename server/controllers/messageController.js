const Messages = require("../models/Message");

module.exports.getMessages = async (req, res, next) => {
    try {
        const { from, to, type } = req.body;

        let messages;
        if (type === "channel") {
            messages = await Messages.find({ channelId: to })
                .populate("sender", "username avatarImage")
                .sort({ updatedAt: 1 });

            const projectedMessages = messages.map((msg) => {
                return {
                    fromSelf: msg.sender._id.toString() === from,
                    message: msg.message.type === 'text' ? msg.message.text : msg.message,
                    sender: msg.sender,
                    createdAt: msg.createdAt, // Add timestamp
                };
            });
            return res.json(projectedMessages);
        } else {
            messages = await Messages.find({
                users: {
                    $all: [from, to],
                },
            })
                .populate("sender", "username avatarImage") // Populate sender for DMs too
                .sort({ updatedAt: 1 });

            const projectedMessages = messages.map((msg) => {
                return {
                    fromSelf: msg.sender._id.toString() === from,
                    message: msg.message.type === 'text' ? msg.message.text : msg.message,
                    sender: msg.sender,
                    createdAt: msg.createdAt, // Add timestamp
                };
            });
            return res.json(projectedMessages);
        }
    } catch (ex) {
        next(ex);
    }
};

module.exports.addMessage = async (req, res, next) => {
    try {
        const { from, to, message, type } = req.body;
        let data;

        // Prepare message object based on input type
        let messageData = {};
        if (typeof message === 'object') {
            messageData = message; // { type: 'voice', audioUrl: '...', duration: ... }
        } else {
            messageData = { text: message, type: 'text' };
        }

        if (type === "channel") {
            data = await Messages.create({
                message: messageData,
                channelId: to,
                sender: from,
            });
        } else {
            data = await Messages.create({
                message: messageData,
                users: [from, to],
                sender: from,
            });
        }

        if (data) return res.json({ status: true, msg: data });
        else return res.json({ status: false, msg: "Failed to add message to the database" });
    } catch (ex) {
        next(ex);
    }
};

const User = require("../models/User");

module.exports.getContactsWithMessages = async (req, res, next) => {
    try {
        const userId = req.params.from;

        // Find distinct users involved in DMs with current user
        const distinctUsers = await Messages.find({
            users: { $in: [userId] }
        }).distinct("users");

        // Filter out self and fetches details
        const contactIds = distinctUsers.filter(id => id.toString() !== userId);

        const contacts = await User.find({ _id: { $in: contactIds } }).select([
            "email", "username", "avatarImage", "_id"
        ]);

        return res.json(contacts);
    } catch (ex) {
        next(ex);
    }
};

module.exports.deleteMessage = async (req, res, next) => {
    try {
        const { id, from } = req.body;
        const msg = await Messages.findById(id);
        if (!msg) return res.status(404).json({ msg: "Message not found" });

        if (msg.sender.toString() !== from) {
            return res.status(403).json({ msg: "Not authorized to delete this message" });
        }

        await Messages.findByIdAndDelete(id);
        return res.json({ status: true, msg: "Message deleted successfully." });
    } catch (ex) {
        next(ex);
    }
};
