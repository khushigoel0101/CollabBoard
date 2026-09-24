import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { requireAuth } from './authMiddleware.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

test('requireAuth accepts a JWT from the auth_token cookie', () => {
  const token = jwt.sign({ userId: 'user-123', email: 'user@example.com' }, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  });

  const req: any = {
    headers: {},
    cookies: { auth_token: token },
  };

  const res: any = {
    statusCode: 200,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.payload = payload;
      return this;
    }
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  requireAuth(req, res, next);

  assert.equal(res.statusCode, 200);
  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, { userId: 'user-123', email: 'user@example.com' });
});
