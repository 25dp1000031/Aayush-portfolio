<template>
  <!--
    AdminField — renders an <input> or <textarea> when the admin is
    logged in, otherwise renders the slot (read-only content).

    Usage:
      <AdminField v-model="hero.title">
        <span>{{ hero.title }}</span>
      </AdminField>

      <AdminField v-model="job.desc" :multiline="true" :rows="3" />
  -->
  <component
    v-if="isAdmin"
    :is="multiline ? 'textarea' : 'input'"
    :value="modelValue"
    class="af-field"
    :class="{ 'af-area': multiline, [fieldClass]: !!fieldClass }"
    :rows="multiline ? rows : undefined"
    v-bind="$attrs"
    @input="handleInput"
  />
  <template v-else>
    <slot>{{ modelValue }}</slot>
  </template>
</template>

<script setup>
import { storeToRefs }         from 'pinia'
import { useAuthStore }        from '@/stores/auth'
import { usePortfolioStore }   from '@/stores/portfolio'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  multiline:  { type: Boolean, default: false },
  rows:       { type: Number,  default: 3 },
  fieldClass: { type: String,  default: '' },
})
const emit = defineEmits(['update:modelValue'])

const { isAdmin }    = storeToRefs(useAuthStore())
const portfolioStore = usePortfolioStore()

function handleInput(e) {
  emit('update:modelValue', e.target.value)
  portfolioStore.markDirty()
}
</script>

<style scoped>
.af-field {
  background : rgba(16, 185, 129, 0.06);
  border     : 1px dashed rgba(16, 185, 129, 0.4);
  border-radius: 4px;
  padding    : 3px 8px;
  color      : inherit;
  font       : inherit;
  width      : 100%;
  outline    : none;
  resize     : none;
  transition : border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.af-field:focus {
  border-color: var(--accent-green);
  background  : rgba(16, 185, 129, 0.1);
  box-shadow  : 0 0 0 2px rgba(16, 185, 129, 0.14);
}
.af-area { resize: vertical; }
</style>
