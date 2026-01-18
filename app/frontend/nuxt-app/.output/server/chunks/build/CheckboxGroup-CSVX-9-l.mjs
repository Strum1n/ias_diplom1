import { useSlots, useId, computed, unref, mergeProps, withCtx, createSlots, renderList, renderSlot, createVNode, createBlock, createCommentVNode, openBlock, createTextVNode, toDisplayString, Fragment, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttrs, ssrRenderClass, ssrRenderSlot, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { useForwardPropsEmits, useForwardProps, CheckboxGroupRoot } from 'reka-ui';
import { reactivePick } from '@vueuse/core';
import { u as useFormField } from './useFormField-C7CorFZK.mjs';
import { o as omit, g as get } from './index-CED3XvSe.mjs';
import { t as tv } from './tv-sfLME4AL.mjs';
import { _ as _sfc_main$1 } from './Checkbox-DYXK6_Q4.mjs';
import { b as useAppConfig } from './server.mjs';

const theme = {
  "slots": {
    "root": "relative",
    "fieldset": "flex gap-x-2",
    "legend": "mb-1 block font-medium text-default",
    "item": ""
  },
  "variants": {
    "orientation": {
      "horizontal": {
        "fieldset": "flex-row"
      },
      "vertical": {
        "fieldset": "flex-col"
      }
    },
    "color": {
      "primary": {},
      "secondary": {},
      "success": {},
      "info": {},
      "warning": {},
      "error": {},
      "neutral": {}
    },
    "variant": {
      "list": {},
      "card": {},
      "table": {
        "item": "border border-muted"
      }
    },
    "size": {
      "xs": {
        "fieldset": "gap-y-0.5",
        "legend": "text-xs"
      },
      "sm": {
        "fieldset": "gap-y-0.5",
        "legend": "text-xs"
      },
      "md": {
        "fieldset": "gap-y-1",
        "legend": "text-sm"
      },
      "lg": {
        "fieldset": "gap-y-1",
        "legend": "text-sm"
      },
      "xl": {
        "fieldset": "gap-y-1.5",
        "legend": "text-base"
      }
    },
    "required": {
      "true": {
        "legend": "after:content-['*'] after:ms-0.5 after:text-error"
      }
    },
    "disabled": {
      "true": {}
    }
  },
  "compoundVariants": [
    {
      "size": "xs",
      "variant": "table",
      "class": {
        "item": "p-2.5"
      }
    },
    {
      "size": "sm",
      "variant": "table",
      "class": {
        "item": "p-3"
      }
    },
    {
      "size": "md",
      "variant": "table",
      "class": {
        "item": "p-3.5"
      }
    },
    {
      "size": "lg",
      "variant": "table",
      "class": {
        "item": "p-4"
      }
    },
    {
      "size": "xl",
      "variant": "table",
      "class": {
        "item": "p-4.5"
      }
    },
    {
      "orientation": "horizontal",
      "variant": "table",
      "class": {
        "item": "first-of-type:rounded-s-lg last-of-type:rounded-e-lg",
        "fieldset": "gap-0 -space-x-px"
      }
    },
    {
      "orientation": "vertical",
      "variant": "table",
      "class": {
        "item": "first-of-type:rounded-t-lg last-of-type:rounded-b-lg",
        "fieldset": "gap-0 -space-y-px"
      }
    },
    {
      "color": "primary",
      "variant": "table",
      "class": {
        "item": "has-data-[state=checked]:bg-primary/10 has-data-[state=checked]:border-primary/50 has-data-[state=checked]:z-[1]"
      }
    },
    {
      "color": "secondary",
      "variant": "table",
      "class": {
        "item": "has-data-[state=checked]:bg-secondary/10 has-data-[state=checked]:border-secondary/50 has-data-[state=checked]:z-[1]"
      }
    },
    {
      "color": "success",
      "variant": "table",
      "class": {
        "item": "has-data-[state=checked]:bg-success/10 has-data-[state=checked]:border-success/50 has-data-[state=checked]:z-[1]"
      }
    },
    {
      "color": "info",
      "variant": "table",
      "class": {
        "item": "has-data-[state=checked]:bg-info/10 has-data-[state=checked]:border-info/50 has-data-[state=checked]:z-[1]"
      }
    },
    {
      "color": "warning",
      "variant": "table",
      "class": {
        "item": "has-data-[state=checked]:bg-warning/10 has-data-[state=checked]:border-warning/50 has-data-[state=checked]:z-[1]"
      }
    },
    {
      "color": "error",
      "variant": "table",
      "class": {
        "item": "has-data-[state=checked]:bg-error/10 has-data-[state=checked]:border-error/50 has-data-[state=checked]:z-[1]"
      }
    },
    {
      "color": "neutral",
      "variant": "table",
      "class": {
        "item": "has-data-[state=checked]:bg-elevated has-data-[state=checked]:border-inverted/50 has-data-[state=checked]:z-[1]"
      }
    },
    {
      "variant": "table",
      "disabled": true,
      "class": {
        "item": "cursor-not-allowed"
      }
    }
  ],
  "defaultVariants": {
    "size": "md",
    "variant": "list",
    "color": "primary"
  }
};
const _sfc_main = {
  __name: "UCheckboxGroup",
  __ssrInlineRender: true,
  props: {
    as: { type: null, required: false },
    legend: { type: String, required: false },
    valueKey: { type: null, required: false, default: "value" },
    labelKey: { type: null, required: false, default: "label" },
    descriptionKey: { type: null, required: false, default: "description" },
    items: { type: null, required: false },
    modelValue: { type: null, required: false },
    defaultValue: { type: null, required: false },
    size: { type: null, required: false },
    variant: { type: null, required: false },
    orientation: { type: null, required: false, default: "vertical" },
    class: { type: null, required: false },
    ui: { type: void 0, required: false },
    disabled: { type: Boolean, required: false },
    loop: { type: Boolean, required: false },
    name: { type: String, required: false },
    required: { type: Boolean, required: false },
    color: { type: null, required: false },
    indicator: { type: null, required: false },
    icon: { type: null, required: false }
  },
  emits: ["update:modelValue", "change"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emits = __emit;
    const slots = useSlots();
    const appConfig = useAppConfig();
    const rootProps = useForwardPropsEmits(reactivePick(props, "as", "modelValue", "defaultValue", "orientation", "loop", "required"), emits);
    const checkboxProps = useForwardProps(reactivePick(props, "variant", "indicator", "icon"));
    const getProxySlots = () => omit(slots, ["legend"]);
    const { emitFormChange, emitFormInput, color, name, size, id: _id, disabled, ariaAttrs } = useFormField(props, { bind: false });
    const id = _id.value ?? useId();
    const ui = computed(() => tv({ extend: theme, ...appConfig.ui?.checkboxGroup || {} })({
      size: size.value,
      required: props.required,
      orientation: props.orientation,
      color: props.color,
      variant: props.variant,
      disabled: disabled.value
    }));
    function normalizeItem(item) {
      if (item === null) {
        return {
          id: `${id}:null`,
          value: void 0,
          label: void 0
        };
      }
      if (typeof item === "string" || typeof item === "number") {
        return {
          id: `${id}:${item}`,
          value: String(item),
          label: String(item)
        };
      }
      const value = get(item, props.valueKey);
      const label = get(item, props.labelKey);
      const description = get(item, props.descriptionKey);
      return {
        ...item,
        value,
        label,
        description,
        id: `${id}:${value}`
      };
    }
    const normalizedItems = computed(() => {
      if (!props.items) {
        return [];
      }
      return props.items.map(normalizeItem);
    });
    function onUpdate(value) {
      const event = new Event("change", { target: { value } });
      emits("change", event);
      emitFormChange();
      emitFormInput();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(CheckboxGroupRoot), mergeProps({ id: unref(id) }, unref(rootProps), {
        name: unref(name),
        disabled: unref(disabled),
        "data-slot": "root",
        class: ui.value.root({ class: [props.ui?.root, props.class] }),
        "onUpdate:modelValue": onUpdate
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<fieldset${ssrRenderAttrs(mergeProps({
              "data-slot": "fieldset",
              class: ui.value.fieldset({ class: props.ui?.fieldset })
            }, unref(ariaAttrs)))}${_scopeId}>`);
            if (__props.legend || !!slots.legend) {
              _push2(`<legend data-slot="legend" class="${ssrRenderClass(ui.value.legend({ class: props.ui?.legend }))}"${_scopeId}>`);
              ssrRenderSlot(_ctx.$slots, "legend", {}, () => {
                _push2(`${ssrInterpolate(__props.legend)}`);
              }, _push2, _parent2, _scopeId);
              _push2(`</legend>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<!--[-->`);
            ssrRenderList(normalizedItems.value, (item) => {
              _push2(ssrRenderComponent(_sfc_main$1, mergeProps({
                key: item.value
              }, { ref_for: true }, { ...item, ...unref(checkboxProps) }, {
                color: unref(color),
                size: unref(size),
                name: unref(name),
                disabled: item.disabled || unref(disabled),
                ui: { ...props.ui ? unref(omit)(props.ui, ["root"]) : void 0, ...item.ui || {} },
                "data-slot": "item",
                class: ui.value.item({ class: [props.ui?.item, item.ui?.item, item.class], disabled: item.disabled || unref(disabled) })
              }), createSlots({ _: 2 }, [
                renderList(getProxySlots(), (_2, name2) => {
                  return {
                    name: name2,
                    fn: withCtx((_3, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        ssrRenderSlot(_ctx.$slots, name2, { item }, null, _push3, _parent3, _scopeId2);
                      } else {
                        return [
                          renderSlot(_ctx.$slots, name2, { item })
                        ];
                      }
                    })
                  };
                })
              ]), _parent2, _scopeId));
            });
            _push2(`<!--]--></fieldset>`);
          } else {
            return [
              createVNode("fieldset", mergeProps({
                "data-slot": "fieldset",
                class: ui.value.fieldset({ class: props.ui?.fieldset })
              }, unref(ariaAttrs)), [
                __props.legend || !!slots.legend ? (openBlock(), createBlock("legend", {
                  key: 0,
                  "data-slot": "legend",
                  class: ui.value.legend({ class: props.ui?.legend })
                }, [
                  renderSlot(_ctx.$slots, "legend", {}, () => [
                    createTextVNode(toDisplayString(__props.legend), 1)
                  ])
                ], 2)) : createCommentVNode("", true),
                (openBlock(true), createBlock(Fragment, null, renderList(normalizedItems.value, (item) => {
                  return openBlock(), createBlock(_sfc_main$1, mergeProps({
                    key: item.value
                  }, { ref_for: true }, { ...item, ...unref(checkboxProps) }, {
                    color: unref(color),
                    size: unref(size),
                    name: unref(name),
                    disabled: item.disabled || unref(disabled),
                    ui: { ...props.ui ? unref(omit)(props.ui, ["root"]) : void 0, ...item.ui || {} },
                    "data-slot": "item",
                    class: ui.value.item({ class: [props.ui?.item, item.ui?.item, item.class], disabled: item.disabled || unref(disabled) })
                  }), createSlots({ _: 2 }, [
                    renderList(getProxySlots(), (_2, name2) => {
                      return {
                        name: name2,
                        fn: withCtx(() => [
                          renderSlot(_ctx.$slots, name2, { item })
                        ])
                      };
                    })
                  ]), 1040, ["color", "size", "name", "disabled", "ui", "class"]);
                }), 128))
              ], 16)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/@nuxt/ui/dist/runtime/components/CheckboxGroup.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=CheckboxGroup-CSVX-9-l.mjs.map
