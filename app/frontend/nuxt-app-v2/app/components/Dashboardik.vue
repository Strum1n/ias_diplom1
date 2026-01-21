<template>
  <div>
    <div v-if="settlementsError">Ошибка загрузки данных</div>

    <!-- Селект для типа графика -->
    <USelect v-model="chartType" :items="chartOptionsList" class="mb-4" placeholder="Тип графика" />

    <!-- Селект для уровня группировки -->
    <USelect v-model="groupBy" :items="groupByOptions" class="mb-4" placeholder="Тип графика" />

    <!-- График будет отображаться только когда данные загружены -->
    <VChart v-if="!loadingSettlements && isChartReady" :option="chartOption" autoresize style="height: 400px; width: 100%" />
    <div v-else>Загрузка...</div>
  </div>
</template>

<script setup lang="ts">
import type { SelectItem } from "@nuxt/ui";
interface SettlementData {
  region?: { id: number; name: string };
  settlement?: { id: number; name: string };
  district?: { id: number; name: string };
  microdistrict?: { id: number; name: string };
  street?: { id: number; name: string };
  total_offers_count: number;
  avg_price: number | null;
  avg_price_per_square_meter?: number | null;
  property_counts: Array<{ property_type_id: number; property_type_name: string; count: number }>;
  apartments_summary: {
    new_houses_count: number;
    secondary_houses_count: number;
    rooms: { studio: number; "1": number; "2": number; "3": number; "4": number; "5_plus": number };
  };
  price_categories: { cheap: number; normal: number; expensive: number };
  last_ten_days_views_count: number;
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

const { $api } = useNuxtApp();

const chartType = ref("offers");

const chartOptionsList = ref<SelectItem[]>([
  { label: "Количество сделок", value: "offers" },
  { label: "Категории цен", value: "priceCategories" },
  { label: "Средняя цена за м²", value: "avgPricePerMeter" },
  { label: "Просмотры за 10 дней", value: "views10days" },
  { label: "Boxplot по площади", value: "areaBoxplot" },
  { label: "Boxplot по цене", value: "priceBoxplot" },
]);

const groupByOptions = ref([
  { label: "Районы", value: "district" },
  { label: "Поселения", value: "settlement" },
  { label: "Области", value: "region" },
]);

const groupBy = ref("district");

const categories = computed(
  () =>
    settlementsData.value?.map((item) => {
      switch (groupBy.value) {
        case "settlement":
          return item.settlement?.name ?? "Без названия";
        case "district":
          return item.district?.name ?? "Без названия";
        case "region":
          return item.region?.name ?? "Без названия";
        default:
          return item.region?.name ?? "Без названия";
      }
    }) ?? []
);

/* ----------------- состояние ----------------- */
const isAlt = ref(false);
const isChartReady = ref(false);

/* ----------------- данные ----------------- */
const {
  data: settlementsData,
  pending: loadingSettlements,
  error: settlementsError,
  refresh: refreshData,
} = await useAsyncData<SettlementData[]>(
  "sas_kek",
  () =>
    $api("/analysis/offers_count_by_property_type", {
      params: { group_by: groupBy.value }, // Используем динамически выбранный параметр
    }),
  {
    watch: [groupBy],
  }
);

/* ----------------- option для echarts ----------------- */
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
  switch (chartType.value) {
    case "priceCategories":
      return "Категории цен";
    case "avgPricePerMeter":
      return "Средняя цена за м²";
    case "views10days":
      return "Просмотры за 10 дней";
    default:
      return "Количество сделок";
  }
});

watchEffect(() => {
  isChartReady.value = !!settlementsData.value?.length;
});

const colorPalette = ["#FF5733", "#33FF57", "#3357FF", "#F2E205", "#9C27B0", "#FFC107"];

function offersSeries() {
  return [
    {
      name: "Количество сделок",
      type: "bar",
      data: settlementsData.value?.map((i) => i.total_offers_count) ?? [],
      itemStyle: {
        color: function (params: any) {
          return colorPalette[params.dataIndex % colorPalette.length]; // Цикличное применение цветов
        },
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
      itemStyle: {
        color: "#00e396", // Цвет для дешёвых
      },
    },
    {
      name: "Средние",
      type: "bar",
      stack: "price",
      data: settlementsData.value?.map((i) => i.price_categories.normal) ?? [],
      itemStyle: {
        color: "#008ffb", // Цвет для средних
      },
    },
    {
      name: "Дорогие",
      type: "bar",
      stack: "price",
      data: settlementsData.value?.map((i) => i.price_categories.expensive) ?? [],
      itemStyle: {
        color: "#ff4560", // Цвет для дорогих
      },
    },
  ];
}

function avgPricePerMeterSeries() {
  return [
    {
      name: "Средняя цена за м²",
      type: "bar",
      data: settlementsData.value?.map((i) => i.avg_price_per_square_meter ?? 0) ?? [],
    },
  ];
}

function views10daysSeries() {
  return [
    {
      name: "Просмотры за 10 дней",
      type: "bar",
      data: settlementsData.value?.map((i) => i.last_ten_days_views_count) ?? [],
    },
  ];
}

function areaBoxplotSeries() {
  return [
    {
      name: "Площадь (кв. м)",
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
  switch (chartType.value) {
    case "priceCategories":
      return priceCategoriesSeries();
    case "avgPricePerMeter":
      return avgPricePerMeterSeries();
    case "views10days":
      return views10daysSeries();
    case "areaBoxplot":
      return areaBoxplotSeries();
    case "priceBoxplot":
      return priceBoxplotSeries();
    default:
      return offersSeries();
  }
});
</script>
