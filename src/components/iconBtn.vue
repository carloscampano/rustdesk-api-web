<template>
  <button type="button" class="rd-icon-btn" :class="kind" :title="title" @click="$emit('click', $event)">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <template v-if="name === 'connect'">
        <rect x="3" y="4" width="18" height="12" rx="2.5"></rect>
        <path d="M8 20h8"></path>
        <path d="M12 16v4"></path>
      </template>
      <template v-else-if="name === 'web'">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M3 12h18"></path>
        <path d="M12 3a14 14 0 0 1 0 18"></path>
        <path d="M12 3a14 14 0 0 0 0 18"></path>
      </template>
      <template v-else-if="name === 'book'">
        <path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"></path>
        <path d="M5 17.5A2.5 2.5 0 0 1 7.5 15H18"></path>
        <path d="M9 8h5"></path>
      </template>
      <template v-else-if="name === 'edit'">
        <path d="M4 20h4l10-10-4-4L4 16z"></path>
        <path d="m12.5 7.5 4 4"></path>
      </template>
      <template v-else-if="name === 'delete'">
        <path d="M4 7h16"></path>
        <path d="M9 7V4h6v3"></path>
        <path d="M6 7l1 13h10l1-13"></path>
      </template>
      <template v-else-if="name === 'view'">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </template>
      <template v-else-if="name === 'tag'">
        <path d="M20 13 11 4H4v7l9 9z"></path>
        <circle cx="7.5" cy="7.5" r="1"></circle>
      </template>
      <template v-else-if="name === 'key'">
        <circle cx="8" cy="14" r="4"></circle>
        <path d="M11 11.5 20 3"></path>
        <path d="M17 6l2 2"></path>
        <path d="M14.5 8.5 16.5 10.5"></path>
      </template>
      <template v-else-if="name === 'share'">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <path d="m8.6 13.5 6.8 4"></path>
        <path d="m15.4 6.5-6.8 4"></path>
      </template>
      <template v-else-if="name === 'logout'">
        <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2"></path>
        <path d="M4 12h11"></path>
        <path d="m12 9 3 3-3 3"></path>
      </template>
      <template v-else-if="name === 'bind'">
        <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5.93"></path>
        <path d="M14 11a5 5 0 0 0-7.07 0L5.52 12.4a5 5 0 0 0 7.07 7.07L14 18.07"></path>
      </template>
      <template v-else-if="name === 'unbind'">
        <path d="M9 7 6 4"></path>
        <path d="m18 20-3-3"></path>
        <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-3.2-8.3"></path>
        <path d="M14 11a5 5 0 0 0-7.07 0L5.52 12.4a5 5 0 0 0 3.2 8.3"></path>
      </template>
    </svg>
  </button>
</template>

<script setup>
  defineProps({
    name: { type: String, required: true },
    title: { type: String, default: '' },
    kind: { type: String, default: '' },
  })
  defineEmits(['click'])
</script>
