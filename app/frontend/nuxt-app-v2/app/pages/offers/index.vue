<template>
  <div class="flex gap-5 mx-auto p-5">
    <div class="w-[22%]">
      <FiltersSidebar ref="filtersRef" @filters-apply="handleFiltersApply" @filters-reset="handleFiltersReset" />
    </div>
    <main class="flex-1">
      <div class="mb-4">
        <AddressAutocomplete @address-selected="handleAddressSearch" @search-triggered="handleAddressSearch" />
      </div>
      <UBadge v-if="addressForSearch" size="xs" variant="subtle" class="mb-2 px-3 text-sm" color="info">
        {{ addressForSearch }}
        <UButton
          trailing-icon="heroicons:x-mark-16-solid"
          variant="outline"
          class="px-0 ring-[#e9f2ff] pt-2 border-0 bg-transparent"
          color="info"
          @click="clearAddressSearch"
          size="md"></UButton>
      </UBadge>
      <div v-if="offersError" class="error-message">
        {{ offersError }}
      </div>

      <div class="flex gap-8 text-sm items-center relative mb-5">
        <span class="font-[550]">Всего объявлений: {{ totalCount.toLocaleString("ru-RU") }}</span>
        <span class="font-[550] text-primary">Подходящих объявлений: {{ filteredCount.toLocaleString("ru-RU") }}</span>
        <USelect
          v-model="sortValue"
          :items="sortFields"
          class="w-48"
          value-key="value"
          :icon="icon"
          :ui="{
            trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
          }">
        </USelect>

        <UButton icon="i-bx:export" @click="exportCsv()" class="absolute right-0" variant="outline" color="info" v-if="userRole == 'Админ'">Экспорт в CSV</UButton>
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
        <UCard variant="outline" v-for="offer in offers" :key="offer.id" class="offer-card" @click="openOffer(offer)">
          <div class="flex h-42">
            <div class="w-65 relative">
              <img v-if="offer.images_urls?.length" :src="offer.images_urls[0]" class="object-cover w-full h-full" />
              <div v-else class="no-image">
                <UIcon name="i-heroicons-photo" class="text-gray-400 text-2xl" />
              </div>
              <UBadge v-if="offer.is_new_house == true" color="neutral" variant="solid" class="absolute top-2 left-2"> Новостройка </UBadge>
            </div>
            <div class="offer-details">
              <div class="offer-header">
                <div class="offer-title-section">
                  <div class="flex gap-2">
                    <UBadge v-if="offer.family_category" :color="getCategoryColor(offer.family_category)" variant="solid" class="category-badge">
                      Семья: {{ getCategoryLabel(offer.family_category) }}
                      <span v-if="offer.family_score !== null && offer.family_score !== undefined"> ({{ offer.family_score.toFixed(2) }}) </span>
                    </UBadge>
                    <UBadge v-if="offer.elderly_category" :color="getCategoryColor(offer.elderly_category)" variant="solid" class="category-badge">
                      Пожилые: {{ getCategoryLabel(offer.elderly_category) }}
                      <span v-if="offer.elderly_score !== null && offer.elderly_score !== undefined"> ({{ offer.elderly_score.toFixed(2) }}) </span>
                    </UBadge>
                    <UBadge v-if="offer.transport_access_category" :color="getCategoryColor(offer.transport_access_category)" variant="solid" class="category-badge">
                      Транспорт:
                      {{ getCategoryLabel(offer.transport_access_category) }}
                      <span v-if="offer.transport_access_score !== null && offer.transport_access_score !== undefined"> ({{ offer.transport_access_score.toFixed(2) }}) </span>
                    </UBadge>
                  </div>
                  <h3 class="offer-title">
                    {{ offer.title || "Без названия" }}
                  </h3>
                  <div class="offer-address">
                    <UIcon name="tabler:map-pin" class="size-5" />
                    {{ offer.address?.full_address }}
                  </div>
                  <div class="offer-specs">
                    <div class="spec-item">
                      <UIcon name="bx:area" class="size-6" />
                      <span>{{ offer.total_area || "–" }} м²</span>
                    </div>
                    <div v-if="offer.land_area" class="spec-item">
                      <UIcon name="lucide:land-plot" class="size-6" />
                      <span>{{ offer.land_area || "–" }} сот.</span>
                    </div>
                    <div v-if="offer.rooms_count" class="spec-item">
                      <UIcon name="temaki:room" class="size-6" />
                      <span>{{ offer.rooms_count }} комн.</span>
                    </div>
                    <div v-if="offer.floor" class="spec-item">
                      <UIcon name="material-symbols:floor" class="size-6" />
                      <span>{{ offer.floor }}{{ offer.house_floors_count ? "/" + offer.house_floors_count : "" }} эт.</span>
                    </div>

                    <div v-if="offer.floor === null && offer.house_floors_count !== null" class="spec-item">
                      <UIcon name="material-symbols:floor" class="size-6" />
                      <span>{{ offer.house_floors_count }} эт.</span>
                    </div>
                    <div v-if="offer.has_water_supply" class="spec-item">
                      <UIcon name="material-symbols:water-drop-outline" class="size-6" />
                      <span>Вода</span>
                    </div>
                    <div v-if="offer.has_electricity" class="spec-item">
                      <UIcon name="mage:electricity" class="size-6" />
                      <span>Электричество</span>
                    </div>

                    <div v-if="offer.renovation_type?.name" class="spec-item">
                      <UIcon name="lsicon:decorate-outline" class="size-6" />
                      <span>{{ offer.renovation_type?.name }}</span>
                    </div>
                    <div v-if="offer.house_built_year" class="spec-item">
                      <UIcon name="i-heroicons-calendar" class="size-6" />
                      <span>{{ offer.house_built_year }} г.</span>
                    </div>
                    <div v-if="offer.is_build_complete" class="spec-item">
                      <UIcon name="fluent-mdl2:completed-solid" class="size-6" />
                      <span>Сдан</span>
                    </div>
                    <div v-if="offer.has_furniture" class="spec-item">
                      <UIcon name="temaki:furniture" class="size-6" />
                      <span>С мебелью</span>
                    </div>
                    <div v-if="offer.has_elevator" class="spec-item">
                      <UIcon name="tabler:elevator" class="size-6" />
                      <span>Лифт</span>
                    </div>
                    <div v-if="offer.has_garbage_chute" class="spec-item">
                      <UIcon name="mdi:garbage-can-outline" class="size-6" />
                      <span>Мусоропровод</span>
                    </div>
                  </div>
                </div>
                <div class="offer-price-section">
                  <button class="favorite-heart" :class="{ active: isFavorite(offer.id) }" @click.stop="toggleFavorite(offer)">
                    <UIcon :name="isFavorite(offer.id) ? 'material-symbols-light:favorite' : 'material-symbols-light:favorite-outline'" class="heart-icon" />
                  </button>
                  <span class="creation-date spec-item"
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
                  <div class="flex items-center gap-3">
                    <UBadge v-if="offer.price_category" :color="getPriceCategoryColor(offer.price_category)" variant="solid" class="category-badge">
                      {{ getPriceCategoryLabel(offer.price_category) }}
                    </UBadge>
                    <div class="offer-price">
                      {{ formatPrice(offer.price) }}
                    </div>
                  </div>
                  <div class="price-per-meter">{{ formatPrice(offer.price_per_square_meter) }}/м²</div>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <div class="pagination-container" v-if="totalPages > 1">
        <div class="pagination">
          <UButton @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" variant="outline" class="pagination-button">
            <UIcon name="i-heroicons-chevron-left" class="size-4" />
            Назад
          </UButton>
          <div class="page-numbers">
            <UButton v-if="currentPage > 3" @click="goToPage(1)" :variant="currentPage === 1 ? 'solid' : 'outline'" class="page-button"> 1 </UButton>
            <span v-if="currentPage > 4" class="page-ellipsis">...</span>
            <UButton
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :variant="page === currentPage ? 'solid' : 'outline'"
              :color="page === currentPage ? 'primary' : 'neutral'"
              class="page-button">
              {{ page }}
            </UButton>
            <span v-if="currentPage < totalPages - 3" class="page-ellipsis">...</span>
            <UButton v-if="currentPage < totalPages - 2" @click="goToPage(totalPages)" :variant="currentPage === totalPages ? 'solid' : 'outline'" class="page-button">
              {{ totalPages }}
            </UButton>
          </div>
          <UButton @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" variant="outline" class="pagination-button">
            Вперед
            <UIcon name="i-heroicons-chevron-right" class="size-4" />
          </UButton>
        </div>
        <div class="page-jump">
          <span class="jump-label">Перейти на:</span>
          <UInput v-model.number="jumpPage" type="number" :min="1" :max="totalPages" class="jump-input" @keyup.enter="goToPage(jumpPage)" />
          <UButton @click="goToPage(jumpPage)" variant="outline" class="jump-button"> Перейти </UButton>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { jwtDecode } from "jwt-decode";
import type { OfferResponseFull, OfferResponseWithPagination } from "~/types/api";
const { logout, loading, accessToken, isAuthenticated } = useAuth();
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

const exportCsv = async () => {
  try {
    const query = prepareRequestQuery();

    const blob = await $api("/offers/export", {
      method: "GET",
      params: query,
      responseType: "blob", // ⬅️ ключевой момент
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
  refreshOffers();
};

const handleFiltersReset = async () => {
  offset.value = 0;

  const filtersToKeep: Partial<Filters> = {};

  if (currentFilters.value.address_query) {
    filtersToKeep.address_query = currentFilters.value.address_query;
  }

  // if (currentFilters.value.property_type) {
  //     filtersToKeep.property_type = currentFilters.value.property_type
  // }

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

:deep(*) {
  @apply rounded-md!;
}

:deep(button) {
  @apply cursor-pointer;
}

.offer-card {
  @apply cursor-pointer transition-all duration-250 hover:ring-[#c1f4eb] hover:bg-[#c1f4eb];
}

.no-image {
  @apply w-full h-full flex items-center justify-center bg-[#f7fafc];
}

.favorite-heart {
  @apply absolute top-[-12px] right-[-38px] bg-white/90 rounded-full! w-8 h-8 flex justify-center items-center hover:text-red-500 hover:bg-neutral-100!;
}

.favorite-heart.active {
  @apply bg-[#fdecec] text-red-500 transition-all duration-300;
}
.heart-icon {
  @apply transition-all duration-300 size-5;
}

.offer-details {
  @apply flex flex-col w-full px-5;
}

.category-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.sort-select {
  background: #e9f2ff;
  padding: 6px;
  color: oklch(0.623 0.214 259.815);
}

.sort-select option {
  background: white;
  color: black;
}

.category-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.offer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.offer-title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  min-width: 0;
}

.offer-title {
  display: flex;
  font-weight: 600;
  font-size: 1.125rem;
  line-height: 1.4;
  color: #2d3748;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.offer-address {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.9rem;
  color: #718096;
  line-height: 1.4;
}

.offer-price-section {
  text-align: right;
  flex-shrink: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-right: 1rem;
  top: -5px;
}

.offer-price {
  font-weight: 700;
  font-size: 1.375rem;
  color: #2b6cb0;
}

.clear-address-button {
  padding-top: 5px;
  font-size: 20px;
}

.price-per-meter {
  font-size: 0.875rem;
  color: #38a169;
  font-weight: 600;
}

.offer-specs {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4a5568;
}

/* Пагинация */
.pagination-container {
  margin-top: 2rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.creation-date {
  position: absolute;
  top: 8.5rem;
  width: max-content;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.pagination-button,
.page-button {
  min-width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.page-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  color: #6b7280;
  font-weight: 500;
}

.page-jump {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.jump-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.jump-input {
  width: 5rem;
}

.jump-button {
  height: 2.5rem;
}

/* Сообщение об отсутствии результатов */
.no-results {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-top: 250px;
}

.no-results-content {
  max-width: 300px;
}

.no-results-icon {
  font-size: 4rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.no-results h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.no-results p {
  color: #6b7280;
  font-size: 0.875rem;
}
</style>
