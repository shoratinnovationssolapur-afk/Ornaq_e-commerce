import crypto from "crypto";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import { sendEmail } from "../services/emailService.js";
import { sendCustomerNotification } from "../services/notificationService.js";
import { generateToken } from "../utils/generateToken.js";
import { sendSmsOtp } from "../services/smsService.js";

const normalizeRole = (role) => String(role || "").toLowerCase();

const serializeUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  role: user.role,
  avatar: user.avatar || "",
  authProviders: user.authProviders || [],
  addresses: user.addresses || []
});

const buildAuthResponse = (user, extra = {}) => ({
  user: serializeUser(user),
  token: generateToken(user),
  ...extra
});

const ensureProvider = (user, provider) => {
  const set = new Set(user.authProviders || []);
  set.add(provider);
  user.authProviders = Array.from(set);
};

const buildOtpHash = (code) => crypto.createHash("sha256").update(String(code)).digest("hex");

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const getOtpExpiryMinutes = () => {
  const expiryMinutes = Number.parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10);
  return Number.isFinite(expiryMinutes) && expiryMinutes > 0 ? expiryMinutes : 5;
};

const buildOtpExpiryDate = () => new Date(Date.now() + 1000 * 60 * getOtpExpiryMinutes());

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const buildNameFromEmail = (email) => {
  const localPart = String(email || "").split("@")[0] || "Customer";
  const name = localPart.replace(/[._-]+/g, " ").trim();
  return name || "ORNAQ Customer";
};

const assignOtpLogin = (user, otp) => {
  user.otpLogin = {
    codeHash: buildOtpHash(otp),
    expiresAt: buildOtpExpiryDate(),
    attempts: 0
  };
};

const sendEmailOtp = async (email, otp) => {
  const expiryMinutes = getOtpExpiryMinutes();
  await sendEmail({
    to: email,
    subject: "Your ORNAQ login OTP",
    text: `Your ORNAQ login OTP is ${otp}. It will expire in ${expiryMinutes} minutes.`,
    html: `<p>Your ORNAQ login OTP is <strong>${otp}</strong>.</p><p>This code expires in ${expiryMinutes} minutes.</p>`
  });
};

const validateOtpLogin = async (user, otp) => {
  const normalizedOtp = String(otp || "").trim();
  if (!/^\d{4,8}$/.test(normalizedOtp)) {
    return { status: StatusCodes.BAD_REQUEST, message: "Enter a valid OTP." };
  }

  if (!user?.otpLogin?.codeHash || !user?.otpLogin?.expiresAt) {
    return { status: StatusCodes.BAD_REQUEST, message: "OTP not requested or already used." };
  }

  if (new Date(user.otpLogin.expiresAt) < new Date()) {
    return { status: StatusCodes.BAD_REQUEST, message: "OTP has expired. Please request a new one." };
  }

  if ((user.otpLogin.attempts || 0) >= 5) {
    return { status: StatusCodes.TOO_MANY_REQUESTS, message: "Too many attempts. Please request a new OTP." };
  }

  const isValid = buildOtpHash(normalizedOtp) === user.otpLogin.codeHash;
  if (!isValid) {
    user.otpLogin.attempts = (user.otpLogin.attempts || 0) + 1;
    await user.save();
    return { status: StatusCodes.UNAUTHORIZED, message: "Invalid OTP." };
  }

  user.otpLogin = undefined;
  return null;
};

const verifyGoogleCredential = async (credential) => {
  if (!credential) {
    throw new Error("Google credential is required.");
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Google OAuth is not configured on the server.");
  }

  const { data } = await axios.get("https://oauth2.googleapis.com/tokeninfo", {
    params: { id_token: credential },
    timeout: 5000
  });

  if (data.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Google credential audience does not match this app.");
  }
  if (data.email_verified !== "true" && data.email_verified !== true) {
    throw new Error("Google email is not verified.");
  }

  return {
    email: data.email,
    name: data.name || data.email,
    googleId: data.sub,
    avatar: data.picture || ""
  };
};

export const register = async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email already registered" });
    }

    // Automatically assign admin role if email matches ADMIN_EMAIL
    let finalRole = role || "user";
    if (process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
      finalRole = "admin";
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: finalRole,
      authProviders: ["password"]
    });
    return res.status(StatusCodes.CREATED).json(buildAuthResponse(user));
  } catch (err) {
    // Handle MongoDB duplicate key errors (race condition)
    if (err.code === 11000) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Email already registered" });
    }
    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
    }
    // Log unexpected errors but do not leak details
    console.error("Register error:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Registration failed. Please try again." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid credentials" });
  }

  if (normalizeRole(user.role) !== "user") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "You are not a user or invalid credentials" });
  }

  return res.status(StatusCodes.OK).json(buildAuthResponse(user));
};

export const requestOtp = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const rawPhone = String(req.body.phone || req.body.phoneNumber || "");

  if (email && !rawPhone) {
    if (!isValidEmail(email)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Enter a valid email address." });
    }

    let user = await User.findOne({ email });
    if (user && normalizeRole(user.role) !== "user") {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Please use the admin login page for this account." });
    }

    if (!user) {
      user = await User.create({
        name: req.body.name || buildNameFromEmail(email),
        email,
        authProviders: ["email_otp"]
      });
    }

    const otp = generateOtp();
    assignOtpLogin(user, otp);
    ensureProvider(user, "email_otp");
    await user.save();

    try {
      await sendEmailOtp(email, otp);
    } catch (error) {
      console.error("Email OTP send failed:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Failed to send email OTP. Please try again later."
      });
    }

    return res.json({
      message: "OTP sent to your email.",
      previewCode: process.env.OTP_MODE === "mock" ? otp : undefined
    });
  }

  const normalizedPhone = rawPhone.replace(/\D/g, "").slice(-10); // Take last 10 digits
  if (!/^\d{10}$/.test(normalizedPhone)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Enter a valid email address or 10-digit mobile number." });
  }

  let user = await User.findOne({ $or: [{ phone: normalizedPhone }, { phoneNumber: normalizedPhone }] });
  if (!user) {
    user = await User.create({
      name: req.body.name || `Customer ${normalizedPhone.slice(-4)}`,
      phoneNumber: normalizedPhone,
      phone: normalizedPhone,
      authProviders: ["mobile_otp"]
    });
  }

  const otp = generateOtp();
  assignOtpLogin(user, otp);
  ensureProvider(user, "mobile_otp");
  await user.save();

  try {
    await sendSmsOtp(normalizedPhone, otp);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: "Failed to send SMS. Please try again later." 
    });
  }

  return res.json({
    message: "OTP sent successfully.",
    previewCode: process.env.OTP_MODE === "mock" ? otp : undefined
  });
};

export const verifyOtp = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const rawPhone = String(req.body.phone || req.body.phoneNumber || "");
  const otp = String(req.body.otp || "").trim();

  if (email && !rawPhone) {
    if (!isValidEmail(email)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Enter a valid email address." });
    }

    const user = await User.findOne({ email });
    if (user && normalizeRole(user.role) !== "user") {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Please use the admin login page for this account." });
    }

    const otpError = await validateOtpLogin(user, otp);
    if (otpError) {
      return res.status(otpError.status).json({ message: otpError.message });
    }

    ensureProvider(user, "email_otp");
    await user.save();

    return res.status(StatusCodes.OK).json(buildAuthResponse(user));
  }

  const normalizedPhone = rawPhone.replace(/\D/g, "").slice(-10);

  const user = await User.findOne({ $or: [{ phone: normalizedPhone }, { phoneNumber: normalizedPhone }] });
  const otpError = await validateOtpLogin(user, otp);
  if (otpError) {
    return res.status(otpError.status).json({ message: otpError.message });
  }

  ensureProvider(user, "mobile_otp");
  await user.save();

  return res.status(StatusCodes.OK).json(buildAuthResponse(user));
};

export const googleLogin = async (req, res) => {
  let { email, name, googleId, avatar } = req.body;

  if (req.body.credential) {
    try {
      ({ email, name, googleId, avatar } = await verifyGoogleCredential(req.body.credential));
    } catch (error) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message || "Google authentication failed." });
    }
  }

  if (!email || !name) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Google profile data is required." });
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      googleId: googleId || `google-${Date.now()}`,
      avatar,
      authProviders: ["google"]
    });
  } else {
    user.name = user.name || name;
    user.avatar = avatar || user.avatar;
    user.googleId = googleId || user.googleId;
    ensureProvider(user, "google");
    await user.save();
  }

  return res.status(StatusCodes.OK).json(buildAuthResponse(user));
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid credentials" });
  }

  if (normalizeRole(user.role) !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Admin access required" });
  }

  return res.status(StatusCodes.OK).json(
    buildAuthResponse(user, {
      redirectTo: "/admin/dashboard"
    })
  );
};

export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.json({ message: "If that email exists, a reset link has been sent." });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();

  const resetLink = `${(process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "")}/reset-password?token=${rawToken}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your Ornac password",
    text: `Reset your password using this link: ${resetLink}`,
    html: `<p>Reset your password using this link:</p><p><a href="${resetLink}">${resetLink}</a></p>`
  });

  return res.json({ message: "If that email exists, a reset link has been sent." });
};

export const resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.body.token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiresAt: { $gt: new Date() }
  });

  if (!user) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Reset token is invalid or expired." });
  }

  user.password = req.body.password;
  ensureProvider(user, "password");
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  return res.json({ message: "Password reset successful." });
};

export const getProfile = async (req, res) => {
  res.json(serializeUser(req.user));
};

// --- NEW METHOD: UPDATE USER SANCTUARY PREFERENCES ---
export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ 
      message: "User context workspace not found." 
    });
  }

  // Selective validation assignments
  if (req.body.name !== undefined) user.name = req.body.name;
  if (req.body.phone !== undefined) user.phone = req.body.phone;

  const updatedUser = await user.save();

  return res.status(StatusCodes.OK).json({
    message: "Profile preferences updated safely.",
    user: serializeUser(updatedUser) // Returns matching structure expected by your context mapping
  });
};
