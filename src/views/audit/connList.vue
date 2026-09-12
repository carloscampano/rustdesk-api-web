<template>
  <div class="rd-page">
    <header class="rd-page-head">
      <div>
        <h1>Auditoría · Conexiones</h1>
        <p>{{ listRes.total.toLocaleString() }} conexiones</p>
      </div>
    </header>
    <el-card class="list-query" shadow="hover">
      <el-form inline label-width="80px">
        <el-form-item :label="T('Peer')">
          <el-input v-model="listQuery.peer_id" clearable></el-input>
        </el-form-item>
        <el-form-item :label="T('FromPeer')">
          <el-input v-model="listQuery.from_peer" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handlerQuery">{{ T('Filter') }}</el-button>
          <el-button type="danger" @click="toBatchDelete">{{ T('BatchDelete') }}</el-button>
          <el-button type="success" @click="toExport">{{ T('Export') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="list-body" shadow="hover">
      <el-table :data="listRes.list" v-loading="listRes.loading" border @selection-change="handleSelectionChange">
        <el-table-column type="selection" align="center" width="50"/>
        <el-table-column prop="id" label="ID" align="center" width="100"/>
        <el-table-column :label="T('Peer')" prop="peer_id" align="center" width="120"/>
        <el-table-column :label="T('FromPeer')" prop="from_peer" align="center" width="120"/>
        <el-table-column :label="T('FromName')" prop="from_name" align="center" width="120"/>
        <el-table-column :label="T('Ip')" prop="ip" align="center" min-width="140">
          <template #default="{row}">
            <div class="ip-cell">
              <span class="rd-mono">{{ row.ip || '—' }}</span>
              <span v-if="showPublic(row)" class="lan-tag">LAN</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="T('PublicIp')" min-width="140">
          <template #default="{row}">
            <span v-if="showPublic(row)" class="rd-mono">{{ row.public_ip }}</span>
            <span v-else class="geo-pending">—</span>
          </template>
        </el-table-column>
        <el-table-column :label="T('Country')" min-width="150">
          <template #default="{row}">
            <span v-if="row.geo?.country" class="geo-line">
              <span v-if="row.geo.flag" class="geo-flag">{{ row.geo.flag }}</span>
              <span>{{ row.geo.country }}</span>
              <span v-if="row.geo.countryCode" class="geo-cc">{{ row.geo.countryCode }}</span>
            </span>
            <span v-else class="geo-pending">{{ row.ip ? '…' : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="T('Isp')" min-width="180" show-overflow-tooltip>
          <template #default="{row}">
            <span v-if="row.geo?.isp">{{ row.geo.isp }}</span>
            <span v-else class="geo-pending">{{ row.ip ? '…' : '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column pop="type" :label="T('Type')" align="center" width="120">
          <template #default="{row}">
            <el-tag v-if="row.type === 1" type="warning">{{ T('File') }}</el-tag>
            <el-tag v-else>{{ T('Common') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uuid" label="uuid" align="center" width="120" show-overflow-tooltip/>
        <el-table-column prop="created_at" :label="T('CreatedAt')" align="center" min-width="160"/>
        <el-table-column :label="T('CloseTime')" prop="close_time" align="center" min-width="160"/>
        <el-table-column :label="T('Actions')" align="right" width="56" class-name="table-actions">
          <template #default="{row}">
            <div class="rd-actions">
              <icon-btn name="delete" kind="danger" :title="T('Delete')" @click="del(row)"/>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card class="list-page" shadow="hover">
      <el-pagination background
                     layout="prev, pager, next, sizes, jumper"
                     :page-sizes="[10,20,50,100]"
                     v-model:page-size="listQuery.page_size"
                     v-model:current-page="listQuery.page"
                     :total="listRes.total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script setup>
  import { onActivated, onMounted, ref, watch } from 'vue'
  import { useRepositories } from '@/views/audit/reponsitories'
  import { T } from '@/utils/i18n'
  import { lookupIps, needsPublicCompanion, geoTarget, isPrivateIp } from '@/utils/ipLookup'

  const {
    listRes,
    listQuery,
    getList,
    handlerQuery,
    del,
    batchdel,
    toExport,
  } = useRepositories()

  const showPublic = (row) => needsPublicCompanion(row.ip) && row.public_ip && !isPrivateIp(row.public_ip)

  const resolveIps = () => {
    const ips = (listRes.list || []).map((row) => geoTarget(row)).filter(Boolean)
    lookupIps(ips, (ip, geo) => {
      listRes.list.forEach((row) => {
        if (geoTarget(row) === ip) row.geo = geo
      })
    })
  }

  onMounted(getList)
  onActivated(getList)

  watch(() => listQuery.page, getList)
  watch(() => listQuery.page_size, handlerQuery)
  watch(() => listRes.list, resolveIps)
  const multipleSelection = ref([])
  const handleSelectionChange = (val) => {
    multipleSelection.value = val
  }
  const toBatchDelete = () => {
    if (multipleSelection.value.length === 0) {
      return
    }
    batchdel(multipleSelection.value)
  }
</script>

<style scoped lang="scss">
.geo-line {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}
.geo-flag { font-size: 16px; line-height: 1; }
.geo-cc {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--rd-text-3);
}
.geo-pending { color: var(--rd-text-3); }
.ip-cell { display: flex; align-items: center; justify-content: center; gap: 6px; }
.lan-tag {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--rd-text-3);
  background: var(--rd-bg-muted);
  border-radius: 999px;
  padding: 1px 6px;
}
</style>
