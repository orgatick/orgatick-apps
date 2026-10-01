import { Entity, Index, OneToOne } from "typeorm";
import { UserBase } from "./user.base";
import { UserAccount } from "../../identity/entities/user-account.entity";

@Entity({ name: "users", schema: "identity" })
@Index("IDX_USERS_NORMALIZED_EMAIL", ["normalizedEmail"], { unique: true })
@Index("IDX_USERS_PHONE_NUMBER", ["phoneNumber"])
export class User extends UserBase {
  @OneToOne(
    () => UserAccount,
    (userAccount) => userAccount.user,
  )
  userAccount!: UserAccount;
}
