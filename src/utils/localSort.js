// ponytail: comparator for browser-side column sorting; backend has no order_by
const ipKey = (ip) => {
  const m = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(ip || '')
  return m ? m.slice(1).map(n => n.padStart(3, '0')).join('.') : (ip || '')
}
export const compareBy = (prop, order) => {
  const dir = order === 'descending' ? -1 : 1
  return (a, b) => {
    let x = a[prop], y = b[prop]
    if (prop === 'last_online_ip') { x = ipKey(x); y = ipKey(y) }
    if (typeof x === 'number' || typeof y === 'number') return ((x || 0) - (y || 0)) * dir
    return String(x ?? '').localeCompare(String(y ?? ''), undefined, { numeric: true, sensitivity: 'base' }) * dir
  }
}
