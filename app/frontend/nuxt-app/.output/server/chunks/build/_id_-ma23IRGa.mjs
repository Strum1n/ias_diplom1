import { _ as _sfc_main$4 } from './Container-B_7exVp7.mjs';
import { _ as _sfc_main$5 } from './Icon-DX0OfCis.mjs';
import { defineComponent, shallowRef, ref, useTemplateRef, withAsyncContext, computed, watch, resolveComponent, mergeProps, withCtx, unref, createVNode, createTextVNode, toDisplayString, createBlock, openBlock, Fragment, renderList, createCommentVNode, withModifiers, renderSlot, h, getCurrentInstance, toRaw, reactive, defineAsyncComponent, Text, Comment, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrRenderAttrs, ssrRenderSlot } from 'vue/server-renderer';
import useEmblaCarousel from 'embla-carousel-vue';
import { useForwardProps, Primitive } from 'reka-ui';
import { reactivePick } from '@vueuse/core';
import { u as useLocale } from './useLocale-CKG--c2g.mjs';
import { t as tv } from './tv-sfLME4AL.mjs';
import { _ as _sfc_main$8 } from './Button-BL6TDcLa.mjs';
import { _ as _export_sfc, e as useRoute, a as useNuxtApp, b as useAppConfig, n as navigateTo } from './server.mjs';
import { _ as _sfc_main$6 } from './Badge-DNgMi0Nd.mjs';
import { _ as _sfc_main$7 } from './Accordion-C9a19AXB.mjs';
import { T as pascalCase, U as kebabCase, d as destr } from '../_/nitro.mjs';
import { find, html } from 'property-information';
import { f as flatUnwrap, n as nodeTextContent } from './node-w2HLPhiE.mjs';
import { u as useAsyncData, a as useNuxtData } from './asyncData-DVeqSZBv.mjs';
import { u as useMapState, _ as _sfc_main$G, a as _sfc_main$D, b as _sfc_main$E, f as _sfc_main$y, g as _sfc_main$n } from './useMapState-Dc87w07T.mjs';
import './index-gA-qUlDT.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import './index-CED3XvSe.mjs';
import 'tailwind-variants';
import './Avatar-Bz_JyLmu.mjs';
import './virtual_nuxt_G__My_Programs_ias_diplom1_app_frontend_nuxt-app_node_modules_.cache_nuxt_.nuxt_ui-image-component-CX5_T5UE.mjs';
import './useFormField-C7CorFZK.mjs';
import './Link-gmgU2Miy.mjs';
import './nuxt-link-DYDQwZUP.mjs';
import 'vue-router';
import 'jwt-decode';
import 'tailwindcss/colors';
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

const theme = {
  "slots": {
    "root": "relative focus:outline-none",
    "viewport": "overflow-hidden",
    "container": "flex items-start",
    "item": "min-w-0 shrink-0 basis-full",
    "controls": "",
    "arrows": "",
    "prev": "absolute rounded-full",
    "next": "absolute rounded-full",
    "dots": "absolute inset-x-0 -bottom-7 flex flex-wrap items-center justify-center gap-3",
    "dot": [
      "cursor-pointer size-3 bg-accented rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      "transition"
    ]
  },
  "variants": {
    "orientation": {
      "vertical": {
        "container": "flex-col -mt-4",
        "item": "pt-4",
        "prev": "top-4 sm:-top-12 left-1/2 -translate-x-1/2 rotate-90 rtl:-rotate-90",
        "next": "bottom-4 sm:-bottom-12 left-1/2 -translate-x-1/2 rotate-90 rtl:-rotate-90"
      },
      "horizontal": {
        "container": "flex-row -ms-4",
        "item": "ps-4",
        "prev": "start-4 sm:-start-12 top-1/2 -translate-y-1/2",
        "next": "end-4 sm:-end-12 top-1/2 -translate-y-1/2"
      }
    },
    "active": {
      "true": {
        "dot": "data-[state=active]:bg-inverted"
      }
    }
  }
};
const _sfc_main$3 = {
  __name: "UCarousel",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    prev: { type: Object, required: false },
    prevIcon: { type: null, required: false },
    next: { type: Object, required: false },
    nextIcon: { type: null, required: false },
    arrows: { type: Boolean, required: false, default: false },
    dots: { type: Boolean, required: false, default: false },
    orientation: { type: null, required: false, default: "horizontal" },
    items: { type: Array, required: false },
    autoplay: { type: [Boolean, Object], required: false, default: false },
    autoScroll: { type: [Boolean, Object], required: false, default: false },
    autoHeight: { type: [Boolean, Object], required: false, default: false },
    classNames: { type: [Boolean, Object], required: false, default: false },
    fade: { type: [Boolean, Object], required: false, default: false },
    wheelGestures: { type: [Boolean, Object], required: false, default: false },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    align: { type: [String, Function], required: false, default: "center" },
    containScroll: { type: [Boolean, String], required: false, default: "trimSnaps" },
    slidesToScroll: { type: [String, Number], required: false, default: 1 },
    dragFree: { type: Boolean, required: false, default: false },
    dragThreshold: { type: Number, required: false, default: 10 },
    inViewThreshold: { type: null, required: false, default: 0 },
    loop: { type: Boolean, required: false, default: false },
    skipSnaps: { type: Boolean, required: false, default: false },
    duration: { type: Number, required: false, default: 25 },
    startIndex: { type: Number, required: false, default: 0 },
    watchDrag: { type: [Boolean, Function], required: false, default: true },
    watchResize: { type: [Boolean, Function], required: false, default: true },
    watchSlides: { type: [Boolean, Function], required: false, default: true },
    watchFocus: { type: [Boolean, Function], required: false, default: true },
    active: { type: Boolean, required: false, default: true },
    breakpoints: { type: Object, required: false, default: () => ({}) }
  },
  emits: ["select"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const { dir, t } = useLocale();
    const appConfig = useAppConfig();
    const rootProps = useForwardProps(reactivePick(props, "active", "align", "breakpoints", "containScroll", "dragFree", "dragThreshold", "duration", "inViewThreshold", "loop", "skipSnaps", "slidesToScroll", "startIndex", "watchDrag", "watchResize", "watchSlides", "watchFocus"));
    const prevIcon = computed(() => props.prevIcon || (dir.value === "rtl" ? appConfig.ui.icons.arrowRight : appConfig.ui.icons.arrowLeft));
    const nextIcon = computed(() => props.nextIcon || (dir.value === "rtl" ? appConfig.ui.icons.arrowLeft : appConfig.ui.icons.arrowRight));
    const stopAutoplayOnInteraction = computed(() => {
      if (typeof props.autoplay === "boolean") {
        return true;
      }
      return props.autoplay.stopOnInteraction ?? true;
    });
    const stopAutoScrollOnInteraction = computed(() => {
      if (typeof props.autoScroll === "boolean") {
        return true;
      }
      return props.autoScroll.stopOnInteraction ?? true;
    });
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.carousel || {} })({
      orientation: props.orientation
    }));
    const options = computed(() => ({
      ...props.fade ? { align: "center", containScroll: false } : {},
      ...rootProps.value,
      axis: props.orientation === "horizontal" ? "x" : "y",
      direction: dir.value === "rtl" ? "rtl" : "ltr"
    }));
    const plugins = ref([]);
    async function loadPlugins() {
      const emblaPlugins = [];
      if (props.autoplay) {
        const AutoplayPlugin = await import('embla-carousel-autoplay').then((r) => r.default);
        emblaPlugins.push(AutoplayPlugin(typeof props.autoplay === "boolean" ? {} : props.autoplay));
      }
      if (props.autoScroll) {
        const AutoScrollPlugin = await import('embla-carousel-auto-scroll').then((r) => r.default);
        emblaPlugins.push(AutoScrollPlugin(typeof props.autoScroll === "boolean" ? {} : props.autoScroll));
      }
      if (props.autoHeight) {
        const AutoHeightPlugin = await import('embla-carousel-auto-height').then((r) => r.default);
        emblaPlugins.push(AutoHeightPlugin(typeof props.autoHeight === "boolean" ? {} : props.autoHeight));
      }
      if (props.classNames) {
        const ClassNamesPlugin = await import('embla-carousel-class-names').then((r) => r.default);
        emblaPlugins.push(ClassNamesPlugin(typeof props.classNames === "boolean" ? {} : props.classNames));
      }
      if (props.fade) {
        const FadePlugin = await import('embla-carousel-fade').then((r) => r.default);
        emblaPlugins.push(FadePlugin(typeof props.fade === "boolean" ? {} : props.fade));
      }
      if (props.wheelGestures) {
        const { WheelGesturesPlugin } = await import('../_/embla-carousel-wheel-gestures.esm.mjs');
        emblaPlugins.push(WheelGesturesPlugin(typeof props.wheelGestures === "boolean" ? {} : props.wheelGestures));
      }
      plugins.value = emblaPlugins;
    }
    watch(() => [props.autoplay, props.autoScroll, props.autoHeight, props.classNames, props.fade, props.wheelGestures], async () => {
      await loadPlugins();
      emblaApi.value?.reInit(options.value, plugins.value);
    }, { immediate: true });
    const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins);
    watch(options, () => {
      emblaApi.value?.reInit(options.value, plugins.value);
    }, { flush: "post" });
    function stopOnInteraction() {
      if (stopAutoplayOnInteraction.value) {
        emblaApi.value?.plugins().autoplay?.stop();
      }
      if (stopAutoScrollOnInteraction.value) {
        emblaApi.value?.plugins().autoScroll?.stop();
      }
    }
    function scrollPrev() {
      emblaApi.value?.scrollPrev();
      stopOnInteraction();
    }
    function scrollNext() {
      emblaApi.value?.scrollNext();
      stopOnInteraction();
    }
    function scrollTo(index) {
      emblaApi.value?.scrollTo(index);
    }
    function onKeyDown(event) {
      let prevKey;
      let nextKey;
      if (props.orientation === "horizontal") {
        prevKey = dir.value === "ltr" ? "ArrowLeft" : "ArrowRight";
        nextKey = dir.value === "ltr" ? "ArrowRight" : "ArrowLeft";
      } else {
        prevKey = "ArrowUp";
        nextKey = "ArrowDown";
      }
      if (event.key === prevKey) {
        event.preventDefault();
        scrollPrev();
        return;
      }
      if (event.key === nextKey) {
        event.preventDefault();
        scrollNext();
      }
    }
    const canScrollNext = ref(false);
    const canScrollPrev = ref(false);
    const selectedIndex = ref(0);
    const scrollSnaps = ref([]);
    function isCarouselItem(item) {
      return typeof item === "object" && item !== null;
    }
    __expose({
      emblaRef,
      emblaApi
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Primitive), mergeProps({
        as: __props.as,
        role: "region",
        "aria-roledescription": "carousel",
        "data-orientation": __props.orientation,
        tabindex: "0",
        "data-slot": "root",
        class: ui.value.root({ class: [props.ui?.root, props.class] }),
        onKeydown: onKeyDown
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div data-slot="viewport" class="${ssrRenderClass(ui.value.viewport({ class: props.ui?.viewport }))}"${_scopeId}><div data-slot="container" class="${ssrRenderClass(ui.value.container({ class: props.ui?.container }))}"${_scopeId}><!--[-->`);
            ssrRenderList(__props.items, (item, index) => {
              _push2(`<div${ssrRenderAttrs(mergeProps({ key: index }, { ref_for: true }, __props.dots ? { role: "tabpanel" } : { "role": "group", "aria-roledescription": "slide" }, {
                "data-slot": "item",
                class: ui.value.item({ class: [props.ui?.item, isCarouselItem(item) && item.ui?.item, isCarouselItem(item) && item.class] })
              }))}${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "default", {
                item,
                index
              }, null, _push2, _parent2, _scopeId);
              _push2(`</div>`);
            });
            _push2(`<!--]--></div></div>`);
            if (__props.arrows || __props.dots) {
              _push2(`<div data-slot="controls" class="${ssrRenderClass(ui.value.controls({ class: props.ui?.controls }))}"${_scopeId}>`);
              if (__props.arrows) {
                _push2(`<div data-slot="arrows" class="${ssrRenderClass(ui.value.arrows({ class: props.ui?.arrows }))}"${_scopeId}>`);
                _push2(ssrRenderComponent(_sfc_main$8, mergeProps({
                  disabled: !canScrollPrev.value,
                  icon: prevIcon.value,
                  color: "neutral",
                  variant: "outline",
                  "aria-label": unref(t)("carousel.prev")
                }, typeof __props.prev === "object" ? __props.prev : void 0, {
                  "data-slot": "prev",
                  class: ui.value.prev({ class: props.ui?.prev }),
                  onClick: scrollPrev
                }), null, _parent2, _scopeId));
                _push2(ssrRenderComponent(_sfc_main$8, mergeProps({
                  disabled: !canScrollNext.value,
                  icon: nextIcon.value,
                  color: "neutral",
                  variant: "outline",
                  "aria-label": unref(t)("carousel.next")
                }, typeof __props.next === "object" ? __props.next : void 0, {
                  "data-slot": "next",
                  class: ui.value.next({ class: props.ui?.next }),
                  onClick: scrollNext
                }), null, _parent2, _scopeId));
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              if (__props.dots) {
                _push2(`<div role="tablist"${ssrRenderAttr("aria-label", unref(t)("carousel.dots"))} data-slot="dots" class="${ssrRenderClass(ui.value.dots({ class: props.ui?.dots }))}"${_scopeId}><!--[-->`);
                ssrRenderList(scrollSnaps.value, (_2, index) => {
                  _push2(`<button type="button" role="tab"${ssrRenderAttr("aria-label", unref(t)("carousel.goto", { slide: index + 1 }))}${ssrRenderAttr("aria-selected", selectedIndex.value === index)} data-slot="dot" class="${ssrRenderClass(ui.value.dot({ class: props.ui?.dot, active: selectedIndex.value === index }))}"${ssrRenderAttr("data-state", selectedIndex.value === index ? "active" : void 0)}${_scopeId}></button>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", {
                ref_key: "emblaRef",
                ref: emblaRef,
                "data-slot": "viewport",
                class: ui.value.viewport({ class: props.ui?.viewport })
              }, [
                createVNode("div", {
                  "data-slot": "container",
                  class: ui.value.container({ class: props.ui?.container })
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(__props.items, (item, index) => {
                    return openBlock(), createBlock("div", mergeProps({ key: index }, { ref_for: true }, __props.dots ? { role: "tabpanel" } : { "role": "group", "aria-roledescription": "slide" }, {
                      "data-slot": "item",
                      class: ui.value.item({ class: [props.ui?.item, isCarouselItem(item) && item.ui?.item, isCarouselItem(item) && item.class] })
                    }), [
                      renderSlot(_ctx.$slots, "default", {
                        item,
                        index
                      })
                    ], 16);
                  }), 128))
                ], 2)
              ], 2),
              __props.arrows || __props.dots ? (openBlock(), createBlock("div", {
                key: 0,
                "data-slot": "controls",
                class: ui.value.controls({ class: props.ui?.controls })
              }, [
                __props.arrows ? (openBlock(), createBlock("div", {
                  key: 0,
                  "data-slot": "arrows",
                  class: ui.value.arrows({ class: props.ui?.arrows })
                }, [
                  createVNode(_sfc_main$8, mergeProps({
                    disabled: !canScrollPrev.value,
                    icon: prevIcon.value,
                    color: "neutral",
                    variant: "outline",
                    "aria-label": unref(t)("carousel.prev")
                  }, typeof __props.prev === "object" ? __props.prev : void 0, {
                    "data-slot": "prev",
                    class: ui.value.prev({ class: props.ui?.prev }),
                    onClick: scrollPrev
                  }), null, 16, ["disabled", "icon", "aria-label", "class"]),
                  createVNode(_sfc_main$8, mergeProps({
                    disabled: !canScrollNext.value,
                    icon: nextIcon.value,
                    color: "neutral",
                    variant: "outline",
                    "aria-label": unref(t)("carousel.next")
                  }, typeof __props.next === "object" ? __props.next : void 0, {
                    "data-slot": "next",
                    class: ui.value.next({ class: props.ui?.next }),
                    onClick: scrollNext
                  }), null, 16, ["disabled", "icon", "aria-label", "class"])
                ], 2)) : createCommentVNode("", true),
                __props.dots ? (openBlock(), createBlock("div", {
                  key: 1,
                  role: "tablist",
                  "aria-label": unref(t)("carousel.dots"),
                  "data-slot": "dots",
                  class: ui.value.dots({ class: props.ui?.dots })
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(scrollSnaps.value, (_2, index) => {
                    return openBlock(), createBlock("button", {
                      key: index,
                      type: "button",
                      role: "tab",
                      "aria-label": unref(t)("carousel.goto", { slide: index + 1 }),
                      "aria-selected": selectedIndex.value === index,
                      "data-slot": "dot",
                      class: ui.value.dot({ class: props.ui?.dot, active: selectedIndex.value === index }),
                      "data-state": selectedIndex.value === index ? "active" : void 0,
                      onClick: ($event) => scrollTo(index)
                    }, null, 10, ["aria-label", "aria-selected", "data-state", "onClick"]);
                  }), 128))
                ], 10, ["aria-label"])) : createCommentVNode("", true)
              ], 2)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/Carousel.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const htmlTags = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "math",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rb",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "slot",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "svg",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
];
function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    const value = get(obj, key);
    if (value !== void 0) {
      acc[key] = value;
    }
    return acc;
  }, {});
}
function get(obj, key) {
  return key.split(".").reduce((acc, k) => acc && acc[k], obj);
}
const DEFAULT_SLOT = "default";
const rxOn = /^@|^v-on:/;
const rxBind = /^:|^v-bind:/;
const rxModel = /^v-model/;
const nativeInputs = ["select", "textarea", "input"];
const specialParentTags = ["math", "svg"];
const proseComponentMap = Object.fromEntries(["p", "a", "blockquote", "code", "pre", "code", "em", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "img", "ul", "ol", "li", "strong", "table", "thead", "tbody", "td", "th", "tr", "script"].map((t) => [t, `prose-${t}`]));
const dangerousTags = ["script", "base"];
const _sfc_main$2 = defineComponent({
  name: "MDCRenderer",
  props: {
    /**
     * Content to render
     */
    body: {
      type: Object,
      required: true
    },
    /**
     * Document meta data
     */
    data: {
      type: Object,
      default: () => ({})
    },
    /**
     * Class(es) to bind to the component
     */
    class: {
      type: [String, Object],
      default: void 0
    },
    /**
     * Root tag to use for rendering
     */
    tag: {
      type: [String, Boolean],
      default: void 0
    },
    /**
     * Whether or not to render Prose components instead of HTML tags
     */
    prose: {
      type: Boolean,
      default: void 0
    },
    /**
     * The map of custom components to use for rendering.
     */
    components: {
      type: Object,
      default: () => ({})
    },
    /**
     * Tags to unwrap separated by spaces
     * Example: 'ul li'
     */
    unwrap: {
      type: [Boolean, String],
      default: false
    }
  },
  async setup(props) {
    const app = getCurrentInstance()?.appContext?.app;
    const $nuxt = app?.$nuxt;
    const route = $nuxt?.$route || $nuxt?._route;
    const { mdc } = $nuxt?.$config?.public || {};
    const tags = computed(() => ({
      ...mdc?.components?.prose && props.prose !== false ? proseComponentMap : {},
      ...mdc?.components?.map || {},
      ...toRaw(props.data?.mdc?.components || {}),
      ...props.components
    }));
    const contentKey = computed(() => {
      const components = (props.body?.children || []).map((n) => n.tag || n.type).filter((t) => !htmlTags.includes(t));
      return Array.from(new Set(components)).sort().join(".");
    });
    const runtimeData = reactive({
      ...props.data
    });
    watch(() => props.data, (newData) => {
      Object.assign(runtimeData, newData);
    });
    await resolveContentComponents(props.body, { tags: tags.value });
    function updateRuntimeData(code, value) {
      const lastIndex = code.split(".").length - 1;
      return code.split(".").reduce((o, k, i) => {
        if (i == lastIndex && o) {
          o[k] = value;
          return o[k];
        }
        return typeof o === "object" ? o[k] : void 0;
      }, runtimeData);
    }
    return { tags, contentKey, route, runtimeData, updateRuntimeData };
  },
  render(ctx) {
    const { tags, tag, body, data, contentKey, route, unwrap, runtimeData, updateRuntimeData } = ctx;
    if (!body) {
      return null;
    }
    const meta = { ...data, tags, $route: route, runtimeData, updateRuntimeData };
    const component = tag !== false ? resolveComponentInstance(tag || meta.component?.name || meta.component || "div") : void 0;
    return component ? h(component, { ...meta.component?.props, class: ctx.class, ...this.$attrs, key: contentKey }, { default: defaultSlotRenderer }) : defaultSlotRenderer?.();
    function defaultSlotRenderer() {
      const defaultSlot = _renderSlots(body, h, { documentMeta: meta, parentScope: meta, resolveComponent: resolveComponentInstance });
      if (!defaultSlot?.default) {
        return null;
      }
      if (unwrap) {
        return flatUnwrap(
          defaultSlot.default(),
          typeof unwrap === "string" ? unwrap.split(" ") : ["*"]
        );
      }
      return defaultSlot.default();
    }
  }
});
function _renderNode(node, h2, options, keyInParent) {
  const { documentMeta, parentScope, resolveComponent: resolveComponent2 } = options;
  if (node.type === "text") {
    return h2(Text, node.value);
  }
  if (node.type === "comment") {
    return h2(Comment, null, node.value);
  }
  const originalTag = node.tag;
  const renderTag = findMappedTag(node, documentMeta.tags);
  if (node.tag === "binding") {
    return renderBinding(node, h2, documentMeta, parentScope);
  }
  const _resolveComponent = isUnresolvableTag(renderTag) ? (component2) => component2 : resolveComponent2;
  if (dangerousTags.includes(renderTag)) {
    return h2(
      "pre",
      { class: "mdc-renderer-dangerous-tag" },
      "<" + renderTag + ">" + nodeTextContent(node) + "</" + renderTag + ">"
    );
  }
  const component = _resolveComponent(renderTag);
  if (typeof component === "object") {
    component.tag = originalTag;
  }
  const props = propsToData(node, documentMeta);
  if (keyInParent) {
    props.key = keyInParent;
  }
  return h2(
    component,
    props,
    _renderSlots(
      node,
      h2,
      {
        documentMeta,
        parentScope: { ...parentScope, ...props },
        resolveComponent: _resolveComponent
      }
    )
  );
}
function _renderSlots(node, h2, options) {
  const { documentMeta, parentScope, resolveComponent: resolveComponent2 } = options;
  const children = node.children || [];
  const slotNodes = children.reduce((data, node2) => {
    if (!isTemplate(node2)) {
      data[DEFAULT_SLOT].children.push(node2);
      return data;
    }
    const slotName = getSlotName(node2);
    data[slotName] = data[slotName] || { props: {}, children: [] };
    if (node2.type === "element") {
      data[slotName].props = node2.props;
      data[slotName].children.push(...node2.children || []);
    }
    return data;
  }, {
    [DEFAULT_SLOT]: { props: {}, children: [] }
  });
  const slots = Object.entries(slotNodes).reduce((slots2, [name, { props, children: children2 }]) => {
    if (!children2.length) {
      return slots2;
    }
    slots2[name] = (data = {}) => {
      const scopedProps = pick(data, Object.keys(props || {}));
      let vNodes = children2.map((child, index) => {
        return _renderNode(
          child,
          h2,
          {
            documentMeta,
            parentScope: { ...parentScope, ...scopedProps },
            resolveComponent: resolveComponent2
          },
          String(child.props?.key || index)
        );
      });
      if (props?.unwrap) {
        vNodes = flatUnwrap(vNodes, props.unwrap);
      }
      return mergeTextNodes(vNodes);
    };
    return slots2;
  }, {});
  return slots;
}
function renderBinding(node, h2, documentMeta, parentScope = {}) {
  const data = {
    ...documentMeta.runtimeData,
    ...parentScope,
    $document: documentMeta,
    $doc: documentMeta
  };
  const splitter = /\.|\[(\d+)\]/;
  const keys = node.props?.value.trim().split(splitter).filter(Boolean);
  const value = keys.reduce((data2, key) => {
    if (data2 && key in data2) {
      if (typeof data2[key] === "function") {
        return data2[key]();
      } else {
        return data2[key];
      }
    }
    return void 0;
  }, data);
  const defaultValue = node.props?.defaultValue;
  return h2(Text, value ?? defaultValue ?? "");
}
function propsToData(node, documentMeta) {
  const { tag = "", props = {} } = node;
  return Object.keys(props).reduce(function(data, key) {
    if (key === "__ignoreMap") {
      return data;
    }
    const value = props[key];
    if (rxModel.test(key)) {
      return propsToDataRxModel(key, value, data, documentMeta, { native: nativeInputs.includes(tag) });
    }
    if (key === "v-bind") {
      return propsToDataVBind(key, value, data, documentMeta);
    }
    if (rxOn.test(key)) {
      return propsToDataRxOn(key, value, data, documentMeta);
    }
    if (rxBind.test(key)) {
      return propsToDataRxBind(key, value, data, documentMeta);
    }
    const { attribute } = find(html, key);
    if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
      data[attribute] = value.join(" ");
      return data;
    }
    data[attribute] = value;
    return data;
  }, {});
}
function propsToDataRxModel(key, value, data, documentMeta, { native }) {
  const propName = key.match(/^v-model:([^=]+)/)?.[1] || "modelValue";
  const field = native ? "value" : propName;
  const event = native ? "onInput" : `onUpdate:${propName}`;
  data[field] = evalInContext(value, documentMeta.runtimeData);
  data[event] = (e) => {
    documentMeta.updateRuntimeData(value, native ? e.target?.value : e);
  };
  return data;
}
function propsToDataVBind(_key, value, data, documentMeta) {
  const val = evalInContext(value, documentMeta);
  data = Object.assign(data, val);
  return data;
}
function propsToDataRxOn(key, value, data, documentMeta) {
  key = key.replace(rxOn, "");
  data.on = data.on || {};
  data.on[key] = () => evalInContext(value, documentMeta);
  return data;
}
function propsToDataRxBind(key, value, data, documentMeta) {
  key = key.replace(rxBind, "");
  data[key] = evalInContext(value, documentMeta);
  return data;
}
const resolveComponentInstance = (component) => {
  if (typeof component === "string") {
    if (htmlTags.includes(component)) {
      return component;
    }
    const _component = resolveComponent(pascalCase(component), false);
    if (!component || _component?.name === "AsyncComponentWrapper") {
      return _component;
    }
    if (typeof _component === "string") {
      return _component;
    }
    if ("setup" in _component) {
      return defineAsyncComponent(() => new Promise((resolve) => resolve(_component)));
    }
    return _component;
  }
  return component;
};
function evalInContext(code, context) {
  const result = code.split(".").reduce((o, k) => typeof o === "object" ? o[k] : void 0, context);
  return typeof result === "undefined" ? destr(code) : result;
}
function getSlotName(node) {
  let name = "";
  for (const propName of Object.keys(node.props || {})) {
    if (!propName.startsWith("#") && !propName.startsWith("v-slot:")) {
      continue;
    }
    name = propName.split(/[:#]/, 2)[1];
    break;
  }
  return name || DEFAULT_SLOT;
}
function isTemplate(node) {
  return node.tag === "template";
}
function isUnresolvableTag(tag) {
  return specialParentTags.includes(tag);
}
function mergeTextNodes(nodes) {
  const mergedNodes = [];
  for (const node of nodes) {
    const previousNode = mergedNodes[mergedNodes.length - 1];
    if (node.type === Text && previousNode?.type === Text) {
      previousNode.children = previousNode.children + node.children;
    } else {
      mergedNodes.push(node);
    }
  }
  return mergedNodes;
}
async function resolveContentComponents(body, meta) {
  if (!body) {
    return;
  }
  const components = Array.from(new Set(loadComponents(body, meta)));
  await Promise.all(components.map(async (c) => {
    if (c?.render || c?.ssrRender || c?.__ssrInlineRender) {
      return;
    }
    const resolvedComponent = resolveComponentInstance(c);
    if (resolvedComponent?.__asyncLoader && !resolvedComponent.__asyncResolved) {
      await resolvedComponent.__asyncLoader();
    }
  }));
  function loadComponents(node, documentMeta) {
    const tag = node.tag;
    if (node.type === "text" || tag === "binding" || node.type === "comment") {
      return [];
    }
    const renderTag = findMappedTag(node, documentMeta.tags);
    if (isUnresolvableTag(renderTag)) {
      return [];
    }
    const components2 = [];
    if (node.type !== "root" && !htmlTags.includes(renderTag)) {
      components2.push(renderTag);
    }
    for (const child of node.children || []) {
      components2.push(...loadComponents(child, documentMeta));
    }
    return components2;
  }
}
function findMappedTag(node, tags) {
  const tag = node.tag;
  if (!tag || typeof node.props?.__ignoreMap !== "undefined") {
    return tag;
  }
  return tags[tag] || tags[pascalCase(tag)] || tags[kebabCase(node.tag)] || tag;
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxtjs/mdc/dist/runtime/components/MDCRenderer.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main$2, { __name: "MDCRenderer" });
const _sfc_main$1 = {
  __name: "MDC",
  __ssrInlineRender: true,
  props: {
    tag: {
      type: [String, Boolean],
      default: "div"
    },
    /**
     * Raw markdown string or parsed markdown object from `parseMarkdown`
     */
    value: {
      type: [String, Object],
      required: true
    },
    /**
     * Render only the excerpt
     */
    excerpt: {
      type: Boolean,
      default: false
    },
    /**
     * Options for `parseMarkdown`
     */
    parserOptions: {
      type: Object,
      default: () => ({})
    },
    /**
     * Class to be applied to the root element
     */
    class: {
      type: [String, Array, Object],
      default: ""
    },
    /**
     * Tags to unwrap separated by spaces
     * Example: 'ul li'
     */
    unwrap: {
      type: [Boolean, String],
      default: false
    },
    /**
     * Async Data Unique Key
     * @default `hash(props.value)`
     */
    cacheKey: {
      type: String,
      default: void 0
    },
    /**
     * Partial parsing (if partial is `true`, title and toc generation will not be generated)
     */
    partial: {
      type: Boolean,
      default: true
    }
  },
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const key = computed(() => props.cacheKey ?? hashString(props.value));
    const { data, refresh, error } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(key.value, async () => {
      if (typeof props.value !== "string") {
        return props.value;
      }
      const { parseMarkdown } = await import('./index-Hdrp0Ye0.mjs');
      return await parseMarkdown(props.value, {
        ...props.parserOptions,
        toc: props.partial ? false : props.parserOptions?.toc,
        contentHeading: props.partial ? false : props.parserOptions?.contentHeading
      });
    }, "$R23qlhow_i")), __temp = await __temp, __restore(), __temp);
    const body = computed(() => props.excerpt ? data.value?.excerpt : data.value?.body);
    watch(() => props.value, () => {
      refresh();
    });
    function hashString(str) {
      if (typeof str !== "string") {
        str = JSON.stringify(str || "");
      }
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 6) - hash + char;
        hash = hash & hash;
      }
      return `mdc-${hash === 0 ? "0000" : hash.toString(36)}-key`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_MDCRenderer = __nuxt_component_0;
      ssrRenderSlot(_ctx.$slots, "default", {
        data: unref(data)?.data,
        body: unref(data)?.body,
        toc: unref(data)?.toc,
        excerpt: unref(data)?.excerpt,
        error: unref(error)
      }, () => {
        if (body.value) {
          _push(ssrRenderComponent(_component_MDCRenderer, {
            tag: props.tag,
            class: props.class,
            body: body.value,
            data: unref(data)?.data,
            unwrap: props.unwrap
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
      }, _push, _parent);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxtjs/mdc/dist/runtime/components/MDC.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const map = shallowRef(null);
    const markers = ref([]);
    const camera = ref({
      duration: 2500
    });
    const LOCATION = ref({
      center: [37.623082, 55.75254],
      zoom: 15
    });
    const carousel = useTemplateRef("carousel");
    const activeIndex = ref(0);
    const thumbsContainer = ref(null);
    function scrollThumbTo(index) {
      thumbsContainer.value?.children[index]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });
    }
    const getClosestInfrastructure = (offer2) => {
      const typeMap = /* @__PURE__ */ new Map();
      offer2.address.infrastructures_links.forEach((item) => {
        const typeId = item.infrastructure.infrastructure_type.id;
        if (!typeMap.has(typeId) || typeMap.get(typeId).distance > item.distance) {
          typeMap.set(typeId, item);
        }
      });
      return Array.from(typeMap.values()).sort((a, b) => a.distance - b.distance);
    };
    function onClickPrev() {
      activeIndex.value--;
      scrollThumbTo(activeIndex.value);
    }
    function onClickNext() {
      activeIndex.value++;
      scrollThumbTo(activeIndex.value);
    }
    function onSelect(index) {
      activeIndex.value = index;
      scrollThumbTo(index);
    }
    function select(index) {
      activeIndex.value = index;
      carousel.value?.emblaApi?.scrollTo(index);
      scrollThumbTo(index);
    }
    const mapState = useMapState();
    const showOnMap = (offer2) => {
      mapState.value.center = offer2.address.coordinates_list, mapState.value.offerId = offer2.id;
      navigateTo("/map");
    };
    const route = useRoute();
    const offerId = route.params.id;
    const { $api } = useNuxtApp();
    const {
      data: offer,
      pending,
      error
    } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(`offers/${offerId}`, () => $api(`offers/${offerId}`), {
      getCachedData: (key) => {
        return useNuxtData(key).data.value;
      }
    })), __temp = await __temp, __restore(), __temp);
    const { data: favoritesData, refresh: refreshFavorites } = useAsyncData("favorites", () => $api("offers/favorites/"));
    const favoriteOffers = computed(() => {
      return new Set(favoritesData.value?.map((item) => item.id) || []);
    });
    const toggleFavorite = async (offer2) => {
      if (!offer2.id) return;
      const offerId2 = offer2.id;
      const wasFavorite = favoriteOffers.value.has(offerId2);
      try {
        if (wasFavorite) {
          $api(`offers/favorites/${offerId2}`, { method: "DELETE" });
          if (favoritesData.value) {
            favoritesData.value = favoritesData.value.filter((item) => item.id !== offerId2);
          }
        } else {
          $api(`offers/favorites/${offerId2}`, { method: "POST" });
          if (favoritesData.value) {
            favoritesData.value = [...favoritesData.value, offer2];
          }
        }
      } catch (error2) {
        console.error("Ошибка при обновлении избранного:", error2);
      }
    };
    const isFavorite = (offerId2) => {
      return offerId2 !== null && favoriteOffers.value.has(offerId2);
    };
    watch(
      () => offer.value,
      (newOffer) => {
        if (newOffer) {
          LOCATION.value.center = newOffer.address.coordinates_list;
          console.log("Установили центр");
          markers.value = newOffer.address.infrastructures_links.map((infra, index) => ({
            onClick: () => {
              LOCATION.value = {
                center: infra.infrastructure.coordinates_list,
                zoom: 20
              };
            },
            hideOutsideViewport: true,
            coordinates: infra.infrastructure.coordinates_list,
            properties: {
              hint: `<p>${infra.infrastructure.infrastructure_type?.name}</p><p>${infra.infrastructure.name != "unknown" ? infra.infrastructure.name : ""}</p><p>${infra.distance} м</p>`,
              name: infra.infrastructure.name,
              type_id: infra.infrastructure.infrastructure_type.id
            }
          }));
        }
      },
      { immediate: true }
    );
    const priceChartOptions = computed(() => {
      if (!offer.value?.price_history?.length) return null;
      return {
        chart: {
          type: "line",
          height: 328,
          zoom: {
            enabled: false
          },
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false
            }
          }
        },
        colors: ["#059669"],
        stroke: {
          width: 3,
          curve: "smooth"
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
              day: "dd MMM"
            }
          }
        },
        yaxis: {
          labels: {
            formatter: (value) => formatPrice(value)
          },
          title: {
            text: "Цена, ₽"
          }
        },
        tooltip: {
          x: {
            format: "dd MMM yyyy"
          },
          y: {
            formatter: (value) => formatPrice(value) + " ₽"
          }
        },
        title: {},
        grid: {
          borderColor: "#e7e7e7",
          row: {
            colors: ["#f3f3f3", "transparent"],
            opacity: 0.5
          }
        }
      };
    });
    const priceChartSeries = computed(() => {
      if (!offer.value?.price_history?.length) return null;
      const sortedHistory = [...offer.value.price_history].sort((a, b) => new Date(a.changeTime).getTime() - new Date(b.changeTime).getTime());
      return [
        {
          name: "Цена",
          data: sortedHistory.map((item) => ({
            x: new Date(item.changeTime).getTime(),
            y: item.priceData.price
          }))
        }
      ];
    });
    const viewsChartOptions = computed(() => {
      if (!offer.value?.views_history?.length) return null;
      return {
        chart: {
          type: "line",
          height: 328,
          zoom: {
            enabled: false
          },
          toolbar: {
            show: false,
            tools: {
              download: true,
              selection: false,
              zoom: false,
              zoomin: false,
              zoomout: false,
              pan: false,
              reset: false
            }
          }
        },
        colors: ["#3b82f6"],
        stroke: {
          width: 3,
          curve: "smooth"
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
              day: "dd MMM"
            }
          }
        },
        yaxis: {
          title: {
            text: "Количество"
          },
          min: 0
        },
        tooltip: {
          x: {
            format: "dd MMM yyyy"
          }
        },
        title: {
          // text: 'Динамика просмотров',
          // align: 'left',
          // style: {
          //     fontSize: '18px',
          //     fontWeight: 'bold'
          // }
        },
        grid: {
          borderColor: "#f8fafc",
          row: {
            colors: ["#f8fafc", "transparent"],
            opacity: 0.5
          }
        }
      };
    });
    const items = computed(() => {
      const lines = offer.value?.description?.replace(/<[^>]*>/g, "\n").split("\n") ?? [];
      const labelLines = lines.slice(0, 2);
      const contentLines = lines.slice(2);
      return [
        {
          label: labelLines.join("\n"),
          content: contentLines.join("\n")
        }
      ];
    });
    const viewsChartSeries = computed(() => {
      if (!offer.value?.views_history?.length) return null;
      const sortedHistory = [...offer.value.views_history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return [
        {
          name: "Просмотры",
          data: sortedHistory.map((item) => ({
            x: new Date(item.date).getTime(),
            y: item.views
          }))
        }
      ];
    });
    const formatPrice = (price) => {
      return new Intl.NumberFormat("ru-RU").format(price);
    };
    const formatPhone = (phone) => {
      return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 ($2) $3-$4-$5");
    };
    const getPriceCategoryLabel = (category) => {
      const labels = {
        expensive: "Выше рынка",
        normal: "Рыночная цена",
        cheap: "Ниже рынка"
      };
      return labels[category] || category;
    };
    const getPriceCategoryColor = (category) => {
      const colors = {
        expensive: "error",
        normal: "info",
        cheap: "success"
      };
      return colors[category] || "gray";
    };
    const getCategoryLabel = (category) => {
      const labels = {
        low: "Низкая",
        medium: "Средняя",
        high: "Высокая"
      };
      return labels[category] || category;
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
    const getCategoryColor = (category) => {
      const colors = {
        low: "error",
        medium: "warning",
        high: "success"
      };
      return colors[category] || "gray";
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UContainer = _sfc_main$4;
      const _component_UIcon = _sfc_main$5;
      const _component_UCarousel = _sfc_main$3;
      const _component_UBadge = _sfc_main$6;
      const _component_UAccordion = _sfc_main$7;
      const _component_MDC = _sfc_main$1;
      const _component_apexchart = resolveComponent("apexchart");
      _push(ssrRenderComponent(_component_UContainer, mergeProps({ class: "px-5!" }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(pending)) {
              _push2(`<div class="flex justify-center items-center h-96" data-v-36d1bfef${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                class: "size-10",
                name: "codex:loader"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else if (unref(error)) {
              _push2(`<div class="text-red-500" data-v-36d1bfef${_scopeId}>Произошла ошибка при загрузке данных: ${ssrInterpolate(unref(error).message)}</div>`);
            } else if (!unref(offer)) {
              _push2(`<div class="text-gray-500" data-v-36d1bfef${_scopeId}>Объявление не найдено</div>`);
            } else {
              _push2(`<div class="offer-content" data-v-36d1bfef${_scopeId}><div data-v-36d1bfef${_scopeId}><span data-v-36d1bfef${_scopeId}>Опубликовано: ${ssrInterpolate(new Date(unref(offer).creation_date_source).toLocaleString("ru-RU", {
                timeZone: "Europe/Moscow",
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              }))}</span></div><div class="flex gap-12 mb-15" data-v-36d1bfef${_scopeId}><div class="max-w-200" data-v-36d1bfef${_scopeId}><div data-v-36d1bfef${_scopeId}><h1 class="text-4xl font-bold my-3 text-black" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).title)}</h1></div><div class="text-muted my-4" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).address.full_address)} <a class="map-link" data-v-36d1bfef${_scopeId}>На карте</a></div><div class="gallery-section" data-v-36d1bfef${_scopeId}><div class="flex-1 w-full" data-v-36d1bfef${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UCarousel, {
                ref_key: "carousel",
                ref: carousel,
                arrows: "",
                items: unref(offer).images_urls,
                prev: { onClick: onClickPrev },
                next: { onClick: onClickNext },
                ui: {
                  controls: "absolute top-61 inset-x-17.5 opasity-0"
                },
                class: "w-full max-w-200 min-h-120 mx-auto border-2 border-[#e5e7eb]",
                onSelect
              }, {
                default: withCtx(({ item }, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<img${ssrRenderAttr("src", item)} width="2000" height="480" class="rounded-lg" data-v-36d1bfef${_scopeId2}>`);
                  } else {
                    return [
                      createVNode("img", {
                        src: item,
                        width: "2000",
                        height: "480",
                        class: "rounded-lg"
                      }, null, 8, ["src"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<div class="scrlbrwdthnn flex gap-3 max-w-200 overflow-x-auto whitespace-nowrap pt-4 mx-auto" data-v-36d1bfef${_scopeId}><!--[-->`);
              ssrRenderList(unref(offer).images_urls, (item, index) => {
                _push2(`<div class="${ssrRenderClass([{ "opacity-100": activeIndex.value === index }, "sas h-15 opacity-35 hover:opacity-100 transition-opacity"])}" data-v-36d1bfef${_scopeId}><img${ssrRenderAttr("src", item)} width="78" height="100" class="rounded-lg" data-v-36d1bfef${_scopeId}></div>`);
              });
              _push2(`<!--]--></div></div></div><div class="info-card" data-v-36d1bfef${_scopeId}><h3 class="!mt-0" data-v-36d1bfef${_scopeId}>Оценки</h3><div class="categories-grid" data-v-36d1bfef${_scopeId}><div class="category-item" data-v-36d1bfef${_scopeId}><span class="category-label" data-v-36d1bfef${_scopeId}>Для пожилых:</span>`);
              _push2(ssrRenderComponent(_component_UBadge, {
                size: "lg",
                color: getCategoryColor(unref(offer).elderly_category)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(getCategoryLabel(unref(offer).elderly_category))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(getCategoryLabel(unref(offer).elderly_category)), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div><div class="category-item" data-v-36d1bfef${_scopeId}><span class="category-label" data-v-36d1bfef${_scopeId}>Для семьи:</span>`);
              _push2(ssrRenderComponent(_component_UBadge, {
                size: "lg",
                color: getCategoryColor(unref(offer).family_category)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(getCategoryLabel(unref(offer).family_category))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(getCategoryLabel(unref(offer).family_category)), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div><div class="category-item" data-v-36d1bfef${_scopeId}><span class="category-label" data-v-36d1bfef${_scopeId}>Транспортная доступность:</span>`);
              _push2(ssrRenderComponent(_component_UBadge, {
                size: "lg",
                color: getCategoryColor(unref(offer).transport_access_category)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(getCategoryLabel(unref(offer).transport_access_category))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(getCategoryLabel(unref(offer).transport_access_category)), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div></div><h3 class="!mb-0" data-v-36d1bfef${_scopeId}>Описание</h3>`);
              _push2(ssrRenderComponent(_component_UAccordion, {
                type: "multiple",
                items: items.value,
                "unmount-on-hide": false,
                ui: {
                  trigger: "text-base whitespace-pre-line ",
                  body: "text-base  whitespace-pre-line "
                }
              }, {
                body: withCtx(({ item }, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_MDC, {
                      value: item.content
                    }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_MDC, {
                        value: item.content
                      }, null, 8, ["value"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              if (["Квартира", "Апартаменты"].includes(unref(offer).property_type.name)) {
                _push2(`<div class="flex gap-10" data-v-36d1bfef${_scopeId}><div class="flex-1" data-v-36d1bfef${_scopeId}><h3 class="!mt-0" data-v-36d1bfef${_scopeId}>О квартире</h3><div class="info-grid" data-v-36d1bfef${_scopeId}><div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Тип:</span>`);
                if (unref(offer).is_new_house) {
                  _push2(`<span class="value" data-v-36d1bfef${_scopeId}>Новостройка</span>`);
                } else {
                  _push2(`<span class="value" data-v-36d1bfef${_scopeId}>Вторичка</span>`);
                }
                _push2(`</div>`);
                if (unref(offer).rooms_count > 0 && unref(offer).rooms_count < 10) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Кол-во комнат:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).rooms_count)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Общая площадь:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).total_area)} м²</span></div>`);
                if (unref(offer).living_area) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Жилая площадь:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).living_area)} м²</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).kitchen_area) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Площадь кухни:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).kitchen_area)} м²</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).ceiling_height) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Высота потолков:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).ceiling_height)} м</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).bathrooms_count) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Кол-во санузлов:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).bathrooms_count)} ${ssrInterpolate(unref(offer).bathroom_type?.name)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).has_balcony) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Балкон</span><span class="value" data-v-36d1bfef${_scopeId}>Есть</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).floor) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Этаж:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).floor)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).window_view_type) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Вид из окон:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).window_view_type?.name)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).renovation_type) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}>`);
                  if (unref(offer).is_new_house) {
                    _push2(`<span class="label" data-v-36d1bfef${_scopeId}>Отделка:</span>`);
                  } else {
                    _push2(`<span class="label" data-v-36d1bfef${_scopeId}>Ремонт:</span>`);
                  }
                  _push2(`<span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).renovation_type?.name)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div><div class="flex-1" data-v-36d1bfef${_scopeId}><h3 class="!mt-0" data-v-36d1bfef${_scopeId}>О доме</h3><div class="info-grid" data-v-36d1bfef${_scopeId}>`);
                if (unref(offer).house_built_year) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Год постройки:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).house_built_year)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).house_floors_count) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Кол-во этажей:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).house_floors_count)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).elevators_count) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Кол-во лифтов:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).elevators_count)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).house_material_type) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Тип дома:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).house_material_type?.name)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).heating_type) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Отопление:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).heating_type?.name)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).parking_type) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Парковка:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).parking_type?.name)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).has_garbage_chute) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Мусоропровод:</span><span class="value" data-v-36d1bfef${_scopeId}>Есть</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div></div>`);
              } else {
                _push2(`<div data-v-36d1bfef${_scopeId}><div class="flex gap-10" data-v-36d1bfef${_scopeId}><div class="flex-1" data-v-36d1bfef${_scopeId}><h3 class="!mt-0" data-v-36d1bfef${_scopeId}>О доме</h3><div class="info-grid" data-v-36d1bfef${_scopeId}><div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Площадь:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).total_area)} м²</span></div>`);
                if (unref(offer).house_material_type) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Материал дома:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).house_material_type?.name)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).house_floors_count) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Кол-во этажей:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).house_floors_count)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).bedrooms_count) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Кол-во спален:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).bedrooms_count)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).house_built_year) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Год постройки:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).house_built_year)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div><div class="flex-1" data-v-36d1bfef${_scopeId}><h3 class="!mt-0" data-v-36d1bfef${_scopeId}>Об участке</h3><div class="info-grid" data-v-36d1bfef${_scopeId}>`);
                if (unref(offer).land_area) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Площадь</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).land_area)} сот.</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).land_type) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Статус участка</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).land_type?.name)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div></div><h3 data-v-36d1bfef${_scopeId}>Коммуникации и удобства</h3><div class="info-grid" data-v-36d1bfef${_scopeId}>`);
                if (unref(offer).bathrooms_count) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Кол-во санузлов:</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).bathrooms_count)} ${ssrInterpolate(unref(offer).bathroom_type?.name?.toLowerCase())}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).sewerage_type) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Канализация</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).sewerage_type?.name)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).water_supply_type) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Водоснабжение</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).water_supply_type?.name)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).heating_type) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Отопление</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).heating_type?.name)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).has_electricity) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Электричество</span><span class="value" data-v-36d1bfef${_scopeId}>Есть</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).gas_type) {
                  _push2(`<div class="info-item" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Газ</span><span class="value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).gas_type?.name)}</span></div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (unref(offer).has_garage || unref(offer).has_terrace || unref(offer).has_bathhouse || unref(offer).has_pool) {
                  _push2(`<div class="info-item !items-start" data-v-36d1bfef${_scopeId}><span class="label" data-v-36d1bfef${_scopeId}>Дополнительно</span><div class="flex flex-col gap-1" data-v-36d1bfef${_scopeId}>`);
                  if (unref(offer).has_garage) {
                    _push2(`<span class="value" data-v-36d1bfef${_scopeId}>Гараж</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (unref(offer).has_terrace) {
                    _push2(`<span class="value" data-v-36d1bfef${_scopeId}>Терраса</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (unref(offer).has_bathhouse) {
                    _push2(`<span class="value" data-v-36d1bfef${_scopeId}>Баня</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (unref(offer).has_pool) {
                    _push2(`<span class="value" data-v-36d1bfef${_scopeId}>Бассейн</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div>`);
              }
              _push2(`</div><div class="map-placeholder" data-v-36d1bfef${_scopeId}><h3 data-v-36d1bfef${_scopeId}>Расположение</h3>`);
              _push2(ssrRenderComponent(unref(_sfc_main$G), {
                modelValue: map.value,
                "onUpdate:modelValue": ($event) => map.value = $event,
                "real-settings-location": "",
                settings: {
                  location: {
                    ...LOCATION.value,
                    duration: 2500
                  },
                  camera: camera.value,
                  showScaleInCopyrights: true
                },
                width: "100%",
                height: "500px"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(unref(_sfc_main$D), null, null, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(unref(_sfc_main$E), null, null, _parent3, _scopeId2));
                    _push3(ssrRenderComponent(unref(_sfc_main$y), {
                      settings: { coordinates: unref(offer).address.coordinates_list }
                    }, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<div class="house-marker" data-v-36d1bfef${_scopeId3}><svg class="marker-svg" data-name="Pin" width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-36d1bfef${_scopeId3}><path d="M27 0C16.507 0 8 8.507 8 19C8 30.6644 19.5164 38.5163 27 46C34.4076 38.5197 46 30.622 46 19C46 8.507 37.493 0 27 0Z" data-v-36d1bfef${_scopeId3}></path><path fill-rule="evenodd" clip-rule="evenodd" d="M27 33C34.7317 33 41 26.7317 41 19C41 11.2683 34.7317 5 27 5C19.2683 5 13 11.2683 13 19C13 26.7317 19.2683 33 27 33Z" fill="white" data-v-36d1bfef${_scopeId3}></path><path fill-rule="evenodd" clip-rule="evenodd" d="M33.4665 19.5633V12.2365H30.2323V15.6778L27.0001 11.7947L18 22.6071L20.9939 25.099L27.0001 17.8834L33.0061 25.099L36 22.6071L33.4665 19.5633Z" data-v-36d1bfef${_scopeId3}></path><circle cx="27" cy="50" r="3" fill="white" data-v-36d1bfef${_scopeId3}></circle><circle cx="27" cy="50" r="2" data-v-36d1bfef${_scopeId3}></circle></svg></div>`);
                        } else {
                          return [
                            createVNode("div", { class: "house-marker" }, [
                              (openBlock(), createBlock("svg", {
                                class: "marker-svg",
                                "data-name": "Pin",
                                width: "54",
                                height: "54",
                                viewBox: "0 0 54 54",
                                fill: "none",
                                xmlns: "http://www.w3.org/2000/svg"
                              }, [
                                createVNode("path", { d: "M27 0C16.507 0 8 8.507 8 19C8 30.6644 19.5164 38.5163 27 46C34.4076 38.5197 46 30.622 46 19C46 8.507 37.493 0 27 0Z" }),
                                createVNode("path", {
                                  "fill-rule": "evenodd",
                                  "clip-rule": "evenodd",
                                  d: "M27 33C34.7317 33 41 26.7317 41 19C41 11.2683 34.7317 5 27 5C19.2683 5 13 11.2683 13 19C13 26.7317 19.2683 33 27 33Z",
                                  fill: "white"
                                }),
                                createVNode("path", {
                                  "fill-rule": "evenodd",
                                  "clip-rule": "evenodd",
                                  d: "M33.4665 19.5633V12.2365H30.2323V15.6778L27.0001 11.7947L18 22.6071L20.9939 25.099L27.0001 17.8834L33.0061 25.099L36 22.6071L33.4665 19.5633Z"
                                }),
                                createVNode("circle", {
                                  cx: "27",
                                  cy: "50",
                                  r: "3",
                                  fill: "white"
                                }),
                                createVNode("circle", {
                                  cx: "27",
                                  cy: "50",
                                  r: "2"
                                })
                              ]))
                            ])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(`<!--[-->`);
                    ssrRenderList(markers.value, (marker, index) => {
                      _push3(ssrRenderComponent(unref(_sfc_main$y), {
                        key: index,
                        settings: marker
                      }, {
                        default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                          if (_push4) {
                            _push4(`<div class="marker" data-v-36d1bfef${_scopeId3}>`);
                            _push4(ssrRenderComponent(_component_UIcon, {
                              size: "20",
                              name: getInfrastructureIcon(marker.properties?.type_id)
                            }, null, _parent4, _scopeId3));
                            _push4(`</div>`);
                          } else {
                            return [
                              createVNode("div", { class: "marker" }, [
                                createVNode(_component_UIcon, {
                                  size: "20",
                                  name: getInfrastructureIcon(marker.properties?.type_id)
                                }, null, 8, ["name"])
                              ])
                            ];
                          }
                        }),
                        _: 2
                      }, _parent3, _scopeId2));
                    });
                    _push3(`<!--]-->`);
                    _push3(ssrRenderComponent(unref(_sfc_main$n), { "hint-property": "hint" }, {
                      default: withCtx(({ content }, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`<div class="hint" data-v-36d1bfef${_scopeId3}>${content ?? ""}</div>`);
                        } else {
                          return [
                            createVNode("div", {
                              class: "hint",
                              innerHTML: content
                            }, null, 8, ["innerHTML"])
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(unref(_sfc_main$D)),
                      createVNode(unref(_sfc_main$E)),
                      createVNode(unref(_sfc_main$y), {
                        settings: { coordinates: unref(offer).address.coordinates_list }
                      }, {
                        default: withCtx(() => [
                          createVNode("div", { class: "house-marker" }, [
                            (openBlock(), createBlock("svg", {
                              class: "marker-svg",
                              "data-name": "Pin",
                              width: "54",
                              height: "54",
                              viewBox: "0 0 54 54",
                              fill: "none",
                              xmlns: "http://www.w3.org/2000/svg"
                            }, [
                              createVNode("path", { d: "M27 0C16.507 0 8 8.507 8 19C8 30.6644 19.5164 38.5163 27 46C34.4076 38.5197 46 30.622 46 19C46 8.507 37.493 0 27 0Z" }),
                              createVNode("path", {
                                "fill-rule": "evenodd",
                                "clip-rule": "evenodd",
                                d: "M27 33C34.7317 33 41 26.7317 41 19C41 11.2683 34.7317 5 27 5C19.2683 5 13 11.2683 13 19C13 26.7317 19.2683 33 27 33Z",
                                fill: "white"
                              }),
                              createVNode("path", {
                                "fill-rule": "evenodd",
                                "clip-rule": "evenodd",
                                d: "M33.4665 19.5633V12.2365H30.2323V15.6778L27.0001 11.7947L18 22.6071L20.9939 25.099L27.0001 17.8834L33.0061 25.099L36 22.6071L33.4665 19.5633Z"
                              }),
                              createVNode("circle", {
                                cx: "27",
                                cy: "50",
                                r: "3",
                                fill: "white"
                              }),
                              createVNode("circle", {
                                cx: "27",
                                cy: "50",
                                r: "2"
                              })
                            ]))
                          ])
                        ]),
                        _: 1
                      }, 8, ["settings"]),
                      (openBlock(true), createBlock(Fragment, null, renderList(markers.value, (marker, index) => {
                        return openBlock(), createBlock(unref(_sfc_main$y), {
                          key: index,
                          settings: marker
                        }, {
                          default: withCtx(() => [
                            createVNode("div", { class: "marker" }, [
                              createVNode(_component_UIcon, {
                                size: "20",
                                name: getInfrastructureIcon(marker.properties?.type_id)
                              }, null, 8, ["name"])
                            ])
                          ]),
                          _: 2
                        }, 1032, ["settings"]);
                      }), 128)),
                      createVNode(unref(_sfc_main$n), { "hint-property": "hint" }, {
                        default: withCtx(({ content }) => [
                          createVNode("div", {
                            class: "hint",
                            innerHTML: content
                          }, null, 8, ["innerHTML"])
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div><div class="infrastructure-section" data-v-36d1bfef${_scopeId}><h3 data-v-36d1bfef${_scopeId}>Ближайшая инфраструктура</h3><div class="infrastructure-list" data-v-36d1bfef${_scopeId}><!--[-->`);
              ssrRenderList(getClosestInfrastructure(unref(offer)), (infra) => {
                _push2(`<div class="infrastructure-item" data-v-36d1bfef${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UIcon, {
                  size: "20",
                  name: getInfrastructureIcon(infra.infrastructure.infrastructure_type.id)
                }, null, _parent2, _scopeId));
                if (infra.infrastructure.name !== "unknown") {
                  _push2(`<div class="infra-info" data-v-36d1bfef${_scopeId}><span class="infra-type" data-v-36d1bfef${_scopeId}>${ssrInterpolate(infra.infrastructure.infrastructure_type.name)}</span><span class="infra-type font-semibold !text-black" data-v-36d1bfef${_scopeId}>${ssrInterpolate(infra.infrastructure.name)}</span></div>`);
                } else {
                  _push2(`<div class="infra-info" data-v-36d1bfef${_scopeId}><span class="infra-type" data-v-36d1bfef${_scopeId}>${ssrInterpolate(infra.infrastructure.infrastructure_type.name)}</span></div>`);
                }
                _push2(`<span class="infra-distance" data-v-36d1bfef${_scopeId}>${ssrInterpolate(infra.distance)} м</span></div>`);
              });
              _push2(`<!--]--></div></div></div><div class="flex-1" data-v-36d1bfef${_scopeId}><div class="sticky top-17" data-v-36d1bfef${_scopeId}><div class="contact-card rounded-lg ring ring-default" data-v-36d1bfef${_scopeId}><div class="price-section" data-v-36d1bfef${_scopeId}><div class="price" data-v-36d1bfef${_scopeId}><p class="flex gap-4 items-center" data-v-36d1bfef${_scopeId}>${ssrInterpolate(formatPrice(unref(offer).price))} ₽ `);
              _push2(ssrRenderComponent(_component_UBadge, {
                size: "lg",
                color: getPriceCategoryColor(unref(offer).price_category)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(getPriceCategoryLabel(unref(offer).price_category))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(getPriceCategoryLabel(unref(offer).price_category)), 1)
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</p><button class="${ssrRenderClass([{ active: isFavorite(unref(offer).id) }, "favorite-heart"])}" data-v-36d1bfef${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                size: "30",
                name: isFavorite(unref(offer).id) ? "material-symbols-light:favorite" : "material-symbols-light:favorite-outline",
                class: "heart-icon"
              }, null, _parent2, _scopeId));
              _push2(`</button></div><div class="price-per-meter" data-v-36d1bfef${_scopeId}><span data-v-36d1bfef${_scopeId}>Цена за метр:</span><span class="font-semibold !text-[#38a169]" data-v-36d1bfef${_scopeId}>${ssrInterpolate(formatPrice(unref(offer).price_per_square_meter))} ₽/м²</span></div></div><div class="contacts" data-v-36d1bfef${_scopeId}><h3 class="mt-2 mb-3" data-v-36d1bfef${_scopeId}>Контакты:</h3>`);
              if (unref(offer).contact_phone) {
                _push2(`<div class="phone-number" data-v-36d1bfef${_scopeId}>${ssrInterpolate(formatPhone(unref(offer).contact_phone))}</div>`);
              } else {
                _push2(`<div data-v-36d1bfef${_scopeId}>Временный номер, проверьте в источнике</div>`);
              }
              _push2(`<div class="seller-info" data-v-36d1bfef${_scopeId}><div class="seller-type" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).seller.seller_type.name)}</div><div class="seller-name" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).seller.name)}</div></div><div class="original-link" data-v-36d1bfef${_scopeId}>`);
              _push2(ssrRenderComponent(_component_UIcon, {
                size: "18",
                name: "i-heroicons-link"
              }, null, _parent2, _scopeId));
              _push2(`<a target="_blank"${ssrRenderAttr("href", unref(offer).url)} data-v-36d1bfef${_scopeId}>Источник</a></div></div></div>`);
              if (unref(offer).price_history.length > 1) {
                _push2(`<div class="price-history-section" data-v-36d1bfef${_scopeId}><h3 data-v-36d1bfef${_scopeId}>История цен</h3>`);
                if (priceChartOptions.value && priceChartSeries.value) {
                  _push2(`<div data-v-36d1bfef${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_apexchart, {
                    type: "line",
                    height: "328",
                    options: priceChartOptions.value,
                    series: priceChartSeries.value
                  }, null, _parent2, _scopeId));
                  _push2(`</div>`);
                } else {
                  _push2(`<div class="no-data" data-v-36d1bfef${_scopeId}>Нет данных по истории цен</div>`);
                }
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="views-section" data-v-36d1bfef${_scopeId}><h3 data-v-36d1bfef${_scopeId}>Статистика просмотров</h3><div class="views-stats" data-v-36d1bfef${_scopeId}><div class="stat-item" data-v-36d1bfef${_scopeId}><span class="stat-label" data-v-36d1bfef${_scopeId}>Всего:</span><span class="stat-value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).views_count)}</span></div><div class="stat-item" data-v-36d1bfef${_scopeId}><span class="stat-label" data-v-36d1bfef${_scopeId}>10 дней:</span><span class="stat-value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).last_ten_days_views_count)}</span></div><div class="stat-item" data-v-36d1bfef${_scopeId}><span class="stat-label" data-v-36d1bfef${_scopeId}>Сегодня:</span><span class="stat-value" data-v-36d1bfef${_scopeId}>${ssrInterpolate(unref(offer).daily_views_count)}</span></div></div></div>`);
              if (viewsChartOptions.value && viewsChartSeries.value) {
                _push2(`<div class="chart-container" data-v-36d1bfef${_scopeId}>`);
                _push2(ssrRenderComponent(_component_apexchart, {
                  type: "line",
                  height: "328",
                  options: viewsChartOptions.value,
                  series: viewsChartSeries.value
                }, null, _parent2, _scopeId));
                _push2(`</div>`);
              } else {
                _push2(`<div class="no-data" data-v-36d1bfef${_scopeId}>Нет данных по истории просмотров</div>`);
              }
              _push2(`</div></div></div></div>`);
            }
          } else {
            return [
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "flex justify-center items-center h-96"
              }, [
                createVNode(_component_UIcon, {
                  class: "size-10",
                  name: "codex:loader"
                })
              ])) : unref(error) ? (openBlock(), createBlock("div", {
                key: 1,
                class: "text-red-500"
              }, "Произошла ошибка при загрузке данных: " + toDisplayString(unref(error).message), 1)) : !unref(offer) ? (openBlock(), createBlock("div", {
                key: 2,
                class: "text-gray-500"
              }, "Объявление не найдено")) : (openBlock(), createBlock("div", {
                key: 3,
                class: "offer-content"
              }, [
                createVNode("div", null, [
                  createVNode("span", null, "Опубликовано: " + toDisplayString(new Date(unref(offer).creation_date_source).toLocaleString("ru-RU", {
                    timeZone: "Europe/Moscow",
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })), 1)
                ]),
                createVNode("div", { class: "flex gap-12 mb-15" }, [
                  createVNode("div", { class: "max-w-200" }, [
                    createVNode("div", null, [
                      createVNode("h1", { class: "text-4xl font-bold my-3 text-black" }, toDisplayString(unref(offer).title), 1)
                    ]),
                    createVNode("div", { class: "text-muted my-4" }, [
                      createTextVNode(toDisplayString(unref(offer).address.full_address) + " ", 1),
                      createVNode("a", {
                        class: "map-link",
                        onClick: ($event) => showOnMap(unref(offer))
                      }, "На карте", 8, ["onClick"])
                    ]),
                    createVNode("div", { class: "gallery-section" }, [
                      createVNode("div", { class: "flex-1 w-full" }, [
                        createVNode(_component_UCarousel, {
                          ref_key: "carousel",
                          ref: carousel,
                          arrows: "",
                          items: unref(offer).images_urls,
                          prev: { onClick: onClickPrev },
                          next: { onClick: onClickNext },
                          ui: {
                            controls: "absolute top-61 inset-x-17.5 opasity-0"
                          },
                          class: "w-full max-w-200 min-h-120 mx-auto border-2 border-[#e5e7eb]",
                          onSelect
                        }, {
                          default: withCtx(({ item }) => [
                            createVNode("img", {
                              src: item,
                              width: "2000",
                              height: "480",
                              class: "rounded-lg"
                            }, null, 8, ["src"])
                          ]),
                          _: 1
                        }, 8, ["items", "prev", "next"]),
                        createVNode("div", {
                          ref_key: "thumbsContainer",
                          ref: thumbsContainer,
                          class: "scrlbrwdthnn flex gap-3 max-w-200 overflow-x-auto whitespace-nowrap pt-4 mx-auto"
                        }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(offer).images_urls, (item, index) => {
                            return openBlock(), createBlock("div", {
                              key: index,
                              class: ["sas h-15 opacity-35 hover:opacity-100 transition-opacity", { "opacity-100": activeIndex.value === index }],
                              onClick: ($event) => select(index)
                            }, [
                              createVNode("img", {
                                src: item,
                                width: "78",
                                height: "100",
                                class: "rounded-lg"
                              }, null, 8, ["src"])
                            ], 10, ["onClick"]);
                          }), 128))
                        ], 512)
                      ])
                    ]),
                    createVNode("div", { class: "info-card" }, [
                      createVNode("h3", { class: "!mt-0" }, "Оценки"),
                      createVNode("div", { class: "categories-grid" }, [
                        createVNode("div", { class: "category-item" }, [
                          createVNode("span", { class: "category-label" }, "Для пожилых:"),
                          createVNode(_component_UBadge, {
                            size: "lg",
                            color: getCategoryColor(unref(offer).elderly_category)
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(getCategoryLabel(unref(offer).elderly_category)), 1)
                            ]),
                            _: 1
                          }, 8, ["color"])
                        ]),
                        createVNode("div", { class: "category-item" }, [
                          createVNode("span", { class: "category-label" }, "Для семьи:"),
                          createVNode(_component_UBadge, {
                            size: "lg",
                            color: getCategoryColor(unref(offer).family_category)
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(getCategoryLabel(unref(offer).family_category)), 1)
                            ]),
                            _: 1
                          }, 8, ["color"])
                        ]),
                        createVNode("div", { class: "category-item" }, [
                          createVNode("span", { class: "category-label" }, "Транспортная доступность:"),
                          createVNode(_component_UBadge, {
                            size: "lg",
                            color: getCategoryColor(unref(offer).transport_access_category)
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(getCategoryLabel(unref(offer).transport_access_category)), 1)
                            ]),
                            _: 1
                          }, 8, ["color"])
                        ])
                      ]),
                      createVNode("h3", { class: "!mb-0" }, "Описание"),
                      createVNode(_component_UAccordion, {
                        type: "multiple",
                        items: items.value,
                        "unmount-on-hide": false,
                        ui: {
                          trigger: "text-base whitespace-pre-line ",
                          body: "text-base  whitespace-pre-line "
                        }
                      }, {
                        body: withCtx(({ item }) => [
                          createVNode(_component_MDC, {
                            value: item.content
                          }, null, 8, ["value"])
                        ]),
                        _: 1
                      }, 8, ["items"]),
                      ["Квартира", "Апартаменты"].includes(unref(offer).property_type.name) ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "flex gap-10"
                      }, [
                        createVNode("div", { class: "flex-1" }, [
                          createVNode("h3", { class: "!mt-0" }, "О квартире"),
                          createVNode("div", { class: "info-grid" }, [
                            createVNode("div", { class: "info-item" }, [
                              createVNode("span", { class: "label" }, "Тип:"),
                              unref(offer).is_new_house ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "value"
                              }, "Новостройка")) : (openBlock(), createBlock("span", {
                                key: 1,
                                class: "value"
                              }, "Вторичка"))
                            ]),
                            unref(offer).rooms_count > 0 && unref(offer).rooms_count < 10 ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Кол-во комнат:"),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).rooms_count), 1)
                            ])) : createCommentVNode("", true),
                            createVNode("div", { class: "info-item" }, [
                              createVNode("span", { class: "label" }, "Общая площадь:"),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).total_area) + " м²", 1)
                            ]),
                            unref(offer).living_area ? (openBlock(), createBlock("div", {
                              key: 1,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Жилая площадь:"),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).living_area) + " м²", 1)
                            ])) : createCommentVNode("", true),
                            unref(offer).kitchen_area ? (openBlock(), createBlock("div", {
                              key: 2,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Площадь кухни:"),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).kitchen_area) + " м²", 1)
                            ])) : createCommentVNode("", true),
                            unref(offer).ceiling_height ? (openBlock(), createBlock("div", {
                              key: 3,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Высота потолков:"),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).ceiling_height) + " м", 1)
                            ])) : createCommentVNode("", true),
                            unref(offer).bathrooms_count ? (openBlock(), createBlock("div", {
                              key: 4,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Кол-во санузлов:"),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).bathrooms_count) + " " + toDisplayString(unref(offer).bathroom_type?.name), 1)
                            ])) : createCommentVNode("", true),
                            unref(offer).has_balcony ? (openBlock(), createBlock("div", {
                              key: 5,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Балкон"),
                              createVNode("span", { class: "value" }, "Есть")
                            ])) : createCommentVNode("", true),
                            unref(offer).floor ? (openBlock(), createBlock("div", {
                              key: 6,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Этаж:"),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).floor), 1)
                            ])) : createCommentVNode("", true),
                            unref(offer).window_view_type ? (openBlock(), createBlock("div", {
                              key: 7,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Вид из окон:"),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).window_view_type?.name), 1)
                            ])) : createCommentVNode("", true),
                            unref(offer).renovation_type ? (openBlock(), createBlock("div", {
                              key: 8,
                              class: "info-item"
                            }, [
                              unref(offer).is_new_house ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "label"
                              }, "Отделка:")) : (openBlock(), createBlock("span", {
                                key: 1,
                                class: "label"
                              }, "Ремонт:")),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).renovation_type?.name), 1)
                            ])) : createCommentVNode("", true)
                          ])
                        ]),
                        createVNode("div", { class: "flex-1" }, [
                          createVNode("h3", { class: "!mt-0" }, "О доме"),
                          createVNode("div", { class: "info-grid" }, [
                            unref(offer).house_built_year ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Год постройки:"),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).house_built_year), 1)
                            ])) : createCommentVNode("", true),
                            unref(offer).house_floors_count ? (openBlock(), createBlock("div", {
                              key: 1,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Кол-во этажей:"),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).house_floors_count), 1)
                            ])) : createCommentVNode("", true),
                            unref(offer).elevators_count ? (openBlock(), createBlock("div", {
                              key: 2,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Кол-во лифтов:"),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).elevators_count), 1)
                            ])) : createCommentVNode("", true),
                            unref(offer).house_material_type ? (openBlock(), createBlock("div", {
                              key: 3,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Тип дома:"),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).house_material_type?.name), 1)
                            ])) : createCommentVNode("", true),
                            unref(offer).heating_type ? (openBlock(), createBlock("div", {
                              key: 4,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Отопление:"),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).heating_type?.name), 1)
                            ])) : createCommentVNode("", true),
                            unref(offer).parking_type ? (openBlock(), createBlock("div", {
                              key: 5,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Парковка:"),
                              createVNode("span", { class: "value" }, toDisplayString(unref(offer).parking_type?.name), 1)
                            ])) : createCommentVNode("", true),
                            unref(offer).has_garbage_chute ? (openBlock(), createBlock("div", {
                              key: 6,
                              class: "info-item"
                            }, [
                              createVNode("span", { class: "label" }, "Мусоропровод:"),
                              createVNode("span", { class: "value" }, "Есть")
                            ])) : createCommentVNode("", true)
                          ])
                        ])
                      ])) : (openBlock(), createBlock("div", { key: 1 }, [
                        createVNode("div", { class: "flex gap-10" }, [
                          createVNode("div", { class: "flex-1" }, [
                            createVNode("h3", { class: "!mt-0" }, "О доме"),
                            createVNode("div", { class: "info-grid" }, [
                              createVNode("div", { class: "info-item" }, [
                                createVNode("span", { class: "label" }, "Площадь:"),
                                createVNode("span", { class: "value" }, toDisplayString(unref(offer).total_area) + " м²", 1)
                              ]),
                              unref(offer).house_material_type ? (openBlock(), createBlock("div", {
                                key: 0,
                                class: "info-item"
                              }, [
                                createVNode("span", { class: "label" }, "Материал дома:"),
                                createVNode("span", { class: "value" }, toDisplayString(unref(offer).house_material_type?.name), 1)
                              ])) : createCommentVNode("", true),
                              unref(offer).house_floors_count ? (openBlock(), createBlock("div", {
                                key: 1,
                                class: "info-item"
                              }, [
                                createVNode("span", { class: "label" }, "Кол-во этажей:"),
                                createVNode("span", { class: "value" }, toDisplayString(unref(offer).house_floors_count), 1)
                              ])) : createCommentVNode("", true),
                              unref(offer).bedrooms_count ? (openBlock(), createBlock("div", {
                                key: 2,
                                class: "info-item"
                              }, [
                                createVNode("span", { class: "label" }, "Кол-во спален:"),
                                createVNode("span", { class: "value" }, toDisplayString(unref(offer).bedrooms_count), 1)
                              ])) : createCommentVNode("", true),
                              unref(offer).house_built_year ? (openBlock(), createBlock("div", {
                                key: 3,
                                class: "info-item"
                              }, [
                                createVNode("span", { class: "label" }, "Год постройки:"),
                                createVNode("span", { class: "value" }, toDisplayString(unref(offer).house_built_year), 1)
                              ])) : createCommentVNode("", true)
                            ])
                          ]),
                          createVNode("div", { class: "flex-1" }, [
                            createVNode("h3", { class: "!mt-0" }, "Об участке"),
                            createVNode("div", { class: "info-grid" }, [
                              unref(offer).land_area ? (openBlock(), createBlock("div", {
                                key: 0,
                                class: "info-item"
                              }, [
                                createVNode("span", { class: "label" }, "Площадь"),
                                createVNode("span", { class: "value" }, toDisplayString(unref(offer).land_area) + " сот.", 1)
                              ])) : createCommentVNode("", true),
                              unref(offer).land_type ? (openBlock(), createBlock("div", {
                                key: 1,
                                class: "info-item"
                              }, [
                                createVNode("span", { class: "label" }, "Статус участка"),
                                createVNode("span", { class: "value" }, toDisplayString(unref(offer).land_type?.name), 1)
                              ])) : createCommentVNode("", true)
                            ])
                          ])
                        ]),
                        createVNode("h3", null, "Коммуникации и удобства"),
                        createVNode("div", { class: "info-grid" }, [
                          unref(offer).bathrooms_count ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "info-item"
                          }, [
                            createVNode("span", { class: "label" }, "Кол-во санузлов:"),
                            createVNode("span", { class: "value" }, toDisplayString(unref(offer).bathrooms_count) + " " + toDisplayString(unref(offer).bathroom_type?.name?.toLowerCase()), 1)
                          ])) : createCommentVNode("", true),
                          unref(offer).sewerage_type ? (openBlock(), createBlock("div", {
                            key: 1,
                            class: "info-item"
                          }, [
                            createVNode("span", { class: "label" }, "Канализация"),
                            createVNode("span", { class: "value" }, toDisplayString(unref(offer).sewerage_type?.name), 1)
                          ])) : createCommentVNode("", true),
                          unref(offer).water_supply_type ? (openBlock(), createBlock("div", {
                            key: 2,
                            class: "info-item"
                          }, [
                            createVNode("span", { class: "label" }, "Водоснабжение"),
                            createVNode("span", { class: "value" }, toDisplayString(unref(offer).water_supply_type?.name), 1)
                          ])) : createCommentVNode("", true),
                          unref(offer).heating_type ? (openBlock(), createBlock("div", {
                            key: 3,
                            class: "info-item"
                          }, [
                            createVNode("span", { class: "label" }, "Отопление"),
                            createVNode("span", { class: "value" }, toDisplayString(unref(offer).heating_type?.name), 1)
                          ])) : createCommentVNode("", true),
                          unref(offer).has_electricity ? (openBlock(), createBlock("div", {
                            key: 4,
                            class: "info-item"
                          }, [
                            createVNode("span", { class: "label" }, "Электричество"),
                            createVNode("span", { class: "value" }, "Есть")
                          ])) : createCommentVNode("", true),
                          unref(offer).gas_type ? (openBlock(), createBlock("div", {
                            key: 5,
                            class: "info-item"
                          }, [
                            createVNode("span", { class: "label" }, "Газ"),
                            createVNode("span", { class: "value" }, toDisplayString(unref(offer).gas_type?.name), 1)
                          ])) : createCommentVNode("", true),
                          unref(offer).has_garage || unref(offer).has_terrace || unref(offer).has_bathhouse || unref(offer).has_pool ? (openBlock(), createBlock("div", {
                            key: 6,
                            class: "info-item !items-start"
                          }, [
                            createVNode("span", { class: "label" }, "Дополнительно"),
                            createVNode("div", { class: "flex flex-col gap-1" }, [
                              unref(offer).has_garage ? (openBlock(), createBlock("span", {
                                key: 0,
                                class: "value"
                              }, "Гараж")) : createCommentVNode("", true),
                              unref(offer).has_terrace ? (openBlock(), createBlock("span", {
                                key: 1,
                                class: "value"
                              }, "Терраса")) : createCommentVNode("", true),
                              unref(offer).has_bathhouse ? (openBlock(), createBlock("span", {
                                key: 2,
                                class: "value"
                              }, "Баня")) : createCommentVNode("", true),
                              unref(offer).has_pool ? (openBlock(), createBlock("span", {
                                key: 3,
                                class: "value"
                              }, "Бассейн")) : createCommentVNode("", true)
                            ])
                          ])) : createCommentVNode("", true)
                        ])
                      ]))
                    ]),
                    createVNode("div", { class: "map-placeholder" }, [
                      createVNode("h3", null, "Расположение"),
                      createVNode(unref(_sfc_main$G), {
                        modelValue: map.value,
                        "onUpdate:modelValue": ($event) => map.value = $event,
                        "real-settings-location": "",
                        settings: {
                          location: {
                            ...LOCATION.value,
                            duration: 2500
                          },
                          camera: camera.value,
                          showScaleInCopyrights: true
                        },
                        width: "100%",
                        height: "500px"
                      }, {
                        default: withCtx(() => [
                          createVNode(unref(_sfc_main$D)),
                          createVNode(unref(_sfc_main$E)),
                          createVNode(unref(_sfc_main$y), {
                            settings: { coordinates: unref(offer).address.coordinates_list }
                          }, {
                            default: withCtx(() => [
                              createVNode("div", { class: "house-marker" }, [
                                (openBlock(), createBlock("svg", {
                                  class: "marker-svg",
                                  "data-name": "Pin",
                                  width: "54",
                                  height: "54",
                                  viewBox: "0 0 54 54",
                                  fill: "none",
                                  xmlns: "http://www.w3.org/2000/svg"
                                }, [
                                  createVNode("path", { d: "M27 0C16.507 0 8 8.507 8 19C8 30.6644 19.5164 38.5163 27 46C34.4076 38.5197 46 30.622 46 19C46 8.507 37.493 0 27 0Z" }),
                                  createVNode("path", {
                                    "fill-rule": "evenodd",
                                    "clip-rule": "evenodd",
                                    d: "M27 33C34.7317 33 41 26.7317 41 19C41 11.2683 34.7317 5 27 5C19.2683 5 13 11.2683 13 19C13 26.7317 19.2683 33 27 33Z",
                                    fill: "white"
                                  }),
                                  createVNode("path", {
                                    "fill-rule": "evenodd",
                                    "clip-rule": "evenodd",
                                    d: "M33.4665 19.5633V12.2365H30.2323V15.6778L27.0001 11.7947L18 22.6071L20.9939 25.099L27.0001 17.8834L33.0061 25.099L36 22.6071L33.4665 19.5633Z"
                                  }),
                                  createVNode("circle", {
                                    cx: "27",
                                    cy: "50",
                                    r: "3",
                                    fill: "white"
                                  }),
                                  createVNode("circle", {
                                    cx: "27",
                                    cy: "50",
                                    r: "2"
                                  })
                                ]))
                              ])
                            ]),
                            _: 1
                          }, 8, ["settings"]),
                          (openBlock(true), createBlock(Fragment, null, renderList(markers.value, (marker, index) => {
                            return openBlock(), createBlock(unref(_sfc_main$y), {
                              key: index,
                              settings: marker
                            }, {
                              default: withCtx(() => [
                                createVNode("div", { class: "marker" }, [
                                  createVNode(_component_UIcon, {
                                    size: "20",
                                    name: getInfrastructureIcon(marker.properties?.type_id)
                                  }, null, 8, ["name"])
                                ])
                              ]),
                              _: 2
                            }, 1032, ["settings"]);
                          }), 128)),
                          createVNode(unref(_sfc_main$n), { "hint-property": "hint" }, {
                            default: withCtx(({ content }) => [
                              createVNode("div", {
                                class: "hint",
                                innerHTML: content
                              }, null, 8, ["innerHTML"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue", "settings"])
                    ]),
                    createVNode("div", { class: "infrastructure-section" }, [
                      createVNode("h3", null, "Ближайшая инфраструктура"),
                      createVNode("div", { class: "infrastructure-list" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(getClosestInfrastructure(unref(offer)), (infra) => {
                          return openBlock(), createBlock("div", {
                            onClick: ($event) => [
                              LOCATION.value = {
                                center: infra.infrastructure.coordinates_list,
                                zoom: 20
                              }
                            ],
                            key: infra.infrastructure.id,
                            class: "infrastructure-item"
                          }, [
                            createVNode(_component_UIcon, {
                              size: "20",
                              name: getInfrastructureIcon(infra.infrastructure.infrastructure_type.id)
                            }, null, 8, ["name"]),
                            infra.infrastructure.name !== "unknown" ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "infra-info"
                            }, [
                              createVNode("span", { class: "infra-type" }, toDisplayString(infra.infrastructure.infrastructure_type.name), 1),
                              createVNode("span", { class: "infra-type font-semibold !text-black" }, toDisplayString(infra.infrastructure.name), 1)
                            ])) : (openBlock(), createBlock("div", {
                              key: 1,
                              class: "infra-info"
                            }, [
                              createVNode("span", { class: "infra-type" }, toDisplayString(infra.infrastructure.infrastructure_type.name), 1)
                            ])),
                            createVNode("span", { class: "infra-distance" }, toDisplayString(infra.distance) + " м", 1)
                          ], 8, ["onClick"]);
                        }), 128))
                      ])
                    ])
                  ]),
                  createVNode("div", { class: "flex-1" }, [
                    createVNode("div", { class: "sticky top-17" }, [
                      createVNode("div", { class: "contact-card rounded-lg ring ring-default" }, [
                        createVNode("div", { class: "price-section" }, [
                          createVNode("div", { class: "price" }, [
                            createVNode("p", { class: "flex gap-4 items-center" }, [
                              createTextVNode(toDisplayString(formatPrice(unref(offer).price)) + " ₽ ", 1),
                              createVNode(_component_UBadge, {
                                size: "lg",
                                color: getPriceCategoryColor(unref(offer).price_category)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(getPriceCategoryLabel(unref(offer).price_category)), 1)
                                ]),
                                _: 1
                              }, 8, ["color"])
                            ]),
                            createVNode("button", {
                              class: ["favorite-heart", { active: isFavorite(unref(offer).id) }],
                              onClick: withModifiers(($event) => toggleFavorite(unref(offer)), ["stop"])
                            }, [
                              createVNode(_component_UIcon, {
                                size: "30",
                                name: isFavorite(unref(offer).id) ? "material-symbols-light:favorite" : "material-symbols-light:favorite-outline",
                                class: "heart-icon"
                              }, null, 8, ["name"])
                            ], 10, ["onClick"])
                          ]),
                          createVNode("div", { class: "price-per-meter" }, [
                            createVNode("span", null, "Цена за метр:"),
                            createVNode("span", { class: "font-semibold !text-[#38a169]" }, toDisplayString(formatPrice(unref(offer).price_per_square_meter)) + " ₽/м²", 1)
                          ])
                        ]),
                        createVNode("div", { class: "contacts" }, [
                          createVNode("h3", { class: "mt-2 mb-3" }, "Контакты:"),
                          unref(offer).contact_phone ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "phone-number"
                          }, toDisplayString(formatPhone(unref(offer).contact_phone)), 1)) : (openBlock(), createBlock("div", { key: 1 }, "Временный номер, проверьте в источнике")),
                          createVNode("div", { class: "seller-info" }, [
                            createVNode("div", { class: "seller-type" }, toDisplayString(unref(offer).seller.seller_type.name), 1),
                            createVNode("div", { class: "seller-name" }, toDisplayString(unref(offer).seller.name), 1)
                          ]),
                          createVNode("div", { class: "original-link" }, [
                            createVNode(_component_UIcon, {
                              size: "18",
                              name: "i-heroicons-link"
                            }),
                            createVNode("a", {
                              target: "_blank",
                              href: unref(offer).url
                            }, "Источник", 8, ["href"])
                          ])
                        ])
                      ]),
                      unref(offer).price_history.length > 1 ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "price-history-section"
                      }, [
                        createVNode("h3", null, "История цен"),
                        priceChartOptions.value && priceChartSeries.value ? (openBlock(), createBlock("div", { key: 0 }, [
                          createVNode(_component_apexchart, {
                            type: "line",
                            height: "328",
                            options: priceChartOptions.value,
                            series: priceChartSeries.value
                          }, null, 8, ["options", "series"])
                        ])) : (openBlock(), createBlock("div", {
                          key: 1,
                          class: "no-data"
                        }, "Нет данных по истории цен"))
                      ])) : createCommentVNode("", true),
                      createVNode("div", { class: "views-section" }, [
                        createVNode("h3", null, "Статистика просмотров"),
                        createVNode("div", { class: "views-stats" }, [
                          createVNode("div", { class: "stat-item" }, [
                            createVNode("span", { class: "stat-label" }, "Всего:"),
                            createVNode("span", { class: "stat-value" }, toDisplayString(unref(offer).views_count), 1)
                          ]),
                          createVNode("div", { class: "stat-item" }, [
                            createVNode("span", { class: "stat-label" }, "10 дней:"),
                            createVNode("span", { class: "stat-value" }, toDisplayString(unref(offer).last_ten_days_views_count), 1)
                          ]),
                          createVNode("div", { class: "stat-item" }, [
                            createVNode("span", { class: "stat-label" }, "Сегодня:"),
                            createVNode("span", { class: "stat-value" }, toDisplayString(unref(offer).daily_views_count), 1)
                          ])
                        ])
                      ]),
                      viewsChartOptions.value && viewsChartSeries.value ? (openBlock(), createBlock("div", {
                        key: 1,
                        class: "chart-container"
                      }, [
                        createVNode(_component_apexchart, {
                          type: "line",
                          height: "328",
                          options: viewsChartOptions.value,
                          series: viewsChartSeries.value
                        }, null, 8, ["options", "series"])
                      ])) : (openBlock(), createBlock("div", {
                        key: 2,
                        class: "no-data"
                      }, "Нет данных по истории просмотров"))
                    ])
                  ])
                ])
              ]))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/offers/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-36d1bfef"]]);
const _id_$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _id_
}, Symbol.toStringTag, { value: "Module" }));

export { _id_$1 as _, htmlTags as h };
//# sourceMappingURL=_id_-ma23IRGa.mjs.map
