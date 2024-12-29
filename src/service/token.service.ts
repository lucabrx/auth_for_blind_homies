import * as jwt from 'jsonwebtoken';

interface TokenPayload {
  id: number;
  email: string;
  type: 'access' | 'refresh';
}

class TokenService {
  private readonly accessTokenSecret = 'veryguccisecrettokensecret';
  private readonly refreshTokenSecret = 'veryguccisecrettokensecret';
  private readonly accessTokenExpiration = '15m';
  private readonly refreshTokenExpiration = '7d';
  private readonly acessTokenExpiry = 1000 * 60 * 15;
  private readonly refreshTokenExpiry = 1000 * 60 * 60 * 24;

  public generateAccessToken(
    userId: number,
    email: string
  ): { token: string; expiry: number } {
    const payload: TokenPayload = {
      id: userId,
      email,
      type: 'access',
    };

    const token = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiration,
    });

    return { token, expiry: this.acessTokenExpiry };
  }

  public generateRefreshToken(
    userId: number,
    email: string
  ): { token: string; expiry: number } {
    const payload: TokenPayload = {
      id: userId,
      email,
      type: 'refresh',
    };

    const token = jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiration,
    });

    return { token, expiry: this.refreshTokenExpiry };
  }

  public verifyAccessToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.accessTokenSecret) as TokenPayload;
      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return payload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  public verifyRefreshToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(
        token,
        this.refreshTokenSecret
      ) as TokenPayload;
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return payload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

export const ts = new TokenService();
