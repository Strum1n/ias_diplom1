import { withAsyncContext, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { a as useNuxtApp } from './server.mjs';
import { u as useAsyncData } from './asyncData-DVeqSZBv.mjs';
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
import 'vue-router';
import 'jwt-decode';
import 'tailwindcss/colors';
import '@iconify/vue';

const _sfc_main = {
  __name: "test",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { $api } = useNuxtApp();
    const { data: offers } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("offers", () => $api("/offers"))), __temp = await __temp, __restore(), __temp);
    console.log(offers.value);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><h1>Offers</h1>`);
      if (unref(offers) === null) {
        _push(`<div>Загрузка...</div>`);
      } else {
        _push(`<ul><!--[-->`);
        ssrRenderList(unref(offers).offers, (offer) => {
          _push(`<li>${ssrInterpolate(offer.title)}</li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/test.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=test-DNa-CO89.mjs.map
