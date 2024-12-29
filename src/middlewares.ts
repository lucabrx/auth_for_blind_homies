import { Context, Next } from 'hono';
import { ts } from './service/token.service';
import { us } from './service/user.service';

export async function session_middleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.text('Authorization header missing', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return c.text('Token missing', 401);
  }

  try {
    const payload = ts.verifyAccessToken(token);
    if (payload.type !== 'access') {
      return c.text('Invalid token type', 401);
    }

    const user = await us.get_session(token);
    c.set('user', user);

    await next();
  } catch (error) {
    return c.text('Invalid or expired token', 401);
  }
}
