export const adminNav = [
  { name: 'Home', path: '/home', label: 'Inicio', icon: 'home' },
  { name: 'Peer', path: '/user/peer', label: 'Peers', icon: 'peers' },
  { name: 'UserAddressBook', path: '/user/addressBook', label: 'Libretas de direcciones', icon: 'book' },
  { name: 'UserList', path: '/user/index', label: 'Usuarios', icon: 'user' },
  { name: 'UserGroup', path: '/user/group', label: 'Grupos', icon: 'group' },
  {
    name: 'Audit',
    label: 'Auditoría',
    icon: 'audit',
    children: [
      { name: 'AuditConn', path: '/auditConn', label: 'Conexiones' },
      { name: 'AuditFile', path: '/auditFile', label: 'Archivos' },
    ],
  },
  { name: 'LoginLog', path: '/loginLog', label: 'Registros de acceso', icon: 'key' },
  { name: 'ServerCmd', path: '/serverCmd', label: 'Ajustes de RustDesk', icon: 'settings' },
  { name: 'Oauth', path: '/oauth', label: 'OAuth', icon: 'link' },
  { name: 'UserToken', path: '/userToken', label: 'Tokens', icon: 'ticket' },
  { name: 'ShareRecord', path: '/shareRecord', label: 'Compartidos', icon: 'share' },
  { name: 'WebClient', href: '/webclient/', label: 'Cliente web', icon: 'webclient' },
]

export const userNav = [
  { name: 'MyPeer', path: '/my/peer', label: 'Mis dispositivos', icon: 'peers' },
  { name: 'MyAddressBookList', path: '/my/address_book', label: 'Mi libreta', icon: 'book' },
  { name: 'MyTagList', path: '/my/tag', label: 'Etiquetas', icon: 'tag' },
  { name: 'MyShareRecordList', path: '/my/shareRecord', label: 'Compartidos', icon: 'share' },
  { name: 'WebClient', href: '/webclient/', label: 'Cliente web', icon: 'webclient' },
  { name: 'MyLoginLog', path: '/my/loginLog', label: 'Registros de acceso', icon: 'key' },
  { name: 'MyInfo', path: '/', label: 'Mi perfil', icon: 'user' },
]

export function collectRouteNames (routes, acc = []) {
  for (const route of routes || []) {
    if (route.name) acc.push(route.name)
    if (route.children) collectRouteNames(route.children, acc)
  }
  return acc
}

export function filterNav (items, names) {
  return items
    .map((item) => {
      if (item.children) {
        const children = item.children.filter((child) => names.includes(child.name))
        if (!children.length) return null
        return { ...item, children }
      }
      if (item.href) return item
      return names.includes(item.name) ? item : null
    })
    .filter(Boolean)
}
