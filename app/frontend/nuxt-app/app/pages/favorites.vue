<template>
    <div class="favorites-page">
        <div class="container">
            <header class="page-header">
                <h1>Избранные объявления</h1>
                <div class="stats">
                    <span class="stat">Найдено: {{ filteredOffers.length }} объявлений</span>
                </div>
            </header>

            <!-- Фильтры и сортировка -->
            <div class="filters-section">
                <div class="filter-group">
                    <label>Тип недвижимости:</label>
                    <select v-model="filters.propertyType" class="filter-select">
                        <option value="">Все типы</option>
                        <option value="Квартира">Квартира</option>
                        <option value="Коттедж">Коттедж</option>
                        <option value="Апартамент">Апартаменты</option>
                        <option value="Дом">Дом</option>
                        <option value="Таунхаус">Таунхаус</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>Сортировка:</label>
                    <select v-model="sortBy" class="filter-select">
                        <option value="price_asc">Цена по возрастанию</option>
                        <option value="price_desc">Цена по убыванию</option>
                        <option value="date_desc">Сначала новые</option>
                        <option value="date_asc">Сначала старые</option>
                    </select>
                </div>

                <button @click="clearFilters" class="clear-filters">
                    Сбросить фильтры
                </button>
            </div>

            <!-- Состояние загрузки -->
            <div v-if="pending" class="loading">
                <UIcon class="size-10" name="codex:loader" />
                <!-- <p>Загружаем избранные объявления...</p> -->
            </div>

            <!-- Состояние ошибки -->
            <div v-else-if="error" class="error">
                <h3>Ошибка при загрузке</h3>
                <p>{{ error.message }}</p>

            </div>

            <!-- Пустой список -->
            <div v-else-if="filteredOffers.length === 0" class="empty-state">
                <div class="empty-icon">❤️</div>
                <h3>В избранном пока пусто</h3>
                <p>Добавляйте объявления, которые вам понравились, чтобы не потерять</p>
            </div>

            <!-- Список объявлений -->
            <div v-else class="offers-list">
                <div v-for="offer in sortedOffers" :key="offer.id" class="offer-card">


                    <!-- Основная информация -->
                    <div class="offer-content">
                        <div class="offer-header">
                            <div class="offer-gallery aspect-[4/3] overflow-hidden ">
                                <img class="gallery-image" :src="offer.images_urls[0]">
                                <UBadge v-if="offer.is_new_house == true" color="info" variant="solid"
                                    class="type-badge">
                                    Новостройка
                                </UBadge>
                            </div>
                            <div class="flex flex-col flex-2">
                                <div class="flex flex-col w-full gap-1 pt-2.5">
                                    <div class="title-container">
                                        <div class="flex gap-2">
                                            <UBadge v-if="offer.transport_access_score"
                                                :color="getCategoryColor(offer.transport_access_category)">Траспорт
                                                {{
                                                    offer.transport_access_score?.toFixed(2)
                                                }}</UBadge>
                                            <UBadge v-if="offer.elderly_score"
                                                :color="getCategoryColor(offer.elderly_category)">Для пожилых {{
                                                    offer.elderly_score?.toFixed(2) }}
                                            </UBadge>
                                            <UBadge v-if="offer.family_score"
                                                :color="getCategoryColor(offer.family_category)">Для семьи {{
                                                    offer.family_score?.toFixed(2)
                                                }}
                                            </UBadge>
                                        </div>

                                        <span class="price">
                                            <UBadge v-if="offer.price_category"
                                                :color="getPriceCategoryColor(offer.price_category)">{{
                                                    getPriceCategoryLabel(offer.price_category) }}</UBadge>{{
                                                    formatPrice(offer.price) }} ₽
                                        </span>
                                    </div>
                                    <div class="title-container">
                                        <h3 class="offer-title">{{ offer.title }}</h3>
                                        <span class="price-per-meter">
                                            {{ formatPrice(offer.price_per_square_meter) }} ₽/м²
                                        </span>
                                    </div>
                                    <div class="address">
                                        <UIcon size="18" name="tabler:map-pin"></UIcon>
                                        {{ offer.address.full_address }}
                                    </div>
                                </div>


                                <!-- Основные характеристики -->
                                <div class="characteristics">
                                    <div class="char-item">
                                        <span class="char-label">Общая площадь:</span>
                                        <span class="char-value">{{ offer.total_area }} м²</span>
                                    </div>
                                    <div v-if="offer.living_area" class="char-item">
                                        <span class="char-label">Жилая площадь:</span>
                                        <span class="char-value">{{ offer.living_area }} м²</span>
                                    </div>
                                    <div v-if="offer.kitchen_area" class="char-item">
                                        <span class="char-label">Площадь кухни:</span>
                                        <span class="char-value">{{ offer.kitchen_area }} м²</span>
                                    </div>
                                    <div v-if="offer.floor !== null" class="char-item">
                                        <span class="char-label">Этаж:</span>
                                        <span class="char-value">{{ offer.floor }}/{{ offer.house_floors_count
                                            }}</span>
                                    </div>
                                    <div v-else="offer.floor!==null" class="char-item">
                                        <span class="char-label">Этажей в доме:</span>
                                        <span class="char-value">{{ offer.house_floors_count }}</span>
                                    </div>
                                    <div v-if="offer.rooms_count !== null && offer.rooms_count !== 0 && offer.rooms_count !== 10"
                                        class="char-item">
                                        <span class="char-label">Комнаты:</span>
                                        <span class="char-value">{{ offer.rooms_count }}</span>
                                    </div>
                                    <div v-if="offer.ceiling_height" class="char-item">
                                        <span class="char-label">Высота потолков:</span>
                                        <span class="char-value">{{ offer.ceiling_height }} м</span>
                                    </div>
                                    <div v-if="offer.house_built_year && offer.is_new_house === null" class="char-item">
                                        <span class="char-label">Год постройки:</span>
                                        <span class="char-value">{{ offer.house_built_year }}</span>
                                    </div>
                                    <div v-if="offer.house_built_year && offer.is_new_house === true" class="char-item">
                                        <span class="char-label">Год сдачи:</span>
                                        <span class="char-value">{{ offer.house_built_year }}</span>
                                    </div>
                                </div>
                                <div class="infrastructure">
                                    <h4>Ближайшая инфраструктура</h4>
                                    <div class="infrastructure-list">
                                        <div v-for="item in getClosestInfrastructure(offer)"
                                            :key="item.infrastructure.id" class="infrastructure-item">
                                            <UIcon size="20"
                                                :name="getInfrastructureIcon(item.infrastructure.infrastructure_type.id)" />
                                            <div class="infra-info">
                                                <span class="infra-type">{{
                                                    item.infrastructure.infrastructure_type.name
                                                    }}</span>
                                            </div>
                                            <span class="infra-distance">{{ item.distance }} м</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Контактная информация -->
                        <div class="contact-info">
                            <div class="flex items-center gap-1">
                                <UIcon size="16" name="solar:phone-outline"></UIcon>
                                <a :href="`tel:${offer.contact_phone}`" class="phone-number">
                                    {{ offer.contact_phone }}
                                </a>
                            </div>
                            <div class="actions">
                                <UButton color="info" trailing-icon="i-lucide-arrow-right" :to="`/offers/${offer.id}`">
                                    К объекту
                                </UButton>
                                <UButton color="error" icon="material-symbols:delete-forever"
                                    @click="removeFromFavorites(offer.id)">Удалить
                                </UButton>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Секция сравнения внизу страницы -->
            <div v-if="filteredOffers.length > 1" class="comparison-section-bottom">
                <div class="section-header">
                    <h2>Сравнение объектов</h2>
                    <p>Сравните выбранные объявления по различным критериям</p>
                </div>

                <!-- Кнопка для открытия интерфейса сравнения -->
                <div class="comparison-controls">
                    <button @click="toggleComparisonInterface" class="compare-btn">
                        {{ showComparisonInterface ? 'Скрыть сравнение' : '🎯 Сравнить все объявления' }}
                    </button>
                </div>

                <!-- Интерфейс сравнения -->
                <div v-if="showComparisonInterface" class="comparison-interface">
                    <!-- Выбор метода -->
                    <div class="method-selection">
                        <label>Метод анализа:</label>
                        <select v-model="selectedMethod" class="method-select">
                            <option value="electre">ELECTRE</option>
                            <option value="topsis">TOPSIS</option>
                        </select>
                    </div>

                    <!-- Выбор критериев -->
                    <div class="criteria-selection">
                        <h3>Выбор критериев для сравнения</h3>
                        <p class="selection-info">Доступны только критерии, присутствующие у всех объектов</p>

                        <div v-if="availableCriteria.length === 0" class="no-criteria-available">
                            <div class="no-criteria-icon">⚠️</div>
                            <h4>Нет доступных критериев для сравнения</h4>
                            <p>У выбранных объектов нет общих критериев. Попробуйте изменить фильтры или добавить
                                больше объектов в избранное.</p>
                        </div>

                        <div v-else class="criteria-grid">
                            <div v-for="criterion in availableCriteria" :key="criterion.key" class="criterion-item"
                                :class="{ 'selected': isCriterionSelected(criterion.key) }"
                                @click="toggleCriterion(criterion.key)">
                                <div class="criterion-checkbox">
                                    <input type="checkbox" :checked="isCriterionSelected(criterion.key)"
                                        @change="toggleCriterion(criterion.key)" />
                                    <span class="checkmark"></span>
                                </div>
                                <div class="criterion-info">
                                    <div class="criterion-name">{{ criterion.displayName }}</div>
                                    <div class="criterion-range">{{ formatCriterionRange(criterion) }}</div>
                                </div>
                            </div>
                        </div>

                        <div v-if="selectedCriteria.length === 0 && availableCriteria.length > 0"
                            class="no-criteria-warning">
                            ⚠️ Выберите хотя бы один критерий для анализа
                        </div>
                    </div>

                    <!-- Настройка весов выбранных критериев -->
                    <div v-if="selectedCriteria.length > 0" class="criteria-weights">
                        <h3>Настройка весов критериев</h3>

                        <div class="weights-grid">
                            <div v-for="criterion in selectedCriteriaWithWeights" :key="criterion.key"
                                class="weight-item">
                                <div class="weight-info">
                                    <span class="weight-name">{{ criterion.displayName }}</span>
                                    <span class="weight-direction">
                                        {{ criterion.direction === 'max' ? '↑ максимум' : '↓ минимум' }}
                                    </span>
                                </div>
                                <div class="weight-controls">
                                    <select :value="criterion.direction"
                                        @change="updateCriterionDirection(criterion.key, $event.target.value)"
                                        class="direction-select">
                                        <option value="max">Максимизация</option>
                                        <option value="min">Минимизация</option>
                                    </select>
                                    <input type="number" :value="criterion.weight" min="1" step="0.5"
                                        class="weight-input"
                                        @input="updateCriterionWeight(criterion.key, $event.target.value)" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Параметры алгоритма (только для ELECTRE) -->
                    <div v-if="selectedCriteria.length > 0 && selectedMethod === 'electre'" class="algorithm-params">
                        <h4>Параметры алгоритма ELECTRE:</h4>
                        <div class="params-grid">
                            <div class="param-group">
                                <label>Alpha (порог согласия):</label>
                                <input type="number" v-model.number="electreParams.alpha" min="0" max="1" step="0.05">
                            </div>
                            <div class="param-group">
                                <label>Beta (порог несогласия):</label>
                                <input type="number" v-model.number="electreParams.beta" min="0" max="1" step="0.05">
                            </div>
                            <div class="param-group">
                                <label>Шаг изменения:</label>
                                <input type="number" v-model.number="electreParams.step" min="0.01" max="0.1"
                                    step="0.01">
                            </div>
                        </div>
                    </div>

                    <!-- Кнопки действий -->
                    <div class="analysis-actions">
                        <button @click="runAnalysis" :disabled="analysisLoading || selectedCriteria.length === 0"
                            class="analyze-button">
                            <span v-if="analysisLoading">Анализ...</span>
                            <span v-else>Запустить анализ</span>
                        </button>
                        <button @click="resetWeights" class="reset-button">Сбросить настройки</button>
                    </div>

                    <!-- Результаты анализа ELECTRE -->
                    <div v-if="selectedMethod === 'electre' && electreResults" class="results-section electre-results">
                        <div class="method-header">
                            <h3>Результаты анализа ELECTRE</h3>
                            <button @click="electreResults = null" class="close-method-button"
                                title="Закрыть результаты ELECTRE">
                                ×
                            </button>
                        </div>
                        <p class="results-description">
                            Метод ELECTRE выявляет недоминируемые объекты (ядро) и показывает сравнительные
                            преимущества.
                        </p>

                        <!-- Ядро недоминируемых объектов -->
                        <div class="kernel-section" v-if="electreResults.kernel && electreResults.kernel.length > 0">
                            <h4>🎯 Ядро (недоминируемые объекты)</h4>
                            <div class="kernel-list">
                                <div v-for="kernelIndex in electreResults.kernel" :key="kernelIndex"
                                    class="kernel-item">
                                    <div class="kernel-offer">
                                        <div class="kernel-title">{{ getOfferTitleByIndex(kernelIndex) }}</div>
                                        <div class="kernel-address">{{ getOfferAddressByIndex(kernelIndex) }}</div>
                                    </div>
                                    <a :href="getOfferUrlByIndex(kernelIndex)" target="_blank" class="kernel-link">
                                        К объекту
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Детальное сравнение объектов -->
                        <div class="comparison-section">
                            <h4>📊 Сравнительный анализ</h4>
                            <div class="comparison-list">
                                <div v-for="offerId in electreResults.allIds" :key="offerId" class="comparison-card">
                                    <div class="comparison-header">
                                        <div class="comparison-info">
                                            <div class="comparison-title">{{ getOfferTitle(offerId) }}</div>
                                            <div class="comparison-address">{{ getOfferAddress(offerId) }}</div>
                                        </div>
                                        <a :href="getOfferUrl(offerId)" target="_blank" class="comparison-link">
                                            К объекту
                                        </a>
                                    </div>

                                    <div class="dominance-comparisons">
                                        <div v-for="comparison in getDominanceComparisons(offerId)"
                                            :key="comparison.otherOfferId" class="dominance-item">
                                            <div class="comparison-with">
                                                <strong>Сравнение с:</strong> {{ getOfferTitle(comparison.otherOfferId)
                                                }}
                                            </div>

                                            <div v-if="comparison.superior.length > 0" class="comparison-category">
                                                <div class="category-label superior">
                                                    ✅ Превосходит по:
                                                </div>
                                                <div class="criteria-chips">
                                                    <span v-for="criterionIndex in comparison.superior"
                                                        :key="criterionIndex" class="chip superior-chip">
                                                        {{ getCriterionShortName(selectedCriteria[criterionIndex]) }}
                                                    </span>
                                                </div>
                                            </div>

                                            <div v-if="comparison.inferior.length > 0" class="comparison-category">
                                                <div class="category-label inferior">
                                                    ❌ Уступает по:
                                                </div>
                                                <div class="criteria-chips">
                                                    <span v-for="criterionIndex in comparison.inferior"
                                                        :key="criterionIndex" class="chip inferior-chip">
                                                        {{ getCriterionShortName(selectedCriteria[criterionIndex]) }}
                                                    </span>
                                                </div>
                                            </div>

                                            <div v-if="comparison.equal.length > 0" class="comparison-category">
                                                <div class="category-label equal">
                                                    ⚖️ Равны по:
                                                </div>
                                                <div class="criteria-chips">
                                                    <span v-for="criterionIndex in comparison.equal"
                                                        :key="criterionIndex" class="chip equal-chip">
                                                        {{ getCriterionShortName(selectedCriteria[criterionIndex]) }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Результаты анализа TOPSIS -->
                    <div v-else-if="selectedMethod === 'topsis' && topsisResults" class="topsis-results">
                        <h3>Результаты сравнения методом TOPSIS</h3>

                        <div class="ranking-section">
                            <h4 class="mb-2">Ранжирование объектов</h4>
                            <div class="ranking-list">
                                <div v-for="(rank, index) in topsisRanking" :key="rank.offerId" class="rank-item"
                                    :class="getRankItemClass(index)">
                                    <div class="rank-header">
                                        <div class="rank-number" :class="getRankNumberClass(index)">
                                            {{ index + 1 }}
                                        </div>
                                        <div class="rank-info">
                                            <div class="offer-title">{{ getOfferTitle(rank.offerId) }}</div>
                                            <div class="offer-address">{{ getOfferAddress(rank.offerId) }}</div>
                                        </div>
                                        <a :href="getOfferUrl(rank.offerId)" target="_blank" class="rank-link">
                                            К объекту
                                        </a>
                                    </div>

                                    <div class="score-section">
                                        <div class="score-info">
                                            <div>
                                                <span class="score-label">Коэффициент близости: </span>
                                                <span class="score-value">{{ rank.score.toFixed(4) }}</span>
                                            </div>
                                            <div class="progress-bar">
                                                <div class="progress-fill" :style="{ width: (rank.score * 100) + '%' }"
                                                    :class="getProgressFillClass(index)"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Интерфейсы типов (остаются без изменений)
interface InfrastructureType {
    id: number;
    name: string;
}

interface Infrastructure {
    id: number;
    name: string;
    infrastructure_type: InfrastructureType;
}

interface InfrastructureLink {
    infrastructure: Infrastructure;
    distance: number;
}

interface Address {
    full_address: string;
    infrastructures_links: InfrastructureLink[];
}
interface SellerType {
    id: number
    name: string
}

interface Seller {
    name: string;
    seller_type: SellerType;
    rating?: number;
}

interface Offer {
    id: number;
    url: string;
    images_urls: string[];
    is_new_house: boolean;
    price: number;
    price_per_square_meter: number;
    total_area: number;
    living_area: number | null;
    kitchen_area: number;
    floor: number;
    house_floors_count: number;
    ceiling_height: number;
    rooms_count: number;
    description: string;
    title: string;
    house_built_year: number;
    contact_phone: string;
    address: Address;
    property_type: {
        name: string;
    };
    seller: Seller;
    transport_access_score: number;
    transport_access_category: string;
    elderly_score: number;
    elderly_category: string;
    family_score: number;
    family_category: string;
    update_date: string;
    price_category: string
}

// Интерфейсы для ELECTRE (остаются без изменений)
interface ElectreParams {
    alpha: number;
    beta: number;
    step: number;
}

interface ElectreResults {
    kernel: number[];
    dominance_info: {
        [key: string]: {
            [key: string]: {
                superior: number[];
                equal: number[];
                inferior: number[];
            };
        };
    };
    outranking: boolean[][];
    allIds: number[];
}

// Интерфейсы для TOPSIS (остаются без изменений)
interface TopsisResults {
    scores: number[];
    ranked_indices: number[];
}

interface AnalysisCriterion {
    key: string;
    displayName: string;
    weight: number;
    direction: 'min' | 'max';
    getValue: (offer: Offer) => number | null;
    minValue?: number;
    maxValue?: number;
    isAvailableForAll?: boolean;
}

// Состояние
const { $api } = useNuxtApp()

// Используем useAsyncData для загрузки данных с pending и error
const { data: favoriteOffers, pending, error, refresh: refreshFavorites } = await useAsyncData('favorites',
    () => $api('offers/favorites/')

)

// Состояние для анализа (остается без изменений)
const showComparisonInterface = ref(false);
const selectedMethod = ref('electre');
const analysisLoading = ref(false);
const availableCriteria = ref<AnalysisCriterion[]>([]);
const selectedCriteria = ref<string[]>([]);
const criteriaWeights = ref<{ [key: string]: number }>({});
const criteriaDirections = ref<{ [key: string]: 'min' | 'max' }>({});

// Фильтры и сортировка (остаются без изменений)
const filters = reactive({
    propertyType: ''
})

const sortBy = ref('date_desc')

// Параметры ELECTRE (остаются без изменений)
const electreParams = ref<ElectreParams>({
    alpha: 0.8,
    beta: 0.4,
    step: 0.05
});

const electreResults = ref<ElectreResults | null>(null);

// Состояние для TOPSIS (остается без изменений)
const topsisResults = ref<TopsisResults | null>(null);
const topsisRanking = ref<Array<{ offerId: number, score: number, rank: number }>>([]);

// Вычисляемые свойства с проверкой на undefined
const filteredOffers = computed(() => {
    if (!favoriteOffers.value) return []
    if (!filters.propertyType) {
        return favoriteOffers.value
    }
    return favoriteOffers.value.filter(offer =>
        offer.property_type.name === filters.propertyType
    )
})

const sortedOffers = computed(() => {
    if (!filteredOffers.value) return []
    const filtered = [...filteredOffers.value]

    switch (sortBy.value) {
        case 'price_asc':
            return filtered.sort((a, b) => a.price - b.price)
        case 'price_desc':
            return filtered.sort((a, b) => b.price - a.price)
        case 'date_desc':
            return filtered.sort((a, b) => new Date(b.update_date).getTime() - new Date(a.update_date).getTime())
        case 'date_asc':
            return filtered.sort((a, b) => new Date(a.update_date).getTime() - new Date(b.update_date).getTime())
        default:
            return filtered
    }
})

const selectedCriteriaWithWeights = computed(() => {
    return selectedCriteria.value.map(key => {
        const criterion = availableCriteria.value.find(c => c.key === key);
        return {
            key: key,
            displayName: criterion?.displayName || key,
            weight: criteriaWeights.value[key] || 0,
            direction: criteriaDirections.value[key] || 'max'
        };
    });
});



// Методы
const removeFromFavorites = async (offerId: number) => {
    try {

        await $api(`offers/favorites/${offerId}`, { method: 'DELETE' })
        if (favoriteOffers.value) {
            favoriteOffers.value = favoriteOffers.value.filter(offer => offer.id !== offerId)
        }
    } catch (err: any) {
        console.error('Ошибка при удалении из избранного:', err)

    }
}

const clearFilters = () => {
    filters.propertyType = ''
    sortBy.value = 'date_desc'
}

const getPriceCategoryColor = (category: string) => {
    switch (category) {
        case 'expensive': return 'error'
        case 'normal': return 'info'
        case 'cheap': return 'success'
        default: return 'neutral'
    }
}

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'high': return 'success'
        case 'medium': return 'warning'
        case 'low': return 'error'
        default: return 'neutral'
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

// Методы для инфраструктуры (остаются без изменений)
const getClosestInfrastructure = (offer: Offer) => {
    const typeMap = new Map<number, InfrastructureLink>()

    offer.address.infrastructures_links.forEach(item => {
        const typeId = item.infrastructure.infrastructure_type.id
        if (!typeMap.has(typeId) || typeMap.get(typeId)!.distance > item.distance) {
            typeMap.set(typeId, item)
        }
    })

    return Array.from(typeMap.values())
        .sort((a, b) => a.distance - b.distance)
}

const getInfrastructureIcon = (typeId: number): string => {
    const icons: { [key: number]: string } = {
        1: 'ic:baseline-school',
        2: 'material-symbols:child-hat',
        3: 'ic:sharp-local-hospital',
        4: 'maki:fitness-centre',
        5: '',
        6: 'mdi:bus-stop',
        7: 'material-symbols:metro',
        8: 'ion:restaurant-sharp',
        9: 'temaki:town-hall',
        10: 'icon-park-solid:shopping',
        11: 'icon-park-solid:shopping',
        12: 'healthicons:pharmacy-24px',
        13: '',
        14: '',
    }
    return icons[typeId] || '📍'
}

// Методы для анализа с проверкой на undefined
const toggleComparisonInterface = () => {
    showComparisonInterface.value = !showComparisonInterface.value;
    if (showComparisonInterface.value) {
        electreResults.value = null;
        topsisResults.value = null;
        topsisRanking.value = [];
        actionError.value = null;
        initializeAvailableCriteria();

        // Выбираем критерии по умолчанию только те, которые доступны у всех объектов
        const defaultCriteria = ['price', 'total_area', 'price_per_square_meter', 'transport_access_score'];
        selectedCriteria.value = defaultCriteria.filter(key =>
            availableCriteria.value.some(c => c.key === key && c.isAvailableForAll)
        );

        // Устанавливаем веса по умолчанию = 1
        selectedCriteria.value.forEach(key => {
            criteriaWeights.value[key] = 1;
            // Устанавливаем направление по умолчанию
            if (!criteriaDirections.value[key]) {
                const criterion = availableCriteria.value.find(c => c.key === key);
                criteriaDirections.value[key] = criterion?.direction || 'max';
            }
        });
    }
};

const initializeAvailableCriteria = () => {
    const currentOffers = filteredOffers.value;
    if (!currentOffers || currentOffers.length === 0) {
        availableCriteria.value = [];
        return;
    }

    // Базовые критерии
    const basicCriteria: AnalysisCriterion[] = [
        {
            key: 'price',
            displayName: 'Цена',
            weight: 1,
            direction: 'min',
            getValue: (offer: Offer) => offer.price
        },
        {
            key: 'price_per_square_meter',
            displayName: 'Цена за м²',
            weight: 1,
            direction: 'min',
            getValue: (offer: Offer) => offer.price_per_square_meter
        },
        {
            key: 'total_area',
            displayName: 'Общая площадь',
            weight: 1,
            direction: 'max',
            getValue: (offer: Offer) => offer.total_area
        },
        {
            key: 'living_area',
            displayName: 'Жилая площадь',
            weight: 1,
            direction: 'max',
            getValue: (offer: Offer) => offer.living_area
        },
        {
            key: 'kitchen_area',
            displayName: 'Площадь кухни',
            weight: 1,
            direction: 'max',
            getValue: (offer: Offer) => offer.kitchen_area
        },
        {
            key: 'rooms_count',
            displayName: 'Количество комнат',
            weight: 1,
            direction: 'max',
            getValue: (offer: Offer) => offer.rooms_count
        },
        {
            key: 'floor',
            displayName: 'Этаж',
            weight: 1,
            direction: 'max',
            getValue: (offer: Offer) => offer.floor
        },
        {
            key: 'house_built_year',
            displayName: 'Год постройки',
            weight: 1,
            direction: 'max',
            getValue: (offer: Offer) => offer.house_built_year
        },

        {
            key: 'ceiling_height',
            displayName: 'Высота потолков',
            weight: 1,
            direction: 'max',
            getValue: (offer: Offer) => offer.ceiling_height
        },
        {
            key: 'transport_access_score',
            displayName: 'Транспортная доступность',
            weight: 1,
            direction: 'max',
            getValue: (offer: Offer) => offer.transport_access_score
        },
        {
            key: 'elderly_score',
            displayName: 'Оценка для пожилых',
            weight: 1,
            direction: 'max',
            getValue: (offer: Offer) => offer.elderly_score
        },
        {
            key: 'family_score',
            displayName: 'Оценка для семьи',
            weight: 1,
            direction: 'max',
            getValue: (offer: Offer) => offer.family_score
        }
    ];

    // Инфраструктурные критерии
    const infrastructureCriteria: AnalysisCriterion[] = [];

    // Собираем все типы инфраструктуры
    const infrastructureTypes = new Map<number, string>();
    currentOffers.forEach(offer => {
        offer.address.infrastructures_links.forEach(link => {
            const typeId = link.infrastructure.infrastructure_type.id;
            const typeName = link.infrastructure.infrastructure_type.name;
            if (!infrastructureTypes.has(typeId)) {
                infrastructureTypes.set(typeId, typeName);
            }
        });
    });

    // Создаем критерии для каждого типа инфраструктуры
    infrastructureTypes.forEach((typeName, typeId) => {
        infrastructureCriteria.push({
            key: `infrastructure_${typeId}`,
            displayName: `Расстояние до ${typeName}`,
            weight: 1,
            direction: 'min',
            getValue: (offer: Offer) => {
                const closest = getClosestInfrastructureByType(offer, typeId);
                return closest ? closest.distance : null;
            }
        });
    });

    // Объединяем критерии
    const allCriteria = [...basicCriteria, ...infrastructureCriteria];

    // Проверяем доступность критериев для всех объектов
    availableCriteria.value = allCriteria.filter(criterion => {
        const hasValueForAllOffers = currentOffers.every(offer => {
            const value = criterion.getValue(offer);
            return value !== null && value !== undefined && value !== 0;
        });

        // Вычисляем диапазон значений только для доступных критериев
        if (hasValueForAllOffers) {
            const values = currentOffers.map(offer => {
                const value = criterion.getValue(offer);
                return value !== null && value !== undefined ? value : 0;
            }).filter(val => val !== null && val !== undefined);

            if (values.length > 0) {
                criterion.minValue = Math.min(...values);
                criterion.maxValue = Math.max(...values);
            }
        }

        criterion.isAvailableForAll = hasValueForAllOffers;
        return hasValueForAllOffers;
    });
};

const getClosestInfrastructureByType = (offer: Offer, typeId: number) => {
    const infrastructuresOfType = offer.address.infrastructures_links.filter(
        link => link.infrastructure.infrastructure_type.id === typeId
    );

    if (infrastructuresOfType.length === 0) {
        return null;
    }

    return infrastructuresOfType.reduce((closest, current) =>
        current.distance < closest.distance ? current : closest
    );
};

const isCriterionSelected = (key: string) => {
    return selectedCriteria.value.includes(key);
};

const toggleCriterion = (key: string) => {
    const index = selectedCriteria.value.indexOf(key);

    if (index > -1) {
        selectedCriteria.value.splice(index, 1);
    } else {
        selectedCriteria.value.push(key);
        // Устанавливаем вес = 1 ТОЛЬКО для нового критерия, если его еще нет
        if (criteriaWeights.value[key] === undefined) {
            criteriaWeights.value[key] = 1;
        }
        // Устанавливаем направление по умолчанию для нового критерия, если его еще нет
        if (!criteriaDirections.value[key]) {
            const criterion = availableCriteria.value.find(c => c.key === key);
            criteriaDirections.value[key] = criterion?.direction || 'max';
        }
    }
};

const formatCriterionRange = (criterion: AnalysisCriterion) => {
    if (criterion.minValue === undefined || criterion.maxValue === undefined) {
        return 'Нет данных';
    }

    const formatValue = (value: number) => {
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}к`;
        }
        return value.toFixed(0);
    };

    return `${formatValue(criterion.minValue)} - ${formatValue(criterion.maxValue)}`;
};

const updateCriterionWeight = (key: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 1) { // минимальное значение 1, максимальное не ограничено
        criteriaWeights.value[key] = numValue;
    }
};

const updateCriterionDirection = (key: string, direction: 'min' | 'max') => {
    criteriaDirections.value[key] = direction;
};

const resetWeights = () => {
    selectedCriteria.value = [];
    criteriaWeights.value = {};
    criteriaDirections.value = {};

    // После сброса заново устанавливаем критерии по умолчанию
    const defaultCriteria = ['price', 'total_area', 'price_per_square_meter', 'transport_access_score'];
    selectedCriteria.value = defaultCriteria.filter(key =>
        availableCriteria.value.some(c => c.key === key && c.isAvailableForAll)
    );

    // Устанавливаем веса по умолчанию = 1
    selectedCriteria.value.forEach(key => {
        criteriaWeights.value[key] = 1;
        const criterion = availableCriteria.value.find(c => c.key === key);
        criteriaDirections.value[key] = criterion?.direction || 'max';
    });
};

const runAnalysis = async () => {
    actionError.value = null;
    if (selectedMethod.value === 'electre') {
        await runElectreAnalysis();
    } else if (selectedMethod.value === 'topsis') {
        await runTopsisAnalysis();
    }
};

const runElectreAnalysis = async () => {
    analysisLoading.value = true;
    actionError.value = null;

    try {
        const selectedOffersData = filteredOffers.value;
        if (!selectedOffersData || selectedOffersData.length === 0) {
            actionError.value = 'Нет данных для анализа';
            return;
        }

        // Подготавливаем данные для ELECTRE
        const evaluations = selectedOffersData.map(offer =>
            selectedCriteria.value.map(key => {
                const criterion = availableCriteria.value.find(c => c.key === key);
                const value = criterion ? criterion.getValue(offer) : 0;
                return value !== null && value !== undefined ? value : 0;
            })
        );

        const weights = selectedCriteria.value.map(key => criteriaWeights.value[key] || 0);
        const isMin = selectedCriteria.value.map(key => criteriaDirections.value[key] === 'min');

        // Заменяем authorizedFetch на $api
        const response = await $api('analysis/electre', {
            method: 'GET',
            params: {
                evaluations: JSON.stringify(evaluations),
                weights: JSON.stringify(weights),
                is_min: JSON.stringify(isMin),
                alpha_init: electreParams.value.alpha,
                beta_init: electreParams.value.beta,
                step: electreParams.value.step
            }
        });

        if (response) {
            // Сохраняем индексы как есть (не преобразуем в ID)
            electreResults.value = {
                ...response,
                // kernel содержит индексы, а не ID
                allIds: selectedOffersData.map(offer => offer.id)
            };
        }
    } catch (err: any) {
        console.error('Ошибка при анализе ELECTRE:', err);
        actionError.value = err.message || 'Ошибка при выполнении анализа ELECTRE';
    } finally {
        analysisLoading.value = false;
    }
};

const runTopsisAnalysis = async () => {
    analysisLoading.value = true;
    actionError.value = null;

    try {
        const selectedOffersData = filteredOffers.value;
        if (!selectedOffersData || selectedOffersData.length === 0) {
            actionError.value = 'Нет данных для анализа';
            return;
        }

        // Подготавливаем данные для TOPSIS
        const evaluations = selectedOffersData.map(offer =>
            selectedCriteria.value.map(key => {
                const criterion = availableCriteria.value.find(c => c.key === key);
                const value = criterion ? criterion.getValue(offer) : 0;
                return value !== null && value !== undefined ? value : 0;
            })
        );

        const weights = selectedCriteria.value.map(key => criteriaWeights.value[key] || 0);

        // Переименовываем переменную, чтобы избежать конфликта имен
        const criteriaDirectionsArray = selectedCriteria.value.map(key =>
            criteriaDirections.value[key] === 'max'
        );

        // Заменяем authorizedFetch на $api
        const response = await $api('analysis/topsis', {
            method: 'GET',
            params: {
                X: JSON.stringify(evaluations),
                weights: JSON.stringify(weights),
                criteria: JSON.stringify(criteriaDirectionsArray)
            }
        });

        if (response) {
            topsisResults.value = response;

            // Создаем копию массива и переворачиваем порядок для отображения
            // от 1-го места к последнему
            const rankedIndices = [...response.ranked_indices];

            const rankedOfferIds = [...response.ranked_indices].map((index: number) =>
                selectedOffersData[index].id
            );

            // Создаем структуру для отображения
            topsisRanking.value = rankedOfferIds.map((offerId: number, index: number) => ({
                offerId,
                score: response.scores[rankedIndices[index]],
                rank: index + 1
            }));
        }
    } catch (err: any) {
        console.error('Ошибка при анализе TOPSIS:', err);
        actionError.value = err.message || 'Ошибка при выполнении анализа TOPSIS';
    } finally {
        analysisLoading.value = false;
    }
};

// Методы для отображения результатов ELECTRE (остаются без изменений)
const getDominanceComparisons = (offerId: number) => {
    if (!electreResults.value || !favoriteOffers.value) return [];

    const comparisons = [];
    const offerIndex = electreResults.value.allIds.indexOf(offerId);

    if (offerIndex === -1) return [];

    const dominanceInfo = electreResults.value.dominance_info[offerIndex.toString()];

    if (!dominanceInfo) return [];

    for (const [otherIndexStr, comparison] of Object.entries(dominanceInfo)) {
        const otherIndex = parseInt(otherIndexStr);
        const otherOfferId = electreResults.value.allIds[otherIndex];

        if (otherOfferId !== undefined && otherOfferId !== offerId) {
            comparisons.push({
                otherOfferId,
                superior: comparison.superior || [],
                inferior: comparison.inferior || [],
                equal: comparison.equal || []
            });
        }
    }

    return comparisons;
};

const getCriterionShortName = (criterionKey: string) => {
    const criterion = availableCriteria.value.find(c => c.key === criterionKey);
    if (!criterion) return criterionKey;

    // Создаем mapping для коротких имен
    const shortNames: { [key: string]: string } = {
        'price': 'Цена',
        'price_per_square_meter': 'Цена за м²',
        'total_area': 'Общая площадь',
        'living_area': 'Жилая площадь',
        'kitchen_area': 'Площадь кухни',
        'rooms_count': 'Комнаты',
        'floor': 'Этаж',
        'house_floors_count': 'Этажей дома',
        'ceiling_height': 'Высота потолков',
        'transport_access_score': 'Транспорт',
        'elderly_score': 'Для пожилых',
        'family_score': 'Для семьи'
    };

    // Для инфраструктурных критериев
    if (criterionKey.startsWith('infrastructure_')) {
        const typeName = criterion.displayName.replace('Расстояние до ', '');
        return typeName.length > 15 ? typeName.substring(0, 15) + '...' : typeName;
    }

    return shortNames[criterionKey] || criterion.displayName;
};

const getOfferTitleByIndex = (index: number) => {
    if (!electreResults.value || !electreResults.value.allIds || !favoriteOffers.value) return `Объявление ${index}`;
    const offerId = electreResults.value.allIds[index];
    const offer = favoriteOffers.value.find(o => o.id === offerId);
    return offer ? `${offer.title} - ${formatPrice(offer.price)} ₽` : `Объявление ${index}`;
};

const getOfferAddressByIndex = (index: number) => {
    if (!electreResults.value || !electreResults.value.allIds || !favoriteOffers.value) return 'Адрес не указан';
    const offerId = electreResults.value.allIds[index];
    const offer = favoriteOffers.value.find(o => o.id === offerId);
    return offer ? offer.address.full_address : 'Адрес не указан';
};

const getOfferUrlByIndex = (index: number) => {
    if (!electreResults.value || !electreResults.value.allIds || !favoriteOffers.value) return '#';
    const offerId = electreResults.value.allIds[index];
    const offer = favoriteOffers.value.find(o => o.id === offerId);
    return offer ? offer.url : '#';
};

// Методы для TOPSIS с проверкой на undefined
const getOfferTitle = (offerId: number) => {
    if (!favoriteOffers.value) return `Объявление ${offerId}`;
    const offer = favoriteOffers.value.find(o => o.id === offerId);
    return offer ? `${offer.title} - ${formatPrice(offer.price)} ₽` : `Объявление ${offerId}`;
};

const getOfferAddress = (offerId: number) => {
    if (!favoriteOffers.value) return 'Адрес не указан';
    const offer = favoriteOffers.value.find(o => o.id === offerId);
    return offer ? offer.address.full_address : 'Адрес не указан';
};

const getOfferUrl = (offerId: number) => {
    if (!favoriteOffers.value) return '#';
    const offer = favoriteOffers.value.find(o => o.id === offerId);
    return offer ? offer.url : '#';
};

const getRankItemClass = (index: number) => {
    if (index === 0) return 'rank-item-first';
    if (index === 1) return 'rank-item-second';
    if (index === 2) return 'rank-item-third';
    return '';
};

const getRankNumberClass = (index: number) => {
    if (index === 0) return 'rank-number-first';
    if (index === 1) return 'rank-number-second';
    if (index === 2) return 'rank-number-third';
    return '';
};

const getProgressFillClass = (index: number) => {
    if (index === 0) return 'progress-fill-first';
    if (index === 1) return 'progress-fill-second';
    if (index === 2) return 'progress-fill-third';
    return '';
};

// Вспомогательные методы (остаются без изменений)
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price)
}

</script>

<style scoped>
:deep(a) {
    cursor: pointer;
    border-radius: 0px !important;
}

:deep([type="button"]),
[type="number"] {
    cursor: pointer;
    border-radius: 0px !important;

}

.no-criteria-available {
    text-align: center;
    padding: 40px 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 2px dashed #dee2e6;
}

.no-criteria-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.no-criteria-available h4 {
    color: #6c757d;
    margin-bottom: 8px;
}

.no-criteria-available p {
    color: #6c757d;
    margin: 0;
}

.criterion-availability {
    font-size: 12px;
    color: #28a745;
    margin-top: 4px;
    font-weight: 500;
}




.favorites-page {
    min-height: 100vh;

    padding: 20px 0;
}

.container {
    max-width: 87rem;
    margin: 0 auto;
    padding: 0 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--ui-border-muted);
}

.page-header h1 {
    margin: 0;
    color: #333;
    font-size: 32px;
    font-weight: bold;
}

.stats {
    color: #666;
    font-size: 16px;
}

.filters-section {
    display: flex;
    gap: 16px;
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    border: 1px solid var(--ui-border-muted);
    align-items: center;
    flex-wrap: wrap;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.filter-group label {
    font-size: 14px;
    white-space: nowrap;
    font-weight: 600;
}

.filter-select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    min-width: 150px;
}

.clear-filters {
    padding: 8px 16px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-left: auto;
}

.clear-filters:hover {
    background: #5a6268;
}

.loading,
.error,
.empty-state {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #2c5aa0;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.error h3 {
    color: #dc3545;
    margin-bottom: 10px;
}

.retry-btn {
    padding: 10px 20px;
    background: #2c5aa0;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 15px;
}

.retry-btn:hover {
    background: #1e3d6f;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
}

.empty-state h3 {
    color: #333;
    margin-bottom: 10px;
}

.empty-state p {
    color: #666;
    margin: 0;
}

.offers-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.offer-card {
    display: flex;
    background: white;

    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    padding: 20px;
    border: 1px solid var(--ui-border-muted);
}

.offer-gallery {
    max-width: 400px;
    position: relative;

}

.offer-gallery :deep(button:first-of-type) {
    margin-left: 10px !important;
    opacity: 0.7;
}

.offer-gallery :deep(button) {
    margin-right: 10px !important;
    opacity: 0.7;
}

.gallery-image {
    object-fit: cover;
    width: 100%;
    height: 100%;
}

.main-image {
    width: 100%;
    height: 250px;
    object-fit: cover;
    cursor: zoom-in;
}

.image-thumbnails {
    display: flex;
    padding: 8px;
    gap: 8px;
    overflow-x: auto;
}

.thumbnail {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
    cursor: pointer;
    border: 2px solid transparent;
}

.thumbnail.active {
    border-color: #007bff;
}

.more-images {
    width: 50px;
    height: 50px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 12px;
}

.offer-content {
    padding: 20px;
    padding-top: 10px;
    width: 100%;
}

.offer-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: stretch;
    gap: 20px;
}

.offer-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    flex: 1;
    margin-right: 16px;
    line-height: 1.3;
}

.price-section {
    text-align: right;
    flex-shrink: 0;
}

.price {
    font-size: 20px;
    font-weight: 700;
    color: #2c5aa0;
    display: block;
    display: flex;
    align-items: center;
    gap: 12px;
}

.price-per-meter {
    font-size: 13px;
    color: #38a169;
    padding-bottom: 3px;
    font-weight: 550;
}

.address {
    display: flex;
    align-items: center;
    gap: 0.355rem;
    color: #666;
    margin-bottom: 16px;
    font-size: 14px;
    margin-top: 10px;
}

.characteristics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    column-gap: 24px;
    row-gap: 12px;
    margin-bottom: 16px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
}

.char-item {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
}

.char-label {
    color: #666;
}

.char-value {
    font-weight: 600;
    color: #333;
}

.scores {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
}

.score-item {
    flex: 1;
    padding: 8px;
    border-radius: 6px;
    text-align: center;
    font-size: 12px;
}

.score-low {
    background: #ffebee;
    color: #c62828;
}

.score-medium {
    background: #fff3e0;
    color: #ef6c00;
}

.score-high {
    background: #e8f5e8;
    color: #2e7d32;
}

.score-normal {
    background: #f5f5f5;
    color: #666;
}

.score-label {
    display: block;
    font-weight: 600;
    margin-bottom: 4px;
}

.score-value {
    font-weight: 700;
}

.infrastructure {
    margin-bottom: 16px;
}

.infrastructure h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #333;
    font-weight: 600;
}

.infrastructure-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(168px, 1fr));
    gap: 8px;
}

.infrastructure-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 6px;
}

.infra-icon {
    font-size: 16px;
    width: 24px;
    text-align: center;
}

.infra-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.infra-name {
    font-weight: 600;
    font-size: 14px;
    color: #333;
}

.infra-type {
    font-size: 12px;
    color: #666;
}

.infra-distance {
    font-size: 12px;
    font-weight: 600;
    color: #2c5aa0;
    white-space: nowrap;
}

.seller-info {
    margin-bottom: 16px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
}

.seller-info h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
}

.seller-details {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.seller-item {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    gap: 10px;
}

.seller-label {
    color: #666;
}

.seller-value {
    font-weight: 600;
    font-size: 14px;
    color: #333;
}

.show-more-btn {
    background: none;
    border: none;
    color: #2c5aa0;
    font-size: 12px;
    cursor: pointer;
    padding: 4px 0;
    margin-top: 4px;
}

.show-more-btn:hover {
    text-decoration: underline;
}

.contact-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
}

.phone-number {
    color: #2c5aa0;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
}

.phone-number:hover {
    text-decoration: underline;
}

.actions {
    display: flex;
    gap: 16px;
}

.btn-primary,
.btn-secondary {
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s;
    white-space: nowrap;
}

.btn-primary {
    background: #2c5aa0;
    color: white;
}

.btn-primary:hover {
    background: #1e3d6f;
}

.btn-secondary {
    background: #f5f5f5;
    color: #666;
    border: 1px solid #ddd;
}

.btn-secondary:hover {
    background: #e0e0e0;
}

/* Стили для секции сравнения внизу страницы */
.comparison-section-bottom {
    margin-top: 40px;
    padding: 30px 0;
    border-top: 2px solid #e0e0e0;
}

.section-header {
    margin-bottom: 24px;
    text-align: center;
}

.section-header h2 {
    color: #333;
    margin-bottom: 8px;
    font-size: 28px;
}

.section-header p {
    color: #666;
    font-size: 16px;
    margin: 0;
}

.comparison-controls {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
}

.compare-btn {
    padding: 14px 28px;
    background: #2c5aa0;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-weight: 600;
}

.compare-btn:hover {
    background: #1e3d6f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(44, 90, 160, 0.3);
}

.comparison-interface {
    background: white;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
}

.method-selection {
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 6px;
}

.method-selection label {
    font-weight: 600;
    margin-right: 12px;
}

.method-select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.criteria-selection {
    margin-bottom: 24px;
}

.selection-info {
    color: #666;
    font-size: 14px;
    margin-bottom: 16px;
}

.criteria-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
    max-height: 400px;
    overflow-y: auto;
    padding: 8px;
}

.criterion-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    background: white;
}

.criterion-item:hover {
    border-color: #2c5aa0;
    background: #f8f9fa;
}

.criterion-item.selected {
    border-color: #2c5aa0;
    background: #f0f8ff;
}

.criterion-checkbox {
    position: relative;
    margin-right: 12px;
}

.criterion-checkbox input {
    opacity: 0;
    position: absolute;
}

.checkmark {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid #ddd;
    border-radius: 4px;
    background: white;
    position: relative;
}

.criterion-item.selected .checkmark {
    background: #2c5aa0;
    border-color: #2c5aa0;
}

.criterion-item.selected .checkmark::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 14px;
    font-weight: bold;
}

.criterion-info {
    flex: 1;
}

.criterion-name {
    font-weight: 600;
    margin-bottom: 4px;
    color: #333;
}

.criterion-range {
    font-size: 12px;
    color: #666;
}

.no-criteria-warning {
    padding: 12px;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    color: #856404;
    text-align: center;
}

.criteria-weights {
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 6px;
}

.weights-summary {
    margin-bottom: 16px;
    padding: 8px 12px;
    background: white;
    border-radius: 4px;
    font-weight: 600;
}

.weight-warning {
    color: #dc3545;
    font-size: 14px;
    font-weight: normal;
}

.weights-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.weight-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: white;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
}

.weight-info {
    flex: 1;
}

.weight-name {
    font-weight: 600;
    display: block;
    margin-bottom: 4px;
}

.weight-direction {
    font-size: 12px;
    color: #666;
}

.weight-controls {
    display: flex;
    gap: 12px;
    align-items: center;
}

.direction-select {
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
}

.weight-input {
    width: 80px;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    text-align: center;
}

.algorithm-params {
    margin: 20px 0;
    padding: 16px;
    background: #f0f8ff;
    border-radius: 6px;
}

.params-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-top: 12px;
}

.param-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.param-group label {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.param-group input {
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.analysis-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e0e0e0;
}

.analyze-button {
    padding: 12px 24px;
    background: #2c5aa0;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
    min-width: 160px;
}

.analyze-button:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.analyze-button:hover:not(:disabled) {
    background: #1e3d6f;
}

.reset-button {
    padding: 12px 24px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    cursor: pointer;
}

.reset-button:hover {
    background: #5a6268;
}

/* Новые стили для результатов ELECTRE */
.results-section {
    margin-top: 24px;
    border-top: 2px solid #e0e0e0;
    padding-top: 24px;
}

.method-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e0e0e0;
}

.method-header h3 {
    margin: 0;
    color: #2c5aa0;
    font-size: 20px;
}

.title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.close-method-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 4px 8px;
    border-radius: 4px;
}

.close-method-button:hover {
    background: #f0f0f0;
    color: #333;
}

.results-description {
    color: #666;
    margin-bottom: 20px;
    font-style: italic;
}

.kernel-section {
    margin-bottom: 24px;
    padding: 16px;
    background: #e8f5e8;
    border-radius: 8px;
    border-left: 4px solid #2e7d32;
}

.kernel-section h4 {
    margin: 0 0 12px 0;
    color: #2e7d32;
    font-size: 16px;
}

.kernel-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.kernel-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: white;
    border-radius: 6px;
    border: 1px solid #c8e6c9;
}

.kernel-offer {
    flex: 1;
}

.type-badge {
    position: absolute;
    top: 0.8rem;
    left: 0.8rem;
}

.kernel-title {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
}

.kernel-address {
    font-size: 14px;
    color: #666;
}

.kernel-link {
    padding: 6px 12px;
    background: #2c5aa0;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-size: 14px;
    white-space: nowrap;
    margin-left: 12px;
}

.kernel-link:hover {
    background: #1e3d6f;
}

.comparison-section {
    margin-top: 24px;
}

.comparison-section h4 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 16px;
}

.comparison-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.comparison-card {
    padding: 16px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comparison-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
}

.comparison-info {
    flex: 1;
}

.comparison-title {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
}

.comparison-address {
    font-size: 14px;
    color: #666;
}

.comparison-link {
    padding: 6px 12px;
    background: #2c5aa0;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-size: 14px;
    white-space: nowrap;
    margin-left: 12px;
}

.comparison-link:hover {
    background: #1e3d6f;
}

.dominance-comparisons {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.dominance-item {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
    border-left: 3px solid #2c5aa0;
}

.comparison-with {
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
}

.comparison-category {
    margin-bottom: 8px;
}

.comparison-category:last-child {
    margin-bottom: 0;
}

.category-label {
    font-weight: 600;
    margin-bottom: 6px;
    font-size: 14px;
}

.category-label.superior {
    color: #2e7d32;
}

.category-label.inferior {
    color: #c62828;
}

.category-label.equal {
    color: #ef6c00;
}

.criteria-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.chip {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.superior-chip {
    background: #e8f5e8;
    color: #2e7d32;
    border: 1px solid #c8e6c9;
}

.inferior-chip {
    background: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
}

.equal-chip {
    background: #fff3e0;
    color: #ef6c00;
    border: 1px solid #ffe0b2;
}

/* Стили для результатов TOPSIS */
.topsis-results {
    margin-top: 24px;
    border-top: 2px solid #e0e0e0;
    padding-top: 24px;
}

.ranking-section {
    margin-bottom: 24px;
}

.ranking-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
}

.rank-item {
    padding: 16px;
    background: white;
    border-radius: 8px;
    border: 2px solid #e0e0e0;
    transition: all 0.3s ease;
}

.rank-item-first {
    border-color: #ffd700;
    background: #fff9e6;
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
    transform: scale(1.02);
}

.rank-item-second {
    border-color: #c0c0c0;
    background: #f8f8f8;
    box-shadow: 0 2px 8px rgba(192, 192, 192, 0.3);
}

.rank-item-third {
    border-color: #cd7f32;
    background: #fef4e8;
    box-shadow: 0 2px 6px rgba(205, 127, 50, 0.3);
}

.rank-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
}

.rank-number {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #6c757d;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
    flex-shrink: 0;
}

.rank-number-first {
    background: #ffd700;
    color: #333;
}

.rank-number-second {
    background: #c0c0c0;
}

.rank-number-third {
    background: #cd7f32;
}

.rank-info {
    flex: 1;
}

.offer-title {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
}

.offer-address {
    font-size: 14px;
    color: #666;
}

.rank-link {
    padding: 8px 16px;
    background: #2c5aa0;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
    white-space: nowrap;
}

.rank-link:hover {
    background: #1e3d6f;
}

.score-section {
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
}

.score-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.score-label {
    font-size: 14px;
    color: #666;
}

.score-value {
    font-weight: 600;
    color: #333;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: #2c5aa0;
    border-radius: 4px;
    transition: width 0.5s ease;
}

.progress-fill-first {
    background: linear-gradient(90deg, #ffd700, #ffed4a);
}

.progress-fill-second {
    background: linear-gradient(90deg, #c0c0c0, #e0e0e0);
}

.progress-fill-third {
    background: linear-gradient(90deg, #cd7f32, #e6a65d);
}

/* Адаптивность */
@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .filters-section {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-group {
        justify-content: space-between;
    }

    .clear-filters {
        margin-left: 0;
        margin-top: 10px;
    }

    .offers-list {
        grid-template-columns: 1fr;

    }

    .offer-header {
        flex-direction: column;
    }

    .price-section {
        text-align: left;
        margin-top: 8px;
    }

    .characteristics {
        grid-template-columns: 1fr;
    }

    .scores {
        flex-direction: column;
    }

    .contact-info {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }

    .actions {
        justify-content: space-between;
    }

    .btn-primary,
    .btn-secondary {
        flex: 1;
    }

    .comparison-interface {
        padding: 16px;
    }

    .criteria-grid {
        grid-template-columns: 1fr;
    }

    .weight-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .weight-controls {
        width: 100%;
        justify-content: space-between;
    }

    .analysis-actions {
        flex-direction: column;
    }

    .analyze-button,
    .reset-button {
        width: 100%;
    }

    .params-grid {
        grid-template-columns: 1fr;
    }

    .comparison-header {
        flex-direction: column;
        gap: 12px;
    }

    .comparison-link {
        margin-left: 0;
        align-self: flex-start;
    }

    .kernel-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .kernel-link {
        margin-left: 0;
        align-self: stretch;
        text-align: center;
    }

    .rank-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .rank-link {
        align-self: stretch;
        text-align: center;
    }

    .rank-item-first,
    .rank-item-second,
    .rank-item-third {
        transform: none;
    }

    .comparison-section-bottom {
        padding: 20px 0;
    }

    .section-header h2 {
        font-size: 24px;
    }
}

@media (max-width: 480px) {
    .characteristics {
        grid-template-columns: 1fr;
    }

    .comparison-interface {
        padding: 12px;
    }

    .compare-btn {
        width: 100%;
        padding: 12px 20px;
    }
}
</style>