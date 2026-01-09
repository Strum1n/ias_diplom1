import { _ as __nuxt_component_0, a as __nuxt_component_1 } from './AddressAutocomplete-BIuZl98m.mjs';
import { _ as _sfc_main$3 } from './Badge-Bw-ZtEh9.mjs';
import { _ as _sfc_main$4 } from './Button-C2DhPQmq.mjs';
import { _ as _sfc_main$5 } from './Icon-CX2WwP6o.mjs';
import { defineComponent, ref, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, shallowRef, useCssModule, createBlock, createCommentVNode, openBlock, withModifiers, Fragment, renderList, useSlots, renderSlot, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrRenderSlot } from 'vue/server-renderer';
import { useForwardProps, Separator } from 'reka-ui';
import { reactivePick } from '@vueuse/core';
import { t as tv } from './tv-DuV4YVUe.mjs';
import { _ as _sfc_main$6 } from './Avatar-BbsafSqM.mjs';
import { _ as _export_sfc, b as useNuxtApp, a as useAppConfig } from './server.mjs';
import { u as useMapState, _ as _sfc_main$G, a as _sfc_main$D, b as _sfc_main$E, c as _sfc_main$v, d as _sfc_main$r, e as _sfc_main$j } from './useMapState-Er0loVNa.mjs';
import { u as useAsyncData } from './asyncData-BG26t6Y0.mjs';
import './Checkbox-DJA1q-MP.mjs';
import './useFormField-C7CorFZK.mjs';
import './Input-DcZqOw2i.mjs';
import './index-CED3XvSe.mjs';
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
import './Link-C0gX2JZv.mjs';
import './nuxt-link-D5XjKnnj.mjs';
import './index-DNDp3pOy.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import 'tailwind-variants';
import './virtual_nuxt_G__My_Programs_IAS-diplom_app_frontend_nuxt-app_node_modules_.cache_nuxt_.nuxt_ui-image-component-CX5_T5UE.mjs';
import 'vue-router';
import 'jwt-decode';
import 'tailwindcss/colors';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const theme = {
  "slots": {
    "root": "flex items-center align-center text-center",
    "border": "",
    "container": "font-medium text-default flex",
    "icon": "shrink-0 size-5",
    "avatar": "shrink-0",
    "avatarSize": "2xs",
    "label": "text-sm"
  },
  "variants": {
    "color": {
      "primary": {
        "border": "border-primary"
      },
      "secondary": {
        "border": "border-secondary"
      },
      "success": {
        "border": "border-success"
      },
      "info": {
        "border": "border-info"
      },
      "warning": {
        "border": "border-warning"
      },
      "error": {
        "border": "border-error"
      },
      "neutral": {
        "border": "border-default"
      }
    },
    "orientation": {
      "horizontal": {
        "root": "w-full flex-row",
        "border": "w-full",
        "container": "mx-3 whitespace-nowrap"
      },
      "vertical": {
        "root": "h-full flex-col",
        "border": "h-full",
        "container": "my-2"
      }
    },
    "size": {
      "xs": "",
      "sm": "",
      "md": "",
      "lg": "",
      "xl": ""
    },
    "type": {
      "solid": {
        "border": "border-solid"
      },
      "dashed": {
        "border": "border-dashed"
      },
      "dotted": {
        "border": "border-dotted"
      }
    }
  },
  "compoundVariants": [
    {
      "orientation": "horizontal",
      "size": "xs",
      "class": {
        "border": "border-t"
      }
    },
    {
      "orientation": "horizontal",
      "size": "sm",
      "class": {
        "border": "border-t-[2px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "md",
      "class": {
        "border": "border-t-[3px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "lg",
      "class": {
        "border": "border-t-[4px]"
      }
    },
    {
      "orientation": "horizontal",
      "size": "xl",
      "class": {
        "border": "border-t-[5px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "xs",
      "class": {
        "border": "border-s"
      }
    },
    {
      "orientation": "vertical",
      "size": "sm",
      "class": {
        "border": "border-s-[2px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "md",
      "class": {
        "border": "border-s-[3px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "lg",
      "class": {
        "border": "border-s-[4px]"
      }
    },
    {
      "orientation": "vertical",
      "size": "xl",
      "class": {
        "border": "border-s-[5px]"
      }
    }
  ],
  "defaultVariants": {
    "color": "neutral",
    "size": "xs",
    "type": "solid"
  }
};
const _sfc_main$2 = {
  __name: "USeparator",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    label: { type: String, required: false },
    icon: { type: null, required: false },
    avatar: { type: Object, required: false },
    color: { type: null, required: false },
    size: { type: null, required: false },
    type: { type: null, required: false },
    orientation: { type: null, required: false, default: "horizontal" },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    decorative: { type: Boolean, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const rootProps = useForwardProps(reactivePick(props, "as", "decorative", "orientation"));
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.separator || {} })({
      color: props.color,
      orientation: props.orientation,
      size: props.size,
      type: props.type
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Separator), mergeProps(unref(rootProps), {
        "data-slot": "root",
        class: ui.value.root({ class: [props.ui?.root, props.class] })
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div data-slot="border" class="${ssrRenderClass(ui.value.border({ class: props.ui?.border }))}"${_scopeId}></div>`);
            if (__props.label || __props.icon || __props.avatar || !!slots.default) {
              _push2(`<!--[--><div data-slot="container" class="${ssrRenderClass(ui.value.container({ class: props.ui?.container }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "default", { ui: ui.value }, () => {
                if (__props.label) {
                  _push2(`<span data-slot="label" class="${ssrRenderClass(ui.value.label({ class: props.ui?.label }))}"${_scopeId}>${ssrInterpolate(__props.label)}</span>`);
                } else if (__props.icon) {
                  _push2(ssrRenderComponent(_sfc_main$5, {
                    name: __props.icon,
                    "data-slot": "icon",
                    class: ui.value.icon({ class: props.ui?.icon })
                  }, null, _parent2, _scopeId));
                } else if (__props.avatar) {
                  _push2(ssrRenderComponent(_sfc_main$6, mergeProps({
                    size: props.ui?.avatarSize || ui.value.avatarSize()
                  }, __props.avatar, {
                    "data-slot": "avatar",
                    class: ui.value.avatar({ class: props.ui?.avatar })
                  }), null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              }, _push2, _parent2, _scopeId);
              _push2(`</div><div data-slot="border" class="${ssrRenderClass(ui.value.border({ class: props.ui?.border }))}"${_scopeId}></div><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", {
                "data-slot": "border",
                class: ui.value.border({ class: props.ui?.border })
              }, null, 2),
              __props.label || __props.icon || __props.avatar || !!slots.default ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                createVNode("div", {
                  "data-slot": "container",
                  class: ui.value.container({ class: props.ui?.container })
                }, [
                  renderSlot(_ctx.$slots, "default", { ui: ui.value }, () => [
                    __props.label ? (openBlock(), createBlock("span", {
                      key: 0,
                      "data-slot": "label",
                      class: ui.value.label({ class: props.ui?.label })
                    }, toDisplayString(__props.label), 3)) : __props.icon ? (openBlock(), createBlock(_sfc_main$5, {
                      key: 1,
                      name: __props.icon,
                      "data-slot": "icon",
                      class: ui.value.icon({ class: props.ui?.icon })
                    }, null, 8, ["name", "class"])) : __props.avatar ? (openBlock(), createBlock(_sfc_main$6, mergeProps({
                      key: 2,
                      size: props.ui?.avatarSize || ui.value.avatarSize()
                    }, __props.avatar, {
                      "data-slot": "avatar",
                      class: ui.value.avatar({ class: props.ui?.avatar })
                    }), null, 16, ["size", "class"])) : createCommentVNode("", true)
                  ])
                ], 2),
                createVNode("div", {
                  "data-slot": "border",
                  class: ui.value.border({ class: props.ui?.border })
                }, null, 2)
              ], 64)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/Separator.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "yaMap",
  __ssrInlineRender: true,
  props: {
    parentOffers: {}
  },
  setup(__props) {
    const props = __props;
    const mapState = useMapState();
    const map2 = shallowRef(null);
    const clusterer = shallowRef(null);
    const visible = ref(true);
    ref(0);
    ref([[0, 0], [0, 0]]);
    const clusterPopup = ref(null);
    function areCoordsEqual(a, b) {
      return Number(a[0].toFixed(6)) === Number(b[0].toFixed(6)) && Number(a[1].toFixed(6)) === Number(b[1].toFixed(6));
    }
    const getPricePopup = (feature) => {
      return `<div class="absolute -top-7.5 -left-8 w-max rounded-sm border border-gray-300 bg-white px-1 py-0.5 text-sm font-semibold text-[var(--color-info)]">
    ${formatPrice(feature.properties.price)}
  </div>`;
    };
    const getInfoPopup = (feature) => {
      return `<div class="marker-popup relative top-5 bg-white rounded-xl p-3  text-black min-w-75 shadow-lg  cursor-default">
    
    <button
        class="absolute left-67.5 border-none bg-gray-200 rounded-full cursor-pointer w-5.5 h-5.5 pb-1 text-gray-700 flex items-center justify-center hover:bg-gray-300"
    >×</button>
    
    <div class="flex flex-col gap-1.5 mr-3">
        <div class="font-bold text-base">
            ${feature.properties?.title}
        </div>

        <img
            src="${feature.properties?.image_url}"
            alt=""
            class="w-full h-37.5 object-cover rounded-md bg-gray-100"
        >

        <div class="flex gap-2 font-semibold text-[var(--color-info)]">
    ${formatPrice(feature.properties?.price)} <span style="background-color: ${getPriceCategoryColor(feature.properties?.price_category)}" class="font-medium inline-flex items-center text-xs px-2 py-1 gap-1 rounded-md text-inverted">${getPriceCategoryLabel(feature.properties?.price_category)}</span>
        </div>

        <div class="text-sm text-muted">
            ${feature.properties?.address}
        </div>
        
        <a  href="/offers/${feature.id}" class="rounded-md mt-1.5 font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2.5 py-1.5 text-sm gap-1.5 text-inverted bg-info hover:bg-info/75 active:bg-info/75 disabled:bg-info aria-disabled:bg-info focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info w-max"> К объекту <span class="iconify i-lucide:arrow-right shrink-0 size-5" aria-hidden="true"></span></a>
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
      featureCircle.style.backgroundColor = featureCircle.style.backgroundColor = getPriceCategoryColor(feature.properties?.price_category);
      allFeatures.set(feature.id, feature);
      if (feature.properties.isSelected == true) {
        featureCircle.innerHTML = getInfoPopup(feature);
      } else {
        featureCircle.innerHTML = getPricePopup(feature);
      }
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
      const _component_UBadge = _sfc_main$3;
      const _component_UButton = _sfc_main$4;
      const _component_USeparator = _sfc_main$2;
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
                    _push3(`<div class="cluster" data-v-d9406245${_scopeId2}>${ssrInterpolate(length)}</div>`);
                    if (clusterPopup.value && areCoordsEqual(clusterPopup.value.coordinates, coordinates)) {
                      _push3(`<div class="cluster-popup" data-v-d9406245${_scopeId2}><div class="flex items-center justify-between mb-2" data-v-d9406245${_scopeId2}><p class="text-sm" data-v-d9406245${_scopeId2}>Объявлений в доме: ${ssrInterpolate(length)}</p><button class="cluster-close-btn" data-v-d9406245${_scopeId2}>×</button></div><div class="offer-list" data-v-d9406245${_scopeId2}><!--[-->`);
                      ssrRenderList(clusterPopup.value.offers, (offer, index) => {
                        _push3(`<div class="offer-card" data-v-d9406245${_scopeId2}><div class="font-bold text-base" data-v-d9406245${_scopeId2}>${ssrInterpolate(offer.title)}</div><img class="offer-img"${ssrRenderAttr("src", offer.image_url)} alt="" data-v-d9406245${_scopeId2}><div class="gap-2 font-semibold text-[var(--color-info)] flex items-center" data-v-d9406245${_scopeId2}>${ssrInterpolate(formatPrice(offer.price))} `);
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
                        _push3(`</div><div class="text-muted text-sm" data-v-d9406245${_scopeId2}>${ssrInterpolate(offer.address?.full_address)}</div>`);
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
                        createVNode("div", { class: "offer-list" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(clusterPopup.value.offers, (offer, index) => {
                            return openBlock(), createBlock("div", {
                              class: "offer-card",
                              key: offer.id
                            }, [
                              createVNode("div", { class: "font-bold text-base" }, toDisplayString(offer.title), 1),
                              createVNode("img", {
                                class: "offer-img",
                                src: offer.image_url,
                                alt: ""
                              }, null, 8, ["src"]),
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
                      createVNode("div", { class: "offer-list" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(clusterPopup.value.offers, (offer, index) => {
                          return openBlock(), createBlock("div", {
                            class: "offer-card",
                            key: offer.id
                          }, [
                            createVNode("div", { class: "font-bold text-base" }, toDisplayString(offer.title), 1),
                            createVNode("img", {
                              class: "offer-img",
                              src: offer.image_url,
                              alt: ""
                            }, null, 8, ["src"]),
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
const marker = "_marker_1hryq_3";
const style2 = {
  marker
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
const __nuxt_component_5 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__cssModules", cssModules], ["__scopeId", "data-v-d9406245"]]), { __name: "YaMap" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "map",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { $api } = useNuxtApp();
    const error = ref(null);
    const loading = ref(false);
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
    const { data: offersData, pending: offersPending, error: offersError, refresh: refreshOffers } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "offersForMap",
      () => $api("/offers/offers_for_map", {
        params: prepareRequestQuery()
      })
    )), __temp = await __temp, __restore(), __temp);
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
      const _component_UBadge = _sfc_main$3;
      const _component_UButton = _sfc_main$4;
      const _component_UIcon = _sfc_main$5;
      const _component_YaMap = __nuxt_component_5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "page-layout" }, _attrs))} data-v-100c246e><div class="sidebar-container" data-v-100c246e>`);
      _push(ssrRenderComponent(_component_FiltersSidebar, {
        onFiltersApply: handleFiltersApply,
        onFiltersReset: handleFiltersReset
      }, null, _parent));
      _push(`</div><main class="map-content" data-v-100c246e><div class="mb-3" data-v-100c246e>`);
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
      if (unref(error)) {
        _push(`<div class="error-message" data-v-100c246e>${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="results-info" data-v-100c246e>`);
      if (unref(loading)) {
        _push(`<div data-v-100c246e><span class="flex items-center gap-2 mb-3" data-v-100c246e>Найдено объявлений: `);
        _push(ssrRenderComponent(_component_UIcon, {
          name: "codex:loader",
          size: "20px",
          class: "loading-icon"
        }, null, _parent));
        _push(`</span></div>`);
      } else {
        _push(`<div data-v-100c246e><span class="flex items-center mb-3" data-v-100c246e>Найдено объявлений: ${ssrInterpolate(unref(offers).length.toLocaleString("ru-RU"))}</span></div>`);
      }
      _push(`</div><div class="map-container" data-v-100c246e>`);
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
const map = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-100c246e"]]);

export { map as default };
//# sourceMappingURL=map-CG4JKu0F.mjs.map
