const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const register = async (req, res) => {
  // hashPassword with bcrypt and token logics are in model/User.js
  // validation errors are coming from mongoose
  const user = await User.create({ ...req.body });
  res
    .status(StatusCodes.CREATED)
    .json({ user: { name: user.name }, token: user.createJWT() });
};

const login = async (req, res) => {
  // user provides email and password
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  // check if user exists in db
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  // compare password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({ user: user.name, token });
};

module.exports = { register, login };
