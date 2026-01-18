import { _ as __nuxt_component_0, a as __nuxt_component_1 } from './AddressAutocomplete-BUzK95vI.mjs';
import { _ as _sfc_main$1 } from './Badge-DNgMi0Nd.mjs';
import { _ as _sfc_main$2 } from './Button-BL6TDcLa.mjs';
import { _ as _sfc_main$3 } from './Select-C_JPTPfA.mjs';
import { _ as _sfc_main$4 } from './Icon-DX0OfCis.mjs';
import { _ as _sfc_main$5 } from './Card-DvXVHhAS.mjs';
import { _ as _sfc_main$6 } from './Input-2RIsD9n3.mjs';
import { defineComponent, ref, computed, watch, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, isRef, createBlock, createCommentVNode, openBlock, withModifiers, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
import { _ as _export_sfc, a as useNuxtApp, m as useRouter } from './server.mjs';
import { u as useAsyncData } from './asyncData-DVeqSZBv.mjs';
import './Checkbox-DYXK6_Q4.mjs';
import 'reka-ui';
import '@vueuse/core';
import './useFormField-C7CorFZK.mjs';
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
import './index-CED3XvSe.mjs';
import './Link-gmgU2Miy.mjs';
import './nuxt-link-DYDQwZUP.mjs';
import './usePortal-5Oa56NQY.mjs';
import './index-gA-qUlDT.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import 'vue-router';
import 'jwt-decode';
import 'tailwindcss/colors';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const sortFields = ref([
      {
        label: "Цена",
        value: "price:asc",
        icon: "material-symbols:arrow-upward-alt"
      },
      {
        label: "Цена",
        value: "price:desc",
        icon: "material-symbols:arrow-downward-alt"
      },
      {
        label: "Цена за м²",
        value: "price_per_square_meter:asc",
        icon: "material-symbols:arrow-upward-alt"
      },
      {
        label: "Цена за м²",
        value: "price_per_square_meter:desc",
        icon: "material-symbols:arrow-downward-alt"
      },
      {
        label: "Площадь",
        value: "total_area:asc",
        icon: "material-symbols:arrow-upward-alt"
      },
      {
        label: "Площадь",
        value: "total_area:desc",
        icon: "material-symbols:arrow-downward-alt"
      },
      {
        label: "Дата публикации",
        value: "creation_date_source:asc",
        icon: "material-symbols:arrow-upward-alt"
      },
      {
        label: "Дата публикации",
        value: "creation_date_source:desc",
        icon: "material-symbols:arrow-downward-alt"
      },
      {
        label: "Просмотры",
        value: "views_count:asc",
        icon: "material-symbols:arrow-upward-alt"
      },
      {
        label: "Просмотры",
        value: "views_count:desc",
        icon: "material-symbols:arrow-downward-alt"
      }
    ]);
    const sortValue = ref(sortFields.value[7]?.value);
    const icon = computed(() => sortFields.value.find((item) => item.value === sortValue.value)?.icon);
    const { $api } = useNuxtApp();
    const limit = ref(20);
    const offset = ref(0);
    const jumpPage = ref(1);
    const currentFilters = ref({});
    const addressForSearch = computed(() => currentFilters.value.address_query);
    const prepareRequestQuery = () => {
      const query = {
        limit: limit.value,
        offset: offset.value
      };
      if (currentFilters.value && Object.keys(currentFilters.value).length > 0) {
        Object.entries(currentFilters.value).forEach(([key, value]) => {
          if (value == null || value === "" || Array.isArray(value) && value.length === 0) return;
          if (Array.isArray(value)) {
            query[key] = value.filter((item) => item != null && item !== "");
          } else if (typeof value === "boolean") {
            if (value === true) {
              query[key] = String(value);
            }
          } else if (typeof value === "object" && !Array.isArray(value)) {
            query[key] = JSON.stringify(value);
          } else {
            query[key] = String(value);
          }
        });
      }
      if (sortValue.value) {
        const [sort_by, sort_order] = sortValue.value.split(":");
        query.sort_by = sort_by;
        query.sort_order = sort_order;
      }
      return query;
    };
    const {
      data: offersData,
      pending: offersPending,
      error: offersError,
      refresh: refreshOffers
    } = useAsyncData(
      "offers",
      () => $api("/offers", {
        params: prepareRequestQuery()
      }),
      {}
    );
    const offers = computed(() => offersData.value?.offers || []);
    const totalCount = computed(() => offersData.value?.total_count || 0);
    const filteredCount = computed(() => offersData.value?.filtered_count || 0);
    const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1);
    const totalPages = computed(() => Math.ceil(filteredCount.value / limit.value));
    const visiblePages = computed(() => {
      const pages = [];
      const start = Math.max(1, currentPage.value - 2);
      const end = Math.min(totalPages.value, currentPage.value + 2);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    });
    const { data: favoritesData, refresh: refreshFavorites } = useAsyncData("favorites", () => $api("offers/favorites/"));
    const favoriteOffers = computed(() => {
      return new Set(favoritesData.value?.map((item) => item.id) || []);
    });
    const toggleFavorite = async (offer) => {
      if (!offer.id) return;
      const offerId = offer.id;
      const wasFavorite = favoriteOffers.value.has(offerId);
      try {
        if (wasFavorite) {
          $api(`offers/favorites/${offerId}`, { method: "DELETE" });
          if (favoritesData.value) {
            favoritesData.value = favoritesData.value.filter((item) => item.id !== offerId);
          }
        } else {
          $api(`offers/favorites/${offerId}`, { method: "POST" });
          if (favoritesData.value) {
            favoritesData.value = [...favoritesData.value, offer];
          }
        }
      } catch (error) {
        console.error("Ошибка при обновлении избранного:", error);
      }
    };
    const isFavorite = (offerId) => {
      return offerId !== null && favoriteOffers.value.has(offerId);
    };
    const handleFiltersApply = async (filtersData) => {
      console.log("Получены фильтры через событие:", filtersData);
      offset.value = 0;
      refreshFavorites();
      currentFilters.value = {
        ...filtersData,
        ..."address_query" in currentFilters.value && {
          address_query: currentFilters.value.address_query
        }
      };
      console.log("Объединённые фильтры:", currentFilters.value);
      refreshOffers();
    };
    const handleFiltersReset = async () => {
      offset.value = 0;
      const filtersToKeep = {};
      if (currentFilters.value.address_query) {
        filtersToKeep.address_query = currentFilters.value.address_query;
      }
      currentFilters.value = { ...filtersToKeep };
      refreshFavorites();
      refreshOffers();
    };
    const handleAddressSearch = async (query) => {
      if (!query.trim()) {
        clearAddressSearch();
        return;
      }
      currentFilters.value = {
        ...currentFilters.value,
        address_query: query
      };
      offset.value = 0;
      refreshOffers();
    };
    const clearAddressSearch = async () => {
      const { address_query, ...filtersWithoutAddress } = currentFilters.value;
      currentFilters.value = filtersWithoutAddress;
      offset.value = 0;
      refreshOffers();
    };
    const goToPage = async (page) => {
      if (page < 1 || page > totalPages.value) return;
      offset.value = (page - 1) * limit.value;
      refreshOffers();
    };
    const openOffer = (offer) => {
      const router = useRouter();
      router.push(`/offers/${offer.id}`);
    };
    const formatPrice = (price) => price ? new Intl.NumberFormat("ru-RU").format(price) + " ₽" : "Цена не указана";
    const getPriceCategoryColor = (category) => {
      switch (category) {
        case "expensive":
          return "error";
        case "normal":
          return "info";
        case "cheap":
          return "success";
        default:
          return "gray";
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
    const getCategoryColor = (category) => {
      switch (category) {
        case "high":
          return "success";
        case "medium":
          return "warning";
        case "low":
          return "error";
        default:
          return "gray";
      }
    };
    const getCategoryLabel = (category) => {
      switch (category) {
        case "high":
          return "Высокая";
        case "medium":
          return "Средняя";
        case "low":
          return "Низкая";
        default:
          return category;
      }
    };
    watch(sortValue, async () => {
      offset.value = 0;
      refreshOffers();
    });
    watch(currentPage, (newPage) => {
      jumpPage.value = newPage;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FiltersSidebar = __nuxt_component_0;
      const _component_AddressAutocomplete = __nuxt_component_1;
      const _component_UBadge = _sfc_main$1;
      const _component_UButton = _sfc_main$2;
      const _component_USelect = _sfc_main$3;
      const _component_UIcon = _sfc_main$4;
      const _component_UCard = _sfc_main$5;
      const _component_UInput = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex gap-5 mx-auto p-5" }, _attrs))} data-v-929925cc>`);
      _push(ssrRenderComponent(_component_FiltersSidebar, {
        ref: "filtersRef",
        onFiltersApply: handleFiltersApply,
        onFiltersReset: handleFiltersReset
      }, null, _parent));
      _push(`<main class="w-full" data-v-929925cc><div class="mb-4" data-v-929925cc>`);
      _push(ssrRenderComponent(_component_AddressAutocomplete, {
        onAddressSelected: handleAddressSearch,
        onSearchTriggered: handleAddressSearch
      }, null, _parent));
      _push(`</div>`);
      if (unref(addressForSearch)) {
        _push(ssrRenderComponent(_component_UBadge, {
          size: "xs",
          variant: "subtle",
          class: "mb-2 px-3 text-sm",
          color: "info"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(addressForSearch))} `);
              _push2(ssrRenderComponent(_component_UButton, {
                "trailing-icon": "heroicons:x-mark-16-solid",
                variant: "outline",
                class: "px-0 ring-[#e9f2ff] pt-2 border-0 bg-transparent",
                color: "info",
                onClick: clearAddressSearch,
                size: "md"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createTextVNode(toDisplayString(unref(addressForSearch)) + " ", 1),
                createVNode(_component_UButton, {
                  "trailing-icon": "heroicons:x-mark-16-solid",
                  variant: "outline",
                  class: "px-0 ring-[#e9f2ff] pt-2 border-0 bg-transparent",
                  color: "info",
                  onClick: clearAddressSearch,
                  size: "md"
                })
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(offersError)) {
        _push(`<div class="error-message" data-v-929925cc>${ssrInterpolate(unref(offersError))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex gap-8 text-sm items-center mb-5" data-v-929925cc><span class="font-[550]" data-v-929925cc>Всего объявлений: ${ssrInterpolate(unref(totalCount).toLocaleString("ru-RU"))}</span><span class="font-[550] text-primary" data-v-929925cc>Подходящих объявлений: ${ssrInterpolate(unref(filteredCount).toLocaleString("ru-RU"))}</span>`);
      _push(ssrRenderComponent(_component_USelect, {
        modelValue: unref(sortValue),
        "onUpdate:modelValue": ($event) => isRef(sortValue) ? sortValue.value = $event : null,
        items: unref(sortFields),
        class: "w-48",
        "value-key": "value",
        icon: unref(icon),
        ui: {
          trailingIcon: "group-data-[state=open]:rotate-180 transition-transform duration-200"
        }
      }, null, _parent));
      _push(`</div>`);
      if (unref(offersPending)) {
        _push(`<div class="flex justify-center mt-75" data-v-929925cc>`);
        _push(ssrRenderComponent(_component_UIcon, {
          size: "70",
          name: "codex:loader",
          class: "loading-icon"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(offers).length === 0 && !unref(offersPending)) {
        _push(`<div class="no-results" data-v-929925cc>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "i-heroicons-magnifying-glass",
          class: "no-results-icon"
        }, null, _parent));
        _push(`<h3 data-v-929925cc>Объявления не найдены</h3><p data-v-929925cc>Попробуйте изменить параметры фильтрации</p></div>`);
      } else {
        _push(`<div class="flex flex-col gap-4" data-v-929925cc><!--[-->`);
        ssrRenderList(unref(offers), (offer) => {
          _push(ssrRenderComponent(_component_UCard, {
            variant: "outline",
            key: offer.id,
            class: "offer-card",
            onClick: ($event) => openOffer(offer)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex h-42" data-v-929925cc${_scopeId}><div class="w-50 relative" data-v-929925cc${_scopeId}>`);
                if (offer.images_urls?.length) {
                  _push2(`<img${ssrRenderAttr("src", offer.images_urls[0])} class="object-cover w-full h-full" data-v-929925cc${_scopeId}>`);
                } else {
                  _push2(`<div class="no-image" data-v-929925cc${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "i-heroicons-photo",
                    class: "text-gray-400 text-2xl"
                  }, null, _parent2, _scopeId));
                  _push2(`</div>`);
                }
                if (offer.is_new_house == true) {
                  _push2(ssrRenderComponent(_component_UBadge, {
                    color: "info",
                    variant: "solid",
                    class: "absolute top-2 left-2"
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
                _push2(`</div><div class="offer-details" data-v-929925cc${_scopeId}><div class="offer-header" data-v-929925cc${_scopeId}><div class="offer-title-section" data-v-929925cc${_scopeId}><div class="flex gap-2" data-v-929925cc${_scopeId}>`);
                if (offer.family_category) {
                  _push2(ssrRenderComponent(_component_UBadge, {
                    color: getCategoryColor(offer.family_category),
                    variant: "solid",
                    class: "category-badge"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(` Семья: ${ssrInterpolate(getCategoryLabel(offer.family_category))} `);
                        if (offer.family_score !== null && offer.family_score !== void 0) {
                          _push3(`<span data-v-929925cc${_scopeId2}> (${ssrInterpolate(offer.family_score.toFixed(2))}) </span>`);
                        } else {
                          _push3(`<!---->`);
                        }
                      } else {
                        return [
                          createTextVNode(" Семья: " + toDisplayString(getCategoryLabel(offer.family_category)) + " ", 1),
                          offer.family_score !== null && offer.family_score !== void 0 ? (openBlock(), createBlock("span", { key: 0 }, " (" + toDisplayString(offer.family_score.toFixed(2)) + ") ", 1)) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                if (offer.elderly_category) {
                  _push2(ssrRenderComponent(_component_UBadge, {
                    color: getCategoryColor(offer.elderly_category),
                    variant: "solid",
                    class: "category-badge"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(` Пожилые: ${ssrInterpolate(getCategoryLabel(offer.elderly_category))} `);
                        if (offer.elderly_score !== null && offer.elderly_score !== void 0) {
                          _push3(`<span data-v-929925cc${_scopeId2}> (${ssrInterpolate(offer.elderly_score.toFixed(2))}) </span>`);
                        } else {
                          _push3(`<!---->`);
                        }
                      } else {
                        return [
                          createTextVNode(" Пожилые: " + toDisplayString(getCategoryLabel(offer.elderly_category)) + " ", 1),
                          offer.elderly_score !== null && offer.elderly_score !== void 0 ? (openBlock(), createBlock("span", { key: 0 }, " (" + toDisplayString(offer.elderly_score.toFixed(2)) + ") ", 1)) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                if (offer.transport_access_category) {
                  _push2(ssrRenderComponent(_component_UBadge, {
                    color: getCategoryColor(offer.transport_access_category),
                    variant: "solid",
                    class: "category-badge"
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(` Транспорт: ${ssrInterpolate(getCategoryLabel(offer.transport_access_category))} `);
                        if (offer.transport_access_score !== null && offer.transport_access_score !== void 0) {
                          _push3(`<span data-v-929925cc${_scopeId2}> (${ssrInterpolate(offer.transport_access_score.toFixed(2))}) </span>`);
                        } else {
                          _push3(`<!---->`);
                        }
                      } else {
                        return [
                          createTextVNode(" Транспорт: " + toDisplayString(getCategoryLabel(offer.transport_access_category)) + " ", 1),
                          offer.transport_access_score !== null && offer.transport_access_score !== void 0 ? (openBlock(), createBlock("span", { key: 0 }, " (" + toDisplayString(offer.transport_access_score.toFixed(2)) + ") ", 1)) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><h3 class="offer-title" data-v-929925cc${_scopeId}>${ssrInterpolate(offer.title || "Без названия")}</h3><div class="offer-address" data-v-929925cc${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: "tabler:map-pin",
                  class: "size-5"
                }, null, _parent2, _scopeId));
                _push2(` ${ssrInterpolate(offer.address?.full_address)}</div><div class="offer-specs" data-v-929925cc${_scopeId}><div class="spec-item" data-v-929925cc${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: "bx:area",
                  class: "size-6"
                }, null, _parent2, _scopeId));
                _push2(`<span data-v-929925cc${_scopeId}>${ssrInterpolate(offer.total_area || "–")} м²</span></div>`);
                if (offer.land_area) {
                  _push2(`<div class="spec-item" data-v-929925cc${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "lucide:land-plot",
                    class: "size-6"
                  }, null, _parent2, _scopeId));
                  _push2(`<span data-v-929925cc${_scopeId}>${ssrInterpolate(offer.land_area || "–")} сот.</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.rooms_count) {
                  _push2(`<div class="spec-item" data-v-929925cc${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "temaki:room",
                    class: "size-6"
                  }, null, _parent2, _scopeId));
                  _push2(`<span data-v-929925cc${_scopeId}>${ssrInterpolate(offer.rooms_count)} комн.</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.floor) {
                  _push2(`<div class="spec-item" data-v-929925cc${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "material-symbols:floor",
                    class: "size-6"
                  }, null, _parent2, _scopeId));
                  _push2(`<span data-v-929925cc${_scopeId}>${ssrInterpolate(offer.floor)}${ssrInterpolate(offer.house_floors_count ? "/" + offer.house_floors_count : "")} эт.</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.floor === null && offer.house_floors_count !== null) {
                  _push2(`<div class="spec-item" data-v-929925cc${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "material-symbols:floor",
                    class: "size-6"
                  }, null, _parent2, _scopeId));
                  _push2(`<span data-v-929925cc${_scopeId}>${ssrInterpolate(offer.house_floors_count)} эт.</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.has_water_supply) {
                  _push2(`<div class="spec-item" data-v-929925cc${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "material-symbols:water-drop-outline",
                    class: "size-6"
                  }, null, _parent2, _scopeId));
                  _push2(`<span data-v-929925cc${_scopeId}>Вода</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.has_electricity) {
                  _push2(`<div class="spec-item" data-v-929925cc${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "mage:electricity",
                    class: "size-6"
                  }, null, _parent2, _scopeId));
                  _push2(`<span data-v-929925cc${_scopeId}>Электричество</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.renovation_type?.name) {
                  _push2(`<div class="spec-item" data-v-929925cc${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "lsicon:decorate-outline",
                    class: "size-6"
                  }, null, _parent2, _scopeId));
                  _push2(`<span data-v-929925cc${_scopeId}>${ssrInterpolate(offer.renovation_type?.name)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.house_built_year) {
                  _push2(`<div class="spec-item" data-v-929925cc${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "i-heroicons-calendar",
                    class: "size-6"
                  }, null, _parent2, _scopeId));
                  _push2(`<span data-v-929925cc${_scopeId}>${ssrInterpolate(offer.house_built_year)} г.</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.is_build_complete) {
                  _push2(`<div class="spec-item" data-v-929925cc${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "fluent-mdl2:completed-solid",
                    class: "size-6"
                  }, null, _parent2, _scopeId));
                  _push2(`<span data-v-929925cc${_scopeId}>Сдан</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.has_furniture) {
                  _push2(`<div class="spec-item" data-v-929925cc${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "temaki:furniture",
                    class: "size-6"
                  }, null, _parent2, _scopeId));
                  _push2(`<span data-v-929925cc${_scopeId}>С мебелью</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.has_elevator) {
                  _push2(`<div class="spec-item" data-v-929925cc${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "tabler:elevator",
                    class: "size-6"
                  }, null, _parent2, _scopeId));
                  _push2(`<span data-v-929925cc${_scopeId}>Лифт</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (offer.has_garbage_chute) {
                  _push2(`<div class="spec-item" data-v-929925cc${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_UIcon, {
                    name: "mdi:garbage-can-outline",
                    class: "size-6"
                  }, null, _parent2, _scopeId));
                  _push2(`<span data-v-929925cc${_scopeId}>Мусоропровод</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div><div class="offer-price-section" data-v-929925cc${_scopeId}><button class="${ssrRenderClass([{ active: isFavorite(offer.id) }, "favorite-heart"])}" data-v-929925cc${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  name: isFavorite(offer.id) ? "material-symbols-light:favorite" : "material-symbols-light:favorite-outline",
                  class: "heart-icon"
                }, null, _parent2, _scopeId));
                _push2(`</button><span class="creation-date spec-item" data-v-929925cc${_scopeId}>Опубликовано: ${ssrInterpolate(new Date(offer.creation_date_source).toLocaleString("ru-RU", {
                  timeZone: "Europe/Moscow",
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                }))}</span><div class="flex items-center gap-3" data-v-929925cc${_scopeId}>`);
                if (offer.price_category) {
                  _push2(ssrRenderComponent(_component_UBadge, {
                    color: getPriceCategoryColor(offer.price_category),
                    variant: "solid",
                    class: "category-badge"
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
                _push2(`<div class="offer-price" data-v-929925cc${_scopeId}>${ssrInterpolate(formatPrice(offer.price))}</div></div><div class="price-per-meter" data-v-929925cc${_scopeId}>${ssrInterpolate(formatPrice(offer.price_per_square_meter))}/м²</div></div></div></div></div>`);
              } else {
                return [
                  createVNode("div", { class: "flex h-42" }, [
                    createVNode("div", { class: "w-50 relative" }, [
                      offer.images_urls?.length ? (openBlock(), createBlock("img", {
                        key: 0,
                        src: offer.images_urls[0],
                        class: "object-cover w-full h-full"
                      }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                        key: 1,
                        class: "no-image"
                      }, [
                        createVNode(_component_UIcon, {
                          name: "i-heroicons-photo",
                          class: "text-gray-400 text-2xl"
                        })
                      ])),
                      offer.is_new_house == true ? (openBlock(), createBlock(_component_UBadge, {
                        key: 2,
                        color: "info",
                        variant: "solid",
                        class: "absolute top-2 left-2"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Новостройка ")
                        ]),
                        _: 1
                      })) : createCommentVNode("", true)
                    ]),
                    createVNode("div", { class: "offer-details" }, [
                      createVNode("div", { class: "offer-header" }, [
                        createVNode("div", { class: "offer-title-section" }, [
                          createVNode("div", { class: "flex gap-2" }, [
                            offer.family_category ? (openBlock(), createBlock(_component_UBadge, {
                              key: 0,
                              color: getCategoryColor(offer.family_category),
                              variant: "solid",
                              class: "category-badge"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Семья: " + toDisplayString(getCategoryLabel(offer.family_category)) + " ", 1),
                                offer.family_score !== null && offer.family_score !== void 0 ? (openBlock(), createBlock("span", { key: 0 }, " (" + toDisplayString(offer.family_score.toFixed(2)) + ") ", 1)) : createCommentVNode("", true)
                              ]),
                              _: 2
                            }, 1032, ["color"])) : createCommentVNode("", true),
                            offer.elderly_category ? (openBlock(), createBlock(_component_UBadge, {
                              key: 1,
                              color: getCategoryColor(offer.elderly_category),
                              variant: "solid",
                              class: "category-badge"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Пожилые: " + toDisplayString(getCategoryLabel(offer.elderly_category)) + " ", 1),
                                offer.elderly_score !== null && offer.elderly_score !== void 0 ? (openBlock(), createBlock("span", { key: 0 }, " (" + toDisplayString(offer.elderly_score.toFixed(2)) + ") ", 1)) : createCommentVNode("", true)
                              ]),
                              _: 2
                            }, 1032, ["color"])) : createCommentVNode("", true),
                            offer.transport_access_category ? (openBlock(), createBlock(_component_UBadge, {
                              key: 2,
                              color: getCategoryColor(offer.transport_access_category),
                              variant: "solid",
                              class: "category-badge"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" Транспорт: " + toDisplayString(getCategoryLabel(offer.transport_access_category)) + " ", 1),
                                offer.transport_access_score !== null && offer.transport_access_score !== void 0 ? (openBlock(), createBlock("span", { key: 0 }, " (" + toDisplayString(offer.transport_access_score.toFixed(2)) + ") ", 1)) : createCommentVNode("", true)
                              ]),
                              _: 2
                            }, 1032, ["color"])) : createCommentVNode("", true)
                          ]),
                          createVNode("h3", { class: "offer-title" }, toDisplayString(offer.title || "Без названия"), 1),
                          createVNode("div", { class: "offer-address" }, [
                            createVNode(_component_UIcon, {
                              name: "tabler:map-pin",
                              class: "size-5"
                            }),
                            createTextVNode(" " + toDisplayString(offer.address?.full_address), 1)
                          ]),
                          createVNode("div", { class: "offer-specs" }, [
                            createVNode("div", { class: "spec-item" }, [
                              createVNode(_component_UIcon, {
                                name: "bx:area",
                                class: "size-6"
                              }),
                              createVNode("span", null, toDisplayString(offer.total_area || "–") + " м²", 1)
                            ]),
                            offer.land_area ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "spec-item"
                            }, [
                              createVNode(_component_UIcon, {
                                name: "lucide:land-plot",
                                class: "size-6"
                              }),
                              createVNode("span", null, toDisplayString(offer.land_area || "–") + " сот.", 1)
                            ])) : createCommentVNode("", true),
                            offer.rooms_count ? (openBlock(), createBlock("div", {
                              key: 1,
                              class: "spec-item"
                            }, [
                              createVNode(_component_UIcon, {
                                name: "temaki:room",
                                class: "size-6"
                              }),
                              createVNode("span", null, toDisplayString(offer.rooms_count) + " комн.", 1)
                            ])) : createCommentVNode("", true),
                            offer.floor ? (openBlock(), createBlock("div", {
                              key: 2,
                              class: "spec-item"
                            }, [
                              createVNode(_component_UIcon, {
                                name: "material-symbols:floor",
                                class: "size-6"
                              }),
                              createVNode("span", null, toDisplayString(offer.floor) + toDisplayString(offer.house_floors_count ? "/" + offer.house_floors_count : "") + " эт.", 1)
                            ])) : createCommentVNode("", true),
                            offer.floor === null && offer.house_floors_count !== null ? (openBlock(), createBlock("div", {
                              key: 3,
                              class: "spec-item"
                            }, [
                              createVNode(_component_UIcon, {
                                name: "material-symbols:floor",
                                class: "size-6"
                              }),
                              createVNode("span", null, toDisplayString(offer.house_floors_count) + " эт.", 1)
                            ])) : createCommentVNode("", true),
                            offer.has_water_supply ? (openBlock(), createBlock("div", {
                              key: 4,
                              class: "spec-item"
                            }, [
                              createVNode(_component_UIcon, {
                                name: "material-symbols:water-drop-outline",
                                class: "size-6"
                              }),
                              createVNode("span", null, "Вода")
                            ])) : createCommentVNode("", true),
                            offer.has_electricity ? (openBlock(), createBlock("div", {
                              key: 5,
                              class: "spec-item"
                            }, [
                              createVNode(_component_UIcon, {
                                name: "mage:electricity",
                                class: "size-6"
                              }),
                              createVNode("span", null, "Электричество")
                            ])) : createCommentVNode("", true),
                            offer.renovation_type?.name ? (openBlock(), createBlock("div", {
                              key: 6,
                              class: "spec-item"
                            }, [
                              createVNode(_component_UIcon, {
                                name: "lsicon:decorate-outline",
                                class: "size-6"
                              }),
                              createVNode("span", null, toDisplayString(offer.renovation_type?.name), 1)
                            ])) : createCommentVNode("", true),
                            offer.house_built_year ? (openBlock(), createBlock("div", {
                              key: 7,
                              class: "spec-item"
                            }, [
                              createVNode(_component_UIcon, {
                                name: "i-heroicons-calendar",
                                class: "size-6"
                              }),
                              createVNode("span", null, toDisplayString(offer.house_built_year) + " г.", 1)
                            ])) : createCommentVNode("", true),
                            offer.is_build_complete ? (openBlock(), createBlock("div", {
                              key: 8,
                              class: "spec-item"
                            }, [
                              createVNode(_component_UIcon, {
                                name: "fluent-mdl2:completed-solid",
                                class: "size-6"
                              }),
                              createVNode("span", null, "Сдан")
                            ])) : createCommentVNode("", true),
                            offer.has_furniture ? (openBlock(), createBlock("div", {
                              key: 9,
                              class: "spec-item"
                            }, [
                              createVNode(_component_UIcon, {
                                name: "temaki:furniture",
                                class: "size-6"
                              }),
                              createVNode("span", null, "С мебелью")
                            ])) : createCommentVNode("", true),
                            offer.has_elevator ? (openBlock(), createBlock("div", {
                              key: 10,
                              class: "spec-item"
                            }, [
                              createVNode(_component_UIcon, {
                                name: "tabler:elevator",
                                class: "size-6"
                              }),
                              createVNode("span", null, "Лифт")
                            ])) : createCommentVNode("", true),
                            offer.has_garbage_chute ? (openBlock(), createBlock("div", {
                              key: 11,
                              class: "spec-item"
                            }, [
                              createVNode(_component_UIcon, {
                                name: "mdi:garbage-can-outline",
                                class: "size-6"
                              }),
                              createVNode("span", null, "Мусоропровод")
                            ])) : createCommentVNode("", true)
                          ])
                        ]),
                        createVNode("div", { class: "offer-price-section" }, [
                          createVNode("button", {
                            class: ["favorite-heart", { active: isFavorite(offer.id) }],
                            onClick: withModifiers(($event) => toggleFavorite(offer), ["stop"])
                          }, [
                            createVNode(_component_UIcon, {
                              name: isFavorite(offer.id) ? "material-symbols-light:favorite" : "material-symbols-light:favorite-outline",
                              class: "heart-icon"
                            }, null, 8, ["name"])
                          ], 10, ["onClick"]),
                          createVNode("span", { class: "creation-date spec-item" }, "Опубликовано: " + toDisplayString(new Date(offer.creation_date_source).toLocaleString("ru-RU", {
                            timeZone: "Europe/Moscow",
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })), 1),
                          createVNode("div", { class: "flex items-center gap-3" }, [
                            offer.price_category ? (openBlock(), createBlock(_component_UBadge, {
                              key: 0,
                              color: getPriceCategoryColor(offer.price_category),
                              variant: "solid",
                              class: "category-badge"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(getPriceCategoryLabel(offer.price_category)), 1)
                              ]),
                              _: 2
                            }, 1032, ["color"])) : createCommentVNode("", true),
                            createVNode("div", { class: "offer-price" }, toDisplayString(formatPrice(offer.price)), 1)
                          ]),
                          createVNode("div", { class: "price-per-meter" }, toDisplayString(formatPrice(offer.price_per_square_meter)) + "/м²", 1)
                        ])
                      ])
                    ])
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
      }
      if (unref(totalPages) > 1) {
        _push(`<div class="pagination-container" data-v-929925cc><div class="pagination" data-v-929925cc>`);
        _push(ssrRenderComponent(_component_UButton, {
          onClick: ($event) => goToPage(unref(currentPage) - 1),
          disabled: unref(currentPage) === 1,
          variant: "outline",
          class: "pagination-button"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-heroicons-chevron-left",
                class: "size-4"
              }, null, _parent2, _scopeId));
              _push2(` Назад `);
            } else {
              return [
                createVNode(_component_UIcon, {
                  name: "i-heroicons-chevron-left",
                  class: "size-4"
                }),
                createTextVNode(" Назад ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="page-numbers" data-v-929925cc>`);
        if (unref(currentPage) > 3) {
          _push(ssrRenderComponent(_component_UButton, {
            onClick: ($event) => goToPage(1),
            variant: unref(currentPage) === 1 ? "solid" : "outline",
            class: "page-button"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` 1 `);
              } else {
                return [
                  createTextVNode(" 1 ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(currentPage) > 4) {
          _push(`<span class="page-ellipsis" data-v-929925cc>...</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(visiblePages), (page) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: page,
            onClick: ($event) => goToPage(page),
            variant: page === unref(currentPage) ? "solid" : "outline",
            color: page === unref(currentPage) ? "primary" : "neutral",
            class: "page-button"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(page)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(page), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]-->`);
        if (unref(currentPage) < unref(totalPages) - 3) {
          _push(`<span class="page-ellipsis" data-v-929925cc>...</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(currentPage) < unref(totalPages) - 2) {
          _push(ssrRenderComponent(_component_UButton, {
            onClick: ($event) => goToPage(unref(totalPages)),
            variant: unref(currentPage) === unref(totalPages) ? "solid" : "outline",
            class: "page-button"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(totalPages))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(totalPages)), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        _push(ssrRenderComponent(_component_UButton, {
          onClick: ($event) => goToPage(unref(currentPage) + 1),
          disabled: unref(currentPage) === unref(totalPages),
          variant: "outline",
          class: "pagination-button"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Вперед `);
              _push2(ssrRenderComponent(_component_UIcon, {
                name: "i-heroicons-chevron-right",
                class: "size-4"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createTextVNode(" Вперед "),
                createVNode(_component_UIcon, {
                  name: "i-heroicons-chevron-right",
                  class: "size-4"
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="page-jump" data-v-929925cc><span class="jump-label" data-v-929925cc>Перейти на:</span>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(jumpPage),
          "onUpdate:modelValue": ($event) => isRef(jumpPage) ? jumpPage.value = $event : null,
          modelModifiers: { number: true },
          type: "number",
          min: 1,
          max: unref(totalPages),
          class: "jump-input",
          onKeyup: ($event) => goToPage(unref(jumpPage))
        }, null, _parent));
        _push(ssrRenderComponent(_component_UButton, {
          onClick: ($event) => goToPage(unref(jumpPage)),
          variant: "outline",
          class: "jump-button"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Перейти `);
            } else {
              return [
                createTextVNode(" Перейти ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/offers/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-929925cc"]]);

export { index as default };
//# sourceMappingURL=index-Cg1JxVZG.mjs.map
