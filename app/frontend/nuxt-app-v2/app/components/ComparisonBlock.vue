<template>
  <div class="rounded-lg ring ring-default p-5 flex flex-col gap-6 bg-white">
    <!-- Заголовок -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-bold">Сравнение</h3>
        <p class="text-sm text-gray-500">
          {{ snapshot.filters.groupBy }}
          <span v-if="snapshot.filters.region"> / {{ snapshot.filters.region }}</span>
          <span v-if="snapshot.filters.settlement"> / {{ snapshot.filters.settlement }}</span>
          <span v-if="snapshot.filters.district"> / {{ snapshot.filters.district }}</span>
          <span v-if="snapshot.filters.microdistrict"> / {{ snapshot.filters.microdistrict }}</span>
        </p>
      </div>

      <UButton color="red" variant="ghost" icon="i-heroicons-trash" @click="$emit('remove')"> Удалить </UButton>
    </div>

    <!-- Статистика -->
    <div class="flex gap-4 justify-between">
      <div class="stat-card">
        <h3>Всего объектов</h3>
        <div class="stat-card-info">
          <UIcon class="size-8" name="iconify i-ic:round-maps-home-work" />
          <span>{{ snapshot.oneObjectData?.total_count }}</span>
        </div>
      </div>

      <div class="stat-card">
        <h3>Средняя цена</h3>
        <div class="stat-card-info">
          <UIcon class="size-8" name="solar:money-bag-bold" />
          <span>{{ snapshot.oneObjectData?.statistics.averages.average_price }} ₽</span>
        </div>
      </div>

      <div class="stat-card">
        <h3>Средняя площадь</h3>
        <div class="stat-card-info">
          <UIcon class="size-8" name="bx:area" />
          <span>{{ snapshot.oneObjectData?.statistics.averages.average_area }}</span>
        </div>
      </div>

      <div class="stat-card">
        <h3>Новых сегодня</h3>
        <div class="stat-card-info">
          <UIcon class="size-8" name="material-symbols:fiber-new" />
          <span>{{ snapshot.oneObjectData?.offers_today }}</span>
        </div>
      </div>
    </div>

    <!-- Истории -->
    <div class="flex gap-4">
      <div class="rounded-lg ring ring-default p-4 w-1/2">
        <VChart v-if="priceHistoryChartOption" :option="priceHistoryChartOption" autoresize style="height: 350px" />
      </div>

      <div class="rounded-lg ring ring-default p-4 w-1/2">
        <VChart v-if="viewsHistoryChartOption" :option="viewsHistoryChartOption" autoresize style="height: 350px" />
      </div>
    </div>

    <!-- Основной график -->
    <div class="rounded-lg ring ring-default p-4">
      <VChart v-if="chartOption" :option="chartOption" autoresize style="height: 400px" />
    </div>

    <!-- Pie charts -->
    <div class="flex gap-4">
      <VChart class="ring rounded-lg ring-default p-2 w-1/3" v-if="propertyTypesPieOption" :option="propertyTypesPieOption" autoresize style="height: 320px" />

      <VChart class="ring rounded-lg ring-default p-2 w-1/3" v-if="apartmentsByRoomsPieOption" :option="apartmentsByRoomsPieOption" autoresize style="height: 320px" />

      <VChart class="ring rounded-lg ring-default p-2 w-1/3" v-if="flatTypePieOption" :option="flatTypePieOption" autoresize style="height: 320px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

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

    price_categories: {
      cheap: number;
      normal: number;
      expensive: number;
    };

    property_types: Record<string, number>;

    apartments_by_rooms: {
      rooms: Record<string, number>;
    };

    flat_type: {
      new_houses: number;
      secondary: number;
    };
  };
}

interface PriceHistory {
  date: string;
  avg_price: number | null;
}

interface ViewsHistoryData {
  date: string;
  views: number;
}

interface ComparisonSnapshot {
  id: string;
  filters: {
    groupBy: string;
    chartType: string;
    region: string;
    settlement: string;
    district: string;
    microdistrict: string;
    settlementTypes: string[];
    is_new_house?: boolean;
  };
  settlementsData: SettlementData[];
  oneObjectData: OneObjectStats | null;
  priceHistoryData: PriceHistory[];
  viewsHistoryData: ViewsHistoryData[];
}

const props = defineProps<{
  snapshot: ComparisonSnapshot;
}>();

defineEmits<{
  (e: "remove"): void;
}>();

/* ------------------ Categories ------------------ */

const categories = computed(() =>
  props.snapshot.settlementsData.map((item, index) => {
    switch (props.snapshot.filters.groupBy) {
      case "region":
        return item.region ?? `Область ${index + 1}`;
      case "settlement":
        return item.settlement ?? `НП ${index + 1}`;
      case "district":
        return item.district ?? `Район ${index + 1}`;
      case "microdistrict":
        return item.microdistrict ?? `Мкр ${index + 1}`;
      case "street":
        return item.street ?? `Улица ${index + 1}`;
      default:
        return `Группа ${index + 1}`;
    }
  }),
);

/* ------------------ Colors ------------------ */

const colorPalette = ["#FF5733", "#33FF57", "#3357FF", "#F2E205", "#9C27B0", "#FFC107"];

/* ------------------ Series ------------------ */

function offersSeries() {
  return [
    {
      name: "Количество предложений",
      type: "bar",
      data: props.snapshot.settlementsData.map((i) => i.offers_count),
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
      data: props.snapshot.settlementsData.map((i) => i.price_categories.cheap),
      itemStyle: { color: "#00e396" },
    },
    {
      name: "Средние",
      type: "bar",
      stack: "price",
      data: props.snapshot.settlementsData.map((i) => i.price_categories.normal),
      itemStyle: { color: "#008ffb" },
    },
    {
      name: "Дорогие",
      type: "bar",
      stack: "price",
      data: props.snapshot.settlementsData.map((i) => i.price_categories.expensive),
      itemStyle: { color: "#ff4560" },
    },
  ];
}

function avgPricePerMeterSeries() {
  return [
    {
      name: "Средняя цена за м²",
      type: "bar",
      data: props.snapshot.settlementsData.map((i) => i.averages.average_price_per_square_meter),
      itemStyle: {
        color: (params: any) => colorPalette[params.dataIndex % colorPalette.length],
      },
    },
  ];
}

function avgDailyViewsCountSeries() {
  return [
    {
      name: "Среднее число просмотров",
      type: "bar",
      data: props.snapshot.settlementsData.map((i) => i.averages.average_views_count),
      itemStyle: {
        color: (params: any) => colorPalette[params.dataIndex % colorPalette.length],
      },
    },
  ];
}

function areaBoxplotSeries() {
  return [
    {
      name: "Площадь (м²)",
      type: "boxplot",
      data: props.snapshot.settlementsData.map((i) => [
        i.area_boxplot?.min ?? 0,
        i.area_boxplot?.q1 ?? 0,
        i.area_boxplot?.median ?? 0,
        i.area_boxplot?.q3 ?? 0,
        i.area_boxplot?.max ?? 0,
      ]),
    },
  ];
}

function priceBoxplotSeries() {
  return [
    {
      name: "Цена",
      type: "boxplot",
      data: props.snapshot.settlementsData.map((i) => [
        i.price_boxplot?.min ?? 0,
        i.price_boxplot?.q1 ?? 0,
        i.price_boxplot?.median ?? 0,
        i.price_boxplot?.q3 ?? 0,
        i.price_boxplot?.max ?? 0,
      ]),
    },
  ];
}

const series = computed(() => {
  switch (props.snapshot.filters.chartType) {
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

/* ------------------ Chart Options ------------------ */

const chartOption = computed(() => ({
  tooltip: { trigger: "axis" },
  grid: { left: 40, right: 20, bottom: 60, top: 40 },
  xAxis: {
    type: "category",
    data: categories.value,
    axisLabel: { rotate: 30 },
  },
  yAxis: { type: "value" },
  series: series.value,
}));

/* ------------------ History Charts ------------------ */

const priceHistoryChartOption = computed(() => ({
  title: { text: "История цен", left: "center" },
  tooltip: { trigger: "axis" },
  xAxis: {
    type: "category",
    data: props.snapshot.priceHistoryData.map((i) => i.date),
  },
  yAxis: { type: "value" },
  series: [
    {
      type: "line",
      data: props.snapshot.priceHistoryData.map((i) => i.avg_price),
      smooth: true,
    },
  ],
}));

const viewsHistoryChartOption = computed(() => ({
  title: { text: "История просмотров", left: "center" },
  tooltip: { trigger: "axis" },
  xAxis: {
    type: "category",
    data: props.snapshot.viewsHistoryData.map((i) => i.date),
  },
  yAxis: { type: "value" },
  series: [
    {
      type: "line",
      data: props.snapshot.viewsHistoryData.map((i) => i.views),
      smooth: true,
    },
  ],
}));

/* ------------------ Pie charts ------------------ */

const propertyTypesPieOption = computed(() => {
  const data = props.snapshot.oneObjectData?.statistics.property_types ?? {};
  return {
    title: { text: "Типы недвижимости", left: "center" },
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: "60%",
        data: Object.entries(data).map(([name, value]) => ({ name, value })),
      },
    ],
  };
});

const apartmentsByRoomsPieOption = computed(() => {
  const data = props.snapshot.oneObjectData?.statistics.apartments_by_rooms.rooms ?? {};
  return {
    title: { text: "Квартиры по комнатам", left: "center" },
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["35%", "65%"],
        data: Object.entries(data).map(([name, value]) => ({
          name: name.replace("_rooms", " к.").replace("studio", "Студия").replace("open_plan", "Свободная планировка"),
          value,
        })),
      },
    ],
  };
});

const flatTypePieOption = computed(() => {
  const data = props.snapshot.oneObjectData?.statistics.flat_type ?? {
    new_houses: 0,
    secondary: 0,
  };

  return {
    title: { text: "Новостройки vs Вторичка", left: "center" },
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: [
          { name: "Новостройки", value: data.new_houses },
          { name: "Вторичка", value: data.secondary },
        ],
      },
    ],
  };
});
</script>
<style scoped></style>
