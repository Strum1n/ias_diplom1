import { _ as _sfc_main$2 } from './Select-C_JPTPfA.mjs';
import { _ as __nuxt_component_1 } from './VChart-BIlPI09k.mjs';
import { defineComponent, ref, computed, withAsyncContext, watchEffect, unref, isRef, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs } from 'vue/server-renderer';
import { _ as _export_sfc, a as useNuxtApp } from './server.mjs';
import { u as useAsyncData } from './asyncData-DVeqSZBv.mjs';
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
import 'vue-echarts';
import 'vue-router';
import 'jwt-decode';
import 'tailwindcss/colors';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Dashboardik",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { $api } = useNuxtApp();
    const chartType = ref("offers");
    const chartOptionsList = ref([
      { label: "Количество сделок", value: "offers" },
      { label: "Категории цен", value: "priceCategories" },
      { label: "Средняя цена за м²", value: "avgPricePerMeter" },
      { label: "Просмотры за 10 дней", value: "views10days" },
      { label: "Boxplot по площади", value: "areaBoxplot" },
      { label: "Boxplot по цене", value: "priceBoxplot" }
    ]);
    const groupByOptions = ref([
      { label: "Районы", value: "district" },
      { label: "Поселения", value: "settlement" },
      { label: "Области", value: "region" }
    ]);
    const groupBy = ref("district");
    const categories = computed(
      () => settlementsData.value?.map((item) => {
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
    ref(false);
    const isChartReady = ref(false);
    const {
      data: settlementsData,
      pending: loadingSettlements,
      error: settlementsError,
      refresh: refreshData
    } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "sas_kek",
      () => $api("/analysis/offers_count_by_property_type", {
        params: { group_by: groupBy.value }
        // Используем динамически выбранный параметр
      }),
      {
        watch: [groupBy]
      }
    )), __temp = await __temp, __restore(), __temp);
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
            color: function(params) {
              return colorPalette[params.dataIndex % colorPalette.length];
            }
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
          itemStyle: {
            color: "#00e396"
            // Цвет для дешёвых
          }
        },
        {
          name: "Средние",
          type: "bar",
          stack: "price",
          data: settlementsData.value?.map((i) => i.price_categories.normal) ?? [],
          itemStyle: {
            color: "#008ffb"
            // Цвет для средних
          }
        },
        {
          name: "Дорогие",
          type: "bar",
          stack: "price",
          data: settlementsData.value?.map((i) => i.price_categories.expensive) ?? [],
          itemStyle: {
            color: "#ff4560"
            // Цвет для дорогих
          }
        }
      ];
    }
    function avgPricePerMeterSeries() {
      return [
        {
          name: "Средняя цена за м²",
          type: "bar",
          data: settlementsData.value?.map((i) => i.avg_price_per_square_meter ?? 0) ?? []
        }
      ];
    }
    function views10daysSeries() {
      return [
        {
          name: "Просмотры за 10 дней",
          type: "bar",
          data: settlementsData.value?.map((i) => i.last_ten_days_views_count) ?? []
        }
      ];
    }
    function areaBoxplotSeries() {
      return [
        {
          name: "Площадь (кв. м)",
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
    return (_ctx, _push, _parent, _attrs) => {
      const _component_USelect = _sfc_main$2;
      const _component_VChart = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (unref(settlementsError)) {
        _push(`<div>Ошибка загрузки данных</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_USelect, {
        modelValue: unref(chartType),
        "onUpdate:modelValue": ($event) => isRef(chartType) ? chartType.value = $event : null,
        items: unref(chartOptionsList),
        class: "mb-4",
        placeholder: "Тип графика"
      }, null, _parent));
      _push(ssrRenderComponent(_component_USelect, {
        modelValue: unref(groupBy),
        "onUpdate:modelValue": ($event) => isRef(groupBy) ? groupBy.value = $event : null,
        items: unref(groupByOptions),
        class: "mb-4",
        placeholder: "Тип графика"
      }, null, _parent));
      if (!unref(loadingSettlements) && unref(isChartReady)) {
        _push(ssrRenderComponent(_component_VChart, {
          option: unref(chartOption),
          autoresize: "",
          style: { "height": "400px", "width": "100%" }
        }, null, _parent));
      } else {
        _push(`<div>Загрузка...</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Dashboardik.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$1, { __name: "Dashboardik" });
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_Dashboardik = __nuxt_component_0;
  _push(`<!--[--><div>Лол кек</div>`);
  _push(ssrRenderComponent(_component_Dashboardik, null, null, _parent));
  _push(`<!--]-->`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/kekpage.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const kekpage = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { kekpage as default };
//# sourceMappingURL=kekpage-cDjEOXGr.mjs.map
