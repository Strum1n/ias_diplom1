import { computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import { t as tv } from './tv-sfLME4AL.mjs';
import { _ as _sfc_main$1 } from './Icon-DX0OfCis.mjs';
import { b as useAppConfig } from './server.mjs';
import 'tailwind-variants';
import './index-gA-qUlDT.mjs';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import './asyncData-DVeqSZBv.mjs';
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
import 'reka-ui';
import '@vueuse/core';

const theme = {
  "base": "size-4 shrink-0 align-sub"
};
const _sfc_main = {
  __name: "ProseIcon",
  __ssrInlineRender: true,
  props: {
    name: { type: String, required: true },
    class: { type: null, required: false }
  },
  setup(__props) {
    const props = __props;
    const appConfig = useAppConfig();
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.prose?.icon || {} }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$1, mergeProps({
        name: __props.name,
        class: ui.value({ class: props.class })
      }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/prose/Icon.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=Icon-BWoK4kiY.mjs.map
