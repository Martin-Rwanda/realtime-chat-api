import { UserStatus } from "src/shared/enum/user-status.enum";

export { UserStatus };

export class User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  avatarUrl: string | null;
  avatarPublicId: string | null;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}