const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const usernameCheck = await User.findOne({ username });
        if (usernameCheck)
            return res.json({ msg: "Username already used", status: false });

        const emailCheck = await User.findOne({ email });
        if (emailCheck)
            return res.json({ msg: "Email already used", status: false });

        // Create user with default avatar or empty
        const user = await User.create({
            username,
            email,
            password,
            isAvatarImageSet: req.body.avatarImage ? true : true,
            avatarImage: req.body.avatarImage || `https://api.multiavatar.com/${username}.svg`,
        });

        delete user.password;

        return res.json({ status: true, user, token: generateToken(user._id) });
    } catch (ex) {
        console.error("Register Error:", ex);
        next(ex);
    }
};

module.exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user)
            return res.json({ msg: "Incorrect Username or Password", status: false });

        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid)
            return res.json({ msg: "Incorrect Username or Password", status: false });

        delete user.password;

        return res.json({ status: true, user, token: generateToken(user._id) });
    } catch (ex) {
        next(ex);
    }
};

module.exports.getAllUsers = async (req, res, next) => {
    try {
        // Return all users excluding the requesting user
        const users = await User.find({ _id: { $ne: req.params.id } }).select([
            "email",
            "username",
            "avatarImage",
            "isAvatarImageSet",
            "_id",
        ]);
        return res.json(users);
    } catch (ex) {
        next(ex);
    }
};

module.exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        return res.json({ status: true, msg: "User deleted successfully" });
    } catch (ex) {
        next(ex);
    }
};

module.exports.searchUsers = async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const users = await User.find({
            username: { $regex: query, $options: "i" }
        }).select(["email", "username", "avatarImage", "_id"]);

        return res.json(users);
    } catch (ex) {
        next(ex);
    }
};
