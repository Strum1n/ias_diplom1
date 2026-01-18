import { _ as _sfc_main$2 } from './CheckboxGroup-CSVX-9-l.mjs';
import { _ as _sfc_main$3 } from './Icon-DX0OfCis.mjs';
import { _ as _sfc_main$4 } from './Button-BL6TDcLa.mjs';
import { defineComponent, ref, computed, withAsyncContext, mergeProps, watch, resolveComponent, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderList, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc, a as useNuxtApp } from './server.mjs';
import { u as useAsyncData } from './asyncData-DVeqSZBv.mjs';
import 'reka-ui';
import '@vueuse/core';
import './useFormField-C7CorFZK.mjs';
import './index-CED3XvSe.mjs';
import '../_/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:url';
import 'unhead/server';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import '@iconify/utils';
import 'consola';
import 'node:path';
import './tv-sfLME4AL.mjs';
import 'tailwind-variants';
import './Checkbox-DYXK6_Q4.mjs';
import './index-gA-qUlDT.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import './Avatar-Bz_JyLmu.mjs';
import './virtual_nuxt_G__My_Programs_ias_diplom1_app_frontend_nuxt-app_node_modules_.cache_nuxt_.nuxt_ui-image-component-CX5_T5UE.mjs';
import './Link-gmgU2Miy.mjs';
import './nuxt-link-DYDQwZUP.mjs';
import 'vue-router';
import 'jwt-decode';
import 'tailwindcss/colors';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AnalyticsDashboard",
  __ssrInlineRender: true,
  props: {
    filters: {},
    title: {}
  },
  emits: ["data-loaded"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { $api } = useNuxtApp();
    const activeChart = ref("priceCategories");
    const priceCategoriesChart = ref({
      series: [],
      options: {
        grid: {
          padding: {
            top: 0,
            right: 0,
            bottom: -10,
            left: 0
          }
        },
        chart: {
          type: "bar",
          stacked: true
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
                  fontWeight: 900
                }
              }
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function(val) {
            return val > 0 ? Math.round(val).toLocaleString("ru-RU") : "";
          },
          style: {
            fontSize: "10px",
            colors: ["#fff"]
          }
        },
        xaxis: {
          categories: [],
          labels: {
            rotate: -45,
            style: {
              fontSize: "12px"
            }
          }
        },
        yaxis: {
          title: {
            text: "Количество объявлений по категориям"
          },
          labels: {
            formatter: function(val) {
              if (val >= 1e6) {
                return (val / 1e6).toFixed(1) + "M";
              } else if (val >= 1e3) {
                return (val / 1e3).toFixed(0) + "K";
              }
              return Math.round(val).toString();
            }
          }
        },
        tooltip: {
          y: {
            formatter: function(val) {
              return new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " объявлений";
            }
          }
        },
        colors: ["#00E396", "#008FFB", "#FF4560"],
        legend: {
          position: "top",
          horizontalAlign: "center"
        },
        fill: {
          opacity: 1
        }
      }
    });
    const propertyTypeChart = ref({
      series: [],
      options: {
        chart: {
          type: "donut",
          height: 250
        },
        labels: [],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: "bottom"
              }
            }
          }
        ],
        legend: {
          position: "right",
          horizontalAlign: "center",
          fontSize: "14px",
          markers: {
            width: 12,
            height: 12,
            radius: 12
          },
          itemMargin: {
            horizontal: 10,
            vertical: 5
          }
        },
        tooltip: {
          y: {
            formatter: function(val) {
              return val.toString() + " объявлений";
            }
          }
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
                  formatter: function(w) {
                    return w.globals.seriesTotals.reduce((a, b) => a + b, 0).toString();
                  }
                }
              }
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function(val, { seriesIndex, w }) {
            return w.config.labels[seriesIndex] + ": " + Math.round(val) + "%";
          },
          dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            opacity: 0.45
          }
        }
      }
    });
    const roomsChart = ref({
      series: [],
      options: {
        chart: {
          type: "pie",
          height: 250
        },
        labels: [],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: "bottom"
              }
            }
          }
        ],
        legend: {
          position: "right",
          horizontalAlign: "center",
          fontSize: "14px",
          markers: {
            width: 12,
            height: 12,
            radius: 12
          },
          itemMargin: {
            horizontal: 10,
            vertical: 5
          }
        },
        tooltip: {
          y: {
            formatter: function(val) {
              return val.toString() + " объявлений";
            }
          }
        },
        plotOptions: {
          pie: {
            customScale: 1,
            donut: {
              size: "0%"
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function(val, { seriesIndex, w }) {
            return w.config.labels[seriesIndex] + ": " + Math.round(val) + "%";
          },
          dropShadow: {
            enabled: true,
            top: 1,
            left: 1,
            blur: 1,
            opacity: 0.45
          }
        }
      }
    });
    const avgPricePerSqmChart = ref({
      series: [],
      options: {
        chart: {
          type: "bar",
          height: "auto"
        },
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 4,
            distributed: true
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function(val) {
            return new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " ₽";
          },
          offsetY: -20,
          style: {
            fontSize: "12px",
            colors: ["#304758"]
          }
        },
        xaxis: {
          categories: [],
          labels: {
            rotate: -45,
            style: {
              fontSize: "12px"
            }
          }
        },
        yaxis: {
          title: {
            text: "Средняя цена за м² (₽)"
          },
          labels: {
            formatter: function(val) {
              if (val >= 1e6) {
                return (val / 1e6).toFixed(1) + "M";
              } else if (val >= 1e3) {
                return (val / 1e3).toFixed(0) + "K";
              }
              return Math.round(val).toString();
            }
          }
        },
        tooltip: {
          intersect: false,
          y: {
            formatter: function(val) {
              return new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " ₽";
            }
          }
        },
        colors: [],
        legend: {
          show: false
        }
      }
    });
    const viewsLastTenDaysChart = ref({
      series: [],
      options: {
        chart: {
          type: "bar",
          height: "auto"
        },
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 4,
            distributed: true
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function(val) {
            if (val >= 1e6) {
              return (val / 1e6).toFixed(1) + "M";
            } else if (val >= 1e3) {
              return (val / 1e3).toFixed(0) + "K";
            }
            return Math.round(val).toString();
          },
          offsetY: -20,
          style: {
            fontSize: "12px",
            colors: ["#304758"]
          }
        },
        xaxis: {
          categories: [],
          labels: {
            rotate: -45,
            style: {
              fontSize: "12px"
            }
          }
        },
        yaxis: {
          title: {
            text: "Просмотры за 10 дней"
          },
          labels: {
            formatter: function(val) {
              if (val >= 1e6) {
                return (val / 1e6).toFixed(1) + "M";
              } else if (val >= 1e3) {
                return (val / 1e3).toFixed(0) + "K";
              }
              return Math.round(val).toString();
            }
          }
        },
        tooltip: {
          y: {
            formatter: function(val) {
              return new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " просмотров";
            }
          }
        },
        colors: [],
        legend: {
          show: false
        }
      }
    });
    const apartmentTypeChart = ref({
      series: [],
      options: {
        chart: {
          height: 250,
          type: "radialBar"
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
              image: void 0
            },
            dataLabels: {
              name: {
                show: false
              },
              value: {
                show: false
              }
            },
            barLabels: {
              enabled: true,
              useSeriesColors: true,
              offsetX: -8,
              fontSize: "16px",
              formatter: function(seriesName, opts) {
                return seriesName + ": " + opts.w.globals.series[opts.seriesIndex] + "%";
              }
            }
          }
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
            radius: 12
          },
          itemMargin: {
            horizontal: 10,
            vertical: 5
          }
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                height: 350
              },
              legend: {
                show: true,
                position: "bottom"
              }
            }
          }
        ]
      }
    });
    const priceBoxplotChart = ref({
      series: [],
      options: {
        chart: {
          type: "boxPlot",
          height: "auto"
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
            horizontal: false
          },
          boxPlot: {
            colors: {
              upper: "#008FFB",
              lower: "#00E396"
            }
          }
        },
        xaxis: {
          categories: [],
          labels: {
            rotate: -45,
            style: {
              fontSize: "12px"
            }
          }
        },
        yaxis: {
          title: {
            text: "Цена (₽)"
          },
          labels: {
            formatter: function(val) {
              if (val >= 1e6) {
                return (val / 1e6).toFixed(1) + "M";
              } else if (val >= 1e3) {
                return (val / 1e3).toFixed(0) + "K";
              }
              return Math.round(val).toString();
            }
          }
        },
        tooltip: {
          y: {
            formatter: function(val) {
              return new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " ₽";
            }
          }
        }
      }
    });
    const areaBoxplotChart = ref({
      series: [],
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
              reset: true
            }
          }
        },
        plotOptions: {
          bar: {
            horizontal: false
          },
          boxPlot: {
            colors: {
              upper: "#008FFB",
              lower: "#00E396"
            }
          }
        },
        xaxis: {
          categories: [],
          labels: {
            rotate: -45,
            style: {
              fontSize: "12px"
            }
          }
        },
        yaxis: {
          title: {
            text: "Площадь (м²)"
          },
          labels: {
            formatter: function(val) {
              return Math.round(val).toString() + " м²";
            }
          }
        },
        tooltip: {
          shared: false,
          intersect: false,
          y: {
            formatter: function(val) {
              return Math.round(val).toString() + " м²";
            }
          }
        }
      }
    });
    const setActiveChart = (chartType) => {
      activeChart.value = chartType;
    };
    const getCurrentChartTitle = () => {
      const titles = {
        priceCategories: `Ценовые категории по ${getGroupByLabel()} (100 первых в порядке убывания по кол-ву объявлений)`,
        avgPricePerSqm: `Средняя цена за м² по ${getGroupByLabel()}`,
        viewsLastTenDays: `Просмотры за 10 дней по ${getGroupByLabel()}`,
        priceBoxplot: `Распределение цен по ${getGroupByLabel()}`,
        areaBoxplot: `Распределение площадей по ${getGroupByLabel()}`
      };
      return titles[activeChart.value] || titles.priceCategories;
    };
    const getGroupByLabel = () => {
      const labels = {
        region: "регионам",
        settlement: "населенным пунктам",
        district: "районам",
        microdistrict: "микрорайонам",
        street: "улицам"
      };
      return labels[props.filters.groupBy] || "населенным пунктам";
    };
    const getCurrentGroupEntity = (item) => {
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
    const prepareRequestQuery = () => {
      const query = {};
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
    const preparePropertyTypeChartData = (data) => {
      const propertyTypeCounts = {};
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
    const prepareRoomsChartData = (data) => {
      const roomCounts = {
        Студия: 0,
        "1 комната": 0,
        "2 комнаты": 0,
        "3 комнаты": 0,
        "4 комнаты": 0,
        "5+ комнат": 0
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
        (acc, label, index) => {
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
    const prepareApartmentTypeChartData = (data) => {
      let totalNewHouses = 0;
      let totalSecondaryHouses = 0;
      data.forEach((settlement) => {
        totalNewHouses += settlement.apartments_summary.new_houses_count;
        totalSecondaryHouses += settlement.apartments_summary.secondary_houses_count;
      });
      const totalApartments = totalNewHouses + totalSecondaryHouses;
      const secondaryPercent = totalApartments > 0 ? Math.round(totalSecondaryHouses / totalApartments * 100) : 0;
      const newPercent = totalApartments > 0 ? Math.round(totalNewHouses / totalApartments * 100) : 0;
      apartmentTypeChart.value.series = [secondaryPercent, newPercent];
    };
    const prepareAvgPricePerSqmChartData = (data, categories) => {
      const validCategories = [];
      const seriesData = [];
      categories.forEach((category, index) => {
        const item = data[index];
        if (item && item.avg_price_per_square_meter !== null && item.avg_price_per_square_meter !== void 0 && item.avg_price_per_square_meter > 0) {
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
          data: displaySeriesData
        }
      ];
      avgPricePerSqmChart.value.options.xaxis.categories = displayCategories;
    };
    const preparePriceCategoriesChartData = (data, categories) => {
      const validCategories = [];
      const cheapData = [];
      const normalData = [];
      const expensiveData = [];
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
        { name: "Дорогие", data: displayExpensiveData }
      ];
      priceCategoriesChart.value.options.xaxis.categories = displayCategories;
    };
    const prepareViewsLastTenDaysChartData = (data, categories) => {
      const validCategories = [];
      const seriesData = [];
      categories.forEach((category, index) => {
        const item = data[index];
        if (item && item.last_ten_days_views_count !== void 0 && item.last_ten_days_views_count > 0) {
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
          data: displaySeriesData
        }
      ];
      viewsLastTenDaysChart.value.options.xaxis.categories = displayCategories;
    };
    const preparePriceBoxplotChartData = (data, categories) => {
      const validCategories = [];
      const seriesData = [];
      categories.forEach((category, index) => {
        const item = data[index];
        if (item && item.price_boxplot && item.price_boxplot.min !== null && item.price_boxplot.max !== null && item.price_boxplot.min > 0) {
          const entity = getCurrentGroupEntity(item);
          if (entity && entity.name) {
            validCategories.push(entity.name);
            seriesData.push({
              x: entity.name,
              y: [item.price_boxplot.min, item.price_boxplot.q1, item.price_boxplot.median, item.price_boxplot.q3, item.price_boxplot.max]
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
          data: displaySeriesData
        }
      ];
      priceBoxplotChart.value.options.xaxis.categories = displayCategories;
    };
    const prepareAreaBoxplotChartData = (data, categories) => {
      const validCategories = [];
      const seriesData = [];
      categories.forEach((category, index) => {
        const item = data[index];
        if (item && item.area_boxplot && item.area_boxplot.min !== null && item.area_boxplot.max !== null && item.area_boxplot.min > 0) {
          const entity = getCurrentGroupEntity(item);
          if (entity && entity.name) {
            validCategories.push(entity.name);
            seriesData.push({
              x: entity.name,
              y: [item.area_boxplot.min, item.area_boxplot.q1, item.area_boxplot.median, item.area_boxplot.q3, item.area_boxplot.max]
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
          data: displaySeriesData
        }
      ];
      areaBoxplotChart.value.options.xaxis.categories = displayCategories;
    };
    const {
      data: totalStats,
      pending: loadingStats,
      error: statsError,
      refresh: loadPopularStats
    } = useAsyncData(
      "popular_stats" + prepareRequestQuery(),
      () => $api("/analysis/popular_stats", {
        query: prepareRequestQuery()
      }),
      {
        immediate: true,
        transform: (response) => ({
          total_offers: response.total_offers || 0,
          avg_price: response.avg_price || 0,
          avg_area_total: response.avg_area_total || 0,
          new_offers_today: response.new_offers_today || 0,
          top_offers_week: response.top_offers_week || []
        })
      }
    );
    const {
      data: settlementsData,
      pending: loadingSettlements,
      error: settlementsError,
      refresh: loadSettlementsData
    } = useAsyncData(
      "offers_count_by_property_type" + prepareRequestQuery(),
      () => $api("/analysis/offers_count_by_property_type", {
        params: {
          ...prepareRequestQuery(),
          group_by: props.filters.groupBy,
          ...props.filters.minOffersCount > 0 && {
            min_offers_count: props.filters.minOffersCount
          },
          ...props.filters.maxOffersCount !== null && props.filters.maxOffersCount > 0 && {
            max_offers_count: props.filters.maxOffersCount
          }
        }
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
            autoScaleYaxis: true
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
              reset: true
            }
          }
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
              hour: "HH:mm"
            }
          }
        },
        yaxis: {
          title: { text: "Средняя цена (₽)" },
          labels: {
            formatter: (val) => {
              if (val >= 1e6) return (val / 1e6).toFixed(1) + "M";
              if (val >= 1e3) return (val / 1e3).toFixed(0) + "K";
              return Math.round(val).toString();
            }
          }
        },
        tooltip: {
          x: { format: "dd MMM yyyy" },
          y: { formatter: (val) => new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " ₽" }
        },
        colors: ["#FF4560"],
        grid: { borderColor: "#f1f1f1" }
      }
    });
    const {
      data: priceHistoryData,
      pending: loadingPriceHistory,
      error: priceHistoryError,
      refresh: loadPriceHistoryData
    } = useAsyncData("average_prices_history" + prepareRequestQuery(), () => $api("/analysis/average-prices-history", { query: prepareRequestQuery() }), "$N0wZ395SML");
    watch(
      priceHistoryData,
      (newData) => {
        if (!newData) return;
        priceHistoryChart.value.series = [
          {
            name: "Средняя цена",
            data: newData.map((item) => ({
              x: new Date(item.date).getTime(),
              y: item.avg_price
            }))
          }
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
            autoScaleYaxis: true
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
              reset: true
            }
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: "smooth",
          width: 3
        },
        markers: {
          size: 5,
          hover: {
            size: 7
          }
        },
        xaxis: {
          type: "datetime",
          labels: {
            datetimeFormatter: {
              year: "yyyy",
              month: "MMM 'yy",
              day: "dd MMM",
              hour: "HH:mm"
            }
          }
        },
        yaxis: {
          title: {
            text: "Количество просмотров"
          },
          labels: {
            formatter: function(val) {
              if (val >= 1e6) {
                return (val / 1e6).toFixed(1) + "M";
              } else if (val >= 1e3) {
                return (val / 1e3).toFixed(0) + "K";
              }
              return Math.round(val).toString();
            }
          }
        },
        tooltip: {
          x: {
            format: "dd MMM yyyy"
          },
          y: {
            formatter: function(val) {
              return new Intl.NumberFormat("ru-RU").format(Math.round(val)) + " просмотров";
            }
          }
        },
        colors: ["#00E396"],
        grid: {
          borderColor: "#f1f1f1"
        }
      }
    });
    const {
      data: viewsHistoryData,
      pending: loadingViewsHistory,
      error: viewsHistoryError,
      refresh: loadViewsHistoryData
    } = useAsyncData(
      "offers_views_last_10_days" + prepareRequestQuery(),
      () => $api("/analysis/offers/views_last_10_days", {
        query: prepareRequestQuery()
      }),
      "$pg4U0WS7sH"
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
              y: item.views
            }))
          }
        ];
      },
      { immediate: true }
    );
    const formatPrice = (value) => {
      if (value >= 1e6) {
        return (value / 1e6).toFixed(1).replace(".", ",") + " млн";
      } else if (value >= 1e3) {
        return (value / 1e3).toFixed(1).replace(".", ",") + " тыс";
      }
      return new Intl.NumberFormat("ru-RU").format(value);
    };
    const formatPriceFull = (value) => {
      return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " ₽";
    };
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("ru-RU");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$3;
      const _component_apexchart = resolveComponent("apexchart");
      const _component_UButton = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "analytics-dashboard" }, _attrs))} data-v-18907ebe>`);
      if (__props.title) {
        _push(`<div class="dashboard-title" data-v-18907ebe><h2 data-v-18907ebe>${ssrInterpolate(__props.title)}</h2></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="stats-section" data-v-18907ebe><div class="total-stats" data-v-18907ebe><div class="stat-card" data-v-18907ebe><h3 data-v-18907ebe>Всего объектов</h3><p class="stat-number" data-v-18907ebe>`);
      if (unref(loadingStats)) {
        _push(`<!--[-->🔄<!--]-->`);
      } else {
        _push(`<!--[-->🏠 ${ssrInterpolate(unref(totalStats).total_offers)}<!--]-->`);
      }
      _push(`</p></div><div class="stat-card" data-v-18907ebe><h3 data-v-18907ebe>Средняя цена</h3><p class="stat-number" data-v-18907ebe>`);
      if (unref(loadingStats)) {
        _push(`<!--[-->🔄<!--]-->`);
      } else {
        _push(`<!--[-->💰 ${ssrInterpolate(formatPrice(unref(totalStats).avg_price))}<!--]-->`);
      }
      _push(`</p></div><div class="stat-card" data-v-18907ebe><h3 data-v-18907ebe>Средняя площадь</h3><p class="stat-number flex justify-center gap-2" data-v-18907ebe>`);
      if (unref(loadingStats)) {
        _push(ssrRenderComponent(_component_UIcon, {
          name: "line-md:loading-loop",
          class: "size-8"
        }, null, _parent));
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "bx:area",
          class: "size-8"
        }, null, _parent));
        _push(` ${ssrInterpolate(Math.round(unref(totalStats).avg_area_total))} м² <!--]-->`);
      }
      _push(`</p></div><div class="stat-card" data-v-18907ebe><h3 data-v-18907ebe>Новых сегодня</h3><p class="stat-number" data-v-18907ebe>`);
      if (unref(loadingStats)) {
        _push(`<!--[-->🔄<!--]-->`);
      } else {
        _push(`<!--[-->🆕 ${ssrInterpolate(unref(totalStats).new_offers_today)}<!--]-->`);
      }
      _push(`</p></div></div></div><div class="sas" data-v-18907ebe><div id="price-boxplot-chart" class="chart-container collapse" data-v-18907ebe>`);
      _push(ssrRenderComponent(_component_apexchart, {
        type: "boxPlot",
        height: "500",
        options: unref(priceBoxplotChart).options,
        series: unref(priceBoxplotChart).series
      }, null, _parent));
      _push(`</div><div id="area-boxplot-chart" class="chart-container collapse" data-v-18907ebe>`);
      _push(ssrRenderComponent(_component_apexchart, {
        type: "boxPlot",
        height: "500",
        options: unref(areaBoxplotChart).options,
        series: unref(areaBoxplotChart).series
      }, null, _parent));
      _push(`</div></div><div class="charts-row-two" data-v-18907ebe><div class="full-width-chart" data-v-18907ebe><div class="bg-white rounded-xl shadow p-6 h-full" data-v-18907ebe><h2 class="text-xl font-semibold mb-4" data-v-18907ebe>История средней цены</h2>`);
      if (unref(loadingPriceHistory)) {
        _push(`<div class="flex justify-center items-center py-8 h-100" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "line-md:loading-loop",
          class: "size-10"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(priceHistoryChart).series.length > 0) {
        _push(`<div id="price-history-chart" class="chart-container" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "line",
          height: "400",
          options: unref(priceHistoryChart).options,
          series: unref(priceHistoryChart).series
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="flex justify-center items-center py-8 text-gray-500" data-v-18907ebe>Нет данных для отображения</div>`);
      }
      _push(`</div></div><div class="full-width-chart" data-v-18907ebe><div class="bg-white rounded-xl shadow p-6 h-full" data-v-18907ebe><h2 class="text-xl font-semibold mb-4" data-v-18907ebe>Количество просмотров за последние 10 дней</h2>`);
      if (unref(loadingViewsHistory)) {
        _push(`<div class="flex justify-center items-center py-8 h-100" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "line-md:loading-loop",
          class: "size-10"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(viewsHistoryChart).series.length > 0) {
        _push(`<div id="views-history-chart" class="chart-container" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "line",
          height: "400",
          options: unref(viewsHistoryChart).options,
          series: unref(viewsHistoryChart).series
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="flex justify-center items-center py-8 text-gray-500" data-v-18907ebe>Нет данных для отображения</div>`);
      }
      _push(`</div></div></div><div class="charts-row-sas" data-v-18907ebe><div class="grid gap-2 h-fit" data-v-18907ebe><div class="flex justify-between items-center mb-4" data-v-18907ebe><h2 class="font-semibold" data-v-18907ebe>${ssrInterpolate(getCurrentChartTitle())}</h2><div class="chart-toggle-buttons" data-v-18907ebe>`);
      _push(ssrRenderComponent(_component_UButton, {
        size: "lg",
        color: "neutral",
        variant: "soft",
        onClick: ($event) => setActiveChart("priceCategories"),
        class: ["toggle-btn", unref(activeChart) === "priceCategories" ? "active" : ""]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Ценовые категории `);
          } else {
            return [
              createTextVNode(" Ценовые категории ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        size: "lg",
        color: "neutral",
        variant: "soft",
        onClick: ($event) => setActiveChart("avgPricePerSqm"),
        class: ["toggle-btn", unref(activeChart) === "avgPricePerSqm" ? "active" : ""]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Средняя цена за м² `);
          } else {
            return [
              createTextVNode(" Средняя цена за м² ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        size: "lg",
        color: "neutral",
        variant: "soft",
        onClick: ($event) => setActiveChart("viewsLastTenDays"),
        class: ["toggle-btn", unref(activeChart) === "viewsLastTenDays" ? "active" : ""]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Просмотры за 10 дней `);
          } else {
            return [
              createTextVNode(" Просмотры за 10 дней ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        size: "lg",
        color: "neutral",
        variant: "soft",
        onClick: ($event) => setActiveChart("priceBoxplot"),
        class: ["toggle-btn", unref(activeChart) === "priceBoxplot" ? "active" : ""]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Распределение цен `);
          } else {
            return [
              createTextVNode(" Распределение цен ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UButton, {
        size: "lg",
        color: "neutral",
        variant: "soft",
        onClick: ($event) => setActiveChart("areaBoxplot"),
        class: ["toggle-btn", unref(activeChart) === "areaBoxplot" ? "active" : ""]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Распределение площадей `);
          } else {
            return [
              createTextVNode(" Распределение площадей ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="bg-white rounded-xl overflow-auto shadow p-6 h-fit" data-v-18907ebe>`);
      if (unref(loadingSettlements)) {
        _push(`<div class="flex justify-center items-center py-8" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "line-md:loading-loop",
          class: "size-10"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(activeChart) === "priceCategories" && unref(priceCategoriesChart).series.length > 0) {
        _push(`<div id="price-categories-chart" class="chart-container-group" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "bar",
          height: 400,
          width: unref(priceCategoriesChart).options.xaxis.categories.length * 120 + 900,
          options: unref(priceCategoriesChart).options,
          series: unref(priceCategoriesChart).series
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(activeChart) === "avgPricePerSqm" && unref(avgPricePerSqmChart).series.length > 0) {
        _push(`<div id="avg-price-per-sqm-chart" class="chart-container-group" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "bar",
          height: 400,
          width: unref(avgPricePerSqmChart).options.xaxis.categories.length * 120 + 900,
          options: unref(avgPricePerSqmChart).options,
          series: unref(avgPricePerSqmChart).series
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(activeChart) === "viewsLastTenDays" && unref(viewsLastTenDaysChart).series.length > 0) {
        _push(`<div id="views-last-ten-days-chart" class="chart-container-group" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "bar",
          height: 400,
          width: unref(viewsLastTenDaysChart).options.xaxis.categories.length * 120 + 900,
          options: unref(viewsLastTenDaysChart).options,
          series: unref(viewsLastTenDaysChart).series
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(activeChart) === "priceBoxplot") {
        _push(`<div id="price-boxplot-chart" class="chart-container-group" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "boxPlot",
          height: 400,
          width: unref(priceBoxplotChart).options.xaxis.categories.length * 120 + 900,
          options: unref(priceBoxplotChart).options,
          series: unref(priceBoxplotChart).series
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(activeChart) === "areaBoxplot") {
        _push(`<div id="area-boxplot-chart" class="chart-container-group" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "boxPlot",
          height: 400,
          width: unref(priceBoxplotChart).options.xaxis.categories.length * 120 + 900,
          options: unref(areaBoxplotChart).options,
          series: unref(areaBoxplotChart).series
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="flex justify-center items-center py-8 text-gray-500" data-v-18907ebe>Нет данных для отображения</div>`);
      }
      _push(`</div><div class="popular-offers" data-v-18907ebe><div class="bg-white rounded-xl shadow p-6 h-full" data-v-18907ebe><h2 class="text-xl font-semibold mb-4" data-v-18907ebe>Популярные объявления за день</h2>`);
      if (unref(loadingStats)) {
        _push(`<div class="flex justify-center items-center py-8" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "line-md:loading-loop",
          class: "size-10"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="space-y-4" data-v-18907ebe><!--[-->`);
        ssrRenderList(unref(totalStats)?.top_offers_week, (offer) => {
          _push(`<div class="flex items-center justify-between p-4 hover:cursor-pointer bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" data-v-18907ebe><div class="flex-1" data-v-18907ebe><h3 class="font-semibold text-gray-900 text-sm mb-1" data-v-18907ebe>${ssrInterpolate(offer.title)}</h3><div class="flex items-center space-x-4 text-xs text-gray-600" data-v-18907ebe><span class="flex items-center" data-v-18907ebe><span class="w-2 h-2 bg-blue-500 rounded-full mr-1" data-v-18907ebe></span> ${ssrInterpolate(formatPrice(offer.price))}</span><span class="flex items-center" data-v-18907ebe><span class="w-2 h-2 bg-green-500 rounded-full mr-1" data-v-18907ebe></span> ${ssrInterpolate(offer.daily_views)} просмотров </span><span class="flex items-center" data-v-18907ebe><span class="w-2 h-2 bg-purple-500 rounded-full mr-1" data-v-18907ebe></span> ${ssrInterpolate(formatDate(offer.creation_date))}</span></div></div><div class="text-right ml-4" data-v-18907ebe><p class="font-bold text-gray-900 text-sm" data-v-18907ebe>${ssrInterpolate(formatPriceFull(offer.price_per_sqm))}</p><p class="text-xs text-gray-500" data-v-18907ebe>за м²</p></div></div>`);
        });
        _push(`<!--]-->`);
        if (unref(totalStats)?.top_offers_week.length === 0) {
          _push(`<div class="text-center py-4 text-gray-500" data-v-18907ebe>Нет популярных объявлений</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div></div></div><div class="grid gap-2" data-v-18907ebe><div class="chart-third" data-v-18907ebe><div class="bg-white rounded-xl shadow p-6 h-full" data-v-18907ebe><h2 class="text-xl font-semibold mb-4" data-v-18907ebe>Типы недвижимости</h2>`);
      if (unref(loadingSettlements)) {
        _push(`<div class="flex justify-center items-center py-8" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "line-md:loading-loop",
          class: "size-10"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(propertyTypeChart).series.length > 0) {
        _push(`<div id="property-type-chart" class="chart-container" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "donut",
          height: "250",
          options: unref(propertyTypeChart).options,
          series: unref(propertyTypeChart).series
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="flex justify-center items-center py-8 text-gray-500" data-v-18907ebe>Нет данных для отображения</div>`);
      }
      _push(`</div></div><div class="chart-third" data-v-18907ebe><div class="bg-white rounded-xl shadow p-6 h-full" data-v-18907ebe><h2 class="text-xl font-semibold mb-4" data-v-18907ebe>Квартиры по комнатам</h2>`);
      if (unref(loadingSettlements)) {
        _push(`<div class="flex justify-center items-center py-8" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "line-md:loading-loop",
          class: "size-10"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(roomsChart).series.length > 0) {
        _push(`<div id="rooms-chart" class="chart-container" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "pie",
          height: "250",
          options: unref(roomsChart).options,
          series: unref(roomsChart).series
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="flex justify-center items-center py-8 text-gray-500" data-v-18907ebe>Нет данных для отображения</div>`);
      }
      _push(`</div></div><div class="chart-third" data-v-18907ebe><div class="bg-white rounded-xl shadow p-6 h-full" data-v-18907ebe><h2 class="text-xl font-semibold mb-4" data-v-18907ebe>Новостройки vs Вторичка</h2>`);
      if (unref(loadingSettlements)) {
        _push(`<div class="flex justify-center items-center py-8" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "line-md:loading-loop",
          class: "size-10"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(apartmentTypeChart).series.length > 0) {
        _push(`<div id="apartment-type-chart" class="chart-container" data-v-18907ebe>`);
        _push(ssrRenderComponent(_component_apexchart, {
          type: "radialBar",
          height: "250",
          options: unref(apartmentTypeChart).options,
          series: unref(apartmentTypeChart).series
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="flex justify-center items-center py-8 text-gray-500" data-v-18907ebe>Нет данных для отображения</div>`);
      }
      _push(`</div></div></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AnalyticsDashboard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-18907ebe"]]), { __name: "AnalyticsDashboard" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "board",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const settlementTypeOptions = ref([
      { value: "город", label: "Город" },
      { value: "поселок", label: "Поселок" },
      { value: "деревня", label: "Деревня" }
    ]);
    const filters = ref({
      groupBy: "region",
      regionName: "",
      settlementName: "",
      districtName: "",
      microdistrictName: "",
      streetName: "",
      settlementTypes: [],
      minOffersCount: null,
      maxOffersCount: null
    });
    const comparisonItems = ref([]);
    const mainAnalyticsTitle = ref("Основная аналитика");
    const dashboardKey = ref(0);
    const autocompleteResults = ref({
      region: [],
      settlement: [],
      district: [],
      microdistrict: [],
      street: []
    });
    const showAutocomplete = computed(() => ({
      region: autocompleteResults.value.region.length > 0,
      settlement: autocompleteResults.value.settlement.length > 0,
      district: autocompleteResults.value.district.length > 0,
      microdistrict: autocompleteResults.value.microdistrict.length > 0,
      street: autocompleteResults.value.street.length > 0
    }));
    const shouldShowRegionInput = computed(() => {
      return filters.value.groupBy !== "region";
    });
    const shouldShowSettlementInput = computed(() => {
      return ["district", "microdistrict", "street"].includes(filters.value.groupBy);
    });
    const shouldShowDistrictInput = computed(() => {
      return ["microdistrict", "street"].includes(filters.value.groupBy);
    });
    const shouldShowMicrodistrictInput = computed(() => {
      return filters.value.groupBy === "street";
    });
    const { $api } = useNuxtApp();
    const autocompleteQuery = ref({
      query: "",
      type: "",
      limit: 10
    });
    const {
      data,
      pending,
      error,
      refresh: refreshAutocomplete
    } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "autocomplete-filters",
      () => $api("/offers/autocomplete-filters", {
        params: autocompleteQuery.value
      }),
      {
        immediate: false,
        transform: (response) => {
          const type = autocompleteQuery.value.type;
          if (!type) return response;
          autocompleteResults.value[type] = response.results;
          return response.results;
        }
      }
    )), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UCheckboxGroup = _sfc_main$2;
      const _component_AnalyticsDashboard = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "dashboard" }, _attrs))} data-v-316fe317><h1 data-v-316fe317>Аналитика рынка</h1><div class="rounded-lg ring ring-default filters-panel" data-v-316fe317><div class="filter-group" data-v-316fe317><label for="group-by" data-v-316fe317>Уровень группировки:</label><select id="group-by" data-v-316fe317><option value="region" data-v-316fe317${ssrIncludeBooleanAttr(Array.isArray(filters.value.groupBy) ? ssrLooseContain(filters.value.groupBy, "region") : ssrLooseEqual(filters.value.groupBy, "region")) ? " selected" : ""}>Регион</option><option value="settlement" data-v-316fe317${ssrIncludeBooleanAttr(Array.isArray(filters.value.groupBy) ? ssrLooseContain(filters.value.groupBy, "settlement") : ssrLooseEqual(filters.value.groupBy, "settlement")) ? " selected" : ""}>Населенный пункт</option><option value="district" data-v-316fe317${ssrIncludeBooleanAttr(Array.isArray(filters.value.groupBy) ? ssrLooseContain(filters.value.groupBy, "district") : ssrLooseEqual(filters.value.groupBy, "district")) ? " selected" : ""}>Район</option><option value="microdistrict" data-v-316fe317${ssrIncludeBooleanAttr(Array.isArray(filters.value.groupBy) ? ssrLooseContain(filters.value.groupBy, "microdistrict") : ssrLooseEqual(filters.value.groupBy, "microdistrict")) ? " selected" : ""}>Микрорайон</option><option value="street" data-v-316fe317${ssrIncludeBooleanAttr(Array.isArray(filters.value.groupBy) ? ssrLooseContain(filters.value.groupBy, "street") : ssrLooseEqual(filters.value.groupBy, "street")) ? " selected" : ""}>Улица</option></select></div>`);
      if (shouldShowRegionInput.value) {
        _push(`<div class="filter-group" data-v-316fe317><label for="region" data-v-316fe317>Название области:</label><input id="region" type="text"${ssrRenderAttr("value", filters.value.regionName)} placeholder="Например: Москва" data-v-316fe317>`);
        if (showAutocomplete.value.region) {
          _push(`<div class="autocomplete-dropdown" data-v-316fe317><!--[-->`);
          ssrRenderList(autocompleteResults.value.region, (result) => {
            _push(`<div class="autocomplete-item" data-v-316fe317>${ssrInterpolate(result)}</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (shouldShowSettlementInput.value) {
        _push(`<div class="filter-group" data-v-316fe317><label for="settlement" data-v-316fe317>Название населенного пункта:</label><input id="settlement" type="text"${ssrRenderAttr("value", filters.value.settlementName)} placeholder="Например: Железнодорожный" data-v-316fe317>`);
        if (autocompleteResults.value.settlement.length > 0 && showAutocomplete.value.settlement) {
          _push(`<div class="autocomplete-dropdown" data-v-316fe317><!--[-->`);
          ssrRenderList(autocompleteResults.value.settlement, (result) => {
            _push(`<div class="autocomplete-item" data-v-316fe317>${ssrInterpolate(result)}</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (shouldShowDistrictInput.value) {
        _push(`<div class="filter-group" data-v-316fe317><label for="district" data-v-316fe317>Название района:</label><input id="district" type="text"${ssrRenderAttr("value", filters.value.districtName)} placeholder="Например: Центральный" data-v-316fe317>`);
        if (autocompleteResults.value.district.length > 0 && showAutocomplete.value.district) {
          _push(`<div class="autocomplete-dropdown" data-v-316fe317><!--[-->`);
          ssrRenderList(autocompleteResults.value.district, (result) => {
            _push(`<div class="autocomplete-item" data-v-316fe317>${ssrInterpolate(result)}</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (shouldShowMicrodistrictInput.value) {
        _push(`<div class="filter-group" data-v-316fe317><label for="microdistrict" data-v-316fe317>Название микрорайона:</label><input id="microdistrict" type="text"${ssrRenderAttr("value", filters.value.microdistrictName)} placeholder="Например: Серебрянка" data-v-316fe317>`);
        if (autocompleteResults.value.microdistrict.length > 0 && showAutocomplete.value.microdistrict) {
          _push(`<div class="autocomplete-dropdown" data-v-316fe317><!--[-->`);
          ssrRenderList(autocompleteResults.value.microdistrict, (result) => {
            _push(`<div class="autocomplete-item" data-v-316fe317>${ssrInterpolate(result)}</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (filters.value.groupBy !== "region") {
        _push(`<div class="filter-group" data-v-316fe317><label data-v-316fe317>Типы населенных пунктов:</label>`);
        _push(ssrRenderComponent(_component_UCheckboxGroup, {
          modelValue: filters.value.settlementTypes,
          "onUpdate:modelValue": ($event) => filters.value.settlementTypes = $event,
          items: settlementTypeOptions.value
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="filter-group" data-v-316fe317><button class="comparison-btn" data-v-316fe317>📊 Добавить к сравнению</button></div><div class="filter-group" data-v-316fe317><button class="apply-btn" data-v-316fe317>Применить фильтры</button></div><div class="filter-group" data-v-316fe317><button class="reset-btn" data-v-316fe317>Сбросить фильтры</button></div></div>`);
      _push(ssrRenderComponent(_component_AnalyticsDashboard, {
        filters: filters.value,
        key: dashboardKey.value,
        title: mainAnalyticsTitle.value
      }, null, _parent));
      if (comparisonItems.value.length > 0) {
        _push(`<div class="comparison-section" data-v-316fe317><h2 class="text-2xl font-bold mb-6" data-v-316fe317>Сравнение аналитики</h2><div class="comparison-list" data-v-316fe317><!--[-->`);
        ssrRenderList(comparisonItems.value, (item, index) => {
          _push(`<div class="comparison-item" data-v-316fe317><div class="comparison-header" data-v-316fe317><button class="remove-btn" data-v-316fe317>✕</button></div>`);
          _push(ssrRenderComponent(_component_AnalyticsDashboard, {
            filters: item.filters,
            key: item.id,
            title: item.title
          }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/board.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const board = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-316fe317"]]);

export { board as default };
//# sourceMappingURL=board-6E_1kLG3.mjs.map
