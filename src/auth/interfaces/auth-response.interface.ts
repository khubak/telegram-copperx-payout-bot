import { User } from './user.interface';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}
