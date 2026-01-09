<template>

    <div class="page-layout">
        <!-- Боковая панель с фильтрами -->
        <FiltersSidebar ref="filtersRef" @filters-apply="handleFiltersApply" @filters-reset="handleFiltersReset" />

        <!-- Основной контент -->
        <main class="main-content">
            <!-- Поиск по адресу -->
            <div class="mb-3">
                <AddressAutocomplete @address-selected="handleAddressSearch" @search-triggered="handleAddressSearch" />
            </div>

            <UBadge v-if="addressForSearch" size="lg" class="mb-3 rounded-sm" color="info">
                {{ addressForSearch }}
                <UButton trailing-icon="heroicons:x-mark-16-solid" class="px-0 pt-2 " color="info"
                    @click="clearAddressSearch" size="md"></UButton>
            </UBadge>

            <!-- Ошибка -->
            <div v-if="offersError" class="error-message">
                {{ offersError }}
            </div>

            <!-- Информация о результатах -->
            <div class="results-info rounded-lg ring ring-default" variant="outline">
                <div class="results-stats">
                    <span class="total-count">Всего объявлений: {{ totalCount.toLocaleString('ru-RU') }}</span>
                    <span class="filtered-count">Подходящих объявлений: {{ filteredCount.toLocaleString('ru-RU')
                        }}</span>
                    <USelect v-model="sortValue" :items="sortFields" class="w-48" value-key="value" :icon="icon" :ui="{
                        trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
                    }">

                    </USelect>

                </div>
            </div>

            <div class="offers-container">
                <div v-if="offersPending" class="loading-indicator">
                    <UIcon size="70" name="codex:loader" class="loading-icon" />
                </div>
                <div v-else-if="offers.length === 0 && !offersPending" class="no-results">
                    <UIcon name="i-heroicons-magnifying-glass" class="no-results-icon" />
                    <h3>Объявления не найдены</h3>
                    <p>Попробуйте изменить параметры фильтрации</p>
                </div>

                <!-- Список объявлений -->
                <div v-else class="offers-list">
                    <UCard variant="outline" v-for="offer in offers" :key="offer.id" class="offer-card"
                        @click="openOffer(offer)">
                        <div class="offer-content">
                            <div class="image-container">
                                <img v-if="offer.images_urls?.length" :src="offer.images_urls[0]" class="offer-img" />
                                <div v-else class="no-image">
                                    <UIcon name="i-heroicons-photo" class="text-gray-400 text-2xl" />
                                </div>
                                <UBadge v-if="offer.is_new_house == true" color="info" variant="solid"
                                    class="type-badge">
                                    Новостройка
                                </UBadge>
                            </div>

                            <div class="offer-details">



                                <div class="offer-header">
                                    <div class="offer-title-section">
                                        <!-- Категории и бейджи -->
                                        <div class="category-badges">
                                            <!-- Категория цены -->


                                            <!-- Семейная категория -->
                                            <UBadge v-if="offer.family_category"
                                                :color="getCategoryColor(offer.family_category)" variant="solid"
                                                class="category-badge">
                                                Семья: {{ getCategoryLabel(offer.family_category) }}
                                                <span
                                                    v-if="offer.family_score !== null && offer.family_score !== undefined">
                                                    ({{ offer.family_score.toFixed(2) }})
                                                </span>
                                            </UBadge>

                                            <!-- Для пожилых -->
                                            <UBadge v-if="offer.elderly_category"
                                                :color="getCategoryColor(offer.elderly_category)" variant="solid"
                                                class="category-badge">
                                                Пожилые: {{ getCategoryLabel(offer.elderly_category) }}
                                                <span
                                                    v-if="offer.elderly_score !== null && offer.elderly_score !== undefined">
                                                    ({{ offer.elderly_score.toFixed(2) }})
                                                </span>
                                            </UBadge>

                                            <!-- Транспортная доступность -->
                                            <UBadge v-if="offer.transport_access_category"
                                                :color="getCategoryColor(offer.transport_access_category)"
                                                variant="solid" class="category-badge">
                                                Транспорт: {{ getCategoryLabel(offer.transport_access_category) }}
                                                <span
                                                    v-if="offer.transport_access_score !== null && offer.transport_access_score !== undefined">
                                                    ({{ offer.transport_access_score.toFixed(2) }})
                                                </span>
                                            </UBadge>
                                        </div>

                                        <h3 class="offer-title">{{ offer.title || 'Без названия' }}</h3>
                                        <div class="offer-address">
                                            <UIcon name="tabler:map-pin" class="size-5" />
                                            {{ offer.address?.full_address }}
                                        </div>
                                        <div class="offer-specs">
                                            <div class="spec-item">
                                                <UIcon name="bx:area" class="size-6" />
                                                <span>{{ offer.total_area || '–' }} м²</span>
                                            </div>
                                            <div v-if="offer.land_area" class="spec-item">
                                                <UIcon name="lucide:land-plot" class="size-6" />
                                                <span>{{ offer.land_area || '–' }} сот.</span>
                                            </div>
                                            <div v-if="offer.rooms_count" class="spec-item">
                                                <UIcon name="temaki:room" class="size-6" />
                                                <span>{{ offer.rooms_count }} комн.</span>
                                            </div>
                                            <div v-if="offer.floor" class="spec-item">
                                                <UIcon name="material-symbols:floor" class="size-6" />
                                                <span>{{ offer.floor }}{{ offer.house_floors_count ? '/' +
                                                    offer.house_floors_count : '' }} эт.</span>
                                            </div>

                                            <div v-if="offer.floor === null && offer.house_floors_count !== null"
                                                class="spec-item">
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
                                        <button class="favorite-heart" :class="{ active: isFavorite(offer.id) }"
                                            @click.stop="toggleFavorite(offer)">
                                            <UIcon
                                                :name="isFavorite(offer.id) ? 'material-symbols-light:favorite' : 'material-symbols-light:favorite-outline'"
                                                class="heart-icon" />
                                        </button>
                                        <span class="creation-date spec-item">Опубликовано: {{ new
                                            Date(offer.creation_date_source).toLocaleString('ru-RU', {
                                                timeZone: 'Europe/Moscow',
                                                year: 'numeric',
                                                month: 'numeric',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) }}</span>
                                        <div class="flex items-center gap-3">
                                            <UBadge v-if="offer.price_category"
                                                :color="getPriceCategoryColor(offer.price_category)" variant="solid"
                                                class="category-badge">
                                                {{ getPriceCategoryLabel(offer.price_category) }}
                                            </UBadge>
                                            <div class="offer-price">{{ formatPrice(offer.price) }}</div>
                                        </div>
                                        <div class="price-per-meter">{{ formatPrice(offer.price_per_square_meter)
                                            }}/м²
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </UCard>
                </div>
            </div>

            <!-- Пагинация -->
            <div class="pagination-container" v-if="totalPages > 1">
                <div class="pagination">
                    <UButton @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" variant="outline"
                        class="pagination-button">
                        <UIcon name="i-heroicons-chevron-left" class="size-4" />
                        Назад
                    </UButton>

                    <div class="page-numbers">
                        <UButton v-if="currentPage > 3" @click="goToPage(1)"
                            :variant="currentPage === 1 ? 'solid' : 'outline'" class="page-button">
                            1
                        </UButton>

                        <span v-if="currentPage > 4" class="page-ellipsis">...</span>

                        <UButton v-for="page in visiblePages" :key="page" @click="goToPage(page)"
                            :variant="page === currentPage ? 'solid' : 'outline'"
                            :color="page === currentPage ? 'primary' : 'neutral'" class="page-button">
                            {{ page }}
                        </UButton>

                        <span v-if="currentPage < totalPages - 3" class="page-ellipsis">...</span>

                        <UButton v-if="currentPage < totalPages - 2" @click="goToPage(totalPages)"
                            :variant="currentPage === totalPages ? 'solid' : 'outline'" class="page-button">
                            {{ totalPages }}
                        </UButton>
                    </div>

                    <UButton @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" variant="outline"
                        class="pagination-button">
                        Вперед
                        <UIcon name="i-heroicons-chevron-right" class="size-4" />
                    </UButton>
                </div>

                <div class="page-jump">
                    <span class="jump-label">Перейти на:</span>
                    <UInput v-model.number="jumpPage" type="number" :min="1" :max="totalPages" class="jump-input"
                        @keyup.enter="goToPage(jumpPage)" />
                    <UButton @click="goToPage(jumpPage)" variant="outline" class="jump-button">
                        Перейти
                    </UButton>
                </div>
            </div>


        </main>
    </div>

</template>

<script setup lang="ts">
// Типы и интерфейсы (оставляем без изменений)
interface Address {
    full_address: string
}

interface Offer {
    id: number | null
    url: string | null
    images_urls: string[] | null
    is_new_house: boolean | null
    price: number | null
    price_per_square_meter: number | null
    total_area: number | null
    land_area: string | null
    floor: number | null
    price_category: string | null
    family_category: string | null
    family_score: number | null
    elderly_category: string | null
    elderly_score: number | null
    transport_access_category: string | null
    transport_access_score: number | null
    house_floors_count: number | null
    rooms_count: number | null
    house_built_year: number | null
    title: string | null
    creation_date_source: Date
    address: Address | null
}

interface OffersResponse {
    total_count: number
    filtered_count: number
    offers: Offer[]
    pagination: {
        limit: number
        offset: number
        has_more: boolean
    }
}

interface Filters {
    [key: string]: any
}

const sortFields = ref<SelectItem[]>([
    { label: 'Цена', value: 'price:asc', icon: 'material-symbols:arrow-upward-alt' },
    { label: 'Цена', value: 'price:desc', icon: 'material-symbols:arrow-downward-alt' },
    { label: 'Цена за м²', value: 'price_per_square_meter:asc', icon: 'material-symbols:arrow-upward-alt' },
    { label: 'Цена за м²', value: 'price_per_square_meter:desc', icon: 'material-symbols:arrow-downward-alt' },
    { label: 'Площадь', value: 'total_area:asc', icon: 'material-symbols:arrow-upward-alt' },
    { label: 'Площадь', value: 'total_area:desc', icon: 'material-symbols:arrow-downward-alt' },
    { label: 'Дата публикации', value: 'creation_date_source:asc', icon: 'material-symbols:arrow-upward-alt' },
    { label: 'Дата публикации', value: 'creation_date_source:desc', icon: 'material-symbols:arrow-downward-alt' },
    { label: 'Просмотры', value: 'views_count:asc', icon: 'material-symbols:arrow-upward-alt' },
    { label: 'Просмотры', value: 'views_count:desc', icon: 'material-symbols:arrow-downward-alt' }
])
const sortValue = ref(sortFields.value[7]?.value)
const icon = computed(() => sortFields.value.find(item => item.value === sortValue.value)?.icon)

// Получаем API из плагина
const { $api } = useNuxtApp()

const limit = ref(20)
const offset = ref(0)
const jumpPage = ref(1)

// Единый источник истины для фильтров
const currentFilters = ref<Filters>({})
const addressForSearch = computed(() => currentFilters.value.address_query)

// Функция для подготовки параметров запроса
const prepareRequestQuery = () => {
    const query: Record<string, any> = {
        limit: limit.value,
        offset: offset.value
    }

    console.log('Грузим офферы с фильтрами:', currentFilters.value)

    // Обрабатываем фильтры из currentFilters
    if (currentFilters.value && Object.keys(currentFilters.value).length > 0) {
        Object.entries(currentFilters.value).forEach(([key, value]) => {
            // Пропускаем null, undefined и пустые строки
            if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return

            // Обработка массивов
            if (Array.isArray(value)) {
                // Для $fetch массив автоматически преобразуется в повторяющиеся параметры
                query[key] = value.filter(item => item != null && item !== '')
            }
            // Обработка булевых значений
            else if (typeof value === 'boolean') {
                // Добавляем только true значения
                if (value === true) {
                    query[key] = String(value)
                }
            }
            // Обработка объектов (например, адрес)
            else if (typeof value === 'object' && !Array.isArray(value)) {
                // Сериализуем объект в JSON
                query[key] = JSON.stringify(value)
            }
            // Обработка строк и чисел
            else {
                query[key] = String(value)
            }
        })
    }

    // Добавляем сортировку из отдельной переменной
    if (sortValue.value) {
        const [sort_by, sort_order] = sortValue.value.split(":")
        query.sort_by = sort_by
        query.sort_order = sort_order
    }

    return query
}

const { data: offersData, pending: offersPending, error: offersError, refresh: refreshOffers } = await useAsyncData(
    'offers',
    () => $api('/offers', {
        params: prepareRequestQuery(),
    }), {
}
)

// Используем computed для преобразования данных
const offers = computed(() => offersData.value?.offers || [])
const totalCount = computed(() => offersData.value?.total_count || 0)
const filteredCount = computed(() => offersData.value?.filtered_count || 0)


// Computed properties для пагинации
const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)
const totalPages = computed(() => Math.ceil(filteredCount.value / limit.value))

const visiblePages = computed(() => {
    const pages = []
    const start = Math.max(1, currentPage.value - 2)
    const end = Math.min(totalPages.value, currentPage.value + 2)

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }
    return pages
})

// Загрузка избранного
const { data: favoritesData, refresh: refreshFavorites } = await useAsyncData('favorites',
    () => $api('offers/favorites/')
)



const favoriteOffers = computed(() => {
    return new Set(favoritesData.value?.map(item => item.id) || [])
})

const toggleFavorite = async (offer: Offer) => {
    if (!offer.id) return

    const offerId = offer.id
    const wasFavorite = favoriteOffers.value.has(offerId)

    try {
        if (wasFavorite) {
            $api(`offers/favorites/${offerId}`, { method: 'DELETE' })

            // Локально удаляем из favoritesData
            if (favoritesData.value) {
                favoritesData.value = favoritesData.value.filter(item => item.id !== offerId)
            }
        } else {
            $api(`offers/favorites/${offerId}`, { method: 'POST' })

            // Локально добавляем в favoritesData
            if (favoritesData.value) {
                favoritesData.value = [...favoritesData.value, offer]
            }
        }

    } catch (error) {
        console.error('Ошибка при обновлении избранного:', error)
    }
}

const isFavorite = (offerId: number | null): boolean => {
    return offerId !== null && favoriteOffers.value.has(offerId)
}

// Обработчики событий от дочерних компонентов
const handleFiltersApply = async (filtersData: Filters) => {
    console.log('Получены фильтры через событие:', filtersData)
    offset.value = 0
    refreshFavorites()

    // Полностью заменяем фильтры новыми, но сохраняем address_query
    currentFilters.value = {
        ...filtersData,
        ...('address_query' in currentFilters.value && {
            address_query: currentFilters.value.address_query
        })
    }

    console.log('Объединённые фильтры:', currentFilters.value)
    refreshOffers()
}

const handleFiltersReset = async () => {
    offset.value = 0

    // Сохраняем только address_query и property_type из текущих фильтров
    const filtersToKeep: Partial<Filters> = {}

    if (currentFilters.value.address_query) {
        filtersToKeep.address_query = currentFilters.value.address_query
    }

    // if (currentFilters.value.property_type) {
    //     filtersToKeep.property_type = currentFilters.value.property_type
    // }

    // Очищаем все остальные фильтры, сохраняя только нужные
    currentFilters.value = { ...filtersToKeep }

    refreshFavorites()
    refreshOffers()
}

const handleAddressSearch = async (query: string) => {
    if (!query.trim()) {
        clearAddressSearch()
        return
    }

    // Обновляем currentFilters, сохраняя остальные фильтры
    currentFilters.value = {
        ...currentFilters.value,
        address_query: query
    }

    offset.value = 0
    refreshOffers()
}

const clearAddressSearch = async () => {
    // Удаляем address_query из currentFilters, сохраняя остальные фильтры
    const { address_query, ...filtersWithoutAddress } = currentFilters.value
    currentFilters.value = filtersWithoutAddress
    offset.value = 0
    refreshOffers()
}

// Пагинация
const goToPage = async (page: number) => {
    if (page < 1 || page > totalPages.value) return
    offset.value = (page - 1) * limit.value
    refreshOffers()
}

const openOffer = (offer: Offer) => {
    const router = useRouter()
    router.push(`/offers/${offer.id}`)
}

// Вспомогательные функции форматирования (без изменений)
const formatPrice = (price: number | null) =>
    price ? new Intl.NumberFormat('ru-RU').format(price) + ' ₽' : 'Цена не указана'

const getPriceCategoryColor = (category: string) => {
    switch (category) {
        case 'expensive': return 'error'
        case 'normal': return 'info'
        case 'cheap': return 'success'
        default: return 'gray'
    }
}

const getPriceCategoryLabel = (category: string) => {
    switch (category) {
        case 'expensive': return 'Выше рынка'
        case 'normal': return 'Рыночная цена'
        case 'cheap': return 'Ниже рынка'
        default: return category
    }
}

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'high': return 'success'
        case 'medium': return 'warning'
        case 'low': return 'error'
        default: return 'gray'
    }
}

const getCategoryLabel = (category: string) => {
    switch (category) {
        case 'high': return 'Высокая'
        case 'medium': return 'Средняя'
        case 'low': return 'Низкая'
        default: return category
    }
}
watch(sortValue, async () => {
    offset.value = 0
    refreshOffers()
})
// Наблюдатели
watch(currentPage, (newPage) => {
    jumpPage.value = newPage
})

</script>

<style scoped>
.search .offers-page {
    min-height: 100vh;
    background-color: #f8fafc;
}

.page-layout {
    display: flex;
    margin: 0 auto;
    gap: 1.5rem;
    padding: 1.3rem;
}

/* Основной контент */
.main-content {
    flex: 1;
    min-width: 0;
}

/* Статус поиска */
/* .search-status {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
} */

.search-status.gray {
    background-color: #f3f4f6;
    color: #6b7280;
    border: 1px solid #e5e7eb;
}

.search-status.green {
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #a7f3d0;
}

.search-status.red {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
}


/* Информация о результатах */
.results-info {
    padding: 0px !important;
    background: white;
    border-radius: 4px !important;
    margin-bottom: 13px;
}

.results-info> :deep(div:first-child) {
    padding: 12px 24px !important;

}

.results-stats {
    display: flex;
    gap: 2rem;
    font-size: 0.875rem;
    align-items: center;
}

.total-count {
    color: #374151;
    font-weight: 500;
}

.filtered-count {
    color: var(--ui-primary);
    font-weight: 600;
}

/* Контейнер объявлений */
.offers-container {
    position: relative;
    min-height: 100vh;
}

.loading-indicator {
    display: flex;
    justify-content: center;
    margin-top: 300px;
}

.loading-icon {
    font-size: 4rem;
    color: #3b82f6;
    animation: spin 1.5s linear infinite;
}

.loading-indicator span {
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
}

/* Список объявлений */
.offers-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.offer-card {
    cursor: pointer;
    transition: all 0.25s ease-in-out;
    border-radius: 4px !important;
    background: white;

}

.offer-card:hover {

    background: #C1F4EB;
}

.offer-content {
    display: flex;
    height: 160px;
}

.image-container {
    width: 200px;
    flex-shrink: 0;
    position: relative;
}

.offer-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.no-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f7fafc;
    color: #a0aec0;
}

.favorite-heart {
    position: absolute;
    top: -1.3rem;
    right: -2.15rem;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
}

.favorite-heart.active {
    background: rgba(239, 68, 68, 0.1);
    color: red;
    transition: all 0.3s ease;
}

.heart-icon {
    font-size: 1.25rem;
    transition: all 0.3s ease;
}


.favorite-heart:hover {
    color: #ef4444;
    background: var(--ui-color-neutral-100)
}

.type-badge {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
}

.offer-details {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 1rem;
    padding-right: 1rem;
    padding-top: 0.5rem;
}

.category-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.sort-select {
    background: #E9F2FF;
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

/* Адаптивность для бейджей */
@media (max-width: 768px) {
    .category-badges {
        gap: 0.25rem;
    }

    .category-badge {
        font-size: 0.7rem;
        padding: 0.2rem 0.4rem;
    }
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
    border-radius: 4px;
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

/* Анимация вращения */
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Адаптивность */
@media (max-width: 1024px) {
    .page-layout {
        flex-direction: column;
    }
}

@media (max-width: 768px) {
    .page-layout {
        padding: 1rem;
    }

    .offer-content {
        height: auto;
        flex-direction: column;
    }

    .image-container {
        width: 100%;
        height: 200px;
    }

    .favorite-heart {
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 10;
        margin-bottom: 0.25rem;
    }

    .heart-icon {
        font-size: 1.5rem;
    }



    .offer-header {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
    }

    .offer-price-section {
        text-align: left;
    }

    .offer-specs {
        gap: 1rem;
    }

    .results-stats {
        flex-direction: column;
        gap: 0.5rem;

    }

    .pagination {
        flex-wrap: wrap;
    }

    .page-numbers {
        order: 3;
        width: 100%;
        justify-content: center;
        margin-top: 1rem;
    }

    .page-jump {
        flex-wrap: wrap;
        text-align: center;
    }
}

@media (max-width: 640px) {
    .offer-details {
        padding: 1rem;
    }

    .offer-specs {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}

/* Темная тема */
@media (prefers-color-scheme: dark) {
    .offers-page {
        background-color: #111827;
    }

    .results-info,
    .offer-card,
    .pagination-container {
        background: #1f2937;
        border-color: #374151;
    }

    .offer-title {
        color: #f9fafb;
    }

    .offer-address {
        color: #d1d5db;
    }

    .no-image {
        background-color: #374151;
        color: #9ca3af;
    }

    .search-status.gray {
        background-color: #374151;
        color: #d1d5db;
        border-color: #4b5563;
    }

    .favorite-heart {
        background: rgba(31, 41, 55, 0.9);
    }

    .favorite-heart:hover {
        background: #374151;
    }
}
</style>