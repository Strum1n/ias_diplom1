<template>
  <div class="p-5 min-h-screen">
    <div class="rounded-lg ring p-5 pb-0 ring-default flex gap-4">
      <USelect
        v-model="draftFilters.groupBy"
        :items="[
          { label: 'Области', value: 'region' },
          { label: 'Поселения', value: 'settlement' },
          { label: 'Районы', value: 'district' },
          { label: 'Микрорайоны', value: 'microdistrict' },
          { label: 'Улицы', value: 'street' },
        ]"
        placeholder="Группировка"
        class="w-40 h-8" />
      <div v-if="visibleInputs.includes('region')" class="relative">
        <UInput v-model="draftFilters.region" placeholder="Область" @update:model-value="(v) => handleInputChange('region', v)" />
        <ul
          v-click-outside="handleClickOutside"
          v-if="autocompleteResults.region.length > 0 && autocompleteResults.region[0] != draftFilters.region"
          class="w-64 absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
          <li v-for="(item, index) in autocompleteResults.region" :key="index" @click="selectResult('region', item)" class="px-3 py-2 hover:bg-blue-100 cursor-pointer">
            {{ item }}
          </li>
        </ul>
      </div>

      <div v-if="visibleInputs.includes('settlement')" class="relative">
        <UInput v-model="draftFilters.settlement" placeholder="Населённый пункт" @update:model-value="(v) => handleInputChange('settlement', v)" />
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

      <div v-if="visibleInputs.includes('district')" class="relative">
        <UInput v-model="draftFilters.district" placeholder="Район" @update:model-value="(v) => handleInputChange('district', v)" />
        <ul
          v-click-outside="handleClickOutside"
          v-if="autocompleteResults.district.length > 0 && autocompleteResults.district[0] != draftFilters.district"
          class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
          <li v-for="(item, index) in autocompleteResults.district" :key="index" @click="selectResult('district', item)" class="px-3 py-2 hover:bg-blue-100 cursor-pointer">
            {{ item }}
          </li>
        </ul>
      </div>

      <div v-if="visibleInputs.includes('microdistrict')" class="relative">
        <UInput v-model="draftFilters.microdistrict" placeholder="Микрорайон" @update:model-value="(v) => handleInputChange('microdistrict', v)" />
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
      <div>
        <span class="font-[550]">Тип населенного пункта</span>
        <UCheckboxGroup
          v-model="draftFilters.settlementTypes"
          :items="[
            { label: 'Город', value: 'город' },
            { label: 'Деревня', value: 'деревня' },
            { label: 'Посёлок', value: 'поселок' },
            { label: 'Село', value: 'село' },
          ]"
          class="mb-4 mt-2" />
      </div>
      <div>
        <span class="font-[550]">Тип квартиры</span>
        <URadioGroup
          class="mt-2"
          v-model="draftFilters.is_new_house"
          :items="[
            { label: 'Все', value: undefined },
            { label: 'Новостройки', value: true },
            { label: 'Вторичка', value: false },
          ]" />
      </div>
      <UButton color="primary" variant="solid" class="h-10" @click="applyFilters"> Применить фильтры </UButton>
      <UButton color="info" icon="i-material-symbols:add-ad-rounded" variant="soft" class="h-10" @click="addComparison"> Добавить к сравнению </UButton>
      <UButton color="error" variant="soft" icon="i-f7:clear-fill" class="h-10" @click="comparisons = []"> Очистить сравнение </UButton>
    </div>

    <div class="flex py-5 gap-4.5 justify-between">
      <div class="stat-card">
        <h3>Всего объектов</h3>
        <div v-if="loadingOneObject">
          <USkeleton class="h-20 w-150" />
        </div>
        <div v-else class="stat-card-info">
          <UIcon class="size-8" name=""> </UIcon> <span>{{ OneObjectData?.total_count }}</span>
        </div>
      </div>
      <div class="stat-card">
        <h3>Средняя цена</h3>
        <div v-if="loadingOneObject">🔄</div>
        <div class="stat-card-info">
          <UIcon class="size-8" name="solar:money-bag-bold"> </UIcon> <span>{{ OneObjectData?.statistics.averages.average_price }} ₽</span>
        </div>
      </div>
      <div class="stat-card">
        <h3>Средняя площадь</h3>
        <div v-if="loadingOneObject">🔄</div>
        <div class="stat-card-info">
          <UIcon class="size-8" name="bx:area"> </UIcon> <span>{{ OneObjectData?.statistics.averages.average_area }}</span>
        </div>
      </div>

      <div class="stat-card">
        <h3>Новых сегодня</h3>
        <div v-if="loadingOneObject">🔄</div>
        <div class="stat-card-info">
          <UIcon class="size-8" name="material-symbols:fiber-new"> </UIcon> <span>{{ OneObjectData?.offers_today }}</span>
        </div>
      </div>
    </div>

    <div class="flex gap-4">
      <div class="rounded-lg ring ring-default p-4 w-full md:w-1/2">
        <VChartFull :option="priceHistoryChartOption" :init-options="{ height: 400 }" autoresize />
        <!-- <div v-else class="text-gray-500 text-center py-20">Загрузка истории цен...</div> -->
      </div>

      <div class="rounded-lg ring ring-default p-4 w-full md:w-1/2">
        <VChartFull :option="viewsHistoryChartOption" autoresize :init-options="{ height: 400 }" />
        <!-- 
        <div v-else class="text-gray-500 text-center py-20">Загрузка истории просмотров...</div> -->
      </div>
    </div>

    <div class="flex mt-5 gap-4 flex-row justify-between">
      <div class="w-[73%] flex flex-col gap-4">
        <div class="ring ring-default rounded-lg p-4">
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
          <div class="relative mt-4">
            {{ chartContainerHeight }}

            {{ loadingSettlements }}
            <UButton v-if="canDrillUp" icon="i-heroicons-arrow-left" color="neutral" variant="soft" @click="drillUp"> Назад </UButton>

            <VChartFull :option="chartOption" autoresize :init-options="{ height: 500 }" @click="handleChartClick" />
            <!-- <div v-else-if="loadingSettlements">Загрузка...</div> -->
            <div v-if="!loadingSettlements && settlementsData?.length === 0" class="text-center top-50 left-144 absolute text-gray-400 mt-2">
              Нет данных для выбранного уровня
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <h3 class="text-xl font-[550]">Популярные объявления</h3>
          <div
            v-for="offer in OneObjectData?.top_offers_by_views"
            :key="offer.id"
            class="ring ring-[#f8fafc] rounded-lg h-fit p-0! bg-[#f8fafc] cursor-pointer hover:bg-[#e9eef4] hover:ring-[#e9eef4] transition-all"
            @click="openOffer(offer)">
            <div class="flex h-fit">
              <div class="relative">
                <img v-if="offer.images_urls?.length" :src="offer.images_urls[0]" class="object-cover rounded-lg w-60 h-31" />
                <div v-else class="h-33 w-51 flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="size-10 text-gray-400 text-2xl" />
                </div>
                <UBadge v-if="offer.is_new_house == true" color="info" variant="solid" class="absolute top-3 left-2"> Новостройка </UBadge>
              </div>
              <div class="pl-4 flex justify-between w-full">
                <div class="relative py-3">
                  <div class="flex flex-col gap-1">
                    <h3 class="font-bold text-base">
                      {{ offer.title || "Без названия" }}
                    </h3>
                    <div class="text-base">
                      <UIcon name="tabler:map-pin" class="size-4" />
                      {{ offer.address?.full_address }}
                    </div>
                  </div>

                  <span class="text-sm absolute bottom-4"
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
                <div class="flex flex-col items-end p-3 gap-1">
                  <div class="flex gap-2">
                    <UBadge v-if="offer.price_category" :color="getCategoryColor(offer.price_category)" variant="solid" class="category-badge">
                      {{ getCategoryLabel(offer.price_category) }}
                    </UBadge>
                    <span class="font-bold">{{ formatPrice(offer.price) }}</span>
                  </div>
                  <div class="text-xs">{{ formatPrice(offer.price_per_square_meter) }}/м²</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex grow flex-col gap-4">
        <VChartFull class="ring rounded-lg ring-[var(--ui-border)] p-2" v-if="OneObjectData" :option="propertyTypesPieOption" autoresize :init-options="{ height: 400 }" />

        <VChartFull class="ring rounded-lg ring-[var(--ui-border)] p-2" v-if="OneObjectData" :option="apartmentsByRoomsPieOption" autoresize :init-options="{ height: 400 }" />
        <VChartFull class="ring rounded-lg ring-[var(--ui-border)] p-2" v-if="OneObjectData" :option="flatTypePieOption" autoresize :init-options="{ height: 400 }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getCategoryColor } = useCategoryColor();
const { getCategoryLabel } = useCategoryLabel();
const { formatPrice } = usePriceFormat();

const chartContainerHeight = computed(() => {
  const totalGraphs = 1 + comparisons.value.length;
  return Math.max(400, chartTopOffset + totalGraphs * (chartGridHeight + chartGap));
});
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

interface TopOffer {
  id: number;
  title?: string;
  url: string;
  price: number;
  price_per_square: number;
  is_new_house: number;
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
    };

    flat_type: {
      new_houses: number;
      secondary: number;
    };
  };
  top_offers_by_views: TopOffer[];
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

interface ComparisonItem {
  id: number;
  label: string;
  filters: typeof appliedFilters;
  priceHistory: PriceHistory[];
  viewsHistory: ViewsHistoryData[];
  settlementsData: SettlementData[];
  stats: OneObjectStats;
}
const comparisons = ref<ComparisonItem[]>([]);
let comparisonId = 0;

async function addComparison() {
  const filtersSnapshot = JSON.parse(JSON.stringify(draftFilters));

  const [priceHistory, viewsHistory, settlements, one_stats] = await Promise.all([
    $api("/analysis/average-prices-history", { params: buildParams(filtersSnapshot) }),
    $api("/analysis/last-10-days-views-history", { params: buildParams(filtersSnapshot) }),
    $api("/analysis/group-stats", { params: { ...buildParams(filtersSnapshot), group_by: appliedFilters.groupBy } }),
    $api("/analysis/stats", { params: buildParams(filtersSnapshot) }),
  ]);
  draftFilters.region = "";
  draftFilters.settlement = "";
  draftFilters.region = "";
  draftFilters.microdistrict = "";

  comparisons.value.push({
    id: ++comparisonId,
    label: buildLabel(filtersSnapshot),
    filters: filtersSnapshot,
    priceHistory,
    viewsHistory,
    settlementsData: settlements.results,
    stats: one_stats,
  });
}

const priceHistoryChartOption = computed(() => {
  const series = [
    {
      name: "Текущий выбор",
      type: "line",
      smooth: true,
      showSymbol: false,
      data: priceHistoryData.value?.map((i) => i.avg_price),
    },
    ...comparisons.value.map((c) => ({
      name: c.label,
      type: "line",
      smooth: true,
      showSymbol: false,
      data: c.priceHistory.map((i) => i.avg_price),
    })),
  ];

  const xAxisData = priceHistoryData.value?.map((i) => new Date(i.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })) ?? [];

  return {
    title: {
      text: "История средней цены",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      valueFormatter: (v: number) => (v ? `${v.toLocaleString()} ₽` : "—"),
    },
    legend: {},
    grid: {
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (v: number) => `${v / 1000}k`,
      },
    },
    series,
  };
});

const viewsHistoryChartOption = computed(() => {
  const series = [
    {
      name: "Текущий выбор",
      type: "line",
      smooth: true,
      showSymbol: false,
      data: viewsHistoryData.value?.map((i) => i.views),
    },
    ...comparisons.value.map((c) => ({
      name: c.label,
      type: "line",
      smooth: true,
      showSymbol: false,
      data: c.viewsHistory.map((i) => i.views),
    })),
  ];

  const xAxisData = viewsHistoryData.value?.map((i) => new Date(i.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })) ?? [];

  return {
    title: {
      text: "История просмотров",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {},
    grid: {
      left: 40,
      right: 20,
      bottom: 40,
      top: 80,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
    },
    yAxis: {
      type: "value",
    },
    series,
  };
});

function buildParams(filters: typeof appliedFilters) {
  return {
    settlement_type_names: filters.settlementTypes.length ? filters.settlementTypes : undefined,
    region_name: filters.region || undefined,
    settlement_name: filters.settlement || undefined,
    district_name: filters.district || undefined,
    microdistrict_name: filters.microdistrict || undefined,
    is_new_house: filters.is_new_house,
  };
}

function buildLabel(filters: typeof appliedFilters) {
  return [
    filters.region,
    filters.settlement,
    filters.district,
    filters.microdistrict,
    filters.is_new_house === true ? "Новостройки" : filters.is_new_house === false ? "Вторичка" : "Вся ",
  ]
    .filter(Boolean)
    .join(" / ");
}

const draftFilters = reactive<Record<AutocompleteField, string>>({
  groupBy: "region",
  region: "",
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
  settlement: "",
  district: "",
  microdistrict: "",
});

const { $api } = useNuxtApp();

const drillLevels = ["region", "settlement", "district", "microdistrict", "street"];

const openOffer = (offer) => {
  const router = useRouter();
  router.push(`/offers/${offer.id}`);
};

async function drillDown(categoryName: string) {
  const currentIndex = drillLevels.indexOf(appliedFilters.groupBy as (typeof drillLevels)[number]);
  console.log("Сработал дрилл даун");
  for (let i = currentIndex + 1; i < drillLevels.length; i++) {
    const nextLevel = drillLevels[i];

    appliedFilters.groupBy = nextLevel;

    drillLevels.slice(i + 1).forEach((level) => {
      appliedFilters[level] = "";
    });

    appliedFilters[drillLevels[currentIndex]] = categoryName;

    await refreshSettlementsData();

    if (settlementsData.value?.length && settlementsData.value.length > 0) {
      await refreshOneObjectData();
      await refreshPriceHistoryData();
      await refreshViewsHistoryData();
      return;
    }
  }

  console.log("Нет данных на следующих уровнях");
}
const canDrillUp = computed(() => {
  return appliedFilters.groupBy != "region";
});

async function drillUpTo(targetLevel: (typeof drillLevels)[number]) {
  const targetIndex = drillLevels.indexOf(targetLevel);
  if (targetIndex < 0) return;

  if (!appliedFilters[targetLevel]) {
    appliedFilters.groupBy = targetLevel;

    drillLevels.forEach((level, idx) => {
      if (idx > targetIndex) {
        appliedFilters[level] = "";
      }
    });

    await refreshSettlementsData();
    await refreshOneObjectData();
    await refreshPriceHistoryData();
    await refreshViewsHistoryData();
  }

  appliedFilters.groupBy = targetLevel;
  appliedFilters[targetLevel] = "";

  drillLevels.forEach((level, idx) => {
    if (idx > targetIndex) {
      appliedFilters[level] = "";
    }
  });

  await refreshSettlementsData();
  await refreshOneObjectData();
  await refreshPriceHistoryData();
  await refreshViewsHistoryData();
}

async function drillUp() {
  const currentIndex = drillLevels.indexOf(appliedFilters.groupBy as (typeof drillLevels)[number]);

  if (currentIndex <= 0) return;

  for (let i = currentIndex - 1; i >= 0; i--) {
    const level = drillLevels[i];

    appliedFilters.groupBy = level;

    appliedFilters[level] = "";

    drillLevels.forEach((l, idx) => {
      if (idx > i) {
        appliedFilters[l] = "";
      }
    });

    await refreshSettlementsData();

    if (settlementsData.value?.length) {
      await refreshOneObjectData();
      await refreshPriceHistoryData();
      await refreshViewsHistoryData();
      return;
    }
  }
}

function getLevelLabel(level: (typeof drillLevels)[number]) {
  switch (level) {
    case "region":
      return "Области";
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

function getCategoryLabelData(item: SettlementData, groupBy: keyof SettlementData): string {
  return item[groupBy] ?? "—";
}

const breadcrumbs = computed(() => {
  const currentIndex = drillLevels.indexOf(appliedFilters.groupBy as (typeof drillLevels)[number]);

  return drillLevels
    .slice(0, currentIndex + 1)
    .filter((level, idx) => {
      return appliedFilters[level] || idx === currentIndex;
    })
    .map((level) => ({
      level,
      label: appliedFilters[level] || getLevelLabel(level),
      isCurrent: level === appliedFilters.groupBy,
    }));
});

const breadcrumbsGraphic = computed(() => {
  let left = 20;

  return breadcrumbs.value.map((crumb, index) => {
    const width = crumb.label.length * 7 + 10;

    const graphicItem = {
      type: "text",
      left,
      top: 10,
      style: {
        text: crumb.label,
        fontSize: 12,
        fill: crumb.isCurrent ? "#111827" : "#2563eb",
        cursor: crumb.isCurrent ? "default" : "pointer",
      },
      onclick: crumb.isCurrent ? undefined : () => drillUpTo(crumb.level),
    };

    left += width;
    return graphicItem;
  });
});

function handleChartClick(params: any) {
  if (!params?.name || !params?.componentType) return;

  if (params.componentType === "graphic") return;

  if (params.componentType !== "series") return;

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
      settlement_name: appliedFilters.settlement || undefined,
      district_name: appliedFilters.district || undefined,
      microdistrict_name: appliedFilters.microdistrict || undefined,
    },
  });

  return response.results;
});

const {
  data: OneObjectData,
  pending: loadingOneObject,
  error: OneObjectError,
  refresh: refreshOneObjectData,
} = await useAsyncData<OneObjectStats>("stats", () => {
  return $api("/analysis/stats", {
    params: {
      settlement_type_names: appliedFilters.settlementTypes.length > 0 ? appliedFilters.settlementTypes : undefined,
      region_name: appliedFilters.region || undefined,
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
} = await useAsyncData<ViewsHistoryData>("views-history", () => {
  const response = $api("/analysis/last-10-days-views-history", {
    params: {
      settlement_type_names: appliedFilters.settlementTypes.length > 0 ? appliedFilters.settlementTypes : undefined,
      region_name: appliedFilters.region || undefined,
      settlement_name: appliedFilters.settlement || undefined,
      district_name: appliedFilters.district || undefined,
      microdistrict_name: appliedFilters.microdistrict || undefined,
      is_new_house: appliedFilters.is_new_house,
    },
  });

  return response;
});

const {
  data: priceHistoryData,
  pending: loadingPriceHistory,
  error: priceHistoryError,
  refresh: refreshPriceHistoryData,
} = await useAsyncData<PriceHistory[]>("price-history", () => {
  const response = $api("/analysis/average-prices-history", {
    params: {
      settlement_type_names: appliedFilters.settlementTypes.length > 0 ? appliedFilters.settlementTypes : undefined,
      region_name: appliedFilters.region || undefined,
      settlement_name: appliedFilters.settlement || undefined,
      district_name: appliedFilters.district || undefined,
      microdistrict_name: appliedFilters.microdistrict || undefined,
      is_new_house: appliedFilters.is_new_house,
    },
  });

  return response;
});

function getPieCenters(count: number): string[][] {
  const cols = Math.ceil(Math.sqrt(count)); // количество колонок
  const rows = Math.ceil(count / cols); // количество строк
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
  const maxRadiusX = (100 / cols / 2) * 0.9; // немного отступ
  const maxRadiusY = (100 / rows / 2) * 0.9;
  return `${Math.min(maxRadiusX, maxRadiusY)}%`;
}

const propertyTypesPieOption = computed(() => {
  const chartsData = [
    { label: "Текущий выбор", data: OneObjectData.value?.statistics.property_types ?? {} },
    ...comparisons.value.filter((c) => c.stats).map((c) => ({ label: c.label, data: c.stats.statistics.property_types })),
  ];

  const centers = getPieCenters(chartsData.length);
  const radius = getPieRadius(chartsData.length);

  const series = chartsData.map((chart, idx) => ({
    name: chart.label,
    type: "pie",
    radius,
    center: centers[idx],
    data: Object.entries(chart.data).map(([name, value]) => ({ name, value })),
    emphasis: {
      itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.3)" },
    },
  }));

  return {
    title: { text: "Типы недвижимости", left: "center" },
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0 },
    series,
  };
});

const apartmentsByRoomsPieOption = computed(() => {
  const chartsData = [
    {
      label: "Текущий выбор",
      data: OneObjectData.value?.statistics.apartments_by_rooms.rooms ?? {},
    },
    ...comparisons.value.filter((c) => c.stats).map((c) => ({ label: c.label, data: c.stats.statistics.apartments_by_rooms.rooms })),
  ];

  const centers = getPieCenters(chartsData.length);
  const radius = getPieRadius(chartsData.length);

  const series = chartsData.map((chart, idx) => ({
    name: chart.label,
    type: "pie",
    radius,
    center: centers[idx],
    data: Object.entries(chart.data).map(([name, value]) => ({
      name: name.replace("_rooms", " к.").replace("studio", "Студия").replace("open_plan", "Свободная планировка"),
      value,
    })),
    emphasis: {
      itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.3)" },
    },
  }));

  return {
    title: { text: "Квартиры по комнатам", left: "center" },
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0 },
    series,
  };
});

const flatTypePieOption = computed(() => {
  const chartsData = [
    {
      label: "Текущий выбор",
      data: {
        Новостройки: OneObjectData.value?.statistics.apartments_by_rooms.flat_type.new_houses ?? 0,
        Вторичка: OneObjectData.value?.statistics.apartments_by_rooms.flat_type.secondary ?? 0,
      },
    },
    ...comparisons.value
      .filter((c) => c.stats)
      .map((c) => ({
        label: c.label,
        data: {
          Новостройки: c.stats.statistics.apartments_by_rooms.flat_type.new_houses,
          Вторичка: c.stats.statistics.apartments_by_rooms.flat_type.secondary,
        },
      })),
  ];

  const centers = getPieCenters(chartsData.length);
  const radius = getPieRadius(chartsData.length);

  const series = chartsData.map((chart, idx) => ({
    name: chart.label,
    type: "pie",

    radius: [`25%`, radius], // внутренний радиус 40%, внешний как раньше
    center: centers[idx],
    data: Object.entries(chart.data).map(([name, value]) => ({ name, value })),
    emphasis: {
      itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.3)" },
    },
  }));

  return {
    title: { text: "Новостройки vs Вторичка", left: "center" },
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0 },
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
          data: settlements.map((i) => i.price_categories.cheap),
          itemStyle: { color: "#00e396" },
        },
        {
          name: "Средние",
          type: "bar",
          stack: stackId,
          data: settlements.map((i) => i.price_categories.normal),
          itemStyle: { color: "#008ffb" },
        },
        {
          name: "Дорогие",
          type: "bar",
          stack: stackId,
          data: settlements.map((i) => i.price_categories.expensive),
          itemStyle: { color: "#ff4560" },
        },
      ];
    case "avgPricePerMeter":
      return [
        {
          name: "Средняя цена за м²",
          type: "bar",
          data: settlements.map((i) => i.averages.average_price_per_square_meter),
        },
      ];
    case "avgDailyViewsCount":
      return [
        {
          name: "Среднее число просмотров",
          type: "bar",
          data: settlements.map((i) => i.averages.average_views_count),
        },
      ];
    case "areaBoxplot":
      return [
        {
          name: "Площадь (м²)",
          type: "boxplot",
          data: settlements.map((i) => [i.area_boxplot?.min ?? 0, i.area_boxplot?.q1 ?? 0, i.area_boxplot?.median ?? 0, i.area_boxplot?.q3 ?? 0, i.area_boxplot?.max ?? 0]),
        },
      ];
    case "priceBoxplot":
      return [
        {
          name: "Цена",
          type: "boxplot",
          data: settlements.map((i) => [
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
          data: settlements.map((i) => i.offers_count),
        },
      ];
  }
}

const chartGridHeight = 220;
const chartTopOffset = 40;
const chartGap = 100;

const chartOption = computed(() => {
  const grids: any[] = [];
  const xAxes: any[] = [];
  const yAxes: any[] = [];
  const series: any[] = [];

  const allGraphs = [
    { settlements: settlementsData.value, filters: appliedFilters },
    ...comparisons.value.map((c) => ({
      settlements: c.settlementsData,
      filters: { ...c.filters, chartType: appliedFilters.chartType },
      label: c.label,
    })),
  ];

  allGraphs.forEach((graph, idx) => {
    const top = chartTopOffset + idx * (chartGridHeight + chartGap);

    grids.push({
      top,
      left: 0,
      right: 40,
      height: chartGridHeight,
    });

    const categories = graph.settlements.map((i) => getCategoryLabelData(i, graph.filters.groupBy));

    xAxes.push({
      type: "category",
      gridIndex: idx,
      data: categories,
      axisLabel: {
        rotate: 30,
      },

      boundaryGap: true,
    });

    yAxes.push({
      type: "value",
      gridIndex: idx,
    });

    series.push(
      ...buildSeriesForFilters({ ...graph.filters, chartType: appliedFilters.chartType }, graph.settlements, `stack-${idx}`).map((s) => ({
        ...s,
        xAxisIndex: idx,
        yAxisIndex: idx,
        name: graph.label ? `${s.name} — ${graph.label}` : s.name,
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
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: { top: 0 },
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

async function applyFilters() {
  appliedFilters.groupBy = draftFilters.groupBy;

  appliedFilters.region = draftFilters.region;
  appliedFilters.settlement = draftFilters.settlement;
  appliedFilters.district = draftFilters.district;
  appliedFilters.microdistrict = draftFilters.microdistrict;
  appliedFilters.settlementTypes = [...draftFilters.settlementTypes];
  appliedFilters.is_new_house = draftFilters.is_new_house;

  await refreshSettlementsData();
  await refreshOneObjectData();
  await refreshPriceHistoryData();
  await refreshViewsHistoryData();

  Object.values(autocompleteResults).forEach((arr) => arr.splice(0));
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

const visibleInputs = computed(() => {
  switch (draftFilters.groupBy) {
    case "region":
      return [];
    case "settlement":
      return ["region"];
    case "district":
      return ["region", "settlement"];
    case "microdistrict":
      return ["region", "settlement", "district"];
    case "street":
      return ["region", "settlement", "district", "microdistrict"];
    default:
      return [];
  }
});

watch(
  () => draftFilters.groupBy,
  (newGroupBy) => {
    const visible = visibleInputs.value;

    ["region", "settlement", "district", "microdistrict"].forEach((level) => {
      if (!visible.includes(level)) {
        draftFilters[level] = "";
      }
    });
  },
);

function handleClickOutside() {
  Object.keys(autocompleteResults).forEach((key) => {
    autocompleteResults[key] = [];
  });
  console.log(autocompleteResults);
}

function selectResult(type: AutocompleteField, item: string) {
  draftFilters[type] = item;
  Object.values(autocompleteResults).forEach((arr) => arr.splice(0));
}

const colorPalette = ["#FF5733", "#33FF57", "#3357FF", "#F2E205", "#9C27B0", "#FFC107"];
</script>
<style scoped>
@reference "tailwindcss";
.stat-card {
  @apply ring ring-[var(--ui-border)] flex flex-col items-center rounded-lg p-4 px-20 text-2xl grow w-1/4;
}
.stat-card span {
  @apply font-bold;
}
.stat-card h3 {
  @apply text-[var(--ui-text-muted)];
}
.stat-card-info {
  @apply flex mt-1.5 justify-center items-center gap-2;
}
.stat-card-info span {
  @apply flex items-center  gap-2;
}
</style>
