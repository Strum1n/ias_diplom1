import { _ as _sfc_main$1 } from './Container-CHeSAjL4.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-D5XjKnnj.mjs';
import { _ as _sfc_main$2 } from './Icon-CX2WwP6o.mjs';
import { _ as _sfc_main$3 } from './Button-C2DhPQmq.mjs';
import { _ as _export_sfc, d as useRoute, c as useAuth, n as navigateTo } from './server.mjs';
import { defineComponent, computed, unref, withCtx, createVNode, createTextVNode, createBlock, openBlock, Fragment, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { jwtDecode } from 'jwt-decode';
import 'reka-ui';
import './tv-DuV4YVUe.mjs';
import 'tailwind-variants';
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
import './index-DNDp3pOy.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import './asyncData-BG26t6Y0.mjs';
import 'vue-router';
import 'tailwindcss/colors';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import '@vueuse/core';
import './Avatar-BbsafSqM.mjs';
import './virtual_nuxt_G__My_Programs_IAS-diplom_app_frontend_nuxt-app_node_modules_.cache_nuxt_.nuxt_ui-image-component-CX5_T5UE.mjs';
import './useFormField-C7CorFZK.mjs';
import './index-CED3XvSe.mjs';
import './Link-C0gX2JZv.mjs';

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
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UContainer = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UIcon = _sfc_main$2;
      const _component_UButton = _sfc_main$3;
      _push(`<!--[-->`);
      if (unref(showHeader)) {
        _push(`<header class="header" data-v-0337c837>`);
        _push(ssrRenderComponent(_component_UContainer, { class: "container" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="header-inner" data-v-0337c837${_scopeId}><div class="left" data-v-0337c837${_scopeId}>`);
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
                    _push3(`<span data-v-0337c837${_scopeId2}>RealEstate</span>`);
                  } else {
                    return [
                      createVNode(_component_UIcon, {
                        name: "ic:round-maps-home-work",
                        class: "logo-icon"
                      }),
                      createVNode("span", null, "RealEstate")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`<nav class="nav" data-v-0337c837${_scopeId}>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/offers",
                class: "nav-link",
                "active-class": "nav-link-active"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Объявления`);
                  } else {
                    return [
                      createTextVNode("Объявления")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/favorites2",
                class: "nav-link",
                "active-class": "nav-link-active"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Избранное`);
                  } else {
                    return [
                      createTextVNode("Избранное")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/board",
                class: "nav-link",
                "active-class": "nav-link-active"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Аналитика`);
                  } else {
                    return [
                      createTextVNode("Аналитика")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/map",
                prefetch: "",
                class: "nav-link",
                "active-class": "nav-link-active"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Карта`);
                  } else {
                    return [
                      createTextVNode("Карта")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</nav></div><div class="right" data-v-0337c837${_scopeId}><div class="auth" data-v-0337c837${_scopeId}>`);
              if (unref(isAuthenticated)) {
                _push2(`<!--[--><span class="user-email" data-v-0337c837${_scopeId}>${ssrInterpolate(unref(userEmail))}</span>`);
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
              _push2(`</div></div></div>`);
            } else {
              return [
                createVNode("div", { class: "header-inner" }, [
                  createVNode("div", { class: "left" }, [
                    createVNode(_component_NuxtLink, {
                      to: "/",
                      class: "logo"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_UIcon, {
                          name: "ic:round-maps-home-work",
                          class: "logo-icon"
                        }),
                        createVNode("span", null, "RealEstate")
                      ]),
                      _: 1
                    }),
                    createVNode("nav", { class: "nav" }, [
                      createVNode(_component_NuxtLink, {
                        to: "/offers",
                        class: "nav-link",
                        "active-class": "nav-link-active"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Объявления")
                        ]),
                        _: 1
                      }),
                      createVNode(_component_NuxtLink, {
                        to: "/favorites2",
                        class: "nav-link",
                        "active-class": "nav-link-active"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Избранное")
                        ]),
                        _: 1
                      }),
                      createVNode(_component_NuxtLink, {
                        to: "/board",
                        class: "nav-link",
                        "active-class": "nav-link-active"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Аналитика")
                        ]),
                        _: 1
                      }),
                      createVNode(_component_NuxtLink, {
                        to: "/map",
                        prefetch: "",
                        class: "nav-link",
                        "active-class": "nav-link-active"
                      }, {
                        default: withCtx(() => [
                          createTextVNode("Карта")
                        ]),
                        _: 1
                      })
                    ])
                  ]),
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
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0337c837"]]);

export { _default as default };
//# sourceMappingURL=default-BB3Qt3A6.mjs.map
