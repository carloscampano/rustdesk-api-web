import { safeLoginRedirect } from './safeRedirect.js'
import assert from 'node:assert/strict'

assert.deepEqual(safeLoginRedirect('/home'), { path: '/home' })
assert.deepEqual(safeLoginRedirect('/webclient/'), { href: '/webclient/' })
assert.deepEqual(safeLoginRedirect('/webclient'), { href: '/webclient/' })
assert.deepEqual(safeLoginRedirect('/user/peer'), { path: '/user/peer' })

assert.equal(safeLoginRedirect('https://evil.example'), null)
assert.equal(safeLoginRedirect('http://evil.example'), null)
assert.equal(safeLoginRedirect('//evil.example'), null)
assert.equal(safeLoginRedirect('/\\evil.example'), null)
assert.equal(safeLoginRedirect('javascript:alert(1)'), null)
assert.equal(safeLoginRedirect('/login'), null)
assert.equal(safeLoginRedirect('/404'), null)
assert.equal(safeLoginRedirect('/register'), null)
assert.equal(safeLoginRedirect(''), null)
assert.equal(safeLoginRedirect('/webclient.evil'), null)
assert.equal(safeLoginRedirect('https://rustdesk.campano.cl.evil.com'), null)

console.log('safeLoginRedirect ok')
