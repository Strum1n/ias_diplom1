import { _ as _sfc_main$1 } from './Icon-CX2WwP6o.mjs';
import { _ as _sfc_main$2 } from './Badge-Bw-ZtEh9.mjs';
import { _ as _sfc_main$3 } from './Button-C2DhPQmq.mjs';
import { defineComponent, withAsyncContext, ref, reactive, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { _ as _export_sfc, b as useNuxtApp } from './server.mjs';
import { u as useAsyncData } from './asyncData-BG26t6Y0.mjs';
import './index-DNDp3pOy.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import 'reka-ui';
import '@vueuse/core';
import './Avatar-BbsafSqM.mjs';
import '../_/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'consola';
import 'node:path';
import './virtual_nuxt_G__My_Programs_IAS-diplom_app_frontend_nuxt-app_node_modules_.cache_nuxt_.nuxt_ui-image-component-CX5_T5UE.mjs';
import './tv-DuV4YVUe.mjs';
import 'tailwind-variants';
import './useFormField-C7CorFZK.mjs';
import './index-CED3XvSe.mjs';
import './Link-C0gX2JZv.mjs';
import './nuxt-link-D5XjKnnj.mjs';
import 'vue-router';
import 'jwt-decode';
import 'tailwindcss/colors';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "favorites2",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { $api } = useNuxtApp();
    const { data: favoriteOffers, pending, error, refresh: refreshFavorites } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "favorites",
      () => $api("offers/favorites/")
    )), __temp = await __temp, __restore(), __temp);
    const showComparisonInterface = ref(false);
    const selectedMethod = ref("electre");
    const analysisLoading = ref(false);
    const availableCriteria = ref([]);
    const selectedCriteria = ref([]);
    const criteriaWeights = ref({});
    const criteriaDirections = ref({});
    const filters = reactive({
      propertyType: ""
    });
    const sortBy = ref("date_desc");
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
      if (!filters.propertyType) {
        return favoriteOffers.value;
      }
      return favoriteOffers.value.filter(
        (offer) => offer.property_type.name === filters.propertyType
      );
    });
    const sortedOffers = computed(() => {
      if (!filteredOffers.value) return [];
      const filtered = [...filteredOffers.value];
      switch (sortBy.value) {
        case "price_asc":
          return filtered.sort((a, b) => a.price - b.price);
        case "price_desc":
          return filtered.sort((a, b) => b.price - a.price);
        case "date_desc":
          return filtered.sort((a, b) => new Date(b.update_date).getTime() - new Date(a.update_date).getTime());
        case "date_asc":
          return filtered.sort((a, b) => new Date(a.update_date).getTime() - new Date(b.update_date).getTime());
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
    const isCriterionSelected = (key) => {
      return selectedCriteria.value.includes(key);
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
        "price": "Цена",
        "price_per_square_meter": "Цена за м²",
        "total_area": "Общая площадь",
        "living_area": "Жилая площадь",
        "kitchen_area": "Площадь кухни",
        "rooms_count": "Комнаты",
        "floor": "Этаж",
        "house_floors_count": "Этажей дома",
        "ceiling_height": "Высота потолков",
        "transport_access_score": "Транспорт",
        "elderly_score": "Для пожилых",
        "family_score": "Для семьи"
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
      const _component_UIcon = _sfc_main$1;
      const _component_UBadge = _sfc_main$2;
      const _component_UButton = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "favorites-page" }, _attrs))} data-v-0d17a926><div class="container" data-v-0d17a926><header class="page-header" data-v-0d17a926><h1 data-v-0d17a926>Избранные объявления</h1><div class="stats" data-v-0d17a926><span class="stat" data-v-0d17a926>Найдено: ${ssrInterpolate(unref(filteredOffers).length)} объявлений</span></div></header><div class="filters-section" data-v-0d17a926><div class="filter-group" data-v-0d17a926><label data-v-0d17a926>Тип недвижимости:</label><select class="filter-select" data-v-0d17a926><option value="" data-v-0d17a926${ssrIncludeBooleanAttr(Array.isArray(unref(filters).propertyType) ? ssrLooseContain(unref(filters).propertyType, "") : ssrLooseEqual(unref(filters).propertyType, "")) ? " selected" : ""}>Все типы</option><option value="Квартира" data-v-0d17a926${ssrIncludeBooleanAttr(Array.isArray(unref(filters).propertyType) ? ssrLooseContain(unref(filters).propertyType, "Квартира") : ssrLooseEqual(unref(filters).propertyType, "Квартира")) ? " selected" : ""}>Квартира</option><option value="Коттедж" data-v-0d17a926${ssrIncludeBooleanAttr(Array.isArray(unref(filters).propertyType) ? ssrLooseContain(unref(filters).propertyType, "Коттедж") : ssrLooseEqual(unref(filters).propertyType, "Коттедж")) ? " selected" : ""}>Коттедж</option><option value="Апартамент" data-v-0d17a926${ssrIncludeBooleanAttr(Array.isArray(unref(filters).propertyType) ? ssrLooseContain(unref(filters).propertyType, "Апартамент") : ssrLooseEqual(unref(filters).propertyType, "Апартамент")) ? " selected" : ""}>Апартаменты</option><option value="Дом" data-v-0d17a926${ssrIncludeBooleanAttr(Array.isArray(unref(filters).propertyType) ? ssrLooseContain(unref(filters).propertyType, "Дом") : ssrLooseEqual(unref(filters).propertyType, "Дом")) ? " selected" : ""}>Дом</option><option value="Таунхаус" data-v-0d17a926${ssrIncludeBooleanAttr(Array.isArray(unref(filters).propertyType) ? ssrLooseContain(unref(filters).propertyType, "Таунхаус") : ssrLooseEqual(unref(filters).propertyType, "Таунхаус")) ? " selected" : ""}>Таунхаус</option></select></div><div class="filter-group" data-v-0d17a926><label data-v-0d17a926>Сортировка:</label><select class="filter-select" data-v-0d17a926><option value="price_asc" data-v-0d17a926${ssrIncludeBooleanAttr(Array.isArray(unref(sortBy)) ? ssrLooseContain(unref(sortBy), "price_asc") : ssrLooseEqual(unref(sortBy), "price_asc")) ? " selected" : ""}>Цена по возрастанию</option><option value="price_desc" data-v-0d17a926${ssrIncludeBooleanAttr(Array.isArray(unref(sortBy)) ? ssrLooseContain(unref(sortBy), "price_desc") : ssrLooseEqual(unref(sortBy), "price_desc")) ? " selected" : ""}>Цена по убыванию</option><option value="date_desc" data-v-0d17a926${ssrIncludeBooleanAttr(Array.isArray(unref(sortBy)) ? ssrLooseContain(unref(sortBy), "date_desc") : ssrLooseEqual(unref(sortBy), "date_desc")) ? " selected" : ""}>Сначала новые</option><option value="date_asc" data-v-0d17a926${ssrIncludeBooleanAttr(Array.isArray(unref(sortBy)) ? ssrLooseContain(unref(sortBy), "date_asc") : ssrLooseEqual(unref(sortBy), "date_asc")) ? " selected" : ""}>Сначала старые</option></select></div><button class="clear-filters" data-v-0d17a926> Сбросить фильтры </button></div>`);
      if (unref(pending)) {
        _push(`<div class="loading" data-v-0d17a926>`);
        _push(ssrRenderComponent(_component_UIcon, {
          class: "size-10",
          name: "codex:loader"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(error)) {
        _push(`<div class="error" data-v-0d17a926><h3 data-v-0d17a926>Ошибка при загрузке</h3><p data-v-0d17a926>${ssrInterpolate(unref(error).message)}</p></div>`);
      } else if (unref(filteredOffers).length === 0) {
        _push(`<div class="empty-state" data-v-0d17a926><div class="empty-icon" data-v-0d17a926>❤️</div><h3 data-v-0d17a926>В избранном пока пусто</h3><p data-v-0d17a926>Добавляйте объявления, которые вам понравились, чтобы не потерять</p></div>`);
      } else {
        _push(`<div class="offers-list" data-v-0d17a926><!--[-->`);
        ssrRenderList(unref(sortedOffers), (offer) => {
          _push(`<div class="offer-card" data-v-0d17a926><div class="offer-content" data-v-0d17a926><div class="offer-header" data-v-0d17a926><div class="offer-gallery aspect-[4/3] overflow-hidden" data-v-0d17a926><img class="gallery-image"${ssrRenderAttr("src", offer.images_urls[0])} data-v-0d17a926>`);
          if (offer.is_new_house == true) {
            _push(ssrRenderComponent(_component_UBadge, {
              color: "info",
              variant: "solid",
              class: "type-badge"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Новостройка `);
                } else {
                  return [
                    createTextVNode(" Новостройка ")
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex flex-col flex-2" data-v-0d17a926><div class="flex flex-col w-full gap-1 pt-2.5" data-v-0d17a926><div class="title-container" data-v-0d17a926><div class="flex gap-2" data-v-0d17a926>`);
          if (offer.transport_access_score) {
            _push(ssrRenderComponent(_component_UBadge, {
              color: getCategoryColor(offer.transport_access_category)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`Траспорт ${ssrInterpolate(offer.transport_access_score?.toFixed(2))}`);
                } else {
                  return [
                    createTextVNode("Траспорт " + toDisplayString(offer.transport_access_score?.toFixed(2)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (offer.elderly_score) {
            _push(ssrRenderComponent(_component_UBadge, {
              color: getCategoryColor(offer.elderly_category)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`Для пожилых ${ssrInterpolate(offer.elderly_score?.toFixed(2))}`);
                } else {
                  return [
                    createTextVNode("Для пожилых " + toDisplayString(offer.elderly_score?.toFixed(2)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (offer.family_score) {
            _push(ssrRenderComponent(_component_UBadge, {
              color: getCategoryColor(offer.family_category)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`Для семьи ${ssrInterpolate(offer.family_score?.toFixed(2))}`);
                } else {
                  return [
                    createTextVNode("Для семьи " + toDisplayString(offer.family_score?.toFixed(2)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div><span class="price" data-v-0d17a926>`);
          if (offer.price_category) {
            _push(ssrRenderComponent(_component_UBadge, {
              color: getPriceCategoryColor(offer.price_category)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(getPriceCategoryLabel(offer.price_category))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(getPriceCategoryLabel(offer.price_category)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`${ssrInterpolate(formatPrice(offer.price))} ₽ </span></div><div class="title-container" data-v-0d17a926><h3 class="offer-title" data-v-0d17a926>${ssrInterpolate(offer.title)}</h3><span class="price-per-meter" data-v-0d17a926>${ssrInterpolate(formatPrice(offer.price_per_square_meter))} ₽/м² </span></div><div class="address" data-v-0d17a926>`);
          _push(ssrRenderComponent(_component_UIcon, {
            size: "18",
            name: "tabler:map-pin"
          }, null, _parent));
          _push(` ${ssrInterpolate(offer.address.full_address)}</div></div><div class="characteristics" data-v-0d17a926><div class="char-item" data-v-0d17a926><span class="char-label" data-v-0d17a926>Общая площадь:</span><span class="char-value" data-v-0d17a926>${ssrInterpolate(offer.total_area)} м²</span></div>`);
          if (offer.living_area) {
            _push(`<div class="char-item" data-v-0d17a926><span class="char-label" data-v-0d17a926>Жилая площадь:</span><span class="char-value" data-v-0d17a926>${ssrInterpolate(offer.living_area)} м²</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (offer.kitchen_area) {
            _push(`<div class="char-item" data-v-0d17a926><span class="char-label" data-v-0d17a926>Площадь кухни:</span><span class="char-value" data-v-0d17a926>${ssrInterpolate(offer.kitchen_area)} м²</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (offer.floor !== null) {
            _push(`<div class="char-item" data-v-0d17a926><span class="char-label" data-v-0d17a926>Этаж:</span><span class="char-value" data-v-0d17a926>${ssrInterpolate(offer.floor)}/${ssrInterpolate(offer.house_floors_count)}</span></div>`);
          } else {
            _push(`<div class="char-item" data-v-0d17a926><span class="char-label" data-v-0d17a926>Этажей в доме:</span><span class="char-value" data-v-0d17a926>${ssrInterpolate(offer.house_floors_count)}</span></div>`);
          }
          if (offer.rooms_count !== null && offer.rooms_count !== 0 && offer.rooms_count !== 10) {
            _push(`<div class="char-item" data-v-0d17a926><span class="char-label" data-v-0d17a926>Комнаты:</span><span class="char-value" data-v-0d17a926>${ssrInterpolate(offer.rooms_count)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (offer.ceiling_height) {
            _push(`<div class="char-item" data-v-0d17a926><span class="char-label" data-v-0d17a926>Высота потолков:</span><span class="char-value" data-v-0d17a926>${ssrInterpolate(offer.ceiling_height)} м</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (offer.house_built_year && offer.is_new_house === null) {
            _push(`<div class="char-item" data-v-0d17a926><span class="char-label" data-v-0d17a926>Год постройки:</span><span class="char-value" data-v-0d17a926>${ssrInterpolate(offer.house_built_year)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (offer.house_built_year && offer.is_new_house === true) {
            _push(`<div class="char-item" data-v-0d17a926><span class="char-label" data-v-0d17a926>Год сдачи:</span><span class="char-value" data-v-0d17a926>${ssrInterpolate(offer.house_built_year)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="infrastructure" data-v-0d17a926><h4 data-v-0d17a926>Ближайшая инфраструктура</h4><div class="infrastructure-list" data-v-0d17a926><!--[-->`);
          ssrRenderList(getClosestInfrastructure(offer), (item) => {
            _push(`<div class="infrastructure-item" data-v-0d17a926>`);
            _push(ssrRenderComponent(_component_UIcon, {
              size: "20",
              name: getInfrastructureIcon(item.infrastructure.infrastructure_type.id)
            }, null, _parent));
            _push(`<div class="infra-info" data-v-0d17a926><span class="infra-type" data-v-0d17a926>${ssrInterpolate(item.infrastructure.infrastructure_type.name)}</span></div><span class="infra-distance" data-v-0d17a926>${ssrInterpolate(item.distance)} м</span></div>`);
          });
          _push(`<!--]--></div></div></div></div><div class="contact-info" data-v-0d17a926><div class="flex items-center gap-1" data-v-0d17a926>`);
          _push(ssrRenderComponent(_component_UIcon, {
            size: "16",
            name: "solar:phone-outline"
          }, null, _parent));
          _push(`<a${ssrRenderAttr("href", `tel:${offer.contact_phone}`)} class="phone-number" data-v-0d17a926>${ssrInterpolate(offer.contact_phone)}</a></div><div class="actions" data-v-0d17a926>`);
          _push(ssrRenderComponent(_component_UButton, {
            color: "info",
            "trailing-icon": "i-lucide-arrow-right",
            to: `/offers/${offer.id}`
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` К объекту `);
              } else {
                return [
                  createTextVNode(" К объекту ")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(_component_UButton, {
            color: "error",
            icon: "material-symbols:delete-forever",
            onClick: ($event) => removeFromFavorites(offer.id)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Удалить `);
              } else {
                return [
                  createTextVNode("Удалить ")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      if (unref(filteredOffers).length > 1) {
        _push(`<div class="comparison-section-bottom" data-v-0d17a926><div class="section-header" data-v-0d17a926><h2 data-v-0d17a926>Сравнение объектов</h2><p data-v-0d17a926>Сравните выбранные объявления по различным критериям</p></div><div class="comparison-controls" data-v-0d17a926><button class="compare-btn" data-v-0d17a926>${ssrInterpolate(unref(showComparisonInterface) ? "Скрыть сравнение" : "🎯 Сравнить все объявления")}</button></div>`);
        if (unref(showComparisonInterface)) {
          _push(`<div class="comparison-interface" data-v-0d17a926><div class="method-selection" data-v-0d17a926><label data-v-0d17a926>Метод анализа:</label><select class="method-select" data-v-0d17a926><option value="electre" data-v-0d17a926${ssrIncludeBooleanAttr(Array.isArray(unref(selectedMethod)) ? ssrLooseContain(unref(selectedMethod), "electre") : ssrLooseEqual(unref(selectedMethod), "electre")) ? " selected" : ""}>ELECTRE</option><option value="topsis" data-v-0d17a926${ssrIncludeBooleanAttr(Array.isArray(unref(selectedMethod)) ? ssrLooseContain(unref(selectedMethod), "topsis") : ssrLooseEqual(unref(selectedMethod), "topsis")) ? " selected" : ""}>TOPSIS</option></select></div><div class="criteria-selection" data-v-0d17a926><h3 data-v-0d17a926>Выбор критериев для сравнения</h3><p class="selection-info" data-v-0d17a926>Доступны только критерии, присутствующие у всех объектов</p>`);
          if (unref(availableCriteria).length === 0) {
            _push(`<div class="no-criteria-available" data-v-0d17a926><div class="no-criteria-icon" data-v-0d17a926>⚠️</div><h4 data-v-0d17a926>Нет доступных критериев для сравнения</h4><p data-v-0d17a926>У выбранных объектов нет общих критериев. Попробуйте изменить фильтры или добавить больше объектов в избранное.</p></div>`);
          } else {
            _push(`<div class="criteria-grid" data-v-0d17a926><!--[-->`);
            ssrRenderList(unref(availableCriteria), (criterion) => {
              _push(`<div class="${ssrRenderClass([{ "selected": isCriterionSelected(criterion.key) }, "criterion-item"])}" data-v-0d17a926><div class="criterion-checkbox" data-v-0d17a926><input type="checkbox"${ssrIncludeBooleanAttr(isCriterionSelected(criterion.key)) ? " checked" : ""} data-v-0d17a926><span class="checkmark" data-v-0d17a926></span></div><div class="criterion-info" data-v-0d17a926><div class="criterion-name" data-v-0d17a926>${ssrInterpolate(criterion.displayName)}</div><div class="criterion-range" data-v-0d17a926>${ssrInterpolate(formatCriterionRange(criterion))}</div></div></div>`);
            });
            _push(`<!--]--></div>`);
          }
          if (unref(selectedCriteria).length === 0 && unref(availableCriteria).length > 0) {
            _push(`<div class="no-criteria-warning" data-v-0d17a926> ⚠️ Выберите хотя бы один критерий для анализа </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (unref(selectedCriteria).length > 0) {
            _push(`<div class="criteria-weights" data-v-0d17a926><h3 data-v-0d17a926>Настройка весов критериев</h3><div class="weights-grid" data-v-0d17a926><!--[-->`);
            ssrRenderList(unref(selectedCriteriaWithWeights), (criterion) => {
              _push(`<div class="weight-item" data-v-0d17a926><div class="weight-info" data-v-0d17a926><span class="weight-name" data-v-0d17a926>${ssrInterpolate(criterion.displayName)}</span><span class="weight-direction" data-v-0d17a926>${ssrInterpolate(criterion.direction === "max" ? "↑ максимум" : "↓ минимум")}</span></div><div class="weight-controls" data-v-0d17a926><select${ssrRenderAttr("value", criterion.direction)} class="direction-select" data-v-0d17a926><option value="max" data-v-0d17a926>Максимизация</option><option value="min" data-v-0d17a926>Минимизация</option></select><input type="number"${ssrRenderAttr("value", criterion.weight)} min="1" step="0.5" class="weight-input" data-v-0d17a926></div></div>`);
            });
            _push(`<!--]--></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(selectedCriteria).length > 0 && unref(selectedMethod) === "electre") {
            _push(`<div class="algorithm-params" data-v-0d17a926><h4 data-v-0d17a926>Параметры алгоритма ELECTRE:</h4><div class="params-grid" data-v-0d17a926><div class="param-group" data-v-0d17a926><label data-v-0d17a926>Alpha (порог согласия):</label><input type="number"${ssrRenderAttr("value", unref(electreParams).alpha)} min="0" max="1" step="0.05" data-v-0d17a926></div><div class="param-group" data-v-0d17a926><label data-v-0d17a926>Beta (порог несогласия):</label><input type="number"${ssrRenderAttr("value", unref(electreParams).beta)} min="0" max="1" step="0.05" data-v-0d17a926></div><div class="param-group" data-v-0d17a926><label data-v-0d17a926>Шаг изменения:</label><input type="number"${ssrRenderAttr("value", unref(electreParams).step)} min="0.01" max="0.1" step="0.01" data-v-0d17a926></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="analysis-actions" data-v-0d17a926><button${ssrIncludeBooleanAttr(unref(analysisLoading) || unref(selectedCriteria).length === 0) ? " disabled" : ""} class="analyze-button" data-v-0d17a926>`);
          if (unref(analysisLoading)) {
            _push(`<span data-v-0d17a926>Анализ...</span>`);
          } else {
            _push(`<span data-v-0d17a926>Запустить анализ</span>`);
          }
          _push(`</button><button class="reset-button" data-v-0d17a926>Сбросить настройки</button></div>`);
          if (unref(selectedMethod) === "electre" && unref(electreResults)) {
            _push(`<div class="results-section electre-results" data-v-0d17a926><div class="method-header" data-v-0d17a926><h3 data-v-0d17a926>Результаты анализа ELECTRE</h3><button class="close-method-button" title="Закрыть результаты ELECTRE" data-v-0d17a926> × </button></div><p class="results-description" data-v-0d17a926> Метод ELECTRE выявляет недоминируемые объекты (ядро) и показывает сравнительные преимущества. </p>`);
            if (unref(electreResults).kernel && unref(electreResults).kernel.length > 0) {
              _push(`<div class="kernel-section" data-v-0d17a926><h4 data-v-0d17a926>🎯 Ядро (недоминируемые объекты)</h4><div class="kernel-list" data-v-0d17a926><!--[-->`);
              ssrRenderList(unref(electreResults).kernel, (kernelIndex) => {
                _push(`<div class="kernel-item" data-v-0d17a926><div class="kernel-offer" data-v-0d17a926><div class="kernel-title" data-v-0d17a926>${ssrInterpolate(getOfferTitleByIndex(kernelIndex))}</div><div class="kernel-address" data-v-0d17a926>${ssrInterpolate(getOfferAddressByIndex(kernelIndex))}</div></div><a${ssrRenderAttr("href", getOfferUrlByIndex(kernelIndex))} target="_blank" class="kernel-link" data-v-0d17a926> К объекту </a></div>`);
              });
              _push(`<!--]--></div></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="comparison-section" data-v-0d17a926><h4 data-v-0d17a926>📊 Сравнительный анализ</h4><div class="comparison-list" data-v-0d17a926><!--[-->`);
            ssrRenderList(unref(electreResults).allIds, (offerId) => {
              _push(`<div class="comparison-card" data-v-0d17a926><div class="comparison-header" data-v-0d17a926><div class="comparison-info" data-v-0d17a926><div class="comparison-title" data-v-0d17a926>${ssrInterpolate(getOfferTitle(offerId))}</div><div class="comparison-address" data-v-0d17a926>${ssrInterpolate(getOfferAddress(offerId))}</div></div><a${ssrRenderAttr("href", getOfferUrl(offerId))} target="_blank" class="comparison-link" data-v-0d17a926> К объекту </a></div><div class="dominance-comparisons" data-v-0d17a926><!--[-->`);
              ssrRenderList(getDominanceComparisons(offerId), (comparison) => {
                _push(`<div class="dominance-item" data-v-0d17a926><div class="comparison-with" data-v-0d17a926><strong data-v-0d17a926>Сравнение с:</strong> ${ssrInterpolate(getOfferTitle(comparison.otherOfferId))}</div>`);
                if (comparison.superior.length > 0) {
                  _push(`<div class="comparison-category" data-v-0d17a926><div class="category-label superior" data-v-0d17a926> ✅ Превосходит по: </div><div class="criteria-chips" data-v-0d17a926><!--[-->`);
                  ssrRenderList(comparison.superior, (criterionIndex) => {
                    _push(`<span class="chip superior-chip" data-v-0d17a926>${ssrInterpolate(getCriterionShortName(unref(selectedCriteria)[criterionIndex]))}</span>`);
                  });
                  _push(`<!--]--></div></div>`);
                } else {
                  _push(`<!---->`);
                }
                if (comparison.inferior.length > 0) {
                  _push(`<div class="comparison-category" data-v-0d17a926><div class="category-label inferior" data-v-0d17a926> ❌ Уступает по: </div><div class="criteria-chips" data-v-0d17a926><!--[-->`);
                  ssrRenderList(comparison.inferior, (criterionIndex) => {
                    _push(`<span class="chip inferior-chip" data-v-0d17a926>${ssrInterpolate(getCriterionShortName(unref(selectedCriteria)[criterionIndex]))}</span>`);
                  });
                  _push(`<!--]--></div></div>`);
                } else {
                  _push(`<!---->`);
                }
                if (comparison.equal.length > 0) {
                  _push(`<div class="comparison-category" data-v-0d17a926><div class="category-label equal" data-v-0d17a926> ⚖️ Равны по: </div><div class="criteria-chips" data-v-0d17a926><!--[-->`);
                  ssrRenderList(comparison.equal, (criterionIndex) => {
                    _push(`<span class="chip equal-chip" data-v-0d17a926>${ssrInterpolate(getCriterionShortName(unref(selectedCriteria)[criterionIndex]))}</span>`);
                  });
                  _push(`<!--]--></div></div>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`</div>`);
              });
              _push(`<!--]--></div></div>`);
            });
            _push(`<!--]--></div></div></div>`);
          } else if (unref(selectedMethod) === "topsis" && unref(topsisResults)) {
            _push(`<div class="topsis-results" data-v-0d17a926><h3 data-v-0d17a926>Результаты сравнения методом TOPSIS</h3><div class="ranking-section" data-v-0d17a926><h4 class="mb-2" data-v-0d17a926>Ранжирование объектов</h4><div class="ranking-list" data-v-0d17a926><!--[-->`);
            ssrRenderList(unref(topsisRanking), (rank, index) => {
              _push(`<div class="${ssrRenderClass([getRankItemClass(index), "rank-item"])}" data-v-0d17a926><div class="rank-header" data-v-0d17a926><div class="${ssrRenderClass([getRankNumberClass(index), "rank-number"])}" data-v-0d17a926>${ssrInterpolate(index + 1)}</div><div class="rank-info" data-v-0d17a926><div class="offer-title" data-v-0d17a926>${ssrInterpolate(getOfferTitle(rank.offerId))}</div><div class="offer-address" data-v-0d17a926>${ssrInterpolate(getOfferAddress(rank.offerId))}</div></div><a${ssrRenderAttr("href", getOfferUrl(rank.offerId))} target="_blank" class="rank-link" data-v-0d17a926> К объекту </a></div><div class="score-section" data-v-0d17a926><div class="score-info" data-v-0d17a926><div data-v-0d17a926><span class="score-label" data-v-0d17a926>Коэффициент близости: </span><span class="score-value" data-v-0d17a926>${ssrInterpolate(rank.score.toFixed(4))}</span></div><div class="progress-bar" data-v-0d17a926><div style="${ssrRenderStyle({ width: rank.score * 100 + "%" })}" class="${ssrRenderClass([getProgressFillClass(index), "progress-fill"])}" data-v-0d17a926></div></div></div></div></div>`);
            });
            _push(`<!--]--></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/favorites2.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const favorites2 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0d17a926"]]);

export { favorites2 as default };
//# sourceMappingURL=favorites2-DrKalQd5.mjs.map
