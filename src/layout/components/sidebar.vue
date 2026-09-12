<template>
  <aside class="rd-sidebar" :class="{ collapsed: collapsed }">
    <div class="rd-sidebar-top">
      <div class="rd-brand">
        <div class="rd-brand-mark" :title="collapsed ? 'RustDesk Admin' : ''">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="12" rx="2.5"></rect>
            <path d="M8 20h8"></path>
            <path d="M12 16v4"></path>
          </svg>
        </div>
        <button type="button" class="rd-collapse" :title="collapsed ? 'Expandir menú' : 'Contraer menú'" @click="appStore.sideCollapse()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path v-if="collapsed" d="M9 6l6 6-6 6"></path>
            <path v-else d="M15 6l-6 6 6 6"></path>
          </svg>
        </button>
        <div class="rd-brand-text">
          <span class="name">RustDesk Admin</span>
          <span class="sub">Panel de administración</span>
        </div>
      </div>

      <nav class="rd-nav">
        <template v-for="item in navItems" :key="item.name">
          <div v-if="item.children" class="rd-nav-group">
            <button type="button" class="rd-nav-item" :class="{ active: isGroupActive(item) }" :title="collapsed ? item.label : ''" @click="onGroupClick(item)">
              <span class="rd-nav-left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" v-html="icons[item.icon]"></svg>
                <span>{{ item.label }}</span>
              </span>
              <svg class="rd-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" :class="{ open: openGroups[item.name] }" v-html="icons.chevron"></svg>
            </button>
            <template v-if="openGroups[item.name] && !collapsed">
              <router-link
                v-for="child in item.children"
                :key="child.name"
                :to="child.path"
                class="rd-nav-item child"
                :class="{ active: route.name === child.name }"
              >
                <span>{{ child.label }}</span>
              </router-link>
            </template>
          </div>
          <router-link v-else :to="item.path" class="rd-nav-item" :class="{ active: isActive(item) }" :title="collapsed ? item.label : ''">
            <span class="rd-nav-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" v-html="icons[item.icon]"></svg>
              <span>{{ item.label }}</span>
            </span>
          </router-link>
        </template>
      </nav>
    </div>

    <el-dropdown trigger="click" class="rd-user" @command="onUserCommand">
      <div class="rd-user-card" :title="collapsed ? (user.username || '') : ''">
        <div class="rd-avatar">{{ initials }}</div>
        <div class="rd-user-meta">
          <span class="name">{{ user.username || '—' }}</span>
          <span class="role">{{ isAdmin ? 'Administrador' : 'Usuario' }}</span>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9C9289" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="m8 9 4-4 4 4"></path>
          <path d="m8 15 4 4 4-4"></path>
        </svg>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-if="hasProfile" command="profile">Mi perfil</el-dropdown-item>
          <el-dropdown-item command="password">{{ T('ChangePassword') }}</el-dropdown-item>
          <el-dropdown-item v-for="(v, k) in appStore.setting.langs" :key="k" :command="'lang:' + k">{{ v.name }}</el-dropdown-item>
          <el-dropdown-item divided command="logout" @click="logout">{{ T('Logout') }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <changePwdDialog v-model:visible="changePwdVisible"></changePwdDialog>
  </aside>
</template>

<script setup>
  import { computed, reactive, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useUserStore } from '@/store/user'
  import { useAppStore } from '@/store/app'
  import { useRouteStore } from '@/store/router'
  import { T } from '@/utils/i18n'
  import { hardLogoutRedirect } from '@/utils/auth'
  import changePwdDialog from '@/components/changePwdDialog.vue'
  import { adminNav, userNav, collectRouteNames, filterNav } from '@/layout/nav'
  import { icons } from '@/layout/components/icons'

  const route = useRoute()
  const router = useRouter()
  const user = useUserStore()
  const appStore = useAppStore()
  const routeStore = useRouteStore()
  const changePwdVisible = ref(false)
  const openGroups = reactive({})
  const collapsed = computed(() => appStore.setting.sideIsCollapse)

  const names = computed(() => collectRouteNames(routeStore.routes))
  const isAdmin = computed(() => names.value.includes('Peer') || names.value.includes('ServerCmd'))
  const hasProfile = computed(() => names.value.includes('MyInfo'))
  const navItems = computed(() => {
    const admin = filterNav(adminNav, names.value)
    const mine = isAdmin.value ? [] : filterNav(userNav, names.value)
    return [...admin, ...mine]
  })

  const initials = computed(() => {
    const name = user.username || '?'
    return name.slice(0, 2).toUpperCase()
  })

  const isActive = (item) => route.name === item.name || route.path === item.path
  const isGroupActive = (item) => item.children?.some((child) => route.name === child.name)

  const toggleGroup = (name) => {
    openGroups[name] = !openGroups[name]
  }
  const onGroupClick = (item) => {
    if (collapsed.value && item.children?.length) {
      router.push(item.children[0].path)
      return
    }
    toggleGroup(item.name)
  }

  watch(
    () => route.name,
    () => {
      navItems.value.forEach((item) => {
        if (item.children && isGroupActive(item)) openGroups[item.name] = true
      })
    },
    { immediate: true },
  )

  const logout = () => {
    user.logout().catch(() => {})
    hardLogoutRedirect()
  }
  const showChangePwd = () => {
    changePwdVisible.value = true
  }
  const goProfile = () => {
    router.push('/')
  }
  const onUserCommand = (cmd) => {
    if (cmd === 'logout') logout()
    else if (cmd === 'profile') goProfile()
    else if (cmd === 'password') showChangePwd()
    else if (typeof cmd === 'string' && cmd.startsWith('lang:')) appStore.changeLang(cmd.slice(5))
  }
</script>

<style scoped>
.rd-sidebar,
.rd-sidebar * {
  box-sizing: border-box;
}
.rd-sidebar {
  width: 250px;
  flex: 0 0 250px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--rd-bg-sidebar);
  border-right: 1px solid var(--rd-line);
  padding: 24px 12px 16px;
  overflow: hidden;
  transition: width 0.18s ease, flex-basis 0.18s ease;
}
.rd-sidebar.collapsed {
  width: 92px;
  flex-basis: 92px;
  padding: 20px 10px 16px;
}
.rd-sidebar-top {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 0;
  min-width: 0;
}
.rd-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
  min-width: 0;
}
.rd-sidebar.collapsed .rd-brand {
  justify-content: center;
  padding: 0;
}
.rd-brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--rd-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 36px;
}
.rd-brand-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.rd-brand-text .name {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rd-brand-text .sub {
  font-size: 12px;
  font-weight: 500;
  color: var(--rd-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rd-sidebar.collapsed .rd-brand-text,
.rd-sidebar.collapsed .rd-nav-left span,
.rd-sidebar.collapsed .rd-chevron,
.rd-sidebar.collapsed .rd-user-meta,
.rd-sidebar.collapsed .rd-user-card > svg {
  display: none;
}
.rd-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-x: hidden;
  overflow-y: auto;
  min-width: 0;
}
.rd-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  color: var(--rd-text-2);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  background: transparent;
  border: 0;
  width: 100%;
  max-width: 100%;
  font-family: inherit;
  cursor: pointer;
  overflow: hidden;
}
.rd-sidebar.collapsed .rd-nav-item {
  justify-content: center;
  padding: 0;
}
.rd-nav-item:hover {
  background: #f1ece5;
}
.rd-nav-item.active {
  background: var(--rd-bg-active);
  color: var(--rd-accent-text);
  font-weight: 700;
}
.rd-nav-item.child {
  height: 36px;
  padding-left: 44px;
  font-size: 13.5px;
  font-weight: 500;
}
.rd-nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.rd-nav-left span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rd-nav-left svg,
.rd-nav-item > svg {
  flex: 0 0 auto;
}
.rd-chevron.open {
  transform: rotate(180deg);
}
.rd-collapse {
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  margin: 0;
  border: 1px solid #ece6de;
  border-radius: 8px;
  background: #fff;
  color: var(--rd-text-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rd-collapse:hover {
  background: #f8e9e0;
  color: var(--rd-accent-text);
  border-color: #eadfd3;
}
.rd-user {
  display: block;
  min-width: 0;
}
.rd-user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #ece6de;
  cursor: pointer;
  min-width: 0;
  overflow: hidden;
}
.rd-sidebar.collapsed .rd-user-card {
  justify-content: center;
  padding: 8px;
}
.rd-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #eadfd3;
  color: var(--rd-accent-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  flex: 0 0 36px;
}
.rd-user-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}
.rd-user-meta .name {
  font-size: 14px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rd-user-meta .role {
  font-size: 12px;
  font-weight: 500;
  color: var(--rd-text-3);
}
</style>
