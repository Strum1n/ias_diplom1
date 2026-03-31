<template>
  <div class="p-3 md:p-5 min-h-screen">
    <div class="rounded-lg ring p-3 md:p-5 pb-0 ring-default flex flex-col md:flex-row gap-3 md:gap-4">
      <div class="flex flex-col md:flex-row gap-3 md:gap-2">
        <USelect
          v-model="draftFilters.groupBy"
          :items="[
            {label: 'Области', value: 'region'},
            {label: 'Муниципалитеты', value: 'municipality'},
            {label: 'Населённые пункты', value: 'settlement'},
            {label: 'Районы', value: 'district'},
            {label: 'Микрорайоны', value: 'microdistrict'},
            {label: 'Улицы', value: 'street'},
          ]"
          placeholder="Группировка"
          class="w-full md:w-40 h-8"
        />

        <div class="grid grid-cols-1 md:flex gap-2 md:gap-4">
          <div v-if="visibleInputs.includes('region')" class="relative">
            <UInput
              class="w-full"
              v-model="draftFilters.region"
              placeholder="Область"
              @update:model-value="v => handleInputChange('region', v)"
            />
            <ul
              v-click-outside="handleClickOutside"
              v-if="autocompleteResults.region.length > 0 && autocompleteResults.region[0] != draftFilters.region"
              class="w-full md:w-64 absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
            >
              <li
                v-for="(item, index) in autocompleteResults.region"
                :key="index"
                @click="selectResult('region', item)"
                class="px-3 py-2 hover:bg-blue-100 cursor-pointer"
              >
                {{ item }}
              </li>
            </ul>
          </div>

          <div v-if="visibleInputs.includes('municipality')" class="relative">
            <UInput
              class="w-full"
              v-model="draftFilters.municipality"
              placeholder="Муниципалитет"
              @update:model-value="v => handleInputChange('municipality', v)"
            />
            <ul
              v-click-outside="handleClickOutside"
              v-if="autocompleteResults.municipality.length > 0 && autocompleteResults.municipality[0] != draftFilters.municipality"
              class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
            >
              <li
                v-for="(item, index) in autocompleteResults.municipality"
                :key="index"
                @click="selectResult('municipality', item)"
                class="px-3 py-2 hover:bg-blue-100 cursor-pointer"
              >
                {{ item }}
              </li>
            </ul>
          </div>

          <div v-if="visibleInputs.includes('settlement')" class="relative">
            <UInput
              class="w-full"
              v-model="draftFilters.settlement"
              placeholder="Населённый пункт"
              @update:model-value="v => handleInputChange('settlement', v)"
            />
            <ul
              v-click-outside="handleClickOutside"
              v-if="autocompleteResults.settlement.length > 0 && autocompleteResults.settlement[0] != draftFilters.settlement"
              class="absolute rounded-sm ring-1 ring-default max-h-50 overflow-auto z-10 bg-white w-full mt-1 text-sm"
            >
              <li
                v-for="(item, index) in autocompleteResults.settlement"
                :key="index"
                @click="selectResult('settlement', item)"
                class="px-3 py-2 cursor-pointer bg-white border-b border-[var(--ui-border-muted)] px-3 py-2 hover:bg-[var(--ui-color-neutral-100)]"
              >
                {{ item }}
              </li>
            </ul>
          </div>

          <div v-if="visibleInputs.includes('district')" class="relative">
            <UInput
              class="w-full"
              v-model="draftFilters.district"
              placeholder="Район"
              @update:model-value="v => handleInputChange('district', v)"
            />
            <ul
              v-click-outside="handleClickOutside"
              v-if="autocompleteResults.district.length > 0 && autocompleteResults.district[0] != draftFilters.district"
              class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
            >
              <li
                v-for="(item, index) in autocompleteResults.district"
                :key="index"
                @click="selectResult('district', item)"
                class="px-3 py-2 hover:bg-blue-100 cursor-pointer"
              >
                {{ item }}
              </li>
            </ul>
          </div>

          <div v-if="visibleInputs.includes('microdistrict')" class="relative">
            <UInput
              class="w-full"
              v-model="draftFilters.microdistrict"
              placeholder="Микрорайон"
              @update:model-value="v => handleInputChange('microdistrict', v)"
            />
            <ul
              v-click-outside="handleClickOutside"
              v-if="autocompleteResults.microdistrict.length > 0 && autocompleteResults.microdistrict[0] != draftFilters.microdistrict"
              class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
            >
              <li
                v-for="(item, index) in autocompleteResults.microdistrict"
                :key="index"
                @click="selectResult('microdistrict', item)"
                class="px-3 py-2 hover:bg-blue-100 cursor-pointer"
              >
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="flex md:flex gap-8 md:gap-6 w-full md:w-auto">
        <div class="md:w-auto">
          <span class="font-[550] text-sm md:text-base">Тип населенного пункта</span>
          <UCheckboxGroup
            v-model="draftFilters.settlementTypes"
            :items="[
              {label: 'Город', value: 'город'},
              {label: 'Деревня', value: 'деревня'},
              {label: 'Поселок', value: 'поселок'},
              {label: 'Село', value: 'село'},
            ]"
            class="mb-2 mt-1 flex flex-wrap gap-2"
          />
        </div>

        <div class="md:w-auto">
          <span class="font-[550] text-sm md:text-base">Вид недвижимости</span>
          <URadioGroup
            class="mt-1"
            v-model="draftFilters.is_new_house"
            :items="[
              {label: 'Все', value: undefined},
              {label: 'Новостройки', value: true},
              {label: 'Вторичка', value: false},
            ]"
          />
        </div>
      </div>

      <div class="flex flex-col mb-2 sm:flex-row gap-2 md:gap-4 mt-2 md:mt-0">
        <UButton color="primary" variant="solid" class="h-fit p-2 text-sm" @click="applyFilters"> Применить фильтры </UButton>
        <UButton color="info" icon="i-material-symbols:add-ad-rounded" variant="soft" class="h-fit p-2 text-sm" @click="addComparison">
          Добавить к сравнению
        </UButton>
        <UButton color="error" variant="soft" icon="i-f7:clear-fill" class="h-fit p-2 text-sm" @click="comparisons = []">
          Очистить сравнение
        </UButton>
      </div>
    </div>

    <div
      v-if="
        appliedFilters.municipality ||
        appliedFilters.region ||
        appliedFilters.settlement ||
        appliedFilters.district ||
        appliedFilters.microdistrict
      "
      class="flex mt-4 md:mt-5 items-center text-black font-semibold text-lg md:text-xl justify-center w-full"
    >
      <UIcon name="tabler:filter" class="w-18 md:size-5" />
      <span class="ml-1">: {{ appliedFiltersLabel }}</span>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4.5 py-4 md:py-5">
      <div class="stat-card">
        <h3 class="text-xs md:text-2xl">Всего объектов</h3>
        <div v-if="loadingOneObject" class="stat-card-info">
          <UIcon class="size-6 md:size-8" name="ic:round-maps-home-work"> </UIcon>
          <span>
            <UIcon class="size-6 md:size-8" name="codex:loader"></UIcon>
          </span>
        </div>
        <div v-else class="stat-card-info">
          <UIcon class="size-6 md:size-8" name="ic:round-maps-home-work"> </UIcon>
          <span class="text-lg md:text-2xl">{{ OneObjectData?.total_count }}</span>
        </div>
      </div>

      <div class="stat-card">
        <h3 class="text-xs md:text-2xl">Средняя цена</h3>
        <div v-if="loadingOneObject" class="stat-card-info">
          <UIcon class="size-6 md:size-8" name="solar:money-bag-bold"> </UIcon>
          <span>
            <UIcon class="size-6 md:size-8" name="codex:loader"></UIcon>
          </span>
        </div>
        <div v-else class="stat-card-info">
          <UIcon class="size-6 md:size-8" name="solar:money-bag-bold"> </UIcon>
          <span class="text-lg md:text-2xl"
            >{{ new Intl.NumberFormat("ru-RU").format(OneObjectData?.statistics.averages.average_price) }} ₽</span
          >
        </div>
      </div>

      <div class="stat-card">
        <h3 class="text-xs md:text-2xl">Средняя площадь</h3>
        <div v-if="loadingOneObject" class="stat-card-info">
          <UIcon class="size-6 md:size-8" name="bx:area"> </UIcon>
          <span>
            <UIcon class="size-6 md:size-8" name="codex:loader"></UIcon>
          </span>
        </div>
        <div v-else class="stat-card-info">
          <UIcon class="size-6 md:size-8" name="bx:area"> </UIcon>
          <span class="text-lg md:text-2xl">{{ OneObjectData?.statistics.averages.average_area }} м²</span>
        </div>
      </div>

      <div class="stat-card">
        <h3 class="text-xs md:text-2xl">Новых сегодня</h3>
        <div v-if="loadingOneObject" class="stat-card-info">
          <UIcon class="size-6 md:size-8" name="material-symbols:fiber-new"> </UIcon>
          <span>
            <UIcon class="size-6 md:size-8" name="codex:loader"></UIcon>
          </span>
        </div>
        <div v-else class="stat-card-info">
          <UIcon class="size-6 md:size-8" name="material-symbols:fiber-new"> </UIcon>
          <span class="text-lg md:text-2xl">{{ OneObjectData?.offers_today }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-4">
      <div class="rounded-lg ring ring-default p-3 md:p-4 w-full">
        <VChartFull v-if="priceHistoryData" :option="priceHistoryChartOption" :init-options="{height: 400}" autoresize />
        <div v-else class="flex h-full justify-center items-center">
          <UIcon class="size-8 md:size-20" name="codex:loader"></UIcon>
        </div>
      </div>

      <div class="rounded-lg ring ring-default p-3 md:p-4 w-full">
        <VChartFull v-if="viewsHistoryData" :option="viewsHistoryChartOption" autoresize :init-options="{height: 400}" />
        <div v-else class="flex h-full justify-center items-center">
          <UIcon class="size-8 md:size-20" name="codex:loader"></UIcon>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row mt-4 md:mt-5 gap-4 justify-between">
      <div class="ring w-full lg:w-[75%] ring-default relative rounded-lg">
        <div class="absolute top-3 left-3 right-3 flex justify-between z-10">
          <USelect v-model="appliedFilters.chartType" :items="chartTypeOptions" placeholder="Тип графика" class="w-max md:w-fit" />
          <div class="flex gap-2">
            <UButton v-if="canDrillUp && isMobile" icon="i-heroicons-arrow-left" color="neutral" variant="ghost" size="xs" @click="drillUp">
            </UButton>
            <UButton
              v-if="canDrillUp && appliedFilters.groupBy != 'street' && isMobile"
              trailing-icon="i-heroicons-arrow-right"
              color="neutral"
              variant="ghost"
              size="xs"
              @click="drillDownBtn"
            >
            </UButton>
            <UButton
              v-if="canDrillUp && !isMobile"
              class="absolute top-20.5 z-10 left-12"
              icon="i-heroicons-arrow-left"
              color="neutral"
              variant="ghost"
              @click="drillUp"
            >
              Назад
            </UButton>
            <UButton
              v-if="canDrillUp && appliedFilters.groupBy != 'street' && !isMobile"
              class="absolute top-20.5 z-10 right-12"
              trailing-icon="i-heroicons-arrow-right"
              color="neutral"
              variant="ghost"
              @click="drillDownBtn"
            >
              Вперед
            </UButton>
          </div>
        </div>

        <div class="relative pt-8! pr-3 md:pt-16">
          <VChartFull
            class="p-0 md:p-2"
            v-if="settlementsData"
            :option="chartOption"
            autoresize
            :init-options="chartInitOptions"
            @click="handleChartClick"
          />
          <div v-else class="flex h-full justify-center items-center">
            <UIcon class="size-8 md:size-20" name="codex:loader"></UIcon>
          </div>
          <div
            v-if="!loadingSettlements && settlementsData?.length === 0"
            class="absolute bottom-60 left-0 right-0 text-center text-gray-400"
          >
            Нет данных для выбранного уровня
          </div>
        </div>
      </div>

      <div class="w-full lg:w-[25%]">
        <VChartFull
          class="ring rounded-lg ring-default p-2"
          v-if="OneObjectData"
          :option="propertyTypesPieOption"
          autoresize
          :init-options="chartInitOptions"
        />
      </div>
    </div>

    <div class="flex flex-col lg:flex-row mt-4 md:mt-5 gap-4">
      <div class="flex w-full lg:w-[75%] flex-col">
        <p class="text-lg md:text-xl font-semibold">Популярные объявления</p>
        <div class="flex flex-col gap-3 md:gap-5 mt-3 md:mt-4" v-for="block in topOffersBlocks" :key="block.label">
          <h3 class="text-base md:text-lg text-center">
            {{ block.label }}
          </h3>
          <div
            v-for="offer in block.offers"
            :key="offer.id"
            class="ring ring-[#f8fafc] rounded-lg h-fit p-0 bg-[#f8fafc] cursor-pointer hover:bg-[#e9eef4] hover:ring-[#e9eef4] transition-all"
            @click="openOffer(offer)"
          >
            <div class="flex flex-col sm:flex-row h-fit">
              <div class="relative sm:w-1/4">
                <img v-if="offer.images_urls?.length" :src="offer.images_urls[0]" class="object-cover rounded-lg w-full h-40 sm:h-40" />
                <div v-else class="h-40 sm:h-33 flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="size-8 md:size-10 text-gray-400" />
                </div>
                <UBadge v-if="offer.is_new_house" color="neutral" class="absolute top-2 left-2 text-xs"> Новостройка </UBadge>
              </div>

              <div class="sm:pl-4 flex justify-between w-full">
                <div class="relative py-3 sm:py-5 w-full justify-between flex flex-col sm:flex-row px-3 sm:px-5">
                  <div class="flex flex-col gap-1 sm:gap-1">
                    <h3 class="font-bold text-base md:text-lg">
                      {{ offer.title || "Без названия" }}
                    </h3>
                    <div class="text-sm mt-1 md:text-base">
                      <p>
                        <UIcon name="tabler:map-pin" class="min-w-5 size-5" />
                        <span>{{ offer.address?.full_address }}</span>
                      </p>
                    </div>
                    <span class="text-xs md:text-sm mt-2 sm:absolute sm:bottom-4"
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
                  </div>

                  <div class="flex flex-col items-end mr-0 gap-1 mt-2 sm:mt-0">
                    <div class="flex items-center justify-center gap-2">
                      <UBadge
                        v-if="offer.price_category"
                        :color="getCategoryColor(offer.price_category)"
                        variant="solid"
                        class="flex text-nowrap text-xs md:text-sm"
                      >
                        {{ getCategoryLabel(offer.price_category) }}
                      </UBadge>
                      <span class="font-bold text-nowrap text-sm md:text-base">{{ formatPrice(offer.price) }}</span>
                    </div>
                    <div class="text-xs md:text-sm">{{ formatPrice(offer.price_per_square_meter) }}/м²</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4 w-full lg:w-[25%]">
        <VChartFull
          class="ring rounded-lg ring-default p-2"
          v-if="OneObjectData"
          :option="apartmentsByRoomsPieOption"
          autoresize
          :init-options="chartInitOptions"
        />
        <VChartFull
          class="ring rounded-lg ring-default p-2"
          v-if="OneObjectData"
          :option="flatTypePieOption"
          autoresize
          :init-options="chartInitOptions"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {getCategoryColor} = useCategoryColor();
const {getCategoryLabel} = useCategoryLabel();
const {formatPrice} = usePriceFormat();

interface SettlementData {
  name: string;
  offers_count: number;
  averages: {
    average_price: number;
    average_price_per_square_meter: number;
    average_area: number;
    average_views_count: number;
  };
  price_categories: {
    cheap: number;
    normal: number;
    expensive: number;
  };
  family_categories: {
    low: number;
    medium: number;
    high: number;
  };
  elderly_categories: {
    low: number;
    medium: number;
    high: number;
  };
  transport_access_categories: {
    low: number;
    medium: number;
    high: number;
  };
  area_boxplot?: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
  };
  price_boxplot?: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
  };
}

interface TopOffer {
  id: number;
  title?: string;
  url: string;
  price: number;
  price_per_square: number;
  is_new_house: boolean;
  images_urls: string[];
}

interface OneObjectStats {
  total_count: number;
  offers_today: number;
  statistics: {
    averages: {
      average_price: number | null;
      average_price_per_square_meter: number | null;
      average_area: number | null;
      average_views_count: number | null;
    };
    area_boxplot: {
      min: number | null;
      q1: number | null;
      median: number | null;
      q3: number | null;
      max: number | null;
    };
    price_boxplot: {
      min: number | null;
      q1: number | null;
      median: number | null;
      q3: number | null;
      max: number | null;
    };
    price_categories: {
      cheap: number;
      normal: number;
      expensive: number;
    };
    property_types: Record<string, number>;
    apartments_by_rooms: {
      rooms: Record<string, number>;
      flat_type: {
        new_houses: number;
        secondary: number;
      };
    };
  };
  top_offers_by_views: TopOffer[];
}

const isMobile = ref(false);

onMounted(() => {
  const check = () => {
    isMobile.value = window.innerWidth < 640;
  };
  check();
  window.addEventListener("resize", check);
});

const topOffersBlocks = computed(() => {
  const blocks = [];
  if (OneObjectData.value?.top_offers_by_views?.length) {
    blocks.push({
      label: buildLabelWithoutGroupBy(appliedFilters),
      offers: OneObjectData.value.top_offers_by_views,
    });
  }
  comparisons.value.forEach(c => {
    const offers = c.stats?.top_offers_by_views;
    if (offers?.length) {
      blocks.push({
        label: buildLabelWithoutGroupBy(c.filters),
        offers,
      });
    }
  });
  return blocks;
});

interface ViewsHistoryData {
  date: string;
  views: number;
}

interface PriceHistory {
  date: string;
  avg_price: number | null;
}

type AutocompleteField = "region" | "municipality" | "settlement" | "district" | "microdistrict";

interface ComparisonItem {
  id: number;
  label: string;
  labelWithoutGroup: string;
  filters: typeof appliedFilters;
  settlementsData: SettlementData[];
  priceHistory: any;
  viewsHistory: any;
  stats: any;
}

const comparisons = ref<ComparisonItem[]>([]);
let comparisonId = 0;

function buildLabelWithoutGroupBy(filters: {
  region?: string;
  municipality?: string;
  settlement?: string;
  district?: string;
  microdistrict?: string;
  is_new_house?: boolean | null;
  settlementTypes?: string[];
}) {
  const parts: string[] = [];
  if (filters.region) parts.push(filters.region);
  if (filters.municipality) parts.push(filters.municipality);
  if (filters.settlement) parts.push(filters.settlement);
  if (filters.district) parts.push(filters.district);
  if (filters.microdistrict) parts.push(filters.microdistrict);
  if (filters.is_new_house === true) parts.push("Новостройки");
  else if (filters.is_new_house === false) parts.push("Вторичка");
  if (filters.settlementTypes?.length) {
    parts.push(filters.settlementTypes.join(", "));
  }
  return parts.join(" · ");
}

const appliedFiltersLabel = computed(() => buildLabel(appliedFilters));

const chartTypeOptions = ref([
  {label: "Количество объектов", value: "offers"},
  {label: "Категории цен", value: "priceCategories"},
  {label: "Комфорт для семьи", value: "familyCategories"},
  {label: "Комфорт для пожилых", value: "elderlyCategories"},
  {label: "Транспортная доступность", value: "transportAccessCategories"},
  {label: "Средняя цена за м²", value: "avgPricePerMeter"},
  {label: "Среднее кол-во просмотров за день", value: "avgDailyViewsCount"},
  {label: "Boxplot по площади", value: "areaBoxplot"},
  {label: "Boxplot по цене", value: "priceBoxplot"},
]);

async function addComparison() {
  const filtersSnapshot = JSON.parse(JSON.stringify(draftFilters));

  const [priceHistory, viewsHistory, settlements, one_stats] = await Promise.all([
    $api("/analysis/avg-price-history", {
      params: buildParams(filtersSnapshot),
    }),
    $api("/analysis/last-10-days-views-history", {
      params: {
        ...buildParams(filtersSnapshot),
        settlement_type_names: filtersSnapshot.settlementTypes.length > 0 ? filtersSnapshot.settlementTypes : undefined,
      },
    }),
    $api("/analysis/group-stats", {
      params: {
        ...buildParams(filtersSnapshot),
        group_by: draftFilters.groupBy,
      },
    }),
    $api("/analysis/stats", {params: buildParams(filtersSnapshot)}),
  ]);
  console.log("Settlements from API:", settlements);
  comparisons.value.push({
    id: ++comparisonId,
    label: buildLabel(filtersSnapshot),
    labelWithoutGroup: buildLabelWithoutGroupBy(filtersSnapshot) || "",
    filters: filtersSnapshot,
    priceHistory,
    viewsHistory,
    settlementsData: settlements, // ← исправлено
    stats: one_stats,
  });

  draftFilters.region = "";
  draftFilters.municipality = "";
  draftFilters.settlement = "";
  draftFilters.district = "";
  draftFilters.microdistrict = "";
}

function removeComparison(id: number) {
  comparisons.value = comparisons.value.filter(c => c.id !== id);
}

type PricePoint = {
  date: string;
  avg_price: number;
};

const currentLabel = computed(() => buildLabel(appliedFilters));

function aggregateByMonth(data?: PricePoint[]) {
  if (!data?.length) return [];
  const map = new Map<string, {sum: number; count: number; date: Date}>();
  for (const item of data) {
    const d = new Date(item.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!map.has(key)) {
      map.set(key, {
        sum: 0,
        count: 0,
        date: new Date(d.getFullYear(), d.getMonth(), 1),
      });
    }
    const acc = map.get(key)!;
    acc.sum += item.avg_price;
    acc.count += 1;
  }
  return Array.from(map.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(i => ({
      date: i.date,
      avg_price: Math.round(i.sum / i.count),
    }));
}

const priceHistoryChartOption = computed(() => {
  const baseMonthly = aggregateByMonth(priceHistoryData.value);
  const comparisonMonthly = comparisons.value.map(c => ({
    label: c.labelWithoutGroup || "",
    monthly: aggregateByMonth(c.priceHistory),
  }));

  const series = [
    {
      name: buildLabelWithoutGroupBy(appliedFilters),
      type: "line",
      smooth: true,
      showSymbol: false,
      data: baseMonthly.map(i => [i.date, i.avg_price]),
    },
    ...comparisonMonthly.map(c => ({
      name: c.label || "",
      type: "line",
      smooth: true,
      showSymbol: false,
      data: c.monthly.map(i => [i.date, i.avg_price]),
    })),
  ];

  const formatPrice = (price: number) => new Intl.NumberFormat("ru-RU").format(price);

  return {
    title: {
      text: "История средней цены",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: (v: number) => (v !== null && v !== undefined ? `${formatPrice(v)} ₽` : "—"),
    },
    dataZoom: {
      type: "inside",
      zoomOnMouseWheel: true,
      moveOnMouseMove: true,
      preventDefaultMouseMove: true,
    },
    legend: {},
    grid: {
      left: 0,
      right: 0,
      bottom: 65,
      top: 65,
    },
    xAxis: {type: "time"},
    yAxis: {
      type: "value",
      axisLabel: {formatter: (v: number) => formatPrice(v)},
    },
    series,
  };
});

const viewsHistoryChartOption = computed(() => {
  const series = [
    {
      name: buildLabelWithoutGroupBy(appliedFilters),
      type: "line",
      smooth: true,
      showSymbol: false,
      data: viewsHistoryData.value?.map(i => i.views),
    },
    ...comparisons.value.map(c => ({
      name: c.labelWithoutGroup || "",
      type: "line",
      smooth: true,
      showSymbol: false,
      data: c.viewsHistory.map(i => i.views),
    })),
  ];

  const xAxisData =
    viewsHistoryData.value?.map(i =>
      new Date(i.date).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
      }),
    ) ?? [];

  return {
    title: {
      text: isMobile.value ? wrapText("История просмотров за последние 10 дней", 30) : "История просмотров за последние 10 дней",
      left: "center",
    },
    tooltip: {trigger: "axis"},
    dataZoom: {
      type: "inside",
      zoomOnMouseWheel: true,
      moveOnMouseMove: true,
      preventDefaultMouseMove: true,
    },
    legend: {},
    grid: {
      left: 0,
      right: 0,
      bottom: 65,
      top: 65,
    },
    xAxis: {type: "category", data: xAxisData},
    yAxis: {type: "value"},
    series,
  };
});

function buildParams(filters: typeof appliedFilters) {
  return {
    settlement_type_names: filters.settlementTypes.length ? filters.settlementTypes : undefined,
    region_name: filters.region || undefined,
    municipality_name: filters.municipality || undefined,
    settlement_name: filters.settlement || undefined,
    district_name: filters.district || undefined,
    microdistrict_name: filters.microdistrict || undefined,
    is_new_house: filters.is_new_house,
  };
}

function getGroupByLabel(groupBy: string) {
  switch (groupBy) {
    case "region":
      return "Области";
    case "municipality":
      return "Муниципалитеты";
    case "settlement":
      return "Населённые пункты";
    case "district":
      return "Районы";
    case "microdistrict":
      return "Микрорайоны";
    case "street":
      return "Улицы";
    default:
      return groupBy;
  }
}

function buildLabel(filters: {
  groupBy?: string;
  region?: string;
  municipality?: string;
  settlement?: string;
  district?: string;
  microdistrict?: string;
  is_new_house?: boolean | null;
  settlementTypes?: string[];
}) {
  const parts: string[] = [];
  if (filters.groupBy) parts.push(getGroupByLabel(filters.groupBy));
  if (filters.region) parts.push(filters.region);
  if (filters.municipality) parts.push(filters.municipality);
  if (filters.settlement) parts.push(filters.settlement);
  if (filters.district) parts.push(filters.district);
  if (filters.microdistrict) parts.push(filters.microdistrict);
  if (filters.is_new_house === true) parts.push("Новостройки");
  else if (filters.is_new_house === false) parts.push("Вторичка");
  if (filters.settlementTypes?.length) {
    parts.push(filters.settlementTypes.join(", "));
  }
  return parts.join(" · ");
}

interface DraftFilters {
  groupBy: string;
  region: string;
  municipality: string;
  settlement: string;
  district: string;
  microdistrict: string;
  settlementTypes: string[];
  is_new_house?: boolean;
}

const draftFilters = reactive<DraftFilters>({
  groupBy: "region",
  region: "",
  municipality: "",
  settlement: "",
  district: "",
  microdistrict: "",
  settlementTypes: [] as string[],
  is_new_house: undefined,
});

const appliedFilters = reactive({
  is_new_house: undefined,
  groupBy: "region",
  chartType: "offers",
  settlementTypes: [] as string[],
  region: "",
  municipality: "",
  settlement: "",
  district: "",
  microdistrict: "",
});

const {$api} = useNuxtApp();

const drillLevels = ["region", "municipality", "settlement", "district", "microdistrict", "street"];

const openOffer = offer => {
  const router = useRouter();
  router.push(`/offers/${offer.id}`);
};

async function drillDown(categoryName: string) {
  const currentIndex = drillLevels.indexOf(appliedFilters.groupBy as (typeof drillLevels)[number]);
  for (let i = currentIndex + 1; i < drillLevels.length; i++) {
    const nextLevel = drillLevels[i];
    appliedFilters.groupBy = nextLevel;
    drillLevels.slice(i + 1).forEach(level => {
      appliedFilters[level] = "";
    });
    appliedFilters[drillLevels[currentIndex]] = categoryName;
    refreshSettlementsData();
    if (settlementsData.value?.length && settlementsData.value.length > 0) {
      refreshOneObjectData();
      refreshPriceHistoryData();
      refreshViewsHistoryData();
      return;
    }
  }
}

const canDrillUp = computed(() => appliedFilters.groupBy != "region");

async function drillUpTo(targetLevel: (typeof drillLevels)[number]) {
  const targetIndex = drillLevels.indexOf(targetLevel);
  if (targetIndex < 0) return;
  if (!appliedFilters[targetLevel]) {
    appliedFilters.groupBy = targetLevel;
    drillLevels.forEach((level, idx) => {
      if (idx > targetIndex) appliedFilters[level] = "";
    });
    refreshSettlementsData();
    refreshOneObjectData();
    refreshPriceHistoryData();
    refreshViewsHistoryData();
  }
  appliedFilters.groupBy = targetLevel;
  appliedFilters[targetLevel] = "";
  drillLevels.forEach((level, idx) => {
    if (idx > targetIndex) appliedFilters[level] = "";
  });
  refreshSettlementsData();
  refreshOneObjectData();
  refreshPriceHistoryData();
  refreshViewsHistoryData();
}

async function drillUp() {
  const currentIndex = drillLevels.indexOf(appliedFilters.groupBy as (typeof drillLevels)[number]);
  if (currentIndex <= 0) return;
  const nextLevel = drillLevels[currentIndex - 1];
  appliedFilters.groupBy = nextLevel;
  drillLevels.forEach((level, idx) => {
    if (idx >= currentIndex - 1) appliedFilters[level] = "";
  });
  refreshSettlementsData();
  refreshOneObjectData();
  refreshPriceHistoryData();
  refreshViewsHistoryData();
}

async function drillDownBtn() {
  const currentIndex = drillLevels.indexOf(appliedFilters.groupBy as (typeof drillLevels)[number]);
  if (currentIndex >= drillLevels.length - 1) return;
  const nextLevel = drillLevels[currentIndex + 1];
  appliedFilters.groupBy = nextLevel;
  refreshSettlementsData();
  refreshOneObjectData();
  refreshPriceHistoryData();
  refreshViewsHistoryData();
}

function getLevelLabel(level: (typeof drillLevels)[number]) {
  switch (level) {
    case "region":
      return "Области";
    case "municipality":
      return "Муниципалитеты";
    case "settlement":
      return "Населённые пункты";
    case "district":
      return "Районы";
    case "microdistrict":
      return "Микрорайоны";
    case "street":
      return "Улицы";
    default:
      return level;
  }
}

function getCategoryLabelData(item: SettlementData): string {
  return item.name ?? "—";
}

const breadcrumbs = computed(() => {
  const currentIndex = drillLevels.indexOf(appliedFilters.groupBy as (typeof drillLevels)[number]);
  return drillLevels
    .slice(0, currentIndex + 1)
    .filter((level, idx) => {
      return appliedFilters[level] || idx === currentIndex;
    })
    .map(level => ({
      level,
      label: appliedFilters[level] || getLevelLabel(level),
      isCurrent: level === appliedFilters.groupBy,
    }));
});

function handleChartClick(params: any) {
  if (!params || params.componentType !== "series") return;
  const seriesIndex = params.seriesIndex;
  if (seriesIndex == null) return;
  const seriesItem = chartOption.value.series[seriesIndex];
  const gridIndex = seriesItem?.xAxisIndex ?? 0;
  if (gridIndex !== 0) return;
  if (!params.name) return;
  drillDown(params.name);
}

const {
  data: settlementsData,
  pending: loadingSettlements,
  error: settlementsError,
  refresh: refreshSettlementsData,
} = await useAsyncData<SettlementData[]>("group-stats", async () => {
  const response = await $api("/analysis/group-stats", {
    params: {
      group_by: appliedFilters.groupBy,
      settlement_type_names: appliedFilters.settlementTypes.length > 0 ? appliedFilters.settlementTypes : undefined,
      is_new_house: appliedFilters.is_new_house,
      region_name: appliedFilters.region || undefined,
      municipality_name: appliedFilters.municipality || undefined,
      settlement_name: appliedFilters.settlement || undefined,
      district_name: appliedFilters.district || undefined,
      microdistrict_name: appliedFilters.microdistrict || undefined,
    },
  });
  return response;
});

const {
  data: OneObjectData,
  pending: loadingOneObject,
  error: OneObjectError,
  refresh: refreshOneObjectData,
} = await useAsyncData<OneObjectStats>("stats", async () => {
  return $api("/analysis/stats", {
    params: {
      settlement_type_names: appliedFilters.settlementTypes.length > 0 ? appliedFilters.settlementTypes : undefined,
      region_name: appliedFilters.region || undefined,
      municipality_name: appliedFilters.municipality || undefined,
      settlement_name: appliedFilters.settlement || undefined,
      district_name: appliedFilters.district || undefined,
      microdistrict_name: appliedFilters.microdistrict || undefined,
      is_new_house: appliedFilters.is_new_house,
    },
  });
});

const {
  data: viewsHistoryData,
  pending: loadingViewsHistory,
  error: viewsHistoryError,
  refresh: refreshViewsHistoryData,
} = await useAsyncData<ViewsHistoryData>("views-history", async () => {
  return $api("/analysis/last-10-days-views-history", {
    params: {
      settlement_type_names: appliedFilters.settlementTypes.length > 0 ? appliedFilters.settlementTypes : undefined,
      region_name: appliedFilters.region || undefined,
      municipality_name: appliedFilters.municipality || undefined,
      settlement_name: appliedFilters.settlement || undefined,
      district_name: appliedFilters.district || undefined,
      microdistrict_name: appliedFilters.microdistrict || undefined,
      is_new_house: appliedFilters.is_new_house,
    },
  });
});

const {
  data: priceHistoryData,
  pending: loadingPriceHistory,
  error: priceHistoryError,
  refresh: refreshPriceHistoryData,
} = await useAsyncData<PriceHistory[]>("price-history", async () => {
  return $api("/analysis/avg-price-history", {
    params: {
      settlement_type_names: appliedFilters.settlementTypes.length > 0 ? appliedFilters.settlementTypes : undefined,
      region_name: appliedFilters.region || undefined,
      municipality_name: appliedFilters.municipality || undefined,
      settlement_name: appliedFilters.settlement || undefined,
      district_name: appliedFilters.district || undefined,
      microdistrict_name: appliedFilters.microdistrict || undefined,
      is_new_house: appliedFilters.is_new_house,
    },
  });
});

function getPieCenters(count: number): string[][] {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const centers: string[][] = [];
  const xStep = 100 / cols;
  const yStep = 100 / rows;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const idx = row * cols + col;
      if (idx >= count) break;
      centers.push([`${(col + 0.5) * xStep}%`, `${(row + 0.5) * yStep}%`]);
    }
  }
  return centers;
}

function getPieRadius(count: number): string {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const maxRadiusX = (100 / cols / 2) * 0.9;
  const maxRadiusY = (100 / rows / 2) * 0.9;
  return `${Math.min(maxRadiusX, maxRadiusY)}%`;
}

function getVerticalPieCentersPx(count: number): {center: [string, number]; titleTop: number}[] {
  return Array.from({length: count}, (_, idx) => {
    const blockTop = CHART_TOP_START + idx * CHART_BLOCK_HEIGHT;
    const centerY = blockTop + CHART_TITLE_HEIGHT + 8 + CHART_GRID_HEIGHT / 1.5;
    return {
      center: ["50%", centerY],
      titleTop: blockTop,
    };
  });
}

function wrapText(text, maxLength = 40) {
  const words = text.split(" ");
  let line = "";
  let result = "";
  for (const word of words) {
    if ((line + word).length > maxLength) {
      result += line.trim() + "\n";
      line = "";
    }
    line += word + " ";
  }
  return result + line.trim();
}

const propertyTypesPieOption = computed(() => {
  const chartsData = [
    {
      label: buildLabelWithoutGroupBy(appliedFilters),
      data: OneObjectData.value?.statistics.property_types ?? {},
    },
    ...comparisons.value
      .filter(c => c.stats)
      .map(c => ({
        label: c.labelWithoutGroup,
        data: c.stats.statistics.property_types,
      })),
  ];

  const layout = getVerticalPieCentersPx(chartsData.length);
  const radius = isMobile.value ? 75 : 90;

  const titles = chartsData.map((chart, idx) => ({
    text: isMobile.value ? wrapText(chart.label, 40) : chart.label,
    left: "50%",
    top: layout[idx].titleTop,
    textAlign: "center",
    textStyle: {
      fontSize: 13,
      fontWeight: 500,
      color: "#111827",
    },
  }));

  const series = chartsData.map((chart, idx) => ({
    name: chart.label,
    type: "pie",
    radius,
    center: layout[idx].center,
    data: Object.entries(chart.data).map(([name, value]) => ({
      name,
      value,
    })),
  }));

  return {
    title: [
      {
        text: "Типы недвижимости",
        left: "center",
        top: 20,
      },
      ...titles,
    ],
    tooltip: {trigger: "item"},
    label: {formatter: "{d}%"},
    legend: {},
    series,
  };
});

const apartmentsByRoomsPieOption = computed(() => {
  const chartsData = [
    {
      label: buildLabelWithoutGroupBy(appliedFilters),
      data: OneObjectData.value?.statistics.apartments_by_rooms.rooms ?? {},
    },
    ...comparisons.value
      .filter(c => c.stats)
      .map(c => ({
        label: c.labelWithoutGroup,
        data: c.stats.statistics.apartments_by_rooms.rooms,
      })),
  ];

  const layout = getVerticalPieCentersPx(chartsData.length);
  const radius = isMobile.value ? 75 : 90;

  const titles = chartsData.map((chart, idx) => ({
    text: isMobile.value ? wrapText(chart.label, 40) : chart.label,
    left: "50%",
    top: layout[idx].titleTop,
    textAlign: "center",
    textStyle: {
      fontSize: 13,
      fontWeight: 500,
      color: "#111827",
    },
  }));

  const series = chartsData.map((chart, idx) => ({
    name: chart.label,
    type: "pie",
    radius,
    center: layout[idx].center,
    data: Object.entries(chart.data).map(([name, value]) => ({
      name: name.replace("_rooms", " к.").replace("studio", "Студия").replace("open_plan", "Свободная планировка"),
      value,
    })),
  }));

  return {
    title: [
      {
        text: "Квартиры по комнатам",
        left: "center",
        top: 20,
      },
      ...titles,
    ],
    tooltip: {trigger: "item"},
    label: {formatter: "{d}%"},
    legend: {},
    series,
  };
});

const flatTypePieOption = computed(() => {
  const chartsData = [
    {
      label: buildLabelWithoutGroupBy(appliedFilters),
      data: {
        Новостройки: OneObjectData.value?.statistics.apartments_by_rooms.flat_type.new_houses ?? 0,
        Вторичка: OneObjectData.value?.statistics.apartments_by_rooms.flat_type.secondary ?? 0,
      },
    },
    ...comparisons.value
      .filter(c => c.stats)
      .map(c => ({
        label: c.labelWithoutGroup,
        data: {
          Новостройки: c.stats.statistics.apartments_by_rooms.flat_type.new_houses,
          Вторичка: c.stats.statistics.apartments_by_rooms.flat_type.secondary,
        },
      })),
  ];

  const layout = getVerticalPieCentersPx(chartsData.length);
  const outerRadius = isMobile.value ? 60 : 90;

  const titles = chartsData.map((chart, idx) => ({
    text: isMobile.value ? wrapText(chart.label, 40) : chart.label,
    left: "50%",
    top: layout[idx].titleTop,
    textAlign: "center",
    textStyle: {
      fontSize: 13,
      fontWeight: 500,
      color: "#111827",
    },
  }));

  const series = chartsData.map((chart, idx) => ({
    name: chart.label,
    type: "pie",
    radius: isMobile.value ? [`35%`, `${outerRadius}px`] : [`25%`, `${outerRadius}px`],
    center: layout[idx].center,
    data: Object.entries(chart.data).map(([name, value]) => ({name, value})),
  }));

  return {
    title: [
      {
        text: "Новостройки и вторичка",
        left: "center",
        top: 20,
      },
      ...titles,
    ],
    tooltip: {trigger: "item"},
    label: {formatter: "{d}%"},
    legend: {},
    series,
  };
});

function buildSeriesForFilters(filtersSnapshot: typeof appliedFilters, settlements: SettlementData[], stackId: string): any[] {
  switch (filtersSnapshot.chartType) {
    case "priceCategories":
      return [
        {
          name: "Дешёвые",
          type: "bar",
          stack: stackId,
          data: settlements.map(i => i.price_categories.cheap),
          itemStyle: {color: "#00e396"},
        },
        {
          name: "Средние",
          type: "bar",
          stack: stackId,
          data: settlements.map(i => i.price_categories.normal),
          itemStyle: {color: "#008ffb"},
        },
        {
          name: "Дорогие",
          type: "bar",
          stack: stackId,
          data: settlements.map(i => i.price_categories.expensive),
          itemStyle: {color: "#ff4560"},
        },
      ];
    case "familyCategories":
      return [
        {
          name: "Низкая",
          type: "bar",
          stack: stackId,
          data: settlements.map(i => i.family_categories.low),
          itemStyle: {color: "#fb2c36"},
        },
        {
          name: "Средняя",
          type: "bar",
          stack: stackId,
          data: settlements.map(i => i.family_categories.medium),
          itemStyle: {color: "#f0b100"},
        },
        {
          name: "Высокая",
          type: "bar",
          stack: stackId,
          data: settlements.map(i => i.family_categories.high),
          itemStyle: {color: "#00c950"},
        },
      ];
    case "elderlyCategories":
      return [
        {
          name: "Низкая",
          type: "bar",
          stack: stackId,
          data: settlements.map(i => i.elderly_categories.low),
          itemStyle: {color: "#fb2c36"},
        },
        {
          name: "Средняя",
          type: "bar",
          stack: stackId,
          data: settlements.map(i => i.elderly_categories.medium),
          itemStyle: {color: "#f0b100"},
        },
        {
          name: "Высокая",
          type: "bar",
          stack: stackId,
          data: settlements.map(i => i.elderly_categories.high),
          itemStyle: {color: "#00c950"},
        },
      ];
    case "transportAccessCategories":
      return [
        {
          name: "Низкая",
          type: "bar",
          stack: stackId,
          data: settlements.map(i => i.transport_access_categories.low),
          itemStyle: {color: "#fb2c36"},
        },
        {
          name: "Средняя",
          type: "bar",
          stack: stackId,
          data: settlements.map(i => i.transport_access_categories.medium),
          itemStyle: {color: "#f0b100"},
        },
        {
          name: "Высокая",
          type: "bar",
          stack: stackId,
          data: settlements.map(i => i.transport_access_categories.high),
          itemStyle: {color: "#00c950"},
        },
      ];
    case "avgPricePerMeter":
      return [
        {
          name: "Средняя цена за м²",
          type: "bar",
          data: settlements.map(i => i.averages.average_price_per_square_meter),
        },
      ];
    case "avgDailyViewsCount":
      return [
        {
          name: "Среднее число просмотров",
          type: "bar",
          data: settlements.map(i => i.averages.average_views_count),
        },
      ];
    case "areaBoxplot":
      return [
        {
          name: "Площадь (м²)",
          type: "boxplot",
          data: settlements.map(i => [
            i.area_boxplot?.min ?? 0,
            i.area_boxplot?.q1 ?? 0,
            i.area_boxplot?.median ?? 0,
            i.area_boxplot?.q3 ?? 0,
            i.area_boxplot?.max ?? 0,
          ]),
        },
      ];
    case "priceBoxplot":
      return [
        {
          name: "Цена",
          type: "boxplot",
          data: settlements.map(i => [
            i.price_boxplot?.min ?? 0,
            i.price_boxplot?.q1 ?? 0,
            i.price_boxplot?.median ?? 0,
            i.price_boxplot?.q3 ?? 0,
            i.price_boxplot?.max ?? 0,
          ]),
        },
      ];
    default:
      return [
        {
          name: "Количество объектов",
          type: "bar",
          data: settlements.map(i => i.offers_count),
        },
      ];
  }
}

const chartMainTitle = computed(() => {
  return chartTypeOptions.value.find(o => o.value === appliedFilters.chartType)?.label ?? "";
});

const chartContainerHeight = computed(() => {
  return CHART_TOP_START + comparisons.value.length * CHART_BLOCK_HEIGHT + 400;
});

const chartInitOptions = computed(() => ({
  height: chartContainerHeight.value,
}));

const pieChartInitOptions = computed(() => ({
  height: chartContainerHeight.value,
}));

const CHART_BLOCK_HEIGHT = isMobile.value ? 320 : 380;
const CHART_TITLE_HEIGHT = 50;
const CHART_GRID_HEIGHT = 160;
const CHART_TOP_START = 50;

const chartOption = computed(() => {
  const grids: any[] = [];
  const xAxes: any[] = [];
  const yAxes: any[] = [];
  const series: any[] = [];
  const titles: any[] = [];
  const graphics: any[] = [];

  titles.push({
    text: isMobile.value ? wrapText(chartMainTitle.value, 40) : chartMainTitle.value,
    left: "center",
    top: 20,
    textStyle: {
      fontSize: 16,
      fontWeight: 600,
      color: "#111827",
    },
  });
  const allGraphs = [
    {
      settlements: settlementsData.value ?? [],
      filters: appliedFilters,
      label: appliedFiltersLabel.value,
    },
    ...comparisons.value.map(c => ({
      settlements: c.settlementsData ?? [], // ← исправлено
      filters: {...c.filters, chartType: appliedFilters.chartType},
      label: c.label,
    })),
  ];

  allGraphs.forEach((graph, idx) => {
    const blockTop = CHART_TOP_START + idx * CHART_BLOCK_HEIGHT;

    if (graph.label) {
      titles.push({
        text: isMobile.value ? wrapText(graph.label, 40) : graph.label,
        left: "50%",
        top: blockTop,
        textAlign: "center",
        textStyle: {
          fontSize: 13,
          fontWeight: 500,
          color: "#111827",
        },
      });

      if (idx > 0) {
        const comparisonId = comparisons.value[idx - 1].id;
        graphics.push({
          type: "text",
          left: "95%",
          top: blockTop,
          style: {
            text: "✕",
            fontSize: 14,
            fontWeight: 600,
            fill: "#ef4444",
            cursor: "pointer",
          },
          onclick: () => removeComparison(comparisonId),
        });
      }
    }

    const gridTop = blockTop + CHART_TITLE_HEIGHT + 8;
    grids.push({
      top: gridTop,
      left: 80,
      right: 40,
      height: CHART_GRID_HEIGHT,
    });

    xAxes.push({
      type: "category",
      gridIndex: idx,
      data: graph.settlements.map(i => getCategoryLabelData(i)),
      axisLabel: {rotate: 30},
      boundaryGap: true,
    });

    yAxes.push({
      type: "value",
      gridIndex: idx,
    });

    series.push(
      ...buildSeriesForFilters({...graph.filters, chartType: appliedFilters.chartType}, graph.settlements, `stack-${idx}`).map(s => ({
        ...s,
        xAxisIndex: idx,
        yAxisIndex: idx,
        name: idx === 0 ? s.name : `${s.name} · ${graph.label}`,
        cursor: idx === 0 ? "pointer" : "default",
      })),
    );
  });

  const dataZoom = allGraphs.map((_, idx) => ({
    type: "inside",
    xAxisIndex: idx,
    zoomOnMouseWheel: true,
    moveOnMouseMove: true,
    preventDefaultMouseMove: true,
  }));

  return {
    title: titles,
    graphic: graphics,
    tooltip: {
      trigger: "axis",
      axisPointer: {type: "shadow"},
    },
    legend: {},
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series,
    dataZoom,
  };
});

const selectedFilterType = ref("");

const autocompleteResults = reactive({
  region: [],
  municipality: [],
  settlement: [],
  district: [],
  microdistrict: [],
});

const {data: autocompleteData, refresh: refreshAutocomplete} = await useAsyncData(
  "autocomplete-filterss",
  async () =>
    $api("/offers/autocomplete-filters", {
      params: {
        q: draftFilters[selectedFilterType.value],
        type: selectedFilterType.value,
      },
    }),
  {immediate: false},
);

async function applyFilters() {
  viewsHistoryData.value = undefined;
  settlementsData.value = undefined;
  OneObjectData.value = undefined;
  priceHistoryData.value = undefined;

  appliedFilters.groupBy = draftFilters.groupBy;
  appliedFilters.region = draftFilters.region;
  appliedFilters.municipality = draftFilters.municipality;
  appliedFilters.settlement = draftFilters.settlement;
  appliedFilters.district = draftFilters.district;
  appliedFilters.microdistrict = draftFilters.microdistrict;
  appliedFilters.settlementTypes = [...draftFilters.settlementTypes];
  appliedFilters.is_new_house = draftFilters.is_new_house;

  refreshSettlementsData();
  refreshOneObjectData();
  refreshPriceHistoryData();
  refreshViewsHistoryData();

  Object.values(autocompleteResults).forEach(arr => arr.splice(0));
}

function handleInputChange(type: AutocompleteField, value: string) {
  const trimmed = value.trim();
  draftFilters[type] = trimmed;
  if (trimmed) {
    selectedFilterType.value = type;
    refreshAutocomplete();
  } else {
    autocompleteResults[type] = [];
  }
}

watchEffect(() => {
  if (autocompleteData.value) {
    switch (selectedFilterType.value) {
      case "region":
        autocompleteResults.region = autocompleteData.value;
        break;
      case "municipality":
        autocompleteResults.municipality = autocompleteData.value;
        break;
      case "settlement":
        autocompleteResults.settlement = autocompleteData.value;
        break;
      case "district":
        autocompleteResults.district = autocompleteData.value;
        break;
      case "microdistrict":
        autocompleteResults.microdistrict = autocompleteData.value;
        break;
    }
  }
});

const visibleInputs = computed(() => {
  switch (draftFilters.groupBy) {
    case "region":
      return [];
    case "municipality":
      return ["region"];
    case "settlement":
      return ["region", "municipality"];
    case "district":
      return ["region", "municipality", "settlement"];
    case "microdistrict":
      return ["region", "municipality", "settlement", "district"];
    case "street":
      return ["region", "municipality", "settlement", "district", "microdistrict"];
    default:
      return [];
  }
});

watch(
  () => draftFilters.groupBy,
  newGroupBy => {
    const visible = visibleInputs.value;
    ["region", "municipality", "settlement", "district", "microdistrict"].forEach(level => {
      if (!visible.includes(level)) draftFilters[level] = "";
    });
  },
);

function handleClickOutside() {
  Object.keys(autocompleteResults).forEach(key => {
    autocompleteResults[key] = [];
  });
}

function selectResult(type: AutocompleteField, item: string) {
  draftFilters[type] = item;
  Object.values(autocompleteResults).forEach(arr => arr.splice(0));
}
</script>

<style scoped>
@reference "tailwindcss";
@reference "@nuxt/ui";

.stat-card {
  @apply ring ring-default flex flex-col items-center rounded-lg p-3 md:p-4 px-4 md:px-20 text-lg text-nowrap md:text-2xl;
}

.stat-card span {
  @apply font-bold;
}

.stat-card h3 {
  @apply text-muted;
}

.stat-card-info {
  @apply flex mt-1.5 gap-2 md:items-center;
}

.stat-card-info span {
  @apply flex items-center gap-2;
}

@media (max-width: 640px) {
  .stat-card {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  :deep(.u-radio-group) {
    font-size: 0.875rem;
  }

  :deep(.u-checkbox) {
    font-size: 0.875rem;
  }
}

@media (max-width: 768px) {
  .stat-card {
    min-height: 80px;
  }

  :deep(.echarts) {
    min-height: 300px !important;
  }
}
</style>
