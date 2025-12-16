const Channel = require("../models/Channel");
const User = require("../models/User");

module.exports.createChannel = async (req, res, next) => {
    try {
        const { name, description, type, admin, parentId } = req.body;

        // Check if channel name exists
        const channelCheck = await Channel.findOne({ name });
        if (channelCheck)
            return res.json({ msg: "Channel name already taken", status: false });

        const channel = await Channel.create({
            name,
            description,
            type,
            admin,
            parentId, // Save the parentId
            members: [admin], // Admin is first member
        });

        return res.json({ status: true, channel });
    } catch (ex) {
        next(ex);
    }
};

module.exports.getChannels = async (req, res, next) => {
    try {
        const { userId } = req.params;
        // Get public channels and private channels where user is a member
        const channels = await Channel.find({
            $or: [
                { type: "public" },
                { members: { $in: [userId] } }
            ]
        }).populate("members", "username avatarImage");

        return res.json(channels);
    } catch (ex) {
        next(ex);
    }
};

module.exports.joinChannel = async (req, res, next) => {
    try {
        const { channelId, userId } = req.body;
        const channel = await Channel.findByIdAndUpdate(
            channelId,
            { $addToSet: { members: userId } },
            { new: true }
        );
        return res.json({ status: true, channel });
    } catch (ex) {
        next(ex);
    }
};

module.exports.leaveChannel = async (req, res, next) => {
    try {
        const { channelId, userId } = req.body;

        const channel = await Channel.findById(channelId);
        if (channel.admin.toString() === userId) {
            return res.json({ msg: "Admin cannot leave channel. Delete it instead.", status: false });
        }

        const updatedChannel = await Channel.findByIdAndUpdate(
            channelId,
            { $pull: { members: userId } },
            { new: true }
        );
        return res.json({ status: true, channel: updatedChannel });

    } catch (ex) {
        next(ex);
    }
};

module.exports.deleteChannel = async (req, res, next) => {
    try {
        const { channelId, userId } = req.body; // or params/query depending on route, but body is consistent with others here

        const channel = await Channel.findById(channelId);
        if (!channel) return res.json({ msg: "Channel not found", status: false });

        if (channel.admin.toString() !== userId) {
            return res.json({ msg: "Only admin can delete channel", status: false });
        }

        // Delete the channel
        await Channel.findByIdAndDelete(channelId);

        // Optional: Delete all subchannels?
        // await Channel.deleteMany({ parentId: channelId });

        return res.json({ status: true, msg: "Channel deleted successfully" });
    } catch (ex) {
        next(ex);
    }
};

module.exports.addMember = async (req, res, next) => {
    try {
        const { channelId, memberId, adminId } = req.body;

        const channel = await Channel.findById(channelId);
        if (!channel) return res.json({ msg: "Channel not found", status: false });

        if (channel.admin.toString() !== adminId) {
            return res.json({ msg: "Only admin can add members", status: false });
        }

        const updatedChannel = await Channel.findByIdAndUpdate(
            channelId,
            { $addToSet: { members: memberId } },
            { new: true }
        );

        return res.json({ status: true, channel: updatedChannel });
    } catch (ex) {
        next(ex);
    }
};

module.exports.searchChannels = async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        // Search name regex, case insensitive
        const channels = await Channel.find({
            name: { $regex: query, $options: "i" }
        }).select("name description type members joinRequests"); // Select relevant fields

        return res.json(channels);
    } catch (ex) {
        next(ex);
    }
};

module.exports.requestJoinChannel = async (req, res, next) => {
    try {
        const { channelId, userId } = req.body;

        const channel = await Channel.findByIdAndUpdate(
            channelId,
            { $addToSet: { joinRequests: userId } },
            { new: true }
        );

        return res.json({ status: true, msg: "Request sent", channel });
    } catch (ex) {
        next(ex);
    }
};

module.exports.getChannelDetails = async (req, res, next) => {
    try {
        const { channelId } = req.params;
        const channel = await Channel.findById(channelId)
            .populate("members", "username avatarImage email")
            .populate("joinRequests", "username avatarImage");

        return res.json(channel);
    } catch (ex) {
        next(ex);
    }
};

module.exports.handleJoinRequest = async (req, res, next) => {
    try {
        const { channelId, userId, action, adminId } = req.body; // action: 'approve' or 'reject'

        const channel = await Channel.findById(channelId);
        if (!channel) return res.json({ status: false, msg: "Channel not found" });

        if (channel.admin.toString() !== adminId) {
            return res.json({ status: false, msg: "Only admin can manage requests" });
        }

        if (action === 'approve') {
            await Channel.findByIdAndUpdate(channelId, {
                $pull: { joinRequests: userId },
                $addToSet: { members: userId }
            });
        } else {
            await Channel.findByIdAndUpdate(channelId, {
                $pull: { joinRequests: userId }
            });
        }

        const updatedChannel = await Channel.findById(channelId)
            .populate("members", "username avatarImage")
            .populate("joinRequests", "username avatarImage");

        return res.json({ status: true, channel: updatedChannel });

    } catch (ex) {
        next(ex);
    }
};
