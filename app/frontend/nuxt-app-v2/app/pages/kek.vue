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
        class="w-30 h-8" />
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
      <UCheckboxGroup
        v-model="draftFilters.settlementTypes"
        :items="[
          { label: 'Город', value: 'город' },
          { label: 'Деревня', value: 'деревня' },
          { label: 'Посёлок', value: 'поселок' },
          { label: 'Село', value: 'село' },
        ]"
        class="mb-4" />
      <URadioGroup
        v-model="draftFilters.is_new_house"
        :items="[
          { label: 'Вся', value: undefined },
          { label: 'Новостройки', value: true },
          { label: 'Вторичка', value: false },
        ]" />
      <UButton color="primary" variant="solid" class="h-10" @click="applyFilters"> Применить фильтры </UButton>
      <UButton color="primary" variant="soft" @click="addComparison"> ➕ Добавить к сравнению </UButton>
      <UButton color="warning" variant="soft" @click="comparisons = []"> Очистить сравнение </UButton>
    </div>

    <div class="flex py-5 gap-4.5 justify-between">
      <div class="stat-card">
        <h3>Всего объектов</h3>
        <div v-if="loadingOneObject">
          <USkeleton class="h-20 w-150" />
        </div>
        <div v-else class="stat-card-info">
          <UIcon class="size-8" name="iconify i-ic:round-maps-home-work logo-icon"> </UIcon> <span>{{ OneObjectData?.total_count }}</span>
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
        <VChart
          v-if="!loadingPriceHistory && priceHistoryDataReady"
          :option="priceHistoryChartOption"
          :update-options="{ notMerge: true }"
          autoresize
          style="height: 400px; width: 100%" />
        <div v-else class="text-gray-500 text-center py-20">Загрузка истории цен...</div>
      </div>

      <div class="rounded-lg ring ring-default p-4 w-full md:w-1/2">
        <VChart
          v-if="!loadingViewsHistory && viewsHistoryDataReady"
          :option="viewsHistoryChartOption"
          :update-options="{ notMerge: true }"
          autoresize
          style="height: 400px; width: 100%" />

        <div v-else class="text-gray-500 text-center py-20">Загрузка истории просмотров...</div>
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
            class="w-64" />

          <!-- <p>{{ settlementsData }}</p> -->
          <div class="relative mt-4">
            <UButton v-if="canDrillUp" icon="i-heroicons-arrow-left" color="neutral" variant="soft" @click="drillUp"> Назад </UButton>
            <VChart v-if="!loadingSettlements" :option="chartOption" autoresize style="height: 400px" @click="handleChartClick" />

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
                    <!-- <div class="flex gap-2">
                      <UBadge v-if="offer.family_category" :color="getCategoryColor(offer.family_category)" variant="solid" class="category-badge">
                        Семья: {{ getCategoryLabel(offer.family_category) }}
                        <span v-if="offer.family_score !== null && offer.family_score !== undefined"> ({{ offer.family_score.toFixed(2) }}) </span>
                      </UBadge>
                      <UBadge v-if="offer.elderly_category" :color="getCategoryColor(offer.elderly_category)" variant="solid" class="category-badge">
                        Пожилые: {{ getCategoryLabel(offer.elderly_category) }}
                        <span v-if="offer.elderly_score !== null && offer.elderly_score !== undefined"> ({{ offer.elderly_score.toFixed(2) }}) </span>
                      </UBadge>
                      <UBadge v-if="offer.transport_access_category" :color="getCategoryColor(offer.transport_access_category)" variant="solid" class="category-badge">
                        Транспорт:
                        {{ getCategoryLabel(offer.transport_access_category) }}
                        <span v-if="offer.transport_access_score !== null && offer.transport_access_score !== undefined">
                          ({{ offer.transport_access_score.toFixed(2) }})
                        </span>
                      </UBadge>
                    </div> -->
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
        <VChart class="ring rounded-lg ring-[var(--ui-border)] p-2" v-if="OneObjectData" :option="propertyTypesPieOption" autoresize style="height: 404px" />

        <VChart class="ring rounded-lg ring-[var(--ui-border)] p-2" v-if="OneObjectData" :option="apartmentsByRoomsPieOption" autoresize style="height: 404px" />
        <VChart class="ring rounded-lg ring-[var(--ui-border)] p-2" v-if="OneObjectData" :option="flatTypePieOption" autoresize style="height: 404px" />
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
}
const comparisons = ref<ComparisonItem[]>([]);
let comparisonId = 0;

async function addComparison() {
  const filtersSnapshot = JSON.parse(JSON.stringify(draftFilters));

  // Берём данные для нового comparison
  const [priceHistory, viewsHistory, settlements] = await Promise.all([
    $api("/analysis/average-prices-history", { params: buildParams(filtersSnapshot) }),
    $api("/analysis/last-10-days-views-history", { params: buildParams(filtersSnapshot) }),
    $api("/analysis/group-stats", { params: { ...buildParams(filtersSnapshot), group_by: appliedFilters.groupBy } }),
  ]);

  comparisons.value.push({
    id: ++comparisonId,
    label: buildLabel(filtersSnapshot),
    filters: filtersSnapshot,
    priceHistory,
    viewsHistory,
    settlementsData: settlements.results, // 👈 сохраняем snapshot
  });
}

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

const categories = computed(
  () =>
    settlementsData.value?.map((item, index) => {
      switch (appliedFilters.groupBy) {
        case "region":
          return item.region ?? `Область ${index + 1}`;
        case "settlement":
          return item.settlement ?? `Населённый пункт ${index + 1}`;
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

const drillLevels = ["region", "settlement", "district", "microdistrict", "street"];

const openOffer = (offer: OfferResponseFull) => {
  const router = useRouter();
  router.push(`/offers/${offer.id}`);
};

async function drillDown(categoryName: string) {
  const currentIndex = drillLevels.indexOf(appliedFilters.groupBy as (typeof drillLevels)[number]);
  console.log("Сработал дрилл даун");
  for (let i = currentIndex + 1; i < drillLevels.length; i++) {
    const nextLevel = drillLevels[i];

    // Устанавливаем groupBy на следующий уровень
    appliedFilters.groupBy = nextLevel;

    // Сбрасываем фильтры всех уровней ниже текущего nextLevel
    drillLevels.slice(i + 1).forEach((level) => {
      appliedFilters[level] = "";
    });

    // Фильтр текущего уровня — это значение категории, по которой кликнули
    appliedFilters[drillLevels[currentIndex]] = categoryName;

    // Делаем запрос к API
    await refreshSettlementsData();

    // Проверяем, есть ли данные на этом уровне
    if (settlementsData.value?.length && settlementsData.value.length > 0) {
      await refreshOneObjectData();
      await refreshPriceHistoryData();
      await refreshViewsHistoryData();
      return;
    }

    // Если данных нет — идём на следующий уровень
  }

  console.log("Нет данных на следующих уровнях");
}
const canDrillUp = computed(() => {
  return appliedFilters.groupBy != "region";
});

async function drillUpTo(targetLevel: (typeof drillLevels)[number]) {
  const targetIndex = drillLevels.indexOf(targetLevel);
  if (targetIndex < 0) return;

  // 🚫 КЛЮЧЕВОЕ УСЛОВИЕ
  // Если у уровня нет значения — это просто уровень, не точка drill
  if (!appliedFilters[targetLevel]) {
    // Просто остаёмся на этом уровне
    appliedFilters.groupBy = targetLevel;

    // Чистим всё ниже
    drillLevels.forEach((level, idx) => {
      if (idx > targetIndex) {
        appliedFilters[level] = "";
      }
    });

    await refreshSettlementsData();
    await refreshOneObjectData();
    await refreshPriceHistoryData();
    await refreshViewsHistoryData();
    return;
  }

  // ⬇️ Ниже — логика для случая,
  // когда у breadcrumb ЕСТЬ значение (например "ЦАО")
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

  // Идём ВВЕРХ, пропуская пустые уровни
  for (let i = currentIndex - 1; i >= 0; i--) {
    const level = drillLevels[i];

    // 1. Устанавливаем groupBy
    appliedFilters.groupBy = level;

    // 2. Очищаем фильтр этого уровня
    appliedFilters[level] = "";

    // 3. Очищаем всё ниже
    drillLevels.forEach((l, idx) => {
      if (idx > i) {
        appliedFilters[l] = "";
      }
    });

    // 4. Запрашиваем данные
    await refreshSettlementsData();

    // 5. Если данные есть — стоп
    if (settlementsData.value?.length) {
      await refreshOneObjectData();
      await refreshPriceHistoryData();
      await refreshViewsHistoryData();
      return;
    }

    // иначе — идём выше
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
      // Показываем уровень, если:
      // 1) Значение установлено
      // 2) Или это текущий groupBy
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
} = useAsyncData<SettlementData[]>(
  "group-stats",
  async () => {
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
  },
  // {
  //   watch: [toRef(appliedFilters, "chartType")],
  //   deep: true,
  // },
);

const {
  data: OneObjectData,
  pending: loadingOneObject,
  error: OneObjectError,
  refresh: refreshOneObjectData,
} = useAsyncData<OneObjectStats>(
  "stats",
  () => {
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
  },
  {
    // watch: [appliedFilters],
    // deep: true,
  },
);

const {
  data: viewsHistoryData,
  pending: loadingViewsHistory,
  error: viewsHistoryError,
  refresh: refreshViewsHistoryData,
} = useAsyncData<ViewsHistoryData>(
  "views-history",
  () => {
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
  },
  {
    // watch: [
    //   toRef(appliedFilters, "settlement"),
    //   toRef(appliedFilters, "region"),
    //   toRef(appliedFilters, "district"),
    //   toRef(appliedFilters, "microdistrict"),
    //   toRef(appliedFilters, "settlementTypes"),
    // ],
  },
);

const {
  data: priceHistoryData,
  pending: loadingPriceHistory,
  error: priceHistoryError,
  refresh: refreshPriceHistoryData,
} = useAsyncData<PriceHistory[]>(
  "price-history",
  () => {
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
  },
  {
    // watch: [
    //   toRef(appliedFilters, "settlement"),
    //   toRef(appliedFilters, "region"),
    //   toRef(appliedFilters, "district"),
    //   toRef(appliedFilters, "microdistrict"),
    //   toRef(appliedFilters, "settlementTypes"),
    // ],
  },
);
const basePriceSeries = computed(() => ({
  id: "base",
  name: (() => {
    const label = buildLabel(appliedFilters);
    return `${label} (текущий выбор)`;
  })(),
  type: "line",
  smooth: true,
  data: priceHistoryData.value?.map((i) => i.avg_price) ?? [],
  lineStyle: { width: 3 },
  itemStyle: { color: colorPalette[0] },
}));

const baseViewsSeries = computed(() => ({
  id: "base-views",
  name: (() => {
    const label = buildLabel(appliedFilters);
    return `${label} (текущий выбор)`;
  })(),
  type: "line",
  smooth: true,
  data: viewsHistoryData.value?.map((i) => i.views) ?? [],
  itemStyle: { color: colorPalette[0] },
}));

const viewsHistoryDataReady = computed(() => viewsHistoryData.value?.length && viewsHistoryData.value?.length > 0);

const viewsHistoryChartOption = computed(() => {
  const comparisonSeries = comparisons.value.map((c, index) => ({
    id: `cmp-${c.id}`,
    name: c.label,
    type: "line",
    smooth: true,
    data: c.viewsHistory.map((i) => i.views),
    itemStyle: {
      color: colorPalette[(index + 1) % colorPalette.length],
    },
  }));

  return {
    title: { text: "История просмотров", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: viewsHistoryData.value?.map((i) => i.date) ?? comparisons.value[0]?.viewsHistory.map((i) => i.date) ?? [],
    },
    yAxis: { type: "value" },
    series: [baseViewsSeries.value, ...comparisonSeries],
  };
});

const priceHistoryDataReady = computed(() => !!priceHistoryData.value?.length);

const priceHistoryChartOption = computed(() => {
  const comparisonSeries = comparisons.value.map((c, index) => ({
    id: `cmp-${c.id}`,
    name: c.label,
    type: "line",
    smooth: true,
    data: c.priceHistory.map((i) => i.avg_price),
    itemStyle: {
      color: colorPalette[(index + 1) % colorPalette.length],
    },
  }));

  return {
    title: { text: "История цен", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: priceHistoryData.value?.map((i) => i.date) ?? comparisons.value[0]?.priceHistory.map((i) => i.date) ?? [],
    },
    yAxis: { type: "value" },
    series: [basePriceSeries.value, ...comparisonSeries],
  };
});

const propertyTypesPieOption = computed(() => {
  const data = OneObjectData.value?.statistics.property_types ?? {};

  return {
    title: {
      text: "Типы недвижимости",
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      bottom: 0,
    },
    series: [
      {
        type: "pie",
        radius: "60%",
        data: Object.entries(data).map(([name, value]) => ({
          name,
          value,
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0,0,0,0.3)",
          },
        },
      },
    ],
  };
});

const apartmentsByRoomsPieOption = computed(() => {
  const data = OneObjectData.value?.statistics.apartments_by_rooms.rooms ?? {};

  return {
    title: {
      text: "Квартиры по комнатам",
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      bottom: 0,
    },
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
  const data = OneObjectData.value?.statistics.apartments_by_rooms.flat_type ?? { new_houses: 0, secondary: 0 };

  return {
    title: {
      text: "Новостройки vs Вторичка",
      left: "center",
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      bottom: 0,
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: [
          { name: "Новостройки", value: data.new_houses },
          { name: "Вторичка", value: data.secondary },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0,0,0,0.3)",
          },
        },
      },
    ],
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

const chartOption = computed(() => {
  const grids = [];
  const xAxes = [];
  const yAxes = [];
  const series = [];

  let gridIndex = 0;

  // ===== ОСНОВНОЙ ГРИД =====
  grids.push({
    top: 40,
    left: 60,
    right: 40,
    height: 220,
  });

  xAxes.push({
    type: "category",
    gridIndex,
    data: settlementsData.value.map((i) => getCategoryLabelData(i, appliedFilters.groupBy)),
    axisLabel: { rotate: 30 },
  });

  yAxes.push({
    type: "value",
    gridIndex,
  });

  series.push(
    ...buildSeriesForFilters(
      appliedFilters,
      settlementsData.value,
      "price-main", // 👈 уникальный stack
    ).map((s) => ({
      ...s,
      xAxisIndex: gridIndex,
      yAxisIndex: gridIndex,
    })),
  );

  gridIndex++;

  // ===== COMPARISON ГРИДЫ =====
  comparisons.value.forEach((c) => {
    grids.push({
      top: 40 + gridIndex * 260,
      left: 60,
      right: 40,
      height: 220,
    });

    xAxes.push({
      type: "category",
      gridIndex,
      data: c.settlementsData.map((i) => getCategoryLabelData(i, c.filters.groupBy)),
      axisLabel: { rotate: 30 },
    });

    yAxes.push({
      type: "value",
      gridIndex,
    });

    series.push(
      ...buildSeriesForFilters(
        { ...c.filters, chartType: appliedFilters.chartType },
        c.settlementsData,
        `price-${c.id}`, // 👈 УНИКАЛЬНЫЙ stack на grid
      ).map((s) => ({
        ...s,
        name: `${s.name} — ${c.label}`,
        xAxisIndex: gridIndex,
        yAxisIndex: gridIndex,
      })),
    );

    gridIndex++;
  });

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },

    legend: {
      top: 0,
    },

    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series,
  };
});

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

const { data: autocompleteData, refresh: refreshAutocomplete } = useAsyncData(
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

function applyFilters() {
  // groupBy обновляем сразу
  appliedFilters.groupBy = draftFilters.groupBy;

  // Остальные поля применяем только при нажатии
  appliedFilters.region = draftFilters.region;
  appliedFilters.settlement = draftFilters.settlement;
  appliedFilters.district = draftFilters.district;
  appliedFilters.microdistrict = draftFilters.microdistrict;
  appliedFilters.settlementTypes = [...draftFilters.settlementTypes];
  appliedFilters.is_new_house = draftFilters.is_new_house;

  // Обновляем данные
  refreshSettlementsData();
  refreshOneObjectData();
  refreshPriceHistoryData();
  refreshViewsHistoryData();

  // Очищаем автокомплит
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

    // Перебираем все уровни фильтров
    ["region", "settlement", "district", "microdistrict"].forEach((level) => {
      // Если уровень скрыт — очищаем его
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
      data: settlementsData.value?.map((i) => i.averages.average_views_count) ?? [],
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
