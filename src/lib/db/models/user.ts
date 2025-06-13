import mongoose from 'mongoose';
import { IUser } from '../types';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String
  },
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lastFailedLogin: {
    type: Date
  },
  lastLoginIP: {
    type: String
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  lastSignOutAt: {
    type: Date
  },
  sessionHistory: [{
    loginAt: Date,
    signOutAt: Date,
    ip: String,
    userAgent: String
  }]
}, {
  timestamps: true
});

// Add method to check if user should be blocked
userSchema.methods.shouldBeBlocked = function() {
  return this.loginAttempts >= 5 && 
         this.lastFailedLogin && 
         (new Date().getTime() - this.lastFailedLogin.getTime()) < 24 * 60 * 60 * 1000;
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
