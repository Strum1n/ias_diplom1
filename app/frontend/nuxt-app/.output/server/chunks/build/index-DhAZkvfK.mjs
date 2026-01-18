import { _ as _sfc_main$1 } from './Container-B_7exVp7.mjs';
import { _ as _sfc_main$2 } from './Button-BL6TDcLa.mjs';
import { mergeProps, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
import 'reka-ui';
import './tv-sfLME4AL.mjs';
import 'tailwind-variants';
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
import './Avatar-Bz_JyLmu.mjs';
import './virtual_nuxt_G__My_Programs_ias_diplom1_app_frontend_nuxt-app_node_modules_.cache_nuxt_.nuxt_ui-image-component-CX5_T5UE.mjs';
import './Icon-DX0OfCis.mjs';
import './index-gA-qUlDT.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import './asyncData-DVeqSZBv.mjs';
import '@vueuse/core';
import './useFormField-C7CorFZK.mjs';
import './index-CED3XvSe.mjs';
import './Link-gmgU2Miy.mjs';
import './nuxt-link-DYDQwZUP.mjs';
import 'vue-router';
import 'jwt-decode';
import 'tailwindcss/colors';

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_UContainer = _sfc_main$1;
  const _component_UButton = _sfc_main$2;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "py-12" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_UContainer, { class: "text-center" }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4"${_scopeId}> Найдите свой идеальный дом </h1><p class="text-xl text-gray-600 dark:text-gray-300 mb-8"${_scopeId}> Тысячи объявлений о недвижимости в вашем городе </p>`);
        _push2(ssrRenderComponent(_component_UButton, {
          to: "/login",
          size: "xl",
          color: "primary",
          class: "text-lg"
        }, {
          default: withCtx((_2, _push3, _parent3, _scopeId2) => {
            if (_push3) {
              _push3(` Смотреть объявления `);
            } else {
              return [
                createTextVNode(" Смотреть объявления ")
              ];
            }
          }),
          _: 1
        }, _parent2, _scopeId));
      } else {
        return [
          createVNode("h1", { class: "text-4xl font-bold text-gray-900 dark:text-white mb-4" }, " Найдите свой идеальный дом "),
          createVNode("p", { class: "text-xl text-gray-600 dark:text-gray-300 mb-8" }, " Тысячи объявлений о недвижимости в вашем городе "),
          createVNode(_component_UButton, {
            to: "/login",
            size: "xl",
            color: "primary",
            class: "text-lg"
          }, {
            default: withCtx(() => [
              createTextVNode(" Смотреть объявления ")
            ]),
            _: 1
          })
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index-DhAZkvfK.mjs.map
