import { mergeProps, unref, withCtx, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { s as ssrRenderSlot } from './ssrSlot-Cfp6s78G.mjs';
import { r as renderSlot } from './slot-Y7f6pvLv.mjs';
import _sfc_main$1 from './Callout-Cm2ycCx5.mjs';
import { a as useAppConfig } from './server.mjs';
import './node-w2HLPhiE.mjs';
import './tv-DuV4YVUe.mjs';
import 'tailwind-variants';
import './Link-C0gX2JZv.mjs';
import './nuxt-link-D5XjKnnj.mjs';
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
import 'reka-ui';
import '@vueuse/core';
import './index-CED3XvSe.mjs';
import './Icon-CX2WwP6o.mjs';
import './index-DNDp3pOy.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import './asyncData-BG26t6Y0.mjs';
import 'vue-router';
import 'jwt-decode';
import 'tailwindcss/colors';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _sfc_main = {
  __name: "ProseWarning",
  __ssrInlineRender: true,
  setup(__props) {
    const appConfig = useAppConfig();
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$1, mergeProps({
        color: "warning",
        icon: unref(appConfig).ui.icons.warning
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", { mdcUnwrap: "p" }, null, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default", { mdcUnwrap: "p" })
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/prose/callout/Warning.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=Warning-DjnEZN2b.mjs.map
