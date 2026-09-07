import assert from 'node:assert/strict';
import { test } from 'node:test';
import jwt from '../../logistics-backend/node_modules/jsonwebtoken/index.js';
import User from '../../logistics-backend/src/models/User.ts';
import { requireAdmin } from '../../logistics-backend/src/middlewares/admin.ts';
import { isAdmin } from '../src/auth/session.ts';

process.env.JWT_SECRET = 'admin-access-test-only';

function authorize(token) {
  let next = false;
  const response = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  const request = { headers: token ? { authorization: `Bearer ${token}` } : {} };
  requireAdmin[0](request, response, () => { next = true; });
  return { request, response, next };
}

test('API rejects missing, invalid, expired and non-admin tokens', () => {
  assert.equal(authorize().response.code, 401);
  assert.equal(authorize('invalid').response.code, 401);
  for (const role of ['driver', 'dispatcher']) {
    const token = jwt.sign({ id: 'user', role }, process.env.JWT_SECRET);
    assert.equal(authorize(token).response.code, 403);
  }
  const expired = jwt.sign({ id: 'user', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: -1 });
  assert.equal(authorize(expired).response.code, 401);
});

test('API checks the current database role before granting access', async () => {
  const original = User.findById;
  try {
    for (const [user, expected] of [[null, 401], [{ role: 'driver' }, 403], [{ role: 'admin' }, undefined]]) {
      const token = jwt.sign({ id: 'user', role: 'admin' }, process.env.JWT_SECRET);
      const { request, response, next } = authorize(token);
      assert.equal(next, true);
      User.findById = () => ({ select: async () => user });
      let allowed = false;
      await requireAdmin[1](request, response, error => {
        assert.equal(error, undefined);
        allowed = true;
      });
      assert.equal(response.code, expected);
      assert.equal(allowed, expected === undefined);
    }
  } finally {
    User.findById = original;
  }
});

test('frontend admin visibility fails closed for absent or malformed sessions', () => {
  for (const [token, user, expected] of [
    [null, '{"role":"admin"}', false],
    ['token', '{invalid', false],
    ['token', 'null', false],
    ['token', '{"role":"driver"}', false],
    ['token', '{"role":"dispatcher"}', false],
    ['token', '{"role":"admin"}', true],
  ]) {
    globalThis.localStorage = { getItem: key => key === 'authToken' ? token : user };
    assert.equal(isAdmin(), expected);
  }
  delete globalThis.localStorage;
});
