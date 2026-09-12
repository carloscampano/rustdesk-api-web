<template>
  <div class="rd-page" v-loading="loading">
    <header class="rd-page-head">
      <div>
        <h1>Ajustes de RustDesk</h1>
        <p>{{ host }}</p>
      </div>
      <div class="rd-page-actions">
        <button class="rd-btn primary" :disabled="!canSendId" @click="saveAll">
          Guardar cambios
        </button>
      </div>
    </header>

    <section class="cols">
      <div class="stack">
        <div class="rd-card">
          <div class="rd-card-head col">
            <h2>Servidores</h2>
            <p class="sub">Estado de los servicios del servidor propio</p>
          </div>
          <div class="table-head">
            <div class="c-svc">Servicio</div>
            <div class="c-host">Host</div>
            <div class="c-port">Puerto</div>
            <div class="c-st">Estado</div>
          </div>
          <div v-for="s in servers" :key="s.name" class="rd-row svc">
            <div class="c-svc ident">
              <span>{{ s.name }}</span>
              <span class="id">{{ s.role }}</span>
            </div>
            <div class="c-host">{{ s.host }}</div>
            <div class="c-port rd-mono">{{ s.port }}</div>
            <div class="c-st">
              <span class="rd-dot" :class="s.ok ? 'ok' : 'off'"></span>
              <span>{{ s.ok ? 'En línea' : 'Sin respuesta' }}</span>
            </div>
          </div>
        </div>

        <div class="rd-card">
          <div class="rd-card-head col">
            <h2>Clave pública</h2>
            <p class="sub">Los clientes la necesitan para conectarse a este servidor</p>
          </div>
          <div class="pad">
            <span class="field-label">Key</span>
            <div class="key-row">
              <div class="key">{{ key || '—' }}</div>
              <button class="rd-btn" type="button" @click="copyKey">Copiar</button>
            </div>
            <p class="hint">Solo lectura. Se genera en el servidor hbbs y no se puede editar desde el panel.</p>
          </div>
        </div>
      </div>

      <div class="stack">
        <div class="rd-card">
          <div class="rd-card-head col">
            <h2>Conexión</h2>
            <p class="sub">Reglas que aplica hbbs a todas las conexiones</p>
          </div>
          <div class="toggle-row rd-row">
            <div>
              <div class="t-title">Usar siempre relay <span>(ALWAYS_USE_RELAY)</span></div>
              <div class="hint">Fuerza todas las conexiones por hbbr aunque sea posible una conexión directa.</div>
            </div>
            <button class="rd-toggle" :class="{ on: alwaysRelay }" :disabled="!canSendId" @click="alwaysRelay = !alwaysRelay"><span></span></button>
          </div>
          <div class="toggle-row rd-row">
            <div>
              <div class="t-title">Exigir inicio de sesión <span>(MUST_LOGIN)</span></div>
              <div class="hint">Solo los clientes con sesión iniciada en el panel pueden conectarse.</div>
            </div>
            <button class="rd-toggle" :class="{ on: mustLogin }" :disabled="!canSendId || !canMustLogin" @click="mustLogin = !mustLogin"><span></span></button>
          </div>
        </div>

        <div class="rd-card">
          <div class="rd-card-head">
            <div>
              <h2>Servidores relay</h2>
              <p class="sub">Relays disponibles para los clientes</p>
            </div>
            <button class="rd-btn" type="button" :disabled="!canSendId" @click="addRelay">Añadir</button>
          </div>
          <div v-if="!relays.length" class="empty">Ningún relay configurado</div>
          <div v-for="(r, i) in relays" :key="i" class="rd-row relay">
            <span class="rd-dot ok"></span>
            <input v-model="relays[i]" class="relay-input" :disabled="!canSendId"/>
            <button class="icon-btn" type="button" :disabled="!canSendId" @click="relays.splice(i, 1)">✕</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { sendCmd } from '@/api/rustdesk'
  import { ElMessage } from 'element-plus'
  import { T } from '@/utils/i18n'
  import { ID_TARGET, RELAY_TARGET } from '@/views/rustdesk/options'
  import { useAppStore } from '@/store/app'


  const appStore = useAppStore()
  const loading = ref(false)
  const canSendId = ref(false)
  const canSendRelay = ref(false)
  const canMustLogin = ref(false)
  const alwaysRelay = ref(false)
  const mustLogin = ref(false)
  const relays = ref([])

  const host = computed(() => (appStore.setting.rustdeskConfig.id_server || '').replace(/:\d+$/, '') || '—')
  const key = computed(() => appStore.setting.rustdeskConfig.key || '')
  const parseHostPort = (value, fallbackPort) => {
    const raw = (value || host.value || '').replace(/^https?:\/\//, '')
    const [h, p] = raw.split(':')
    return { host: h || host.value, port: p || fallbackPort }
  }
  const servers = computed(() => {
    const id = parseHostPort(appStore.setting.rustdeskConfig.id_server, '21116')
    const relay = parseHostPort(appStore.setting.rustdeskConfig.relay_server, '21117')
    const api = parseHostPort(appStore.setting.rustdeskConfig.api_server, '21114')
    return [
      { name: 'hbbs', role: 'Servidor ID', host: id.host, port: id.port, ok: canSendId.value },
      { name: 'hbbr', role: 'Servidor relay', host: relay.host, port: relay.port, ok: canSendRelay.value },
      { name: 'API', role: 'Servidor web', host: api.host, port: api.port, ok: true },
    ]
  })

  const truthy = (data, token) => {
    const text = String(data || '')
    return text.includes(`${token}: true`)
  }

  const load = async () => {
    loading.value = true
    const idHelp = await sendCmd({ cmd: 'h', target: ID_TARGET }).catch(() => false)
    canSendId.value = !!(idHelp && idHelp.data)
    if (canSendId.value) {
      canMustLogin.value = String(idHelp.data).includes('must-login')
      const [aur, ml, rs] = await Promise.all([
        sendCmd({ cmd: 'aur', target: ID_TARGET }).catch(() => false),
        sendCmd({ cmd: 'ml', target: ID_TARGET }).catch(() => false),
        sendCmd({ cmd: 'rs', target: ID_TARGET }).catch(() => false),
      ])
      if (aur) alwaysRelay.value = truthy(aur.data, 'ALWAYS_USE_RELAY')
      if (ml) mustLogin.value = truthy(ml.data, 'MUST_LOGIN')
      if (rs) relays.value = String(rs.data || '').split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
    }
    const relayHelp = await sendCmd({ cmd: 'h', target: RELAY_TARGET }).catch(() => false)
    canSendRelay.value = !!(relayHelp && relayHelp.data)
    loading.value = false
  }

  const saveAll = async () => {
    if (!canSendId.value) return
    const jobs = [
      sendCmd({ cmd: 'aur', option: alwaysRelay.value ? 'Y' : 'N', target: ID_TARGET }),
      sendCmd({ cmd: 'rs', option: relays.value.filter(Boolean).join(','), target: ID_TARGET }),
    ]
    if (canMustLogin.value) {
      jobs.push(sendCmd({ cmd: 'ml', option: mustLogin.value ? 'Y' : 'N', target: ID_TARGET }))
    }
    const res = await Promise.all(jobs.map((p) => p.catch(() => false)))
    if (res.every(Boolean)) {
      ElMessage.success(T('OperationSuccess'))
    }
  }

  const addRelay = () => {
    relays.value.push('')
  }
  const copyKey = async () => {
    if (!key.value) return
    try {
      await navigator.clipboard.writeText(key.value)
      ElMessage.success(T('CopySuccess'))
    } catch (_) {
      ElMessage.error(T('CopyFailed'))
    }
  }

  onMounted(load)
</script>

<style scoped>
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
.stack { display: flex; flex-direction: column; gap: 20px; }
.rd-card-head.col { flex-direction: column; align-items: flex-start; }
.table-head, .svc {
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 13px;
}
.table-head {
  height: 40px;
  border-bottom: 1px solid var(--rd-line-2);
  color: var(--rd-text-3);
  font-size: 12.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.svc { height: 54px; border-bottom: 1px solid var(--rd-line-3); }
.svc:last-child { border-bottom: 0; }
.c-svc { flex: 0 0 90px; }
.c-host { flex: 1; color: var(--rd-text-2); }
.c-port { flex: 0 0 80px; font-weight: 600; }
.c-st { flex: 0 0 130px; display: flex; align-items: center; gap: 8px; }
.ident { display: flex; flex-direction: column; gap: 1px; }
.ident span:first-child { font-weight: 700; }
.ident .id { font-size: 12px; font-weight: 500; color: var(--rd-text-3); }
.pad { display: flex; flex-direction: column; gap: 8px; padding: 18px 20px 20px; }
.field-label { font-size: 12.5px; font-weight: 600; color: var(--rd-text-3); }
.key-row { display: flex; gap: 8px; }
.key {
  flex: 1;
  display: flex;
  align-items: center;
  height: 38px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #e3dbd1;
  background: #faf7f3;
  font-family: var(--rd-mono);
  font-size: 13px;
  overflow: hidden;
  white-space: nowrap;
}
.hint { font-size: 12px; font-weight: 500; color: var(--rd-text-3); }
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--rd-line-3);
}
.toggle-row:last-child { border-bottom: 0; }
.t-title { font-size: 13.5px; font-weight: 600; }
.t-title span { font-weight: 500; color: var(--rd-text-3); }
.relay {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  padding: 0 20px;
  font-size: 13px;
}
.relay-input {
  flex: 1;
  height: 32px;
  border: 0;
  background: transparent;
  font: 600 13px var(--rd-sans);
  color: var(--rd-text);
}
.icon-btn {
  width: 30px;
  height: 30px;
  border: 0;
  background: transparent;
  color: var(--rd-text-3);
  cursor: pointer;
  border-radius: 8px;
}
.icon-btn:hover { background: #f1ece5; color: var(--rd-text); }
.empty { padding: 16px 20px; color: var(--rd-text-3); font-size: 13px; }
@media (max-width: 1100px) { .cols { grid-template-columns: 1fr; } }
</style>
