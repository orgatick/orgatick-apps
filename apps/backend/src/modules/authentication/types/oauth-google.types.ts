import type { AuthProvider } from "@/modules/identity/entities/user-account.entity";

export interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  refresh_token?: string;
}

export interface OAuthProfile {
  provider: AuthProvider;
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified?: boolean;
}

export interface GoogleUserProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}
