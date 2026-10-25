<script setup lang="ts">
import { withBase } from "vitepress";

// Shows a screenshot, or a placeholder box until the image is added.
defineProps<{ src?: string; caption: string }>();
</script>

<template>
  <figure class="shot">
    <img v-if="src" :src="withBase(src)" :alt="caption" />
    <div v-else class="shot-placeholder">
      <span>Screenshot pending</span>
    </div>
    <figcaption>{{ caption }}</figcaption>
  </figure>
</template>
