import { Context } from 'hono';
import { CreateUser } from '../validators/user.validator';
import { us } from '../service/user.service';

export const register = async (c: Context) => {
  try {
    const data: CreateUser = await c.req.json();
    const user = await us.insert_user(data);
    return c.json(user, 201);
  } catch (error) {
    return c.json({ error: 'Invalid data' }, 400);
  }
};

export const login = async (c: Context) => {
  const { email, password } = await c.req.json();

  try {
    const user = await us.login(email, password);
    return c.json(user, 200);
  } catch (error) {
    return c.json({ error: 'Invalid email or password' }, 400);
  }
};

export const refresh = async (c: Context) => {
  const { refresh_token } = await c.req.json();

  try {
    const user = await us.refresh(refresh_token);
    return c.json(user, 200);
  } catch (error) {
    return c.json({ error: 'Invalid refresh token' }, 400);
  }
};

export const session = async (c: Context) => {
  return c.json(c.get('user'), 200);
};
