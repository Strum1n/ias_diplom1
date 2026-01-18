import { _ as _sfc_main$4 } from './Container-B_7exVp7.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-DYDQwZUP.mjs';
import { _ as _sfc_main$5 } from './Icon-DX0OfCis.mjs';
import { defineComponent, computed, ref, unref, withCtx, createVNode, createTextVNode, createBlock, openBlock, Fragment, toDisplayString, useSlots, toRef, mergeProps, resolveDynamicComponent, renderSlot, createCommentVNode, withModifiers, renderList, toHandlers, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderSlot, ssrRenderClass, ssrRenderVNode, ssrRenderList } from 'vue/server-renderer';
import { useForwardPropsEmits, AccordionTrigger, AccordionItem, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuContent, AccordionContent, AccordionRoot, NavigationMenuRoot, NavigationMenuList, NavigationMenuIndicator, NavigationMenuViewport, TooltipRoot, TooltipTrigger, TooltipPortal, TooltipContent, TooltipArrow } from 'reka-ui';
import { R as defu } from '../_/nitro.mjs';
import { reactivePick, createReusableTemplate } from '@vueuse/core';
import { i as isArrayOfArray, g as get } from './index-CED3XvSe.mjs';
import { t as tv } from './tv-sfLME4AL.mjs';
import { _ as _sfc_main$9, p as pickLinkProps, a as _sfc_main$1$1 } from './Link-gmgU2Miy.mjs';
import { _ as _sfc_main$7 } from './Avatar-Bz_JyLmu.mjs';
import { _ as _sfc_main$8 } from './Badge-DNgMi0Nd.mjs';
import { HoverCard, Popover } from 'reka-ui/namespaced';
import { u as usePortal } from './usePortal-5Oa56NQY.mjs';
import { _ as _export_sfc, e as useRoute, d as useAuth, n as navigateTo, b as useAppConfig } from './server.mjs';
import { _ as _sfc_main$a } from './Kbd-iqddFVmC.mjs';
import { _ as _sfc_main$6 } from './Button-BL6TDcLa.mjs';
import { jwtDecode } from 'jwt-decode';
import './index-gA-qUlDT.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import './asyncData-DVeqSZBv.mjs';
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
import 'vue-router';
import 'tailwindcss/colors';
import 'tailwind-variants';
import './virtual_nuxt_G__My_Programs_ias_diplom1_app_frontend_nuxt-app_node_modules_.cache_nuxt_.nuxt_ui-image-component-CX5_T5UE.mjs';
import './useFormField-C7CorFZK.mjs';

const theme$2 = {
  "slots": {
    "content": "bg-default shadow-lg rounded-md ring ring-default data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-popover-content-transform-origin) focus:outline-none pointer-events-auto",
    "arrow": "fill-default"
  }
};
const _sfc_main$3 = {
  __name: "UPopover",
  __ssrInlineRender: true,
  props: {
    mode: { type: null, required: false, default: "click" },
    content: { type: Object, required: false },
    arrow: { type: [Boolean, Object], required: false },
    portal: { type: [Boolean, String], required: false, skipCheck: true, default: true },
    reference: { type: null, required: false },
    dismissible: { type: Boolean, required: false, default: true },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    defaultOpen: { type: Boolean, required: false },
    open: { type: Boolean, required: false },
    modal: { type: Boolean, required: false },
    openDelay: { type: Number, required: false, default: 0 },
    closeDelay: { type: Number, required: false, default: 0 }
  },
  emits: ["close:prevent", "update:open"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const pick = props.mode === "hover" ? reactivePick(props, "defaultOpen", "open", "openDelay", "closeDelay") : reactivePick(props, "defaultOpen", "open", "modal");
    const rootProps = useForwardPropsEmits(pick, emits);
    const portalProps = usePortal(toRef(() => props.portal));
    const contentProps = toRef(() => defu(props.content, { side: "bottom", sideOffset: 8, collisionPadding: 8 }));
    const contentEvents = computed(() => {
      if (!props.dismissible) {
        const events = ["pointerDownOutside", "interactOutside", "escapeKeyDown"];
        return events.reduce((acc, curr) => {
          acc[curr] = (e) => {
            e.preventDefault();
            emits("close:prevent");
          };
          return acc;
        }, {});
      }
      return {};
    });
    const arrowProps = toRef(() => props.arrow);
    const ui = computed(() => tv({ extend: tv(theme$2), ...appConfig.ui?.popover || {} })({
      side: contentProps.value.side
    }));
    const Component = computed(() => props.mode === "hover" ? HoverCard : Popover);
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(Component).Root, mergeProps(unref(rootProps), _attrs), {
        default: withCtx(({ open, close }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (!!slots.default || !!__props.reference) {
              _push2(ssrRenderComponent(unref(Component).Trigger, {
                "as-child": "",
                reference: __props.reference,
                class: props.class
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    ssrRenderSlot(_ctx.$slots, "default", { open }, null, _push3, _parent3, _scopeId2);
                  } else {
                    return [
                      renderSlot(_ctx.$slots, "default", { open })
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            if ("Anchor" in Component.value && !!slots.anchor) {
              _push2(ssrRenderComponent(unref(Component).Anchor, { "as-child": "" }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    ssrRenderSlot(_ctx.$slots, "anchor", close ? { close } : {}, null, _push3, _parent3, _scopeId2);
                  } else {
                    return [
                      renderSlot(_ctx.$slots, "anchor", close ? { close } : {})
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(unref(Component).Portal, unref(portalProps), {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(Component).Content, mergeProps(contentProps.value, {
                    "data-slot": "content",
                    class: ui.value.content({ class: [!slots.default && props.class, props.ui?.content] })
                  }, toHandlers(contentEvents.value)), {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        ssrRenderSlot(_ctx.$slots, "content", close ? { close } : {}, null, _push4, _parent4, _scopeId3);
                        if (!!__props.arrow) {
                          _push4(ssrRenderComponent(unref(Component).Arrow, mergeProps(arrowProps.value, {
                            "data-slot": "arrow",
                            class: ui.value.arrow({ class: props.ui?.arrow })
                          }), null, _parent4, _scopeId3));
                        } else {
                          _push4(`<!---->`);
                        }
                      } else {
                        return [
                          renderSlot(_ctx.$slots, "content", close ? { close } : {}),
                          !!__props.arrow ? (openBlock(), createBlock(unref(Component).Arrow, mergeProps({ key: 0 }, arrowProps.value, {
                            "data-slot": "arrow",
                            class: ui.value.arrow({ class: props.ui?.arrow })
                          }), null, 16, ["class"])) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(Component).Content, mergeProps(contentProps.value, {
                      "data-slot": "content",
                      class: ui.value.content({ class: [!slots.default && props.class, props.ui?.content] })
                    }, toHandlers(contentEvents.value)), {
                      default: withCtx(() => [
                        renderSlot(_ctx.$slots, "content", close ? { close } : {}),
                        !!__props.arrow ? (openBlock(), createBlock(unref(Component).Arrow, mergeProps({ key: 0 }, arrowProps.value, {
                          "data-slot": "arrow",
                          class: ui.value.arrow({ class: props.ui?.arrow })
                        }), null, 16, ["class"])) : createCommentVNode("", true)
                      ]),
                      _: 2
                    }, 1040, ["class"])
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
          } else {
            return [
              !!slots.default || !!__props.reference ? (openBlock(), createBlock(unref(Component).Trigger, {
                key: 0,
                "as-child": "",
                reference: __props.reference,
                class: props.class
              }, {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "default", { open })
                ]),
                _: 2
              }, 1032, ["reference", "class"])) : createCommentVNode("", true),
              "Anchor" in Component.value && !!slots.anchor ? (openBlock(), createBlock(unref(Component).Anchor, {
                key: 1,
                "as-child": ""
              }, {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "anchor", close ? { close } : {})
                ]),
                _: 2
              }, 1024)) : createCommentVNode("", true),
              createVNode(unref(Component).Portal, unref(portalProps), {
                default: withCtx(() => [
                  createVNode(unref(Component).Content, mergeProps(contentProps.value, {
                    "data-slot": "content",
                    class: ui.value.content({ class: [!slots.default && props.class, props.ui?.content] })
                  }, toHandlers(contentEvents.value)), {
                    default: withCtx(() => [
                      renderSlot(_ctx.$slots, "content", close ? { close } : {}),
                      !!__props.arrow ? (openBlock(), createBlock(unref(Component).Arrow, mergeProps({ key: 0 }, arrowProps.value, {
                        "data-slot": "arrow",
                        class: ui.value.arrow({ class: props.ui?.arrow })
                      }), null, 16, ["class"])) : createCommentVNode("", true)
                    ]),
                    _: 2
                  }, 1040, ["class"])
                ]),
                _: 2
              }, 1040)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/Popover.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const theme$1 = {
  "slots": {
    "content": "flex items-center gap-1 bg-default text-highlighted shadow-sm rounded-sm ring ring-default h-6 px-2.5 py-1 text-xs select-none data-[state=delayed-open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-tooltip-content-transform-origin) pointer-events-auto",
    "arrow": "fill-default",
    "text": "truncate",
    "kbds": "hidden lg:inline-flex items-center shrink-0 gap-0.5 not-first-of-type:before:content-['·'] not-first-of-type:before:me-0.5",
    "kbdsSize": "sm"
  }
};
const _sfc_main$2 = {
  __name: "UTooltip",
  __ssrInlineRender: true,
  props: {
    text: { type: String, required: false },
    kbds: { type: Array, required: false },
    content: { type: Object, required: false },
    arrow: { type: [Boolean, Object], required: false },
    portal: { type: [Boolean, String], required: false, skipCheck: true, default: true },
    reference: { type: null, required: false },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    defaultOpen: { type: Boolean, required: false },
    open: { type: Boolean, required: false },
    delayDuration: { type: Number, required: false },
    disableHoverableContent: { type: Boolean, required: false },
    disableClosingTrigger: { type: Boolean, required: false },
    disabled: { type: Boolean, required: false },
    ignoreNonKeyboardFocus: { type: Boolean, required: false }
  },
  emits: ["update:open"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const rootProps = useForwardPropsEmits(reactivePick(props, "defaultOpen", "open", "delayDuration", "disableHoverableContent", "disableClosingTrigger", "ignoreNonKeyboardFocus"), emits);
    const portalProps = usePortal(toRef(() => props.portal));
    const contentProps = toRef(() => defu(props.content, { side: "bottom", sideOffset: 8, collisionPadding: 8 }));
    const arrowProps = toRef(() => props.arrow);
    const ui = computed(() => tv({ extend: tv(theme$1), ...appConfig.ui?.tooltip || {} })({
      side: contentProps.value.side
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(TooltipRoot), mergeProps(unref(rootProps), {
        disabled: !(__props.text || __props.kbds?.length || !!slots.content) || props.disabled
      }, _attrs), {
        default: withCtx(({ open }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (!!slots.default || !!__props.reference) {
              _push2(ssrRenderComponent(unref(TooltipTrigger), mergeProps(_ctx.$attrs, {
                "as-child": "",
                reference: __props.reference,
                class: props.class
              }), {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    ssrRenderSlot(_ctx.$slots, "default", { open }, null, _push3, _parent3, _scopeId2);
                  } else {
                    return [
                      renderSlot(_ctx.$slots, "default", { open })
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(unref(TooltipPortal), unref(portalProps), {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(TooltipContent), mergeProps(contentProps.value, {
                    "data-slot": "content",
                    class: ui.value.content({ class: [!slots.default && props.class, props.ui?.content] })
                  }), {
                    default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        ssrRenderSlot(_ctx.$slots, "content", { ui: ui.value }, () => {
                          if (__props.text) {
                            _push4(`<span data-slot="text" class="${ssrRenderClass(ui.value.text({ class: props.ui?.text }))}"${_scopeId3}>${ssrInterpolate(__props.text)}</span>`);
                          } else {
                            _push4(`<!---->`);
                          }
                          if (__props.kbds?.length) {
                            _push4(`<span data-slot="kbds" class="${ssrRenderClass(ui.value.kbds({ class: props.ui?.kbds }))}"${_scopeId3}><!--[-->`);
                            ssrRenderList(__props.kbds, (kbd, index) => {
                              _push4(ssrRenderComponent(_sfc_main$a, mergeProps({
                                key: index,
                                size: props.ui?.kbdsSize || ui.value.kbdsSize()
                              }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, _parent4, _scopeId3));
                            });
                            _push4(`<!--]--></span>`);
                          } else {
                            _push4(`<!---->`);
                          }
                        }, _push4, _parent4, _scopeId3);
                        if (!!__props.arrow) {
                          _push4(ssrRenderComponent(unref(TooltipArrow), mergeProps(arrowProps.value, {
                            "data-slot": "arrow",
                            class: ui.value.arrow({ class: props.ui?.arrow })
                          }), null, _parent4, _scopeId3));
                        } else {
                          _push4(`<!---->`);
                        }
                      } else {
                        return [
                          renderSlot(_ctx.$slots, "content", { ui: ui.value }, () => [
                            __props.text ? (openBlock(), createBlock("span", {
                              key: 0,
                              "data-slot": "text",
                              class: ui.value.text({ class: props.ui?.text })
                            }, toDisplayString(__props.text), 3)) : createCommentVNode("", true),
                            __props.kbds?.length ? (openBlock(), createBlock("span", {
                              key: 1,
                              "data-slot": "kbds",
                              class: ui.value.kbds({ class: props.ui?.kbds })
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(__props.kbds, (kbd, index) => {
                                return openBlock(), createBlock(_sfc_main$a, mergeProps({
                                  key: index,
                                  size: props.ui?.kbdsSize || ui.value.kbdsSize()
                                }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                              }), 128))
                            ], 2)) : createCommentVNode("", true)
                          ]),
                          !!__props.arrow ? (openBlock(), createBlock(unref(TooltipArrow), mergeProps({ key: 0 }, arrowProps.value, {
                            "data-slot": "arrow",
                            class: ui.value.arrow({ class: props.ui?.arrow })
                          }), null, 16, ["class"])) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(unref(TooltipContent), mergeProps(contentProps.value, {
                      "data-slot": "content",
                      class: ui.value.content({ class: [!slots.default && props.class, props.ui?.content] })
                    }), {
                      default: withCtx(() => [
                        renderSlot(_ctx.$slots, "content", { ui: ui.value }, () => [
                          __props.text ? (openBlock(), createBlock("span", {
                            key: 0,
                            "data-slot": "text",
                            class: ui.value.text({ class: props.ui?.text })
                          }, toDisplayString(__props.text), 3)) : createCommentVNode("", true),
                          __props.kbds?.length ? (openBlock(), createBlock("span", {
                            key: 1,
                            "data-slot": "kbds",
                            class: ui.value.kbds({ class: props.ui?.kbds })
                          }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(__props.kbds, (kbd, index) => {
                              return openBlock(), createBlock(_sfc_main$a, mergeProps({
                                key: index,
                                size: props.ui?.kbdsSize || ui.value.kbdsSize()
                              }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                            }), 128))
                          ], 2)) : createCommentVNode("", true)
                        ]),
                        !!__props.arrow ? (openBlock(), createBlock(unref(TooltipArrow), mergeProps({ key: 0 }, arrowProps.value, {
                          "data-slot": "arrow",
                          class: ui.value.arrow({ class: props.ui?.arrow })
                        }), null, 16, ["class"])) : createCommentVNode("", true)
                      ]),
                      _: 3
                    }, 16, ["class"])
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
          } else {
            return [
              !!slots.default || !!__props.reference ? (openBlock(), createBlock(unref(TooltipTrigger), mergeProps({ key: 0 }, _ctx.$attrs, {
                "as-child": "",
                reference: __props.reference,
                class: props.class
              }), {
                default: withCtx(() => [
                  renderSlot(_ctx.$slots, "default", { open })
                ]),
                _: 2
              }, 1040, ["reference", "class"])) : createCommentVNode("", true),
              createVNode(unref(TooltipPortal), unref(portalProps), {
                default: withCtx(() => [
                  createVNode(unref(TooltipContent), mergeProps(contentProps.value, {
                    "data-slot": "content",
                    class: ui.value.content({ class: [!slots.default && props.class, props.ui?.content] })
                  }), {
                    default: withCtx(() => [
                      renderSlot(_ctx.$slots, "content", { ui: ui.value }, () => [
                        __props.text ? (openBlock(), createBlock("span", {
                          key: 0,
                          "data-slot": "text",
                          class: ui.value.text({ class: props.ui?.text })
                        }, toDisplayString(__props.text), 3)) : createCommentVNode("", true),
                        __props.kbds?.length ? (openBlock(), createBlock("span", {
                          key: 1,
                          "data-slot": "kbds",
                          class: ui.value.kbds({ class: props.ui?.kbds })
                        }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(__props.kbds, (kbd, index) => {
                            return openBlock(), createBlock(_sfc_main$a, mergeProps({
                              key: index,
                              size: props.ui?.kbdsSize || ui.value.kbdsSize()
                            }, { ref_for: true }, typeof kbd === "string" ? { value: kbd } : kbd), null, 16, ["size"]);
                          }), 128))
                        ], 2)) : createCommentVNode("", true)
                      ]),
                      !!__props.arrow ? (openBlock(), createBlock(unref(TooltipArrow), mergeProps({ key: 0 }, arrowProps.value, {
                        "data-slot": "arrow",
                        class: ui.value.arrow({ class: props.ui?.arrow })
                      }), null, 16, ["class"])) : createCommentVNode("", true)
                    ]),
                    _: 3
                  }, 16, ["class"])
                ]),
                _: 3
              }, 16)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/Tooltip.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const theme = {
  "slots": {
    "root": "relative flex gap-1.5 [&>div]:min-w-0",
    "list": "isolate min-w-0",
    "label": "w-full flex items-center gap-1.5 font-semibold text-xs/5 text-highlighted px-2.5 py-1.5",
    "item": "min-w-0",
    "link": "group relative w-full flex items-center gap-1.5 font-medium text-sm before:absolute before:z-[-1] before:rounded-md focus:outline-none focus-visible:outline-none dark:focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2",
    "linkLeadingIcon": "shrink-0 size-5",
    "linkLeadingAvatar": "shrink-0",
    "linkLeadingAvatarSize": "2xs",
    "linkTrailing": "group ms-auto inline-flex gap-1.5 items-center",
    "linkTrailingBadge": "shrink-0",
    "linkTrailingBadgeSize": "sm",
    "linkTrailingIcon": "size-5 transform shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200",
    "linkLabel": "truncate",
    "linkLabelExternalIcon": "inline-block size-3 align-top text-dimmed",
    "childList": "isolate",
    "childLabel": "text-xs text-highlighted",
    "childItem": "",
    "childLink": "group relative size-full flex items-start text-start text-sm before:absolute before:z-[-1] before:rounded-md focus:outline-none focus-visible:outline-none dark:focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2",
    "childLinkWrapper": "min-w-0",
    "childLinkIcon": "size-5 shrink-0",
    "childLinkLabel": "truncate",
    "childLinkLabelExternalIcon": "inline-block size-3 align-top text-dimmed",
    "childLinkDescription": "text-muted",
    "separator": "px-2 h-px bg-border",
    "viewportWrapper": "absolute top-full left-0 flex w-full",
    "viewport": "relative overflow-hidden bg-default shadow-lg rounded-md ring ring-default h-(--reka-navigation-menu-viewport-height) w-full transition-[width,height,left] duration-200 origin-[top_center] data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] z-[1]",
    "content": "",
    "indicator": "absolute data-[state=visible]:animate-[fade-in_100ms_ease-out] data-[state=hidden]:animate-[fade-out_100ms_ease-in] data-[state=hidden]:opacity-0 bottom-0 z-[2] w-(--reka-navigation-menu-indicator-size) translate-x-(--reka-navigation-menu-indicator-position) flex h-2.5 items-end justify-center overflow-hidden transition-[translate,width] duration-200",
    "arrow": "relative top-[50%] size-2.5 rotate-45 border border-default bg-default z-[1] rounded-xs"
  },
  "variants": {
    "color": {
      "primary": {
        "link": "focus-visible:before:ring-primary",
        "childLink": "focus-visible:before:ring-primary"
      },
      "secondary": {
        "link": "focus-visible:before:ring-secondary",
        "childLink": "focus-visible:before:ring-secondary"
      },
      "success": {
        "link": "focus-visible:before:ring-success",
        "childLink": "focus-visible:before:ring-success"
      },
      "info": {
        "link": "focus-visible:before:ring-info",
        "childLink": "focus-visible:before:ring-info"
      },
      "warning": {
        "link": "focus-visible:before:ring-warning",
        "childLink": "focus-visible:before:ring-warning"
      },
      "error": {
        "link": "focus-visible:before:ring-error",
        "childLink": "focus-visible:before:ring-error"
      },
      "neutral": {
        "link": "focus-visible:before:ring-inverted",
        "childLink": "focus-visible:before:ring-inverted"
      }
    },
    "highlightColor": {
      "primary": "",
      "secondary": "",
      "success": "",
      "info": "",
      "warning": "",
      "error": "",
      "neutral": ""
    },
    "variant": {
      "pill": "",
      "link": ""
    },
    "orientation": {
      "horizontal": {
        "root": "items-center justify-between",
        "list": "flex items-center",
        "item": "py-2",
        "link": "px-2.5 py-1.5 before:inset-x-px before:inset-y-0",
        "childList": "grid p-2",
        "childLink": "px-3 py-2 gap-2 before:inset-x-px before:inset-y-0",
        "childLinkLabel": "font-medium",
        "content": "absolute top-0 left-0 w-full max-h-[70vh] overflow-y-auto"
      },
      "vertical": {
        "root": "flex-col",
        "link": "flex-row px-2.5 py-1.5 before:inset-y-px before:inset-x-0",
        "childLabel": "px-1.5 py-0.5",
        "childLink": "p-1.5 gap-1.5 before:inset-y-px before:inset-x-0"
      }
    },
    "contentOrientation": {
      "horizontal": {
        "viewportWrapper": "justify-center",
        "content": "data-[motion=from-start]:animate-[enter-from-left_200ms_ease] data-[motion=from-end]:animate-[enter-from-right_200ms_ease] data-[motion=to-start]:animate-[exit-to-left_200ms_ease] data-[motion=to-end]:animate-[exit-to-right_200ms_ease]"
      },
      "vertical": {
        "viewport": "sm:w-(--reka-navigation-menu-viewport-width) left-(--reka-navigation-menu-viewport-left)"
      }
    },
    "active": {
      "true": {
        "childLink": "before:bg-elevated text-highlighted",
        "childLinkIcon": "text-default"
      },
      "false": {
        "link": "text-muted",
        "linkLeadingIcon": "text-dimmed",
        "childLink": [
          "hover:before:bg-elevated/50 text-default hover:text-highlighted",
          "transition-colors before:transition-colors"
        ],
        "childLinkIcon": [
          "text-dimmed group-hover:text-default",
          "transition-colors"
        ]
      }
    },
    "disabled": {
      "true": {
        "link": "cursor-not-allowed opacity-75"
      }
    },
    "highlight": {
      "true": ""
    },
    "level": {
      "true": ""
    },
    "collapsed": {
      "true": ""
    }
  },
  "compoundVariants": [
    {
      "orientation": "horizontal",
      "contentOrientation": "horizontal",
      "class": {
        "childList": "grid-cols-2 gap-2"
      }
    },
    {
      "orientation": "horizontal",
      "contentOrientation": "vertical",
      "class": {
        "childList": "gap-1",
        "content": "w-60"
      }
    },
    {
      "orientation": "vertical",
      "collapsed": false,
      "class": {
        "childList": "ms-5 border-s border-default",
        "childItem": "ps-1.5 -ms-px",
        "content": "data-[state=open]:animate-[collapsible-down_200ms_ease-out] data-[state=closed]:animate-[collapsible-up_200ms_ease-out] overflow-hidden"
      }
    },
    {
      "orientation": "vertical",
      "collapsed": true,
      "class": {
        "link": "px-1.5",
        "linkLabel": "hidden",
        "linkTrailing": "hidden",
        "content": "shadow-sm rounded-sm min-h-6 p-1"
      }
    },
    {
      "orientation": "horizontal",
      "highlight": true,
      "class": {
        "link": [
          "after:absolute after:-bottom-2 after:inset-x-2.5 after:block after:h-px after:rounded-full",
          "after:transition-colors"
        ]
      }
    },
    {
      "orientation": "vertical",
      "highlight": true,
      "level": true,
      "class": {
        "link": [
          "after:absolute after:-start-1.5 after:inset-y-0.5 after:block after:w-px after:rounded-full",
          "after:transition-colors"
        ]
      }
    },
    {
      "disabled": false,
      "active": false,
      "variant": "pill",
      "class": {
        "link": [
          "hover:text-highlighted hover:before:bg-elevated/50",
          "transition-colors before:transition-colors"
        ],
        "linkLeadingIcon": [
          "group-hover:text-default",
          "transition-colors"
        ]
      }
    },
    {
      "disabled": false,
      "active": false,
      "variant": "pill",
      "orientation": "horizontal",
      "class": {
        "link": "data-[state=open]:text-highlighted",
        "linkLeadingIcon": "group-data-[state=open]:text-default"
      }
    },
    {
      "disabled": false,
      "variant": "pill",
      "highlight": true,
      "orientation": "horizontal",
      "class": {
        "link": "data-[state=open]:before:bg-elevated/50"
      }
    },
    {
      "disabled": false,
      "variant": "pill",
      "highlight": false,
      "active": false,
      "orientation": "horizontal",
      "class": {
        "link": "data-[state=open]:before:bg-elevated/50"
      }
    },
    {
      "color": "primary",
      "variant": "pill",
      "active": true,
      "class": {
        "link": "text-primary",
        "linkLeadingIcon": "text-primary group-data-[state=open]:text-primary"
      }
    },
    {
      "color": "secondary",
      "variant": "pill",
      "active": true,
      "class": {
        "link": "text-secondary",
        "linkLeadingIcon": "text-secondary group-data-[state=open]:text-secondary"
      }
    },
    {
      "color": "success",
      "variant": "pill",
      "active": true,
      "class": {
        "link": "text-success",
        "linkLeadingIcon": "text-success group-data-[state=open]:text-success"
      }
    },
    {
      "color": "info",
      "variant": "pill",
      "active": true,
      "class": {
        "link": "text-info",
        "linkLeadingIcon": "text-info group-data-[state=open]:text-info"
      }
    },
    {
      "color": "warning",
      "variant": "pill",
      "active": true,
      "class": {
        "link": "text-warning",
        "linkLeadingIcon": "text-warning group-data-[state=open]:text-warning"
      }
    },
    {
      "color": "error",
      "variant": "pill",
      "active": true,
      "class": {
        "link": "text-error",
        "linkLeadingIcon": "text-error group-data-[state=open]:text-error"
      }
    },
    {
      "color": "neutral",
      "variant": "pill",
      "active": true,
      "class": {
        "link": "text-highlighted",
        "linkLeadingIcon": "text-highlighted group-data-[state=open]:text-highlighted"
      }
    },
    {
      "variant": "pill",
      "active": true,
      "highlight": false,
      "class": {
        "link": "before:bg-elevated"
      }
    },
    {
      "variant": "pill",
      "active": true,
      "highlight": true,
      "disabled": false,
      "class": {
        "link": [
          "hover:before:bg-elevated/50",
          "before:transition-colors"
        ]
      }
    },
    {
      "disabled": false,
      "active": false,
      "variant": "link",
      "class": {
        "link": [
          "hover:text-highlighted",
          "transition-colors"
        ],
        "linkLeadingIcon": [
          "group-hover:text-default",
          "transition-colors"
        ]
      }
    },
    {
      "disabled": false,
      "active": false,
      "variant": "link",
      "orientation": "horizontal",
      "class": {
        "link": "data-[state=open]:text-highlighted",
        "linkLeadingIcon": "group-data-[state=open]:text-default"
      }
    },
    {
      "color": "primary",
      "variant": "link",
      "active": true,
      "class": {
        "link": "text-primary",
        "linkLeadingIcon": "text-primary group-data-[state=open]:text-primary"
      }
    },
    {
      "color": "secondary",
      "variant": "link",
      "active": true,
      "class": {
        "link": "text-secondary",
        "linkLeadingIcon": "text-secondary group-data-[state=open]:text-secondary"
      }
    },
    {
      "color": "success",
      "variant": "link",
      "active": true,
      "class": {
        "link": "text-success",
        "linkLeadingIcon": "text-success group-data-[state=open]:text-success"
      }
    },
    {
      "color": "info",
      "variant": "link",
      "active": true,
      "class": {
        "link": "text-info",
        "linkLeadingIcon": "text-info group-data-[state=open]:text-info"
      }
    },
    {
      "color": "warning",
      "variant": "link",
      "active": true,
      "class": {
        "link": "text-warning",
        "linkLeadingIcon": "text-warning group-data-[state=open]:text-warning"
      }
    },
    {
      "color": "error",
      "variant": "link",
      "active": true,
      "class": {
        "link": "text-error",
        "linkLeadingIcon": "text-error group-data-[state=open]:text-error"
      }
    },
    {
      "color": "neutral",
      "variant": "link",
      "active": true,
      "class": {
        "link": "text-highlighted",
        "linkLeadingIcon": "text-highlighted group-data-[state=open]:text-highlighted"
      }
    },
    {
      "highlightColor": "primary",
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "after:bg-primary"
      }
    },
    {
      "highlightColor": "secondary",
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "after:bg-secondary"
      }
    },
    {
      "highlightColor": "success",
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "after:bg-success"
      }
    },
    {
      "highlightColor": "info",
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "after:bg-info"
      }
    },
    {
      "highlightColor": "warning",
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "after:bg-warning"
      }
    },
    {
      "highlightColor": "error",
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "after:bg-error"
      }
    },
    {
      "highlightColor": "neutral",
      "highlight": true,
      "level": true,
      "active": true,
      "class": {
        "link": "after:bg-inverted"
      }
    }
  ],
  "defaultVariants": {
    "color": "primary",
    "highlightColor": "primary",
    "variant": "pill"
  }
};
const _sfc_main$1 = /* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
  __name: "UNavigationMenu",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    type: { type: null, required: false, default: "multiple" },
    modelValue: { type: null, required: false },
    defaultValue: { type: null, required: false },
    trailingIcon: { type: null, required: false },
    externalIcon: { type: [Boolean, String], required: false, skipCheck: true, default: true },
    items: { type: null, required: false },
    color: { type: null, required: false },
    variant: { type: null, required: false },
    orientation: { type: null, required: false, default: "horizontal" },
    collapsed: { type: Boolean, required: false },
    tooltip: { type: [Boolean, Object], required: false },
    popover: { type: [Boolean, Object], required: false },
    highlight: { type: Boolean, required: false },
    highlightColor: { type: null, required: false },
    content: { type: Object, required: false },
    contentOrientation: { type: null, required: false, default: "horizontal" },
    arrow: { type: Boolean, required: false },
    labelKey: { type: null, required: false, default: "label" },
    class: { type: null, required: false },
    ui: { type: null, required: false },
    delayDuration: { type: Number, required: false, default: 0 },
    disableClickTrigger: { type: Boolean, required: false },
    disableHoverTrigger: { type: Boolean, required: false },
    skipDelayDuration: { type: Number, required: false },
    disablePointerLeaveClose: { type: Boolean, required: false },
    unmountOnHide: { type: Boolean, required: false, default: true },
    disabled: { type: Boolean, required: false },
    collapsible: { type: Boolean, required: false, default: true }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const rootProps = useForwardPropsEmits(computed(() => ({
      as: props.as,
      delayDuration: props.delayDuration,
      skipDelayDuration: props.skipDelayDuration,
      orientation: props.orientation,
      disableClickTrigger: props.disableClickTrigger,
      disableHoverTrigger: props.disableHoverTrigger,
      disablePointerLeaveClose: props.disablePointerLeaveClose,
      unmountOnHide: props.unmountOnHide
    })), emits);
    const accordionProps = useForwardPropsEmits(reactivePick(props, "collapsible", "disabled", "type", "unmountOnHide"), emits);
    const contentProps = toRef(() => props.content);
    const tooltipProps = toRef(() => defu(typeof props.tooltip === "boolean" ? {} : props.tooltip, { delayDuration: 0, content: { side: "right" } }));
    const popoverProps = toRef(() => defu(typeof props.popover === "boolean" ? {} : props.popover, { mode: "hover", content: { side: "right", align: "start", alignOffset: 2 } }));
    const [DefineLinkTemplate, ReuseLinkTemplate] = createReusableTemplate();
    const [DefineItemTemplate, ReuseItemTemplate] = createReusableTemplate({
      props: {
        item: Object,
        index: Number,
        level: Number
      }
    });
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.navigationMenu || {} })({
      orientation: props.orientation,
      contentOrientation: props.orientation === "vertical" ? void 0 : props.contentOrientation,
      collapsed: props.collapsed,
      color: props.color,
      variant: props.variant,
      highlight: props.highlight,
      highlightColor: props.highlightColor || props.color
    }));
    const lists = computed(
      () => props.items?.length ? isArrayOfArray(props.items) ? props.items : [props.items] : []
    );
    function getAccordionDefaultValue(list, level = 0) {
      const indexes = list.reduce((acc, item, index) => {
        if (item.defaultOpen || item.open) {
          acc.push(item.value || (level > 0 ? `item-${level}-${index}` : `item-${index}`));
        }
        return acc;
      }, []);
      return props.type === "single" ? indexes[0] : indexes;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(unref(DefineLinkTemplate), null, {
        default: withCtx(({ item, active, index }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, item.slot || "item", {
              item,
              index,
              active,
              ui: ui.value
            }, () => {
              ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : "item-leading", {
                item,
                active,
                index,
                ui: ui.value
              }, () => {
                if (item.avatar) {
                  _push2(ssrRenderComponent(_sfc_main$7, mergeProps({
                    size: item.ui?.linkLeadingAvatarSize || props.ui?.linkLeadingAvatarSize || ui.value.linkLeadingAvatarSize()
                  }, item.avatar, {
                    "data-slot": "linkLeadingAvatar",
                    class: ui.value.linkLeadingAvatar({ class: [props.ui?.linkLeadingAvatar, item.ui?.linkLeadingAvatar], active, disabled: !!item.disabled })
                  }), null, _parent2, _scopeId));
                } else if (item.icon) {
                  _push2(ssrRenderComponent(_sfc_main$5, {
                    name: item.icon,
                    "data-slot": "linkLeadingIcon",
                    class: ui.value.linkLeadingIcon({ class: [props.ui?.linkLeadingIcon, item.ui?.linkLeadingIcon], active, disabled: !!item.disabled })
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
              }, _push2, _parent2, _scopeId);
              if (unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : "item-label"]) {
                _push2(`<span data-slot="linkLabel" class="${ssrRenderClass(ui.value.linkLabel({ class: [props.ui?.linkLabel, item.ui?.linkLabel] }))}"${_scopeId}>`);
                ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : "item-label", {
                  item,
                  active,
                  index
                }, () => {
                  _push2(`${ssrInterpolate(unref(get)(item, props.labelKey))}`);
                }, _push2, _parent2, _scopeId);
                if (item.target === "_blank" && __props.externalIcon !== false) {
                  _push2(ssrRenderComponent(_sfc_main$5, {
                    name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                    "data-slot": "linkLabelExternalIcon",
                    class: ui.value.linkLabelExternalIcon({ class: [props.ui?.linkLabelExternalIcon, item.ui?.linkLabelExternalIcon], active })
                  }, null, _parent2, _scopeId));
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</span>`);
              } else {
                _push2(`<!---->`);
              }
              if (item.badge || item.badge === 0 || __props.orientation === "horizontal" && (item.children?.length || !!slots[item.slot ? `${item.slot}-content` : "item-content"]) || __props.orientation === "vertical" && item.children?.length || item.trailingIcon || !!slots[item.slot ? `${item.slot}-trailing` : "item-trailing"]) {
                ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(__props.orientation === "vertical" && item.children?.length && !__props.collapsed ? unref(AccordionTrigger) : "span"), {
                  as: "span",
                  "data-slot": "linkTrailing",
                  class: ui.value.linkTrailing({ class: [props.ui?.linkTrailing, item.ui?.linkTrailing] }),
                  onClick: () => {
                  }
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : "item-trailing", {
                        item,
                        active,
                        index,
                        ui: ui.value
                      }, () => {
                        if (item.badge || item.badge === 0) {
                          _push3(ssrRenderComponent(_sfc_main$8, mergeProps({
                            color: "neutral",
                            variant: "outline",
                            size: item.ui?.linkTrailingBadgeSize || props.ui?.linkTrailingBadgeSize || ui.value.linkTrailingBadgeSize()
                          }, typeof item.badge === "string" || typeof item.badge === "number" ? { label: item.badge } : item.badge, {
                            "data-slot": "linkTrailingBadge",
                            class: ui.value.linkTrailingBadge({ class: [props.ui?.linkTrailingBadge, item.ui?.linkTrailingBadge] })
                          }), null, _parent3, _scopeId2));
                        } else {
                          _push3(`<!---->`);
                        }
                        if (__props.orientation === "horizontal" && (item.children?.length || !!slots[item.slot ? `${item.slot}-content` : "item-content"]) || __props.orientation === "vertical" && item.children?.length) {
                          _push3(ssrRenderComponent(_sfc_main$5, {
                            name: item.trailingIcon || __props.trailingIcon || unref(appConfig).ui.icons.chevronDown,
                            "data-slot": "linkTrailingIcon",
                            class: ui.value.linkTrailingIcon({ class: [props.ui?.linkTrailingIcon, item.ui?.linkTrailingIcon], active })
                          }, null, _parent3, _scopeId2));
                        } else if (item.trailingIcon) {
                          _push3(ssrRenderComponent(_sfc_main$5, {
                            name: item.trailingIcon,
                            "data-slot": "linkTrailingIcon",
                            class: ui.value.linkTrailingIcon({ class: [props.ui?.linkTrailingIcon, item.ui?.linkTrailingIcon], active })
                          }, null, _parent3, _scopeId2));
                        } else {
                          _push3(`<!---->`);
                        }
                      }, _push3, _parent3, _scopeId2);
                    } else {
                      return [
                        renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : "item-trailing", {
                          item,
                          active,
                          index,
                          ui: ui.value
                        }, () => [
                          item.badge || item.badge === 0 ? (openBlock(), createBlock(_sfc_main$8, mergeProps({
                            key: 0,
                            color: "neutral",
                            variant: "outline",
                            size: item.ui?.linkTrailingBadgeSize || props.ui?.linkTrailingBadgeSize || ui.value.linkTrailingBadgeSize()
                          }, typeof item.badge === "string" || typeof item.badge === "number" ? { label: item.badge } : item.badge, {
                            "data-slot": "linkTrailingBadge",
                            class: ui.value.linkTrailingBadge({ class: [props.ui?.linkTrailingBadge, item.ui?.linkTrailingBadge] })
                          }), null, 16, ["size", "class"])) : createCommentVNode("", true),
                          __props.orientation === "horizontal" && (item.children?.length || !!slots[item.slot ? `${item.slot}-content` : "item-content"]) || __props.orientation === "vertical" && item.children?.length ? (openBlock(), createBlock(_sfc_main$5, {
                            key: 1,
                            name: item.trailingIcon || __props.trailingIcon || unref(appConfig).ui.icons.chevronDown,
                            "data-slot": "linkTrailingIcon",
                            class: ui.value.linkTrailingIcon({ class: [props.ui?.linkTrailingIcon, item.ui?.linkTrailingIcon], active })
                          }, null, 8, ["name", "class"])) : item.trailingIcon ? (openBlock(), createBlock(_sfc_main$5, {
                            key: 2,
                            name: item.trailingIcon,
                            "data-slot": "linkTrailingIcon",
                            class: ui.value.linkTrailingIcon({ class: [props.ui?.linkTrailingIcon, item.ui?.linkTrailingIcon], active })
                          }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                        ])
                      ];
                    }
                  }),
                  _: 2
                }), _parent2, _scopeId);
              } else {
                _push2(`<!---->`);
              }
            }, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, item.slot || "item", {
                item,
                index,
                active,
                ui: ui.value
              }, () => [
                renderSlot(_ctx.$slots, item.slot ? `${item.slot}-leading` : "item-leading", {
                  item,
                  active,
                  index,
                  ui: ui.value
                }, () => [
                  item.avatar ? (openBlock(), createBlock(_sfc_main$7, mergeProps({
                    key: 0,
                    size: item.ui?.linkLeadingAvatarSize || props.ui?.linkLeadingAvatarSize || ui.value.linkLeadingAvatarSize()
                  }, item.avatar, {
                    "data-slot": "linkLeadingAvatar",
                    class: ui.value.linkLeadingAvatar({ class: [props.ui?.linkLeadingAvatar, item.ui?.linkLeadingAvatar], active, disabled: !!item.disabled })
                  }), null, 16, ["size", "class"])) : item.icon ? (openBlock(), createBlock(_sfc_main$5, {
                    key: 1,
                    name: item.icon,
                    "data-slot": "linkLeadingIcon",
                    class: ui.value.linkLeadingIcon({ class: [props.ui?.linkLeadingIcon, item.ui?.linkLeadingIcon], active, disabled: !!item.disabled })
                  }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                ]),
                unref(get)(item, props.labelKey) || !!slots[item.slot ? `${item.slot}-label` : "item-label"] ? (openBlock(), createBlock("span", {
                  key: 0,
                  "data-slot": "linkLabel",
                  class: ui.value.linkLabel({ class: [props.ui?.linkLabel, item.ui?.linkLabel] })
                }, [
                  renderSlot(_ctx.$slots, item.slot ? `${item.slot}-label` : "item-label", {
                    item,
                    active,
                    index
                  }, () => [
                    createTextVNode(toDisplayString(unref(get)(item, props.labelKey)), 1)
                  ]),
                  item.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                    key: 0,
                    name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                    "data-slot": "linkLabelExternalIcon",
                    class: ui.value.linkLabelExternalIcon({ class: [props.ui?.linkLabelExternalIcon, item.ui?.linkLabelExternalIcon], active })
                  }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                ], 2)) : createCommentVNode("", true),
                item.badge || item.badge === 0 || __props.orientation === "horizontal" && (item.children?.length || !!slots[item.slot ? `${item.slot}-content` : "item-content"]) || __props.orientation === "vertical" && item.children?.length || item.trailingIcon || !!slots[item.slot ? `${item.slot}-trailing` : "item-trailing"] ? (openBlock(), createBlock(resolveDynamicComponent(__props.orientation === "vertical" && item.children?.length && !__props.collapsed ? unref(AccordionTrigger) : "span"), {
                  key: 1,
                  as: "span",
                  "data-slot": "linkTrailing",
                  class: ui.value.linkTrailing({ class: [props.ui?.linkTrailing, item.ui?.linkTrailing] }),
                  onClick: withModifiers(() => {
                  }, ["stop", "prevent"])
                }, {
                  default: withCtx(() => [
                    renderSlot(_ctx.$slots, item.slot ? `${item.slot}-trailing` : "item-trailing", {
                      item,
                      active,
                      index,
                      ui: ui.value
                    }, () => [
                      item.badge || item.badge === 0 ? (openBlock(), createBlock(_sfc_main$8, mergeProps({
                        key: 0,
                        color: "neutral",
                        variant: "outline",
                        size: item.ui?.linkTrailingBadgeSize || props.ui?.linkTrailingBadgeSize || ui.value.linkTrailingBadgeSize()
                      }, typeof item.badge === "string" || typeof item.badge === "number" ? { label: item.badge } : item.badge, {
                        "data-slot": "linkTrailingBadge",
                        class: ui.value.linkTrailingBadge({ class: [props.ui?.linkTrailingBadge, item.ui?.linkTrailingBadge] })
                      }), null, 16, ["size", "class"])) : createCommentVNode("", true),
                      __props.orientation === "horizontal" && (item.children?.length || !!slots[item.slot ? `${item.slot}-content` : "item-content"]) || __props.orientation === "vertical" && item.children?.length ? (openBlock(), createBlock(_sfc_main$5, {
                        key: 1,
                        name: item.trailingIcon || __props.trailingIcon || unref(appConfig).ui.icons.chevronDown,
                        "data-slot": "linkTrailingIcon",
                        class: ui.value.linkTrailingIcon({ class: [props.ui?.linkTrailingIcon, item.ui?.linkTrailingIcon], active })
                      }, null, 8, ["name", "class"])) : item.trailingIcon ? (openBlock(), createBlock(_sfc_main$5, {
                        key: 2,
                        name: item.trailingIcon,
                        "data-slot": "linkTrailingIcon",
                        class: ui.value.linkTrailingIcon({ class: [props.ui?.linkTrailingIcon, item.ui?.linkTrailingIcon], active })
                      }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                    ])
                  ]),
                  _: 2
                }, 1032, ["class", "onClick"])) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(ssrRenderComponent(unref(DefineItemTemplate), null, {
        default: withCtx(({ item, index, level = 0 }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(__props.orientation === "vertical" && !__props.collapsed ? unref(AccordionItem) : unref(NavigationMenuItem)), {
              as: "li",
              value: item.value || (level > 0 ? `item-${level}-${index}` : `item-${index}`)
            }, {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  if (__props.orientation === "vertical" && item.type === "label" && !__props.collapsed) {
                    _push3(`<div data-slot="label" class="${ssrRenderClass(ui.value.label({ class: [props.ui?.label, item.ui?.label, item.class] }))}"${_scopeId2}>`);
                    _push3(ssrRenderComponent(unref(ReuseLinkTemplate), {
                      item,
                      index
                    }, null, _parent3, _scopeId2));
                    _push3(`</div>`);
                  } else if (item.type !== "label") {
                    _push3(ssrRenderComponent(_sfc_main$9, mergeProps(__props.orientation === "vertical" && item.children?.length && !__props.collapsed && item.type === "trigger" ? {} : unref(pickLinkProps)(item), { custom: "" }), {
                      default: withCtx(({ active, ...slotProps }, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          ssrRenderVNode(_push4, createVNode(resolveDynamicComponent(__props.orientation === "horizontal" && (item.children?.length || !!slots[item.slot ? `${item.slot}-content` : "item-content"]) ? unref(NavigationMenuTrigger) : __props.orientation === "vertical" && item.children?.length && !__props.collapsed && !slotProps.href ? unref(AccordionTrigger) : unref(NavigationMenuLink)), {
                            "as-child": "",
                            active: active || item.active,
                            disabled: item.disabled,
                            onSelect: item.onSelect
                          }, {
                            default: withCtx((_2, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                if (__props.orientation === "vertical" && __props.collapsed && item.children?.length && (!!props.popover || !!item.popover)) {
                                  _push5(ssrRenderComponent(_sfc_main$3, mergeProps({ ...popoverProps.value, ...typeof item.popover === "boolean" ? {} : item.popover || {} }, {
                                    ui: { content: ui.value.content({ class: [props.ui?.content, item.ui?.content] }) }
                                  }), {
                                    content: withCtx(({ close }, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-content` : "item-content", {
                                          item,
                                          active: active || item.active,
                                          index,
                                          ui: ui.value,
                                          close
                                        }, () => {
                                          _push6(`<ul data-slot="childList" class="${ssrRenderClass(ui.value.childList({ class: [props.ui?.childList, item.ui?.childList] }))}"${_scopeId5}><li data-slot="childLabel" class="${ssrRenderClass(ui.value.childLabel({ class: [props.ui?.childLabel, item.ui?.childLabel] }))}"${_scopeId5}>${ssrInterpolate(unref(get)(item, props.labelKey))}</li><!--[-->`);
                                          ssrRenderList(item.children, (childItem, childIndex) => {
                                            _push6(`<li data-slot="childItem" class="${ssrRenderClass(ui.value.childItem({ class: [props.ui?.childItem, item.ui?.childItem] }))}"${_scopeId5}>`);
                                            _push6(ssrRenderComponent(_sfc_main$9, mergeProps({ ref_for: true }, unref(pickLinkProps)(childItem), { custom: "" }), {
                                              default: withCtx(({ active: childActive, ...childSlotProps }, _push7, _parent7, _scopeId6) => {
                                                if (_push7) {
                                                  _push7(ssrRenderComponent(unref(NavigationMenuLink), {
                                                    "as-child": "",
                                                    active: childActive,
                                                    onSelect: childItem.onSelect
                                                  }, {
                                                    default: withCtx((_3, _push8, _parent8, _scopeId7) => {
                                                      if (_push8) {
                                                        _push8(ssrRenderComponent(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                                          "data-slot": "childLink",
                                                          class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                                        }), {
                                                          default: withCtx((_4, _push9, _parent9, _scopeId8) => {
                                                            if (_push9) {
                                                              if (childItem.icon) {
                                                                _push9(ssrRenderComponent(_sfc_main$5, {
                                                                  name: childItem.icon,
                                                                  "data-slot": "childLinkIcon",
                                                                  class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                                }, null, _parent9, _scopeId8));
                                                              } else {
                                                                _push9(`<!---->`);
                                                              }
                                                              _push9(`<span data-slot="childLinkLabel" class="${ssrRenderClass(ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive }))}"${_scopeId8}>${ssrInterpolate(unref(get)(childItem, props.labelKey))} `);
                                                              if (childItem.target === "_blank" && __props.externalIcon !== false) {
                                                                _push9(ssrRenderComponent(_sfc_main$5, {
                                                                  name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                                  "data-slot": "childLinkLabelExternalIcon",
                                                                  class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                                }, null, _parent9, _scopeId8));
                                                              } else {
                                                                _push9(`<!---->`);
                                                              }
                                                              _push9(`</span>`);
                                                            } else {
                                                              return [
                                                                childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                                  key: 0,
                                                                  name: childItem.icon,
                                                                  "data-slot": "childLinkIcon",
                                                                  class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                                }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                                                createVNode("span", {
                                                                  "data-slot": "childLinkLabel",
                                                                  class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                                }, [
                                                                  createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                                  childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                                    key: 0,
                                                                    name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                                    "data-slot": "childLinkLabelExternalIcon",
                                                                    class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                                  }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                                ], 2)
                                                              ];
                                                            }
                                                          }),
                                                          _: 2
                                                        }, _parent8, _scopeId7));
                                                      } else {
                                                        return [
                                                          createVNode(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                                            "data-slot": "childLink",
                                                            class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                                          }), {
                                                            default: withCtx(() => [
                                                              childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                                key: 0,
                                                                name: childItem.icon,
                                                                "data-slot": "childLinkIcon",
                                                                class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                              }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                                              createVNode("span", {
                                                                "data-slot": "childLinkLabel",
                                                                class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                              }, [
                                                                createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                                childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                                  key: 0,
                                                                  name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                                  "data-slot": "childLinkLabelExternalIcon",
                                                                  class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                                }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                              ], 2)
                                                            ]),
                                                            _: 2
                                                          }, 1040, ["class"])
                                                        ];
                                                      }
                                                    }),
                                                    _: 2
                                                  }, _parent7, _scopeId6));
                                                } else {
                                                  return [
                                                    createVNode(unref(NavigationMenuLink), {
                                                      "as-child": "",
                                                      active: childActive,
                                                      onSelect: childItem.onSelect
                                                    }, {
                                                      default: withCtx(() => [
                                                        createVNode(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                                          "data-slot": "childLink",
                                                          class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                                        }), {
                                                          default: withCtx(() => [
                                                            childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                              key: 0,
                                                              name: childItem.icon,
                                                              "data-slot": "childLinkIcon",
                                                              class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                            }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                                            createVNode("span", {
                                                              "data-slot": "childLinkLabel",
                                                              class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                            }, [
                                                              createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                              childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                                key: 0,
                                                                name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                                "data-slot": "childLinkLabelExternalIcon",
                                                                class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                              }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                            ], 2)
                                                          ]),
                                                          _: 2
                                                        }, 1040, ["class"])
                                                      ]),
                                                      _: 2
                                                    }, 1032, ["active", "onSelect"])
                                                  ];
                                                }
                                              }),
                                              _: 2
                                            }, _parent6, _scopeId5));
                                            _push6(`</li>`);
                                          });
                                          _push6(`<!--]--></ul>`);
                                        }, _push6, _parent6, _scopeId5);
                                      } else {
                                        return [
                                          renderSlot(_ctx.$slots, item.slot ? `${item.slot}-content` : "item-content", {
                                            item,
                                            active: active || item.active,
                                            index,
                                            ui: ui.value,
                                            close
                                          }, () => [
                                            createVNode("ul", {
                                              "data-slot": "childList",
                                              class: ui.value.childList({ class: [props.ui?.childList, item.ui?.childList] })
                                            }, [
                                              createVNode("li", {
                                                "data-slot": "childLabel",
                                                class: ui.value.childLabel({ class: [props.ui?.childLabel, item.ui?.childLabel] })
                                              }, toDisplayString(unref(get)(item, props.labelKey)), 3),
                                              (openBlock(true), createBlock(Fragment, null, renderList(item.children, (childItem, childIndex) => {
                                                return openBlock(), createBlock("li", {
                                                  key: childIndex,
                                                  "data-slot": "childItem",
                                                  class: ui.value.childItem({ class: [props.ui?.childItem, item.ui?.childItem] })
                                                }, [
                                                  createVNode(_sfc_main$9, mergeProps({ ref_for: true }, unref(pickLinkProps)(childItem), { custom: "" }), {
                                                    default: withCtx(({ active: childActive, ...childSlotProps }) => [
                                                      createVNode(unref(NavigationMenuLink), {
                                                        "as-child": "",
                                                        active: childActive,
                                                        onSelect: childItem.onSelect
                                                      }, {
                                                        default: withCtx(() => [
                                                          createVNode(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                                            "data-slot": "childLink",
                                                            class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                                          }), {
                                                            default: withCtx(() => [
                                                              childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                                key: 0,
                                                                name: childItem.icon,
                                                                "data-slot": "childLinkIcon",
                                                                class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                              }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                                              createVNode("span", {
                                                                "data-slot": "childLinkLabel",
                                                                class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                              }, [
                                                                createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                                childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                                  key: 0,
                                                                  name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                                  "data-slot": "childLinkLabelExternalIcon",
                                                                  class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                                }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                              ], 2)
                                                            ]),
                                                            _: 2
                                                          }, 1040, ["class"])
                                                        ]),
                                                        _: 2
                                                      }, 1032, ["active", "onSelect"])
                                                    ]),
                                                    _: 2
                                                  }, 1040)
                                                ], 2);
                                              }), 128))
                                            ], 2)
                                          ])
                                        ];
                                      }
                                    }),
                                    default: withCtx((_3, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        _push6(ssrRenderComponent(_sfc_main$1$1, mergeProps(slotProps, {
                                          "data-slot": "link",
                                          class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: level > 0 })
                                        }), {
                                          default: withCtx((_4, _push7, _parent7, _scopeId6) => {
                                            if (_push7) {
                                              _push7(ssrRenderComponent(unref(ReuseLinkTemplate), {
                                                item,
                                                active: active || item.active,
                                                index
                                              }, null, _parent7, _scopeId6));
                                            } else {
                                              return [
                                                createVNode(unref(ReuseLinkTemplate), {
                                                  item,
                                                  active: active || item.active,
                                                  index
                                                }, null, 8, ["item", "active", "index"])
                                              ];
                                            }
                                          }),
                                          _: 2
                                        }, _parent6, _scopeId5));
                                      } else {
                                        return [
                                          createVNode(_sfc_main$1$1, mergeProps(slotProps, {
                                            "data-slot": "link",
                                            class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: level > 0 })
                                          }), {
                                            default: withCtx(() => [
                                              createVNode(unref(ReuseLinkTemplate), {
                                                item,
                                                active: active || item.active,
                                                index
                                              }, null, 8, ["item", "active", "index"])
                                            ]),
                                            _: 2
                                          }, 1040, ["class"])
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent5, _scopeId4));
                                } else if (__props.orientation === "vertical" && __props.collapsed && (!!props.tooltip || !!item.tooltip)) {
                                  _push5(ssrRenderComponent(_sfc_main$2, mergeProps({
                                    text: unref(get)(item, props.labelKey)
                                  }, { ...tooltipProps.value, ...typeof item.tooltip === "boolean" ? {} : item.tooltip || {} }), {
                                    default: withCtx((_3, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        _push6(ssrRenderComponent(_sfc_main$1$1, mergeProps(slotProps, {
                                          "data-slot": "link",
                                          class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: level > 0 })
                                        }), {
                                          default: withCtx((_4, _push7, _parent7, _scopeId6) => {
                                            if (_push7) {
                                              _push7(ssrRenderComponent(unref(ReuseLinkTemplate), {
                                                item,
                                                active: active || item.active,
                                                index
                                              }, null, _parent7, _scopeId6));
                                            } else {
                                              return [
                                                createVNode(unref(ReuseLinkTemplate), {
                                                  item,
                                                  active: active || item.active,
                                                  index
                                                }, null, 8, ["item", "active", "index"])
                                              ];
                                            }
                                          }),
                                          _: 2
                                        }, _parent6, _scopeId5));
                                      } else {
                                        return [
                                          createVNode(_sfc_main$1$1, mergeProps(slotProps, {
                                            "data-slot": "link",
                                            class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: level > 0 })
                                          }), {
                                            default: withCtx(() => [
                                              createVNode(unref(ReuseLinkTemplate), {
                                                item,
                                                active: active || item.active,
                                                index
                                              }, null, 8, ["item", "active", "index"])
                                            ]),
                                            _: 2
                                          }, 1040, ["class"])
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent5, _scopeId4));
                                } else {
                                  _push5(ssrRenderComponent(_sfc_main$1$1, mergeProps(slotProps, {
                                    "data-slot": "link",
                                    class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: __props.orientation === "horizontal" || level > 0 })
                                  }), {
                                    default: withCtx((_3, _push6, _parent6, _scopeId5) => {
                                      if (_push6) {
                                        _push6(ssrRenderComponent(unref(ReuseLinkTemplate), {
                                          item,
                                          active: active || item.active,
                                          index
                                        }, null, _parent6, _scopeId5));
                                      } else {
                                        return [
                                          createVNode(unref(ReuseLinkTemplate), {
                                            item,
                                            active: active || item.active,
                                            index
                                          }, null, 8, ["item", "active", "index"])
                                        ];
                                      }
                                    }),
                                    _: 2
                                  }, _parent5, _scopeId4));
                                }
                              } else {
                                return [
                                  __props.orientation === "vertical" && __props.collapsed && item.children?.length && (!!props.popover || !!item.popover) ? (openBlock(), createBlock(_sfc_main$3, mergeProps({ key: 0 }, { ...popoverProps.value, ...typeof item.popover === "boolean" ? {} : item.popover || {} }, {
                                    ui: { content: ui.value.content({ class: [props.ui?.content, item.ui?.content] }) }
                                  }), {
                                    content: withCtx(({ close }) => [
                                      renderSlot(_ctx.$slots, item.slot ? `${item.slot}-content` : "item-content", {
                                        item,
                                        active: active || item.active,
                                        index,
                                        ui: ui.value,
                                        close
                                      }, () => [
                                        createVNode("ul", {
                                          "data-slot": "childList",
                                          class: ui.value.childList({ class: [props.ui?.childList, item.ui?.childList] })
                                        }, [
                                          createVNode("li", {
                                            "data-slot": "childLabel",
                                            class: ui.value.childLabel({ class: [props.ui?.childLabel, item.ui?.childLabel] })
                                          }, toDisplayString(unref(get)(item, props.labelKey)), 3),
                                          (openBlock(true), createBlock(Fragment, null, renderList(item.children, (childItem, childIndex) => {
                                            return openBlock(), createBlock("li", {
                                              key: childIndex,
                                              "data-slot": "childItem",
                                              class: ui.value.childItem({ class: [props.ui?.childItem, item.ui?.childItem] })
                                            }, [
                                              createVNode(_sfc_main$9, mergeProps({ ref_for: true }, unref(pickLinkProps)(childItem), { custom: "" }), {
                                                default: withCtx(({ active: childActive, ...childSlotProps }) => [
                                                  createVNode(unref(NavigationMenuLink), {
                                                    "as-child": "",
                                                    active: childActive,
                                                    onSelect: childItem.onSelect
                                                  }, {
                                                    default: withCtx(() => [
                                                      createVNode(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                                        "data-slot": "childLink",
                                                        class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                                      }), {
                                                        default: withCtx(() => [
                                                          childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                            key: 0,
                                                            name: childItem.icon,
                                                            "data-slot": "childLinkIcon",
                                                            class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                          }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                                          createVNode("span", {
                                                            "data-slot": "childLinkLabel",
                                                            class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                          }, [
                                                            createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                            childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                              key: 0,
                                                              name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                              "data-slot": "childLinkLabelExternalIcon",
                                                              class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                            }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                          ], 2)
                                                        ]),
                                                        _: 2
                                                      }, 1040, ["class"])
                                                    ]),
                                                    _: 2
                                                  }, 1032, ["active", "onSelect"])
                                                ]),
                                                _: 2
                                              }, 1040)
                                            ], 2);
                                          }), 128))
                                        ], 2)
                                      ])
                                    ]),
                                    default: withCtx(() => [
                                      createVNode(_sfc_main$1$1, mergeProps(slotProps, {
                                        "data-slot": "link",
                                        class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: level > 0 })
                                      }), {
                                        default: withCtx(() => [
                                          createVNode(unref(ReuseLinkTemplate), {
                                            item,
                                            active: active || item.active,
                                            index
                                          }, null, 8, ["item", "active", "index"])
                                        ]),
                                        _: 2
                                      }, 1040, ["class"])
                                    ]),
                                    _: 2
                                  }, 1040, ["ui"])) : __props.orientation === "vertical" && __props.collapsed && (!!props.tooltip || !!item.tooltip) ? (openBlock(), createBlock(_sfc_main$2, mergeProps({
                                    key: 1,
                                    text: unref(get)(item, props.labelKey)
                                  }, { ...tooltipProps.value, ...typeof item.tooltip === "boolean" ? {} : item.tooltip || {} }), {
                                    default: withCtx(() => [
                                      createVNode(_sfc_main$1$1, mergeProps(slotProps, {
                                        "data-slot": "link",
                                        class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: level > 0 })
                                      }), {
                                        default: withCtx(() => [
                                          createVNode(unref(ReuseLinkTemplate), {
                                            item,
                                            active: active || item.active,
                                            index
                                          }, null, 8, ["item", "active", "index"])
                                        ]),
                                        _: 2
                                      }, 1040, ["class"])
                                    ]),
                                    _: 2
                                  }, 1040, ["text"])) : (openBlock(), createBlock(_sfc_main$1$1, mergeProps({ key: 2 }, slotProps, {
                                    "data-slot": "link",
                                    class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: __props.orientation === "horizontal" || level > 0 })
                                  }), {
                                    default: withCtx(() => [
                                      createVNode(unref(ReuseLinkTemplate), {
                                        item,
                                        active: active || item.active,
                                        index
                                      }, null, 8, ["item", "active", "index"])
                                    ]),
                                    _: 2
                                  }, 1040, ["class"]))
                                ];
                              }
                            }),
                            _: 2
                          }), _parent4, _scopeId3);
                          if (__props.orientation === "horizontal" && (item.children?.length || !!slots[item.slot ? `${item.slot}-content` : "item-content"])) {
                            _push4(ssrRenderComponent(unref(NavigationMenuContent), mergeProps(contentProps.value, {
                              "data-slot": "content",
                              class: ui.value.content({ class: [props.ui?.content, item.ui?.content] })
                            }), {
                              default: withCtx((_2, _push5, _parent5, _scopeId4) => {
                                if (_push5) {
                                  ssrRenderSlot(_ctx.$slots, item.slot ? `${item.slot}-content` : "item-content", {
                                    item,
                                    active: active || item.active,
                                    index,
                                    ui: ui.value
                                  }, () => {
                                    _push5(`<ul data-slot="childList" class="${ssrRenderClass(ui.value.childList({ class: [props.ui?.childList, item.ui?.childList] }))}"${_scopeId4}><!--[-->`);
                                    ssrRenderList(item.children, (childItem, childIndex) => {
                                      _push5(`<li data-slot="childItem" class="${ssrRenderClass(ui.value.childItem({ class: [props.ui?.childItem, item.ui?.childItem] }))}"${_scopeId4}>`);
                                      _push5(ssrRenderComponent(_sfc_main$9, mergeProps({ ref_for: true }, unref(pickLinkProps)(childItem), { custom: "" }), {
                                        default: withCtx(({ active: childActive, ...childSlotProps }, _push6, _parent6, _scopeId5) => {
                                          if (_push6) {
                                            _push6(ssrRenderComponent(unref(NavigationMenuLink), {
                                              "as-child": "",
                                              active: childActive,
                                              onSelect: childItem.onSelect
                                            }, {
                                              default: withCtx((_3, _push7, _parent7, _scopeId6) => {
                                                if (_push7) {
                                                  _push7(ssrRenderComponent(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                                    "data-slot": "childLink",
                                                    class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                                  }), {
                                                    default: withCtx((_4, _push8, _parent8, _scopeId7) => {
                                                      if (_push8) {
                                                        if (childItem.icon) {
                                                          _push8(ssrRenderComponent(_sfc_main$5, {
                                                            name: childItem.icon,
                                                            "data-slot": "childLinkIcon",
                                                            class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                          }, null, _parent8, _scopeId7));
                                                        } else {
                                                          _push8(`<!---->`);
                                                        }
                                                        _push8(`<div data-slot="childLinkWrapper" class="${ssrRenderClass(ui.value.childLinkWrapper({ class: [props.ui?.childLinkWrapper, item.ui?.childLinkWrapper] }))}"${_scopeId7}><p data-slot="childLinkLabel" class="${ssrRenderClass(ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive }))}"${_scopeId7}>${ssrInterpolate(unref(get)(childItem, props.labelKey))} `);
                                                        if (childItem.target === "_blank" && __props.externalIcon !== false) {
                                                          _push8(ssrRenderComponent(_sfc_main$5, {
                                                            name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                            "data-slot": "childLinkLabelExternalIcon",
                                                            class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                          }, null, _parent8, _scopeId7));
                                                        } else {
                                                          _push8(`<!---->`);
                                                        }
                                                        _push8(`</p>`);
                                                        if (childItem.description) {
                                                          _push8(`<p data-slot="childLinkDescription" class="${ssrRenderClass(ui.value.childLinkDescription({ class: [props.ui?.childLinkDescription, item.ui?.childLinkDescription], active: childActive }))}"${_scopeId7}>${ssrInterpolate(childItem.description)}</p>`);
                                                        } else {
                                                          _push8(`<!---->`);
                                                        }
                                                        _push8(`</div>`);
                                                      } else {
                                                        return [
                                                          childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                            key: 0,
                                                            name: childItem.icon,
                                                            "data-slot": "childLinkIcon",
                                                            class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                          }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                                          createVNode("div", {
                                                            "data-slot": "childLinkWrapper",
                                                            class: ui.value.childLinkWrapper({ class: [props.ui?.childLinkWrapper, item.ui?.childLinkWrapper] })
                                                          }, [
                                                            createVNode("p", {
                                                              "data-slot": "childLinkLabel",
                                                              class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                            }, [
                                                              createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                              childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                                key: 0,
                                                                name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                                "data-slot": "childLinkLabelExternalIcon",
                                                                class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                              }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                            ], 2),
                                                            childItem.description ? (openBlock(), createBlock("p", {
                                                              key: 0,
                                                              "data-slot": "childLinkDescription",
                                                              class: ui.value.childLinkDescription({ class: [props.ui?.childLinkDescription, item.ui?.childLinkDescription], active: childActive })
                                                            }, toDisplayString(childItem.description), 3)) : createCommentVNode("", true)
                                                          ], 2)
                                                        ];
                                                      }
                                                    }),
                                                    _: 2
                                                  }, _parent7, _scopeId6));
                                                } else {
                                                  return [
                                                    createVNode(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                                      "data-slot": "childLink",
                                                      class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                                    }), {
                                                      default: withCtx(() => [
                                                        childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                          key: 0,
                                                          name: childItem.icon,
                                                          "data-slot": "childLinkIcon",
                                                          class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                        }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                                        createVNode("div", {
                                                          "data-slot": "childLinkWrapper",
                                                          class: ui.value.childLinkWrapper({ class: [props.ui?.childLinkWrapper, item.ui?.childLinkWrapper] })
                                                        }, [
                                                          createVNode("p", {
                                                            "data-slot": "childLinkLabel",
                                                            class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                          }, [
                                                            createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                            childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                              key: 0,
                                                              name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                              "data-slot": "childLinkLabelExternalIcon",
                                                              class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                            }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                          ], 2),
                                                          childItem.description ? (openBlock(), createBlock("p", {
                                                            key: 0,
                                                            "data-slot": "childLinkDescription",
                                                            class: ui.value.childLinkDescription({ class: [props.ui?.childLinkDescription, item.ui?.childLinkDescription], active: childActive })
                                                          }, toDisplayString(childItem.description), 3)) : createCommentVNode("", true)
                                                        ], 2)
                                                      ]),
                                                      _: 2
                                                    }, 1040, ["class"])
                                                  ];
                                                }
                                              }),
                                              _: 2
                                            }, _parent6, _scopeId5));
                                          } else {
                                            return [
                                              createVNode(unref(NavigationMenuLink), {
                                                "as-child": "",
                                                active: childActive,
                                                onSelect: childItem.onSelect
                                              }, {
                                                default: withCtx(() => [
                                                  createVNode(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                                    "data-slot": "childLink",
                                                    class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                                  }), {
                                                    default: withCtx(() => [
                                                      childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                        key: 0,
                                                        name: childItem.icon,
                                                        "data-slot": "childLinkIcon",
                                                        class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                      }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                                      createVNode("div", {
                                                        "data-slot": "childLinkWrapper",
                                                        class: ui.value.childLinkWrapper({ class: [props.ui?.childLinkWrapper, item.ui?.childLinkWrapper] })
                                                      }, [
                                                        createVNode("p", {
                                                          "data-slot": "childLinkLabel",
                                                          class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                        }, [
                                                          createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                          childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                            key: 0,
                                                            name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                            "data-slot": "childLinkLabelExternalIcon",
                                                            class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                          }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                        ], 2),
                                                        childItem.description ? (openBlock(), createBlock("p", {
                                                          key: 0,
                                                          "data-slot": "childLinkDescription",
                                                          class: ui.value.childLinkDescription({ class: [props.ui?.childLinkDescription, item.ui?.childLinkDescription], active: childActive })
                                                        }, toDisplayString(childItem.description), 3)) : createCommentVNode("", true)
                                                      ], 2)
                                                    ]),
                                                    _: 2
                                                  }, 1040, ["class"])
                                                ]),
                                                _: 2
                                              }, 1032, ["active", "onSelect"])
                                            ];
                                          }
                                        }),
                                        _: 2
                                      }, _parent5, _scopeId4));
                                      _push5(`</li>`);
                                    });
                                    _push5(`<!--]--></ul>`);
                                  }, _push5, _parent5, _scopeId4);
                                } else {
                                  return [
                                    renderSlot(_ctx.$slots, item.slot ? `${item.slot}-content` : "item-content", {
                                      item,
                                      active: active || item.active,
                                      index,
                                      ui: ui.value
                                    }, () => [
                                      createVNode("ul", {
                                        "data-slot": "childList",
                                        class: ui.value.childList({ class: [props.ui?.childList, item.ui?.childList] })
                                      }, [
                                        (openBlock(true), createBlock(Fragment, null, renderList(item.children, (childItem, childIndex) => {
                                          return openBlock(), createBlock("li", {
                                            key: childIndex,
                                            "data-slot": "childItem",
                                            class: ui.value.childItem({ class: [props.ui?.childItem, item.ui?.childItem] })
                                          }, [
                                            createVNode(_sfc_main$9, mergeProps({ ref_for: true }, unref(pickLinkProps)(childItem), { custom: "" }), {
                                              default: withCtx(({ active: childActive, ...childSlotProps }) => [
                                                createVNode(unref(NavigationMenuLink), {
                                                  "as-child": "",
                                                  active: childActive,
                                                  onSelect: childItem.onSelect
                                                }, {
                                                  default: withCtx(() => [
                                                    createVNode(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                                      "data-slot": "childLink",
                                                      class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                                    }), {
                                                      default: withCtx(() => [
                                                        childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                          key: 0,
                                                          name: childItem.icon,
                                                          "data-slot": "childLinkIcon",
                                                          class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                        }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                                        createVNode("div", {
                                                          "data-slot": "childLinkWrapper",
                                                          class: ui.value.childLinkWrapper({ class: [props.ui?.childLinkWrapper, item.ui?.childLinkWrapper] })
                                                        }, [
                                                          createVNode("p", {
                                                            "data-slot": "childLinkLabel",
                                                            class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                          }, [
                                                            createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                            childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                              key: 0,
                                                              name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                              "data-slot": "childLinkLabelExternalIcon",
                                                              class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                            }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                          ], 2),
                                                          childItem.description ? (openBlock(), createBlock("p", {
                                                            key: 0,
                                                            "data-slot": "childLinkDescription",
                                                            class: ui.value.childLinkDescription({ class: [props.ui?.childLinkDescription, item.ui?.childLinkDescription], active: childActive })
                                                          }, toDisplayString(childItem.description), 3)) : createCommentVNode("", true)
                                                        ], 2)
                                                      ]),
                                                      _: 2
                                                    }, 1040, ["class"])
                                                  ]),
                                                  _: 2
                                                }, 1032, ["active", "onSelect"])
                                              ]),
                                              _: 2
                                            }, 1040)
                                          ], 2);
                                        }), 128))
                                      ], 2)
                                    ])
                                  ];
                                }
                              }),
                              _: 2
                            }, _parent4, _scopeId3));
                          } else {
                            _push4(`<!---->`);
                          }
                        } else {
                          return [
                            (openBlock(), createBlock(resolveDynamicComponent(__props.orientation === "horizontal" && (item.children?.length || !!slots[item.slot ? `${item.slot}-content` : "item-content"]) ? unref(NavigationMenuTrigger) : __props.orientation === "vertical" && item.children?.length && !__props.collapsed && !slotProps.href ? unref(AccordionTrigger) : unref(NavigationMenuLink)), {
                              "as-child": "",
                              active: active || item.active,
                              disabled: item.disabled,
                              onSelect: item.onSelect
                            }, {
                              default: withCtx(() => [
                                __props.orientation === "vertical" && __props.collapsed && item.children?.length && (!!props.popover || !!item.popover) ? (openBlock(), createBlock(_sfc_main$3, mergeProps({ key: 0 }, { ...popoverProps.value, ...typeof item.popover === "boolean" ? {} : item.popover || {} }, {
                                  ui: { content: ui.value.content({ class: [props.ui?.content, item.ui?.content] }) }
                                }), {
                                  content: withCtx(({ close }) => [
                                    renderSlot(_ctx.$slots, item.slot ? `${item.slot}-content` : "item-content", {
                                      item,
                                      active: active || item.active,
                                      index,
                                      ui: ui.value,
                                      close
                                    }, () => [
                                      createVNode("ul", {
                                        "data-slot": "childList",
                                        class: ui.value.childList({ class: [props.ui?.childList, item.ui?.childList] })
                                      }, [
                                        createVNode("li", {
                                          "data-slot": "childLabel",
                                          class: ui.value.childLabel({ class: [props.ui?.childLabel, item.ui?.childLabel] })
                                        }, toDisplayString(unref(get)(item, props.labelKey)), 3),
                                        (openBlock(true), createBlock(Fragment, null, renderList(item.children, (childItem, childIndex) => {
                                          return openBlock(), createBlock("li", {
                                            key: childIndex,
                                            "data-slot": "childItem",
                                            class: ui.value.childItem({ class: [props.ui?.childItem, item.ui?.childItem] })
                                          }, [
                                            createVNode(_sfc_main$9, mergeProps({ ref_for: true }, unref(pickLinkProps)(childItem), { custom: "" }), {
                                              default: withCtx(({ active: childActive, ...childSlotProps }) => [
                                                createVNode(unref(NavigationMenuLink), {
                                                  "as-child": "",
                                                  active: childActive,
                                                  onSelect: childItem.onSelect
                                                }, {
                                                  default: withCtx(() => [
                                                    createVNode(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                                      "data-slot": "childLink",
                                                      class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                                    }), {
                                                      default: withCtx(() => [
                                                        childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                          key: 0,
                                                          name: childItem.icon,
                                                          "data-slot": "childLinkIcon",
                                                          class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                        }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                                        createVNode("span", {
                                                          "data-slot": "childLinkLabel",
                                                          class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                        }, [
                                                          createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                          childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                            key: 0,
                                                            name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                            "data-slot": "childLinkLabelExternalIcon",
                                                            class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                          }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                        ], 2)
                                                      ]),
                                                      _: 2
                                                    }, 1040, ["class"])
                                                  ]),
                                                  _: 2
                                                }, 1032, ["active", "onSelect"])
                                              ]),
                                              _: 2
                                            }, 1040)
                                          ], 2);
                                        }), 128))
                                      ], 2)
                                    ])
                                  ]),
                                  default: withCtx(() => [
                                    createVNode(_sfc_main$1$1, mergeProps(slotProps, {
                                      "data-slot": "link",
                                      class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: level > 0 })
                                    }), {
                                      default: withCtx(() => [
                                        createVNode(unref(ReuseLinkTemplate), {
                                          item,
                                          active: active || item.active,
                                          index
                                        }, null, 8, ["item", "active", "index"])
                                      ]),
                                      _: 2
                                    }, 1040, ["class"])
                                  ]),
                                  _: 2
                                }, 1040, ["ui"])) : __props.orientation === "vertical" && __props.collapsed && (!!props.tooltip || !!item.tooltip) ? (openBlock(), createBlock(_sfc_main$2, mergeProps({
                                  key: 1,
                                  text: unref(get)(item, props.labelKey)
                                }, { ...tooltipProps.value, ...typeof item.tooltip === "boolean" ? {} : item.tooltip || {} }), {
                                  default: withCtx(() => [
                                    createVNode(_sfc_main$1$1, mergeProps(slotProps, {
                                      "data-slot": "link",
                                      class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: level > 0 })
                                    }), {
                                      default: withCtx(() => [
                                        createVNode(unref(ReuseLinkTemplate), {
                                          item,
                                          active: active || item.active,
                                          index
                                        }, null, 8, ["item", "active", "index"])
                                      ]),
                                      _: 2
                                    }, 1040, ["class"])
                                  ]),
                                  _: 2
                                }, 1040, ["text"])) : (openBlock(), createBlock(_sfc_main$1$1, mergeProps({ key: 2 }, slotProps, {
                                  "data-slot": "link",
                                  class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: __props.orientation === "horizontal" || level > 0 })
                                }), {
                                  default: withCtx(() => [
                                    createVNode(unref(ReuseLinkTemplate), {
                                      item,
                                      active: active || item.active,
                                      index
                                    }, null, 8, ["item", "active", "index"])
                                  ]),
                                  _: 2
                                }, 1040, ["class"]))
                              ]),
                              _: 2
                            }, 1064, ["active", "disabled", "onSelect"])),
                            __props.orientation === "horizontal" && (item.children?.length || !!slots[item.slot ? `${item.slot}-content` : "item-content"]) ? (openBlock(), createBlock(unref(NavigationMenuContent), mergeProps({ key: 0 }, contentProps.value, {
                              "data-slot": "content",
                              class: ui.value.content({ class: [props.ui?.content, item.ui?.content] })
                            }), {
                              default: withCtx(() => [
                                renderSlot(_ctx.$slots, item.slot ? `${item.slot}-content` : "item-content", {
                                  item,
                                  active: active || item.active,
                                  index,
                                  ui: ui.value
                                }, () => [
                                  createVNode("ul", {
                                    "data-slot": "childList",
                                    class: ui.value.childList({ class: [props.ui?.childList, item.ui?.childList] })
                                  }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(item.children, (childItem, childIndex) => {
                                      return openBlock(), createBlock("li", {
                                        key: childIndex,
                                        "data-slot": "childItem",
                                        class: ui.value.childItem({ class: [props.ui?.childItem, item.ui?.childItem] })
                                      }, [
                                        createVNode(_sfc_main$9, mergeProps({ ref_for: true }, unref(pickLinkProps)(childItem), { custom: "" }), {
                                          default: withCtx(({ active: childActive, ...childSlotProps }) => [
                                            createVNode(unref(NavigationMenuLink), {
                                              "as-child": "",
                                              active: childActive,
                                              onSelect: childItem.onSelect
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                                  "data-slot": "childLink",
                                                  class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                                }), {
                                                  default: withCtx(() => [
                                                    childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                      key: 0,
                                                      name: childItem.icon,
                                                      "data-slot": "childLinkIcon",
                                                      class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                    }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                                    createVNode("div", {
                                                      "data-slot": "childLinkWrapper",
                                                      class: ui.value.childLinkWrapper({ class: [props.ui?.childLinkWrapper, item.ui?.childLinkWrapper] })
                                                    }, [
                                                      createVNode("p", {
                                                        "data-slot": "childLinkLabel",
                                                        class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                      }, [
                                                        createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                        childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                          key: 0,
                                                          name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                          "data-slot": "childLinkLabelExternalIcon",
                                                          class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                        }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                      ], 2),
                                                      childItem.description ? (openBlock(), createBlock("p", {
                                                        key: 0,
                                                        "data-slot": "childLinkDescription",
                                                        class: ui.value.childLinkDescription({ class: [props.ui?.childLinkDescription, item.ui?.childLinkDescription], active: childActive })
                                                      }, toDisplayString(childItem.description), 3)) : createCommentVNode("", true)
                                                    ], 2)
                                                  ]),
                                                  _: 2
                                                }, 1040, ["class"])
                                              ]),
                                              _: 2
                                            }, 1032, ["active", "onSelect"])
                                          ]),
                                          _: 2
                                        }, 1040)
                                      ], 2);
                                    }), 128))
                                  ], 2)
                                ])
                              ]),
                              _: 2
                            }, 1040, ["class"])) : createCommentVNode("", true)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                  if (__props.orientation === "vertical" && item.children?.length && !__props.collapsed) {
                    _push3(ssrRenderComponent(unref(AccordionContent), {
                      "data-slot": "content",
                      class: ui.value.content({ class: [props.ui?.content, item.ui?.content] })
                    }, {
                      default: withCtx((_2, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(ssrRenderComponent(unref(AccordionRoot), mergeProps({
                            ...unref(accordionProps),
                            defaultValue: getAccordionDefaultValue(item.children, level + 1)
                          }, {
                            as: "ul",
                            "data-slot": "childList",
                            class: ui.value.childList({ class: props.ui?.childList })
                          }), {
                            default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(`<!--[-->`);
                                ssrRenderList(item.children, (childItem, childIndex) => {
                                  _push5(ssrRenderComponent(unref(ReuseItemTemplate), {
                                    key: childIndex,
                                    item: childItem,
                                    index: childIndex,
                                    level: level + 1,
                                    "data-slot": "childItem",
                                    class: ui.value.childItem({ class: [props.ui?.childItem, childItem.ui?.childItem] })
                                  }, null, _parent5, _scopeId4));
                                });
                                _push5(`<!--]-->`);
                              } else {
                                return [
                                  (openBlock(true), createBlock(Fragment, null, renderList(item.children, (childItem, childIndex) => {
                                    return openBlock(), createBlock(unref(ReuseItemTemplate), {
                                      key: childIndex,
                                      item: childItem,
                                      index: childIndex,
                                      level: level + 1,
                                      "data-slot": "childItem",
                                      class: ui.value.childItem({ class: [props.ui?.childItem, childItem.ui?.childItem] })
                                    }, null, 8, ["item", "index", "level", "class"]);
                                  }), 128))
                                ];
                              }
                            }),
                            _: 2
                          }, _parent4, _scopeId3));
                        } else {
                          return [
                            createVNode(unref(AccordionRoot), mergeProps({
                              ...unref(accordionProps),
                              defaultValue: getAccordionDefaultValue(item.children, level + 1)
                            }, {
                              as: "ul",
                              "data-slot": "childList",
                              class: ui.value.childList({ class: props.ui?.childList })
                            }), {
                              default: withCtx(() => [
                                (openBlock(true), createBlock(Fragment, null, renderList(item.children, (childItem, childIndex) => {
                                  return openBlock(), createBlock(unref(ReuseItemTemplate), {
                                    key: childIndex,
                                    item: childItem,
                                    index: childIndex,
                                    level: level + 1,
                                    "data-slot": "childItem",
                                    class: ui.value.childItem({ class: [props.ui?.childItem, childItem.ui?.childItem] })
                                  }, null, 8, ["item", "index", "level", "class"]);
                                }), 128))
                              ]),
                              _: 2
                            }, 1040, ["class"])
                          ];
                        }
                      }),
                      _: 2
                    }, _parent3, _scopeId2));
                  } else {
                    _push3(`<!---->`);
                  }
                } else {
                  return [
                    __props.orientation === "vertical" && item.type === "label" && !__props.collapsed ? (openBlock(), createBlock("div", {
                      key: 0,
                      "data-slot": "label",
                      class: ui.value.label({ class: [props.ui?.label, item.ui?.label, item.class] })
                    }, [
                      createVNode(unref(ReuseLinkTemplate), {
                        item,
                        index
                      }, null, 8, ["item", "index"])
                    ], 2)) : item.type !== "label" ? (openBlock(), createBlock(_sfc_main$9, mergeProps({ key: 1 }, __props.orientation === "vertical" && item.children?.length && !__props.collapsed && item.type === "trigger" ? {} : unref(pickLinkProps)(item), { custom: "" }), {
                      default: withCtx(({ active, ...slotProps }) => [
                        (openBlock(), createBlock(resolveDynamicComponent(__props.orientation === "horizontal" && (item.children?.length || !!slots[item.slot ? `${item.slot}-content` : "item-content"]) ? unref(NavigationMenuTrigger) : __props.orientation === "vertical" && item.children?.length && !__props.collapsed && !slotProps.href ? unref(AccordionTrigger) : unref(NavigationMenuLink)), {
                          "as-child": "",
                          active: active || item.active,
                          disabled: item.disabled,
                          onSelect: item.onSelect
                        }, {
                          default: withCtx(() => [
                            __props.orientation === "vertical" && __props.collapsed && item.children?.length && (!!props.popover || !!item.popover) ? (openBlock(), createBlock(_sfc_main$3, mergeProps({ key: 0 }, { ...popoverProps.value, ...typeof item.popover === "boolean" ? {} : item.popover || {} }, {
                              ui: { content: ui.value.content({ class: [props.ui?.content, item.ui?.content] }) }
                            }), {
                              content: withCtx(({ close }) => [
                                renderSlot(_ctx.$slots, item.slot ? `${item.slot}-content` : "item-content", {
                                  item,
                                  active: active || item.active,
                                  index,
                                  ui: ui.value,
                                  close
                                }, () => [
                                  createVNode("ul", {
                                    "data-slot": "childList",
                                    class: ui.value.childList({ class: [props.ui?.childList, item.ui?.childList] })
                                  }, [
                                    createVNode("li", {
                                      "data-slot": "childLabel",
                                      class: ui.value.childLabel({ class: [props.ui?.childLabel, item.ui?.childLabel] })
                                    }, toDisplayString(unref(get)(item, props.labelKey)), 3),
                                    (openBlock(true), createBlock(Fragment, null, renderList(item.children, (childItem, childIndex) => {
                                      return openBlock(), createBlock("li", {
                                        key: childIndex,
                                        "data-slot": "childItem",
                                        class: ui.value.childItem({ class: [props.ui?.childItem, item.ui?.childItem] })
                                      }, [
                                        createVNode(_sfc_main$9, mergeProps({ ref_for: true }, unref(pickLinkProps)(childItem), { custom: "" }), {
                                          default: withCtx(({ active: childActive, ...childSlotProps }) => [
                                            createVNode(unref(NavigationMenuLink), {
                                              "as-child": "",
                                              active: childActive,
                                              onSelect: childItem.onSelect
                                            }, {
                                              default: withCtx(() => [
                                                createVNode(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                                  "data-slot": "childLink",
                                                  class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                                }), {
                                                  default: withCtx(() => [
                                                    childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                      key: 0,
                                                      name: childItem.icon,
                                                      "data-slot": "childLinkIcon",
                                                      class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                    }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                                    createVNode("span", {
                                                      "data-slot": "childLinkLabel",
                                                      class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                    }, [
                                                      createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                      childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                        key: 0,
                                                        name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                        "data-slot": "childLinkLabelExternalIcon",
                                                        class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                      }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                    ], 2)
                                                  ]),
                                                  _: 2
                                                }, 1040, ["class"])
                                              ]),
                                              _: 2
                                            }, 1032, ["active", "onSelect"])
                                          ]),
                                          _: 2
                                        }, 1040)
                                      ], 2);
                                    }), 128))
                                  ], 2)
                                ])
                              ]),
                              default: withCtx(() => [
                                createVNode(_sfc_main$1$1, mergeProps(slotProps, {
                                  "data-slot": "link",
                                  class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: level > 0 })
                                }), {
                                  default: withCtx(() => [
                                    createVNode(unref(ReuseLinkTemplate), {
                                      item,
                                      active: active || item.active,
                                      index
                                    }, null, 8, ["item", "active", "index"])
                                  ]),
                                  _: 2
                                }, 1040, ["class"])
                              ]),
                              _: 2
                            }, 1040, ["ui"])) : __props.orientation === "vertical" && __props.collapsed && (!!props.tooltip || !!item.tooltip) ? (openBlock(), createBlock(_sfc_main$2, mergeProps({
                              key: 1,
                              text: unref(get)(item, props.labelKey)
                            }, { ...tooltipProps.value, ...typeof item.tooltip === "boolean" ? {} : item.tooltip || {} }), {
                              default: withCtx(() => [
                                createVNode(_sfc_main$1$1, mergeProps(slotProps, {
                                  "data-slot": "link",
                                  class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: level > 0 })
                                }), {
                                  default: withCtx(() => [
                                    createVNode(unref(ReuseLinkTemplate), {
                                      item,
                                      active: active || item.active,
                                      index
                                    }, null, 8, ["item", "active", "index"])
                                  ]),
                                  _: 2
                                }, 1040, ["class"])
                              ]),
                              _: 2
                            }, 1040, ["text"])) : (openBlock(), createBlock(_sfc_main$1$1, mergeProps({ key: 2 }, slotProps, {
                              "data-slot": "link",
                              class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: __props.orientation === "horizontal" || level > 0 })
                            }), {
                              default: withCtx(() => [
                                createVNode(unref(ReuseLinkTemplate), {
                                  item,
                                  active: active || item.active,
                                  index
                                }, null, 8, ["item", "active", "index"])
                              ]),
                              _: 2
                            }, 1040, ["class"]))
                          ]),
                          _: 2
                        }, 1064, ["active", "disabled", "onSelect"])),
                        __props.orientation === "horizontal" && (item.children?.length || !!slots[item.slot ? `${item.slot}-content` : "item-content"]) ? (openBlock(), createBlock(unref(NavigationMenuContent), mergeProps({ key: 0 }, contentProps.value, {
                          "data-slot": "content",
                          class: ui.value.content({ class: [props.ui?.content, item.ui?.content] })
                        }), {
                          default: withCtx(() => [
                            renderSlot(_ctx.$slots, item.slot ? `${item.slot}-content` : "item-content", {
                              item,
                              active: active || item.active,
                              index,
                              ui: ui.value
                            }, () => [
                              createVNode("ul", {
                                "data-slot": "childList",
                                class: ui.value.childList({ class: [props.ui?.childList, item.ui?.childList] })
                              }, [
                                (openBlock(true), createBlock(Fragment, null, renderList(item.children, (childItem, childIndex) => {
                                  return openBlock(), createBlock("li", {
                                    key: childIndex,
                                    "data-slot": "childItem",
                                    class: ui.value.childItem({ class: [props.ui?.childItem, item.ui?.childItem] })
                                  }, [
                                    createVNode(_sfc_main$9, mergeProps({ ref_for: true }, unref(pickLinkProps)(childItem), { custom: "" }), {
                                      default: withCtx(({ active: childActive, ...childSlotProps }) => [
                                        createVNode(unref(NavigationMenuLink), {
                                          "as-child": "",
                                          active: childActive,
                                          onSelect: childItem.onSelect
                                        }, {
                                          default: withCtx(() => [
                                            createVNode(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                              "data-slot": "childLink",
                                              class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                            }), {
                                              default: withCtx(() => [
                                                childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                  key: 0,
                                                  name: childItem.icon,
                                                  "data-slot": "childLinkIcon",
                                                  class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                                createVNode("div", {
                                                  "data-slot": "childLinkWrapper",
                                                  class: ui.value.childLinkWrapper({ class: [props.ui?.childLinkWrapper, item.ui?.childLinkWrapper] })
                                                }, [
                                                  createVNode("p", {
                                                    "data-slot": "childLinkLabel",
                                                    class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                  }, [
                                                    createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                    childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                      key: 0,
                                                      name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                      "data-slot": "childLinkLabelExternalIcon",
                                                      class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                    }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                  ], 2),
                                                  childItem.description ? (openBlock(), createBlock("p", {
                                                    key: 0,
                                                    "data-slot": "childLinkDescription",
                                                    class: ui.value.childLinkDescription({ class: [props.ui?.childLinkDescription, item.ui?.childLinkDescription], active: childActive })
                                                  }, toDisplayString(childItem.description), 3)) : createCommentVNode("", true)
                                                ], 2)
                                              ]),
                                              _: 2
                                            }, 1040, ["class"])
                                          ]),
                                          _: 2
                                        }, 1032, ["active", "onSelect"])
                                      ]),
                                      _: 2
                                    }, 1040)
                                  ], 2);
                                }), 128))
                              ], 2)
                            ])
                          ]),
                          _: 2
                        }, 1040, ["class"])) : createCommentVNode("", true)
                      ]),
                      _: 2
                    }, 1040)) : createCommentVNode("", true),
                    __props.orientation === "vertical" && item.children?.length && !__props.collapsed ? (openBlock(), createBlock(unref(AccordionContent), {
                      key: 2,
                      "data-slot": "content",
                      class: ui.value.content({ class: [props.ui?.content, item.ui?.content] })
                    }, {
                      default: withCtx(() => [
                        createVNode(unref(AccordionRoot), mergeProps({
                          ...unref(accordionProps),
                          defaultValue: getAccordionDefaultValue(item.children, level + 1)
                        }, {
                          as: "ul",
                          "data-slot": "childList",
                          class: ui.value.childList({ class: props.ui?.childList })
                        }), {
                          default: withCtx(() => [
                            (openBlock(true), createBlock(Fragment, null, renderList(item.children, (childItem, childIndex) => {
                              return openBlock(), createBlock(unref(ReuseItemTemplate), {
                                key: childIndex,
                                item: childItem,
                                index: childIndex,
                                level: level + 1,
                                "data-slot": "childItem",
                                class: ui.value.childItem({ class: [props.ui?.childItem, childItem.ui?.childItem] })
                              }, null, 8, ["item", "index", "level", "class"]);
                            }), 128))
                          ]),
                          _: 2
                        }, 1040, ["class"])
                      ]),
                      _: 2
                    }, 1032, ["class"])) : createCommentVNode("", true)
                  ];
                }
              }),
              _: 2
            }), _parent2, _scopeId);
          } else {
            return [
              (openBlock(), createBlock(resolveDynamicComponent(__props.orientation === "vertical" && !__props.collapsed ? unref(AccordionItem) : unref(NavigationMenuItem)), {
                as: "li",
                value: item.value || (level > 0 ? `item-${level}-${index}` : `item-${index}`)
              }, {
                default: withCtx(() => [
                  __props.orientation === "vertical" && item.type === "label" && !__props.collapsed ? (openBlock(), createBlock("div", {
                    key: 0,
                    "data-slot": "label",
                    class: ui.value.label({ class: [props.ui?.label, item.ui?.label, item.class] })
                  }, [
                    createVNode(unref(ReuseLinkTemplate), {
                      item,
                      index
                    }, null, 8, ["item", "index"])
                  ], 2)) : item.type !== "label" ? (openBlock(), createBlock(_sfc_main$9, mergeProps({ key: 1 }, __props.orientation === "vertical" && item.children?.length && !__props.collapsed && item.type === "trigger" ? {} : unref(pickLinkProps)(item), { custom: "" }), {
                    default: withCtx(({ active, ...slotProps }) => [
                      (openBlock(), createBlock(resolveDynamicComponent(__props.orientation === "horizontal" && (item.children?.length || !!slots[item.slot ? `${item.slot}-content` : "item-content"]) ? unref(NavigationMenuTrigger) : __props.orientation === "vertical" && item.children?.length && !__props.collapsed && !slotProps.href ? unref(AccordionTrigger) : unref(NavigationMenuLink)), {
                        "as-child": "",
                        active: active || item.active,
                        disabled: item.disabled,
                        onSelect: item.onSelect
                      }, {
                        default: withCtx(() => [
                          __props.orientation === "vertical" && __props.collapsed && item.children?.length && (!!props.popover || !!item.popover) ? (openBlock(), createBlock(_sfc_main$3, mergeProps({ key: 0 }, { ...popoverProps.value, ...typeof item.popover === "boolean" ? {} : item.popover || {} }, {
                            ui: { content: ui.value.content({ class: [props.ui?.content, item.ui?.content] }) }
                          }), {
                            content: withCtx(({ close }) => [
                              renderSlot(_ctx.$slots, item.slot ? `${item.slot}-content` : "item-content", {
                                item,
                                active: active || item.active,
                                index,
                                ui: ui.value,
                                close
                              }, () => [
                                createVNode("ul", {
                                  "data-slot": "childList",
                                  class: ui.value.childList({ class: [props.ui?.childList, item.ui?.childList] })
                                }, [
                                  createVNode("li", {
                                    "data-slot": "childLabel",
                                    class: ui.value.childLabel({ class: [props.ui?.childLabel, item.ui?.childLabel] })
                                  }, toDisplayString(unref(get)(item, props.labelKey)), 3),
                                  (openBlock(true), createBlock(Fragment, null, renderList(item.children, (childItem, childIndex) => {
                                    return openBlock(), createBlock("li", {
                                      key: childIndex,
                                      "data-slot": "childItem",
                                      class: ui.value.childItem({ class: [props.ui?.childItem, item.ui?.childItem] })
                                    }, [
                                      createVNode(_sfc_main$9, mergeProps({ ref_for: true }, unref(pickLinkProps)(childItem), { custom: "" }), {
                                        default: withCtx(({ active: childActive, ...childSlotProps }) => [
                                          createVNode(unref(NavigationMenuLink), {
                                            "as-child": "",
                                            active: childActive,
                                            onSelect: childItem.onSelect
                                          }, {
                                            default: withCtx(() => [
                                              createVNode(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                                "data-slot": "childLink",
                                                class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                              }), {
                                                default: withCtx(() => [
                                                  childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                    key: 0,
                                                    name: childItem.icon,
                                                    "data-slot": "childLinkIcon",
                                                    class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                                  }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                                  createVNode("span", {
                                                    "data-slot": "childLinkLabel",
                                                    class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                  }, [
                                                    createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                    childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                      key: 0,
                                                      name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                      "data-slot": "childLinkLabelExternalIcon",
                                                      class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                    }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                  ], 2)
                                                ]),
                                                _: 2
                                              }, 1040, ["class"])
                                            ]),
                                            _: 2
                                          }, 1032, ["active", "onSelect"])
                                        ]),
                                        _: 2
                                      }, 1040)
                                    ], 2);
                                  }), 128))
                                ], 2)
                              ])
                            ]),
                            default: withCtx(() => [
                              createVNode(_sfc_main$1$1, mergeProps(slotProps, {
                                "data-slot": "link",
                                class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: level > 0 })
                              }), {
                                default: withCtx(() => [
                                  createVNode(unref(ReuseLinkTemplate), {
                                    item,
                                    active: active || item.active,
                                    index
                                  }, null, 8, ["item", "active", "index"])
                                ]),
                                _: 2
                              }, 1040, ["class"])
                            ]),
                            _: 2
                          }, 1040, ["ui"])) : __props.orientation === "vertical" && __props.collapsed && (!!props.tooltip || !!item.tooltip) ? (openBlock(), createBlock(_sfc_main$2, mergeProps({
                            key: 1,
                            text: unref(get)(item, props.labelKey)
                          }, { ...tooltipProps.value, ...typeof item.tooltip === "boolean" ? {} : item.tooltip || {} }), {
                            default: withCtx(() => [
                              createVNode(_sfc_main$1$1, mergeProps(slotProps, {
                                "data-slot": "link",
                                class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: level > 0 })
                              }), {
                                default: withCtx(() => [
                                  createVNode(unref(ReuseLinkTemplate), {
                                    item,
                                    active: active || item.active,
                                    index
                                  }, null, 8, ["item", "active", "index"])
                                ]),
                                _: 2
                              }, 1040, ["class"])
                            ]),
                            _: 2
                          }, 1040, ["text"])) : (openBlock(), createBlock(_sfc_main$1$1, mergeProps({ key: 2 }, slotProps, {
                            "data-slot": "link",
                            class: ui.value.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: __props.orientation === "horizontal" || level > 0 })
                          }), {
                            default: withCtx(() => [
                              createVNode(unref(ReuseLinkTemplate), {
                                item,
                                active: active || item.active,
                                index
                              }, null, 8, ["item", "active", "index"])
                            ]),
                            _: 2
                          }, 1040, ["class"]))
                        ]),
                        _: 2
                      }, 1064, ["active", "disabled", "onSelect"])),
                      __props.orientation === "horizontal" && (item.children?.length || !!slots[item.slot ? `${item.slot}-content` : "item-content"]) ? (openBlock(), createBlock(unref(NavigationMenuContent), mergeProps({ key: 0 }, contentProps.value, {
                        "data-slot": "content",
                        class: ui.value.content({ class: [props.ui?.content, item.ui?.content] })
                      }), {
                        default: withCtx(() => [
                          renderSlot(_ctx.$slots, item.slot ? `${item.slot}-content` : "item-content", {
                            item,
                            active: active || item.active,
                            index,
                            ui: ui.value
                          }, () => [
                            createVNode("ul", {
                              "data-slot": "childList",
                              class: ui.value.childList({ class: [props.ui?.childList, item.ui?.childList] })
                            }, [
                              (openBlock(true), createBlock(Fragment, null, renderList(item.children, (childItem, childIndex) => {
                                return openBlock(), createBlock("li", {
                                  key: childIndex,
                                  "data-slot": "childItem",
                                  class: ui.value.childItem({ class: [props.ui?.childItem, item.ui?.childItem] })
                                }, [
                                  createVNode(_sfc_main$9, mergeProps({ ref_for: true }, unref(pickLinkProps)(childItem), { custom: "" }), {
                                    default: withCtx(({ active: childActive, ...childSlotProps }) => [
                                      createVNode(unref(NavigationMenuLink), {
                                        "as-child": "",
                                        active: childActive,
                                        onSelect: childItem.onSelect
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(_sfc_main$1$1, mergeProps({ ref_for: true }, childSlotProps, {
                                            "data-slot": "childLink",
                                            class: ui.value.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })
                                          }), {
                                            default: withCtx(() => [
                                              childItem.icon ? (openBlock(), createBlock(_sfc_main$5, {
                                                key: 0,
                                                name: childItem.icon,
                                                "data-slot": "childLinkIcon",
                                                class: ui.value.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })
                                              }, null, 8, ["name", "class"])) : createCommentVNode("", true),
                                              createVNode("div", {
                                                "data-slot": "childLinkWrapper",
                                                class: ui.value.childLinkWrapper({ class: [props.ui?.childLinkWrapper, item.ui?.childLinkWrapper] })
                                              }, [
                                                createVNode("p", {
                                                  "data-slot": "childLinkLabel",
                                                  class: ui.value.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })
                                                }, [
                                                  createTextVNode(toDisplayString(unref(get)(childItem, props.labelKey)) + " ", 1),
                                                  childItem.target === "_blank" && __props.externalIcon !== false ? (openBlock(), createBlock(_sfc_main$5, {
                                                    key: 0,
                                                    name: typeof __props.externalIcon === "string" ? __props.externalIcon : unref(appConfig).ui.icons.external,
                                                    "data-slot": "childLinkLabelExternalIcon",
                                                    class: ui.value.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })
                                                  }, null, 8, ["name", "class"])) : createCommentVNode("", true)
                                                ], 2),
                                                childItem.description ? (openBlock(), createBlock("p", {
                                                  key: 0,
                                                  "data-slot": "childLinkDescription",
                                                  class: ui.value.childLinkDescription({ class: [props.ui?.childLinkDescription, item.ui?.childLinkDescription], active: childActive })
                                                }, toDisplayString(childItem.description), 3)) : createCommentVNode("", true)
                                              ], 2)
                                            ]),
                                            _: 2
                                          }, 1040, ["class"])
                                        ]),
                                        _: 2
                                      }, 1032, ["active", "onSelect"])
                                    ]),
                                    _: 2
                                  }, 1040)
                                ], 2);
                              }), 128))
                            ], 2)
                          ])
                        ]),
                        _: 2
                      }, 1040, ["class"])) : createCommentVNode("", true)
                    ]),
                    _: 2
                  }, 1040)) : createCommentVNode("", true),
                  __props.orientation === "vertical" && item.children?.length && !__props.collapsed ? (openBlock(), createBlock(unref(AccordionContent), {
                    key: 2,
                    "data-slot": "content",
                    class: ui.value.content({ class: [props.ui?.content, item.ui?.content] })
                  }, {
                    default: withCtx(() => [
                      createVNode(unref(AccordionRoot), mergeProps({
                        ...unref(accordionProps),
                        defaultValue: getAccordionDefaultValue(item.children, level + 1)
                      }, {
                        as: "ul",
                        "data-slot": "childList",
                        class: ui.value.childList({ class: props.ui?.childList })
                      }), {
                        default: withCtx(() => [
                          (openBlock(true), createBlock(Fragment, null, renderList(item.children, (childItem, childIndex) => {
                            return openBlock(), createBlock(unref(ReuseItemTemplate), {
                              key: childIndex,
                              item: childItem,
                              index: childIndex,
                              level: level + 1,
                              "data-slot": "childItem",
                              class: ui.value.childItem({ class: [props.ui?.childItem, childItem.ui?.childItem] })
                            }, null, 8, ["item", "index", "level", "class"]);
                          }), 128))
                        ]),
                        _: 2
                      }, 1040, ["class"])
                    ]),
                    _: 2
                  }, 1032, ["class"])) : createCommentVNode("", true)
                ]),
                _: 2
              }, 1032, ["value"]))
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(ssrRenderComponent(unref(NavigationMenuRoot), mergeProps({
        ...unref(rootProps),
        ...__props.orientation === "horizontal" ? {
          modelValue: __props.modelValue,
          defaultValue: __props.defaultValue
        } : {},
        ..._ctx.$attrs
      }, {
        "data-collapsed": __props.collapsed,
        "data-slot": "root",
        class: ui.value.root({ class: [props.ui?.root, props.class] })
      }), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "list-leading", {}, null, _push2, _parent2, _scopeId);
            _push2(`<!--[-->`);
            ssrRenderList(lists.value, (list, listIndex) => {
              _push2(`<!--[-->`);
              ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(__props.orientation === "vertical" ? unref(AccordionRoot) : unref(NavigationMenuList)), mergeProps({ ref_for: true }, __props.orientation === "vertical" && !__props.collapsed ? {
                ...unref(accordionProps),
                modelValue: __props.modelValue,
                defaultValue: __props.defaultValue ?? getAccordionDefaultValue(list)
              } : {}, {
                as: "ul",
                "data-slot": "list",
                class: ui.value.list({ class: props.ui?.list })
              }), {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<!--[-->`);
                    ssrRenderList(list, (item, index) => {
                      _push3(ssrRenderComponent(unref(ReuseItemTemplate), {
                        key: `list-${listIndex}-${index}`,
                        item,
                        index,
                        "data-slot": "item",
                        class: ui.value.item({ class: [props.ui?.item, item.ui?.item] })
                      }, null, _parent3, _scopeId2));
                    });
                    _push3(`<!--]-->`);
                  } else {
                    return [
                      (openBlock(true), createBlock(Fragment, null, renderList(list, (item, index) => {
                        return openBlock(), createBlock(unref(ReuseItemTemplate), {
                          key: `list-${listIndex}-${index}`,
                          item,
                          index,
                          "data-slot": "item",
                          class: ui.value.item({ class: [props.ui?.item, item.ui?.item] })
                        }, null, 8, ["item", "index", "class"]);
                      }), 128))
                    ];
                  }
                }),
                _: 2
              }), _parent2, _scopeId);
              if (__props.orientation === "vertical" && listIndex < lists.value.length - 1) {
                _push2(`<div data-slot="separator" class="${ssrRenderClass(ui.value.separator({ class: props.ui?.separator }))}"${_scopeId}></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<!--]-->`);
            });
            _push2(`<!--]-->`);
            ssrRenderSlot(_ctx.$slots, "list-trailing", {}, null, _push2, _parent2, _scopeId);
            if (__props.orientation === "horizontal") {
              _push2(`<div data-slot="viewportWrapper" class="${ssrRenderClass(ui.value.viewportWrapper({ class: props.ui?.viewportWrapper }))}"${_scopeId}>`);
              if (__props.arrow) {
                _push2(ssrRenderComponent(unref(NavigationMenuIndicator), {
                  "data-slot": "indicator",
                  class: ui.value.indicator({ class: props.ui?.indicator })
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<div data-slot="arrow" class="${ssrRenderClass(ui.value.arrow({ class: props.ui?.arrow }))}"${_scopeId2}></div>`);
                    } else {
                      return [
                        createVNode("div", {
                          "data-slot": "arrow",
                          class: ui.value.arrow({ class: props.ui?.arrow })
                        }, null, 2)
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              _push2(ssrRenderComponent(unref(NavigationMenuViewport), {
                "data-slot": "viewport",
                class: ui.value.viewport({ class: props.ui?.viewport })
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              renderSlot(_ctx.$slots, "list-leading"),
              (openBlock(true), createBlock(Fragment, null, renderList(lists.value, (list, listIndex) => {
                return openBlock(), createBlock(Fragment, {
                  key: `list-${listIndex}`
                }, [
                  (openBlock(), createBlock(resolveDynamicComponent(__props.orientation === "vertical" ? unref(AccordionRoot) : unref(NavigationMenuList)), mergeProps({ ref_for: true }, __props.orientation === "vertical" && !__props.collapsed ? {
                    ...unref(accordionProps),
                    modelValue: __props.modelValue,
                    defaultValue: __props.defaultValue ?? getAccordionDefaultValue(list)
                  } : {}, {
                    as: "ul",
                    "data-slot": "list",
                    class: ui.value.list({ class: props.ui?.list })
                  }), {
                    default: withCtx(() => [
                      (openBlock(true), createBlock(Fragment, null, renderList(list, (item, index) => {
                        return openBlock(), createBlock(unref(ReuseItemTemplate), {
                          key: `list-${listIndex}-${index}`,
                          item,
                          index,
                          "data-slot": "item",
                          class: ui.value.item({ class: [props.ui?.item, item.ui?.item] })
                        }, null, 8, ["item", "index", "class"]);
                      }), 128))
                    ]),
                    _: 2
                  }, 1040, ["class"])),
                  __props.orientation === "vertical" && listIndex < lists.value.length - 1 ? (openBlock(), createBlock("div", {
                    key: 0,
                    "data-slot": "separator",
                    class: ui.value.separator({ class: props.ui?.separator })
                  }, null, 2)) : createCommentVNode("", true)
                ], 64);
              }), 128)),
              renderSlot(_ctx.$slots, "list-trailing"),
              __props.orientation === "horizontal" ? (openBlock(), createBlock("div", {
                key: 0,
                "data-slot": "viewportWrapper",
                class: ui.value.viewportWrapper({ class: props.ui?.viewportWrapper })
              }, [
                __props.arrow ? (openBlock(), createBlock(unref(NavigationMenuIndicator), {
                  key: 0,
                  "data-slot": "indicator",
                  class: ui.value.indicator({ class: props.ui?.indicator })
                }, {
                  default: withCtx(() => [
                    createVNode("div", {
                      "data-slot": "arrow",
                      class: ui.value.arrow({ class: props.ui?.arrow })
                    }, null, 2)
                  ]),
                  _: 1
                }, 8, ["class"])) : createCommentVNode("", true),
                createVNode(unref(NavigationMenuViewport), {
                  "data-slot": "viewport",
                  class: ui.value.viewport({ class: props.ui?.viewport })
                }, null, 8, ["class"])
              ], 2)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/NavigationMenu.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { logout, loading, accessToken, isAuthenticated } = useAuth();
    const showHeader = computed(() => !["/login", "/register"].includes(route.path));
    const userEmail = computed(() => {
      if (!accessToken.value) return "";
      try {
        const { sub } = jwtDecode(accessToken.value);
        return sub;
      } catch {
        return "";
      }
    });
    const items = ref([
      {
        label: "Объявления",
        icon: "mdi:house-find-outline",
        to: "/offers"
      },
      {
        label: "Избранное",
        icon: "material-symbols-light:favorite",
        to: "/favorites"
      },
      {
        label: "Аналитика",
        icon: "icon-park-solid:analysis",
        to: "/board"
      },
      {
        label: "Карта",
        icon: "uiw:map",
        // badge: '3.8k',
        to: "/map"
      },
      {
        label: "сас",
        icon: "uiw:map",
        // badge: '3.8k',
        to: "/kek"
      }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UContainer = _sfc_main$4;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UIcon = _sfc_main$5;
      const _component_UNavigationMenu = _sfc_main$1;
      const _component_UButton = _sfc_main$6;
      _push(`<!--[-->`);
      if (unref(showHeader)) {
        _push(`<header class="header" data-v-7466ef2c>`);
        _push(ssrRenderComponent(_component_UContainer, { class: "flex min-w-360 justify-between items-center gap-3 h-16" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/",
                class: "logo"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_UIcon, {
                      name: "ic:round-maps-home-work",
                      class: "logo-icon"
                    }, null, _parent3, _scopeId2));
                    _push3(`<span data-v-7466ef2c${_scopeId2}>Real</span><span class="text-primary" data-v-7466ef2c${_scopeId2}>Estate</span>`);
                  } else {
                    return [
                      createVNode(_component_UIcon, {
                        name: "ic:round-maps-home-work",
                        class: "logo-icon"
                      }),
                      createVNode("span", null, "Real"),
                      createVNode("span", { class: "text-primary" }, "Estate")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_UNavigationMenu, {
                highlight: "",
                class: "text-xl",
                items: unref(items)
              }, null, _parent2, _scopeId));
              _push2(`<div class="right" data-v-7466ef2c${_scopeId}><div class="auth" data-v-7466ef2c${_scopeId}>`);
              if (unref(isAuthenticated)) {
                _push2(`<!--[--><span class="user-email" data-v-7466ef2c${_scopeId}>${ssrInterpolate(unref(userEmail))}</span>`);
                _push2(ssrRenderComponent(_component_UButton, {
                  class: "cursor-pointer",
                  variant: "soft",
                  onClick: unref(logout),
                  loading: unref(loading),
                  size: "sm"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` Выйти `);
                    } else {
                      return [
                        createTextVNode(" Выйти ")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`<!--]-->`);
              } else {
                _push2(`<!--[-->`);
                _push2(ssrRenderComponent(_component_UButton, {
                  variant: "soft",
                  onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/login"),
                  size: "sm"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Войти`);
                    } else {
                      return [
                        createTextVNode("Войти")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UButton, {
                  variant: "solid",
                  onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/register"),
                  size: "sm"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`Регистрация`);
                    } else {
                      return [
                        createTextVNode("Регистрация")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`<!--]-->`);
              }
              _push2(`</div></div>`);
            } else {
              return [
                createVNode(_component_NuxtLink, {
                  to: "/",
                  class: "logo"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_UIcon, {
                      name: "ic:round-maps-home-work",
                      class: "logo-icon"
                    }),
                    createVNode("span", null, "Real"),
                    createVNode("span", { class: "text-primary" }, "Estate")
                  ]),
                  _: 1
                }),
                createVNode(_component_UNavigationMenu, {
                  highlight: "",
                  class: "text-xl",
                  items: unref(items)
                }, null, 8, ["items"]),
                createVNode("div", { class: "right" }, [
                  createVNode("div", { class: "auth" }, [
                    unref(isAuthenticated) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                      createVNode("span", { class: "user-email" }, toDisplayString(unref(userEmail)), 1),
                      createVNode(_component_UButton, {
                        class: "cursor-pointer",
                        variant: "soft",
                        onClick: unref(logout),
                        loading: unref(loading),
                        size: "sm"
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" Выйти ")
                        ]),
                        _: 1
                      }, 8, ["onClick", "loading"])
                    ], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                      createVNode(_component_UButton, {
                        variant: "soft",
                        onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/login"),
                        size: "sm"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Войти")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(_component_UButton, {
                        variant: "solid",
                        onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/register"),
                        size: "sm"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Регистрация")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ], 64))
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</header>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7466ef2c"]]);

export { _default as default };
//# sourceMappingURL=default-Cw94HeWr.mjs.map
