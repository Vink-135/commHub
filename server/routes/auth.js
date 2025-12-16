const { register, login, getAllUsers, deleteUser } = require('../controllers/authController');
const router = require('express').Router();

router.post("/register", register);
router.post("/login", login);
router.get("/allusers/:id", getAllUsers);
router.delete("/delete/:id", deleteUser);
router.get("/search", require('../controllers/authController').searchUsers);

module.exports = router;
