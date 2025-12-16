const {
    createChannel,
    getChannels,
    joinChannel,
    leaveChannel,
} = require("../controllers/channelController");

const router = require("express").Router();

router.post("/create", createChannel);
router.get("/get/:userId", getChannels);
router.post("/join", joinChannel);
router.post("/leave", leaveChannel);
router.post("/delete", require("../controllers/channelController").deleteChannel);
router.post("/add-member", require("../controllers/channelController").addMember);

router.get("/search", require("../controllers/channelController").searchChannels);
router.post("/request-join", require("../controllers/channelController").requestJoinChannel);
router.get("/details/:channelId", require("../controllers/channelController").getChannelDetails);
router.post("/handle-request", require("../controllers/channelController").handleJoinRequest);

module.exports = router;
