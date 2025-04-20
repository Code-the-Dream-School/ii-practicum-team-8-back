const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../errors");

// REGISTER
const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  res
    .status(StatusCodes.CREATED)
    .json({ user: { name: user.name }, token: user.createJWT() });
};

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({ user: user.name, token });
};

// FORGOT PASSWORD

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("Please provide your email");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("No user with this email");
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  user.resetToken = token;
  user.resetTokenExpiration = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const html = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;

  await sendEmail(user.email, "Reset Your Password", html);

  res.status(StatusCodes.OK).json({ msg: "Password reset link sent to your email" });
};


// RESET PASSWORD
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new BadRequestError("Please provide a new password");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new UnauthenticatedError("Invalid or expired token");
  }

  const user = await User.findOne({
    _id: payload.userId,
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });

  if (!user) {
    throw new UnauthenticatedError("Invalid or expired token");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Password has been reset" });
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
