<template>
  <div class="filters-content">
    <div class="filters-header">
      <p class="font-semibold text-lg">
        Фильтры
        <UBadge v-if="activeFiltersCount > 0" color="info" class="ml-2 font-bold">
          {{ activeFiltersCount }}
        </UBadge>
      </p>
      <UButton @click="filtersReset" variant="ghost" color="info" size="xs"> Сбросить все </UButton>
    </div>

    <div v-if="filterTypesError" class="error-filter-types">
      <span>Ошибка загрузки фильтров</span>
    </div>

    <div v-else class="overflow-auto">
      <div class="filter-section p-5">
        <h4>Тип недвижимости</h4>
        <div class="button-group">
          <UButton
            v-for="type in propertyTypeOptionsDynamic"
            :key="type.value"
            :variant="filters.property_type === type.value ? 'solid' : 'outline'"
            :color="filters.property_type === type.value ? 'neutral' : 'neutral'"
            @click="setPropertyType(type.value)"
            size="sm">
            {{ type.label }}
          </UButton>
        </div>
      </div>
      <div class="filter-sections">
        <!-- Тип объекта -->
        <div v-if="!isHouse" class="filter-section">
          <h4>Тип объекта</h4>
          <div class="button-group">
            <UButton
              v-for="option in flatTypeOptions"
              :key="option.value"
              :variant="filters.is_new_house === option.value ? 'solid' : 'outline'"
              :color="filters.is_new_house === option.value ? 'primary' : 'neutral'"
              @click="setPropertyTypeFilter(option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
          <h4 v-if="filters.is_new_house">Дополнительно</h4>
          <UCheckbox
            v-if="filters.is_new_house"
            :model-value="filters.is_build_complete"
            @update:modelValue="(v) => setBooleanFilter('is_build_complete', v)"
            label="Дом сдан" />
        </div>

        <!-- Цена -->
        <div class="filter-section">
          <h4>Цена</h4>
          <div class="button-group flex-col">
            <UInput v-model.number="filters.min_price" type="number" placeholder="Мин. цена" />
            <UInput v-model.number="filters.max_price" type="number" placeholder="Макс. цена" />
          </div>
          <div class="button-group flex-col">
            <UInput v-model.number="filters.min_price_per_square_meter" type="number" placeholder="Мин. цена за м²" />
            <UInput v-model.number="filters.max_price_per_square_meter" type="number" placeholder="Макс. цена за м²" />
          </div>
        </div>

        <!-- Площадь -->
        <div class="filter-section">
          <h4>Площадь (м²)</h4>
          <div class="button-group flex-col">
            <UInput v-model.number="filters.min_total_area" type="number" placeholder="Мин. общая" />
            <UInput v-model.number="filters.max_total_area" type="number" placeholder="Макс. общая" />
          </div>
          <div v-if="!isHouse" class="button-group flex-col">
            <UInput v-model.number="filters.min_living_area" type="number" placeholder="Мин. жилая" />
            <UInput v-model.number="filters.max_living_area" type="number" placeholder="Макс. жилая" />
          </div>
          <div v-if="!isHouse" class="button-group flex-col">
            <UInput v-model.number="filters.min_kitchen_area" type="number" placeholder="Мин. кухня" />
            <UInput v-model.number="filters.max_kitchen_area" type="number" placeholder="Макс. кухня" />
          </div>
        </div>

        <div v-if="!isFlat" class="filter-section">
          <h4>Площадь участка (сот.)</h4>
          <div class="button-group flex-col">
            <UInput v-model.number="filters.min_land_area" type="number" placeholder="Мин. площадь" />
            <UInput v-model.number="filters.max_land_area" type="number" placeholder="Макс. площадь" />
          </div>
        </div>

        <!-- Комнаты -->
        <div v-if="!isFlat" class="filter-section">
          <h4>Спальни</h4>
          <div class="button-group">
            <UButton
              v-for="bedroom in [1, 2, 3, 4, 5]"
              :key="bedroom"
              :variant="filters.bedrooms_count?.includes(bedroom) ? 'solid' : 'outline'"
              :color="filters.bedrooms_count?.includes(bedroom) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('bedrooms_count', bedroom)"
              size="sm">
              {{ bedroom }}
            </UButton>
          </div>
        </div>
        <div v-if="!isHouse" class="filter-section">
          <h4>Комнаты</h4>
          <div class="button-group">
            <UButton
              v-for="room in [1, 2, 3, 4, 5, 0]"
              :key="room"
              :variant="filters.rooms_count?.includes(room) ? 'solid' : 'outline'"
              :color="filters.rooms_count?.includes(room) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('rooms_count', room)"
              size="sm">
              {{ getRoomLabel(room) }}
            </UButton>
          </div>
        </div>

        <!-- Этажи -->
        <div class="filter-section">
          <h4>Этажи</h4>
          <div v-if="!isHouse" class="button-group flex-col">
            <UInput v-model.number="filters.min_floor" type="number" placeholder="Мин. этаж" />
            <UInput v-model.number="filters.max_floor" type="number" placeholder="Макс. этаж" />
          </div>
          <div class="button-group flex-col">
            <UInput v-model.number="filters.min_house_floors_count" type="number" placeholder="Мин. кол-во этажей" />
            <UInput v-model.number="filters.max_house_floors_count" type="number" placeholder="Макс. кол-во этажей" />
          </div>
        </div>

        <div v-if="!isHouse" class="filter-section">
          <h4 v-if="filters.is_new_house">Тип отделки</h4>
          <h4 v-else-if="filters.is_new_house === false">Тип ремонта</h4>
          <h4 v-else-if="filters.is_new_house == null">Тип ремонта/отделки</h4>
          <div class="button-group">
            <UButton
              v-for="option in filteredRenovationOptions"
              :key="option.value"
              :variant="filters.renovation_type.includes(option.value) ? 'solid' : 'outline'"
              :color="filters.renovation_type.includes(option.value) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('renovation_type', option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <div class="filter-section">
          <h4>Тип санузла</h4>
          <div class="button-group">
            <UButton
              v-for="option in filteredBathroomOptions"
              :key="option.value"
              :variant="filters.bathroom_type.includes(option.value) ? 'solid' : 'outline'"
              :color="filters.bathroom_type.includes(option.value) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('bathroom_type', option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <!-- Коммуникации -->
        <div v-if="!isFlat" class="filter-section">
          <h4>Коммуникации</h4>
          <div class="button-group flex-col">
            <UCheckbox :model-value="filters.has_water_supply" @update:modelValue="(v) => setBooleanFilter('has_water_supply', v)" label="Вода" />
            <UCheckbox :model-value="filters.has_electricity" @update:modelValue="(v) => setBooleanFilter('has_electricity', v)" label="Электричество" />
            <UCheckbox :model-value="filters.has_gas" @update:modelValue="(v) => setBooleanFilter('has_gas', v)" label="Газ" />
            <UCheckbox :model-value="filters.has_sewerage" @update:modelValue="(v) => setBooleanFilter('has_sewerage', v)" label="Канализация" />
            <UCheckbox :model-value="filters.has_heating" @update:modelValue="(v) => setBooleanFilter('has_heating', v)" label="Отопление" />
          </div>
        </div>

        <!-- Удобства -->
        <div class="filter-section">
          <h4>Удобства</h4>
          <div class="button-group flex-col">
            <template v-if="!isHouse">
              <UCheckbox :model-value="filters.has_furniture" @update:modelValue="(v) => setBooleanFilter('has_furniture', v)" label="Мебель" />
              <UCheckbox :model-value="filters.has_elevator" @update:modelValue="(v) => setBooleanFilter('has_elevator', v)" label="Лифт" />
              <UCheckbox :model-value="filters.has_balcony" @update:modelValue="(v) => setBooleanFilter('has_balcony', v)" label="Балкон" />
              <UCheckbox :model-value="filters.has_garbage_chute" @update:modelValue="(v) => setBooleanFilter('has_garbage_chute', v)" label="Мусоропровод" />
            </template>
            <template v-else-if="!isFlat">
              <UCheckbox :model-value="filters.has_guard" @update:modelValue="(v) => setBooleanFilter('has_guard', v)" label="Охрана" />
              <UCheckbox :model-value="filters.has_garage" @update:modelValue="(v) => setBooleanFilter('has_garage', v)" label="Гараж" />
              <UCheckbox :model-value="filters.has_bathhouse" @update:modelValue="(v) => setBooleanFilter('has_bathhouse', v)" label="Баня" />
              <UCheckbox :model-value="filters.has_pool" @update:modelValue="(v) => setBooleanFilter('has_pool', v)" label="Бассейн" />
              <UCheckbox :model-value="filters.has_terrace" @update:modelValue="(v) => setBooleanFilter('has_terrace', v)" label="Терраса" />
            </template>
          </div>
        </div>

        <!-- Вид из окон -->
        <div v-if="!isHouse" class="filter-section">
          <h4>Вид из окон</h4>
          <div class="button-group">
            <UButton
              v-for="option in windowViewTypeOptions"
              :key="option.value"
              :variant="filters.window_view_type.includes(option.value) ? 'solid' : 'outline'"
              :color="filters.window_view_type.includes(option.value) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('window_view_type', option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <!-- Тип парковки -->
        <div v-if="!isHouse" class="filter-section">
          <h4>Тип парковки</h4>
          <div class="button-group">
            <UButton
              v-for="option in parkingTypeOptions"
              :key="option.value"
              :variant="filters.parking_type.includes(option.value) ? 'solid' : 'outline'"
              :color="filters.parking_type.includes(option.value) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('parking_type', option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <!-- Дополнительные параметры -->
        <div class="filter-section">
          <h4>Дополнительно</h4>
          <div class="button-group flex-col">
            <UInput v-model.number="filters.min_house_built_year" type="number" placeholder="Год постройки от" />
            <UInput v-model.number="filters.max_house_built_year" type="number" placeholder="Год постройки до" />
          </div>
          <div class="button-group flex-col">
            <UInput v-model.number="filters.min_ceiling_height" type="number" placeholder="Высота потолков от" step="0.1" />
            <UInput v-model.number="filters.max_ceiling_height" type="number" placeholder="Высота потолков до" step="0.1" />
          </div>
        </div>

        <!-- Материал дома -->
        <div class="filter-section">
          <h4 v-if="!isFlat && !isHouse">Тип/материал дома</h4>
          <h4 v-else-if="isHouse">Материал дома</h4>
          <h4 v-else-if="isFlat">Тип дома</h4>
          <div class="button-group">
            <UButton
              v-for="option in filteredHouseMaterialOptions"
              :key="option.value"
              :variant="filters.house_material_type.includes(option.value) ? 'solid' : 'outline'"
              :color="filters.house_material_type.includes(option.value) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('house_material_type', option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <div v-if="!isFlat" class="filter-section">
          <h4>Тип участка</h4>
          <div class="button-group">
            <UButton
              v-for="option in landTypeOptions"
              :key="option.value"
              :variant="filters.land_type.includes(option.value) ? 'solid' : 'outline'"
              :color="filters.land_type.includes(option.value) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('land_type', option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <!-- Тип отопления -->
        <div class="filter-section">
          <h4>Тип отопления</h4>
          <div class="button-group">
            <UButton
              v-for="option in filteredHeatingOptions"
              :key="option.value"
              :variant="filters.heating_type.includes(option.value) ? 'solid' : 'outline'"
              :color="filters.heating_type.includes(option.value) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('heating_type', option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <!-- Тип газа -->
        <div v-if="isHouse" class="filter-section">
          <h4>Тип газоснабжения</h4>
          <div class="button-group">
            <UButton
              v-for="option in gasTypeOptions"
              :key="option.value"
              :variant="filters.gas_type.includes(option.value) ? 'solid' : 'outline'"
              :color="filters.gas_type.includes(option.value) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('gas_type', option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <!-- Тип канализации -->
        <div v-if="isHouse" class="filter-section">
          <h4>Тип канализации</h4>
          <div class="button-group">
            <UButton
              v-for="option in sewerageTypeOptions"
              :key="option.value"
              :variant="filters.sewerage_type.includes(option.value) ? 'solid' : 'outline'"
              :color="filters.sewerage_type.includes(option.value) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('sewerage_type', option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <!-- Тип водоснабжения -->
        <div v-if="isHouse" class="filter-section">
          <h4>Тип водоснабжения</h4>
          <div class="button-group">
            <UButton
              v-for="option in waterSupplyTypeOptions"
              :key="option.value"
              :variant="filters.water_supply_type.includes(option.value) ? 'solid' : 'outline'"
              :color="filters.water_supply_type.includes(option.value) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('water_supply_type', option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <div class="filter-section">
          <h4>Категория цены</h4>
          <div class="button-group">
            <UButton
              v-for="option in priceCategoryOptions"
              :key="option.value"
              :variant="filters.price_category.includes(option.value) ? 'solid' : 'outline'"
              :color="filters.price_category.includes(option.value) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('price_category', option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <!-- Удобство для пожилых -->
        <div class="filter-section">
          <h4>Удобство для пожилых</h4>
          <div class="button-group">
            <UButton
              v-for="option in elderlyCategoryOptions"
              :key="option.value"
              :variant="filters.elderly_category.includes(option.value) ? 'solid' : 'outline'"
              :color="filters.elderly_category.includes(option.value) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('elderly_category', option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <!-- Доступность для семьи -->
        <div class="filter-section">
          <h4>Удобство для семьи</h4>
          <div class="button-group">
            <UButton
              v-for="option in familyCategoryOptions"
              :key="option.value"
              :variant="filters.family_category.includes(option.value) ? 'solid' : 'outline'"
              :color="filters.family_category.includes(option.value) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('family_category', option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <!-- Транспортная доступность -->
        <div class="filter-section">
          <h4>Транспортная доступность</h4>
          <div class="button-group">
            <UButton
              v-for="option in transportAccessCategoryOptions"
              :key="option.value"
              :variant="filters.transport_access_category.includes(option.value) ? 'solid' : 'outline'"
              :color="filters.transport_access_category.includes(option.value) ? 'primary' : 'neutral'"
              @click="toggleArrayFilter('transport_access_category', option.value)"
              size="sm">
              {{ option.label }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Кнопка применения -->
    <div class="filters-header">
      <UButton @click="handleFiltersApply" color="primary" class="w-full flex justify-center"> Искать объекты </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FilterType {
  id: number;
  name: string;
}

interface FilterTypes {
  property_types: FilterType[];
  bathroom_types: FilterType[];
  renovation_types: FilterType[];
  window_view_types: FilterType[];
  parking_types: FilterType[];
  house_material_types: FilterType[];
  heating_types: FilterType[];
  gas_types: FilterType[];
  sewerage_types: FilterType[];
  water_supply_types: FilterType[];
  land_types: FilterType[];
}

interface Filters {
  property_type: number | null;
  is_new_house: boolean | null;
  address_query: string | null;
  is_build_complete: boolean | null;
  has_water_supply: boolean | null;
  has_electricity: boolean | null;
  has_gas: boolean | null;
  has_sewerage: boolean | null;
  has_heating: boolean | null;
  has_furniture: boolean | null;
  has_elevator: boolean | null;
  has_balcony: boolean | null;
  has_garbage_chute: boolean | null;
  has_guard: boolean | null;
  has_garage: boolean | null;
  has_bathhouse: boolean | null;
  has_pool: boolean | null;
  has_terrace: boolean | null;
  min_price: number | null;
  max_price: number | null;
  min_price_per_square_meter: number | null;
  max_price_per_square_meter: number | null;
  min_total_area: number | null;
  max_total_area: number | null;
  min_living_area: number | null;
  max_living_area: number | null;
  min_kitchen_area: number | null;
  max_kitchen_area: number | null;
  rooms_count: number[];
  bedrooms_count: number[];
  bathrooms_count: number[];
  price_category: string[];
  elderly_category: string[];
  family_category: string[];
  transport_access_category: string[];
  min_floor: number | null;
  max_floor: number | null;
  min_house_floors_count: number | null;
  max_house_floors_count: number | null;
  min_house_built_year: number | null;
  max_house_built_year: number | null;
  min_ceiling_height: number | null;
  max_ceiling_height: number | null;
  min_land_area: number | null;
  max_land_area: number | null;
  renovation_type: number[];
  bathroom_type: number[];
  window_view_type: number[];
  parking_type: number[];
  house_material_type: number[];
  heating_type: number[];
  gas_type: number[];
  sewerage_type: number[];
  water_supply_type: number[];
  land_type: number[];
  seller_name: string | null;
}

// Emits
const emit = defineEmits<{
  filtersApply: [filters: Filters];
  filtersReset: [];
}>();

const { $api } = useNuxtApp();

const {
  data: filterTypesData,
  error: filterTypesError,
  refresh,
} = await useAsyncData("filterTypes", () => $api("/offers/filter_types"), {
  transform: (response: any) =>
    ({
      property_types: response.property_types || [],
      bathroom_types: response.bathroom_types || [],
      renovation_types: response.renovation_types || [],
      window_view_types: response.window_view_types || [],
      parking_types: response.parking_types || [],
      house_material_types: response.house_material_types || [],
      heating_types: response.heating_types || [],
      gas_types: response.gas_types || [],
      sewerage_types: response.sewerage_types || [],
      water_supply_types: response.water_supply_types || [],
      land_types: response.land_types || [],
    } as FilterTypes),
});

const filterTypes = computed(
  () =>
    filterTypesData.value || {
      property_types: [],
      bathroom_types: [],
      renovation_types: [],
      window_view_types: [],
      parking_types: [],
      house_material_types: [],
      heating_types: [],
      gas_types: [],
      sewerage_types: [],
      water_supply_types: [],
      land_types: [],
    }
);

// Инициализация фильтров
const filters = reactive<Filters>({
  property_type: null,
  is_new_house: null,
  address_query: null,
  is_build_complete: null,
  has_water_supply: null,
  has_electricity: null,
  has_gas: null,
  has_sewerage: null,
  has_heating: null,
  has_furniture: null,
  has_elevator: null,
  has_balcony: null,
  has_garbage_chute: null,
  has_guard: null,
  has_garage: null,
  has_bathhouse: null,
  has_pool: null,
  has_terrace: null,
  min_price: null,
  max_price: null,
  min_price_per_square_meter: null,
  max_price_per_square_meter: null,
  min_total_area: null,
  max_total_area: null,
  min_living_area: null,
  max_living_area: null,
  min_kitchen_area: null,
  max_kitchen_area: null,
  rooms_count: [],
  bedrooms_count: [],
  bathrooms_count: [],
  price_category: [],
  elderly_category: [],
  family_category: [],
  transport_access_category: [],
  min_floor: null,
  max_floor: null,
  min_house_floors_count: null,
  max_house_floors_count: null,
  min_house_built_year: null,
  max_house_built_year: null,
  min_ceiling_height: null,
  max_ceiling_height: null,
  min_land_area: null,
  max_land_area: null,
  renovation_type: [],
  bathroom_type: [],
  window_view_type: [],
  parking_type: [],
  house_material_type: [],
  heating_type: [],
  gas_type: [],
  sewerage_type: [],
  water_supply_type: [],
  land_type: [],
  seller_name: null,
});

// Опции фильтров
const priceCategoryOptions = [
  { label: "Выше рынка", value: "expensive" },
  { label: "Рыночная цена", value: "normal" },
  { label: "Ниже рынка", value: "cheap" },
];

const elderlyCategoryOptions = [
  { label: "Низкая", value: "low" },
  { label: "Средняя", value: "medium" },
  { label: "Высокая", value: "high" },
];

const familyCategoryOptions = [
  { label: "Низкая", value: "low" },
  { label: "Средняя", value: "medium" },
  { label: "Высокая", value: "high" },
];

const transportAccessCategoryOptions = [
  { label: "Низкая", value: "low" },
  { label: "Средняя", value: "medium" },
  { label: "Высокая", value: "high" },
];

const flatTypeOptions = [
  { label: "Все", value: null },
  { label: "Вторичка", value: false },
  { label: "Новостройка", value: true },
];

// Computed properties
const makeOptions = (key: keyof FilterTypes) => computed(() => filterTypes.value[key]?.map((t) => ({ label: t.name, value: t.id })) || []);

const propertyTypeOptionsDynamic = makeOptions("property_types");
propertyTypeOptionsDynamic.value.unshift({ label: "Все", value: null });
const renovationTypeOptions = makeOptions("renovation_types");
const bathroomTypeOptions = makeOptions("bathroom_types");
const windowViewTypeOptions = makeOptions("window_view_types");
const parkingTypeOptions = makeOptions("parking_types");
const houseMaterialTypeOptions = makeOptions("house_material_types");
const heatingTypeOptions = makeOptions("heating_types");
const gasTypeOptions = makeOptions("gas_types");
const sewerageTypeOptions = makeOptions("sewerage_types");
const waterSupplyTypeOptions = makeOptions("water_supply_types");
const landTypeOptions = makeOptions("land_types");

const currentPropertyType = computed(() => filterTypes.value.property_types?.find((t) => t.id === filters.property_type));

const isFlat = computed(() => ["Квартира", "Апартаменты"].includes(currentPropertyType.value?.name || ""));
const isHouse = computed(() => ["Дом", "Таунхаус", "Коттедж"].includes(currentPropertyType.value?.name || ""));

// Исключаем address_query из подсчета активных фильтров
const activeFiltersCount = computed(() =>
  Object.entries(filters).reduce((count, [key, value]) => {
    // Исключаем системные поля
    if (key === "property_type" || key === "address_query") return count;

    // Для массивов
    if (Array.isArray(value)) {
      return count + (value.length > 0 ? 1 : 0);
    }

    // Для булевых значений учитываем только true
    if (key === "is_new_house") {
      return count + (value !== null ? 1 : 0);
    }
    if (typeof value === "boolean") {
      return count + (value !== false ? 1 : 0);
    }

    // Для чисел и строк
    return count + (value != null && value !== "" ? 1 : 0);
  }, 0)
);

const filteredBathroomOptions = computed(() =>
  bathroomTypeOptions.value.filter((option) => {
    if (isFlat.value) {
      return !["В доме", "На улице"].includes(option.label);
    }
    if (isHouse.value) {
      return !["Раздельный", "Совмещенный"].includes(option.label);
    }
    return true;
  })
);

const filteredRenovationOptions = computed(() =>
  renovationTypeOptions.value.filter((option) => {
    if (filters.is_new_house) {
      return !["Без отделки", "Косметический", "Дизайнерксий", "Евроремонт"].includes(option.label);
    }
    if (filters.is_new_house === false) {
      return !["Без отделки", "Предчистовая", "Чистовая с мебелью"].includes(option.label);
    }
    return true;
  })
);

const filteredHouseMaterialOptions = computed(() =>
  houseMaterialTypeOptions.value.filter((option) => {
    if (isFlat.value) {
      return !["Щитовой", "Каркасный", "Газобетонный блок", "Газосиликатный блок", "Пенобетонный блок"].includes(option.label);
    }
    if (isHouse.value) return !["Панельный", "Блочный", "Сталинский", "Кирпично   монолитный"].includes(option.label);
    return true;
  })
);

const filteredHeatingOptions = computed(() =>
  heatingTypeOptions.value.filter((option) => {
    if (isFlat.value) {
      return !["Центральное газовое", "Угольное", "Печь", "Камин", "Электрическое", "Автономное газовое", "Дизельное", "Твердотопливный котел", "Без отопления"].includes(
        option.label
      );
    }
    if (isHouse.value) {
      return !["Центральное", "Автономное", "Автономная котельная", "Индивидуальный тепловой пункт"].includes(option.label);
    }
    return true;
  })
);

// Методы для работы с фильтрами
const setPropertyType = (typeId: number) => {
  filters.property_type = typeId;
  console.log("МЕНЯЕМ ТИП НЕДВИЖИМОСТИ ФИЛЬТРЫ:", filters);
  console.log("filters:", filters);
  Object.keys(filters).forEach((key) => {
    if (key === "property_type") {
      filters[key] = filters.property_type;
    } else if (key === "address_query") {
      filters[key] = filters.address_query;
    } else if (Array.isArray(filters[key])) {
      filters[key] = [];
    } else {
      filters[key] = null;
    }
  });
  console.log("Устанавливаем проперти тайп в фильтерссайдбаре:", filters.property_type);
  emit("filtersApply", filters);
};

const handleFiltersApply = () => {
  emit("filtersApply", { ...filters });
};

const filtersReset = () => {
  console.log("ФИЛЬТЕРС РЕСЕТ");
  const currentPropertyType = filters.property_type;
  const currentAddress = filters.address_query;

  Object.keys(filters).forEach((key) => {
    if (key === "address_query") {
      filters[key] = currentAddress;
    } else if (Array.isArray(filters[key])) {
      filters[key] = [];
    } else {
      filters[key] = null;
    }
  });

  emit("filtersApply", { ...filters });
};

const getRoomLabel = (count: number) => {
  return count === 0 ? "Студия" : count.toString();
};

const toggleArrayFilter = (arrayName: string, value: number | string) => {
  const arr = filters[arrayName] as (number | string)[];
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  } else {
    arr.push(value);
  }
};

const setBooleanFilter = (filterName: string, value: boolean | null) => {
  filters[filterName] = value;
};

const setPropertyTypeFilter = (value: boolean | null) => {
  filters.is_new_house = value;
};
defineExpose({
  filters,
});
</script>

<style scoped>
@reference "tailwindcss";

.filters-header:first-of-type {
  @apply rounded-b-none!;
}

.filters-header {
  @apply flex justify-between px-6 py-5  ring-1 ring-[var(--ui-border)]  border-t-0!  rounded-b-none;
}

.filters-header:last-of-type {
  @apply rounded-t-none!;
}

.filters-content {
  @apply ring-1 ring-(--ui-border) max-h-[89vh] flex flex-col w-124 sticky top-16;
}

.filter-section:first-of-type {
  @apply pb-0;
}

.filter-section {
  @apply px-6 pt-5 flex flex-col gap-4;
}

.button-group {
  @apply flex flex-wrap gap-1.5;
}

.filter-section h4 {
  @apply font-semibold;
}

.filters-content .filter-section:last-of-type {
  @apply pb-5;
}
</style>
