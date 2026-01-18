import { _ as __nuxt_component_1 } from './VChart-BIlPI09k.mjs';
import { _ as _sfc_main$1 } from './Select-C_JPTPfA.mjs';
import { _ as _sfc_main$2 } from './Input-2RIsD9n3.mjs';
import { _ as _sfc_main$3 } from './CheckboxGroup-CSVX-9-l.mjs';
import { defineComponent, reactive, ref, computed, withAsyncContext, toRef, watchEffect, resolveDirective, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrGetDirectiveProps, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { a as useNuxtApp } from './server.mjs';
import { u as useAsyncData } from './asyncData-DVeqSZBv.mjs';
import 'vue-echarts';
import 'reka-ui';
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
import '@vueuse/core';
import './Avatar-Bz_JyLmu.mjs';
import './virtual_nuxt_G__My_Programs_ias_diplom1_app_frontend_nuxt-app_node_modules_.cache_nuxt_.nuxt_ui-image-component-CX5_T5UE.mjs';
import './tv-sfLME4AL.mjs';
import 'tailwind-variants';
import './Icon-DX0OfCis.mjs';
import './index-gA-qUlDT.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import './useFormField-C7CorFZK.mjs';
import './usePortal-5Oa56NQY.mjs';
import './index-CED3XvSe.mjs';
import './Checkbox-DYXK6_Q4.mjs';
import 'vue-router';
import 'jwt-decode';
import 'tailwindcss/colors';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "kek",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const draftFilters = reactive({
      region: "",
      settlement: "",
      district: "",
      microdistrict: ""
    });
    const appliedFilters = reactive({
      groupBy: "region",
      chartType: "offers",
      settlementTypes: [],
      region: "",
      settlement: "",
      district: "",
      microdistrict: ""
    });
    const chartOptionsList = ref([
      { label: "Количество сделок", value: "offers" },
      { label: "Категории цен", value: "priceCategories" },
      { label: "Средняя цена за м²", value: "avgPricePerMeter" },
      { label: "Среднее кол-во просмотров за день", value: "avgDailyViewsCount" },
      { label: "Boxplot по площади", value: "areaBoxplot" },
      { label: "Boxplot по цене", value: "priceBoxplot" }
    ]);
    const groupByOptions = ref([
      { label: "Области", value: "region" },
      { label: "Поселения", value: "settlement" },
      { label: "Районы", value: "district" },
      { label: "Микрорайоны", value: "microdistrict" },
      { label: "Улицы", value: "street" }
    ]);
    const settlementTypeOptions = [
      { label: "Город", value: "город" },
      { label: "Деревня", value: "деревня" },
      { label: "Посёлок", value: "поселок" },
      { label: "Село", value: "село" }
    ];
    const categories = computed(
      () => settlementsData.value?.map((item, index) => {
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
      }) ?? []
    );
    const isChartReady = ref(false);
    const { $api } = useNuxtApp();
    const {
      data: settlementsData,
      pending: loadingSettlements,
      error: settlementsError
    } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(
      "group-stats",
      async () => {
        const response = await $api("/analysis/group-stats", {
          params: {
            group_by: appliedFilters.groupBy,
            settlement_type_names: appliedFilters.settlementTypes.length > 0 ? appliedFilters.settlementTypes : void 0,
            region: appliedFilters.region || void 0,
            settlement: appliedFilters.settlement || void 0,
            district: appliedFilters.district || void 0,
            microdistrict: appliedFilters.microdistrict || void 0
          }
        });
        return response.results;
      },
      {
        watch: [appliedFilters],
        deep: true
      }
    )), __temp = await __temp, __restore(), __temp);
    const {
      data: viewsHistoryData,
      pending: loadingViewsHistory,
      error: viewsHistoryError
    } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(
      "views-history",
      async () => {
        const response = await $api("/analysis/last-10-days-views-history", {
          params: {
            settlement_type_names: appliedFilters.settlementTypes.length > 0 ? appliedFilters.settlementTypes : void 0,
            region_name: appliedFilters.region || void 0,
            settlement_name: appliedFilters.settlement || void 0,
            district_name: appliedFilters.district || void 0,
            microdistrict_name: appliedFilters.microdistrict || void 0
          }
        });
        return response;
      },
      {
        watch: [
          toRef(appliedFilters, "settlement"),
          toRef(appliedFilters, "region"),
          toRef(appliedFilters, "district"),
          toRef(appliedFilters, "microdistrict"),
          toRef(appliedFilters, "settlementTypes")
        ]
      }
    )), __temp = await __temp, __restore(), __temp);
    const {
      data: priceHistoryData,
      pending: loadingPriceHistory,
      error: priceHistoryError,
      refresh: loadPriceHistoryData
    } = useAsyncData(
      "price-history",
      async () => {
        const response = await $api("/analysis/average-prices-history", {
          params: {
            settlement_type_names: appliedFilters.settlementTypes.length > 0 ? appliedFilters.settlementTypes : void 0,
            region_name: appliedFilters.region || void 0,
            settlement_name: appliedFilters.settlement || void 0,
            district_name: appliedFilters.district || void 0,
            microdistrict_name: appliedFilters.microdistrict || void 0
          }
        });
        return response;
      },
      {
        watch: [
          toRef(appliedFilters, "settlement"),
          toRef(appliedFilters, "region"),
          toRef(appliedFilters, "district"),
          toRef(appliedFilters, "microdistrict"),
          toRef(appliedFilters, "settlementTypes")
        ]
      }
    );
    const viewsHistoryDataReady = computed(() => !!viewsHistoryData.value?.length);
    const viewsHistoryChartOption = computed(() => ({
      title: {
        text: "История просмотров за последние 10 дней",
        left: "center"
      },
      tooltip: {
        trigger: "axis"
      },
      xAxis: {
        type: "category",
        data: viewsHistoryData.value?.map((item) => item.date) ?? []
      },
      yAxis: {
        type: "value",
        name: "Просмотры"
      },
      series: [
        {
          name: "Просмотры",
          type: "line",
          data: viewsHistoryData.value?.map((item) => item.views) ?? [],
          smooth: true
        }
      ],
      grid: {
        left: 40,
        right: 20,
        bottom: 60,
        containLabel: true
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100
        }
      ]
    }));
    const priceHistoryDataReady = computed(() => !!priceHistoryData.value?.length);
    const priceHistoryChartOption = computed(() => ({
      title: {
        text: "История цен за последние 10 дней",
        left: "center"
      },
      tooltip: {
        trigger: "axis"
      },
      xAxis: {
        type: "category",
        data: priceHistoryData.value?.map((item) => item.date) ?? []
      },
      yAxis: {
        type: "value",
        name: "Средняя цена"
      },
      series: [
        {
          name: "Средняя цена",
          type: "line",
          data: priceHistoryData.value?.map((item) => item.avg_price) ?? [],
          smooth: true,
          itemStyle: {
            color: "#FF5733"
          },
          lineStyle: {
            width: 3
          }
        }
      ],
      grid: {
        left: 40,
        right: 20,
        bottom: 60,
        containLabel: true
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100
        }
      ]
    }));
    const chartOption = computed(() => ({
      title: {
        text: titleText.value,
        left: "center"
      },
      tooltip: {
        trigger: "axis"
      },
      legend: {
        top: 30
      },
      grid: {
        left: 40,
        right: 20,
        bottom: 60,
        containLabel: true
      },
      xAxis: {
        type: "category",
        data: categories.value,
        axisLabel: {
          rotate: 30
        }
      },
      yAxis: {
        type: "value"
      },
      series: series.value,
      dataZoom: [
        {
          type: "inside",
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 100,
          handleSize: "8%"
        }
      ]
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
      microdistrict: []
    });
    const { data: autocompleteData, refresh: refreshAutocomplete } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "autocomplete-filterss",
      () => $api("/offers/autocomplete-filters", {
        params: {
          query: draftFilters[selectedFilterType.value],
          type: selectedFilterType.value
        }
      }),
      { immediate: false }
    )), __temp = await __temp, __restore(), __temp);
    function handleInputChange(type) {
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
            color: (params) => colorPalette[params.dataIndex % colorPalette.length]
          }
        }
      ];
    }
    function priceCategoriesSeries() {
      return [
        {
          name: "Дешёвые",
          type: "bar",
          stack: "price",
          data: settlementsData.value?.map((i) => i.price_categories.cheap) ?? [],
          itemStyle: { color: "#00e396" }
        },
        {
          name: "Средние",
          type: "bar",
          stack: "price",
          data: settlementsData.value?.map((i) => i.price_categories.normal) ?? [],
          itemStyle: { color: "#008ffb" }
        },
        {
          name: "Дорогие",
          type: "bar",
          stack: "price",
          data: settlementsData.value?.map((i) => i.price_categories.expensive) ?? [],
          itemStyle: { color: "#ff4560" }
        }
      ];
    }
    function avgPricePerMeterSeries() {
      return [
        {
          name: "Средняя цена за м²",
          type: "bar",
          data: settlementsData.value?.map((i) => i.averages.average_price_per_square_meter) ?? []
        }
      ];
    }
    function avgDailyViewsCountSeries() {
      return [
        {
          name: "Среднее число просмотров",
          type: "bar",
          data: settlementsData.value?.map((i) => i.averages.average_views_count) ?? []
        }
      ];
    }
    function areaBoxplotSeries() {
      return [
        {
          name: "Площадь (м²)",
          type: "boxplot",
          data: settlementsData.value?.map((item) => [
            item.area_boxplot?.min ?? 0,
            item.area_boxplot?.q1 ?? 0,
            item.area_boxplot?.median ?? 0,
            item.area_boxplot?.q3 ?? 0,
            item.area_boxplot?.max ?? 0
          ]) ?? []
        }
      ];
    }
    function priceBoxplotSeries() {
      return [
        {
          name: "Цена",
          type: "boxplot",
          data: settlementsData.value?.map((item) => [
            item.price_boxplot?.min ?? 0,
            item.price_boxplot?.q1 ?? 0,
            item.price_boxplot?.median ?? 0,
            item.price_boxplot?.q3 ?? 0,
            item.price_boxplot?.max ?? 0
          ]) ?? []
        }
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
    return (_ctx, _push, _parent, _attrs) => {
      const _component_VChart = __nuxt_component_1;
      const _component_USelect = _sfc_main$1;
      const _component_UInput = _sfc_main$2;
      const _component_UCheckboxGroup = _sfc_main$3;
      const _directive_click_outside = resolveDirective("click-outside");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 min-h-screen" }, _attrs))}><div class="flex gap-4"><div class="rounded-lg ring ring-default p-4 w-full md:w-1/2">`);
      if (!unref(loadingPriceHistory) && unref(priceHistoryDataReady)) {
        _push(ssrRenderComponent(_component_VChart, {
          option: unref(priceHistoryChartOption),
          autoresize: "",
          style: { "height": "400px", "width": "100%" }
        }, null, _parent));
      } else {
        _push(`<div class="text-gray-500 text-center py-20">Загрузка истории цен...</div>`);
      }
      _push(`</div><div class="rounded-lg ring ring-default p-4 w-full md:w-1/2">`);
      if (!unref(loadingViewsHistory) && unref(viewsHistoryDataReady)) {
        _push(ssrRenderComponent(_component_VChart, {
          option: unref(viewsHistoryChartOption),
          autoresize: "",
          style: { "height": "400px", "width": "100%" }
        }, null, _parent));
      } else {
        _push(`<div class="text-gray-500 text-center py-20">Загрузка истории просмотров...</div>`);
      }
      _push(`</div></div><div class="rounded-lg ring mt-8 p-5 ring-default"><div class="flex flex-wrap gap-4 mb-5">`);
      _push(ssrRenderComponent(_component_USelect, {
        modelValue: unref(appliedFilters).chartType,
        "onUpdate:modelValue": ($event) => unref(appliedFilters).chartType = $event,
        items: unref(chartOptionsList),
        placeholder: "Тип графика",
        class: "w-64"
      }, null, _parent));
      _push(ssrRenderComponent(_component_USelect, {
        modelValue: unref(appliedFilters).groupBy,
        "onUpdate:modelValue": ($event) => unref(appliedFilters).groupBy = $event,
        items: unref(groupByOptions),
        placeholder: "Группировка",
        class: "w-64"
      }, null, _parent));
      _push(`</div><div class="flex flex-wrap gap-4 mb-5"><div class="relative">`);
      _push(ssrRenderComponent(_component_UInput, {
        modelValue: unref(draftFilters).region,
        "onUpdate:modelValue": ($event) => unref(draftFilters).region = $event,
        placeholder: "Регион",
        onInput: ($event) => handleInputChange("region")
      }, null, _parent));
      if (unref(autocompleteResults).region.length > 0 && unref(autocompleteResults).region[0] != unref(draftFilters).region) {
        _push(`<ul${ssrRenderAttrs(mergeProps({ class: "w-64 absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto" }, ssrGetDirectiveProps(_ctx, _directive_click_outside, handleClickOutside)))}><!--[-->`);
        ssrRenderList(unref(autocompleteResults).region, (item, index) => {
          _push(`<li class="px-3 py-2 hover:bg-blue-100 cursor-pointer">${ssrInterpolate(item)}</li>`);
        });
        _push(`<!--]--></ul>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="relative">`);
      _push(ssrRenderComponent(_component_UInput, {
        modelValue: unref(draftFilters).settlement,
        "onUpdate:modelValue": ($event) => unref(draftFilters).settlement = $event,
        placeholder: "Поселение",
        onInput: ($event) => handleInputChange("settlement")
      }, null, _parent));
      if (unref(autocompleteResults).settlement.length > 0 && unref(autocompleteResults).settlement[0] != unref(draftFilters).settlement) {
        _push(`<ul${ssrRenderAttrs(mergeProps({ class: "absolute rounded-sm ring-1 ring-[var(--ui-border)] max-h-50 overflow-auto z-10 bg-white w-full mt-1 text-sm" }, ssrGetDirectiveProps(_ctx, _directive_click_outside, handleClickOutside)))}><!--[-->`);
        ssrRenderList(unref(autocompleteResults).settlement, (item, index) => {
          _push(`<li class="px-3 py-2 cursor-pointer bg-white border-b border-[var(--ui-border-muted)] px-3 py-2 hover:bg-[var(--ui-color-neutral-100)">${ssrInterpolate(item)}</li>`);
        });
        _push(`<!--]--></ul>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="relative">`);
      _push(ssrRenderComponent(_component_UInput, {
        modelValue: unref(draftFilters).district,
        "onUpdate:modelValue": ($event) => unref(draftFilters).district = $event,
        placeholder: "Район",
        onInput: ($event) => handleInputChange("district")
      }, null, _parent));
      if (unref(autocompleteResults).district.length > 0 && unref(autocompleteResults).district[0] != unref(draftFilters).district) {
        _push(`<ul${ssrRenderAttrs(mergeProps({ class: "absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto" }, ssrGetDirectiveProps(_ctx, _directive_click_outside, handleClickOutside)))}><!--[-->`);
        ssrRenderList(unref(autocompleteResults).district, (item, index) => {
          _push(`<li class="px-3 py-2 hover:bg-blue-100 cursor-pointer">${ssrInterpolate(item)}</li>`);
        });
        _push(`<!--]--></ul>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="relative">`);
      _push(ssrRenderComponent(_component_UInput, {
        modelValue: unref(draftFilters).microdistrict,
        "onUpdate:modelValue": ($event) => unref(draftFilters).microdistrict = $event,
        placeholder: "Микрорайон",
        onInput: ($event) => handleInputChange("microdistrict")
      }, null, _parent));
      if (unref(autocompleteResults).microdistrict.length > 0 && unref(autocompleteResults).microdistrict[0] != unref(draftFilters).microdistrict) {
        _push(`<ul${ssrRenderAttrs(mergeProps({ class: "absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto" }, ssrGetDirectiveProps(_ctx, _directive_click_outside, handleClickOutside)))}><!--[-->`);
        ssrRenderList(unref(autocompleteResults).microdistrict, (item, index) => {
          _push(`<li class="px-3 py-2 hover:bg-blue-100 cursor-pointer">${ssrInterpolate(item)}</li>`);
        });
        _push(`<!--]--></ul>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_component_UCheckboxGroup, {
        modelValue: unref(appliedFilters).settlementTypes,
        "onUpdate:modelValue": ($event) => unref(appliedFilters).settlementTypes = $event,
        items: settlementTypeOptions,
        orientation: "horizontal",
        class: "mb-4"
      }, null, _parent));
      _push(`</div></div><div class="bg-white rounded-md shadow p-4">`);
      if (!unref(loadingSettlements) && unref(isChartReady)) {
        _push(ssrRenderComponent(_component_VChart, {
          option: unref(chartOption),
          autoresize: "",
          style: { "height": "400px", "width": "100%" }
        }, null, _parent));
      } else {
        _push(`<div class="text-gray-500 text-center py-20">Загрузка...</div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/kek.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=kek-BhxNaAoz.mjs.map
