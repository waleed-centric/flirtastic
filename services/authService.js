const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');

class AuthService {
  async register(username, firstName, lastName, email, password) {
    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const existingUsername = await userRepository.findUserByUsername(username);
    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.createUser({
      username,
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    return user;
  }

  async login(email, password) {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    return { user, token };
  }

  async forgotPassword(email) {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await userRepository.updateUser(user.id, { otp, otpExpires });

    await sendEmail(email, 'Password Reset OTP', `Your OTP is ${otp}. It expires in 10 minutes.`);

    return { message: 'OTP sent to email' };
  }

  async verifyOtp(email, otp) {
    const user = await userRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    if (user.otpExpires < new Date()) {
      throw new Error('OTP expired');
    }

    // Generate a temporary reset token valid for 5 minutes
    const resetToken = jwt.sign(
      { id: user.id, scope: 'reset_password' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '5m' }
    );

    // Clear OTP after successful verification (optional, but good practice to prevent reuse)
    // await userRepository.updateUser(user.id, { otp: null, otpExpires: null });
    // Wait, if we clear it here, and the user refreshes the page, they might need to request OTP again.
    // Better to clear it on password reset.

    return { message: 'OTP verified', resetToken };
  }

  async resetPassword(resetToken, newPassword) {
    try {
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'secret');
      if (decoded.scope !== 'reset_password') {
        throw new Error('Invalid token scope');
      }

      const user = await userRepository.findUserById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await userRepository.updateUser(user.id, {
        password: hashedPassword,
        otp: null,
        otpExpires: null
      });

      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid or expired reset token');
      }
      throw error;
    }
  }
}

module.exports = new AuthService();
