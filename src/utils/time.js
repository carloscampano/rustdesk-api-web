import { T } from '@/utils/i18n'

export const CHILE_TZ = 'America/Santiago'

export function parseApiTime (value) {
  if (!value && value !== 0) return 0
  if (typeof value === 'number') {
    return value > 1e12 ? value : value * 1000
  }
  const s = String(value).trim()
  if (!s || s === '-') return 0
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
    const ms = Date.parse(s.replace(' ', 'T') + 'Z')
    return Number.isNaN(ms) ? 0 : ms
  }
  const ms = Date.parse(s)
  return Number.isNaN(ms) ? 0 : ms
}

export function formatChile (ms, options = {}) {
  if (!ms) return '—'
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: CHILE_TZ,
    hour12: false,
    ...options,
  }).format(new Date(ms))
}

export function formatChileTime (ms) {
  return formatChile(ms, { hour: '2-digit', minute: '2-digit' })
}

export function formatChileDateTime (ms) {
  return formatChile(ms, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function chileYmd (ms = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CHILE_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(ms))
}

export function timeAgo (time) {
  let now = new Date().getTime()
  let after = new Date(time).getTime()
  let dis = now - after
  if (dis < 60 * 1000) {
    return T('JustNow')
  } else if (dis < 60 * 60 * 1000) {
    const num = Math.floor(dis / (60 * 1000))
    return T('MinutesAgo', { param: num }, num)
  } else if (dis < 24 * 60 * 60 * 1000) {
    const num = Math.floor(dis / (60 * 60 * 1000))
    return T('HoursAgo', { param: num }, num)
  } else if (dis < 30 * 24 * 60 * 60 * 1000) {
    const num = Math.floor(dis / (24 * 60 * 60 * 1000))
    return T('DaysAgo', { param: num }, num)
  } else if (dis < 12 * 30 * 24 * 60 * 60 * 1000) {
    const num = Math.floor(dis / (30 * 24 * 60 * 60 * 1000))
    return T('MonthsAgo', { param: num }, num)
  } else {
    const num = Math.floor(dis / (12 * 30 * 24 * 60 * 60 * 1000))
    return T('YearsAgo', { param: num }, num)
  }
}

export function formatTime (unix, format = 'yyyy-MM-dd hh:mm:ss') {
  let date = new Date(unix)
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  return format
}
