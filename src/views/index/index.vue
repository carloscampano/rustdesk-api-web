<template>
  <div class="rd-page home">
    <header class="rd-page-head">
      <div>
        <h1>Inicio</h1>
      </div>
      <span class="updated">Actualizado {{ updatedLabel }}</span>
    </header>

    <section class="kpis">
      <div class="rd-kpi">
        <div class="rd-kpi-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5a7 7 0 0 1 14 0"/><path d="M8.5 15a3.5 3.5 0 0 1 7 0"/><circle cx="12" cy="18" r="1"/></svg>
        </div>
        <div>
          <div class="label">Equipos en línea</div>
          <div class="value">{{ online }} <span>de {{ peers.length }}</span></div>
        </div>
      </div>
      <div class="rd-kpi">
        <div class="rd-kpi-icon muted">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-7 4 14 3-7h4"/></svg>
        </div>
        <div>
          <div class="label">Conexiones hoy</div>
          <div class="value">{{ todayCount }}</div>
        </div>
      </div>
      <div class="rd-kpi">
        <div class="rd-kpi-icon muted">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z"/></svg>
        </div>
        <div>
          <div class="label">Conexiones totales</div>
          <div class="value">{{ connTotal.toLocaleString() }}</div>
        </div>
      </div>
      <div class="rd-kpi">
        <div class="rd-kpi-icon muted">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>
        </div>
        <div>
          <div class="label">Usuarios del panel</div>
          <div class="value">{{ userTotal }}</div>
        </div>
      </div>
    </section>

    <section class="grid">
      <div class="rd-card">
        <div class="rd-card-head">
          <h2>Últimas conexiones</h2>
          <span class="sub">{{ todayLabel }}</span>
        </div>
        <div class="table-head">
          <div class="c-time">Hora</div>
          <div class="c-flex">Desde</div>
          <div class="c-flex">Hacia</div>
          <div class="c-dur">Duración</div>
          <div class="c-st">Estado</div>
        </div>
        <div v-if="!recent.length" class="empty">Sin conexiones recientes</div>
        <div v-for="row in recent" :key="row.id" class="rd-row conn">
          <div class="c-time rd-mono">{{ row.time }}</div>
          <div class="c-flex ident">
            <span>{{ row.fromName }}</span>
            <span class="id">{{ row.fromId }}</span>
          </div>
          <div class="c-flex ident">
            <span>{{ row.toName }}</span>
            <span class="id">{{ row.toId }}</span>
          </div>
          <div class="c-dur">{{ row.duration }}</div>
          <div class="c-st">
            <span class="rd-dot" :class="row.open ? 'ok' : 'off'"></span>
            <span>{{ row.open ? 'En curso' : 'Cerrada' }}</span>
          </div>
        </div>
        <div class="card-foot">
          <span>Mostrando las {{ recent.length }} más recientes</span>
          <router-link to="/auditConn">Ver todas las conexiones →</router-link>
        </div>
      </div>

      <div class="right">
        <div class="rd-card">
          <div class="rd-card-head">
            <h2>Servidores</h2>
            <span class="rd-chip"><span class="rd-dot ok" style="width:6px;height:6px;box-shadow:none"></span>API en línea</span>
          </div>
          <div v-for="s in servers" :key="s.name" class="rd-row server">
            <span class="rd-dot ok"></span>
            <div class="ident">
              <span>{{ s.name }}</span>
              <span class="id">{{ s.role }}</span>
            </div>
            <div class="host">{{ s.host }}</div>
          </div>
        </div>

        <div class="rd-card">
          <div class="rd-card-head">
            <h2>Versiones instaladas</h2>
            <span class="sub">{{ versioned }} equipos con versión</span>
          </div>
          <div class="versions">
            <div v-for="v in versions" :key="v.ver" class="ver">
              <span class="rd-mono">{{ v.ver }}</span>
              <div class="bar"><div :style="{ width: v.pct + '%' }"></div></div>
              <span class="n">{{ v.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { list as peerList } from '@/api/peer'
  import { list as userList } from '@/api/user'
  import { list as auditList } from '@/api/audit'
  import { useAppStore } from '@/store/app'
  import { parseApiTime, formatChile, formatChileTime, chileYmd } from '@/utils/time'

  const appStore = useAppStore()
  const peers = ref([])
  const userTotal = ref(0)
  const connTotal = ref(0)
  const recentRaw = ref([])
  const loadedAt = ref(Date.now())

  const host = computed(() => {
    const id = appStore.setting.rustdeskConfig.id_server || ''
    const h = id.replace(/:\d+$/, '')
    if (!h || h === '127.0.0.1' || h === 'localhost' || h === '0.0.0.0') return 'rustdesk.campano.cl'
    return h
  })
  const online = computed(() => peers.value.filter((p) => Date.now() / 1000 - (p.last_online_time || 0) < 60).length)
  const updatedLabel = computed(() => 'hace unos segundos')
  const todayLabel = computed(() => formatChile(Date.now(), { year: 'numeric', month: '2-digit', day: '2-digit' }))
  const todayCount = computed(() => recentRaw.value.filter((r) => chileYmd(r.created_at_ms) === chileYmd()).length)

  const duration = (row) => {
    const start = parseApiTime(row.created_at)
    const end = row.close_time && row.close_time !== '-' ? parseApiTime(row.close_time) : 0
    if (!start || !end) return '—'
    const min = Math.max(1, Math.round((end - start) / 60000))
    return `${min} min`
  }
  const peerName = (id) => {
    const p = peers.value.find((x) => String(x.id) === String(id))
    return p?.hostname || p?.alias || p?.username || id || '[sin nombre]'
  }

  const recent = computed(() => recentRaw.value.slice(0, 6).map((row) => ({
    id: row.id,
    time: formatChileTime(row.created_at_ms),
    fromName: row.from_name || peerName(row.from_peer),
    fromId: row.from_peer || '—',
    toName: peerName(row.peer_id),
    toId: row.peer_id || '—',
    duration: duration(row),
    open: !row.close_time || row.close_time === '-',
  })))

  const versioned = computed(() => peers.value.filter((p) => p.version).length)
  const versions = computed(() => {
    const counts = {}
    peers.value.forEach((p) => {
      if (!p.version) return
      counts[p.version] = (counts[p.version] || 0) + 1
    })
    const rows = Object.entries(counts).map(([ver, count]) => ({ ver, count }))
    rows.sort((a, b) => b.count - a.count)
    const max = rows[0]?.count || 1
    return rows.slice(0, 5).map((r) => ({ ...r, pct: Math.round((r.count / max) * 100) }))
  })

  const servers = computed(() => [
    { name: 'hbbs', role: 'Servidor ID', host: host.value },
    { name: 'hbbr', role: 'Relay', host: appStore.setting.rustdeskConfig.relay_server || host.value },
    { name: 'API', role: 'Panel', host: host.value },
  ])

  onMounted(async () => {
    const [p, u, a] = await Promise.all([
      peerList({ page: 1, page_size: 10000 }).catch(() => false),
      userList({ page: 1, page_size: 1 }).catch(() => false),
      auditList({ page: 1, page_size: 20 }).catch(() => false),
    ])
    if (p) peers.value = p.data.list || []
    if (u) userTotal.value = u.data.total || (u.data.list || []).length
    if (a) {
      connTotal.value = a.data.total || 0
      recentRaw.value = (a.data.list || []).map((item) => ({
        ...item,
        created_at_ms: parseApiTime(item.created_at),
      }))
    }
    loadedAt.value = Date.now()
  })
</script>

<style scoped>
.updated { font-size: 13px; font-weight: 500; color: var(--rd-text-3); }
.kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.grid { display: grid; grid-template-columns: 3fr 2fr; gap: 20px; align-items: start; }
.right { display: flex; flex-direction: column; gap: 20px; }
.table-head, .conn {
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 13px;
}
.table-head {
  height: 44px;
  border-bottom: 1px solid var(--rd-line-2);
  color: var(--rd-text-3);
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.conn {
  height: 58px;
  border-bottom: 1px solid var(--rd-line-3);
  color: var(--rd-text);
}
.c-time { flex: 0 0 72px; font-weight: 600; }
.c-flex { flex: 1; min-width: 0; }
.c-dur { flex: 0 0 96px; color: var(--rd-text-2); }
.c-st { flex: 0 0 96px; display: flex; align-items: center; gap: 8px; color: var(--rd-text-2); }
.ident { display: flex; flex-direction: column; gap: 2px; }
.ident span:first-child { font-weight: 600; }
.ident .id { font-size: 12px; color: var(--rd-text-3); font-variant-numeric: tabular-nums; }
.card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 52px;
  padding: 0 20px;
  border-top: 1px solid var(--rd-line-2);
  background: var(--rd-bg-card-head);
  font-size: 13px;
  color: var(--rd-text-2);
}
.card-foot a { font-weight: 700; color: var(--rd-accent); text-decoration: none; }
.empty { padding: 24px 20px; color: var(--rd-text-3); }
.server {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 52px;
  padding: 0 20px;
  border-bottom: 1px solid var(--rd-line-3);
  font-size: 13px;
}
.server:last-child { border-bottom: 0; }
.server .host { flex: 1; color: var(--rd-text-2); }
.versions { display: flex; flex-direction: column; gap: 14px; padding: 20px; }
.ver { display: flex; align-items: center; gap: 12px; font-size: 13px; }
.ver .rd-mono { flex: 0 0 44px; font-weight: 700; }
.bar { flex: 1; height: 10px; border-radius: 999px; background: #f1ece5; overflow: hidden; }
.bar div { height: 10px; border-radius: 999px; background: var(--rd-accent); }
.ver .n { flex: 0 0 36px; text-align: right; font-weight: 600; }
@media (max-width: 1100px) {
  .kpis, .grid { grid-template-columns: 1fr; }
}
</style>
