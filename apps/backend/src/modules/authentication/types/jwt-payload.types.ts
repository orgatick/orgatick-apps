export interface JwtPayload {
  email: string;
  sessionId: number;
  token: string;
  rotationCounter?: number;
  familyId?: string;
}
