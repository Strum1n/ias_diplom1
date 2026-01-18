import { _ as _sfc_main$1 } from './Container-B_7exVp7.mjs';
import { _ as _sfc_main$2 } from './Badge-DNgMi0Nd.mjs';
import { _ as _sfc_main$3 } from './Separator-DiSB2IpQ.mjs';
import { _ as _sfc_main$4 } from './Select-C_JPTPfA.mjs';
import { _ as _sfc_main$5 } from './Icon-DX0OfCis.mjs';
import { _ as _sfc_main$6 } from './Button-BL6TDcLa.mjs';
import { defineComponent, ref, computed, withAsyncContext, mergeProps, withCtx, unref, createTextVNode, toDisplayString, isRef, createVNode, createBlock, createCommentVNode, openBlock, Fragment, renderList, withDirectives, vModelSelect, vModelText, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { _ as _export_sfc, a as useNuxtApp } from './server.mjs';
import { u as useAsyncData } from './asyncData-DVeqSZBv.mjs';
import 'reka-ui';
import './tv-sfLME4AL.mjs';
import 'tailwind-variants';
import './Avatar-Bz_JyLmu.mjs';
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
import './virtual_nuxt_G__My_Programs_ias_diplom1_app_frontend_nuxt-app_node_modules_.cache_nuxt_.nuxt_ui-image-component-CX5_T5UE.mjs';
import '@vueuse/core';
import './useFormField-C7CorFZK.mjs';
import './usePortal-5Oa56NQY.mjs';
import './index-CED3XvSe.mjs';
import './index-gA-qUlDT.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import './Link-gmgU2Miy.mjs';
import './nuxt-link-DYDQwZUP.mjs';
import 'vue-router';
import 'jwt-decode';
import 'tailwindcss/colors';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "favorites",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const propertyTypesItems = ref([
      { label: "Все типы", value: "Все типы" },
      { label: "Квартира", value: "Квартира" },
      { label: "Апартаменты", value: "Апартаменты" },
      { label: "Дом", value: "Дом" },
      { label: "Коттедж", value: "Коттедж" },
      { label: "Таунхаус", value: "Таунхаус" }
    ]);
    const sortFields = ref([
      { label: "Цена", value: "price:asc", icon: "material-symbols:arrow-upward-alt" },
      { label: "Цена", value: "price:desc", icon: "material-symbols:arrow-downward-alt" },
      { label: "Цена за м²", value: "price_per_square_meter:asc", icon: "material-symbols:arrow-upward-alt" },
      { label: "Цена за м²", value: "price_per_square_meter:desc", icon: "material-symbols:arrow-downward-alt" },
      { label: "Площадь", value: "total_area:asc", icon: "material-symbols:arrow-upward-alt" },
      { label: "Площадь", value: "total_area:desc", icon: "material-symbols:arrow-downward-alt" },
      { label: "Дата публикации", value: "creation_date_source:asc", icon: "material-symbols:arrow-upward-alt" },
      { label: "Дата публикации", value: "creation_date_source:desc", icon: "material-symbols:arrow-downward-alt" },
      { label: "Просмотры", value: "views_count:asc", icon: "material-symbols:arrow-upward-alt" },
      { label: "Просмотры", value: "views_count:desc", icon: "material-symbols:arrow-downward-alt" }
    ]);
    const sortValue = ref(sortFields.value[7]?.value);
    const icon = computed(() => sortFields.value.find((item) => item.value === sortValue.value)?.icon);
    const { $api } = useNuxtApp();
    const { data: favoriteOffers, pending, error, refresh: refreshFavorites } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("favorites", () => $api("offers/favorites/"))), __temp = await __temp, __restore(), __temp);
    const showComparisonInterface = ref(false);
    const selectedMethod = ref("electre");
    const analysisLoading = ref(false);
    const availableCriteria = ref([]);
    const selectedCriteria = ref([]);
    const criteriaWeights = ref({});
    const criteriaDirections = ref({});
    const propertyType = ref(propertyTypesItems.value[0].value);
    const electreParams = ref({
      alpha: 0.8,
      beta: 0.4,
      step: 0.05
    });
    const electreResults = ref(null);
    const topsisResults = ref(null);
    const topsisRanking = ref([]);
    const filteredOffers = computed(() => {
      if (!favoriteOffers.value) return [];
      if (!propertyType.value || propertyType.value == "Все типы") {
        return favoriteOffers.value;
      }
      return favoriteOffers.value.filter((offer) => offer.property_type.name === propertyType.value);
    });
    const sortedOffers = computed(() => {
      if (!filteredOffers.value) return [];
      const filtered = [...filteredOffers.value];
      switch (sortValue.value) {
        case "price:asc":
          return filtered.sort((a, b) => a.price - b.price);
        case "price:desc":
          return filtered.sort((a, b) => b.price - a.price);
        case "creation_date_source:desc":
          return filtered.sort((a, b) => new Date(b.update_date).getTime() - new Date(a.update_date).getTime());
        case "creation_date_source:asc":
          return filtered.sort((a, b) => new Date(a.update_date).getTime() - new Date(b.update_date).getTime());
        case "views_count:asc":
          return filtered.sort((a, b) => a.views_count - b.views_count);
        case "views_count:desc":
          return filtered.sort((a, b) => b.views_count - a.views_count);
        default:
          return filtered;
      }
    });
    const selectedCriteriaWithWeights = computed(() => {
      return selectedCriteria.value.map((key) => {
        const criterion = availableCriteria.value.find((c) => c.key === key);
        return {
          key,
          displayName: criterion?.displayName || key,
          weight: criteriaWeights.value[key] || 0,
          direction: criteriaDirections.value[key] || "max"
        };
      });
    });
    const removeFromFavorites = async (offerId) => {
      try {
        await $api(`offers/favorites/${offerId}`, { method: "DELETE" });
        if (favoriteOffers.value) {
          favoriteOffers.value = favoriteOffers.value.filter((offer) => offer.id !== offerId);
        }
      } catch (err) {
        console.error("Ошибка при удалении из избранного:", err);
      }
    };
    const getPriceCategoryColor = (category) => {
      switch (category) {
        case "expensive":
          return "error";
        case "normal":
          return "info";
        case "cheap":
          return "success";
        default:
          return "neutral";
      }
    };
    const getCategoryColor = (category) => {
      switch (category) {
        case "high":
          return "success";
        case "medium":
          return "warning";
        case "low":
          return "error";
        default:
          return "neutral";
      }
    };
    const getPriceCategoryLabel = (category) => {
      switch (category) {
        case "expensive":
          return "Выше рынка";
        case "normal":
          return "Рыночная цена";
        case "cheap":
          return "Ниже рынка";
        default:
          return category;
      }
    };
    const getClosestInfrastructure = (offer) => {
      const typeMap = /* @__PURE__ */ new Map();
      offer.address.infrastructures_links.forEach((item) => {
        const typeId = item.infrastructure.infrastructure_type.id;
        if (!typeMap.has(typeId) || typeMap.get(typeId).distance > item.distance) {
          typeMap.set(typeId, item);
        }
      });
      return Array.from(typeMap.values()).sort((a, b) => a.distance - b.distance);
    };
    const getInfrastructureIcon = (typeId) => {
      const icons = {
        1: "ic:baseline-school",
        2: "material-symbols:child-hat",
        3: "ic:sharp-local-hospital",
        4: "maki:fitness-centre",
        5: "",
        6: "mdi:bus-stop",
        7: "material-symbols:metro",
        8: "ion:restaurant-sharp",
        9: "temaki:town-hall",
        10: "icon-park-solid:shopping",
        11: "icon-park-solid:shopping",
        12: "healthicons:pharmacy-24px",
        13: "",
        14: ""
      };
      return icons[typeId] || "📍";
    };
    const toggleComparisonInterface = () => {
      showComparisonInterface.value = !showComparisonInterface.value;
      if (showComparisonInterface.value) {
        electreResults.value = null;
        topsisResults.value = null;
        topsisRanking.value = [];
        actionError.value = null;
        initializeAvailableCriteria();
        const defaultCriteria = ["price", "total_area", "price_per_square_meter", "transport_access_score"];
        selectedCriteria.value = defaultCriteria.filter((key) => availableCriteria.value.some((c) => c.key === key && c.isAvailableForAll));
        selectedCriteria.value.forEach((key) => {
          criteriaWeights.value[key] = 1;
          if (!criteriaDirections.value[key]) {
            const criterion = availableCriteria.value.find((c) => c.key === key);
            criteriaDirections.value[key] = criterion?.direction || "max";
          }
        });
      }
    };
    const initializeAvailableCriteria = () => {
      const currentOffers = filteredOffers.value;
      if (!currentOffers || currentOffers.length === 0) {
        availableCriteria.value = [];
        return;
      }
      const basicCriteria = [
        {
          key: "price",
          displayName: "Цена",
          weight: 1,
          direction: "min",
          getValue: (offer) => offer.price
        },
        {
          key: "price_per_square_meter",
          displayName: "Цена за м²",
          weight: 1,
          direction: "min",
          getValue: (offer) => offer.price_per_square_meter
        },
        {
          key: "total_area",
          displayName: "Общая площадь",
          weight: 1,
          direction: "max",
          getValue: (offer) => offer.total_area
        },
        {
          key: "living_area",
          displayName: "Жилая площадь",
          weight: 1,
          direction: "max",
          getValue: (offer) => offer.living_area
        },
        {
          key: "kitchen_area",
          displayName: "Площадь кухни",
          weight: 1,
          direction: "max",
          getValue: (offer) => offer.kitchen_area
        },
        {
          key: "rooms_count",
          displayName: "Количество комнат",
          weight: 1,
          direction: "max",
          getValue: (offer) => offer.rooms_count
        },
        {
          key: "floor",
          displayName: "Этаж",
          weight: 1,
          direction: "max",
          getValue: (offer) => offer.floor
        },
        {
          key: "house_built_year",
          displayName: "Год постройки",
          weight: 1,
          direction: "max",
          getValue: (offer) => offer.house_built_year
        },
        {
          key: "ceiling_height",
          displayName: "Высота потолков",
          weight: 1,
          direction: "max",
          getValue: (offer) => offer.ceiling_height
        },
        {
          key: "transport_access_score",
          displayName: "Транспортная доступность",
          weight: 1,
          direction: "max",
          getValue: (offer) => offer.transport_access_score
        },
        {
          key: "elderly_score",
          displayName: "Оценка для пожилых",
          weight: 1,
          direction: "max",
          getValue: (offer) => offer.elderly_score
        },
        {
          key: "family_score",
          displayName: "Оценка для семьи",
          weight: 1,
          direction: "max",
          getValue: (offer) => offer.family_score
        }
      ];
      const infrastructureCriteria = [];
      const infrastructureTypes = /* @__PURE__ */ new Map();
      currentOffers.forEach((offer) => {
        offer.address.infrastructures_links.forEach((link) => {
          const typeId = link.infrastructure.infrastructure_type.id;
          const typeName = link.infrastructure.infrastructure_type.name;
          if (!infrastructureTypes.has(typeId)) {
            infrastructureTypes.set(typeId, typeName);
          }
        });
      });
      infrastructureTypes.forEach((typeName, typeId) => {
        infrastructureCriteria.push({
          key: `infrastructure_${typeId}`,
          displayName: `Расстояние до ${typeName}`,
          weight: 1,
          direction: "min",
          getValue: (offer) => {
            const closest = getClosestInfrastructureByType(offer, typeId);
            return closest ? closest.distance : null;
          }
        });
      });
      const allCriteria = [...basicCriteria, ...infrastructureCriteria];
      availableCriteria.value = allCriteria.filter((criterion) => {
        const hasValueForAllOffers = currentOffers.every((offer) => {
          const value = criterion.getValue(offer);
          return value !== null && value !== void 0 && value !== 0;
        });
        if (hasValueForAllOffers) {
          const values = currentOffers.map((offer) => {
            const value = criterion.getValue(offer);
            return value !== null && value !== void 0 ? value : 0;
          }).filter((val) => val !== null && val !== void 0);
          if (values.length > 0) {
            criterion.minValue = Math.min(...values);
            criterion.maxValue = Math.max(...values);
          }
        }
        criterion.isAvailableForAll = hasValueForAllOffers;
        return hasValueForAllOffers;
      });
    };
    const getClosestInfrastructureByType = (offer, typeId) => {
      const infrastructuresOfType = offer.address.infrastructures_links.filter((link) => link.infrastructure.infrastructure_type.id === typeId);
      if (infrastructuresOfType.length === 0) {
        return null;
      }
      return infrastructuresOfType.reduce((closest, current) => current.distance < closest.distance ? current : closest);
    };
    const isCriterionSelected = (key) => {
      return selectedCriteria.value.includes(key);
    };
    const toggleCriterion = (key) => {
      const index = selectedCriteria.value.indexOf(key);
      if (index > -1) {
        selectedCriteria.value.splice(index, 1);
      } else {
        selectedCriteria.value.push(key);
        if (criteriaWeights.value[key] === void 0) {
          criteriaWeights.value[key] = 1;
        }
        if (!criteriaDirections.value[key]) {
          const criterion = availableCriteria.value.find((c) => c.key === key);
          criteriaDirections.value[key] = criterion?.direction || "max";
        }
      }
    };
    const formatCriterionRange = (criterion) => {
      if (criterion.minValue === void 0 || criterion.maxValue === void 0) {
        return "Нет данных";
      }
      const formatValue = (value) => {
        if (value >= 1e3) {
          return `${(value / 1e3).toFixed(1)}к`;
        }
        return value.toFixed(0);
      };
      return `${formatValue(criterion.minValue)} - ${formatValue(criterion.maxValue)}`;
    };
    const updateCriterionWeight = (key, value) => {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 1) {
        criteriaWeights.value[key] = numValue;
      }
    };
    const updateCriterionDirection = (key, direction) => {
      criteriaDirections.value[key] = direction;
    };
    const resetWeights = () => {
      selectedCriteria.value = [];
      criteriaWeights.value = {};
      criteriaDirections.value = {};
      const defaultCriteria = ["price", "total_area", "price_per_square_meter", "transport_access_score"];
      selectedCriteria.value = defaultCriteria.filter((key) => availableCriteria.value.some((c) => c.key === key && c.isAvailableForAll));
      selectedCriteria.value.forEach((key) => {
        criteriaWeights.value[key] = 1;
        const criterion = availableCriteria.value.find((c) => c.key === key);
        criteriaDirections.value[key] = criterion?.direction || "max";
      });
    };
    const runAnalysis = async () => {
      actionError.value = null;
      if (selectedMethod.value === "electre") {
        await runElectreAnalysis();
      } else if (selectedMethod.value === "topsis") {
        await runTopsisAnalysis();
      }
    };
    const runElectreAnalysis = async () => {
      analysisLoading.value = true;
      actionError.value = null;
      try {
        const selectedOffersData = filteredOffers.value;
        if (!selectedOffersData || selectedOffersData.length === 0) {
          actionError.value = "Нет данных для анализа";
          return;
        }
        const evaluations = selectedOffersData.map(
          (offer) => selectedCriteria.value.map((key) => {
            const criterion = availableCriteria.value.find((c) => c.key === key);
            const value = criterion ? criterion.getValue(offer) : 0;
            return value !== null && value !== void 0 ? value : 0;
          })
        );
        const weights = selectedCriteria.value.map((key) => criteriaWeights.value[key] || 0);
        const isMin = selectedCriteria.value.map((key) => criteriaDirections.value[key] === "min");
        const response = await $api("analysis/electre", {
          method: "GET",
          params: {
            evaluations: JSON.stringify(evaluations),
            weights: JSON.stringify(weights),
            is_min: JSON.stringify(isMin),
            alpha_init: electreParams.value.alpha,
            beta_init: electreParams.value.beta,
            step: electreParams.value.step
          }
        });
        if (response) {
          electreResults.value = {
            ...response,
            // kernel содержит индексы, а не ID
            allIds: selectedOffersData.map((offer) => offer.id)
          };
        }
      } catch (err) {
        console.error("Ошибка при анализе ELECTRE:", err);
        actionError.value = err.message || "Ошибка при выполнении анализа ELECTRE";
      } finally {
        analysisLoading.value = false;
      }
    };
    const runTopsisAnalysis = async () => {
      analysisLoading.value = true;
      actionError.value = null;
      try {
        const selectedOffersData = filteredOffers.value;
        if (!selectedOffersData || selectedOffersData.length === 0) {
          actionError.value = "Нет данных для анализа";
          return;
        }
        const evaluations = selectedOffersData.map(
          (offer) => selectedCriteria.value.map((key) => {
            const criterion = availableCriteria.value.find((c) => c.key === key);
            const value = criterion ? criterion.getValue(offer) : 0;
            return value !== null && value !== void 0 ? value : 0;
          })
        );
        const weights = selectedCriteria.value.map((key) => criteriaWeights.value[key] || 0);
        const criteriaDirectionsArray = selectedCriteria.value.map((key) => criteriaDirections.value[key] === "max");
        const response = await $api("analysis/topsis", {
          method: "GET",
          params: {
            X: JSON.stringify(evaluations),
            weights: JSON.stringify(weights),
            criteria: JSON.stringify(criteriaDirectionsArray)
          }
        });
        if (response) {
          topsisResults.value = response;
          const rankedIndices = [...response.ranked_indices];
          const rankedOfferIds = [...response.ranked_indices].map((index) => selectedOffersData[index].id);
          topsisRanking.value = rankedOfferIds.map((offerId, index) => ({
            offerId,
            score: response.scores[rankedIndices[index]],
            rank: index + 1
          }));
        }
      } catch (err) {
        console.error("Ошибка при анализе TOPSIS:", err);
        actionError.value = err.message || "Ошибка при выполнении анализа TOPSIS";
      } finally {
        analysisLoading.value = false;
      }
    };
    const getDominanceComparisons = (offerId) => {
      if (!electreResults.value || !favoriteOffers.value) return [];
      const comparisons = [];
      const offerIndex = electreResults.value.allIds.indexOf(offerId);
      if (offerIndex === -1) return [];
      const dominanceInfo = electreResults.value.dominance_info[offerIndex.toString()];
      if (!dominanceInfo) return [];
      for (const [otherIndexStr, comparison] of Object.entries(dominanceInfo)) {
        const otherIndex = parseInt(otherIndexStr);
        const otherOfferId = electreResults.value.allIds[otherIndex];
        if (otherOfferId !== void 0 && otherOfferId !== offerId) {
          comparisons.push({
            otherOfferId,
            superior: comparison.superior || [],
            inferior: comparison.inferior || [],
            equal: comparison.equal || []
          });
        }
      }
      return comparisons;
    };
    const getCriterionShortName = (criterionKey) => {
      const criterion = availableCriteria.value.find((c) => c.key === criterionKey);
      if (!criterion) return criterionKey;
      const shortNames = {
        price: "Цена",
        price_per_square_meter: "Цена за м²",
        total_area: "Общая площадь",
        living_area: "Жилая площадь",
        kitchen_area: "Площадь кухни",
        rooms_count: "Комнаты",
        floor: "Этаж",
        house_floors_count: "Этажей дома",
        ceiling_height: "Высота потолков",
        transport_access_score: "Транспорт",
        elderly_score: "Для пожилых",
        family_score: "Для семьи"
      };
      if (criterionKey.startsWith("infrastructure_")) {
        const typeName = criterion.displayName.replace("Расстояние до ", "");
        return typeName.length > 15 ? typeName.substring(0, 15) + "..." : typeName;
      }
      return shortNames[criterionKey] || criterion.displayName;
    };
    const getOfferTitleByIndex = (index) => {
      if (!electreResults.value || !electreResults.value.allIds || !favoriteOffers.value) return `Объявление ${index}`;
      const offerId = electreResults.value.allIds[index];
      const offer = favoriteOffers.value.find((o) => o.id === offerId);
      return offer ? `${offer.title} - ${formatPrice(offer.price)} ₽` : `Объявление ${index}`;
    };
    const getOfferAddressByIndex = (index) => {
      if (!electreResults.value || !electreResults.value.allIds || !favoriteOffers.value) return "Адрес не указан";
      const offerId = electreResults.value.allIds[index];
      const offer = favoriteOffers.value.find((o) => o.id === offerId);
      return offer ? offer.address.full_address : "Адрес не указан";
    };
    const getOfferUrlByIndex = (index) => {
      if (!electreResults.value || !electreResults.value.allIds || !favoriteOffers.value) return "#";
      const offerId = electreResults.value.allIds[index];
      const offer = favoriteOffers.value.find((o) => o.id === offerId);
      return offer ? offer.url : "#";
    };
    const getOfferTitle = (offerId) => {
      if (!favoriteOffers.value) return `Объявление ${offerId}`;
      const offer = favoriteOffers.value.find((o) => o.id === offerId);
      return offer ? `${offer.title} - ${formatPrice(offer.price)} ₽` : `Объявление ${offerId}`;
    };
    const getOfferAddress = (offerId) => {
      if (!favoriteOffers.value) return "Адрес не указан";
      const offer = favoriteOffers.value.find((o) => o.id === offerId);
      return offer ? offer.address.full_address : "Адрес не указан";
    };
    const getOfferUrl = (offerId) => {
      if (!favoriteOffers.value) return "#";
      const offer = favoriteOffers.value.find((o) => o.id === offerId);
      return offer ? offer.url : "#";
    };
    const getRankItemClass = (index) => {
      if (index === 0) return "rank-item-first";
      if (index === 1) return "rank-item-second";
      if (index === 2) return "rank-item-third";
      return "";
    };
    const getRankNumberClass = (index) => {
      if (index === 0) return "rank-number-first";
      if (index === 1) return "rank-number-second";
      if (index === 2) return "rank-number-third";
      return "";
    };
    const getProgressFillClass = (index) => {
      if (index === 0) return "progress-fill-first";
      if (index === 1) return "progress-fill-second";
      if (index === 2) return "progress-fill-third";
      return "";
    };
    const formatPrice = (price) => {
      return new Intl.NumberFormat("ru-RU").format(price);
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UContainer = _sfc_main$1;
      const _component_UBadge = _sfc_main$2;
      const _component_USeparator = _sfc_main$3;
      const _component_USelect = _sfc_main$4;
      const _component_UIcon = _sfc_main$5;
      const _component_UButton = _sfc_main$6;
      _push(ssrRenderComponent(_component_UContainer, mergeProps({ class: "px-5! mt-5" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex gap-3.5 items-end" data-v-724b7936${_scopeId}><p class="font-semibold text-3xl" data-v-724b7936${_scopeId}>Избранные объявления</p>`);
            _push2(ssrRenderComponent(_component_UBadge, {
              color: "success",
              class: "mb-0.5 font-bold"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(filteredOffers).length)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(filteredOffers).length), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            _push2(ssrRenderComponent(_component_USeparator, { class: "my-7" }, null, _parent2, _scopeId));
            _push2(`<div class="filters-section" data-v-724b7936${_scopeId}><div class="filter-group" data-v-724b7936${_scopeId}><label data-v-724b7936${_scopeId}>Тип недвижимости:</label>`);
            _push2(ssrRenderComponent(_component_USelect, {
              modelValue: unref(propertyType),
              "onUpdate:modelValue": ($event) => isRef(propertyType) ? propertyType.value = $event : null,
              items: unref(propertyTypesItems),
              class: "w-48",
              "value-key": "value",
              icon: unref(icon),
              ui: {
                trailingIcon: "group-data-[state=open]:rotate-180 transition-transform duration-200"
              }
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="filter-group" data-v-724b7936${_scopeId}><label data-v-724b7936${_scopeId}>Сортировка:</label>`);
            _push2(ssrRenderComponent(_component_USelect, {
              modelValue: unref(sortValue),
              "onUpdate:modelValue": ($event) => isRef(sortValue) ? sortValue.value = $event : null,
              items: unref(sortFields),
              class: "w-48",
              "value-key": "value",
              icon: unref(icon),
              ui: {
                trailingIcon: "group-data-[state=open]:rotate-180 transition-transform duration-200"
              }
            }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
            if (unref(pending)) {
              _push2(`<div class="loading" data-v-724b7936${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                class: "size-10",
                name: "codex:loader"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else if (unref(error)) {
              _push2(`<div class="error" data-v-724b7936${_scopeId}><h3 data-v-724b7936${_scopeId}>Ошибка при загрузке</h3><p data-v-724b7936${_scopeId}>${ssrInterpolate(unref(error).message)}</p></div>`);
            } else if (unref(filteredOffers).length === 0) {
              _push2(`<div class="empty-state" data-v-724b7936${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "material-symbols-light:favorite",
                class: "size-25 bg-red-500"
              }, null, _parent2, _scopeId));
              _push2(`<h3 data-v-724b7936${_scopeId}>В избранном пока пусто</h3><p data-v-724b7936${_scopeId}>Добавляйте объявления, которые вам понравились, чтобы не потерять</p></div>`);
            } else {
              _push2(`<div class="offers-list" data-v-724b7936${_scopeId}><!--[-->`);
              ssrRenderList(unref(sortedOffers), (offer) => {
                _push2(`<div class="offer-card" data-v-724b7936${_scopeId}><div class="offer-content" data-v-724b7936${_scopeId}><div class="offer-header" data-v-724b7936${_scopeId}><div class="offer-gallery aspect-[4/3] overflow-hidden" data-v-724b7936${_scopeId}><img class="gallery-image"${ssrRenderAttr("src", offer.images_urls[0])} data-v-724b7936${_scopeId}>`);
                if (offer.is_new_house == true) {
                  _push2(ssrRenderComponent(_component_UBadge, {
                    color: "info",
                    variant: "solid",
                    class: "type-badge"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(` Новостройка `);
                      } else {
                        return [
                          createTextVNode(" Новостройка ")
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><div class="flex flex-col flex-2" data-v-724b7936${_scopeId}><div class="flex flex-col w-full gap-1 pt-2.5" data-v-724b7936${_scopeId}><div class="title-container" data-v-724b7936${_scopeId}><div class="flex gap-2" data-v-724b7936${_scopeId}>`);
                if (offer.transport_access_score) {
                  _push2(ssrRenderComponent(_component_UBadge, {
                    color: getCategoryColor(offer.transport_access_category)
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`Траспорт ${ssrInterpolate(offer.transport_access_score?.toFixed(2))}`);
                      } else {
                        return [
                          createTextVNode("Траспорт " + toDisplayString(offer.transport_access_score?.toFixed(2)), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                if (offer.elderly_score) {
                  _push2(ssrRenderComponent(_component_UBadge, {
                    color: getCategoryColor(offer.elderly_category)
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`Для пожилых ${ssrInterpolate(offer.elderly_score?.toFixed(2))}`);
                      } else {
                        return [
                          createTextVNode("Для пожилых " + toDisplayString(offer.elderly_score?.toFixed(2)), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                if (offer.family_score) {
                  _push2(ssrRenderComponent(_component_UBadge, {
                    color: getCategoryColor(offer.family_category)
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`Для семьи ${ssrInterpolate(offer.family_score?.toFixed(2))}`);
                      } else {
                        return [
                          createTextVNode("Для семьи " + toDisplayString(offer.family_score?.toFixed(2)), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><span class="price" data-v-724b7936${_scopeId}>`);
                if (offer.price_category) {
                  _push2(ssrRenderComponent(_component_UBadge, {
                    color: getPriceCategoryColor(offer.price_category)
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(`${ssrInterpolate(getPriceCategoryLabel(offer.price_category))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(getPriceCategoryLabel(offer.price_category)), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`${ssrInterpolate(formatPrice(offer.price))} ₽ </span></div><div class="title-container" data-v-724b7936${_scopeId}><h3 class="offer-title" data-v-724b7936${_scopeId}>${ssrInterpolate(offer.title)}</h3><span class="price-per-meter" data-v-724b7936${_scopeId}>${ssrInterpolate(formatPrice(offer.price_per_square_meter))} ₽/м² </span></div><div class="address" data-v-724b7936${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  size: "18",
                  name: "tabler:map-pin"
                }, null, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(offer.address.full_address)}</div></div><div class="characteristics" data-v-724b7936${_scopeId}><div class="char-item" data-v-724b7936${_scopeId}><span class="char-label" data-v-724b7936${_scopeId}>Общая площадь:</span><span class="char-value" data-v-724b7936${_scopeId}>${ssrInterpolate(offer.total_area)} м²</span></div>`);
                if (offer.living_area) {
                  _push2(`<div class="char-item" data-v-724b7936${_scopeId}><span class="char-label" data-v-724b7936${_scopeId}>Жилая площадь:</span><span class="char-value" data-v-724b7936${_scopeId}>${ssrInterpolate(offer.living_area)} м²</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.kitchen_area) {
                  _push2(`<div class="char-item" data-v-724b7936${_scopeId}><span class="char-label" data-v-724b7936${_scopeId}>Площадь кухни:</span><span class="char-value" data-v-724b7936${_scopeId}>${ssrInterpolate(offer.kitchen_area)} м²</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.floor !== null) {
                  _push2(`<div class="char-item" data-v-724b7936${_scopeId}><span class="char-label" data-v-724b7936${_scopeId}>Этаж:</span><span class="char-value" data-v-724b7936${_scopeId}>${ssrInterpolate(offer.floor)}/${ssrInterpolate(offer.house_floors_count)}</span></div>`);
                } else {
                  _push2(`<div class="char-item" data-v-724b7936${_scopeId}><span class="char-label" data-v-724b7936${_scopeId}>Этажей в доме:</span><span class="char-value" data-v-724b7936${_scopeId}>${ssrInterpolate(offer.house_floors_count)}</span></div>`);
                }
                if (offer.rooms_count !== null && offer.rooms_count !== 0 && offer.rooms_count !== 10) {
                  _push2(`<div class="char-item" data-v-724b7936${_scopeId}><span class="char-label" data-v-724b7936${_scopeId}>Комнаты:</span><span class="char-value" data-v-724b7936${_scopeId}>${ssrInterpolate(offer.rooms_count)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.ceiling_height) {
                  _push2(`<div class="char-item" data-v-724b7936${_scopeId}><span class="char-label" data-v-724b7936${_scopeId}>Высота потолков:</span><span class="char-value" data-v-724b7936${_scopeId}>${ssrInterpolate(offer.ceiling_height)} м</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.house_built_year && offer.is_new_house === null) {
                  _push2(`<div class="char-item" data-v-724b7936${_scopeId}><span class="char-label" data-v-724b7936${_scopeId}>Год постройки:</span><span class="char-value" data-v-724b7936${_scopeId}>${ssrInterpolate(offer.house_built_year)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.house_built_year && offer.is_new_house === true) {
                  _push2(`<div class="char-item" data-v-724b7936${_scopeId}><span class="char-label" data-v-724b7936${_scopeId}>Год сдачи:</span><span class="char-value" data-v-724b7936${_scopeId}>${ssrInterpolate(offer.house_built_year)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><div class="infrastructure" data-v-724b7936${_scopeId}><h4 data-v-724b7936${_scopeId}>Ближайшая инфраструктура</h4><div class="infrastructure-list" data-v-724b7936${_scopeId}><!--[-->`);
                ssrRenderList(getClosestInfrastructure(offer), (item) => {
                  _push2(`<div class="infrastructure-item" data-v-724b7936${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    size: "20",
                    name: getInfrastructureIcon(item.infrastructure.infrastructure_type.id)
                  }, null, _parent2, _scopeId));
                  _push2(`<div class="infra-info" data-v-724b7936${_scopeId}><span class="infra-type" data-v-724b7936${_scopeId}>${ssrInterpolate(item.infrastructure.infrastructure_type.name)}</span></div><span class="infra-distance" data-v-724b7936${_scopeId}>${ssrInterpolate(item.distance)} м</span></div>`);
                });
                _push2(`<!--]--></div></div></div></div><div class="contact-info" data-v-724b7936${_scopeId}><div class="flex items-center gap-1" data-v-724b7936${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  size: "16",
                  name: "solar:phone-outline"
                }, null, _parent2, _scopeId));
                _push2(`<a${ssrRenderAttr("href", `tel:${offer.contact_phone}`)} class="phone-number" data-v-724b7936${_scopeId}>${ssrInterpolate(offer.contact_phone)}</a></div><div class="actions" data-v-724b7936${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UButton, {
                  color: "info",
                  "trailing-icon": "i-lucide-arrow-right",
                  to: `/offers/${offer.id}`
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` К объекту `);
                    } else {
                      return [
                        createTextVNode(" К объекту ")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UButton, {
                  color: "error",
                  icon: "material-symbols:delete-forever",
                  onClick: ($event) => removeFromFavorites(offer.id)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Удалить `);
                    } else {
                      return [
                        createTextVNode("Удалить ")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</div></div></div></div>`);
              });
              _push2(`<!--]--></div>`);
            }
            _push2(ssrRenderComponent(_component_USeparator, { class: "my-10" }, null, _parent2, _scopeId));
            if (unref(filteredOffers).length > 1) {
              _push2(`<div class="comparison-section-bottom" data-v-724b7936${_scopeId}><div class="section-header" data-v-724b7936${_scopeId}><h2 data-v-724b7936${_scopeId}>Сравнение объектов</h2><p data-v-724b7936${_scopeId}>Сравните выбранные объявления по различным критериям</p></div><div class="comparison-controls" data-v-724b7936${_scopeId}><button class="compare-btn" data-v-724b7936${_scopeId}>${ssrInterpolate(unref(showComparisonInterface) ? "Скрыть сравнение" : "🎯 Сравнить все объявления")}</button></div>`);
              if (unref(showComparisonInterface)) {
                _push2(`<div class="comparison-interface" data-v-724b7936${_scopeId}><div class="method-selection" data-v-724b7936${_scopeId}><label data-v-724b7936${_scopeId}>Метод анализа:</label><select class="method-select" data-v-724b7936${_scopeId}><option value="electre" data-v-724b7936${ssrIncludeBooleanAttr(Array.isArray(unref(selectedMethod)) ? ssrLooseContain(unref(selectedMethod), "electre") : ssrLooseEqual(unref(selectedMethod), "electre")) ? " selected" : ""}${_scopeId}>ELECTRE</option><option value="topsis" data-v-724b7936${ssrIncludeBooleanAttr(Array.isArray(unref(selectedMethod)) ? ssrLooseContain(unref(selectedMethod), "topsis") : ssrLooseEqual(unref(selectedMethod), "topsis")) ? " selected" : ""}${_scopeId}>TOPSIS</option></select></div><div class="criteria-selection" data-v-724b7936${_scopeId}><h3 data-v-724b7936${_scopeId}>Выбор критериев для сравнения</h3><p class="selection-info" data-v-724b7936${_scopeId}>Доступны только критерии, присутствующие у всех объектов</p>`);
                if (unref(availableCriteria).length === 0) {
                  _push2(`<div class="no-criteria-available" data-v-724b7936${_scopeId}><div class="no-criteria-icon" data-v-724b7936${_scopeId}>⚠️</div><h4 data-v-724b7936${_scopeId}>Нет доступных критериев для сравнения</h4><p data-v-724b7936${_scopeId}>У выбранных объектов нет общих критериев. Попробуйте изменить фильтры или добавить больше объектов в избранное.</p></div>`);
                } else {
                  _push2(`<div class="criteria-grid" data-v-724b7936${_scopeId}><!--[-->`);
                  ssrRenderList(unref(availableCriteria), (criterion) => {
                    _push2(`<div class="${ssrRenderClass([{ selected: isCriterionSelected(criterion.key) }, "criterion-item"])}" data-v-724b7936${_scopeId}><div class="criterion-checkbox" data-v-724b7936${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(isCriterionSelected(criterion.key)) ? " checked" : ""} data-v-724b7936${_scopeId}><span class="checkmark" data-v-724b7936${_scopeId}></span></div><div class="criterion-info" data-v-724b7936${_scopeId}><div class="criterion-name" data-v-724b7936${_scopeId}>${ssrInterpolate(criterion.displayName)}</div><div class="criterion-range" data-v-724b7936${_scopeId}>${ssrInterpolate(formatCriterionRange(criterion))}</div></div></div>`);
                  });
                  _push2(`<!--]--></div>`);
                }
                if (unref(selectedCriteria).length === 0 && unref(availableCriteria).length > 0) {
                  _push2(`<div class="no-criteria-warning" data-v-724b7936${_scopeId}>⚠️ Выберите хотя бы один критерий для анализа</div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
                if (unref(selectedCriteria).length > 0) {
                  _push2(`<div class="criteria-weights" data-v-724b7936${_scopeId}><h3 data-v-724b7936${_scopeId}>Настройка весов критериев</h3><div class="weights-grid" data-v-724b7936${_scopeId}><!--[-->`);
                  ssrRenderList(unref(selectedCriteriaWithWeights), (criterion) => {
                    _push2(`<div class="weight-item" data-v-724b7936${_scopeId}><div class="weight-info" data-v-724b7936${_scopeId}><span class="weight-name" data-v-724b7936${_scopeId}>${ssrInterpolate(criterion.displayName)}</span><span class="weight-direction" data-v-724b7936${_scopeId}>${ssrInterpolate(criterion.direction === "max" ? "↑ максимум" : "↓ минимум")}</span></div><div class="weight-controls" data-v-724b7936${_scopeId}><select${ssrRenderAttr("value", criterion.direction)} class="direction-select" data-v-724b7936${_scopeId}><option value="max" data-v-724b7936${_scopeId}>Максимизация</option><option value="min" data-v-724b7936${_scopeId}>Минимизация</option></select><input type="number"${ssrRenderAttr("value", criterion.weight)} min="1" step="0.5" class="weight-input" data-v-724b7936${_scopeId}></div></div>`);
                  });
                  _push2(`<!--]--></div></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(selectedCriteria).length > 0 && unref(selectedMethod) === "electre") {
                  _push2(`<div class="algorithm-params" data-v-724b7936${_scopeId}><h4 data-v-724b7936${_scopeId}>Параметры алгоритма ELECTRE:</h4><div class="params-grid" data-v-724b7936${_scopeId}><div class="param-group" data-v-724b7936${_scopeId}><label data-v-724b7936${_scopeId}>Alpha (порог согласия):</label><input type="number"${ssrRenderAttr("value", unref(electreParams).alpha)} min="0" max="1" step="0.05" data-v-724b7936${_scopeId}></div><div class="param-group" data-v-724b7936${_scopeId}><label data-v-724b7936${_scopeId}>Beta (порог несогласия):</label><input type="number"${ssrRenderAttr("value", unref(electreParams).beta)} min="0" max="1" step="0.05" data-v-724b7936${_scopeId}></div><div class="param-group" data-v-724b7936${_scopeId}><label data-v-724b7936${_scopeId}>Шаг изменения:</label><input type="number"${ssrRenderAttr("value", unref(electreParams).step)} min="0.01" max="0.1" step="0.01" data-v-724b7936${_scopeId}></div></div></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<div class="analysis-actions" data-v-724b7936${_scopeId}><button${ssrIncludeBooleanAttr(unref(analysisLoading) || unref(selectedCriteria).length === 0) ? " disabled" : ""} class="analyze-button" data-v-724b7936${_scopeId}>`);
                if (unref(analysisLoading)) {
                  _push2(`<span data-v-724b7936${_scopeId}>Анализ...</span>`);
                } else {
                  _push2(`<span data-v-724b7936${_scopeId}>Запустить анализ</span>`);
                }
                _push2(`</button><button class="reset-button" data-v-724b7936${_scopeId}>Сбросить настройки</button></div>`);
                if (unref(selectedMethod) === "electre" && unref(electreResults)) {
                  _push2(`<div class="results-section electre-results" data-v-724b7936${_scopeId}><div class="method-header" data-v-724b7936${_scopeId}><h3 data-v-724b7936${_scopeId}>Результаты анализа ELECTRE</h3><button class="close-method-button" title="Закрыть результаты ELECTRE" data-v-724b7936${_scopeId}>×</button></div><p class="results-description" data-v-724b7936${_scopeId}>Метод ELECTRE выявляет недоминируемые объекты (ядро) и показывает сравнительные преимущества.</p>`);
                  if (unref(electreResults).kernel && unref(electreResults).kernel.length > 0) {
                    _push2(`<div class="kernel-section" data-v-724b7936${_scopeId}><h4 data-v-724b7936${_scopeId}>🎯 Ядро (недоминируемые объекты)</h4><div class="kernel-list" data-v-724b7936${_scopeId}><!--[-->`);
                    ssrRenderList(unref(electreResults).kernel, (kernelIndex) => {
                      _push2(`<div class="kernel-item" data-v-724b7936${_scopeId}><div class="kernel-offer" data-v-724b7936${_scopeId}><div class="kernel-title" data-v-724b7936${_scopeId}>${ssrInterpolate(getOfferTitleByIndex(kernelIndex))}</div><div class="kernel-address" data-v-724b7936${_scopeId}>${ssrInterpolate(getOfferAddressByIndex(kernelIndex))}</div></div><a${ssrRenderAttr("href", getOfferUrlByIndex(kernelIndex))} target="_blank" class="kernel-link" data-v-724b7936${_scopeId}> К объекту </a></div>`);
                    });
                    _push2(`<!--]--></div></div>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`<div class="comparison-section" data-v-724b7936${_scopeId}><h4 data-v-724b7936${_scopeId}>📊 Сравнительный анализ</h4><div class="comparison-list" data-v-724b7936${_scopeId}><!--[-->`);
                  ssrRenderList(unref(electreResults).allIds, (offerId) => {
                    _push2(`<div class="comparison-card" data-v-724b7936${_scopeId}><div class="comparison-header" data-v-724b7936${_scopeId}><div class="comparison-info" data-v-724b7936${_scopeId}><div class="comparison-title" data-v-724b7936${_scopeId}>${ssrInterpolate(getOfferTitle(offerId))}</div><div class="comparison-address" data-v-724b7936${_scopeId}>${ssrInterpolate(getOfferAddress(offerId))}</div></div><a${ssrRenderAttr("href", getOfferUrl(offerId))} target="_blank" class="comparison-link" data-v-724b7936${_scopeId}> К объекту </a></div><div class="dominance-comparisons" data-v-724b7936${_scopeId}><!--[-->`);
                    ssrRenderList(getDominanceComparisons(offerId), (comparison) => {
                      _push2(`<div class="dominance-item" data-v-724b7936${_scopeId}><div class="comparison-with" data-v-724b7936${_scopeId}><strong data-v-724b7936${_scopeId}>Сравнение с:</strong> ${ssrInterpolate(getOfferTitle(comparison.otherOfferId))}</div>`);
                      if (comparison.superior.length > 0) {
                        _push2(`<div class="comparison-category" data-v-724b7936${_scopeId}><div class="category-label superior" data-v-724b7936${_scopeId}>✅ Превосходит по:</div><div class="criteria-chips" data-v-724b7936${_scopeId}><!--[-->`);
                        ssrRenderList(comparison.superior, (criterionIndex) => {
                          _push2(`<span class="chip superior-chip" data-v-724b7936${_scopeId}>${ssrInterpolate(getCriterionShortName(unref(selectedCriteria)[criterionIndex]))}</span>`);
                        });
                        _push2(`<!--]--></div></div>`);
                      } else {
                        _push2(`<!---->`);
                      }
                      if (comparison.inferior.length > 0) {
                        _push2(`<div class="comparison-category" data-v-724b7936${_scopeId}><div class="category-label inferior" data-v-724b7936${_scopeId}>❌ Уступает по:</div><div class="criteria-chips" data-v-724b7936${_scopeId}><!--[-->`);
                        ssrRenderList(comparison.inferior, (criterionIndex) => {
                          _push2(`<span class="chip inferior-chip" data-v-724b7936${_scopeId}>${ssrInterpolate(getCriterionShortName(unref(selectedCriteria)[criterionIndex]))}</span>`);
                        });
                        _push2(`<!--]--></div></div>`);
                      } else {
                        _push2(`<!---->`);
                      }
                      if (comparison.equal.length > 0) {
                        _push2(`<div class="comparison-category" data-v-724b7936${_scopeId}><div class="category-label equal" data-v-724b7936${_scopeId}>⚖️ Равны по:</div><div class="criteria-chips" data-v-724b7936${_scopeId}><!--[-->`);
                        ssrRenderList(comparison.equal, (criterionIndex) => {
                          _push2(`<span class="chip equal-chip" data-v-724b7936${_scopeId}>${ssrInterpolate(getCriterionShortName(unref(selectedCriteria)[criterionIndex]))}</span>`);
                        });
                        _push2(`<!--]--></div></div>`);
                      } else {
                        _push2(`<!---->`);
                      }
                      _push2(`</div>`);
                    });
                    _push2(`<!--]--></div></div>`);
                  });
                  _push2(`<!--]--></div></div></div>`);
                } else if (unref(selectedMethod) === "topsis" && unref(topsisResults)) {
                  _push2(`<div class="topsis-results" data-v-724b7936${_scopeId}><h3 data-v-724b7936${_scopeId}>Результаты сравнения методом TOPSIS</h3><div class="ranking-section" data-v-724b7936${_scopeId}><h4 class="mb-2" data-v-724b7936${_scopeId}>Ранжирование объектов</h4><div class="ranking-list" data-v-724b7936${_scopeId}><!--[-->`);
                  ssrRenderList(unref(topsisRanking), (rank, index) => {
                    _push2(`<div class="${ssrRenderClass([getRankItemClass(index), "rank-item"])}" data-v-724b7936${_scopeId}><div class="rank-header" data-v-724b7936${_scopeId}><div class="${ssrRenderClass([getRankNumberClass(index), "rank-number"])}" data-v-724b7936${_scopeId}>${ssrInterpolate(index + 1)}</div><div class="rank-info" data-v-724b7936${_scopeId}><div class="offer-title" data-v-724b7936${_scopeId}>${ssrInterpolate(getOfferTitle(rank.offerId))}</div><div class="offer-address" data-v-724b7936${_scopeId}>${ssrInterpolate(getOfferAddress(rank.offerId))}</div></div><a${ssrRenderAttr("href", getOfferUrl(rank.offerId))} target="_blank" class="rank-link" data-v-724b7936${_scopeId}> К объекту </a></div><div class="score-section" data-v-724b7936${_scopeId}><div class="score-info" data-v-724b7936${_scopeId}><div data-v-724b7936${_scopeId}><span class="score-label" data-v-724b7936${_scopeId}>Коэффициент близости: </span><span class="score-value" data-v-724b7936${_scopeId}>${ssrInterpolate(rank.score.toFixed(4))}</span></div><div class="progress-bar" data-v-724b7936${_scopeId}><div style="${ssrRenderStyle({ width: rank.score * 100 + "%" })}" class="${ssrRenderClass([getProgressFillClass(index), "progress-fill"])}" data-v-724b7936${_scopeId}></div></div></div></div></div>`);
                  });
                  _push2(`<!--]--></div></div></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", { class: "flex gap-3.5 items-end" }, [
                createVNode("p", { class: "font-semibold text-3xl" }, "Избранные объявления"),
                createVNode(_component_UBadge, {
                  color: "success",
                  class: "mb-0.5 font-bold"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(filteredOffers).length), 1)
                  ]),
                  _: 1
                })
              ]),
              createVNode(_component_USeparator, { class: "my-7" }),
              createVNode("div", { class: "filters-section" }, [
                createVNode("div", { class: "filter-group" }, [
                  createVNode("label", null, "Тип недвижимости:"),
                  createVNode(_component_USelect, {
                    modelValue: unref(propertyType),
                    "onUpdate:modelValue": ($event) => isRef(propertyType) ? propertyType.value = $event : null,
                    items: unref(propertyTypesItems),
                    class: "w-48",
                    "value-key": "value",
                    icon: unref(icon),
                    ui: {
                      trailingIcon: "group-data-[state=open]:rotate-180 transition-transform duration-200"
                    }
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items", "icon"])
                ]),
                createVNode("div", { class: "filter-group" }, [
                  createVNode("label", null, "Сортировка:"),
                  createVNode(_component_USelect, {
                    modelValue: unref(sortValue),
                    "onUpdate:modelValue": ($event) => isRef(sortValue) ? sortValue.value = $event : null,
                    items: unref(sortFields),
                    class: "w-48",
                    "value-key": "value",
                    icon: unref(icon),
                    ui: {
                      trailingIcon: "group-data-[state=open]:rotate-180 transition-transform duration-200"
                    }
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "items", "icon"])
                ])
              ]),
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "loading"
              }, [
                createVNode(_component_UIcon, {
                  class: "size-10",
                  name: "codex:loader"
                })
              ])) : unref(error) ? (openBlock(), createBlock("div", {
                key: 1,
                class: "error"
              }, [
                createVNode("h3", null, "Ошибка при загрузке"),
                createVNode("p", null, toDisplayString(unref(error).message), 1)
              ])) : unref(filteredOffers).length === 0 ? (openBlock(), createBlock("div", {
                key: 2,
                class: "empty-state"
              }, [
                createVNode(_component_UIcon, {
                  name: "material-symbols-light:favorite",
                  class: "size-25 bg-red-500"
                }),
                createVNode("h3", null, "В избранном пока пусто"),
                createVNode("p", null, "Добавляйте объявления, которые вам понравились, чтобы не потерять")
              ])) : (openBlock(), createBlock("div", {
                key: 3,
                class: "offers-list"
              }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(sortedOffers), (offer) => {
                  return openBlock(), createBlock("div", {
                    key: offer.id,
                    class: "offer-card"
                  }, [
                    createVNode("div", { class: "offer-content" }, [
                      createVNode("div", { class: "offer-header" }, [
                        createVNode("div", { class: "offer-gallery aspect-[4/3] overflow-hidden" }, [
                          createVNode("img", {
                            class: "gallery-image",
                            src: offer.images_urls[0]
                          }, null, 8, ["src"]),
                          offer.is_new_house == true ? (openBlock(), createBlock(_component_UBadge, {
                            key: 0,
                            color: "info",
                            variant: "solid",
                            class: "type-badge"
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" Новостройка ")
                            ]),
                            _: 1
                          })) : createCommentVNode("", true)
                        ]),
                        createVNode("div", { class: "flex flex-col flex-2" }, [
                          createVNode("div", { class: "flex flex-col w-full gap-1 pt-2.5" }, [
                            createVNode("div", { class: "title-container" }, [
                              createVNode("div", { class: "flex gap-2" }, [
                                offer.transport_access_score ? (openBlock(), createBlock(_component_UBadge, {
                                  key: 0,
                                  color: getCategoryColor(offer.transport_access_category)
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Траспорт " + toDisplayString(offer.transport_access_score?.toFixed(2)), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"])) : createCommentVNode("", true),
                                offer.elderly_score ? (openBlock(), createBlock(_component_UBadge, {
                                  key: 1,
                                  color: getCategoryColor(offer.elderly_category)
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Для пожилых " + toDisplayString(offer.elderly_score?.toFixed(2)), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"])) : createCommentVNode("", true),
                                offer.family_score ? (openBlock(), createBlock(_component_UBadge, {
                                  key: 2,
                                  color: getCategoryColor(offer.family_category)
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("Для семьи " + toDisplayString(offer.family_score?.toFixed(2)), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"])) : createCommentVNode("", true)
                              ]),
                              createVNode("span", { class: "price" }, [
                                offer.price_category ? (openBlock(), createBlock(_component_UBadge, {
                                  key: 0,
                                  color: getPriceCategoryColor(offer.price_category)
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(getPriceCategoryLabel(offer.price_category)), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"])) : createCommentVNode("", true),
                                createTextVNode(toDisplayString(formatPrice(offer.price)) + " ₽ ", 1)
                              ])
                            ]),
                            createVNode("div", { class: "title-container" }, [
                              createVNode("h3", { class: "offer-title" }, toDisplayString(offer.title), 1),
                              createVNode("span", { class: "price-per-meter" }, toDisplayString(formatPrice(offer.price_per_square_meter)) + " ₽/м² ", 1)
                            ]),
                            createVNode("div", { class: "address" }, [
                              createVNode(_component_UIcon, {
                                size: "18",
                                name: "tabler:map-pin"
                              }),
                              createTextVNode(" " + toDisplayString(offer.address.full_address), 1)
                            ])
                          ]),
                          createVNode("div", { class: "characteristics" }, [
                            createVNode("div", { class: "char-item" }, [
                              createVNode("span", { class: "char-label" }, "Общая площадь:"),
                              createVNode("span", { class: "char-value" }, toDisplayString(offer.total_area) + " м²", 1)
                            ]),
                            offer.living_area ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "char-item"
                            }, [
                              createVNode("span", { class: "char-label" }, "Жилая площадь:"),
                              createVNode("span", { class: "char-value" }, toDisplayString(offer.living_area) + " м²", 1)
                            ])) : createCommentVNode("", true),
                            offer.kitchen_area ? (openBlock(), createBlock("div", {
                              key: 1,
                              class: "char-item"
                            }, [
                              createVNode("span", { class: "char-label" }, "Площадь кухни:"),
                              createVNode("span", { class: "char-value" }, toDisplayString(offer.kitchen_area) + " м²", 1)
                            ])) : createCommentVNode("", true),
                            offer.floor !== null ? (openBlock(), createBlock("div", {
                              key: 2,
                              class: "char-item"
                            }, [
                              createVNode("span", { class: "char-label" }, "Этаж:"),
                              createVNode("span", { class: "char-value" }, toDisplayString(offer.floor) + "/" + toDisplayString(offer.house_floors_count), 1)
                            ])) : (openBlock(), createBlock("div", {
                              key: 3,
                              class: "char-item"
                            }, [
                              createVNode("span", { class: "char-label" }, "Этажей в доме:"),
                              createVNode("span", { class: "char-value" }, toDisplayString(offer.house_floors_count), 1)
                            ])),
                            offer.rooms_count !== null && offer.rooms_count !== 0 && offer.rooms_count !== 10 ? (openBlock(), createBlock("div", {
                              key: 4,
                              class: "char-item"
                            }, [
                              createVNode("span", { class: "char-label" }, "Комнаты:"),
                              createVNode("span", { class: "char-value" }, toDisplayString(offer.rooms_count), 1)
                            ])) : createCommentVNode("", true),
                            offer.ceiling_height ? (openBlock(), createBlock("div", {
                              key: 5,
                              class: "char-item"
                            }, [
                              createVNode("span", { class: "char-label" }, "Высота потолков:"),
                              createVNode("span", { class: "char-value" }, toDisplayString(offer.ceiling_height) + " м", 1)
                            ])) : createCommentVNode("", true),
                            offer.house_built_year && offer.is_new_house === null ? (openBlock(), createBlock("div", {
                              key: 6,
                              class: "char-item"
                            }, [
                              createVNode("span", { class: "char-label" }, "Год постройки:"),
                              createVNode("span", { class: "char-value" }, toDisplayString(offer.house_built_year), 1)
                            ])) : createCommentVNode("", true),
                            offer.house_built_year && offer.is_new_house === true ? (openBlock(), createBlock("div", {
                              key: 7,
                              class: "char-item"
                            }, [
                              createVNode("span", { class: "char-label" }, "Год сдачи:"),
                              createVNode("span", { class: "char-value" }, toDisplayString(offer.house_built_year), 1)
                            ])) : createCommentVNode("", true)
                          ]),
                          createVNode("div", { class: "infrastructure" }, [
                            createVNode("h4", null, "Ближайшая инфраструктура"),
                            createVNode("div", { class: "infrastructure-list" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(getClosestInfrastructure(offer), (item) => {
                                return openBlock(), createBlock("div", {
                                  key: item.infrastructure.id,
                                  class: "infrastructure-item"
                                }, [
                                  createVNode(_component_UIcon, {
                                    size: "20",
                                    name: getInfrastructureIcon(item.infrastructure.infrastructure_type.id)
                                  }, null, 8, ["name"]),
                                  createVNode("div", { class: "infra-info" }, [
                                    createVNode("span", { class: "infra-type" }, toDisplayString(item.infrastructure.infrastructure_type.name), 1)
                                  ]),
                                  createVNode("span", { class: "infra-distance" }, toDisplayString(item.distance) + " м", 1)
                                ]);
                              }), 128))
                            ])
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "contact-info" }, [
                        createVNode("div", { class: "flex items-center gap-1" }, [
                          createVNode(_component_UIcon, {
                            size: "16",
                            name: "solar:phone-outline"
                          }),
                          createVNode("a", {
                            href: `tel:${offer.contact_phone}`,
                            class: "phone-number"
                          }, toDisplayString(offer.contact_phone), 9, ["href"])
                        ]),
                        createVNode("div", { class: "actions" }, [
                          createVNode(_component_UButton, {
                            color: "info",
                            "trailing-icon": "i-lucide-arrow-right",
                            to: `/offers/${offer.id}`
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" К объекту ")
                            ]),
                            _: 1
                          }, 8, ["to"]),
                          createVNode(_component_UButton, {
                            color: "error",
                            icon: "material-symbols:delete-forever",
                            onClick: ($event) => removeFromFavorites(offer.id)
                          }, {
                            default: withCtx(() => [
                              createTextVNode("Удалить ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ])
                      ])
                    ])
                  ]);
                }), 128))
              ])),
              createVNode(_component_USeparator, { class: "my-10" }),
              unref(filteredOffers).length > 1 ? (openBlock(), createBlock("div", {
                key: 4,
                class: "comparison-section-bottom"
              }, [
                createVNode("div", { class: "section-header" }, [
                  createVNode("h2", null, "Сравнение объектов"),
                  createVNode("p", null, "Сравните выбранные объявления по различным критериям")
                ]),
                createVNode("div", { class: "comparison-controls" }, [
                  createVNode("button", {
                    onClick: toggleComparisonInterface,
                    class: "compare-btn"
                  }, toDisplayString(unref(showComparisonInterface) ? "Скрыть сравнение" : "🎯 Сравнить все объявления"), 1)
                ]),
                unref(showComparisonInterface) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "comparison-interface"
                }, [
                  createVNode("div", { class: "method-selection" }, [
                    createVNode("label", null, "Метод анализа:"),
                    withDirectives(createVNode("select", {
                      "onUpdate:modelValue": ($event) => isRef(selectedMethod) ? selectedMethod.value = $event : null,
                      class: "method-select"
                    }, [
                      createVNode("option", { value: "electre" }, "ELECTRE"),
                      createVNode("option", { value: "topsis" }, "TOPSIS")
                    ], 8, ["onUpdate:modelValue"]), [
                      [vModelSelect, unref(selectedMethod)]
                    ])
                  ]),
                  createVNode("div", { class: "criteria-selection" }, [
                    createVNode("h3", null, "Выбор критериев для сравнения"),
                    createVNode("p", { class: "selection-info" }, "Доступны только критерии, присутствующие у всех объектов"),
                    unref(availableCriteria).length === 0 ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "no-criteria-available"
                    }, [
                      createVNode("div", { class: "no-criteria-icon" }, "⚠️"),
                      createVNode("h4", null, "Нет доступных критериев для сравнения"),
                      createVNode("p", null, "У выбранных объектов нет общих критериев. Попробуйте изменить фильтры или добавить больше объектов в избранное.")
                    ])) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "criteria-grid"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(availableCriteria), (criterion) => {
                        return openBlock(), createBlock("div", {
                          key: criterion.key,
                          class: ["criterion-item", { selected: isCriterionSelected(criterion.key) }],
                          onClick: ($event) => toggleCriterion(criterion.key)
                        }, [
                          createVNode("div", { class: "criterion-checkbox" }, [
                            createVNode("input", {
                              type: "checkbox",
                              checked: isCriterionSelected(criterion.key),
                              onChange: ($event) => toggleCriterion(criterion.key)
                            }, null, 40, ["checked", "onChange"]),
                            createVNode("span", { class: "checkmark" })
                          ]),
                          createVNode("div", { class: "criterion-info" }, [
                            createVNode("div", { class: "criterion-name" }, toDisplayString(criterion.displayName), 1),
                            createVNode("div", { class: "criterion-range" }, toDisplayString(formatCriterionRange(criterion)), 1)
                          ])
                        ], 10, ["onClick"]);
                      }), 128))
                    ])),
                    unref(selectedCriteria).length === 0 && unref(availableCriteria).length > 0 ? (openBlock(), createBlock("div", {
                      key: 2,
                      class: "no-criteria-warning"
                    }, "⚠️ Выберите хотя бы один критерий для анализа")) : createCommentVNode("", true)
                  ]),
                  unref(selectedCriteria).length > 0 ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "criteria-weights"
                  }, [
                    createVNode("h3", null, "Настройка весов критериев"),
                    createVNode("div", { class: "weights-grid" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedCriteriaWithWeights), (criterion) => {
                        return openBlock(), createBlock("div", {
                          key: criterion.key,
                          class: "weight-item"
                        }, [
                          createVNode("div", { class: "weight-info" }, [
                            createVNode("span", { class: "weight-name" }, toDisplayString(criterion.displayName), 1),
                            createVNode("span", { class: "weight-direction" }, toDisplayString(criterion.direction === "max" ? "↑ максимум" : "↓ минимум"), 1)
                          ]),
                          createVNode("div", { class: "weight-controls" }, [
                            createVNode("select", {
                              value: criterion.direction,
                              onChange: ($event) => updateCriterionDirection(criterion.key, $event.target.value),
                              class: "direction-select"
                            }, [
                              createVNode("option", { value: "max" }, "Максимизация"),
                              createVNode("option", { value: "min" }, "Минимизация")
                            ], 40, ["value", "onChange"]),
                            createVNode("input", {
                              type: "number",
                              value: criterion.weight,
                              min: "1",
                              step: "0.5",
                              class: "weight-input",
                              onInput: ($event) => updateCriterionWeight(criterion.key, $event.target.value)
                            }, null, 40, ["value", "onInput"])
                          ])
                        ]);
                      }), 128))
                    ])
                  ])) : createCommentVNode("", true),
                  unref(selectedCriteria).length > 0 && unref(selectedMethod) === "electre" ? (openBlock(), createBlock("div", {
                    key: 1,
                    class: "algorithm-params"
                  }, [
                    createVNode("h4", null, "Параметры алгоритма ELECTRE:"),
                    createVNode("div", { class: "params-grid" }, [
                      createVNode("div", { class: "param-group" }, [
                        createVNode("label", null, "Alpha (порог согласия):"),
                        withDirectives(createVNode("input", {
                          type: "number",
                          "onUpdate:modelValue": ($event) => unref(electreParams).alpha = $event,
                          min: "0",
                          max: "1",
                          step: "0.05"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [
                            vModelText,
                            unref(electreParams).alpha,
                            void 0,
                            { number: true }
                          ]
                        ])
                      ]),
                      createVNode("div", { class: "param-group" }, [
                        createVNode("label", null, "Beta (порог несогласия):"),
                        withDirectives(createVNode("input", {
                          type: "number",
                          "onUpdate:modelValue": ($event) => unref(electreParams).beta = $event,
                          min: "0",
                          max: "1",
                          step: "0.05"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [
                            vModelText,
                            unref(electreParams).beta,
                            void 0,
                            { number: true }
                          ]
                        ])
                      ]),
                      createVNode("div", { class: "param-group" }, [
                        createVNode("label", null, "Шаг изменения:"),
                        withDirectives(createVNode("input", {
                          type: "number",
                          "onUpdate:modelValue": ($event) => unref(electreParams).step = $event,
                          min: "0.01",
                          max: "0.1",
                          step: "0.01"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [
                            vModelText,
                            unref(electreParams).step,
                            void 0,
                            { number: true }
                          ]
                        ])
                      ])
                    ])
                  ])) : createCommentVNode("", true),
                  createVNode("div", { class: "analysis-actions" }, [
                    createVNode("button", {
                      onClick: runAnalysis,
                      disabled: unref(analysisLoading) || unref(selectedCriteria).length === 0,
                      class: "analyze-button"
                    }, [
                      unref(analysisLoading) ? (openBlock(), createBlock("span", { key: 0 }, "Анализ...")) : (openBlock(), createBlock("span", { key: 1 }, "Запустить анализ"))
                    ], 8, ["disabled"]),
                    createVNode("button", {
                      onClick: resetWeights,
                      class: "reset-button"
                    }, "Сбросить настройки")
                  ]),
                  unref(selectedMethod) === "electre" && unref(electreResults) ? (openBlock(), createBlock("div", {
                    key: 2,
                    class: "results-section electre-results"
                  }, [
                    createVNode("div", { class: "method-header" }, [
                      createVNode("h3", null, "Результаты анализа ELECTRE"),
                      createVNode("button", {
                        onClick: ($event) => electreResults.value = null,
                        class: "close-method-button",
                        title: "Закрыть результаты ELECTRE"
                      }, "×", 8, ["onClick"])
                    ]),
                    createVNode("p", { class: "results-description" }, "Метод ELECTRE выявляет недоминируемые объекты (ядро) и показывает сравнительные преимущества."),
                    unref(electreResults).kernel && unref(electreResults).kernel.length > 0 ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "kernel-section"
                    }, [
                      createVNode("h4", null, "🎯 Ядро (недоминируемые объекты)"),
                      createVNode("div", { class: "kernel-list" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(electreResults).kernel, (kernelIndex) => {
                          return openBlock(), createBlock("div", {
                            key: kernelIndex,
                            class: "kernel-item"
                          }, [
                            createVNode("div", { class: "kernel-offer" }, [
                              createVNode("div", { class: "kernel-title" }, toDisplayString(getOfferTitleByIndex(kernelIndex)), 1),
                              createVNode("div", { class: "kernel-address" }, toDisplayString(getOfferAddressByIndex(kernelIndex)), 1)
                            ]),
                            createVNode("a", {
                              href: getOfferUrlByIndex(kernelIndex),
                              target: "_blank",
                              class: "kernel-link"
                            }, " К объекту ", 8, ["href"])
                          ]);
                        }), 128))
                      ])
                    ])) : createCommentVNode("", true),
                    createVNode("div", { class: "comparison-section" }, [
                      createVNode("h4", null, "📊 Сравнительный анализ"),
                      createVNode("div", { class: "comparison-list" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(electreResults).allIds, (offerId) => {
                          return openBlock(), createBlock("div", {
                            key: offerId,
                            class: "comparison-card"
                          }, [
                            createVNode("div", { class: "comparison-header" }, [
                              createVNode("div", { class: "comparison-info" }, [
                                createVNode("div", { class: "comparison-title" }, toDisplayString(getOfferTitle(offerId)), 1),
                                createVNode("div", { class: "comparison-address" }, toDisplayString(getOfferAddress(offerId)), 1)
                              ]),
                              createVNode("a", {
                                href: getOfferUrl(offerId),
                                target: "_blank",
                                class: "comparison-link"
                              }, " К объекту ", 8, ["href"])
                            ]),
                            createVNode("div", { class: "dominance-comparisons" }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(getDominanceComparisons(offerId), (comparison) => {
                                return openBlock(), createBlock("div", {
                                  key: comparison.otherOfferId,
                                  class: "dominance-item"
                                }, [
                                  createVNode("div", { class: "comparison-with" }, [
                                    createVNode("strong", null, "Сравнение с:"),
                                    createTextVNode(" " + toDisplayString(getOfferTitle(comparison.otherOfferId)), 1)
                                  ]),
                                  comparison.superior.length > 0 ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "comparison-category"
                                  }, [
                                    createVNode("div", { class: "category-label superior" }, "✅ Превосходит по:"),
                                    createVNode("div", { class: "criteria-chips" }, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(comparison.superior, (criterionIndex) => {
                                        return openBlock(), createBlock("span", {
                                          key: criterionIndex,
                                          class: "chip superior-chip"
                                        }, toDisplayString(getCriterionShortName(unref(selectedCriteria)[criterionIndex])), 1);
                                      }), 128))
                                    ])
                                  ])) : createCommentVNode("", true),
                                  comparison.inferior.length > 0 ? (openBlock(), createBlock("div", {
                                    key: 1,
                                    class: "comparison-category"
                                  }, [
                                    createVNode("div", { class: "category-label inferior" }, "❌ Уступает по:"),
                                    createVNode("div", { class: "criteria-chips" }, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(comparison.inferior, (criterionIndex) => {
                                        return openBlock(), createBlock("span", {
                                          key: criterionIndex,
                                          class: "chip inferior-chip"
                                        }, toDisplayString(getCriterionShortName(unref(selectedCriteria)[criterionIndex])), 1);
                                      }), 128))
                                    ])
                                  ])) : createCommentVNode("", true),
                                  comparison.equal.length > 0 ? (openBlock(), createBlock("div", {
                                    key: 2,
                                    class: "comparison-category"
                                  }, [
                                    createVNode("div", { class: "category-label equal" }, "⚖️ Равны по:"),
                                    createVNode("div", { class: "criteria-chips" }, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(comparison.equal, (criterionIndex) => {
                                        return openBlock(), createBlock("span", {
                                          key: criterionIndex,
                                          class: "chip equal-chip"
                                        }, toDisplayString(getCriterionShortName(unref(selectedCriteria)[criterionIndex])), 1);
                                      }), 128))
                                    ])
                                  ])) : createCommentVNode("", true)
                                ]);
                              }), 128))
                            ])
                          ]);
                        }), 128))
                      ])
                    ])
                  ])) : unref(selectedMethod) === "topsis" && unref(topsisResults) ? (openBlock(), createBlock("div", {
                    key: 3,
                    class: "topsis-results"
                  }, [
                    createVNode("h3", null, "Результаты сравнения методом TOPSIS"),
                    createVNode("div", { class: "ranking-section" }, [
                      createVNode("h4", { class: "mb-2" }, "Ранжирование объектов"),
                      createVNode("div", { class: "ranking-list" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(topsisRanking), (rank, index) => {
                          return openBlock(), createBlock("div", {
                            key: rank.offerId,
                            class: ["rank-item", getRankItemClass(index)]
                          }, [
                            createVNode("div", { class: "rank-header" }, [
                              createVNode("div", {
                                class: ["rank-number", getRankNumberClass(index)]
                              }, toDisplayString(index + 1), 3),
                              createVNode("div", { class: "rank-info" }, [
                                createVNode("div", { class: "offer-title" }, toDisplayString(getOfferTitle(rank.offerId)), 1),
                                createVNode("div", { class: "offer-address" }, toDisplayString(getOfferAddress(rank.offerId)), 1)
                              ]),
                              createVNode("a", {
                                href: getOfferUrl(rank.offerId),
                                target: "_blank",
                                class: "rank-link"
                              }, " К объекту ", 8, ["href"])
                            ]),
                            createVNode("div", { class: "score-section" }, [
                              createVNode("div", { class: "score-info" }, [
                                createVNode("div", null, [
                                  createVNode("span", { class: "score-label" }, "Коэффициент близости: "),
                                  createVNode("span", { class: "score-value" }, toDisplayString(rank.score.toFixed(4)), 1)
                                ]),
                                createVNode("div", { class: "progress-bar" }, [
                                  createVNode("div", {
                                    class: ["progress-fill", getProgressFillClass(index)],
                                    style: { width: rank.score * 100 + "%" }
                                  }, null, 6)
                                ])
                              ])
                            ])
                          ], 2);
                        }), 128))
                      ])
                    ])
                  ])) : createCommentVNode("", true)
                ])) : createCommentVNode("", true)
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/favorites.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const favorites = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-724b7936"]]);

export { favorites as default };
//# sourceMappingURL=favorites-tJ5Z3abh.mjs.map
