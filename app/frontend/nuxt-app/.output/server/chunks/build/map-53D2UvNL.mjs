import { _ as __nuxt_component_0, a as __nuxt_component_1 } from './AddressAutocomplete-BUzK95vI.mjs';
import { _ as _sfc_main$2 } from './Badge-DNgMi0Nd.mjs';
import { _ as _sfc_main$3 } from './Button-BL6TDcLa.mjs';
import { _ as _sfc_main$4 } from './Icon-DX0OfCis.mjs';
import { _ as _sfc_main$5 } from './Separator-DiSB2IpQ.mjs';
import { defineComponent, ref, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, shallowRef, useCssModule, createBlock, createCommentVNode, openBlock, withModifiers, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
import { u as useMapState, _ as _sfc_main$G, a as _sfc_main$D, b as _sfc_main$E, c as _sfc_main$v, d as _sfc_main$r, e as _sfc_main$j } from './useMapState-Dc87w07T.mjs';
import { u as useAsyncData } from './asyncData-DVeqSZBv.mjs';
import { _ as _export_sfc, a as useNuxtApp } from './server.mjs';
import './Checkbox-DYXK6_Q4.mjs';
import 'reka-ui';
import '@vueuse/core';
import './useFormField-C7CorFZK.mjs';
import './tv-sfLME4AL.mjs';
import 'tailwind-variants';
import './Input-2RIsD9n3.mjs';
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
import './index-gA-qUlDT.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import 'vue-router';
import 'jwt-decode';
import 'tailwindcss/colors';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "yaMap",
  __ssrInlineRender: true,
  props: {
    parentOffers: {}
  },
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const mapState = useMapState();
    const map2 = shallowRef(null);
    const clusterer = shallowRef(null);
    const visible = ref(true);
    ref(0);
    ref([[0, 0], [0, 0]]);
    const { data: favoritesData, refresh: refreshFavorites } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "favorites",
      () => $api("offers/favorites/")
    )), __temp = await __temp, __restore(), __temp);
    const { $api } = useNuxtApp();
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
    const clusterPopup = ref(null);
    function areCoordsEqual(a, b) {
      return Number(a[0].toFixed(6)) === Number(b[0].toFixed(6)) && Number(a[1].toFixed(6)) === Number(b[1].toFixed(6));
    }
    const getPricePopup = (feature) => {
      return `<div class=" min-w-max rounded-sm mb-12.5 border border-gray-300 bg-white px-1 py-0.5 text-sm font-semibold text-[var(--color-info)]">
    ${formatPrice(feature.properties.price)}
  </div>`;
    };
    const getInfoPopup = (feature) => {
      const filledIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KCTxwYXRoIGZpbGw9IiNlNzAwMGIiIGQ9Im0xMiAxOS42NTRsLS43NTgtLjY4NXEtMi40NDgtMi4yMzYtNC4wNS0zLjgyOHEtMS42MDEtMS41OTMtMi41MjgtMi44MXQtMS4yOTYtMi4yVDMgOC4xNXEwLTEuOTA4IDEuMjk2LTMuMjA0VDcuNSAzLjY1cTEuMzIgMCAyLjQ3NS42NzVUMTIgNi4yODlRMTIuODcgNSAxNC4wMjUgNC4zMjVUMTYuNSAzLjY1cTEuOTA4IDAgMy4yMDQgMS4yOTZUMjEgOC4xNXEwIC45OTYtLjM2OCAxLjk4cS0uMzY5Ljk4Ni0xLjI5NiAyLjIwMnQtMi41MTkgMi44MDlxLTEuNTkyIDEuNTkyLTQuMDYgMy44Mjh6IiAvPgo8L3N2Zz4=";
      const outlineIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KCTxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0ibTEyIDE5LjY1NGwtLjc1OC0uNjg1cS0yLjQ0OC0yLjIzNi00LjA1LTMuODI4cS0xLjYwMS0xLjU5My0yLjUyOC0yLjgxdC0xLjI5Ni0yLjJUMyA4LjE1cTAtMS45MDggMS4yOTYtMy4yMDRUNy41IDMuNjVxMS4zMiAwIDIuNDc1LjY3NVQxMiA2LjI4OVExMi44NyA1IDE0LjAyNSA0LjMyNVQxNi41IDMuNjVxMS45MDggMCAzLjIwNCAxLjI5NlQyMSA4LjE1cTAgLjk5Ni0uMzY4IDEuOThxLS4zNjkuOTg2LTEuMjk2IDIuMjAydC0yLjUxOSAyLjgwOXEtMS41OTIgMS41OTItNC4wNiAzLjgyOHptMC0xLjM1NHEyLjQtMi4xNyAzLjk1LTMuNzE2dDIuNDUtMi42ODV0MS4yNS0yLjAxNVEyMCA5LjAwNiAyMCA4LjE1cTAtMS41LTEtMi41dC0yLjUtMXEtMS4xOTQgMC0yLjIwNC42ODJUMTIuNDkgNy4zODVoLS45NzhxLS44MTctMS4zOS0xLjgxNy0yLjA2M3EtMS0uNjcyLTIuMTk0LS42NzJxLTEuNDggMC0yLjQ5IDFUNCA4LjE1cTAgLjg1Ni4zNSAxLjczNHQxLjI1IDIuMDE1dDIuNDUgMi42NzVUMTIgMTguM20wLTYuODI1IiAvPgo8L3N2Zz4=";
      return `<div class="marker-popup">
        

        <div class="offer-card">
        <div class="flex items-start justify-between gap-3">
            <p class="font-bold text-base">${feature.properties?.title}</p>
            <button class="cluster-close-btn">×</button>
        </div>
            <div class="relative">
                <button class="favorite-heart" data-offer-id="${feature.id}">
                    <img class="favorite-icon" src="${isFavorite(Number(feature.id)) ? filledIcon : outlineIcon}" alt="icon" />
                </button>
                <img src="${feature.properties?.image_url}" alt="" class="w-full h-37.5 object-cover rounded-md bg-gray-100" />
            </div>

            <div class="flex gap-2 font-semibold text-[var(--color-info)]">
                ${formatPrice(feature.properties?.price)} 
                <span style="background-color: ${getPriceCategoryColor(feature.properties?.price_category)}" class="font-medium inline-flex items-center text-xs px-2 py-1 gap-1 rounded-md text-inverted">${getPriceCategoryLabel(feature.properties?.price_category)}</span>
            </div>

            <div class="text-sm text-muted">${feature.properties?.address}</div>

            <a href="/offers/${feature.id}" class="rounded-md mt-1.5 font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2.5 py-1.5 text-sm gap-1.5 text-inverted bg-info hover:bg-info/75 active:bg-info/75 disabled:bg-info aria-disabled:bg-info focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info w-max">
                К объекту <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWFycm93LXJpZ2h0LWljb24gbHVjaWRlLWFycm93LXJpZ2h0Ij48cGF0aCBkPSJNNSAxMmgxNCIvPjxwYXRoIGQ9Im0xMiA1IDcgNy03IDciLz48L3N2Zz4="/>
            </a>
        </div>
    </div>`;
    };
    function openClusterPopup(clusterCoords) {
      const rounded = [
        Number(clusterCoords[0].toFixed(6)),
        Number(clusterCoords[1].toFixed(6))
      ];
      const matchingOffers = props.parentOffers?.filter((offer) => {
        const c = offer.address?.coordinates_list;
        if (!c) return false;
        return Number(c[0].toFixed(6)) === rounded[0] && Number(c[1].toFixed(6)) === rounded[1];
      });
      if (matchingOffers.length === 0) {
        clusterPopup.value = null;
        return;
      }
      if (prevFeature.value && prevFeature.value.properties?.isSelected == true) {
        console.log(`Меняем IsSelected у предыдущего маркера с id ${prevFeature.value?.id} с true на false`);
        prevFeature.value.properties.isSelected = !prevFeature.value.properties?.isSelected;
        const prevMarker = allMarkers.get(prevFeature.value.id);
        prevMarker.element.innerHTML = getPricePopup(prevFeature.value);
      }
      clusterPopup.value = {
        coordinates: rounded,
        offers: matchingOffers
      };
    }
    const getPointList = computed(() => {
      if (!map2.value) return [];
      const result = [];
      for (let i = 0; i < props.parentOffers.length; i++) {
        result.push({
          type: "Feature",
          id: `${props.parentOffers[i]?.id}`,
          geometry: {
            type: "Point",
            coordinates: props.parentOffers[i]?.address?.coordinates_list
          },
          properties: {
            title: props.parentOffers[i]?.title,
            price: props.parentOffers[i]?.price,
            price_category: props.parentOffers[i]?.price_category,
            image_url: props.parentOffers[i]?.image_url,
            address: props.parentOffers[i]?.address?.full_address,
            isSelected: mapState?.value?.offerId === props.parentOffers[i]?.id
          }
        });
      }
      return result;
    });
    const getPriceCategoryColor = (category) => {
      switch (category) {
        case "expensive":
          return "var(--color-error)";
        case "normal":
          return "var(--color-info)";
        case "cheap":
          return "var(--color-success)";
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
    const allMarkers = /* @__PURE__ */ new Map();
    const selectedMarkerId = ref(null);
    const prevFeature = ref(null);
    function openMarkerPopup(feature) {
      console.log(`Кликнули на маркер с id ${feature.id}`);
      console.log(`Предыдущий маркер с id ${prevFeature.value?.id}`);
      const marker2 = allMarkers.get(feature.id);
      feature.properties.isSelected = !feature.properties?.isSelected;
      if (feature.properties.isSelected == true) {
        marker2.element.innerHTML = getInfoPopup(feature);
      } else {
        console.log(`Маркер с id ${feature.id} меняется на IsSelected`);
        marker2.element.innerHTML = getPricePopup(feature);
      }
      if (prevFeature.value && prevFeature.value.id != feature.id) {
        console.log(`Сейчас будем менять предыдущий маркер с id ${prevFeature.value?.id}`);
        console.log(`У предыдущего маркера IsSelected это ${prevFeature.value?.properties?.isSelected}`);
        if (prevFeature.value.properties?.isSelected == true) {
          console.log(`Меняем IsSelected у предыдущего маркера с id ${prevFeature.value?.id} с true на false`);
          prevFeature.value.properties.isSelected = !prevFeature.value.properties?.isSelected;
          const prevMarker = allMarkers.get(prevFeature.value.id);
          prevMarker.element.innerHTML = getPricePopup(prevFeature.value);
        }
      }
      prevFeature.value = feature;
      return;
    }
    const allFeatures = /* @__PURE__ */ new Map();
    const cssModule = useCssModule();
    const createMarker = (feature) => {
      console.log("Сработало событие createMarker");
      const featureCircle = (void 0).createElement("div");
      featureCircle.classList.add(cssModule["marker"]);
      featureCircle.style.backgroundColor = getPriceCategoryColor(feature.properties?.price_category);
      allFeatures.set(feature.id, feature);
      if (feature.properties.isSelected == true) {
        featureCircle.innerHTML = getInfoPopup(feature);
      } else {
        featureCircle.innerHTML = getPricePopup(feature);
      }
      featureCircle.addEventListener("click", async (e) => {
        const favoriteBtn = e.target.closest(".favorite-heart");
        if (favoriteBtn) {
          e.stopPropagation();
          const offerId = Number(favoriteBtn.getAttribute("data-offer-id"));
          const offer = props.parentOffers?.find((o) => o.id === offerId);
          if (offer) {
            await toggleFavorite(offer);
            const icon = favoriteBtn.querySelector(".favorite-icon");
            if (icon) {
              const filledIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KCTxwYXRoIGZpbGw9IiNlNzAwMGIiIGQ9Im0xMiAxOS42NTRsLS43NTgtLjY4NXEtMi40NDgtMi4yMzYtNC4wNS0zLjgyOHEtMS42MDEtMS41OTMtMi41MjgtMi44MXQtMS4yOTYtMi4yVDMgOC4xNXEwLTEuOTA4IDEuMjk2LTMuMjA0VDcuNSAzLjY1cTEuMzIgMCAyLjQ3NS42NzVUMTIgNi4yODlRMTIuODcgNSAxNC4wMjUgNC4zMjVUMTYuNSAzLjY1cTEuOTA4IDAgMy4yMDQgMS4yOTZUMjEgOC4xNXEwIC45OTYtLjM2OCAxLjk4cS0uMzY5Ljk4Ni0xLjI5NiAyLjIwMnQtMi41MTkgMi44MDlxLTEuNTkyIDEuNTkyLTQuMDYgMy44Mjh6IiAvPgo8L3N2Zz4=";
              const outlineIcon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KCTxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0ibTEyIDE5LjY1NGwtLjc1OC0uNjg1cS0yLjQ0OC0yLjIzNi00LjA1LTMuODI4cS0xLjYwMS0xLjU5My0yLjUyOC0yLjgxdC0xLjI5Ni0yLjJUMyA4LjE1cTAtMS45MDggMS4yOTYtMy4yMDRUNy41IDMuNjVxMS4zMiAwIDIuNDc1LjY3NVQxMiA2LjI4OVExMi44NyA1IDE0LjAyNSA0LjMyNVQxNi41IDMuNjVxMS45MDggMCAzLjIwNCAxLjI5NlQyMSA4LjE1cTAgLjk5Ni0uMzY4IDEuOThxLS4zNjkuOTg2LTEuMjk2IDIuMjAydC0yLjUxOSAyLjgwOXEtMS41OTIgMS41OTItNC4wNiAzLjgyOHptMC0xLjM1NHEyLjQtMi4xNyAzLjk1LTMuNzE2dDIuNDUtMi42ODV0MS4yNS0yLjAxNVEyMCA5LjAwNiAyMCA4LjE1cTAtMS41LTEtMi41dC0yLjUtMXEtMS4xOTQgMC0yLjIwNC42ODJUMTIuNDkgNy4zODVoLS45NzhxLS44MTctMS4zOS0xLjgxNy0yLjA2M3EtMS0uNjcyLTIuMTk0LS42NzJxLTEuNDggMC0yLjQ5IDFUNCA4LjE1cTAgLjg1Ni4zNSAxLjczNHQxLjI1IDIuMDE1dDIuNDUgMi42NzVUMTIgMTguM20wLTYuODI1IiAvPgo8L3N2Zz4=";
              icon.src = isFavorite(offerId) ? filledIcon : outlineIcon;
            }
          }
        }
      });
      const yMapMarker = new ymaps3.YMapMarker(
        {
          hideOutsideViewport: true,
          id: feature.id,
          coordinates: feature.geometry.coordinates,
          onClick: () => {
            console.log("Кликнули на маркер", map2.value?.bounds);
            selectedMarkerId.value = feature.id;
            clusterPopup.value = null;
            openMarkerPopup(feature);
          }
        },
        featureCircle
      );
      allMarkers.set(feature.id, yMapMarker);
      return yMapMarker;
    };
    const formatPrice = (price) => price ? new Intl.NumberFormat("ru-RU").format(price) + " ₽" : "Цена не указана";
    const camera = ref({
      duration: 2500
    });
    const LOCATION = ref({
      center: [37.623082, 55.75254],
      zoom: 10
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UIcon = _sfc_main$4;
      const _component_UBadge = _sfc_main$2;
      const _component_UButton = _sfc_main$3;
      const _component_USeparator = _sfc_main$5;
      if (visible.value) {
        _push(ssrRenderComponent(unref(_sfc_main$G), mergeProps({
          modelValue: map2.value,
          "onUpdate:modelValue": ($event) => map2.value = $event,
          "cursor-grab": "",
          height: "100%",
          settings: {
            location: {
              ...LOCATION.value,
              duration: 2500
            },
            camera: camera.value,
            showScaleInCopyrights: true
          },
          width: "100%"
        }, _attrs), {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(unref(_sfc_main$D), null, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(_sfc_main$E), null, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(_sfc_main$v), { settings: { position: "right" } }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(unref(_sfc_main$r), null, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(unref(_sfc_main$r))
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(unref(_sfc_main$j), {
                modelValue: clusterer.value,
                "onUpdate:modelValue": ($event) => clusterer.value = $event,
                "grid-size": 64,
                settings: {
                  features: getPointList.value,
                  marker: createMarker
                },
                "zoom-on-cluster-click": ""
              }, {
                cluster: withCtx(({ length, coordinates }, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<div class="cluster" data-v-e155b38a${_scopeId2}>${ssrInterpolate(length)}</div>`);
                    if (clusterPopup.value && areCoordsEqual(clusterPopup.value.coordinates, coordinates)) {
                      _push3(`<div class="cluster-popup" data-v-e155b38a${_scopeId2}><div class="flex items-center justify-between mb-2" data-v-e155b38a${_scopeId2}><p class="text-sm" data-v-e155b38a${_scopeId2}>Объявлений в доме: ${ssrInterpolate(length)}</p><button class="cluster-close-btn" data-v-e155b38a${_scopeId2}>×</button></div><div class="offers-list" data-v-e155b38a${_scopeId2}><!--[-->`);
                      ssrRenderList(clusterPopup.value.offers, (offer, index) => {
                        _push3(`<div class="offer-card" data-v-e155b38a${_scopeId2}><div class="font-bold text-base" data-v-e155b38a${_scopeId2}>${ssrInterpolate(offer.title)}</div><div class="relative" data-v-e155b38a${_scopeId2}><img class="offer-img"${ssrRenderAttr("src", offer.image_url)} alt="" data-v-e155b38a${_scopeId2}><button class="${ssrRenderClass([{ active: isFavorite(offer.id) }, "favorite-heart"])}" data-v-e155b38a${_scopeId2}>`);
                        _push3(ssrRenderComponent(_component_UIcon, {
                          size: "20",
                          name: isFavorite(offer.id) ? "material-symbols-light:favorite" : "material-symbols-light:favorite-outline"
                        }, null, _parent3, _scopeId2));
                        _push3(`</button></div><div class="gap-2 font-semibold text-[var(--color-info)] flex items-center" data-v-e155b38a${_scopeId2}>${ssrInterpolate(formatPrice(offer.price))} `);
                        if (offer.price_category == "expensive") {
                          _push3(ssrRenderComponent(_component_UBadge, { color: "error" }, {
                            default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                              if (_push4) {
                                _push4(`${ssrInterpolate(getPriceCategoryLabel(offer.price_category))}`);
                              } else {
                                return [
                                  createTextVNode(toDisplayString(getPriceCategoryLabel(offer.price_category)), 1)
                                ];
                              }
                            }),
                            _: 2
                          }, _parent3, _scopeId2));
                        } else if (offer.price_category == "normal") {
                          _push3(ssrRenderComponent(_component_UBadge, { color: "info" }, {
                            default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                              if (_push4) {
                                _push4(`${ssrInterpolate(getPriceCategoryLabel(offer.price_category))}`);
                              } else {
                                return [
                                  createTextVNode(toDisplayString(getPriceCategoryLabel(offer.price_category)), 1)
                                ];
                              }
                            }),
                            _: 2
                          }, _parent3, _scopeId2));
                        } else {
                          _push3(ssrRenderComponent(_component_UBadge, { color: "success" }, {
                            default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                              if (_push4) {
                                _push4(`${ssrInterpolate(getPriceCategoryLabel(offer.price_category))}`);
                              } else {
                                return [
                                  createTextVNode(toDisplayString(getPriceCategoryLabel(offer.price_category)), 1)
                                ];
                              }
                            }),
                            _: 2
                          }, _parent3, _scopeId2));
                        }
                        _push3(`</div><div class="text-muted text-sm" data-v-e155b38a${_scopeId2}>${ssrInterpolate(offer.address?.full_address)}</div>`);
                        _push3(ssrRenderComponent(_component_UButton, {
                          class: "w-max mt-1.5",
                          size: "md",
                          color: "info",
                          "trailing-icon": "i-lucide-arrow-right",
                          to: `/offers/${offer.id}`
                        }, {
                          default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                            if (_push4) {
                              _push4(` К объекту `);
                            } else {
                              return [
                                createTextVNode(" К объекту ")
                              ];
                            }
                          }),
                          _: 2
                        }, _parent3, _scopeId2));
                        if (index < clusterPopup.value.offers.length - 1) {
                          _push3(ssrRenderComponent(_component_USeparator, {
                            class: "my-3",
                            orientation: "horizontal"
                          }, null, _parent3, _scopeId2));
                        } else {
                          _push3(`<!---->`);
                        }
                        _push3(`</div>`);
                      });
                      _push3(`<!--]--></div></div>`);
                    } else {
                      _push3(`<!---->`);
                    }
                  } else {
                    return [
                      createVNode("div", {
                        class: "cluster",
                        onClick: ($event) => openClusterPopup(coordinates)
                      }, toDisplayString(length), 9, ["onClick"]),
                      clusterPopup.value && areCoordsEqual(clusterPopup.value.coordinates, coordinates) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "cluster-popup"
                      }, [
                        createVNode("div", { class: "flex items-center justify-between mb-2" }, [
                          createVNode("p", { class: "text-sm" }, "Объявлений в доме: " + toDisplayString(length), 1),
                          createVNode("button", {
                            class: "cluster-close-btn",
                            onClick: withModifiers(($event) => clusterPopup.value = null, ["stop"])
                          }, "×", 8, ["onClick"])
                        ]),
                        createVNode("div", { class: "offers-list" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(clusterPopup.value.offers, (offer, index) => {
                            return openBlock(), createBlock("div", {
                              class: "offer-card",
                              key: offer.id
                            }, [
                              createVNode("div", { class: "font-bold text-base" }, toDisplayString(offer.title), 1),
                              createVNode("div", { class: "relative" }, [
                                createVNode("img", {
                                  class: "offer-img",
                                  src: offer.image_url,
                                  alt: ""
                                }, null, 8, ["src"]),
                                createVNode("button", {
                                  class: ["favorite-heart", { active: isFavorite(offer.id) }],
                                  onClick: withModifiers(($event) => toggleFavorite(offer), ["stop"])
                                }, [
                                  createVNode(_component_UIcon, {
                                    size: "20",
                                    name: isFavorite(offer.id) ? "material-symbols-light:favorite" : "material-symbols-light:favorite-outline"
                                  }, null, 8, ["name"])
                                ], 10, ["onClick"])
                              ]),
                              createVNode("div", { class: "gap-2 font-semibold text-[var(--color-info)] flex items-center" }, [
                                createTextVNode(toDisplayString(formatPrice(offer.price)) + " ", 1),
                                offer.price_category == "expensive" ? (openBlock(), createBlock(_component_UBadge, {
                                  key: 0,
                                  color: "error"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(getPriceCategoryLabel(offer.price_category)), 1)
                                  ]),
                                  _: 2
                                }, 1024)) : offer.price_category == "normal" ? (openBlock(), createBlock(_component_UBadge, {
                                  key: 1,
                                  color: "info"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(getPriceCategoryLabel(offer.price_category)), 1)
                                  ]),
                                  _: 2
                                }, 1024)) : (openBlock(), createBlock(_component_UBadge, {
                                  key: 2,
                                  color: "success"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(getPriceCategoryLabel(offer.price_category)), 1)
                                  ]),
                                  _: 2
                                }, 1024))
                              ]),
                              createVNode("div", { class: "text-muted text-sm" }, toDisplayString(offer.address?.full_address), 1),
                              createVNode(_component_UButton, {
                                class: "w-max mt-1.5",
                                size: "md",
                                color: "info",
                                "trailing-icon": "i-lucide-arrow-right",
                                to: `/offers/${offer.id}`
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" К объекту ")
                                ]),
                                _: 1
                              }, 8, ["to"]),
                              index < clusterPopup.value.offers.length - 1 ? (openBlock(), createBlock(_component_USeparator, {
                                key: 0,
                                class: "my-3",
                                orientation: "horizontal"
                              })) : createCommentVNode("", true)
                            ]);
                          }), 128))
                        ])
                      ])) : createCommentVNode("", true)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(unref(_sfc_main$D)),
                createVNode(unref(_sfc_main$E)),
                createVNode(unref(_sfc_main$v), { settings: { position: "right" } }, {
                  default: withCtx(() => [
                    createVNode(unref(_sfc_main$r))
                  ]),
                  _: 1
                }),
                createVNode(unref(_sfc_main$j), {
                  modelValue: clusterer.value,
                  "onUpdate:modelValue": ($event) => clusterer.value = $event,
                  "grid-size": 64,
                  settings: {
                    features: getPointList.value,
                    marker: createMarker
                  },
                  "zoom-on-cluster-click": ""
                }, {
                  cluster: withCtx(({ length, coordinates }) => [
                    createVNode("div", {
                      class: "cluster",
                      onClick: ($event) => openClusterPopup(coordinates)
                    }, toDisplayString(length), 9, ["onClick"]),
                    clusterPopup.value && areCoordsEqual(clusterPopup.value.coordinates, coordinates) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "cluster-popup"
                    }, [
                      createVNode("div", { class: "flex items-center justify-between mb-2" }, [
                        createVNode("p", { class: "text-sm" }, "Объявлений в доме: " + toDisplayString(length), 1),
                        createVNode("button", {
                          class: "cluster-close-btn",
                          onClick: withModifiers(($event) => clusterPopup.value = null, ["stop"])
                        }, "×", 8, ["onClick"])
                      ]),
                      createVNode("div", { class: "offers-list" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(clusterPopup.value.offers, (offer, index) => {
                          return openBlock(), createBlock("div", {
                            class: "offer-card",
                            key: offer.id
                          }, [
                            createVNode("div", { class: "font-bold text-base" }, toDisplayString(offer.title), 1),
                            createVNode("div", { class: "relative" }, [
                              createVNode("img", {
                                class: "offer-img",
                                src: offer.image_url,
                                alt: ""
                              }, null, 8, ["src"]),
                              createVNode("button", {
                                class: ["favorite-heart", { active: isFavorite(offer.id) }],
                                onClick: withModifiers(($event) => toggleFavorite(offer), ["stop"])
                              }, [
                                createVNode(_component_UIcon, {
                                  size: "20",
                                  name: isFavorite(offer.id) ? "material-symbols-light:favorite" : "material-symbols-light:favorite-outline"
                                }, null, 8, ["name"])
                              ], 10, ["onClick"])
                            ]),
                            createVNode("div", { class: "gap-2 font-semibold text-[var(--color-info)] flex items-center" }, [
                              createTextVNode(toDisplayString(formatPrice(offer.price)) + " ", 1),
                              offer.price_category == "expensive" ? (openBlock(), createBlock(_component_UBadge, {
                                key: 0,
                                color: "error"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(getPriceCategoryLabel(offer.price_category)), 1)
                                ]),
                                _: 2
                              }, 1024)) : offer.price_category == "normal" ? (openBlock(), createBlock(_component_UBadge, {
                                key: 1,
                                color: "info"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(getPriceCategoryLabel(offer.price_category)), 1)
                                ]),
                                _: 2
                              }, 1024)) : (openBlock(), createBlock(_component_UBadge, {
                                key: 2,
                                color: "success"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(getPriceCategoryLabel(offer.price_category)), 1)
                                ]),
                                _: 2
                              }, 1024))
                            ]),
                            createVNode("div", { class: "text-muted text-sm" }, toDisplayString(offer.address?.full_address), 1),
                            createVNode(_component_UButton, {
                              class: "w-max mt-1.5",
                              size: "md",
                              color: "info",
                              "trailing-icon": "i-lucide-arrow-right",
                              to: `/offers/${offer.id}`
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" К объекту ")
                              ]),
                              _: 1
                            }, 8, ["to"]),
                            index < clusterPopup.value.offers.length - 1 ? (openBlock(), createBlock(_component_USeparator, {
                              key: 0,
                              class: "my-3",
                              orientation: "horizontal"
                            })) : createCommentVNode("", true)
                          ]);
                        }), 128))
                      ])
                    ])) : createCommentVNode("", true)
                  ]),
                  _: 1
                }, 8, ["modelValue", "onUpdate:modelValue", "settings"])
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const marker = "_marker_1omwb_3";
const style2 = {
  marker,
  "marker-popup": "_marker-popup_1omwb_33"
};
const cssModules = {
  "$style": style2
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/yaMap.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_5 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__cssModules", cssModules], ["__scopeId", "data-v-e155b38a"]]), { __name: "YaMap" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "map",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { $api } = useNuxtApp();
    const currentFilters = ref({});
    const addressForSearch = computed(() => currentFilters.value.address_query);
    const prepareRequestQuery = () => {
      const query = {
        limit: 1e6
      };
      console.log("Грузим офферы с фильтрами:", currentFilters.value);
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
      return query;
    };
    const { data: favoritesData, refresh: refreshFavorites } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("favorites", () => $api("offers/favorites/"))), __temp = await __temp, __restore(), __temp);
    computed(() => {
      return new Set(favoritesData.value?.map((item) => item.id) || []);
    });
    const {
      data: offersData,
      pending: offersPending,
      error: offersError,
      refresh: refreshOffers
    } = useAsyncData(
      "offersForMap",
      () => $api("/offers/offers_for_map", {
        params: prepareRequestQuery()
      })
    );
    const offers = computed(() => offersData.value || []);
    const handleFiltersApply = async (filtersData) => {
      console.log("Получены фильтры через событие:", filtersData);
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
      const filtersToKeep = {};
      if (currentFilters.value.address_query) {
        filtersToKeep.address_query = currentFilters.value.address_query;
      }
      currentFilters.value = { ...filtersToKeep };
      refreshOffers();
    };
    const handleAddressSearch = (query) => {
      if (!query.trim()) {
        clearAddressSearch();
        return;
      }
      currentFilters.value = {
        ...currentFilters.value,
        address_query: query
      };
      refreshOffers();
    };
    const clearAddressSearch = () => {
      const { address_query, ...filtersWithoutAddress } = currentFilters.value;
      currentFilters.value = filtersWithoutAddress;
      refreshOffers();
    };
    ref(false);
    useMapState();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_FiltersSidebar = __nuxt_component_0;
      const _component_AddressAutocomplete = __nuxt_component_1;
      const _component_UBadge = _sfc_main$2;
      const _component_UButton = _sfc_main$3;
      const _component_UIcon = _sfc_main$4;
      const _component_YaMap = __nuxt_component_5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "page-layout" }, _attrs))} data-v-aad4b237><div class="sidebar-container" data-v-aad4b237>`);
      _push(ssrRenderComponent(_component_FiltersSidebar, {
        onFiltersApply: handleFiltersApply,
        onFiltersReset: handleFiltersReset
      }, null, _parent));
      _push(`</div><main class="map-content" data-v-aad4b237><div class="mb-3" data-v-aad4b237>`);
      _push(ssrRenderComponent(_component_AddressAutocomplete, {
        onAddressSelected: handleAddressSearch,
        onSearchTriggered: handleAddressSearch
      }, null, _parent));
      _push(`</div>`);
      if (unref(addressForSearch)) {
        _push(ssrRenderComponent(_component_UBadge, {
          size: "lg",
          class: "mb-3 max-w-fit py-0",
          color: "info"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(addressForSearch))} `);
              _push2(ssrRenderComponent(_component_UButton, {
                "trailing-icon": "heroicons:x-mark-16-solid",
                class: "px-0 pt-2",
                color: "info",
                onClick: clearAddressSearch,
                size: "md"
              }, null, _parent2, _scopeId));
            } else {
              return [
                createTextVNode(toDisplayString(unref(addressForSearch)) + " ", 1),
                createVNode(_component_UButton, {
                  "trailing-icon": "heroicons:x-mark-16-solid",
                  class: "px-0 pt-2",
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
        _push(`<div class="error-message" data-v-aad4b237>${ssrInterpolate(unref(offersError))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="results-info mb-3" data-v-aad4b237>`);
      if (unref(offersPending)) {
        _push(`<div class="flex items-end" data-v-aad4b237><span data-v-aad4b237>Объектов на карте:</span>`);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "codex:loader",
          size: "20px"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div data-v-aad4b237> Объектов на карте: <span class="font-semibold text-primary" data-v-aad4b237>${ssrInterpolate(unref(offers).length.toLocaleString("ru-RU"))}</span></div>`);
      }
      _push(`</div><div class="map-container" data-v-aad4b237>`);
      if (unref(offersPending)) {
        _push(ssrRenderComponent(_component_UIcon, {
          name: "line-md:loading-loop",
          size: "100px",
          class: "loading-icon"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_YaMap, { "parent-offers": unref(offers) }, null, _parent));
      _push(`</div></main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/map.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const map = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-aad4b237"]]);

export { map as default };
//# sourceMappingURL=map-53D2UvNL.mjs.map
