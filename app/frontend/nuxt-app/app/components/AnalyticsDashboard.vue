<template>
  <div class="analytics-dashboard">
    <div v-if="mainAnalyticsTitle" class="dashboard-title">
      <h2>{{ mainAnalyticsTitle }}</h2>
    </div>

    <!-- Общая статистика -->
    <div class="stats-section">
      <div class="total-stats">
        <div class="stat-card">
          <h3>Всего объектов</h3>
          <p class="stat-number">
            <!-- ДОБАВИТЬ ВОЗМОЖНОСТЬ ВЫБОРА МЕЖДУ ВТОРИЧКОЙ И НОВОСТРОЙКАМИ !!!!!!!!!-->
            <template v-if="loadingStats">🔄</template>
            <template v-else>🏠 {{ totalStats.total_offers }}</template>
          </p>
        </div>
        <div class="stat-card">
          <h3>Средняя цена</h3>
          <p class="stat-number">
            <template v-if="loadingStats">🔄</template>
            <template v-else>💰 {{ formatPrice(totalStats.avg_price) }}</template>
          </p>
        </div>
        <div class="stat-card">
          <h3>Средняя площадь</h3>
          <p class="stat-number flex justify-center gap-2">
            <template v-if="loadingStats">
              <UIcon name="line-md:loading-loop" class="size-8" />
            </template>
            <template v-else>
              <UIcon name="bx:area" class="size-8" />
              {{ Math.round(totalStats.avg_area_total) }} м²
            </template>
          </p>
        </div>
        <div class="stat-card">
          <h3>Новых сегодня</h3>
          <p class="stat-number">
            <template v-if="loadingStats">🔄</template>
            <template v-else>🆕 {{ totalStats.new_offers_today }}</template>
          </p>
        </div>
      </div>
    </div>

    <div class="sas">
      <div id="price-boxplot-chart" class="chart-container collapse">
        <apexchart type="boxPlot" height="500" :options="priceBoxplotChart.options" :series="priceBoxplotChart.series"> </apexchart>
      </div>
      <div id="area-boxplot-chart" class="chart-container collapse">
        <apexchart type="boxPlot" height="500" :options="areaBoxplotChart.options" :series="areaBoxplotChart.series"> </apexchart>
      </div>
    </div>

    <div class="charts-row-two">
      <div class="full-width-chart">
        <div class="bg-white rounded-xl shadow p-6 h-full">
          <h2 class="text-xl font-semibold mb-4">История средней цены</h2>
          <div v-if="loadingPriceHistory" class="flex justify-center items-center py-8 h-100">
            <UIcon name="line-md:loading-loop" class="size-10" />
          </div>
          <div v-else-if="priceHistoryChart.series.length > 0" id="price-history-chart" class="chart-container">
            <apexchart type="line" height="400" :options="priceHistoryChart.options" :series="priceHistoryChart.series"></apexchart>
          </div>
          <div v-else class="flex justify-center items-center py-8 text-gray-500">Нет данных для отображения</div>
        </div>
      </div>

      <div class="full-width-chart">
        <div class="bg-white rounded-xl shadow p-6 h-full">
          <h2 class="text-xl font-semibold mb-4">Количество просмотров за последние 10 дней</h2>
          <div v-if="loadingViewsHistory" class="flex justify-center items-center py-8 h-100">
            <UIcon name="line-md:loading-loop" class="size-10" />
          </div>
          <div v-else-if="viewsHistoryChart.series.length > 0" id="views-history-chart" class="chart-container">
            <apexchart type="line" height="400" :options="viewsHistoryChart.options" :series="viewsHistoryChart.series"></apexchart>
          </div>
          <div v-else class="flex justify-center items-center py-8 text-gray-500">Нет данных для отображения</div>
        </div>
      </div>
    </div>

    <div class="charts-row-sas">
      <div class="grid gap-2 h-fit">
        <!-- Переключаемый график -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-semibold">{{ getCurrentChartTitle() }}</h2>
          <div class="chart-toggle-buttons">
            <UButton
              size="lg"
              color="neutral"
              variant="soft"
              @click="setActiveChart('priceCategories')"
              :class="['toggle-btn', activeChart === 'priceCategories' ? 'active' : '']">
              Ценовые категории
            </UButton>
            <UButton
              size="lg"
              color="neutral"
              variant="soft"
              @click="setActiveChart('avgPricePerSqm')"
              :class="['toggle-btn', activeChart === 'avgPricePerSqm' ? 'active' : '']">
              Средняя цена за м²
            </UButton>
            <UButton
              size="lg"
              color="neutral"
              variant="soft"
              @click="setActiveChart('viewsLastTenDays')"
              :class="['toggle-btn', activeChart === 'viewsLastTenDays' ? 'active' : '']">
              Просмотры за 10 дней
            </UButton>
            <UButton size="lg" color="neutral" variant="soft" @click="setActiveChart('priceBoxplot')" :class="['toggle-btn', activeChart === 'priceBoxplot' ? 'active' : '']">
              Распределение цен
            </UButton>
            <UButton size="lg" color="neutral" variant="soft" @click="setActiveChart('areaBoxplot')" :class="['toggle-btn', activeChart === 'areaBoxplot' ? 'active' : '']">
              Распределение площадей
            </UButton>
          </div>
        </div>
        <div class="bg-white rounded-xl overflow-auto shadow p-6 h-fit">
          <div v-if="loadingSettlements" class="flex justify-center items-center py-8">
            <UIcon name="line-md:loading-loop" class="size-10" />
          </div>

          <div v-else-if="activeChart === 'priceCategories' && priceCategoriesChart.series.length > 0" id="price-categories-chart" class="chart-container-group">
            <!-- <UBadge>{{ priceCategoriesChart.options.xaxis.categories.length }}</UBadge>
                        <span v-if="priceCategoriesChart.options.xaxis.categories.length >= 100">Показаны первые 100
                            объектов</span> -->

            <apexchart
              type="bar"
              :height="400"
              :width="priceCategoriesChart.options.xaxis.categories.length * 120 + 900"
              :options="priceCategoriesChart.options"
              :series="priceCategoriesChart.series">
            </apexchart>
          </div>
          <div v-else-if="activeChart === 'avgPricePerSqm' && avgPricePerSqmChart.series.length > 0" id="avg-price-per-sqm-chart" class="chart-container-group">
            <apexchart
              type="bar"
              :height="400"
              :width="avgPricePerSqmChart.options.xaxis.categories.length * 120 + 900"
              :options="avgPricePerSqmChart.options"
              :series="avgPricePerSqmChart.series">
            </apexchart>
          </div>
          <div v-else-if="activeChart === 'viewsLastTenDays' && viewsLastTenDaysChart.series.length > 0" id="views-last-ten-days-chart" class="chart-container-group">
            <apexchart
              type="bar"
              :height="400"
              :width="viewsLastTenDaysChart.options.xaxis.categories.length * 120 + 900"
              :options="viewsLastTenDaysChart.options"
              :series="viewsLastTenDaysChart.series">
            </apexchart>
          </div>
          <div v-else-if="activeChart === 'priceBoxplot'" id="price-boxplot-chart" class="chart-container-group">
            <apexchart
              type="boxPlot"
              :height="400"
              :width="priceBoxplotChart.options.xaxis.categories.length * 120 + 900"
              :options="priceBoxplotChart.options"
              :series="priceBoxplotChart.series">
            </apexchart>
          </div>
          <div v-else-if="activeChart === 'areaBoxplot'" id="area-boxplot-chart" class="chart-container-group">
            <apexchart
              type="boxPlot"
              :height="400"
              :width="priceBoxplotChart.options.xaxis.categories.length * 120 + 900"
              :options="areaBoxplotChart.options"
              :series="areaBoxplotChart.series">
            </apexchart>
          </div>
          <div v-else class="flex justify-center items-center py-8 text-gray-500">Нет данных для отображения</div>
        </div>

        <!-- Популярные объявления -->
        <div class="popular-offers">
          <div class="bg-white rounded-xl shadow p-6 h-full">
            <h2 class="text-xl font-semibold mb-4">Популярные объявления за день</h2>
            <div v-if="loadingStats" class="flex justify-center items-center py-8">
              <UIcon name="line-md:loading-loop" class="size-10" />
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="offer in totalStats?.top_offers_week"
                :key="offer.id"
                class="flex items-center justify-between p-4 hover:cursor-pointer bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                @click="openOffer(offer)">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900 text-sm mb-1">{{ offer.title }}</h3>
                  <div class="flex items-center space-x-4 text-xs text-gray-600">
                    <span class="flex items-center">
                      <span class="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                      {{ formatPrice(offer.price) }}
                    </span>
                    <span class="flex items-center">
                      <span class="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      {{ offer.daily_views }} просмотров
                    </span>
                    <span class="flex items-center">
                      <span class="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                      {{ formatDate(offer.creation_date) }}
                    </span>
                  </div>
                </div>
                <div class="text-right ml-4">
                  <p class="font-bold text-gray-900 text-sm">{{ formatPriceFull(offer.price_per_sqm) }}</p>
                  <p class="text-xs text-gray-500">за м²</p>
                </div>
              </div>
              <div v-if="totalStats?.top_offers_week.length === 0" class="text-center py-4 text-gray-500">Нет популярных объявлений</div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-2">
        <!-- Типы недвижимости -->
        <div class="chart-third">
          <div class="bg-white rounded-xl shadow p-6 h-full">
            <h2 class="text-xl font-semibold mb-4">Типы недвижимости</h2>
            <div v-if="loadingSettlements" class="flex justify-center items-center py-8">
              <UIcon name="line-md:loading-loop" class="size-10" />
            </div>
            <div v-else-if="propertyTypeChart.series.length > 0" id="property-type-chart" class="chart-container">
              <apexchart type="donut" height="250" :options="propertyTypeChart.options" :series="propertyTypeChart.series"></apexchart>
            </div>
            <div v-else class="flex justify-center items-center py-8 text-gray-500">Нет данных для отображения</div>
          </div>
        </div>

        <!-- Квартиры по комнатам -->
        <div class="chart-third">
          <div class="bg-white rounded-xl shadow p-6 h-full">
            <h2 class="text-xl font-semibold mb-4">Квартиры по комнатам</h2>
            <div v-if="loadingSettlements" class="flex justify-center items-center py-8">
              <UIcon name="line-md:loading-loop" class="size-10" />
            </div>
            <div v-else-if="roomsChart.series.length > 0" id="rooms-chart" class="chart-container">
              <apexchart type="pie" height="250" :options="roomsChart.options" :series="roomsChart.series"> </apexchart>
            </div>
            <div v-else class="flex justify-center items-center py-8 text-gray-500">Нет данных для отображения</div>
          </div>
        </div>

        <!-- Новостройки vs Вторичка -->
        <div class="chart-third">
          <div class="bg-white rounded-xl shadow p-6 h-full">
            <h2 class="text-xl font-semibold mb-4">Новостройки vs Вторичка</h2>
            <div v-if="loadingSettlements" class="flex justify-center items-center py-8">
              <UIcon name="line-md:loading-loop" class="size-10" />
            </div>
            <div v-else-if="apartmentTypeChart.series.length > 0" id="apartment-type-chart" class="chart-container">
              <apexchart type="radialBar" height="250" :options="apartmentTypeChart.options" :series="apartmentTypeChart.series"></apexchart>
            </div>
            <div v-else class="flex justify-center items-center py-8 text-gray-500">Нет данных для отображения</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Интерфейсы
interface TopOffer {
  id: number;
  title: string;
  price: number;
  daily_views: number;
  creation_date: string;
  price_per_sqm: number;
  url: string;
}

interface TotalStats {
  total_offers: number;
  avg_price: number;
  avg_area_total: number;
  new_offers_today: number;
}

interface ApiResponse {
  total_offers: number;
  avg_price: number;
  avg_area_total: number;
  new_offers_today: number;
  top_offers_week: TopOffer[];
}

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

interface PriceHistory {
  date: string;
  avg_price: number | null;
}

interface ViewsHistory {
  date: string;
  views: number;
}

interface ViewsHistoryResponse {
  views_last_10_days: ViewsHistory[];
}

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

// Props
const props = defineProps<{
  filters: FilterState;
  title?: string;
}>();
const { $api } = useNuxtApp();
// Emits
const emit = defineEmits<{
  "data-loaded": [data: any];
}>();

const activeChart = ref<"priceCategories" | "avgPricePerSqm" | "viewsLastTenDays" | "priceBoxplot" | "areaBoxplot">("priceCategories");

// Графики с полными настройками
const priceCategoriesChart = ref({
  series: [] as any[],

  options: {
    grid: {
      padding: {
        top: 0,
        right: 0,
        bottom: -10,
        left: 0,
      },
    },
    chart: {
      type: "bar",
      stacked: true,
      events: {
        dataPointSelection: (event: any, chartContext: any, config: any) => {
          drillDown(config.seriesIndex, config.dataPointIndex, "priceCategories");
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 4,
        dataLabels: {
          total: {
            enabled: true,
            style: {
              fontSize: "13px",
              fontWeight: 900,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val > 0 ? Math.round(val).toLocaleString("ru-RU") : "";
      },
      style: {
        fontSize: "10px",
        colors: ["#fff"],
      },
    },
    xaxis: {
      categories: [] as string[],
      labels: {
        rotate: -45,
        style: {
          fontSize: "12px",
        },
      },
    },

    yaxis: {
      title: {
        text: "Количество объявлений по категориям",
      },
      labels: {
        formatter: function (val: number) {
          if (val >= 1000000) {
            return (val / 1000000).toFixed(1) + "M";
          } else if (val >= 1000) {
            return (val / 1000).toFixed(0) + "K";
          }
          return Math.round(val).toString();
        },
      },
    },

    tooltip: {
      y: {
        formatter: function (val: number) {
          return new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " объявлений";
        },
      },
    },
    colors: ["#00E396", "#008FFB", "#FF4560"],
    legend: {
      position: "top",
      horizontalAlign: "center",
    },
    fill: {
      opacity: 1,
    },
  },
});

const propertyTypeChart = ref({
  series: [] as number[],
  options: {
    chart: {
      type: "donut",
      height: 250,
    },
    labels: [] as string[],

    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    legend: {
      position: "right",
      horizontalAlign: "center",
      fontSize: "14px",
      markers: {
        width: 12,
        height: 12,
        radius: 12,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toString() + " объявлений";
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Всего",
              formatter: function (w: any) {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString();
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, { seriesIndex, w }: any) {
        return w.config.labels[seriesIndex] + ": " + Math.round(val) + "%";
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        opacity: 0.45,
      },
    },
  },
});

const roomsChart = ref({
  series: [] as number[],
  options: {
    chart: {
      type: "pie",
      height: 250,
    },
    labels: [] as string[],

    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    legend: {
      position: "right",
      horizontalAlign: "center",
      fontSize: "14px",
      markers: {
        width: 12,
        height: 12,
        radius: 12,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toString() + " объявлений";
        },
      },
    },
    plotOptions: {
      pie: {
        customScale: 1,
        donut: {
          size: "0%",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, { seriesIndex, w }: any) {
        return w.config.labels[seriesIndex] + ": " + Math.round(val) + "%";
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        opacity: 0.45,
      },
    },
  },
});

const avgPricePerSqmChart = ref({
  series: [] as any[],
  options: {
    chart: {
      type: "bar",
      height: "auto",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " ₽";
      },
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },
    xaxis: {
      categories: [] as string[],
      labels: {
        rotate: -45,
        style: {
          fontSize: "12px",
        },
      },
    },

    yaxis: {
      title: {
        text: "Средняя цена за м² (₽)",
      },
      labels: {
        formatter: function (val: number) {
          if (val >= 1000000) {
            return (val / 1000000).toFixed(1) + "M";
          } else if (val >= 1000) {
            return (val / 1000).toFixed(0) + "K";
          }
          return Math.round(val).toString();
        },
      },
    },
    tooltip: {
      intersect: false,
      y: {
        formatter: function (val: number) {
          return new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " ₽";
        },
      },
    },
    colors: [] as string[],
    legend: {
      show: false,
    },
  },
});

const viewsLastTenDaysChart = ref({
  series: [] as any[],
  options: {
    chart: {
      type: "bar",
      height: "auto",
    },
    plotOptions: {
      bar: {
        horizontal: false,

        borderRadius: 4,
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        if (val >= 1000000) {
          return (val / 1000000).toFixed(1) + "M";
        } else if (val >= 1000) {
          return (val / 1000).toFixed(0) + "K";
        }
        return Math.round(val).toString();
      },
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },
    xaxis: {
      categories: [] as string[],
      labels: {
        rotate: -45,
        style: {
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Просмотры за 10 дней",
      },
      labels: {
        formatter: function (val: number) {
          if (val >= 1000000) {
            return (val / 1000000).toFixed(1) + "M";
          } else if (val >= 1000) {
            return (val / 1000).toFixed(0) + "K";
          }
          return Math.round(val).toString();
        },
      },
    },

    tooltip: {
      y: {
        formatter: function (val: number) {
          return new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " просмотров";
        },
      },
    },
    colors: [] as string[],
    legend: {
      show: false,
    },
  },
});

const apartmentTypeChart = ref({
  series: [] as number[],
  options: {
    chart: {
      height: 250,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 5,
          size: "30%",
          background: "transparent",
          image: undefined,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: false,
          },
        },
        barLabels: {
          enabled: true,
          useSeriesColors: true,
          offsetX: -8,
          fontSize: "16px",
          formatter: function (seriesName: string, opts: any) {
            return seriesName + ": " + opts.w.globals.series[opts.seriesIndex] + "%";
          },
        },
      },
    },

    labels: ["Вторичка", "Новостройки"],
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "14px",
      markers: {
        width: 12,
        height: 12,
        radius: 12,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 350,
          },
          legend: {
            show: true,
            position: "bottom",
          },
        },
      },
    ],
  },
});

// Boxplot графики
const priceBoxplotChart = ref({
  series: [] as any[],
  options: {
    chart: {
      type: "boxPlot",
      height: "auto",
      // toolbar: {
      //     show: true,
      //     tools: {
      //         download: true,
      //         selection: true,
      //         zoom: true,
      //         zoomin: true,
      //         zoomout: true,
      //         pan: true,
      //         reset: true
      //     }
      // }
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
      boxPlot: {
        colors: {
          upper: "#008FFB",
          lower: "#00E396",
        },
      },
    },
    xaxis: {
      categories: [] as string[],
      labels: {
        rotate: -45,
        style: {
          fontSize: "12px",
        },
      },
    },

    yaxis: {
      title: {
        text: "Цена (₽)",
      },
      labels: {
        formatter: function (val: number) {
          if (val >= 1000000) {
            return (val / 1000000).toFixed(1) + "M";
          } else if (val >= 1000) {
            return (val / 1000).toFixed(0) + "K";
          }
          return Math.round(val).toString();
        },
      },
    },

    tooltip: {
      y: {
        formatter: function (val: number) {
          return new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " ₽";
        },
      },
    },
  },
});

const areaBoxplotChart = ref({
  series: [] as any[],
  options: {
    chart: {
      type: "boxPlot",
      height: "auto",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: true,
          reset: true,
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
      boxPlot: {
        colors: {
          upper: "#008FFB",
          lower: "#00E396",
        },
      },
    },
    xaxis: {
      categories: [] as string[],
      labels: {
        rotate: -45,
        style: {
          fontSize: "12px",
        },
      },
    },

    yaxis: {
      title: {
        text: "Площадь (м²)",
      },
      labels: {
        formatter: function (val: number) {
          return Math.round(val).toString() + " м²";
        },
      },
    },

    tooltip: {
      shared: false,
      intersect: false,
      y: {
        formatter: function (val: number) {
          return Math.round(val).toString() + " м²";
        },
      },
    },
  },
});

// Функции
const setActiveChart = (chartType: "priceCategories" | "avgPricePerSqm" | "viewsLastTenDays" | "priceBoxplot" | "areaBoxplot") => {
  activeChart.value = chartType;
};

const getCurrentChartTitle = () => {
  const titles = {
    priceCategories: `Ценовые категории по ${getGroupByLabel()} (100 первых в порядке убывания по кол-ву объявлений)`,
    avgPricePerSqm: `Средняя цена за м² по ${getGroupByLabel()}`,
    viewsLastTenDays: `Просмотры за 10 дней по ${getGroupByLabel()}`,
    priceBoxplot: `Распределение цен по ${getGroupByLabel()}`,
    areaBoxplot: `Распределение площадей по ${getGroupByLabel()}`,
  };
  return titles[activeChart.value] || titles.priceCategories;
};

const getGroupByLabel = () => {
  const labels: { [key: string]: string } = {
    region: "регионам",
    settlement: "населенным пунктам",
    district: "районам",
    microdistrict: "микрорайонам",
    street: "улицам",
  };
  return labels[props.filters.groupBy] || "населенным пунктам";
};

const getCurrentGroupEntity = (item: SettlementData) => {
  switch (props.filters.groupBy) {
    case "region":
      return item.region;
    case "settlement":
      return item.settlement;
    case "district":
      return item.district;
    case "microdistrict":
      return item.microdistrict;
    case "street":
      return item.street;
    default:
      return item.settlement;
  }
};

// Функция для построения query параметров
const prepareRequestQuery = () => {
  const query: Record<string, any> = {};

  if (props.filters.regionName) query.region_name = props.filters.regionName;
  if (props.filters.settlementName) query.settlement_name = props.filters.settlementName;
  if (props.filters.districtName) query.district_name = props.filters.districtName;
  if (props.filters.microdistrictName) query.microdistrict_name = props.filters.microdistrictName;
  if (props.filters.streetName) query.street_name = props.filters.streetName;

  if (props.filters.settlementTypes.length > 0) {
    query.settlement_type_names = props.filters.settlementTypes;
  }

  return query;
};

// Функции подготовки графиков
const resetCharts = () => {
  try {
    propertyTypeChart.value.series = [];
    roomsChart.value.series = [];
    apartmentTypeChart.value.series = [];
    avgPricePerSqmChart.value.series = [];
    priceCategoriesChart.value.series = [];
    viewsLastTenDaysChart.value.series = [];
    priceBoxplotChart.value.series = [];
    areaBoxplotChart.value.series = [];

    if (avgPricePerSqmChart.value.options.xaxis) {
      avgPricePerSqmChart.value.options.xaxis.categories = [];
    }
    if (priceCategoriesChart.value.options.xaxis) {
      priceCategoriesChart.value.options.xaxis.categories = [];
    }
    if (viewsLastTenDaysChart.value.options.xaxis) {
      viewsLastTenDaysChart.value.options.xaxis.categories = [];
    }
    if (priceBoxplotChart.value.options.xaxis) {
      priceBoxplotChart.value.options.xaxis.categories = [];
    }
    if (areaBoxplotChart.value.options.xaxis) {
      areaBoxplotChart.value.options.xaxis.categories = [];
    }
  } catch (error) {
    console.error("Ошибка при сбросе графиков:", error);
  }
};

const preparePropertyTypeChartData = (data: SettlementData[]) => {
  const propertyTypeCounts: Record<string, number> = {};

  data.forEach((item) => {
    item.property_counts.forEach((property) => {
      const typeName = property.property_type_name;
      propertyTypeCounts[typeName] = (propertyTypeCounts[typeName] || 0) + property.count;
    });
  });

  const labels = Object.keys(propertyTypeCounts);
  const series = Object.values(propertyTypeCounts);

  propertyTypeChart.value.series = series;
  propertyTypeChart.value.options.labels = labels;
};

const prepareRoomsChartData = (data: SettlementData[]) => {
  const roomCounts = {
    Студия: 0,
    "1 комната": 0,
    "2 комнаты": 0,
    "3 комнаты": 0,
    "4 комнаты": 0,
    "5+ комнат": 0,
  };

  data.forEach((settlement) => {
    const rooms = settlement.apartments_summary.rooms;
    roomCounts["Студия"] += rooms.studio;
    roomCounts["1 комната"] += rooms["1"];
    roomCounts["2 комнаты"] += rooms["2"];
    roomCounts["3 комнаты"] += rooms["3"];
    roomCounts["4 комнаты"] += rooms["4"];
    roomCounts["5+ комнат"] += rooms["5_plus"];
  });

  const labels = Object.keys(roomCounts);
  const series = Object.values(roomCounts);

  const filteredData = labels.reduce(
    (acc: { labels: string[]; series: number[] }, label, index) => {
      if (series[index] > 0) {
        acc.labels.push(label);
        acc.series.push(series[index]);
      }
      return acc;
    },
    { labels: [], series: [] }
  );

  roomsChart.value.series = filteredData.series;
  roomsChart.value.options.labels = filteredData.labels;
};

const prepareApartmentTypeChartData = (data: SettlementData[]) => {
  let totalNewHouses = 0;
  let totalSecondaryHouses = 0;

  data.forEach((settlement) => {
    totalNewHouses += settlement.apartments_summary.new_houses_count;
    totalSecondaryHouses += settlement.apartments_summary.secondary_houses_count;
  });

  const totalApartments = totalNewHouses + totalSecondaryHouses;

  const secondaryPercent = totalApartments > 0 ? Math.round((totalSecondaryHouses / totalApartments) * 100) : 0;
  const newPercent = totalApartments > 0 ? Math.round((totalNewHouses / totalApartments) * 100) : 0;

  apartmentTypeChart.value.series = [secondaryPercent, newPercent];
};

const prepareAvgPricePerSqmChartData = (data: SettlementData[], categories: string[]) => {
  const validCategories: string[] = [];
  const seriesData: number[] = [];

  categories.forEach((category, index) => {
    const item = data[index];
    if (item && item.avg_price_per_square_meter !== null && item.avg_price_per_square_meter !== undefined && item.avg_price_per_square_meter > 0) {
      const entity = getCurrentGroupEntity(item);
      if (entity && entity.name) {
        validCategories.push(entity.name);
        seriesData.push(item.avg_price_per_square_meter);
      }
    }
  });

  const maxCategories = 100;
  const displayCategories = validCategories.slice(0, maxCategories);
  const displaySeriesData = seriesData.slice(0, maxCategories);

  avgPricePerSqmChart.value.series = [
    {
      name: "Средняя цена за м²",
      data: displaySeriesData,
    },
  ];

  avgPricePerSqmChart.value.options.xaxis.categories = displayCategories;
};

const preparePriceCategoriesChartData = (data: SettlementData[], categories: string[]) => {
  const validCategories: string[] = [];
  const cheapData: number[] = [];
  const normalData: number[] = [];
  const expensiveData: number[] = [];

  categories.forEach((category, index) => {
    const item = data[index];
    if (item && item.price_categories) {
      const entity = getCurrentGroupEntity(item);
      if (entity && entity.name) {
        validCategories.push(entity.name);
        cheapData.push(item.price_categories.cheap || 0);
        normalData.push(item.price_categories.normal || 0);
        expensiveData.push(item.price_categories.expensive || 0);
      }
    }
  });

  const maxCategories = 100;
  const displayCategories = validCategories.slice(0, maxCategories);
  const displayCheapData = cheapData.slice(0, maxCategories);
  const displayNormalData = normalData.slice(0, maxCategories);
  const displayExpensiveData = expensiveData.slice(0, maxCategories);

  priceCategoriesChart.value.series = [
    { name: "Дешевые", data: displayCheapData },
    { name: "Средние", data: displayNormalData },
    { name: "Дорогие", data: displayExpensiveData },
  ];

  priceCategoriesChart.value.options.xaxis.categories = displayCategories;
};

const prepareViewsLastTenDaysChartData = (data: SettlementData[], categories: string[]) => {
  const validCategories: string[] = [];
  const seriesData: number[] = [];

  categories.forEach((category, index) => {
    const item = data[index];
    if (item && item.last_ten_days_views_count !== undefined && item.last_ten_days_views_count > 0) {
      const entity = getCurrentGroupEntity(item);
      if (entity && entity.name) {
        validCategories.push(entity.name);
        seriesData.push(item.last_ten_days_views_count);
      }
    }
  });

  const maxCategories = 100;
  const displayCategories = validCategories.slice(0, maxCategories);
  const displaySeriesData = seriesData.slice(0, maxCategories);

  viewsLastTenDaysChart.value.series = [
    {
      name: "Просмотры за 10 дней",
      data: displaySeriesData,
    },
  ];

  viewsLastTenDaysChart.value.options.xaxis.categories = displayCategories;
};

const preparePriceBoxplotChartData = (data: SettlementData[], categories: string[]) => {
  const validCategories: string[] = [];
  const seriesData: any[] = [];

  categories.forEach((category, index) => {
    const item = data[index];
    if (item && item.price_boxplot && item.price_boxplot.min !== null && item.price_boxplot.max !== null && item.price_boxplot.min > 0) {
      const entity = getCurrentGroupEntity(item);
      if (entity && entity.name) {
        validCategories.push(entity.name);
        seriesData.push({
          x: entity.name,
          y: [item.price_boxplot.min, item.price_boxplot.q1, item.price_boxplot.median, item.price_boxplot.q3, item.price_boxplot.max],
        });
      }
    }
  });

  const maxCategories = 100;
  const displayCategories = validCategories.slice(0, maxCategories);
  const displaySeriesData = seriesData.slice(0, maxCategories);

  priceBoxplotChart.value.series = [
    {
      name: "Распределение цен",
      type: "boxPlot",
      data: displaySeriesData,
    },
  ];

  priceBoxplotChart.value.options.xaxis.categories = displayCategories;
};

const prepareAreaBoxplotChartData = (data: SettlementData[], categories: string[]) => {
  const validCategories: string[] = [];
  const seriesData: any[] = [];

  categories.forEach((category, index) => {
    const item = data[index];
    if (item && item.area_boxplot && item.area_boxplot.min !== null && item.area_boxplot.max !== null && item.area_boxplot.min > 0) {
      const entity = getCurrentGroupEntity(item);
      if (entity && entity.name) {
        validCategories.push(entity.name);
        seriesData.push({
          x: entity.name,
          y: [item.area_boxplot.min, item.area_boxplot.q1, item.area_boxplot.median, item.area_boxplot.q3, item.area_boxplot.max],
        });
      }
    }
  });

  const maxCategories = 100;
  const displayCategories = validCategories.slice(0, maxCategories);
  const displaySeriesData = seriesData.slice(0, maxCategories);

  areaBoxplotChart.value.series = [
    {
      name: "Распределение площадей",
      type: "boxPlot",
      data: displaySeriesData,
    },
  ];

  areaBoxplotChart.value.options.xaxis.categories = displayCategories;
};

// Переписанные запросы к API
const {
  data: totalStats,
  pending: loadingStats,
  error: statsError,
  refresh: loadPopularStats,
} = useAsyncData(
  "popular_stats" + prepareRequestQuery(),
  () =>
    $api<ApiResponse>("/analysis/popular_stats", {
      query: prepareRequestQuery(),
    }),
  {
    immediate: true,
    transform: (response) => ({
      total_offers: response.total_offers || 0,
      avg_price: response.avg_price || 0,
      avg_area_total: response.avg_area_total || 0,
      new_offers_today: response.new_offers_today || 0,
      top_offers_week: response.top_offers_week || [],
    }),
  }
);

const {
  data: settlementsData,
  pending: loadingSettlements,
  error: settlementsError,
  refresh: loadSettlementsData,
} = useAsyncData<SettlementData[]>(
  "offers_count_by_property_type" + prepareRequestQuery(),
  () =>
    $api("/analysis/offers_count_by_property_type", {
      params: {
        ...prepareRequestQuery(),
        group_by: props.filters.groupBy,
        ...(props.filters.minOffersCount > 0 && {
          min_offers_count: props.filters.minOffersCount,
        }),
        ...(props.filters.maxOffersCount !== null &&
          props.filters.maxOffersCount > 0 && {
            max_offers_count: props.filters.maxOffersCount,
          }),
      },
    }),
  {}
);

watch(
  settlementsData,
  (data) => {
    if (!data || data.length === 0) {
      resetCharts();
      return;
    }

    const categories = data.map((item) => {
      const entity = getCurrentGroupEntity(item);
      return entity?.name || "Неизвестно";
    });

    preparePropertyTypeChartData(data);
    prepareRoomsChartData(data);
    prepareApartmentTypeChartData(data);
    prepareAvgPricePerSqmChartData(data, categories);
    preparePriceCategoriesChartData(data, categories);
    prepareViewsLastTenDaysChartData(data, categories);
    preparePriceBoxplotChartData(data, categories);
    prepareAreaBoxplotChartData(data, categories);
  },
  { immediate: true }
);

const priceHistoryChart = ref({
  series: [],
  options: {
    chart: {
      type: "line",
      height: 400,
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM 'yy",
          day: "dd MMM",
          hour: "HH:mm",
        },
      },
    },
    yaxis: {
      title: { text: "Средняя цена (₽)" },
      labels: {
        formatter: (val: number) => {
          if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
          if (val >= 1000) return (val / 1000).toFixed(0) + "K";
          return Math.round(val).toString();
        },
      },
    },
    tooltip: {
      x: { format: "dd MMM yyyy" },
      y: { formatter: (val: number) => new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " ₽" },
    },
    colors: ["#FF4560"],
    grid: { borderColor: "#f1f1f1" },
  },
});

const {
  data: priceHistoryData,
  pending: loadingPriceHistory,
  error: priceHistoryError,
  refresh: loadPriceHistoryData,
} = useAsyncData<PriceHistory[]>("average_prices_history" + prepareRequestQuery(), () => $api("/analysis/average-prices-history", { query: prepareRequestQuery() }));

watch(
  priceHistoryData,
  (newData) => {
    if (!newData) return;
    priceHistoryChart.value.series = [
      {
        name: "Средняя цена",
        data: newData.map((item) => ({
          x: new Date(item.date).getTime(),
          y: item.avg_price,
        })),
      },
    ];
  },
  { immediate: true }
);

const viewsHistoryChart = ref({
  series: [],
  options: {
    chart: {
      type: "line",
      height: 400,
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 5,
      hover: {
        size: 7,
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM 'yy",
          day: "dd MMM",
          hour: "HH:mm",
        },
      },
    },
    yaxis: {
      title: {
        text: "Количество просмотров",
      },
      labels: {
        formatter: function (val: number) {
          if (val >= 1000000) {
            return (val / 1000000).toFixed(1) + "M";
          } else if (val >= 1000) {
            return (val / 1000).toFixed(0) + "K";
          }
          return Math.round(val).toString();
        },
      },
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy",
      },
      y: {
        formatter: function (val: number) {
          return new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " просмотров";
        },
      },
    },
    colors: ["#00E396"],
    grid: {
      borderColor: "#f1f1f1",
    },
  },
});

const {
  data: viewsHistoryData,
  pending: loadingViewsHistory,
  error: viewsHistoryError,
  refresh: loadViewsHistoryData,
} = useAsyncData<ViewsHistory[]>("offers_views_last_10_days" + prepareRequestQuery(), () =>
  $api("/analysis/offers/views_last_10_days", {
    query: prepareRequestQuery(),
  })
);

watch(
  viewsHistoryData,
  (data) => {
    if (!data?.length) {
      viewsHistoryChart.value.series = [];
      return;
    }

    viewsHistoryChart.value.series = [
      {
        name: "Количество просмотров",
        data: data.map((item) => ({
          x: new Date(item.date).getTime(),
          y: item.views,
        })),
      },
    ];
  },
  { immediate: true }
);

const applyFilters = () => {
  mainAnalyticsTitle.value = generateComparisonTitle(props.filters);
  loadPopularStats();
  loadSettlementsData();
  loadPriceHistoryData();
  loadViewsHistoryData();
};

const formatPrice = (value: number) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1).replace(".", ",") + " млн";
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1).replace(".", ",") + " тыс";
  }
  return new Intl.NumberFormat("ru-RU").format(value);
};

const formatPriceFull = (value: number) => {
  return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU");
};

const mainAnalyticsTitle = ref("Основная аналитика");
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

  if (filters.groupBy !== "region" && filters.settlementTypes.length > 0) {
    const typeLabels: { [key: string]: string } = {
      Город: "города",
      Деревня: "деревни",
      Поселок: "поселки",
    };
    // Проверяем, все ли типы выбраны (3 типа)
    const allTypesSelected = filters.settlementTypes.length === 3;
    if (!allTypesSelected) {
      const typeText = filters.settlementTypes.map((type) => typeLabels[type] || type).join(", ");
      title += ` (${typeText})`;
    }
  }

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

const openOffer = (offer: TopOffer) => {
  const router = useRouter();
  router.push(`/offers/${offer.id}`);
};
const drillDown = async (seriesIndex: number, dataPointIndex: number, chartType: string) => {
  if (!settlementsData.value) return;

  // Получаем выбранный элемент графика
  const item = settlementsData.value[dataPointIndex];
  console.log(item);
  if (!item) return;

  // В зависимости от уровня группировки устанавливаем новый фильтр
  switch (props.filters.groupBy) {
    case "region":
      // При клике на область передаем regionName
      props.filters.regionName = item.region?.name || "";
      props.filters.groupBy = "settlement";
      break;
    case "settlement":
      props.filters.settlementName = item.settlement?.name || "";
      props.filters.groupBy = "district";
      break;
    case "district":
      props.filters.districtName = item.district?.name || "";
      props.filters.groupBy = "street";
      break;
      // case "microdistrict":
      //   props.filters.microdistrictName = item.microdistrict?.name || "";
      //   props.filters.groupBy = "microdistrict";
      //   break;
      // case "street":
      //   props.filters.streetName = item.street?.name || "";
      //   props.filters.groupBy = "street";
      break;
    default:
      return;
  }

  // Применяем фильтры и перезагружаем данные
  await applyFilters();
};

onMounted(() => {
  applyFilters();
});
</script>

<style scoped>
.analytics-dashboard {
  width: 100%;
}

.sas {
  display: none;
}

.dashboard-title {
  margin-bottom: 2rem;
  text-align: center;
}

.dashboard-title h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
}

.stats-section {
  width: 100%;
}

.charts-row-two {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  width: 100%;
  margin-bottom: 2rem;
}

.charts-row-sas {
  display: grid;
  grid-template-columns: minmax(100px, 3fr) minmax(100px, 1fr);
  gap: 1rem;
  width: 100%;
}

.total-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-third {
  min-width: 0;
}

.popular-offers {
  min-width: 0;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  text-align: center;
  border: 1px solid #e2e8f0;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  color: #718096;
  font-size: 0.9rem;
  text-transform: uppercase;
  font-weight: 600;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color: #2d3748;
}

.chart-toggle-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toggle-btn {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.toggle-btn:hover {
  background-color: #e5e7eb;
}

.toggle-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.full-width-chart {
  width: 100%;
}

.chart-container-group {
  width: fit-content;
  padding-right: 10px;
  margin: 0 auto;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .total-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-row-two {
    grid-template-columns: 1fr;
  }

  .charts-row-sas {
    grid-template-columns: 1fr;
  }

  .chart-toggle-buttons {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .total-stats {
    grid-template-columns: 1fr;
  }

  .chart-toggle-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .toggle-btn {
    text-align: center;
    white-space: normal;
    word-break: break-word;
    padding: 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
