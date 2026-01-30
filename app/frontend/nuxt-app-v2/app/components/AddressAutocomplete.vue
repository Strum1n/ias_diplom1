<template>
  <div class="flex gap-2">
    <div class="relative w-full">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Введите адрес для поиска недвижимости..."
        @input="handleInput"
        @focus="showSuggestions = true"
        @blur="hideSuggestions"
        @keyup.enter="searchOffers"
        class="autocomplete-input" />

      <ul v-if="showSuggestions && addressSuggestions && addressSuggestions.length > 0" class="suggestions-list">
        <li v-for="(suggestion, index) in addressSuggestions" :key="index" @mousedown="selectSuggestion(suggestion)" class="suggestion-item">
          {{ suggestion }}
        </li>
      </ul>

      <ul v-if="showSuggestions && searchQuery && !pending && addressSuggestions && addressSuggestions.length === 0" class="suggestions-list">
        <li class="suggestion-item !cursor-default text-center text-muted hover:!bg-white">Адреса не найдены</li>
      </ul>
    </div>

    <UButton icon="i-lucide-search" color="info" @click="searchOffers" class="search-button font-semibold"> Найти </UButton>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  "address-selected": [address: string];
  "search-triggered": [query: string];
}>();

const searchQuery = ref("");

const showSuggestions = ref(false);

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const handleInput = () => {
  if (searchQuery.value.length === 0) {
    addressSuggestions.value = [];
    showSuggestions.value = false;

    return;
  }

  showSuggestions.value = true;
};

const { $api } = useNuxtApp();

const {
  data: addressSuggestions,
  pending,
  error,
  refresh: fetchSuggestions,
} = await useAsyncData(
  "autocomplete",
  async () =>
    $api("/offers/autocomplete", {
      query: {
        q: searchQuery.value,
        limit: 10,
      },
    }),
  {
    immediate: false,
    watch: [searchQuery],
  },
);

const selectSuggestion = (suggestion: string) => {
  searchQuery.value = "";
  addressSuggestions.value = [];
  showSuggestions.value = false;
  emit("address-selected", suggestion);
};

const searchOffers = () => {
  const addressForSearch = searchQuery.value;
  searchQuery.value = "";

  showSuggestions.value = false;
  emit("search-triggered", addressForSearch);
};

watch(searchQuery, (newValue) => {
  if (newValue === "") {
    addressSuggestions.value = [];
    showSuggestions.value = false;
  }
});
</script>

<style scoped>
@reference "tailwindcss";

.autocomplete-input {
  @apply rounded-sm ring-1 ring-[var(--ui-border)] text-sm w-full h-full px-3 py-2 
    focus:outline-2 focus:outline-[#00c16a] focus:outline-offset-[-1px] focus:ring-0;
}

.suggestions-list {
  @apply absolute  rounded-sm ring-1 ring-[var(--ui-border)] max-h-50  overflow-auto z-10 bg-white w-full mt-1 text-sm;
}

.suggestion-item {
  @apply px-3 py-2 cursor-pointer bg-white border-b border-[var(--ui-border-muted)] px-3 py-2 hover:bg-[var(--ui-color-neutral-100)];
}

.suggestions-list .suggestion-item:last-of-type {
  @apply border-none;
}
</style>
