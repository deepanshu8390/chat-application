const { BaseService } = require("../base/BaseService.js");
const bcrypt = require("bcryptjs");
const { createTokenAndSetCookie } = require("../utils/createToken.js");
const { sendEmail } = require("../utils/email.js");

class AuthService extends BaseService {
  constructor({ repository } = {}) {
    super({ repository });
  }

  async signup(payload, res) {
    const { name, email, password, confirmPassword, mobile } = payload;
    this.#validateSignupInput({ name, email, password, confirmPassword, mobile });
    await this.#ensureEmailAvailable(email);

    const hashedPassword = await this.#hashPassword(password);
    const user = await this.#createUser({
      name,
      email,
      password: hashedPassword,
      mobile,
      emailVerified: true,
    });

    this.#issueToken(user._id, res);
    return this.#buildPublicUser(user);
  }

  async login(payload, res) {
    const { email, password } = payload;
    this.#validateLoginInput({ email, password });

    const user = await this.#findUserByEmailOrThrow(email);
    await this.#verifyPassword(password, user.password);

    this.#issueToken(user._id, res);
    return this.#buildPublicUser(user);
  }

  logout(res) {
    res.clearCookie("jwt");
    return { message: "Logged out" };
  }

  async verifyEmail(payload) {
    const { token } = payload;
    this.#validateTokenInput(token);

    const user = await this.#findUserByResetTokenOrThrow(token);
    user.emailVerified = true;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await this.#saveUser(user);

    return { message: "Email verified" };
  }

  async forgotPassword(payload) {
    const { email } = payload;
    this.#validateEmailInput(email);

    const user = await this.#findUserByEmailOrThrow(email);
    const otp = this.#generateOtp();

    user.resetToken = otp;
    user.resetExpires = Date.now() + 600000;
    await this.#saveUser(user);

    await this.#sendResetEmail(email, otp);
    return { message: "OTP sent to email" };
  }

  async resetPassword(payload) {
    const { email, otp, newPassword } = payload;
    this.#validateResetPasswordInput({ email, otp, newPassword });

    const user = await this.#findUserByEmailAndResetTokenOrThrow(email, otp);
    user.password = await this.#hashPassword(newPassword);
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await this.#saveUser(user);

    return { message: "Password reset successful" };
  }

  async #ensureEmailAvailable(email) {
    const existing = await this.repository.findByEmail(email);
    if (existing) {
      throw new Error("Email already registered");
    }
  }

  #validateSignupInput({ name, email, password, confirmPassword, mobile }) {
    if (!name || !email || !password || !confirmPassword || !mobile) {
      throw new Error("All fields are required");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }
  }

  #validateLoginInput({ email, password }) {
    if (!email || !password) {
      throw new Error("Invalid email or password");
    }
  }

  #validateTokenInput(token) {
    if (!token) {
      throw new Error("Invalid or expired token");
    }
  }

  #validateEmailInput(email) {
    if (!email) {
      throw new Error("User not found");
    }
  }

  #validateResetPasswordInput({ email, otp, newPassword }) {
    if (!email || !otp || !newPassword) {
      throw new Error("Invalid OTP or expired");
    }
  }

  async #hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  async #createUser(data) {
    return this.repository.create(data);
  }

  async #findUserByEmailOrThrow(email) {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }
    return user;
  }

  async #findUserByResetTokenOrThrow(token) {
    const user = await this.repository.findByResetToken(token);
    if (!user) {
      throw new Error("Invalid or expired token");
    }
    return user;
  }

  async #findUserByEmailAndResetTokenOrThrow(email, token) {
    const user = await this.repository.findByEmailAndResetToken(email, token);
    if (!user) {
      throw new Error("Invalid OTP or expired");
    }
    return user;
  }

  async #verifyPassword(plainPassword, hashedPassword) {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    if (!match) {
      throw new Error("Invalid email or password");
    }
  }

  #issueToken(userId, res) {
    createTokenAndSetCookie(userId, res);
  }

  #generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async #sendResetEmail(email, otp) {
    await sendEmail(
      email,
      "ChatApplication - Password Reset OTP",
      `Your OTP for password reset is: ${otp}. Welcome back to ChatApplication!`
    );
  }

  async #saveUser(user) {
    return this.repository.save(user);
  }

  #buildPublicUser(user) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      emailVerified: user.emailVerified,
    };
  }
}

module.exports = { AuthService };
