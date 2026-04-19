import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

/**
 * Verifies a JWT bearer token and loads the user. Used by JwtAuthGuard and
 * ScanAuthGuard (JWT branch); API key flows must not call this with an `sk_` token.
 */
export async function resolveJwtUser(
  jwt: JwtService,
  users: Repository<User>,
  token: string,
): Promise<User> {
  let sub: string;
  try {
    const payload = await jwt.verifyAsync<{ sub: string }>(token);
    sub = payload.sub;
  } catch {
    throw new UnauthorizedException('Invalid or expired session');
  }

  const user = await users.findOne({ where: { id: sub } });
  if (!user) {
    throw new UnauthorizedException('User not found');
  }
  return user;
}
