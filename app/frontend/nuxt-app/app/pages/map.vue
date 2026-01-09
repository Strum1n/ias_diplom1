<template>

    <div class="page-layout">
        <div class="sidebar-container">
            <FiltersSidebar @filters-apply="handleFiltersApply" @filters-reset="handleFiltersReset" />
        </div>

        <main class="map-content">
            <div class="mb-3">
                <AddressAutocomplete @address-selected="handleAddressSearch" @search-triggered="handleAddressSearch" />
            </div>

            <UBadge v-if="addressForSearch" size="lg" class="mb-3 max-w-fit py-0" color="info">
                {{ addressForSearch }}
                <UButton trailing-icon="heroicons:x-mark-16-solid" class="px-0 pt-2" color="info"
                    @click="clearAddressSearch" size="md"></UButton>
            </UBadge>

            <div v-if="offersError" class="error-message">
                {{ offersError }}
            </div>

            <div class="results-info mb-3">
                <div class="flex items-end" v-if="offersPending">
                    <span>Объектов на карте:</span>
                    <UIcon name="codex:loader" size="20px" />
                </div>
                <div v-else>
                    Объектов на карте: <span class="font-semibold text-primary">{{
                        offers.length.toLocaleString('ru-RU') }}</span>
                </div>
            </div>

            <div class="map-container">

                <UIcon v-if="offersPending" name="line-md:loading-loop" size="100px" class="loading-icon" />

                <YaMap :parent-offers="offers"></YaMap>
            </div>
        </main>
    </div>

</template>

<script setup lang="ts">

interface Address {
    house_number: string | null;
    full_address: string;
    coordinates_list: number[];
}

interface Offer {
    id: number | null;
    url: string | null;
    price: number | null;
    total_area: number | null;
    land_area: number | null;
    living_area: number | null;
    rooms_count: number | null;
    floor: number | null;
    title: string | null;
    price_category: string | null;
    address: Address | null;
    image_url: string | null;
    images_urls: string[] | null;
    price_per_square_meter: number | null;
}

interface Filters {
    [key: string]: any;
}

const { $api } = useNuxtApp()



const currentFilters = ref<Filters>({})
const addressForSearch = computed(() => currentFilters.value.address_query)

// Функция для подготовки параметров запроса
const prepareRequestQuery = () => {
    const query: Record<string, any> = {
        limit: 1000000
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

    return query
}

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

const { data: offersData, pending: offersPending, error: offersError, refresh: refreshOffers } = useAsyncData(
    'offersForMap',
    () => $api('/offers/offers_for_map', {
        params: prepareRequestQuery(),
    })
)

const offers = computed(() => offersData.value || [])


const handleFiltersApply = async (filtersData: Filters) => {
    console.log('Получены фильтры через событие:', filtersData)

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
    const filtersToKeep: Partial<Filters> = {}

    if (currentFilters.value.address_query) {
        filtersToKeep.address_query = currentFilters.value.address_query
    }

    // if (currentFilters.value.property_type) {
    //     filtersToKeep.property_type = currentFilters.value.property_type
    // }

    currentFilters.value = { ...filtersToKeep }

    refreshOffers()
}

const handleAddressSearch = (query: string) => {
    if (!query.trim()) {
        clearAddressSearch()
        return
    }

    currentFilters.value = {
        ...currentFilters.value,
        address_query: query
    }

    refreshOffers()
}

const clearAddressSearch = () => {

    const { address_query, ...filtersWithoutAddress } = currentFilters.value
    currentFilters.value = filtersWithoutAddress

    refreshOffers()
}


// const loadOffersForMap = async () => {
//     console.log("Пробуем загружать офферы")
//     console.log("Текущие фильтры:", currentFilters.value)

//     console.log("Загружаем офферы для карты")
//     error.value = null
//     loading.value = true

//     try {
//         const query: Record<string, any> = {
//             limit: 1000000
//         }

//         if (currentFilters.value && Object.keys(currentFilters.value).length > 0) {
//             Object.entries(currentFilters.value).forEach(([key, value]) => {
//                 if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return

//                 if (Array.isArray(value)) {
//                     query[key] = value.filter(item => item != null && item !== '')
//                 } else if (typeof value === 'boolean') {
//                     if (value === true) {
//                         query[key] = String(value)
//                     }
//                 } else if (typeof value === 'object' && !Array.isArray(value)) {
//                     query[key] = JSON.stringify(value)
//                 } else {
//                     query[key] = String(value)
//                 }
//             })
//         }

//         console.log('Запрос офферов для карты с параметрами:', query)

//         const response = await $api<Offer[]>('/offers/offers_for_map', {
//             query
//         })

//         offers.value = response || []
//         console.log(`Загружено ${offers.value.length} офферов для карты`)

//     } catch (err: any) {
//         console.error('Ошибка загрузки предложений для карты:', err)
//         error.value = err.message || 'Ошибка загрузки предложений'
//         offers.value = []
//     } finally {
//         loading.value = false
//     }
// }



const isFullscreen = ref(false);

const toggleFullscreen = () => {
    if (isFullscreen.value) {
        document.exitFullscreen();
    } else {
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.requestFullscreen();
        }
    }
};

const handleFullscreenChange = () => {
    isFullscreen.value = !!document.fullscreenElement;
};

const mapState = useMapState()

onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);

})

onBeforeUnmount(() => {
    mapState.value.center = undefined
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
})
</script>

<style scoped>
.ymaps3x0-resize-control {
    --ymaps3x0-resize-control-color: white;
}

.loading-icon {
    position: absolute;
    z-index: 10;

}

.page-layout {
    height: 92.6vh;
    display: flex;
    gap: 1.5rem;
    padding: 1.3rem;
}

/* Основной контент с картой */
.map-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    /* обязательно */
    overflow: hidden;
}



.marker {
    position: relative;
    width: 20px;
    height: 20px;
    background: #ff0000;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.cluster {
    background: #1976d2;
    color: white;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
    position: relative;
}

.cluster-popup {
    position: absolute;
    top: 40px;
    left: -50px;
    background: white;
    padding: 12px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    width: 220px;
    max-height: 300px;
    /* Ограничиваем максимальную высоту */
    overflow-y: auto;
    /* Добавляем вертикальную прокрутку */
    z-index: 1000;
}

.cluster-close-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 22px;
    height: 22px;
    border: none;
    background: #eee;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    padding: 0;
    color: #444;
}

.cluster-close-btn:hover {
    background: #ddd;
}

.popup {
    position: absolute;
    top: calc(100% + 10px);
    background: #fff;
    border-radius: 10px;
    padding: 10px 10px 10px 28px;
    color: black;
    min-width: 150px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

/* Крестик для попапа маркера */
.popup-close {
    position: absolute;
    top: 6px;
    left: 6px;
    width: 20px;
    height: 20px;
    border: none;
    background: #eee;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    line-height: 18px;
    text-align: center;
    padding: 0;
    color: #444;
}

.popup-close:hover {
    background: #ddd;
}

.offer-list {
    max-height: 220px;
    overflow-y: auto;
    padding-right: 10px;
}

.map-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    background: white;
}

.sidebar-container {
    min-height: 0;
}

.offer-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 12px;
}

.offer-title {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 8px;
}

.offer-img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 6px;
    background: #f0f0f0;
    margin-bottom: 8px;
}

.offer-price {
    color: #1976d2;
    font-weight: 600;
    margin-bottom: 4px;
}

.offer-address {
    font-size: 12px;
    color: #666;
}

.fullscreen {
    width: 26px;
    height: 26px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26'%3E%3Cg fill='%236B6B6B'%3E%3Cpath d='M16.14 7.86L14.27 6H20v5.7l-1.83-1.82L15.04 13 13 10.98l3.13-3.13zm0 0M9.86 18.14L11.73 20H6v-5.7l1.83 1.82L10.96 13 13 15.02l-3.13 3.13zm0 0'/%3E%3C/g%3E%3C/svg%3E");
}

.exit-fullscreen {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26'%3E%3Cg fill='%236B6B6B'%3E%3Cpath d='M8.14 15.86L6.27 14H12v5.7l-1.83-1.83-3.13 3.14L5 18.98l3.13-3.13zm0 0M17.86 10.14L19.73 12H14V6.3l1.83 1.83 3.13-3.14L21 7.02l-3.13 3.13zm0 0'/%3E%3C/g%3E%3C/svg%3E");
}
</style>