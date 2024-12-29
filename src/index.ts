import { Context, Hono, Next } from 'hono';
import { register, login, refresh, session } from './handlers/auth.handler';
import { ts } from './service/token.service';
import { session_middleware } from './middlewares';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

// public routes
app.post('/register', register);
app.post('/login', login);
app.post('/refresh', refresh);

// routes which require authentication (middleware)
// app.use('/session', session_middleware);
app.get('/session', session_middleware, session);

export default app;
