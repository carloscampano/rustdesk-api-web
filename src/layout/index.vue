<template>
  <el-config-provider :locale="appStore.setting.locale.value">
    <div class="rd-shell">
      <g-sidebar></g-sidebar>
      <main class="rd-main">
        <router-view v-slot="{ Component }">
          <transition mode="out-in" name="el-fade-in-linear">
            <keep-alive :include="cachedTags">
              <component :is="Component"/>
            </keep-alive>
          </transition>
        </router-view>
      </main>
    </div>
  </el-config-provider>
</template>

<script setup>
  import { useAppStore } from '@/store/app'
  import { useTagsStore } from '@/store/tags'
  import { ref } from 'vue'
  import GSidebar from '@/layout/components/sidebar.vue'

  const appStore = useAppStore()
  const tagStore = useTagsStore()
  const cachedTags = ref(tagStore.cached)
</script>

<style scoped>
.rd-shell {
  display: flex;
  min-height: 100vh;
  background: var(--rd-bg);
  color: var(--rd-text);
}
.rd-main {
  flex: 1;
  min-width: 0;
  padding: 24px 32px;
  overflow: auto;
}
</style>
