const express = require("express");
const router = express.Router();

const { login, register, forgotPassword, resetPassword} = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
