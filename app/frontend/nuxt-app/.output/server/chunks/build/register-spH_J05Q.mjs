import { _ as _sfc_main$1 } from './Card-4xAP5IJX.mjs';
import { _ as _sfc_main$6 } from './Icon-CX2WwP6o.mjs';
import { _ as _sfc_main$2 } from './FormField-BjYhBT9f.mjs';
import { _ as _sfc_main$3 } from './Input-DcZqOw2i.mjs';
import { _ as _sfc_main$4 } from './Select-vbHwMs4c.mjs';
import { _ as _sfc_main$5 } from './Button-C2DhPQmq.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-D5XjKnnj.mjs';
import { defineComponent, ref, reactive, mergeProps, withCtx, createVNode, createTextVNode, createBlock, createCommentVNode, withModifiers, openBlock, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import 'reka-ui';
import './tv-DuV4YVUe.mjs';
import 'tailwind-variants';
import './server.mjs';
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
import 'jwt-decode';
import 'tailwindcss/colors';
import '@iconify/vue';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import './index-DNDp3pOy.mjs';
import '@iconify/utils/lib/css/icon';
import './asyncData-BG26t6Y0.mjs';
import '@vueuse/core';
import './useFormField-C7CorFZK.mjs';
import './Avatar-BbsafSqM.mjs';
import './virtual_nuxt_G__My_Programs_IAS-diplom_app_frontend_nuxt-app_node_modules_.cache_nuxt_.nuxt_ui-image-component-CX5_T5UE.mjs';
import './index-CED3XvSe.mjs';
import './Link-C0gX2JZv.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "register",
  __ssrInlineRender: true,
  setup(__props) {
    const loading = ref(false);
    const error = ref(null);
    const form = reactive({
      email: "",
      password: "",
      confirmPassword: "",
      user_name: "",
      // имя пользователя
      full_name: "",
      // полное имя
      role_id: 1
      // роль, можно будет динамически обновить
    });
    const roleOptions = ref([
      { value: 1, label: "Пользователь" },
      { value: 2, label: "Администратор" }
    ]);
    const router = useRouter();
    const handleSubmit = async () => {
      if (form.password !== form.confirmPassword) {
        error.value = "Пароли не совпадают!";
        return;
      }
      loading.value = true;
      error.value = null;
      try {
        const response = await $fetch("http://127.0.0.1:8000/auth/register", {
          method: "POST",
          body: {
            user_name: form.user_name,
            // Имя пользователя
            email: form.email,
            // Email
            password: form.password,
            // Пароль
            full_name: form.full_name,
            // Полное имя
            role_id: form.role_id
            // Роль
          }
        });
        if (response.message === "User registered successfully") {
          router.push({ path: "/login", query: { registered: "true" } });
        }
      } catch (err) {
        console.error(err);
        if (err?.data?.detail === "Username already registered") {
          error.value = "Email уже зарегистрирован";
        } else {
          error.value = err.message || "Ошибка регистрации";
        }
      } finally {
        loading.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UCard = _sfc_main$1;
      const _component_UIcon = _sfc_main$6;
      const _component_UFormField = _sfc_main$2;
      const _component_UInput = _sfc_main$3;
      const _component_USelect = _sfc_main$4;
      const _component_UButton = _sfc_main$5;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center py-12 px-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UCard, { class: "w-full max-w-md" }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="text-center"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UIcon, {
              name: "i-heroicons-home-modern",
              class: "w-12 h-12 text-primary-600 mx-auto mb-2"
            }, null, _parent2, _scopeId));
            _push2(`<h2 class="text-2xl font-bold text-gray-900 dark:text-white"${_scopeId}>Регистрация</h2><p class="text-gray-600 dark:text-gray-300 mt-1"${_scopeId}>Создайте новый аккаунт</p></div>`);
          } else {
            return [
              createVNode("div", { class: "text-center" }, [
                createVNode(_component_UIcon, {
                  name: "i-heroicons-home-modern",
                  class: "w-12 h-12 text-primary-600 mx-auto mb-2"
                }),
                createVNode("h2", { class: "text-2xl font-bold text-gray-900 dark:text-white" }, "Регистрация"),
                createVNode("p", { class: "text-gray-600 dark:text-gray-300 mt-1" }, "Создайте новый аккаунт")
              ])
            ];
          }
        }),
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<p class="text-center text-gray-600 dark:text-gray-400 text-sm"${_scopeId}> Уже есть аккаунт? `);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/login",
              class: "text-primary-600 dark:text-primary-400 hover:underline font-medium"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Войти `);
                } else {
                  return [
                    createTextVNode(" Войти ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</p>`);
          } else {
            return [
              createVNode("p", { class: "text-center text-gray-600 dark:text-gray-400 text-sm" }, [
                createTextVNode(" Уже есть аккаунт? "),
                createVNode(_component_NuxtLink, {
                  to: "/login",
                  class: "text-primary-600 dark:text-primary-400 hover:underline font-medium"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Войти ")
                  ]),
                  _: 1
                })
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex justify-center"${_scopeId}><form class="space-y-4"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_UFormField, {
              label: "Email",
              name: "email"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: form.email,
                    "onUpdate:modelValue": ($event) => form.email = $event,
                    type: "email",
                    placeholder: "your@email.com",
                    required: ""
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: form.email,
                      "onUpdate:modelValue": ($event) => form.email = $event,
                      type: "email",
                      placeholder: "your@email.com",
                      required: ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UFormField, {
              label: "Имя пользователя",
              name: "user_name"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: form.user_name,
                    "onUpdate:modelValue": ($event) => form.user_name = $event,
                    type: "text",
                    placeholder: "Ваше имя пользователя",
                    required: ""
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: form.user_name,
                      "onUpdate:modelValue": ($event) => form.user_name = $event,
                      type: "text",
                      placeholder: "Ваше имя пользователя",
                      required: ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UFormField, {
              label: "Пароль",
              name: "password"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: form.password,
                    "onUpdate:modelValue": ($event) => form.password = $event,
                    type: "password",
                    placeholder: "••••••••",
                    required: ""
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: form.password,
                      "onUpdate:modelValue": ($event) => form.password = $event,
                      type: "password",
                      placeholder: "••••••••",
                      required: ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UFormField, {
              label: "Подтвердите пароль",
              name: "confirmPassword"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: form.confirmPassword,
                    "onUpdate:modelValue": ($event) => form.confirmPassword = $event,
                    type: "password",
                    placeholder: "••••••••",
                    required: ""
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: form.confirmPassword,
                      "onUpdate:modelValue": ($event) => form.confirmPassword = $event,
                      type: "password",
                      placeholder: "••••••••",
                      required: ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UFormField, {
              label: "Полное имя",
              name: "full_name"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_UInput, {
                    modelValue: form.full_name,
                    "onUpdate:modelValue": ($event) => form.full_name = $event,
                    type: "text",
                    placeholder: "Ваше полное имя",
                    required: ""
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_UInput, {
                      modelValue: form.full_name,
                      "onUpdate:modelValue": ($event) => form.full_name = $event,
                      type: "text",
                      placeholder: "Ваше полное имя",
                      required: ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UFormField, {
              label: "Роль",
              name: "role_id"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_USelect, {
                    modelValue: form.role_id,
                    "onUpdate:modelValue": ($event) => form.role_id = $event,
                    items: roleOptions.value,
                    required: ""
                  }, null, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_USelect, {
                      modelValue: form.role_id,
                      "onUpdate:modelValue": ($event) => form.role_id = $event,
                      items: roleOptions.value,
                      required: ""
                    }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_UButton, {
              type: "submit",
              color: "primary",
              class: "w-full",
              loading: loading.value,
              size: "lg"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Зарегистрироваться `);
                } else {
                  return [
                    createTextVNode(" Зарегистрироваться ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</form></div>`);
            if (error.value) {
              _push2(`<div class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"${_scopeId}><p class="text-red-700 dark:text-red-400 text-sm"${_scopeId}>${ssrInterpolate(error.value)}</p></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", { class: "flex justify-center" }, [
                createVNode("form", {
                  onSubmit: withModifiers(handleSubmit, ["prevent"]),
                  class: "space-y-4"
                }, [
                  createVNode(_component_UFormField, {
                    label: "Email",
                    name: "email"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UInput, {
                        modelValue: form.email,
                        "onUpdate:modelValue": ($event) => form.email = $event,
                        type: "email",
                        placeholder: "your@email.com",
                        required: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_UFormField, {
                    label: "Имя пользователя",
                    name: "user_name"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UInput, {
                        modelValue: form.user_name,
                        "onUpdate:modelValue": ($event) => form.user_name = $event,
                        type: "text",
                        placeholder: "Ваше имя пользователя",
                        required: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_UFormField, {
                    label: "Пароль",
                    name: "password"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UInput, {
                        modelValue: form.password,
                        "onUpdate:modelValue": ($event) => form.password = $event,
                        type: "password",
                        placeholder: "••••••••",
                        required: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_UFormField, {
                    label: "Подтвердите пароль",
                    name: "confirmPassword"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UInput, {
                        modelValue: form.confirmPassword,
                        "onUpdate:modelValue": ($event) => form.confirmPassword = $event,
                        type: "password",
                        placeholder: "••••••••",
                        required: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_UFormField, {
                    label: "Полное имя",
                    name: "full_name"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_UInput, {
                        modelValue: form.full_name,
                        "onUpdate:modelValue": ($event) => form.full_name = $event,
                        type: "text",
                        placeholder: "Ваше полное имя",
                        required: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_UFormField, {
                    label: "Роль",
                    name: "role_id"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_USelect, {
                        modelValue: form.role_id,
                        "onUpdate:modelValue": ($event) => form.role_id = $event,
                        items: roleOptions.value,
                        required: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue", "items"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_UButton, {
                    type: "submit",
                    color: "primary",
                    class: "w-full",
                    loading: loading.value,
                    size: "lg"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" Зарегистрироваться ")
                    ]),
                    _: 1
                  }, 8, ["loading"])
                ], 32)
              ]),
              error.value ? (openBlock(), createBlock("div", {
                key: 0,
                class: "mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
              }, [
                createVNode("p", { class: "text-red-700 dark:text-red-400 text-sm" }, toDisplayString(error.value), 1)
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/register.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=register-spH_J05Q.mjs.map
