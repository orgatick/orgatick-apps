import type { UserSession } from "../../modules/identity/entities/user-session.entity";
import type { User } from "../../modules/users/entities/user.entity";
import type { Request } from "express";

export interface AuthRequest extends Request {
  user: User;
  session: UserSession;
}
