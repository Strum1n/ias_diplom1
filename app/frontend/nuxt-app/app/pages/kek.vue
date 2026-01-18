<template>
  <div class="p-6 min-h-screen">
    <div class="flex gap-4">
      <div class="rounded-lg ring ring-default p-4 w-full md:w-1/2">
        <VChart v-if="!loadingPriceHistory && priceHistoryDataReady" :option="priceHistoryChartOption" autoresize style="height: 400px; width: 100%" />
        <div v-else class="text-gray-500 text-center py-20">Загрузка истории цен...</div>
      </div>

      <div class="rounded-lg ring ring-default p-4 w-full md:w-1/2">
        <VChart v-if="!loadingViewsHistory && viewsHistoryDataReady" :option="viewsHistoryChartOption" autoresize style="height: 400px; width: 100%" />
        <div v-else class="text-gray-500 text-center py-20">Загрузка истории просмотров...</div>
      </div>
    </div>
    <!-- Чекбоксы типов поселений -->

    <!-- Селекты -->

    <div class="rounded-lg ring mt-8 p-5 ring-default">
      <div class="flex flex-wrap gap-4 mb-5">
        <USelect v-model="appliedFilters.chartType" :items="chartOptionsList" placeholder="Тип графика" class="w-64" />
        <USelect v-model="appliedFilters.groupBy" :items="groupByOptions" placeholder="Группировка" class="w-64" />
      </div>
      <div class="flex flex-wrap gap-4 mb-5">
        <div class="relative">
          <UInput v-model="draftFilters.region" placeholder="Регион" @input="handleInputChange('region')" />
          <ul
            v-click-outside="handleClickOutside"
            v-if="autocompleteResults.region.length > 0 && autocompleteResults.region[0] != draftFilters.region"
            class="w-64 absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
            <li v-for="(item, index) in autocompleteResults.region" :key="index" @click="selectResult('region', item)" class="px-3 py-2 hover:bg-blue-100 cursor-pointer">
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="relative">
          <UInput v-model="draftFilters.settlement" placeholder="Поселение" @input="handleInputChange('settlement')" />
          <ul
            v-click-outside="handleClickOutside"
            v-if="autocompleteResults.settlement.length > 0 && autocompleteResults.settlement[0] != draftFilters.settlement"
            class="absolute rounded-sm ring-1 ring-[var(--ui-border)] max-h-50 overflow-auto z-10 bg-white w-full mt-1 text-sm">
            <li
              v-for="(item, index) in autocompleteResults.settlement"
              :key="index"
              @click="selectResult('settlement', item)"
              class="px-3 py-2 cursor-pointer bg-white border-b border-[var(--ui-border-muted)] px-3 py-2 hover:bg-[var(--ui-color-neutral-100)">
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="relative">
          <UInput v-model="draftFilters.district" placeholder="Район" @input="handleInputChange('district')" />
          <ul
            v-click-outside="handleClickOutside"
            v-if="autocompleteResults.district.length > 0 && autocompleteResults.district[0] != draftFilters.district"
            class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
            <li v-for="(item, index) in autocompleteResults.district" :key="index" @click="selectResult('district', item)" class="px-3 py-2 hover:bg-blue-100 cursor-pointer">
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="relative">
          <UInput v-model="draftFilters.microdistrict" placeholder="Микрорайон" @input="handleInputChange('microdistrict')" />
          <ul
            v-click-outside="handleClickOutside"
            v-if="autocompleteResults.microdistrict.length > 0 && autocompleteResults.microdistrict[0] != draftFilters.microdistrict"
            class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
            <li
              v-for="(item, index) in autocompleteResults.microdistrict"
              :key="index"
              @click="selectResult('microdistrict', item)"
              class="px-3 py-2 hover:bg-blue-100 cursor-pointer">
              {{ item }}
            </li>
          </ul>
        </div>
        <UCheckboxGroup v-model="appliedFilters.settlementTypes" :items="settlementTypeOptions" orientation="horizontal" class="mb-4" />
      </div>
    </div>
    <!-- График -->
    <div class="bg-white rounded-md shadow p-4">
      <VChart v-if="!loadingSettlements && isChartReady" :option="chartOption" autoresize style="height: 400px; width: 100%" />
      <div v-else class="text-gray-500 text-center py-20">Загрузка...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SettlementData {
  region?: string;
  settlement?: string;
  district?: string;
  microdistrict?: string;
  street?: string;

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

interface ViewsHistoryData {
  date: string;
  views: number;
}

interface PriceHistory {
  date: string;
  avg_price: number | null;
}

type AutocompleteField = "region" | "settlement" | "district" | "microdistrict";

const draftFilters = reactive<Record<AutocompleteField, string>>({
  region: "",
  settlement: "",
  district: "",
  microdistrict: "",
});

const appliedFilters = reactive({
  groupBy: "region",
  chartType: "offers",
  settlementTypes: [] as string[],

  region: "",
  settlement: "",
  district: "",
  microdistrict: "",
});

const chartOptionsList = ref([
  { label: "Количество сделок", value: "offers" },
  { label: "Категории цен", value: "priceCategories" },
  { label: "Средняя цена за м²", value: "avgPricePerMeter" },
  { label: "Среднее кол-во просмотров за день", value: "avgDailyViewsCount" },
  { label: "Boxplot по площади", value: "areaBoxplot" },
  { label: "Boxplot по цене", value: "priceBoxplot" },
]);

const groupByOptions = ref([
  { label: "Области", value: "region" },
  { label: "Поселения", value: "settlement" },
  { label: "Районы", value: "district" },
  { label: "Микрорайоны", value: "microdistrict" },
  { label: "Улицы", value: "street" },
]);

const settlementTypeOptions = [
  { label: "Город", value: "город" },
  { label: "Деревня", value: "деревня" },
  { label: "Посёлок", value: "поселок" },
  { label: "Село", value: "село" },
];

const categories = computed(
  () =>
    settlementsData.value?.map((item, index) => {
      switch (appliedFilters.groupBy) {
        case "region":
          return item.region ?? `Регион ${index + 1}`;
        case "settlement":
          return item.settlement ?? `Поселение ${index + 1}`;
        case "district":
          return item.district ?? `Район ${index + 1}`;
        case "microdistrict":
          return item.microdistrict ?? `Микрорайон ${index + 1}`;
        case "street":
          return item.street ?? `Улица ${index + 1}`;
        default:
          return `Группа ${index + 1}`;
      }
    }) ?? [],
);

const isChartReady = ref(false);

const { $api } = useNuxtApp();

const {
  data: settlementsData,
  pending: loadingSettlements,
  error: settlementsError,
} = await useAsyncData<SettlementData[]>(
  "group-stats",
  async () => {
    const response = await $api("/analysis/group-stats", {
      params: {
        group_by: appliedFilters.groupBy,
        settlement_type_names: appliedFilters.settlementTypes.length > 0 ? appliedFilters.settlementTypes : undefined,

        region: appliedFilters.region || undefined,
        settlement: appliedFilters.settlement || undefined,
        district: appliedFilters.district || undefined,
        microdistrict: appliedFilters.microdistrict || undefined,
      },
    });

    return response.results;
  },
  {
    watch: [appliedFilters],
    deep: true,
  },
);

const {
  data: viewsHistoryData,
  pending: loadingViewsHistory,
  error: viewsHistoryError,
} = await useAsyncData<ViewsHistoryData>(
  "views-history",
  async () => {
    const response = await $api("/analysis/last-10-days-views-history", {
      params: {
        settlement_type_names: appliedFilters.settlementTypes.length > 0 ? appliedFilters.settlementTypes : undefined,
        region_name: appliedFilters.region || undefined,
        settlement_name: appliedFilters.settlement || undefined,
        district_name: appliedFilters.district || undefined,
        microdistrict_name: appliedFilters.microdistrict || undefined,
      },
    });

    return response;
  },
  {
    watch: [
      toRef(appliedFilters, "settlement"),
      toRef(appliedFilters, "region"),
      toRef(appliedFilters, "district"),
      toRef(appliedFilters, "microdistrict"),
      toRef(appliedFilters, "settlementTypes"),
    ],
  },
);

const {
  data: priceHistoryData,
  pending: loadingPriceHistory,
  error: priceHistoryError,
  refresh: loadPriceHistoryData,
} = useAsyncData<PriceHistory[]>(
  "price-history",
  async () => {
    const response = await $api("/analysis/average-prices-history", {
      params: {
        settlement_type_names: appliedFilters.settlementTypes.length > 0 ? appliedFilters.settlementTypes : undefined,
        region_name: appliedFilters.region || undefined,
        settlement_name: appliedFilters.settlement || undefined,
        district_name: appliedFilters.district || undefined,
        microdistrict_name: appliedFilters.microdistrict || undefined,
      },
    });

    return response;
  },
  {
    watch: [
      toRef(appliedFilters, "settlement"),
      toRef(appliedFilters, "region"),
      toRef(appliedFilters, "district"),
      toRef(appliedFilters, "microdistrict"),
      toRef(appliedFilters, "settlementTypes"),
    ],
  },
);

const viewsHistoryDataReady = computed(() => !!viewsHistoryData.value?.length);

const viewsHistoryChartOption = computed(() => ({
  title: {
    text: "История просмотров за последние 10 дней",
    left: "center",
  },
  tooltip: {
    trigger: "axis",
  },
  xAxis: {
    type: "category",
    data: viewsHistoryData.value?.map((item) => item.date) ?? [],
  },
  yAxis: {
    type: "value",
    name: "Просмотры",
  },
  series: [
    {
      name: "Просмотры",
      type: "line",
      data: viewsHistoryData.value?.map((item) => item.views) ?? [],
      smooth: true,
    },
  ],
  grid: {
    left: 40,
    right: 20,
    bottom: 60,
    containLabel: true,
  },
  dataZoom: [
    {
      type: "inside",
      start: 0,
      end: 100,
    },
  ],
}));

const priceHistoryDataReady = computed(() => !!priceHistoryData.value?.length);

const priceHistoryChartOption = computed(() => ({
  title: {
    text: "История цен за последние 10 дней",
    left: "center",
  },
  tooltip: {
    trigger: "axis",
  },
  xAxis: {
    type: "category",
    data: priceHistoryData.value?.map((item) => item.date) ?? [],
  },
  yAxis: {
    type: "value",
    name: "Средняя цена",
  },
  series: [
    {
      name: "Средняя цена",
      type: "line",
      data: priceHistoryData.value?.map((item) => item.avg_price) ?? [],
      smooth: true,
      itemStyle: {
        color: "#FF5733",
      },
      lineStyle: {
        width: 3,
      },
    },
  ],
  grid: {
    left: 40,
    right: 20,
    bottom: 60,
    containLabel: true,
  },
  dataZoom: [
    {
      type: "inside",
      start: 0,
      end: 100,
    },
  ],
}));

const chartOption = computed(() => ({
  title: {
    text: titleText.value,
    left: "center",
  },
  tooltip: {
    trigger: "axis",
  },
  legend: {
    top: 30,
  },
  grid: {
    left: 40,
    right: 20,
    bottom: 60,
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: categories.value,
    axisLabel: {
      rotate: 30,
    },
  },
  yAxis: {
    type: "value",
  },
  series: series.value,
  dataZoom: [
    {
      type: "inside",
      show: true,
      xAxisIndex: [0],
      start: 0,
      end: 100,
      handleSize: "8%",
    },
  ],
}));

const titleText = computed(() => {
  switch (appliedFilters.chartType) {
    case "priceCategories":
      return "Категории цен";
    case "avgPricePerMeter":
      return "Средняя цена за м²";
    case "avgDailyViewsCount":
      return "Среднее кол-во просмотров за день";
    default:
      return "Количество сделок";
  }
});

const selectedFilterType = ref("");

const autocompleteResults = reactive({
  region: [],
  settlement: [],
  district: [],
  microdistrict: [],
});

const { data: autocompleteData, refresh: refreshAutocomplete } = await useAsyncData(
  "autocomplete-filterss",
  () =>
    $api("/offers/autocomplete-filters", {
      params: {
        query: draftFilters[selectedFilterType.value],
        type: selectedFilterType.value,
      },
    }),
  { immediate: false },
);

function handleInputChange(type: AutocompleteField) {
  const value = draftFilters[type].trim();
  draftFilters[type] = value;

  if (value) {
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
        autocompleteResults.region = autocompleteData.value.results;
        break;
      case "settlement":
        autocompleteResults.settlement = autocompleteData.value.results;
        break;
      case "district":
        autocompleteResults.district = autocompleteData.value.results;
        break;
      case "microdistrict":
        autocompleteResults.microdistrict = autocompleteData.value.results;
        break;
    }
  }
});

function handleClickOutside() {
  Object.keys(autocompleteResults).forEach((key) => {
    autocompleteResults[key] = [];
  });
  console.log(autocompleteResults);
}

function selectResult(type: AutocompleteField, item: string) {
  draftFilters[type] = item;

  appliedFilters[type] = item; // 🔥 вот тут график обновится

  Object.values(autocompleteResults).forEach((arr) => arr.splice(0));
}

watchEffect(() => {
  isChartReady.value = !!settlementsData.value?.length;
});

const colorPalette = ["#FF5733", "#33FF57", "#3357FF", "#F2E205", "#9C27B0", "#FFC107"];

function offersSeries() {
  return [
    {
      name: "Количество предложений",
      type: "bar",
      data: settlementsData.value?.map((i) => i.offers_count) ?? [],
      itemStyle: {
        color: (params: any) => colorPalette[params.dataIndex % colorPalette.length],
      },
    },
  ];
}
function priceCategoriesSeries() {
  return [
    {
      name: "Дешёвые",
      type: "bar",
      stack: "price",
      data: settlementsData.value?.map((i) => i.price_categories.cheap) ?? [],
      itemStyle: { color: "#00e396" },
    },
    {
      name: "Средние",
      type: "bar",
      stack: "price",
      data: settlementsData.value?.map((i) => i.price_categories.normal) ?? [],
      itemStyle: { color: "#008ffb" },
    },
    {
      name: "Дорогие",
      type: "bar",
      stack: "price",
      data: settlementsData.value?.map((i) => i.price_categories.expensive) ?? [],
      itemStyle: { color: "#ff4560" },
    },
  ];
}

function avgPricePerMeterSeries() {
  return [
    {
      name: "Средняя цена за м²",
      type: "bar",
      data: settlementsData.value?.map((i) => i.averages.average_price_per_square_meter) ?? [],
    },
  ];
}

function avgDailyViewsCountSeries() {
  return [
    {
      name: "Среднее число просмотров",
      type: "bar",
      data: settlementsData.value?.map((i) => i.averages.average_views_count) ?? [],
    },
  ];
}

function areaBoxplotSeries() {
  return [
    {
      name: "Площадь (м²)",
      type: "boxplot",
      data:
        settlementsData.value?.map((item) => [
          item.area_boxplot?.min ?? 0,
          item.area_boxplot?.q1 ?? 0,
          item.area_boxplot?.median ?? 0,
          item.area_boxplot?.q3 ?? 0,
          item.area_boxplot?.max ?? 0,
        ]) ?? [],
    },
  ];
}

function priceBoxplotSeries() {
  return [
    {
      name: "Цена",
      type: "boxplot",
      data:
        settlementsData.value?.map((item) => [
          item.price_boxplot?.min ?? 0,
          item.price_boxplot?.q1 ?? 0,
          item.price_boxplot?.median ?? 0,
          item.price_boxplot?.q3 ?? 0,
          item.price_boxplot?.max ?? 0,
        ]) ?? [],
    },
  ];
}

const series = computed(() => {
  switch (appliedFilters.chartType) {
    case "priceCategories":
      return priceCategoriesSeries();
    case "avgPricePerMeter":
      return avgPricePerMeterSeries();
    case "avgDailyViewsCount":
      return avgDailyViewsCountSeries();
    case "areaBoxplot":
      return areaBoxplotSeries();
    case "priceBoxplot":
      return priceBoxplotSeries();
    default:
      return offersSeries();
  }
});
</script>
