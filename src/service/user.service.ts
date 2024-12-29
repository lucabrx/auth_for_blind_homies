import { sql } from 'drizzle-orm';
import { User, usersTable } from '../db/tables';
import { db } from '../lib/db';
import { CreateUser, createUserValidator } from '../validators/user.validator';
import { hasher } from './hash.service';
import { ts } from './token.service';

type LoginResponse = {
  user: User;
  access_token: string;
  refresh_token: string;
  access_token_expires_in: number;
  refresh_token_expires_in: number;
};

class UserService {
  public async insert_user(data: CreateUser): Promise<User> {
    const user = createUserValidator.safeParse(data);
    if (!user.success) {
      throw new Error('Invalid data');
    }

    const hashed_password = await hasher.hash(user.data.password);

    const payload = {
      ...user.data,
      password: hashed_password,
    };

    const newUser = await db.insert(usersTable).values(payload).returning();

    return newUser[0];
  }

  public async get_user_by_id(id: number): Promise<User> {
    const user = await db
      .select()
      .from(usersTable)
      .where(sql`${usersTable.id} = ${id}`);

    return user[0];
  }

  public async get_user_by_email(email: string): Promise<User> {
    const user = await db
      .select()
      .from(usersTable)
      .where(sql`${usersTable.email} = ${email}`);

    return user[0];
  }

  public async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.get_user_by_email(email);

    if (!user || !(await hasher.verify(password, user.password))) {
      throw new Error('Invalid email or password');
    }

    const { expiry: exp_access, token: access_token } = ts.generateAccessToken(
      user.id,
      user.email
    );
    const { expiry: exp_refresh, token: refresh_token } =
      ts.generateRefreshToken(user.id, user.email);

    return {
      user,
      access_token,
      refresh_token,
      access_token_expires_in: exp_access,
      refresh_token_expires_in: exp_refresh,
    };
  }

  /**
   * We generate both access and refresh tokens for the user ( so that we can expend refresh token expiry time without having to re-login )
   * other option is to only generate access token and then generate refresh token when access token expires
   * final option is to only generate access token and when refresh token expires, user has to re-login
   */
  public async refresh(refresh_token: string): Promise<LoginResponse> {
    const payload = ts.verifyRefreshToken(refresh_token);
    const user = await this.get_user_by_id(payload.id);

    const { expiry: exp_access, token: access_token } = ts.generateAccessToken(
      user.id,
      user.email
    );
    const { expiry: exp_refresh, token: refresh_token_new } =
      ts.generateRefreshToken(user.id, user.email);

    return {
      user,
      access_token,
      refresh_token: refresh_token_new,
      access_token_expires_in: exp_access,
      refresh_token_expires_in: exp_refresh,
    };
  }

  public async get_session(access_token: string): Promise<User> {
    const payload = ts.verifyAccessToken(access_token);
    return await this.get_user_by_id(payload.id);
  }
}

export const us = new UserService();
