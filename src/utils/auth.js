const TokenKey = 'access_token'
const OidcCode = 'oidc_code'
const OidcCodeExpiry = 'oidc_code_expiry';
const PortalCookie = 'rd_portal'

function clearPortalCookie () {
  const paths = ['/', '/_admin', '/_admin/', '/webclient', '/webclient/']
  const extras = ['', '; Secure']
  paths.forEach((path) => {
    extras.forEach((extra) => {
      document.cookie = `${PortalCookie}=; Path=${path}; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${extra}`
    })
  })
}

export function getToken () {
  return localStorage.getItem(TokenKey)
}

export function setToken (token) {
  localStorage.setItem(`wc-option:local:access_token`, token)
  return localStorage.setItem(TokenKey, token)
}

export function removeToken () {
  clearPortalCookie()
  localStorage.removeItem('wc-option:local:access_token')
  localStorage.removeItem('user_info')
  return localStorage.removeItem(TokenKey)
}

export function hardLogoutRedirect () {
  removeToken()
  const url = `${window.location.origin}/_admin/index.html?logout=${Date.now()}#/login`
  window.location.href = url
}

// 设置 code，并存储当前时间戳（单位：毫秒）
export function setCode(code) {
  const now = Date.now(); // 当前时间戳（毫秒）
  const expiry = now + 60 * 1000; // 60 秒后过期

  localStorage.setItem(OidcCode, code); // 存储 code
  localStorage.setItem(OidcCodeExpiry, expiry); // 存储过期时间戳
}

// 获取 code，如果已过期则删除并返回 null
export function getCode() {
  const expiry = localStorage.getItem(OidcCodeExpiry); // 获取过期时间戳
  const now = Date.now(); // 当前时间戳

  if (expiry && now > parseInt(expiry)) {
    // 如果已过期，删除 code 和过期时间
    removeCode();
    return null;
  }
  return localStorage.getItem(OidcCode); // 返回 code（如果未过期）
}

// 删除 code 和过期时间
export function removeCode() {
  localStorage.removeItem(OidcCode);
  localStorage.removeItem(OidcCodeExpiry);
}
