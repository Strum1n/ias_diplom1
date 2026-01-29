<template>
  <USelect
    v-model="appliedFilters.chartType"
    :items="[
      { label: 'Количество объектов', value: 'offers' },
      { label: 'Категории цен', value: 'priceCategories' },
      { label: 'Средняя цена за м²', value: 'avgPricePerMeter' },
      { label: 'Среднее кол-во просмотров за день', value: 'avgDailyViewsCount' },
      { label: 'Boxplot по площади', value: 'areaBoxplot' },
      { label: 'Boxplot по цене', value: 'priceBoxplot' },
    ]"
    placeholder="Тип графика"
    class="w-fit" />
  <URadioGroup
    class="mt-2"
    v-model="draftFilters.is_new_house"
    :items="[
      { label: 'Все', value: undefined },
      { label: 'Новостройки', value: true },
      { label: 'Вторичка', value: false },
    ]" />

  <UCheckboxGroup
    v-model="draftFilters.settlementTypes"
    :items="[
      { label: 'Город', value: 'город' },
      { label: 'Деревня', value: 'деревня' },
      { label: 'Посёлок', value: 'поселок' },
      { label: 'Село', value: 'село' },
    ]"
    class="mb-4 mt-2" />

  <UButton color="primary" variant="solid" class="h-10" @click="applyFilters"> Применить фильтры </UButton>

  <VChart :option="priceCategoriesChartOption" :init-options="{ height: 400 }" autoresize />
  <VChart v-if="!loadingPriceHistory" :option="priceHistoryChartOption" :init-options="{ height: 400 }" autoresize />
</template>
<script setup lang="ts">
async function applyFilters() {
  appliedFilters.groupBy = draftFilters.groupBy;

  appliedFilters.settlementTypes = [...draftFilters.settlementTypes];
  appliedFilters.is_new_house = draftFilters.is_new_house;

  refreshPriceHistoryData();
  refreshSettlementsData();
}

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
interface PriceHistory {
  date: string;
  avg_price: number | null;
}
const draftFilters = reactive({
  groupBy: "region",
  settlementTypes: [] as string[],
  is_new_house: undefined,
});

const appliedFilters = reactive({
  is_new_house: undefined,
  groupBy: "region",
  chartType: "offers",
  settlementTypes: [] as string[],
});

const { $api } = useNuxtApp();
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
    },
  });

  return response.results;
});

const {
  data: priceHistoryData,
  pending: loadingPriceHistory,
  error: priceHistoryError,
  refresh: refreshPriceHistoryData,
} = await useAsyncData<PriceHistory[]>("price-history", async () => {
  const response = $api("/analysis/average-prices-history", {
    params: {
      settlement_type_names: appliedFilters.settlementTypes.length > 0 ? appliedFilters.settlementTypes : undefined,

      is_new_house: appliedFilters.is_new_house,
    },
  });

  return response;
});

const priceCategoriesChartOption = computed(() => {
  if (!settlementsData.value) return {};

  const labels = settlementsData.value.map((item) => item.settlement || item.district || item.microdistrict || item.region || "—");

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: ["Дешёвые", "Средние", "Дорогие"],
    },
    grid: {
      left: 40,
      right: 20,
      bottom: 80,
      top: 40,
    },
    xAxis: {
      type: "category",
      data: labels,
      axisLabel: {
        rotate: 30,
        interval: 0,
      },
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Дешёвые",
        type: "bar",
        stack: "price",
        data: settlementsData.value.map((i) => i.price_categories.cheap),
      },
      {
        name: "Средние",
        type: "bar",
        stack: "price",
        data: settlementsData.value.map((i) => i.price_categories.normal),
      },
      {
        name: "Дорогие",
        type: "bar",
        stack: "price",
        data: settlementsData.value.map((i) => i.price_categories.expensive),
      },
    ],
  };
});

const priceHistoryChartOption = computed(() => {
  if (!priceHistoryData.value) return {};

  return {
    tooltip: {
      trigger: "axis",
    },
    grid: {
      left: 40,
      right: 20,
      bottom: 40,
      top: 40,
    },
    xAxis: {
      type: "category",
      data: priceHistoryData.value.map((i) => i.date),
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (v: number) => `${Math.round(v / 1000)}k`,
      },
    },
    series: [
      {
        name: "Средняя цена",
        type: "line",
        smooth: true,
        showSymbol: false,
        data: priceHistoryData.value.map((i) => i.avg_price),
      },
    ],
  };
});
</script>
