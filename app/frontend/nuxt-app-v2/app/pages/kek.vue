<template>
  <div class="p-5 min-h-screen">
    <div class="rounded-lg ring p-5 pb-0 ring-default flex gap-4">
      <USelect
        v-model="draftFilters.groupBy"
        :items="[
          { label: 'Области', value: 'region' },
          { label: 'Муниципалитеты', value: 'municipality' },
          { label: 'Населённые пункты', value: 'settlement' },
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
      <div v-if="visibleInputs.includes('municipality')" class="relative">
        <UInput v-model="draftFilters.municipality" placeholder="Муниципалитет" @update:model-value="(v) => handleInputChange('municipality', v)" />
        <ul
          v-click-outside="handleClickOutside"
          v-if="autocompleteResults.municipality.length > 0 && autocompleteResults.municipality[0] != draftFilters.municipality"
          class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
          <li
            v-for="(item, index) in autocompleteResults.municipality"
            :key="index"
            @click="selectResult('municipality', item)"
            class="px-3 py-2 hover:bg-blue-100 cursor-pointer">
            {{ item }}
          </li>
        </ul>
      </div>
      <div v-if="visibleInputs.includes('settlement')" class="relative">
        <UInput v-model="draftFilters.settlement" placeholder="Населённый пункт" @update:model-value="(v) => handleInputChange('settlement', v)" />
        <ul
          v-click-outside="handleClickOutside"
          v-if="autocompleteResults.settlement.length > 0 && autocompleteResults.settlement[0] != draftFilters.settlement"
          class="absolute rounded-sm ring-1 ring-default max-h-50 overflow-auto z-10 bg-white w-full mt-1 text-sm">
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
        <span class="font-[550]">Вид недвижимости</span>
        <URadioGroup
          class="mt-2"
          v-model="draftFilters.is_new_house"
          :items="[
            { label: 'Все', value: undefined },
            { label: 'Новостройки', value: true },
            { label: 'Вторичка', value: false },
          ]" />
      </div>
      <UButton color="primary" variant="solid" class="h-fit p-2" @click="applyFilters"> Применить фильтры </UButton>
      <UButton color="info" icon="i-material-symbols:add-ad-rounded" variant="soft" class="h-fit p-2" @click="addComparison"> Добавить к сравнению </UButton>
      <UButton color="error" variant="soft" icon="i-f7:clear-fill" class="h-fit p-2" @click="comparisons = []"> Очистить сравнение </UButton>
    </div>
    <div
      v-if="appliedFilters.municipality || appliedFilters.region || appliedFilters.settlement || appliedFilters.district || appliedFilters.microdistrict"
      class="flex mt-5 items-center text-black font-semibold text-xl justify-center w-full">
      <UIcon name="tabler:filter" class="size-5" />
      <span>: {{ appliedFiltersLabel }}</span>
    </div>
    <div class="flex py-5 gap-4.5 justify-between">
      <div class="stat-card">
        <h3>Всего объектов</h3>

        <div v-if="loadingOneObject" class="stat-card-info">
          <UIcon class="size-8" name="ic:round-maps-home-work"> </UIcon> <span><UIcon class="size-8" name="codex:loader"></UIcon></span>
        </div>
        <div v-else class="stat-card-info">
          <UIcon class="size-8" name="ic:round-maps-home-work"> </UIcon> <span>{{ OneObjectData?.total_count }}</span>
        </div>
      </div>
      <div class="stat-card">
        <h3>Средняя цена</h3>
        <div v-if="loadingOneObject" class="stat-card-info">
          <UIcon class="size-8" name="solar:money-bag-bold"> </UIcon> <span><UIcon class="size-8" name="codex:loader"></UIcon></span>
        </div>
        <div v-else class="stat-card-info">
          <UIcon class="size-8" name="solar:money-bag-bold"> </UIcon> <span>{{ OneObjectData?.statistics.averages.average_price }} ₽</span>
        </div>
      </div>
      <div class="stat-card">
        <h3>Средняя площадь</h3>

        <div v-if="loadingOneObject" class="stat-card-info">
          <UIcon class="size-8" name="bx:area"> </UIcon> <span><UIcon class="size-8" name="codex:loader"></UIcon></span>
        </div>
        <div v-else class="stat-card-info">
          <UIcon class="size-8" name="bx:area"> </UIcon> <span>{{ OneObjectData?.statistics.averages.average_area }}</span>
        </div>
      </div>

      <div class="stat-card">
        <h3>Новых сегодня</h3>

        <div v-if="loadingOneObject" class="stat-card-info">
          <UIcon class="size-8" name="material-symbols:fiber-new"> </UIcon> <span><UIcon class="size-8" name="codex:loader"></UIcon></span>
        </div>
        <div v-else class="stat-card-info">
          <UIcon class="size-8" name="material-symbols:fiber-new"> </UIcon> <span>{{ OneObjectData?.offers_today }}</span>
        </div>
      </div>
    </div>

    <div class="flex gap-4">
      <div class="rounded-lg ring ring-default p-4 w-full md:w-1/2">
        <VChartFull v-if="priceHistoryData" :option="priceHistoryChartOption" :init-options="{ height: 400 }" autoresize />
        <div v-else class="flex h-full justify-center items-center"><UIcon size="70" name="codex:loader"></UIcon></div>
      </div>

      <div class="rounded-lg ring ring-default p-4 w-full md:w-1/2">
        <VChartFull v-if="viewsHistoryData" :option="viewsHistoryChartOption" autoresize :init-options="{ height: 400 }" />
        <div v-else class="flex h-full justify-center items-center"><UIcon size="70" name="codex:loader"></UIcon></div>
      </div>
    </div>

    <div class="flex mt-5 gap-4 flex-row justify-between">
      <div class="ring w-[75%] ring-default relative rounded-lg">
        <USelect v-model="appliedFilters.chartType" :items="chartTypeOptions" placeholder="Тип графика" class="w-fit z-10 absolute top-5 left-5" />
        <UButton v-if="canDrillUp" class="absolute top-20.5 z-10 left-12" icon="i-heroicons-arrow-left" color="neutral" variant="ghost" @click="drillUp"> Назад </UButton>
        <UButton
          v-if="canDrillUp && appliedFilters.groupBy != 'street'"
          class="absolute top-20.5 z-10 right-12"
          trailing-icon="i-heroicons-arrow-right"
          color="neutral"
          variant="ghost"
          @click="drillDownBtn">
          Вперед
        </UButton>
        <div>
          <VChartFull class="p-2" v-if="settlementsData" :option="chartOption" autoresize :init-options="chartInitOptions" @click="handleChartClick" />
          <div v-else class="flex h-full justify-center items-center"><UIcon size="70" name="codex:loader"></UIcon></div>
          <div v-if="!loadingSettlements && settlementsData?.length === 0" class="text-center top-50 left-144 absolute text-gray-400 mt-2">
            Нет данных для выбранного уровня
          </div>
        </div>
      </div>
      <div class="w-[25%]">
        <VChartFull class="ring rounded-lg ring-default p-2" v-if="OneObjectData" :option="propertyTypesPieOption" autoresize :init-options="chartInitOptions" />
      </div>
    </div>

    <div class="flex mt-5 gap-4">
      <div class="flex w-[75%] flex-col">
        <p class="text-xl font-semibold">Популярные объявления</p>
        <div class="flex flex-col gap-5 mt-4" v-for="block in topOffersBlocks" :key="block.label">
          <h3 class="text-lg text-center">
            {{ block.label }}
          </h3>

          <div
            v-for="offer in block.offers"
            :key="offer.id"
            class="ring ring-[#f8fafc] rounded-lg h-fit p-0 bg-[#f8fafc] cursor-pointer hover:bg-[#e9eef4] hover:ring-[#e9eef4] transition-all"
            @click="openOffer(offer)">
            <div class="flex h-fit">
              <div class="relative">
                <img v-if="offer.images_urls?.length" :src="offer.images_urls[0]" class="object-cover rounded-lg w-61 h-42" />

                <div v-else class="h-33 w-51 flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="size-10 text-gray-400" />
                </div>

                <UBadge v-if="offer.is_new_house" color="neutral" class="absolute top-3 left-2"> Новостройка </UBadge>
              </div>

              <div class="pl-4 flex justify-between w-full">
                <div class="relative py-5 w-full justify-between flex px-5">
                  <div class="flex flex-col gap-1">
                    <h3 class="font-bold text-base text-nowrap">
                      {{ offer.title || "Без названия" }}
                    </h3>
                    <div class="text-base">
                      <UIcon name="tabler:map-pin" class="size-4" />
                      {{ offer.address?.full_address }}
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

                  <div class="flex flex-col items-end mr-0 gap-1">
                    <div class="flex items-center justify-center gap-2">
                      <UBadge v-if="offer.price_category" :color="getCategoryColor(offer.price_category)" variant="solid" class="flex text-nowrap justify-center">
                        {{ getCategoryLabel(offer.price_category) }}
                      </UBadge>
                      <span class="font-bold text-base text-nowrap">{{ formatPrice(offer.price) }}</span>
                    </div>
                    <div class="text-sm">{{ formatPrice(offer.price_per_square_meter) }}/м²</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex grow w-[25%] flex-col gap-4">
        <VChartFull class="ring rounded-lg ring-default p-2" v-if="OneObjectData" :option="apartmentsByRoomsPieOption" autoresize :init-options="pieChartInitOptions" />
        <VChartFull class="ring rounded-lg ring-default p-2" v-if="OneObjectData" :option="flatTypePieOption" autoresize :init-options="pieChartInitOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getCategoryColor } = useCategoryColor();
const { getCategoryLabel } = useCategoryLabel();
const { formatPrice } = usePriceFormat();

interface SettlementData {
  region?: string;
  municipality?: string;
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
    };

    flat_type: {
      new_houses: number;
      secondary: number;
    };
  };
  top_offers_by_views: TopOffer[];
}

const topOffersBlocks = computed(() => {
  const blocks = [];

  if (OneObjectData.value?.top_offers_by_views?.length) {
    blocks.push({
      label: buildLabelWithoutGroupBy(appliedFilters),
      offers: OneObjectData.value.top_offers_by_views,
    });
  }

  comparisons.value.forEach((c) => {
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

  // 🔹 география
  if (filters.region) parts.push(filters.region);
  if (filters.municipality) parts.push(filters.municipality);
  if (filters.settlement) parts.push(filters.settlement);
  if (filters.district) parts.push(filters.district);
  if (filters.microdistrict) parts.push(filters.microdistrict);

  // 🔹 тип недвижимости
  if (filters.is_new_house === true) parts.push("Новостройки");
  else if (filters.is_new_house === false) parts.push("Вторичка");

  // 🔹 тип населённого пункта
  if (filters.settlementTypes?.length) {
    parts.push(filters.settlementTypes.join(", "));
  }

  return parts.join(" · ");
}

const appliedFiltersLabel = computed(() => {
  const label = buildLabel(appliedFilters);
  return label;
});

const chartTypeOptions = ref([
  { label: "Количество объектов", value: "offers" },
  { label: "Категории цен", value: "priceCategories" },
  { label: "Средняя цена за м²", value: "avgPricePerMeter" },
  { label: "Среднее кол-во просмотров за день", value: "avgDailyViewsCount" },
  { label: "Boxplot по площади", value: "areaBoxplot" },
  { label: "Boxplot по цене", value: "priceBoxplot" },
]);

async function addComparison() {
  const filtersSnapshot = JSON.parse(JSON.stringify(draftFilters));

  const [priceHistory, viewsHistory, settlements, one_stats] = await Promise.all([
    $api("/analysis/average-prices-history", { params: buildParams(filtersSnapshot) }),
    $api("/analysis/last-10-days-views-history", { params: buildParams(filtersSnapshot) }),
    $api("/analysis/group-stats", { params: { ...buildParams(filtersSnapshot), group_by: draftFilters.groupBy } }),
    $api("/analysis/stats", { params: buildParams(filtersSnapshot) }),
  ]);
  draftFilters.region = "";
  draftFilters.municipality = "";
  draftFilters.settlement = "";
  draftFilters.district = "";
  draftFilters.microdistrict = "";

  comparisons.value.push({
    id: ++comparisonId,
    label: buildLabel(filtersSnapshot),
    labelWithoutGroup: buildLabelWithoutGroupBy(filtersSnapshot) || "",
    filters: filtersSnapshot,
    priceHistory,
    viewsHistory,
    settlements: settlements.results,
    stats: one_stats,
  });
}

type PricePoint = {
  date: string;
  avg_price: number;
};
const currentLabel = computed(() => buildLabel(appliedFilters));
function aggregateByMonth(data?: PricePoint[]) {
  if (!data?.length) return [];

  const map = new Map<string, { sum: number; count: number; date: Date }>();

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
    .map((i) => ({
      date: i.date,
      avg_price: Math.round(i.sum / i.count),
    }));
}

const priceHistoryChartOption = computed(() => {
  // 🔹 основной ряд
  const baseMonthly = aggregateByMonth(priceHistoryData.value);

  // 🔹 сравнения
  const comparisonMonthly = comparisons.value.map((c) => ({
    label: c.labelWithoutGroup || "",
    monthly: aggregateByMonth(c.priceHistory),
  }));

  const series = [
    {
      name: buildLabelWithoutGroupBy(appliedFilters),
      type: "line",
      smooth: true,
      showSymbol: false,
      data: baseMonthly.map((i) => [i.date, i.avg_price]),
    },
    ...comparisonMonthly.map((c) => ({
      name: c.labelWithoutGroup || "",
      type: "line",
      smooth: true,
      showSymbol: false,
      data: c.monthly.map((i) => [i.date, i.avg_price]), // ✅ КЛЮЧЕВОЕ ИЗМЕНЕНИЕ
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
    xAxis: {
      type: "time",
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (v: number) => formatPrice(v),
      },
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
      data: viewsHistoryData.value?.map((i) => i.views),
    },
    ...comparisons.value.map((c) => ({
      name: c.labelWithoutGroup || "",
      type: "line",
      smooth: true,
      showSymbol: false,
      data: c.viewsHistory.map((i) => i.views),
    })),
  ];

  const xAxisData = viewsHistoryData.value?.map((i) => new Date(i.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })) ?? [];

  return {
    title: {
      text: "История просмотров за последние 10 дней",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
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
    case "municipality": // <- добавить
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

  // 🔹 уровень группировки
  if (filters.groupBy) {
    parts.push(getGroupByLabel(filters.groupBy));
  }

  // 🔹 география
  if (filters.region) parts.push(filters.region);
  if (filters.municipality) parts.push(filters.municipality);
  if (filters.settlement) parts.push(filters.settlement);
  if (filters.district) parts.push(filters.district);
  if (filters.microdistrict) parts.push(filters.microdistrict);

  // 🔹 тип недвижимости
  if (filters.is_new_house === true) parts.push("Новостройки");
  else if (filters.is_new_house === false) parts.push("Вторичка");

  // 🔹 тип населённого пункта
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

const { $api } = useNuxtApp();

const drillLevels = ["region", "municipality", "settlement", "district", "microdistrict", "street"];

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

    refreshSettlementsData();

    if (settlementsData.value?.length && settlementsData.value.length > 0) {
      refreshOneObjectData();
      refreshPriceHistoryData();

      refreshViewsHistoryData();
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

    refreshSettlementsData();
    refreshOneObjectData();
    refreshPriceHistoryData();
    refreshViewsHistoryData();
  }

  appliedFilters.groupBy = targetLevel;
  appliedFilters[targetLevel] = "";

  drillLevels.forEach((level, idx) => {
    if (idx > targetIndex) {
      appliedFilters[level] = "";
    }
  });

  refreshSettlementsData();
  refreshOneObjectData();
  refreshPriceHistoryData();
  refreshViewsHistoryData();
}

async function drillUp() {
  const currentIndex = drillLevels.indexOf(appliedFilters.groupBy as (typeof drillLevels)[number]);

  if (currentIndex <= 0) return; // если уже на верхнем уровне, выходим

  const nextLevel = drillLevels[currentIndex - 1]; // уровень выше
  appliedFilters.groupBy = nextLevel;

  // сбрасываем текущее значение уровня, с которого поднимаемся, и все уровни ниже
  drillLevels.forEach((level, idx) => {
    if (idx >= currentIndex - 1) {
      appliedFilters[level] = "";
    }
  });

  // обновляем данные
  refreshSettlementsData();
  refreshOneObjectData();
  refreshPriceHistoryData();
  refreshViewsHistoryData();
}

async function drillDownBtn() {
  const currentIndex = drillLevels.indexOf(appliedFilters.groupBy as (typeof drillLevels)[number]);

  if (currentIndex >= drillLevels.length - 1) return; // если уже на самом нижнем уровне, выходим

  const nextLevel = drillLevels[currentIndex + 1]; // уровень ниже
  appliedFilters.groupBy = nextLevel;

  // обновляем данные
  refreshSettlementsData();
  refreshOneObjectData();
  refreshPriceHistoryData();
  refreshViewsHistoryData();
}

function getLevelLabel(level: (typeof drillLevels)[number]) {
  switch (level) {
    case "region":
      return "Области";
    case "municipality": // <- добавить
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
  if (!params || params.componentType !== "series") return;

  // ❌ разрешаем drill ТОЛЬКО для верхнего графика
  if (params.seriesId !== "drill-root") return;

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

  return response.results;
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
  return $api("/analysis/average-prices-history", {
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

function getVerticalPieCentersPx(count: number): { center: [string, number]; titleTop: number }[] {
  return Array.from({ length: count }, (_, idx) => {
    const blockTop = CHART_TOP_START + idx * CHART_BLOCK_HEIGHT;

    const centerY = blockTop + CHART_TITLE_HEIGHT + 8 + CHART_GRID_HEIGHT / 2;

    return {
      center: ["50%", centerY],
      titleTop: blockTop,
    };
  });
}

const propertyTypesPieOption = computed(() => {
  const chartsData = [
    {
      label: buildLabelWithoutGroupBy(appliedFilters),
      data: OneObjectData.value?.statistics.property_types ?? {},
    },
    ...comparisons.value
      .filter((c) => c.stats)
      .map((c) => ({
        label: c.labelWithoutGroup,
        data: c.stats.statistics.property_types,
      })),
  ];

  const layout = getVerticalPieCentersPx(chartsData.length);
  const radius = 90; // px — стабильно и предсказуемо

  const titles = chartsData.map((chart, idx) => ({
    text: chart.label,
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
    tooltip: { trigger: "item" },
    label: { formatter: "{d}%" },
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
      .filter((c) => c.stats)
      .map((c) => ({
        label: c.labelWithoutGroup,
        data: c.stats.statistics.apartments_by_rooms.rooms,
      })),
  ];

  const layout = getVerticalPieCentersPx(chartsData.length);
  const radius = 90; // px — фиксированный и предсказуемый радиус

  const titles = chartsData.map((chart, idx) => ({
    text: chart.label,
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
    tooltip: { trigger: "item" },
    label: { formatter: "{d}%" },
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
      .filter((c) => c.stats)
      .map((c) => ({
        label: c.labelWithoutGroup,
        data: {
          Новостройки: c.stats.statistics.apartments_by_rooms.flat_type.new_houses,
          Вторичка: c.stats.statistics.apartments_by_rooms.flat_type.secondary,
        },
      })),
  ];

  const layout = getVerticalPieCentersPx(chartsData.length);
  const outerRadius = 90; // px, фиксированный внешний радиус

  const titles = chartsData.map((chart, idx) => ({
    text: chart.label,
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
    radius: [`25%`, `${outerRadius}px`], // внутренний радиус 25%, внешний фиксированный
    center: layout[idx].center,
    data: Object.entries(chart.data).map(([name, value]) => ({ name, value })),
  }));

  return {
    title: [
      {
        text: "Новосторйки и вторичка",
        left: "center",
        top: 20,
      },
      ...titles,
    ],
    tooltip: { trigger: "item" },
    label: { formatter: "{d}%" },
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

const chartMainTitle = computed(() => {
  return chartTypeOptions.value.find((o) => o.value === appliedFilters.chartType)?.label ?? "";
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

const CHART_BLOCK_HEIGHT = 380; // полный блок (title + grid + отступ)
const CHART_TITLE_HEIGHT = 50; // высота тайтла
const CHART_GRID_HEIGHT = 180;
const CHART_TOP_START = 80;

const chartOption = computed(() => {
  const grids: any[] = [];
  const xAxes: any[] = [];
  const yAxes: any[] = [];
  const series: any[] = [];
  const titles: any[] = [];

  /* ---------- MAIN TITLE ---------- */
  titles.push({
    text: chartMainTitle.value, // ← название ВСЕГО графика
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
    ...comparisons.value.map((c) => ({
      settlements: c.settlements ?? [],
      filters: { ...c.filters, chartType: appliedFilters.chartType },
      label: c.label,
    })),
  ];

  allGraphs.forEach((graph, idx) => {
    const blockTop = CHART_TOP_START + idx * CHART_BLOCK_HEIGHT;

    /* ---------- PER-GRAPH TITLE ---------- */
    if (graph.label) {
      titles.push({
        text: graph.label,
        left: "50%",
        top: blockTop,
        textAlign: "center",
        textStyle: {
          fontSize: 13,
          fontWeight: 500,
          color: "#111827",
        },
      });
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
      data: graph.settlements.map((i) => getCategoryLabelData(i, graph.filters.groupBy)),
      axisLabel: { rotate: 30 },
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
        name: idx === 0 ? s.name : `${s.name} · ${graph.label}`, // ✅
        id: idx === 0 ? "drill-root" : undefined, // ✅ КЛЮЧ
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
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
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

const { data: autocompleteData, refresh: refreshAutocomplete } = await useAsyncData(
  "autocomplete-filterss",
  async () =>
    $api("/offers/autocomplete-filters", {
      params: {
        query: draftFilters[selectedFilterType.value],
        type: selectedFilterType.value,
      },
    }),
  { immediate: false },
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
      case "municipality":
        autocompleteResults.municipality = autocompleteData.value.results;
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
    case "municipality": // <- добавить
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
  (newGroupBy) => {
    const visible = visibleInputs.value;

    ["region", "municipality", "settlement", "district", "microdistrict"].forEach((level) => {
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
</script>
<style scoped>
@reference "tailwindcss";
@reference "@nuxt/ui";
.stat-card {
  @apply ring ring-default flex flex-col items-center rounded-lg p-4 px-20 text-2xl grow w-1/4;
}
.stat-card span {
  @apply font-bold;
}
.stat-card h3 {
  @apply text-muted;
}
.stat-card-info {
  @apply flex mt-1.5 justify-center items-center gap-2;
}
.stat-card-info span {
  @apply flex items-center  gap-2;
}
</style>
