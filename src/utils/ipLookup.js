const CACHE_KEY = 'rd-ip-geo-v1'
const mem = new Map()
let cacheLoaded = false

function loadCache () {
  if (cacheLoaded) return
  cacheLoaded = true
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    Object.entries(raw).forEach(([ip, geo]) => mem.set(ip, geo))
  } catch (_) { /* ignore */ }
}

function saveCache () {
  const obj = {}
  let n = 0
  for (const [ip, geo] of mem) {
    if (geo && !geo.error) obj[ip] = geo
    if (++n >= 2500) break
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj))
  } catch (_) { /* quota */ }
}

export function isPrivateIp (ip) {
  if (!ip) return true
  const v = String(ip).trim()
  if (v === '127.0.0.1' || v === '::1' || v === '0.0.0.0') return true
  if (/^10\./.test(v) || /^192\.168\./.test(v) || /^169\.254\./.test(v)) return true
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(v)) return true
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(v)) return true
  if (/^(fe80:|fc|fd)/i.test(v)) return true
  return false
}

export function isServerLan (ip) {
  return /^10\.8\.1\./.test(String(ip || '').trim())
}

export function needsPublicCompanion (ip) {
  return isPrivateIp(ip) && !isServerLan(ip)
}

export function geoTarget (row) {
  if (needsPublicCompanion(row?.ip) && row?.public_ip) return row.public_ip
  return row?.ip
}

async function fetchOne (ip) {
  const url = `https://ipwho.is/${encodeURIComponent(ip)}?lang=es&fields=success,country,country_code,connection,flag`
  const res = await fetch(url)
  if (!res.ok) throw new Error(String(res.status))
  const data = await res.json()
  if (!data.success) throw new Error('lookup failed')
  return {
    country: data.country || '',
    countryCode: data.country_code || '',
    isp: data.connection?.isp || data.connection?.org || '',
    flag: data.flag?.emoji || '',
  }
}

export function cachedGeo (ip) {
  loadCache()
  return mem.get(ip) || null
}

export async function lookupIps (ips, onEach) {
  loadCache()
  const unique = [...new Set((ips || []).map((ip) => String(ip || '').trim()).filter(Boolean))]
  const pending = []
  for (const ip of unique) {
    if (mem.has(ip) && !mem.get(ip).error) {
      onEach?.(ip, mem.get(ip))
      continue
    }
    if (isPrivateIp(ip)) {
      const geo = { country: 'Red local', countryCode: '', isp: 'Privada', flag: '', private: true }
      mem.set(ip, geo)
      onEach?.(ip, geo)
      continue
    }
    pending.push(ip)
  }
  if (!pending.length) return
  let i = 0
  const workers = Math.min(4, pending.length)
  const run = async () => {
    while (i < pending.length) {
      const ip = pending[i++]
      try {
        const geo = await fetchOne(ip)
        mem.set(ip, geo)
        onEach?.(ip, geo)
      } catch (_) {
        const geo = { country: '', countryCode: '', isp: '', flag: '', error: true }
        onEach?.(ip, geo)
      }
    }
  }
  await Promise.all(Array.from({ length: workers }, run))
  saveCache()
}
