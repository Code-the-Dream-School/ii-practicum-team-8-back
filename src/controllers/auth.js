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
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      throw new BadRequestError("Please provide your email");
    }
    if (typeof email !== 'string') {
      throw new BadRequestError("Email must be a string");
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new BadRequestError("Please provide a valid email address");
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("No user with this email");
    }

    // Check if user already requested reset within last 15 minutes
    if (user.resetTokenExpiration && user.resetTokenExpiration > Date.now()) {
      const waitTime = Math.ceil((user.resetTokenExpiration - Date.now()) / 60000);
      throw new BadRequestError(
        `Please wait ${waitTime} minutes before requesting another reset`
      );
    }

    // Generate reset token
    const token = jwt.sign(
      {
        userId: user._id,
        version: user.passwordVersion || 0 // Add version to invalidate token after password change
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Update user with reset token
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Generate and send reset email
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const html = `
      <p>You requested a password reset for your account.</p>
      <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
    `;

    try {
      await sendEmail(user.email, "Reset Your Password", html);
    } catch (error) {
      console.log("email failed")
      // Rollback changes if email fails
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();
      throw new Error("Failed to send reset email. Please try again later.");
    }

    res.status(StatusCodes.OK).json({
      msg: "Password reset link sent to your email",
      expiresIn: "15 minutes"
    });
  } catch (error) {
    // Handle any errors that occurred in the try block
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      throw error; // Re-throw known errors
    }
    throw new Error("Failed to process password reset request. Please try again later.");
  }
};


// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Input validation
    if (!token) {
      throw new BadRequestError("Reset token is required");
    }
    if (!password) {
      throw new BadRequestError("Please provide a new password");
    }
    if (!confirmPassword) {
      throw new BadRequestError("Please confirm your new password");
    }
    if (password !== confirmPassword) {
      throw new BadRequestError("Passwords do not match");
    }
    if (password.length < 8) {
      throw new BadRequestError("Password must be at least 8 characters long");
    }
    //updated regex to include special characters
    if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)) {
      {
      throw new BadRequestError(
        "Password must contain at least one uppercase letter, one lowercase letter, number and one special character"
      );
    }
  }
    // Verify token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthenticatedError("Reset token has expired");
      }
      throw new UnauthenticatedError("Invalid reset token");
    }

    // Find user and validate token
    const user = await User.findOne({
      _id: payload.userId,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() }
    });

    if (!user) {
      throw new UnauthenticatedError("Invalid or expired reset token");
    }

    // Verify token version matches current password version
    if (payload.version !== (user.passwordVersion || 0)) {
      throw new UnauthenticatedError("This reset token is no longer valid");
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      throw new BadRequestError("New password must be different from current password");
    }

    // Update password and clean up reset token
    user.password = password; // The pre-save middleware will hash this
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    user.passwordVersion = (user.passwordVersion || 0) + 1; // Increment password version
    await user.save();
    res.status(StatusCodes.OK).json({
      msg: "Password has been reset successfully",
      loginUrl: `${process.env.CLIENT_URL}/login`
    });
  } catch (error) {
    // Handle any errors that occurred in the try block
    if (error instanceof BadRequestError || error instanceof UnauthenticatedError) {
      throw error; // Re-throw known errors
    }
    throw new Error("Failed to reset password. Please try again later.");
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
