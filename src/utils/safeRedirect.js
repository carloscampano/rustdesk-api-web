const BLOCKED = new Set(['/login', '/register', '/404'])

export function safeLoginRedirect (raw) {
  if (typeof raw !== 'string' || !raw) return null
  let r = raw.trim()
  try {
    r = decodeURIComponent(r)
  } catch (_) { /* keep raw */ }
  r = r.replace(/\\/g, '/')
  if (r.includes('://')) return null
  if (!r.startsWith('/') || r.startsWith('//')) return null
  if (/[\s<>'"`\\]/.test(r)) return null

  const pathOnly = r.split('?')[0].split('#')[0]
  if (!pathOnly || BLOCKED.has(pathOnly) || pathOnly.length > 128) return null

  if (pathOnly === '/webclient' || pathOnly === '/webclient/') {
    return { href: '/webclient/' }
  }
  if (!/^\/[A-Za-z0-9/_-]*$/.test(pathOnly)) return null
  return { path: pathOnly }
}
