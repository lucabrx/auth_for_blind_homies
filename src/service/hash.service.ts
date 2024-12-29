import { hash, verify } from 'argon2';
class Password {
  public async hash(password: string): Promise<string> {
    return await hash(password);
  }

  public async verify(password: string, hash: string): Promise<boolean> {
    return await verify(hash, password);
  }
}

export const hasher = new Password();
