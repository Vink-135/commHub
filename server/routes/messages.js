const { addMessage, getMessages } = require("../controllers/messageController");
const router = require("express").Router();

router.post("/addmsg/", addMessage);
router.post("/getmsg/", getMessages);
router.post("/deletemsg", require("../controllers/messageController").deleteMessage);
router.get("/get-contacts/:from", require("../controllers/messageController").getContactsWithMessages);

module.exports = router;
