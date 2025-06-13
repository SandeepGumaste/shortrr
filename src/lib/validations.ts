import { z } from 'zod';

export const userValidationSchema = z.object({
  email: z.string().email('Invalid email address'),
  googleId: z.string().min(1, 'Google ID is required'),
  name: z.string().min(1, 'Name is required'),
  image: z.string().url().nullable().optional(),
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
