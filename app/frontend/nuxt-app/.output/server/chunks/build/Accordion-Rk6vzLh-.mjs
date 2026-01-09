import { useSlots, computed, ref, mergeProps, unref, withCtx, createVNode, resolveDynamicComponent, createBlock, openBlock, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderVNode } from 'vue/server-renderer';
import { t as transformUI } from './index-CED3XvSe.mjs';
import { t as tv } from './tv-DuV4YVUe.mjs';
import { _ as _sfc_main$1 } from './Accordion-CLGoNVah.mjs';
import { a as useAppConfig } from './server.mjs';
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
import 'tailwind-variants';
import 'reka-ui';
import '@vueuse/core';
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

const theme = {
  "slots": {
    "root": "my-5",
    "trigger": "text-base"
  }
};
const _sfc_main = {
  __name: "ProseAccordion",
  __ssrInlineRender: true,
  props: {
    type: { type: String, required: false, default: "multiple" },
    class: { type: null, required: false },
    ui: { type: void 0, required: false }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const ui = computed(() => tv({ extend: tv(theme), ...appConfig.ui?.prose?.accordion || {} }));
    const rerenderCount = ref(1);
    const items = computed(() => {
      rerenderCount.value;
      return slots.default?.()?.flatMap(transformSlot).filter(Boolean) || [];
    });
    function transformSlot(slot, index) {
      if (typeof slot.type === "symbol") {
        return slot.children?.map(transformSlot);
      }
      return {
        index,
        label: slot.props?.label || `${index}`,
        description: slot.props?.description,
        icon: slot.props?.icon,
        component: slot
      };
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$1, mergeProps({
        type: __props.type,
        items: items.value,
        "unmount-on-hide": false,
        class: props.class,
        ui: unref(transformUI)(ui.value(), props.ui)
      }, _attrs), {
        content: withCtx(({ item }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(item.component), null, null), _parent2, _scopeId);
          } else {
            return [
              (openBlock(), createBlock(resolveDynamicComponent(item.component)))
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/prose/Accordion.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=Accordion-Rk6vzLh-.mjs.map
