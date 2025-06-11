import { Document } from 'mongoose';

export interface IUrl extends Document {
  shortId: string;
  redirectUrl: string;
  createdBy: string;
  visitHistory: {
    timestamp: Date;
    ip: string;
    userAgent: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  profilePicture?: string;
  accessToken?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
