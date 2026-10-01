import * as bcrypt from "bcrypt";

export class BcryptUtils {
  private readonly SALT_ROUNDS = 12;
  async hashString(string: string): Promise<string> {
    return await bcrypt.hash(string, this.SALT_ROUNDS);
  }

  async compareString(string: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(string, hash);
  }
}
