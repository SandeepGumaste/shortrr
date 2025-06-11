import mongoose from 'mongoose';
import { IUrl } from '../types';

const urlSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true
  },
  redirectUrl: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  visitHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String
  }]
}, {
  timestamps: true
});

export const Url = mongoose.models.Url || mongoose.model<IUrl>('Url', urlSchema);
