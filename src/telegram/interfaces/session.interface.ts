import { SessionState } from './session-state.enum';

export interface Session {
  userId: number;
  chatId: number;
  state: SessionState;
  email?: string;
  otp?: string;
  token?: string;
  refreshToken?: string;
  organizationId?: string;
  data?: Record<string, any>;
}
