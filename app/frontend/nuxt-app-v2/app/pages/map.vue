<template>
  <div class="flex flex-col max-h-full md:flex-row gap-2.5 mx-auto p-3 md:p-5 md:gap-5 md:max-h-[92.9vh]!">
    <div class="md:hidden">
      <UButton icon="i-heroicons-funnel" @click="toggleFiltersSidebar" variant="outline" color="primary" class="w-full justify-center">
        {{ showFilters ? "Скрыть фильтры" : "Показать фильтры" }}
      </UButton>
    </div>
    <div
      class="w-full md:w-[22%]"
      :class="{
        'max-h-0 overflow-hidden md:max-h-none md:overflow-visible': !showFilters,
        'max-h-500 overflow-visible mb-4': showFilters,
      }">
      <FiltersSidebar :initial-filters="filters" @filters-apply="handleFiltersApply" @filters-reset="handleFiltersReset" />
    </div>

    <main class="map-content max-h-[84.5vh] min-h-150! flex-1 sm:max-h-max">
      <div class="mb-3">
        <AddressAutocomplete @address-selected="handleAddressSearch" @search-triggered="handleAddressSearch" />
      </div>

      <UBadge v-if="addressForSearch" size="xs" variant="subtle" class="mb-2 px-2 w-full md:px-3 text-xs md:w-fit md:text-sm" color="info">
        <span class="truncate w-fit md:w-fit">{{ addressForSearch }}</span>
        <UButton
          trailing-icon="heroicons:x-mark-16-solid"
          variant="outline"
          class="px-0 ring-[#e9f2ff] pt-2 border-0 bg-transparent mr-0 ml-auto"
          color="info"
          @click="clearAddressSearch"
          size="md"></UButton>
      </UBadge>

      <div v-if="offersError" class="error-message">
        {{ offersError }}
      </div>

      <div class="results-info mb-3">
        <div class="flex items-center gap-2" v-if="offersPending">
          <span class="text-sm md:text-base">Объектов на карте:</span>
          <UIcon name="codex:loader" size="16px md:20px" />
        </div>
        <div v-else class="text-sm md:text-base">
          Объектов на карте: <span class="font-semibold text-primary">{{ offers.length.toLocaleString("ru-RU") }}</span>
        </div>
      </div>

      <div class="map-container relative">
        <UIcon v-if="offersPending" name="line-md:loading-loop" class="loading-icon absolute inset-0 m-auto z-10" />
        <YaMap :parent-offers="offers" :favorite-offers="favoriteOffers" class="h-full w-full"></YaMap>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { OfferResponseShort, AddressResponseShort } from "~/types/api";

type Address = AddressResponseShort;
type Offer = OfferResponseShort;

interface Filters {
  [key: string]: any;
}

const { $api } = useNuxtApp();
const route = useRoute();
const router = useRouter();

// Состояние для показа/скрытия фильтров
const showFilters = ref(false);

const toggleFiltersSidebar = () => {
  showFilters.value = !showFilters.value;
};

// Фильтры из query (исключая служебные параметры, если они появятся)
const filters = computed(() => {
  const query = { ...route.query };
  // Если в будущем появятся параметры, не относящиеся к фильтрам, удалим их
  // delete query.some_param;
  return query;
});

const addressForSearch = computed(() => (route.query.address_query as string) || "");

// Подготовка query для API
const prepareRequestQuery = () => {
  const query: Record<string, any> = {
    limit: 1000000,
  };

  Object.entries(filters.value).forEach(([key, value]) => {
    if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) return;

    if (Array.isArray(value)) {
      query[key] = value.filter((item) => item != null && item !== "");
    } else if (typeof value === "boolean") {
      if (value === true) {
        query[key] = String(value);
      }
    } else if (typeof value === "object" && !Array.isArray(value)) {
      query[key] = JSON.stringify(value);
    } else {
      query[key] = String(value);
    }
  });

  return query;
};

// Обновление query в URL
const updateQuery = (newParams: Record<string, any>) => {
  router.replace({
    query: {
      ...route.query,
      ...newParams,
    },
  });
};

// Запрос объявлений с автоматическим слежением за изменением маршрута
const {
  data: offersData,
  pending: offersPending,
  error: offersError,
  refresh: refreshOffers,
} = useAsyncData("offersForMap", () => $api("/offers/offers_for_map", { params: prepareRequestQuery() }), {
  watch: [route], // автоматически перезапрашивать при изменении query
});

const offers = computed(() => offersData.value || []);

// Обработчики событий
const handleFiltersApply = (filtersData: Filters) => {
  updateQuery(filtersData);
};

const handleFiltersReset = () => {
  const { address_query } = route.query;
  router.replace({
    query: address_query ? { address_query } : {},
  });
};

const handleAddressSearch = (query: string) => {
  if (!query.trim()) {
    clearAddressSearch();
    return;
  }
  updateQuery({ address_query: query });
};

const clearAddressSearch = () => {
  const { address_query, ...filtersWithoutAddress } = route.query;
  router.replace({
    query: filtersWithoutAddress,
  });
};

// Избранное (не зависит от фильтров)
const { data: favoritesData } = useAsyncData("favorites", () => $api("offers/favorites/"));
const favoriteOffers = computed(() => {
  return new Set(favoritesData.value?.map((item) => item.id) || []);
});

const mapState = useMapState();

onBeforeUnmount(() => {
  mapState.value.center = undefined;
});
</script>

<style scoped>
@reference 'tailwindcss';
.map-content {
  @apply flex flex-col flex-1  min-h-0;
}

.loading-icon {
  @apply size-5 absolute z-10 md:size-20;
}

.map-container {
  @apply flex justify-center items-center flex-auto min-h-0 overflow-hidden border border-[#e2e8f0] bg-white rounded-xl  md:h-auto;
}

/* Мобильные адаптации */
@media (max-width: 640px) {
  .map-container {
    @apply h-[50vh];
  }
}

/* Анимация для фильтров */
.filters-transition-enter-active,
.filters-transition-leave-active {
  transition:
    max-height 0.3s ease-in-out,
    opacity 0.3s ease-in-out;
}

.filters-transition-enter-from,
.filters-transition-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.filters-transition-enter-to,
.filters-transition-leave-from {
  max-height: 2000px;
  opacity: 1;
}
</style>
