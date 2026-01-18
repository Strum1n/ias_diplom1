<template>
  <div class="dashboard">
    <h1>Аналитика рынка</h1>

    <!-- Панель фильтров -->
    <div class="rounded-lg ring ring-default filters-panel">
      <div class="filter-group">
        <label for="group-by">Уровень группировки:</label>
        <select id="group-by" v-model="filters.groupBy">
          <option value="region">Регион</option>
          <option value="settlement">Населенный пункт</option>
          <option value="district">Район</option>
          <option value="microdistrict">Микрорайон</option>
          <option value="street">Улица</option>
        </select>
      </div>

      <!-- Динамические поля для ввода названий с автокомплитом -->
      <div class="filter-group" v-if="shouldShowRegionInput">
        <label for="region">Название области:</label>
        <input
          id="region"
          type="text"
          v-model="filters.regionName"
          @input="onAutocompleteInput('region')"
          @focus="onAutocompleteFocus('region')"
          placeholder="Например: Москва" />
        <div v-if="showAutocomplete.region" class="autocomplete-dropdown">
          <div v-for="result in autocompleteResults.region" :key="result" class="autocomplete-item" @click="selectAutocomplete('region', result)">
            {{ result }}
          </div>
        </div>
      </div>

      <div class="filter-group" v-if="shouldShowSettlementInput">
        <label for="settlement">Название населенного пункта:</label>
        <input
          id="settlement"
          type="text"
          v-model="filters.settlementName"
          @input="onAutocompleteInput('settlement', $event)"
          @focus="onAutocompleteFocus('settlement')"
          placeholder="Например: Железнодорожный" />
        <div v-if="autocompleteResults.settlement.length > 0 && showAutocomplete.settlement" class="autocomplete-dropdown">
          <div v-for="result in autocompleteResults.settlement" :key="result" class="autocomplete-item" @click="selectAutocomplete('settlement', result)">
            {{ result }}
          </div>
        </div>
      </div>

      <div class="filter-group" v-if="shouldShowDistrictInput">
        <label for="district">Название района:</label>
        <input
          id="district"
          type="text"
          v-model="filters.districtName"
          @input="onAutocompleteInput('district', $event)"
          @focus="onAutocompleteFocus('district')"
          placeholder="Например: Центральный" />
        <div v-if="autocompleteResults.district.length > 0 && showAutocomplete.district" class="autocomplete-dropdown">
          <div v-for="result in autocompleteResults.district" :key="result" class="autocomplete-item" @click="selectAutocomplete('district', result)">
            {{ result }}
          </div>
        </div>
      </div>

      <div class="filter-group" v-if="shouldShowMicrodistrictInput">
        <label for="microdistrict">Название микрорайона:</label>
        <input
          id="microdistrict"
          type="text"
          v-model="filters.microdistrictName"
          @input="onAutocompleteInput('microdistrict', $event)"
          @focus="onAutocompleteFocus('microdistrict')"
          placeholder="Например: Серебрянка" />
        <div v-if="autocompleteResults.microdistrict.length > 0 && showAutocomplete.microdistrict" class="autocomplete-dropdown">
          <div v-for="result in autocompleteResults.microdistrict" :key="result" class="autocomplete-item" @click="selectAutocomplete('microdistrict', result)">
            {{ result }}
          </div>
        </div>
      </div>

      <div v-if="filters.groupBy !== 'region'" class="filter-group">
        <label>Типы населенных пунктов:</label>
        <UCheckboxGroup v-model="filters.settlementTypes" :items="settlementTypeOptions" />
      </div>

      <!-- <div class="filter-group">
                <label for="min-offers">Мин. объявлений:</label>
                <input id="min-offers" type="number" v-model.number="filters.minOffersCount" min="0"
                    placeholder="100" />
            </div>

           <div class="filter-group">
                <label for="max-offers">Макс. объявлений:</label>
                <input id="max-offers" type="number" v-model.number="filters.maxOffersCount" min="0"
                    placeholder="1000" />
            </div> -->

      <!-- Кнопка добавления к сравнению -->
      <div class="filter-group">
        <button @click="addToComparison" class="comparison-btn">📊 Добавить к сравнению</button>
      </div>

      <!-- Кнопка применения фильтров -->
      <div class="filter-group">
        <button @click="applyFilters" class="apply-btn">Применить фильтры</button>
      </div>

      <!-- Кнопка сброса фильтров -->
      <div class="filter-group">
        <button @click="resetFilters" class="reset-btn">Сбросить фильтры</button>
      </div>
    </div>

    <!-- Основная аналитика -->
    <AnalyticsDashboard :filters="filters" :key="dashboardKey" :title="mainAnalyticsTitle" />

    <!-- Панель сравнения -->
    <div v-if="comparisonItems.length > 0" class="comparison-section">
      <h2 class="text-2xl font-bold mb-6">Сравнение аналитики</h2>
      <div class="comparison-list">
        <div v-for="(item, index) in comparisonItems" :key="item.id" class="comparison-item">
          <div class="comparison-header">
            <button @click="removeFromComparison(item.id)" class="remove-btn">✕</button>
          </div>
          <AnalyticsDashboard :filters="item.filters" :key="item.id" :title="item.title" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CheckboxGroupItem } from "@nuxt/ui";
import { computed, onMounted, ref } from "vue";

// Интерфейсы для фильтров
interface FilterState {
  groupBy: string;
  regionName: string;
  settlementName: string;
  districtName: string;
  microdistrictName: string;
  streetName: string;
  settlementTypes: string[];
  minOffersCount: number;
  maxOffersCount: number | null;
}

interface ComparisonItem {
  id: string;
  title: string;
  filters: FilterState;
  data?: any;
}

interface AutocompleteState {
  region: string[];
  settlement: string[];
  district: string[];
  microdistrict: string[];
  street: string[];
}

interface ShowAutocompleteState {
  region: boolean;
  settlement: boolean;
  district: boolean;
  microdistrict: boolean;
  street: boolean;
}
const settlementTypeOptions = ref<CheckboxGroupItem[]>([
  { value: "город", label: "Город" },
  { value: "поселок", label: "Поселок" },
  { value: "деревня", label: "Деревня" },
]);
// Реактивные данные для фильтров
const filters = ref<FilterState>({
  groupBy: "region",
  regionName: "",
  settlementName: "",
  districtName: "",
  microdistrictName: "",
  streetName: "",
  settlementTypes: [],
  minOffersCount: null,
  maxOffersCount: null,
});

const comparisonItems = ref<ComparisonItem[]>([]);
let comparisonCounter = 1;
const mainAnalyticsTitle = ref("Основная аналитика");
const dashboardKey = ref(0);

// Данные для автокомплита
const autocompleteResults = ref<AutocompleteState>({
  region: [],
  settlement: [],
  district: [],
  microdistrict: [],
  street: [],
});

const showAutocomplete = computed<ShowAutocompleteState>(() => ({
  region: autocompleteResults.value.region.length > 0,
  settlement: autocompleteResults.value.settlement.length > 0,
  district: autocompleteResults.value.district.length > 0,
  microdistrict: autocompleteResults.value.microdistrict.length > 0,
  street: autocompleteResults.value.street.length > 0,
}));

let autocompleteTimeout: number | null = null;

// Вычисляемые свойства для отображения полей ввода
const shouldShowRegionInput = computed(() => {
  return filters.value.groupBy !== "region";
});

const shouldShowSettlementInput = computed(() => {
  return ["district", "microdistrict", "street"].includes(filters.value.groupBy);
});

const shouldShowDistrictInput = computed(() => {
  return ["microdistrict", "street"].includes(filters.value.groupBy);
});

const shouldShowMicrodistrictInput = computed(() => {
  return filters.value.groupBy === "street";
});

// Функция для генерации заголовка сравнения
const generateComparisonTitle = (filters: FilterState): string => {
  const baseTitles: { [key: string]: string } = {
    region: "Области",
    settlement: "Населенные пункты",
    district: "Районы",
    microdistrict: "Микрорайоны",
    street: "Улицы",
  };

  let title = baseTitles[filters.groupBy] || "Аналитика";

  const parts: string[] = [];

  if (filters.regionName && filters.groupBy !== "region") {
    parts.push(filters.regionName);
  }

  if (filters.settlementName && ["district", "microdistrict", "street"].includes(filters.groupBy)) {
    parts.push(filters.settlementName);
  }

  if (filters.districtName && ["microdistrict", "street"].includes(filters.groupBy)) {
    parts.push(filters.districtName);
  }

  if (filters.microdistrictName && filters.groupBy === "street") {
    parts.push(filters.microdistrictName);
  }

  if (parts.length > 0) {
    title += ` - ${parts.join(" - ")}`;
  }

  // Показываем типы населенных пунктов только если есть выбранные типы и это не регион
  // if (filters.groupBy !== 'region' && filters.settlementTypes.length > 0) {
  //     const typeLabels: { [key: string]: string } = {
  //         'Город': 'города',
  //         'Деревня': 'деревни',
  //         'Поселок': 'поселки'
  //     };
  //     // Проверяем, все ли типы выбраны (3 типа)
  //     const allTypesSelected = filters.settlementTypes.length === 3;
  //     if (!allTypesSelected) {
  //         const typeText = filters.settlementTypes.map(type => typeLabels[type] || type).join(', ');
  //         title += ` (${typeText})`;
  //     }
  // }

  if (filters.minOffersCount > 0 || filters.maxOffersCount) {
    const countParts = [];
    if (filters.minOffersCount > 0) countParts.push(`от ${filters.minOffersCount}`);
    if (filters.maxOffersCount) countParts.push(`до ${filters.maxOffersCount}`);
    if (countParts.length > 0) {
      title += ` [${countParts.join("-")} объявлений]`;
    }
  }

  return title;
};
const { $api } = useNuxtApp();

const autocompleteQuery = ref({
  query: "",
  type: "" as keyof AutocompleteState | "",
  limit: 10,
});

const {
  data,
  pending,
  error,
  refresh: refreshAutocomplete,
} = await useAsyncData(
  "autocomplete-filters",
  () =>
    $api("/offers/autocomplete-filters", {
      params: autocompleteQuery.value,
    }),
  {
    immediate: false,
    transform: (response) => {
      const type = autocompleteQuery.value.type;
      if (!type) return response;

      autocompleteResults.value[type as keyof AutocompleteState] = response.results;
      return response.results;
    },
  }
);

// Обработчик ввода для автокомплита
const onAutocompleteInput = (type: keyof AutocompleteState) => {
  const value = filters.value[`${type}Name` as keyof FilterState] as string;

  // очищаем, если мало символов
  if (!value || value.length < 2) {
    autocompleteResults.value[type] = [];
    return;
  }

  autocompleteQuery.value = {
    query: value,
    type,
    limit: 10,
  };

  if (autocompleteTimeout) {
    clearTimeout(autocompleteTimeout);
  }

  autocompleteTimeout = window.setTimeout(() => {
    refreshAutocomplete();
  }, 100);
};

// Обработчик фокуса для автокомплита
const onAutocompleteFocus = (type: keyof AutocompleteState) => {
  if (autocompleteResults.value[type].length === 0) {
    onAutocompleteInput(type);
  }
};

// Выбор значения из автокомплита
const selectAutocomplete = (type: keyof AutocompleteState, value: string) => {
  filters.value[`${type}Name` as keyof FilterState] = value;
  autocompleteResults.value[type] = [];
};

// Скрытие автокомплита при клике вне поля
const setupClickOutside = () => {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    if (!target.closest(".autocomplete-dropdown") && !target.matches('input[type="text"]')) {
      Object.keys(autocompleteResults.value).forEach((key) => {
        autocompleteResults.value[key as keyof AutocompleteState] = [];
      });
    }
    autocompleteResults;
  });
};

// Функция сброса фильтров
const resetFilters = () => {
  filters.value = {
    groupBy: "region",
    regionName: "",
    settlementName: "",
    districtName: "",
    microdistrictName: "",
    streetName: "",
    settlementTypes: [],
    minOffersCount: 100,
    maxOffersCount: null,
  };
  mainAnalyticsTitle.value = "Основная аналитика";
};

// Функция применения фильтров
const applyFilters = () => {
  dashboardKey.value++;
  mainAnalyticsTitle.value = generateComparisonTitle(filters.value);
  console.log("Фильтры применены:", filters.value);
};

// Функции для сравнения
const addToComparison = () => {
  const title = generateComparisonTitle(filters.value);
  const newItem: ComparisonItem = {
    id: `comparison-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: title,
    filters: { ...filters.value },
  };

  comparisonItems.value.push(newItem);
  comparisonCounter++;
};

const removeFromComparison = (id: string) => {
  comparisonItems.value = comparisonItems.value.filter((item) => item.id !== id);
};

// Инициализация
onMounted(() => {
  setupClickOutside();
});
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  width: 100%;
  margin: 0 auto;
}

h1 {
  color: #2d3748;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
}

.filters-panel {
  background: white;
  padding: 1.5rem;

  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.filter-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.filter-group select,
.filter-group input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
}

.checkbox-label input {
  margin: 0;
}

.apply-btn {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.apply-btn:hover {
  background-color: #2563eb;
}

.reset-btn {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.reset-btn:hover {
  background-color: #e5e7eb;
}

.comparison-btn {
  padding: 0.5rem 1rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.comparison-btn:hover {
  background-color: #059669;
}

.comparison-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
}

.comparison-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
}

.comparison-item {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  background: #f9fafb;
  transition: border-color 0.2s;
  width: 100%;
}

.comparison-item:hover {
  border-color: #3b82f6;
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.comparison-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.remove-btn {
  margin: 0 0 0 auto;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background: #dc2626;
}

/* Стили для автокомплита */
.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 2px;
}

.autocomplete-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

.autocomplete-item:hover {
  background-color: #f3f4f6;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .comparison-list {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .filters-panel {
    grid-template-columns: 1fr;
  }

  .filter-group {
    margin-bottom: 1rem;
  }

  .comparison-item {
    padding: 1rem;
  }

  .comparison-title {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .filters-panel {
    padding: 1rem;
  }

  .comparison-list {
    gap: 1rem;
  }

  .comparison-item {
    padding: 0.75rem;
  }
}
</style>
