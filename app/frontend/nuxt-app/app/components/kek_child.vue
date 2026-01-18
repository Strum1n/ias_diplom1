<template>
  <div>Заголовок {{ props.title }}</div>
  <div>Заголовок локальный {{ localCounter }}</div>
  {{ props.filters }}
</template>
<script setup lang="ts">
interface FilterState {
  groupBy: string;
  regionName: string;
  settlementName: string;
  districtName: string;
  microdistrictName: string;
  streetName: string;
  settlementTypes: string[];
  minOffersCount: number | null;
  maxOffersCount: number | null;
}

const props = defineProps<{
  filters: FilterState;
  title?: number;
}>();

const localCounter = ref(props.title);

watch(
  () => props.title,
  (newFilters) => {
    localCounter.value = newFilters;
  },
  { deep: false, once: true }
);
</script>
