import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('./platform-http.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { createStage5Handlers } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const env = { JWT_SECRET: 'test-login-only', STAGE5_SERVICE_URL: 'http://stage5-scripting:5005', STAGE5_SERVICE_KEY: 'test-service-key-at-least-32-characters' };
const now = 1800000000000;
function jwt(exp = now / 1000 + 3600, key = env.JWT_SECRET) {
 const a = Buffer.from(JSON.stringify({ alg: 'HS256' })).toString('base64url');
 const b = Buffer.from(JSON.stringify({ sub: 'test-player', exp })).toString('base64url');
 return `${a}.${b}.${createHmac('sha256', key).update(`${a}.${b}`).digest('base64url')}`;
}
function req(path, input = {}, cookie = jwt(), origin) {
 return new Request(`https://ctf.example/api/stage5/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie: `auth_token=${cookie}` } : {}), ...(origin ? { origin } : {}) }, body: typeof input === 'string' ? input : JSON.stringify(input) });
}
const data = { session: 'opaque-test-session', tokens: Array(15).fill('00000001'), expiresAt: new Date(now + 900000).toISOString() };
function handlers(transport) { return createStage5Handlers(env, () => now, transport); }
test('start requires valid platform login before calling Docker', async () => {
 const h = handlers(() => { throw Error('must not call'); });
 for (const cookie of [null, jwt(now / 1000), jwt(undefined, 'wrong')]) assert.equal((await h.start(req('start', {}, cookie))).status, 401);
});
test('start forwards verified user with private service key and strips extra fields', async () => {
 const h = handlers(async (url, options) => {
  assert.equal(url, env.STAGE5_SERVICE_URL + '/start'); assert.equal(options.headers.Authorization, 'Bearer ' + env.STAGE5_SERVICE_KEY);
  assert.deepEqual(JSON.parse(options.body), { user: 'test-player' }); assert.equal(options.redirect, 'error');
  return Response.json({ ...data, flag: 'SHADOWNET{should_not_be_forwarded}', expected: '12345678' });
 });
 const r = await h.start(req('start')); assert.equal(r.status, 200); assert.deepEqual(await r.json(), data); assert.equal(r.headers.get('cache-control'), 'no-store');
});
test('Python client can predict using session without platform cookie', async () => {
 const h = handlers(async (url, options) => {
  assert.equal(url, env.STAGE5_SERVICE_URL + '/predict'); assert.deepEqual(JSON.parse(options.body), { session: data.session, prediction: '00000001' });
  return Response.json({ flag: 'SHADOWNET{test_fixture_only}', secret: 'never-forward' });
 });
 const r = await h.predict(req('predict', { session: data.session, prediction: '00000001' }, null));
 assert.equal(r.status, 200); const out = await r.json(); assert.equal(out.flag, 'SHADOWNET{test_fixture_only}'); assert.equal(out.secret, undefined);
});
test('Docker errors expose no internal credentials or errors', async () => {
 for (const status of [400, 401, 410, 422, 429, 503]) {
  const h = handlers(async () => Response.json({ error: env.STAGE5_SERVICE_KEY }, { status }));
  const r = await h.predict(req('predict', { session: data.session, prediction: '00000001' }));
  assert.equal(r.status, status === 401 ? 502 : status); assert.ok(!(await r.text()).includes(env.STAGE5_SERVICE_KEY));
 }
});
test('invalid inputs are rejected before Docker access', async () => {
 const h = handlers(() => { throw Error('must not call'); });
 assert.equal((await h.start(req('start', {}, jwt(), 'https://other.example'))).status, 403);
 assert.equal((await h.start(req('start', '{'))).status, 400);
 assert.equal((await h.start(req('start', JSON.stringify({ text: 'x'.repeat(4096) })))).status, 413);
 for (const prediction of [12345678, '123', 'abcdefgh']) assert.equal((await h.predict(req('predict', { session: data.session, prediction }))).status, 400);
});
test('missing configuration and unavailable service fail safely', async () => {
 assert.equal((await createStage5Handlers({ ...env, STAGE5_SERVICE_KEY: undefined }).start(req('start'))).status, 503);
 assert.equal((await handlers(async () => { throw Error('connection refused'); }).start(req('start'))).status, 503);
 for (const reply of [{ tokens: [] }, { ...data, tokens: Array(15).fill(12345678) }, null]) {
  assert.equal((await handlers(async () => Response.json(reply)).start(req('start'))).status, 502);
 }
});
