<template>
  <div class="flex flex-col md:flex-row gap-2.5 mx-auto p-3 md:p-5 md:gap-5">
    <div class="md:hidden">
      <UButton icon="i-heroicons-funnel" @click="toggleFiltersSidebar" variant="outline" color="primary" class="w-full justify-center">
        {{ showFilters ? "Скрыть фильтры" : "Показать фильтры" }}
      </UButton>
    </div>
    <div
      class="w-full md:w-[22%] md:max-h-full transition-all duration-300 ease-in-out"
      :class="{
        'max-h-0 overflow-hidden md:max-h-none md:overflow-visible': !showFilters,
        'max-h-500 overflow-visible mb-4': showFilters,
      }">
      <FiltersSidebar ref="filtersRef" @filters-apply="handleFiltersApply" @filters-reset="handleFiltersReset" />
    </div>
    <main class="flex-1 w-full">
      <div class="mb-4">
        <AddressAutocomplete @address-selected="handleAddressSearch" @search-triggered="handleAddressSearch" />
      </div>
      <UBadge v-if="addressForSearch" size="xs" variant="subtle" class="mb-2 px-2 md:px-3 text-xs md:text-sm" color="info">
        <span class="truncate max-w-50 md:max-w-none">{{ addressForSearch }}</span>
        <UButton
          trailing-icon="heroicons:x-mark-16-solid"
          variant="outline"
          class="px-0 ring-[#e9f2ff] pt-2 border-0 bg-transparent ml-1"
          color="info"
          @click="clearAddressSearch"
          size="md"></UButton>
      </UBadge>
      <div v-if="offersError" class="error-message">
        {{ offersError }}
      </div>
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-8 text-sm items-start sm:items-center relative mb-5">
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-8">
          <span class="font-[550] whitespace-nowrap">Всего объявлений: {{ totalCount.toLocaleString("ru-RU") }}</span>
          <span class="font-[550] text-primary whitespace-nowrap">Подходящих: {{ filteredCount.toLocaleString("ru-RU") }}</span>
        </div>
        <div class="flex items-center gap-4 w-full sm:w-auto">
          <USelect
            v-model="sortValue"
            :items="sortFields"
            class="w-full sm:w-48"
            value-key="value"
            :icon="icon"
            :ui="{
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }">
          </USelect>
          <SmartAssistantChat />
          <UButton icon="i-bx:export" @click="exportCsv()" class="sm:absolute sm:right-0" variant="outline" color="info" v-if="userRole == 'Админ'">
            <span class="hidden sm:inline">Экспорт в CSV</span>
          </UButton>
        </div>
      </div>
      <div v-if="offersPending" class="flex justify-center mt-75">
        <UIcon size="70" name="codex:loader" class="loading-icon" />
      </div>
      <div v-else-if="offers.length === 0 && !offersPending" class="no-results">
        <UIcon name="i-heroicons-magnifying-glass" class="no-results-icon" />
        <h3>Объявления не найдены</h3>
        <p>Попробуйте изменить параметры фильтрации</p>
      </div>
      <div v-else class="flex flex-col gap-4">
        <div variant="outline" v-for="offer in offers" :key="offer.id" class="offer-card md:p-6!" @click="openOffer(offer)">
          <div class="flex flex-col sm:flex-row h-auto sm:h-42 relative">
            <button class="favorite-heart top-1! right-1! z-10 sm:-top-5! sm:-right-5!" :class="{ active: isFavorite(offer.id) }" @click.stop="toggleFavorite(offer)">
              <UIcon :name="isFavorite(offer.id) ? 'material-symbols-light:favorite' : 'material-symbols-light:favorite-outline'" class="heart-icon" />
            </button>
            <div class="w-full sm:w-65 relative mb-4 sm:mb-0 h-48 sm:h-auto">
              <img v-if="offer.images_urls?.length" :src="offer.images_urls[0]" class="object-cover w-full h-full rounded-lg" />
              <div v-else class="no-image w-full h-full">
                <UIcon name="i-heroicons-photo" class="text-gray-400 text-2xl" />
              </div>
              <UBadge v-if="offer.is_new_house == true" color="neutral" variant="solid" class="absolute top-2 left-2 text-xs"> Новостройка </UBadge>
            </div>
            <div class="offer-details w-full md:px-6!">
              <div class="offer-header flex-col sm:flex-row">
                <div class="offer-title-section w-full sm:flex-1">
                  <div class="flex flex-wrap gap-1 sm:gap-2 mb-2">
                    <UBadge v-if="offer.family_category" :color="getCategoryColor(offer.family_category)" variant="solid" class="category-badge text-xs">
                      Семья: {{ getCategoryLabel(offer.family_category) }}
                      <span v-if="offer.family_score !== null && offer.family_score !== undefined" class="hidden sm:inline"> ({{ offer.family_score.toFixed(2) }}) </span>
                    </UBadge>
                    <UBadge v-if="offer.elderly_category" :color="getCategoryColor(offer.elderly_category)" variant="solid" class="category-badge text-xs">
                      Пожилые: {{ getCategoryLabel(offer.elderly_category) }}
                      <span v-if="offer.elderly_score !== null && offer.elderly_score !== undefined" class="hidden sm:inline"> ({{ offer.elderly_score.toFixed(2) }}) </span>
                    </UBadge>
                    <UBadge v-if="offer.transport_access_category" :color="getCategoryColor(offer.transport_access_category)" variant="solid" class="category-badge text-xs">
                      Транспорт:
                      {{ getCategoryLabel(offer.transport_access_category) }}
                      <span v-if="offer.transport_access_score !== null && offer.transport_access_score !== undefined" class="hidden sm:inline">
                        ({{ offer.transport_access_score.toFixed(2) }})
                      </span>
                    </UBadge>
                  </div>
                  <h3 class="offer-title text-base sm:text-lg">
                    {{ offer.title || "Без названия" }}
                  </h3>
                  <div class="offer-address mt-1">
                    <UIcon name="tabler:map-pin" class="size-4 sm:size-5" />
                    <span class="text-xs sm:text-sm">{{ offer.address?.full_address }}</span>
                  </div>
                  <div class="offer-specs mt-3">
                    <div class="spec-item">
                      <UIcon name="bx:area" class="size-5 sm:size-6" />
                      <span class="text-xs sm:text-sm">{{ offer.total_area || "–" }} м²</span>
                    </div>
                    <div v-if="offer.land_area" class="spec-item">
                      <UIcon name="lucide:land-plot" class="size-5 sm:size-6" />
                      <span class="text-xs sm:text-sm">{{ offer.land_area || "–" }} сот.</span>
                    </div>
                    <div v-if="offer.rooms_count" class="spec-item">
                      <UIcon name="temaki:room" class="size-5 sm:size-6" />
                      <span class="text-xs sm:text-sm">{{ offer.rooms_count }} комн.</span>
                    </div>
                    <div v-if="offer.floor" class="spec-item">
                      <UIcon name="material-symbols:floor" class="size-5 sm:size-6" />
                      <span class="text-xs sm:text-sm">{{ offer.floor }}{{ offer.house_floors_count ? "/" + offer.house_floors_count : "" }} эт.</span>
                    </div>
                    <div v-if="offer.floor === null && offer.house_floors_count !== null" class="spec-item">
                      <UIcon name="material-symbols:floor" class="size-5 sm:size-6" />
                      <span class="text-xs sm:text-sm">{{ offer.house_floors_count }} эт.</span>
                    </div>
                    <div v-if="offer.has_water_supply" class="spec-item">
                      <UIcon name="material-symbols:water-drop-outline" class="size-5 sm:size-6" />
                      <span class="text-xs sm:text-sm">Вода</span>
                    </div>
                    <div v-if="offer.has_electricity" class="spec-item">
                      <UIcon name="mage:electricity" class="size-5 sm:size-6" />
                      <span class="text-xs sm:text-sm">Электричество</span>
                    </div>
                    <div v-if="offer.renovation_type?.name" class="spec-item">
                      <UIcon name="lsicon:decorate-outline" class="size-5 sm:size-6" />
                      <span class="text-xs sm:text-sm">{{ offer.renovation_type?.name }}</span>
                    </div>
                    <div v-if="offer.house_built_year" class="spec-item">
                      <UIcon name="i-heroicons-calendar" class="size-5 sm:size-6" />
                      <span class="text-xs sm:text-sm">{{ offer.house_built_year }} г.</span>
                    </div>
                    <div v-if="offer.is_build_complete" class="spec-item">
                      <UIcon name="fluent-mdl2:completed-solid" class="size-5 sm:size-6" />
                      <span class="text-xs sm:text-sm">Сдан</span>
                    </div>
                    <div v-if="offer.has_furniture" class="spec-item">
                      <UIcon name="temaki:furniture" class="size-5 sm:size-6" />
                      <span class="text-xs sm:text-sm">С мебелью</span>
                    </div>
                    <div v-if="offer.has_elevator" class="spec-item">
                      <UIcon name="tabler:elevator" class="size-5 sm:size-6" />
                      <span class="text-xs sm:text-sm">Лифт</span>
                    </div>
                    <div v-if="offer.has_garbage_chute" class="spec-item">
                      <UIcon name="mdi:garbage-can-outline" class="size-5 sm:size-6" />
                      <span class="text-xs sm:text-sm">Мусоропровод</span>
                    </div>
                  </div>
                </div>
                <div class="offer-price-section flex justify-between pr-0! w-full sm:w-auto mt-4 sm:mt-0">
                  <span class="creation-date spec-item text-xs sm:text-sm"
                    >Опубликовано:
                    {{
                      new Date(offer.creation_date_source).toLocaleString("ru-RU", {
                        timeZone: "Europe/Moscow",
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }}</span
                  >
                  <div class="flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <UBadge v-if="offer.price_category" :color="getPriceCategoryColor(offer.price_category)" variant="solid" class="category-badge text-xs w-fit sm:mb-3.5">
                      {{ getPriceCategoryLabel(offer.price_category) }}
                    </UBadge>
                    <div class="flex flex-col">
                      <div class="offer-price text-lg sm:text-xl">
                        {{ formatPrice(offer.price) }}
                      </div>
                      <div class="price-per-meter text-sm sm:text-sm">{{ formatPrice(offer.price_per_square_meter) }}/м²</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination-container" v-if="totalPages > 1">
        <div class="pagination sm:flex-row">
          <UButton @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" variant="outline" class="pagination-button sm:mb-0">
            <UIcon name="i-heroicons-chevron-left" class="size-4" />
            <span class="hidden sm:inline">Назад</span>
          </UButton>
          <div class="page-numbers flex-wrap justify-center my-2 sm:my-0">
            <UButton v-if="currentPage > 3" @click="goToPage(1)" :variant="currentPage === 1 ? 'solid' : 'outline'" class="page-button hidden sm:inline-block"> 1 </UButton>
            <span v-if="currentPage > 4" class="page-ellipsis hidden sm:inline">...</span>
            <UButton
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :variant="page === currentPage ? 'solid' : 'outline'"
              :color="page === currentPage ? 'primary' : 'neutral'"
              class="page-button">
              {{ page }}
            </UButton>
            <span v-if="currentPage < totalPages - 3" class="page-ellipsis hidden sm:inline">...</span>
            <UButton
              v-if="currentPage < totalPages - 2"
              @click="goToPage(totalPages)"
              :variant="currentPage === totalPages ? 'solid' : 'outline'"
              class="page-button hidden sm:inline-block">
              {{ totalPages }}
            </UButton>
          </div>
          <UButton @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" variant="outline" class="pagination-button sm:mt-0">
            <span class="hidden sm:inline">Вперед</span>
            <UIcon name="i-heroicons-chevron-right" class="size-4" />
          </UButton>
        </div>
        <div class="page-jump mt-4">
          <span class="jump-label text-xs sm:text-sm">Перейти на:</span>
          <UInput v-model.number="jumpPage" type="number" :min="1" :max="totalPages" class="jump-input w-16 sm:w-20" @keyup.enter="goToPage(jumpPage)" />
          <UButton @click="goToPage(jumpPage)" variant="outline" class="jump-button text-xs sm:text-sm"> Перейти </UButton>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { jwtDecode } from "jwt-decode";
import type { OfferResponseFull } from "~/types/api";
const { accessToken } = useAuth();
const userRole = computed(() => {
  if (!accessToken.value) return "";
  try {
    const { role } = jwtDecode<{ role: string }>(accessToken.value);
    return role;
  } catch {
    return "";
  }
});

interface Filters {
  [key: string]: any;
}
const showFilters = ref(false);

const toggleFiltersSidebar = () => {
  showFilters.value = !showFilters.value;
};

// const handleResize = () => {
//   if (window.innerWidth >= 768) {
//     showFilters.value = true;
//   } else {
//     showFilters.value = false;
//   }
// };

// onMounted(() => {
//   handleResize();
//   window.addEventListener("resize", handleResize);
// });

// onUnmounted(() => {
//   window.removeEventListener("resize", handleResize);
// });

const exportCsv = async () => {
  try {
    const query = prepareRequestQuery();

    const blob = await $api("/offers/export", {
      method: "GET",
      params: query,
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `offers_${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Ошибка экспорта CSV:", error);
  }
};

const sortFields = ref<SelectItem[]>([
  {
    label: "Цена",
    value: "price:asc",
    icon: "material-symbols:arrow-upward-alt",
  },
  {
    label: "Цена",
    value: "price:desc",
    icon: "material-symbols:arrow-downward-alt",
  },
  {
    label: "Цена за м²",
    value: "price_per_square_meter:asc",
    icon: "material-symbols:arrow-upward-alt",
  },
  {
    label: "Цена за м²",
    value: "price_per_square_meter:desc",
    icon: "material-symbols:arrow-downward-alt",
  },
  {
    label: "Площадь",
    value: "total_area:asc",
    icon: "material-symbols:arrow-upward-alt",
  },
  {
    label: "Площадь",
    value: "total_area:desc",
    icon: "material-symbols:arrow-downward-alt",
  },
  {
    label: "Дата публикации",
    value: "creation_date_source:asc",
    icon: "material-symbols:arrow-upward-alt",
  },
  {
    label: "Дата публикации",
    value: "creation_date_source:desc",
    icon: "material-symbols:arrow-downward-alt",
  },
  {
    label: "Просмотры",
    value: "views_count:asc",
    icon: "material-symbols:arrow-upward-alt",
  },
  {
    label: "Просмотры",
    value: "views_count:desc",
    icon: "material-symbols:arrow-downward-alt",
  },
]);
const sortValue = ref(sortFields.value[7]?.value);
const icon = computed(() => sortFields.value.find((item) => item.value === sortValue.value)?.icon);
const { $api } = useNuxtApp();
const limit = ref(20);
const offset = ref(0);
const jumpPage = ref(1);
const currentFilters = ref<Filters>({});
const addressForSearch = computed(() => currentFilters.value.address_query);

const prepareRequestQuery = () => {
  const query: Record<string, any> = {
    limit: limit.value,
    offset: offset.value,
  };

  if (currentFilters.value && Object.keys(currentFilters.value).length > 0) {
    Object.entries(currentFilters.value).forEach(([key, value]) => {
      if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) return;

      if (Array.isArray(value)) {
        query[key] = value.filter((item) => item != null && item !== "");
      } else if (typeof value === "boolean") {
        if (value === true || value === false) {
          query[key] = String(value);
        }
      } else if (typeof value === "object" && !Array.isArray(value)) {
        query[key] = JSON.stringify(value);
      } else {
        query[key] = String(value);
      }
    });
  }

  if (sortValue.value) {
    const [sort_by, sort_order] = sortValue.value.split(":");
    query.sort_by = sort_by;
    query.sort_order = sort_order;
  }

  return query;
};

const {
  data: offersData,
  pending: offersPending,
  error: offersError,
  refresh: refreshOffers,
} = useAsyncData(
  "offers",
  () =>
    $api("/offers", {
      params: prepareRequestQuery(),
    }),
  {},
);

const offers = computed(() => offersData.value?.offers || []);
const totalCount = computed(() => offersData.value?.total_count || 0);
const filteredCount = computed(() => offersData.value?.filtered_count || 0);

const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1);
const totalPages = computed(() => Math.ceil(filteredCount.value / limit.value));

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const { data: favoritesData, refresh: refreshFavorites } = useAsyncData("favorites", () => $api("offers/favorites/"));

const favoriteOffers = computed(() => {
  return new Set(favoritesData.value?.map((item) => item.id) || []);
});

const toggleFavorite = async (offer: OfferResponseFull) => {
  if (!offer.id) return;

  const offerId = offer.id;
  const wasFavorite = favoriteOffers.value.has(offerId);

  try {
    if (wasFavorite) {
      $api(`offers/favorites/${offerId}`, { method: "DELETE" });

      if (favoritesData.value) {
        favoritesData.value = favoritesData.value.filter((item) => item.id !== offerId);
      }
    } else {
      $api(`offers/favorites/${offerId}`, { method: "POST" });

      if (favoritesData.value) {
        favoritesData.value = [...favoritesData.value, offer];
      }
    }
  } catch (error) {
    console.error("Ошибка при обновлении избранного:", error);
  }
};

const isFavorite = (offerId: number | null): boolean => {
  return offerId !== null && favoriteOffers.value.has(offerId);
};

const handleFiltersApply = async (filtersData: Filters) => {
  console.log("Получены фильтры через событие:", filtersData);
  offset.value = 0;
  refreshFavorites();

  currentFilters.value = {
    ...filtersData,
    ...("address_query" in currentFilters.value && {
      address_query: currentFilters.value.address_query,
    }),
  };

  console.log("Объединённые фильтры:", currentFilters.value);

  if (window.innerWidth < 768) {
    showFilters.value = false;
  }

  refreshOffers();
};

const handleFiltersReset = async () => {
  offset.value = 0;

  const filtersToKeep: Partial<Filters> = {};

  if (currentFilters.value.address_query) {
    filtersToKeep.address_query = currentFilters.value.address_query;
  }

  currentFilters.value = { ...filtersToKeep };

  refreshFavorites();
  refreshOffers();
};

const handleAddressSearch = async (query: string) => {
  if (!query.trim()) {
    clearAddressSearch();
    return;
  }

  currentFilters.value = {
    ...currentFilters.value,
    address_query: query,
  };

  offset.value = 0;
  refreshOffers();
};

const clearAddressSearch = async () => {
  const { address_query, ...filtersWithoutAddress } = currentFilters.value;
  currentFilters.value = filtersWithoutAddress;
  offset.value = 0;
  refreshOffers();
};

const goToPage = async (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  offset.value = (page - 1) * limit.value;
  refreshOffers();
};

const openOffer = (offer: OfferResponseFull) => {
  const router = useRouter();
  router.push(`/offers/${offer.id}`);
};

const formatPrice = (price: number | null) => (price ? new Intl.NumberFormat("ru-RU").format(price) + " ₽" : "Цена не указана");

const getPriceCategoryColor = (category: string) => {
  switch (category) {
    case "expensive":
      return "error";
    case "normal":
      return "info";
    case "cheap":
      return "success";
    default:
      return "gray";
  }
};

const getPriceCategoryLabel = (category: string) => {
  switch (category) {
    case "expensive":
      return "Выше рынка";
    case "normal":
      return "Рыночная цена";
    case "cheap":
      return "Ниже рынка";
    default:
      return category;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "high":
      return "success";
    case "medium":
      return "warning";
    case "low":
      return "error";
    default:
      return "gray";
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case "high":
      return "Высокая";
    case "medium":
      return "Средняя";
    case "low":
      return "Низкая";
    default:
      return category;
  }
};
watch(sortValue, async () => {
  offset.value = 0;
  refreshOffers();
});

watch(currentPage, (newPage) => {
  jumpPage.value = newPage;
});
</script>

<style scoped>
@reference "tailwindcss";
@reference "@nuxt/ui";
.offer-card {
  @apply cursor-pointer ring-1 ring-default rounded-lg transition-all duration-250 p-2 hover:ring-[#c1f4eb] hover:bg-[#c1f4eb];
}

.no-image {
  @apply w-full h-full flex items-center justify-center bg-[#f7fafc];
}

.favorite-heart {
  @apply absolute  bg-white/90 rounded-full w-8 h-8 flex justify-center items-center hover:text-red-500 hover:bg-neutral-100;
}

.favorite-heart.active {
  @apply bg-[#fdecec] text-red-500 transition-all duration-300;
}

.heart-icon {
  @apply transition-all duration-300 size-5;
}

.offer-details {
  @apply flex flex-col w-full px-0 sm:px-5;
}

.category-badge {
  @apply text-xs px-2 py-1;
}

.offer-header {
  @apply flex justify-between items-start gap-4;
}

.offer-title-section {
  @apply flex-1 flex flex-col gap-1 min-w-0;
}

.offer-title {
  @apply font-semibold text-lg leading-relaxed line-clamp-2 text-[#2d3748];
}

.offer-address {
  @apply flex items-center gap-1.5 text-sm leading-relaxed text-[#718096];
}

.offer-price-section {
  @apply text-right flex-shrink-0 relative flex flex-col items-end pr-4 -top-1;
}

.offer-price {
  @apply font-bold text-xl text-[#2b6cb0] text-nowrap;
}

.price-per-meter {
  @apply text-sm font-semibold text-[#38a169] text-nowrap;
}

.offer-specs {
  @apply flex items-center gap-x-4 sm:gap-x-4 gap-y-2 flex-wrap;
}

.spec-item {
  @apply flex items-center gap-2 text-sm text-[#4a5568];
}

.pagination-container {
  @apply mt-8 pt-6 border-t border-gray-300 bg-white;
}

.pagination {
  @apply flex justify-center items-center gap-3 mb-4;
}

.creation-date {
  @apply absolute top-[8.5rem] w-max text-nowrap;
}

.page-numbers {
  @apply flex gap-1;
}

.pagination-button,
.page-button {
  @apply min-w-10 h-10 flex items-center justify-center text-sm font-medium;
}

.page-ellipsis {
  @apply min-w-10 h-10 flex items-center justify-center font-medium text-[#6b7280];
}

.page-jump {
  @apply flex justify-center items-center gap-2 mt-4;
}

.jump-label {
  @apply text-sm text-[#6b7280];
}

.jump-input {
  @apply w-20;
}

.jump-button {
  @apply h-10;
}

.no-results {
  @apply flex flex-col justify-center items-center text-center mt-60;
}

.no-results-icon {
  @apply text-6xl mb-4 text-[#9ca3af];
}

.no-results h3 {
  @apply text-xl font-semibold mb-2 text-[#374151];
}

.no-results p {
  @apply text-sm text-[#6b7280];
}

@media (max-width: 640px) {
  .offer-specs {
    @apply gap-3;
  }

  .spec-item {
    @apply gap-1.5;
  }

  .creation-date {
    @apply static text-xs mt-2;
  }
  .offer-price-section {
    @apply flex flex-row;
  }
  .favorite-heart {
    @apply absolute -top-55 right-2;
  }

  .page-button {
    @apply min-w-8 h-8 text-xs;
  }

  .pagination-button {
    @apply px-3 text-sm;
  }
}

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
