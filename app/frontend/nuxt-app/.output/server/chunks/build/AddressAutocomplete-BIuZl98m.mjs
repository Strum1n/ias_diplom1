import { _ as _sfc_main$2 } from './Badge-Bw-ZtEh9.mjs';
import { _ as _sfc_main$3 } from './Button-C2DhPQmq.mjs';
import { _ as _sfc_main$4 } from './Checkbox-DJA1q-MP.mjs';
import { _ as _sfc_main$5 } from './Input-DcZqOw2i.mjs';
import { defineComponent, withAsyncContext, computed, reactive, mergeProps, unref, withCtx, createTextVNode, toDisplayString, ref, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { _ as _export_sfc, b as useNuxtApp } from './server.mjs';
import { u as useAsyncData } from './asyncData-BG26t6Y0.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "FiltersSidebar",
  __ssrInlineRender: true,
  emits: ["filtersApply", "filtersReset"],
  async setup(__props, { expose: __expose, emit: __emit }) {
    let __temp, __restore;
    const emit = __emit;
    const { $api } = useNuxtApp();
    const { data: filterTypesData, error: filterTypesError, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "filterTypes",
      () => $api("/offers/filter_types"),
      {
        transform: (response) => ({
          property_types: response.property_types || [],
          bathroom_types: response.bathroom_types || [],
          renovation_types: response.renovation_types || [],
          window_view_types: response.window_view_types || [],
          parking_types: response.parking_types || [],
          house_material_types: response.house_material_types || [],
          heating_types: response.heating_types || [],
          gas_types: response.gas_types || [],
          sewerage_types: response.sewerage_types || [],
          water_supply_types: response.water_supply_types || [],
          land_types: response.land_types || []
        })
      }
    )), __temp = await __temp, __restore(), __temp);
    const filterTypes = computed(() => filterTypesData.value || {
      property_types: [],
      bathroom_types: [],
      renovation_types: [],
      window_view_types: [],
      parking_types: [],
      house_material_types: [],
      heating_types: [],
      gas_types: [],
      sewerage_types: [],
      water_supply_types: [],
      land_types: []
    });
    const filters = reactive({
      property_type: null,
      is_new_house: null,
      address_query: null,
      is_build_complete: null,
      has_water_supply: null,
      has_electricity: null,
      has_gas: null,
      has_sewerage: null,
      has_heating: null,
      has_furniture: null,
      has_elevator: null,
      has_balcony: null,
      has_garbage_chute: null,
      has_guard: null,
      has_garage: null,
      has_bathhouse: null,
      has_pool: null,
      has_terrace: null,
      min_price: null,
      max_price: null,
      min_price_per_square_meter: null,
      max_price_per_square_meter: null,
      min_total_area: null,
      max_total_area: null,
      min_living_area: null,
      max_living_area: null,
      min_kitchen_area: null,
      max_kitchen_area: null,
      rooms_count: [],
      bedrooms_count: [],
      bathrooms_count: [],
      price_category: [],
      elderly_category: [],
      family_category: [],
      transport_access_category: [],
      min_floor: null,
      max_floor: null,
      min_house_floors_count: null,
      max_house_floors_count: null,
      min_house_built_year: null,
      max_house_built_year: null,
      min_ceiling_height: null,
      max_ceiling_height: null,
      min_land_area: null,
      max_land_area: null,
      renovation_type: [],
      bathroom_type: [],
      window_view_type: [],
      parking_type: [],
      house_material_type: [],
      heating_type: [],
      gas_type: [],
      sewerage_type: [],
      water_supply_type: [],
      land_type: [],
      seller_name: null
    });
    const priceCategoryOptions = [
      { label: "Выше рынка", value: "expensive" },
      { label: "Рыночная цена", value: "normal" },
      { label: "Ниже рынка", value: "cheap" }
    ];
    const elderlyCategoryOptions = [
      { label: "Низкая", value: "low" },
      { label: "Средняя", value: "medium" },
      { label: "Высокая", value: "high" }
    ];
    const familyCategoryOptions = [
      { label: "Низкая", value: "low" },
      { label: "Средняя", value: "medium" },
      { label: "Высокая", value: "high" }
    ];
    const transportAccessCategoryOptions = [
      { label: "Низкая", value: "low" },
      { label: "Средняя", value: "medium" },
      { label: "Высокая", value: "high" }
    ];
    const flatTypeOptions = [
      { label: "Все", value: null },
      { label: "Вторичка", value: false },
      { label: "Новостройка", value: true }
    ];
    const makeOptions = (key) => computed(
      () => filterTypes.value[key]?.map((t) => ({ label: t.name, value: t.id })) || []
    );
    const propertyTypeOptionsDynamic = makeOptions("property_types");
    propertyTypeOptionsDynamic.value.unshift({ label: "Все", value: null });
    const renovationTypeOptions = makeOptions("renovation_types");
    const bathroomTypeOptions = makeOptions("bathroom_types");
    const windowViewTypeOptions = makeOptions("window_view_types");
    const parkingTypeOptions = makeOptions("parking_types");
    const houseMaterialTypeOptions = makeOptions("house_material_types");
    const heatingTypeOptions = makeOptions("heating_types");
    const gasTypeOptions = makeOptions("gas_types");
    const sewerageTypeOptions = makeOptions("sewerage_types");
    const waterSupplyTypeOptions = makeOptions("water_supply_types");
    const landTypeOptions = makeOptions("land_types");
    const currentPropertyType = computed(
      () => filterTypes.value.property_types?.find((t) => t.id === filters.property_type)
    );
    const isFlat = computed(() => ["Квартира", "Апартаменты"].includes(currentPropertyType.value?.name || ""));
    const isHouse = computed(() => ["Дом", "Таунхаус", "Коттедж"].includes(currentPropertyType.value?.name || ""));
    const activeFiltersCount = computed(
      () => Object.entries(filters).reduce((count, [key, value]) => {
        if (key === "property_type" || key === "address_query") return count;
        if (Array.isArray(value)) {
          return count + (value.length > 0 ? 1 : 0);
        }
        if (key === "is_new_house") {
          return count + (value !== null ? 1 : 0);
        }
        if (typeof value === "boolean") {
          return count + (value !== false ? 1 : 0);
        }
        return count + (value != null && value !== "" ? 1 : 0);
      }, 0)
    );
    const filteredBathroomOptions = computed(
      () => bathroomTypeOptions.value.filter(
        (option) => isFlat.value ? !["В доме", "На улице"].includes(option.label) : !["Раздельный", "Совмещенный"].includes(option.label)
      )
    );
    const filteredRenovationOptions = computed(
      () => renovationTypeOptions.value.filter((option) => {
        if (filters.is_new_house) {
          return !["Без отде", "Косметический", "Дизайнерксий", "Евроремонт"].includes(option.label);
        }
        if (filters.is_new_house === false) {
          return !["Без отделки", "Предчистовая", "Чистовая с мебелью"].includes(option.label);
        }
        return true;
      })
    );
    const filteredHouseMaterialOptions = computed(
      () => houseMaterialTypeOptions.value.filter((option) => {
        if (isFlat.value) {
          return !["Щитовой", "Каркасный", "Газобетонный блок", "Газосиликатный блок", "Пенобетонный блок"].includes(option.label);
        }
        if (isHouse.value)
          return !["Панельный", "Блочный", "Сталинский", "Кирпично   монолитный"].includes(option.label);
        return true;
      })
    );
    const filteredHeatingOptions = computed(
      () => heatingTypeOptions.value.filter((option) => {
        if (isFlat.value) {
          return !["Центральное газовое", "Угольное", "Печь", "Камин", "Электрическое", "Автономное газовое", "Дизельное", "Твердотопливный котел", "Без отопления"].includes(option.label);
        }
        if (isHouse.value) {
          return !["Центральное", "Автономное", "Автономная котельная", "Индивидуальный тепловой пункт"].includes(option.label);
        }
        return true;
      })
    );
    const setPropertyType = (typeId) => {
      filters.property_type = typeId;
      console.log("МЕНЯЕМ ТИП НЕДВИЖИМОСТИ ФИЛЬТРЫ:", filters);
      console.log("filters:", filters);
      Object.keys(filters).forEach((key) => {
        if (key === "property_type") {
          filters[key] = filters.property_type;
        } else if (key === "address_query") {
          filters[key] = filters.address_query;
        } else if (Array.isArray(filters[key])) {
          filters[key] = [];
        } else {
          filters[key] = null;
        }
      });
      console.log("Устанавливаем проперти тайп в фильтерссайдбаре:", filters.property_type);
      emit("filtersApply", filters);
    };
    const handleFiltersApply = () => {
      emit("filtersApply", { ...filters });
    };
    const filtersReset = () => {
      console.log("ФИЛЬТЕРС РЕСЕТ");
      const currentPropertyType2 = filters.property_type;
      const currentAddress = filters.address_query;
      Object.keys(filters).forEach((key) => {
        if (key === "property_type") {
          filters[key] = currentPropertyType2;
        } else if (key === "address_query") {
          filters[key] = currentAddress;
        } else if (Array.isArray(filters[key])) {
          filters[key] = [];
        } else {
          filters[key] = null;
        }
      });
      emit("filtersReset");
      console.log("Только что должны были взывать фильтерресет и ресетнуть в offer.page");
    };
    const getRoomLabel = (count) => {
      return count === 0 ? "Студия" : count.toString();
    };
    const toggleArrayFilter = (arrayName, value) => {
      const arr = filters[arrayName];
      const index = arr.indexOf(value);
      if (index > -1) {
        arr.splice(index, 1);
      } else {
        arr.push(value);
      }
    };
    const setBooleanFilter = (filterName, value) => {
      filters[filterName] = value;
    };
    const setPropertyTypeFilter = (value) => {
      filters.is_new_house = value;
    };
    __expose({
      filters
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UBadge = _sfc_main$2;
      const _component_UButton = _sfc_main$3;
      const _component_UCheckbox = _sfc_main$4;
      const _component_UInput = _sfc_main$5;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "filters-content" }, _attrs))} data-v-69edca2c><div class="filters-header" data-v-69edca2c><p class="font-semibold text-lg" data-v-69edca2c>Фильтры `);
      if (unref(activeFiltersCount) > 0) {
        _push(ssrRenderComponent(_component_UBadge, {
          color: "info",
          class: "ml-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(activeFiltersCount))}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(activeFiltersCount)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</p>`);
      _push(ssrRenderComponent(_component_UButton, {
        onClick: filtersReset,
        variant: "ghost",
        color: "info",
        size: "xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Сбросить все `);
          } else {
            return [
              createTextVNode(" Сбросить все ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(filterTypesError)) {
        _push(`<div class="error-filter-types" data-v-69edca2c><span data-v-69edca2c>Ошибка загрузки фильтров</span></div>`);
      } else {
        _push(`<div class="overflow-auto" data-v-69edca2c><div class="filter-section p-5 border-b border-b-neutral-200" data-v-69edca2c><h4 data-v-69edca2c>Тип недвижимости</h4><div class="button-group" data-v-69edca2c><!--[-->`);
        ssrRenderList(unref(propertyTypeOptionsDynamic), (type) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: type.value,
            variant: unref(filters).property_type === type.value ? "solid" : "outline",
            color: unref(filters).property_type === type.value ? "neutral" : "neutral",
            onClick: ($event) => setPropertyType(type.value),
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(type.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(type.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div><div class="filter-sections" data-v-69edca2c>`);
        if (!unref(isHouse)) {
          _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Тип объекта</h4><div class="button-group" data-v-69edca2c><!--[-->`);
          ssrRenderList(flatTypeOptions, (option) => {
            _push(ssrRenderComponent(_component_UButton, {
              key: option.value,
              variant: unref(filters).is_new_house === option.value ? "solid" : "outline",
              color: unref(filters).is_new_house === option.value ? "primary" : "neutral",
              onClick: ($event) => setPropertyTypeFilter(option.value),
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(option.label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(option.label), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
          if (unref(filters).is_new_house) {
            _push(`<h4 data-v-69edca2c>Дополнительно </h4>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(filters).is_new_house) {
            _push(ssrRenderComponent(_component_UCheckbox, {
              "model-value": unref(filters).is_build_complete,
              "onUpdate:modelValue": (v) => setBooleanFilter("is_build_complete", v),
              label: "Дом сдан"
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Цена</h4><div class="button-group flex-col" data-v-69edca2c>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(filters).min_price,
          "onUpdate:modelValue": ($event) => unref(filters).min_price = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "Мин. цена"
        }, null, _parent));
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(filters).max_price,
          "onUpdate:modelValue": ($event) => unref(filters).max_price = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "Макс. цена"
        }, null, _parent));
        _push(`</div><div class="button-group flex-col" data-v-69edca2c>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(filters).min_price_per_square_meter,
          "onUpdate:modelValue": ($event) => unref(filters).min_price_per_square_meter = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "Мин. цена за м²"
        }, null, _parent));
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(filters).max_price_per_square_meter,
          "onUpdate:modelValue": ($event) => unref(filters).max_price_per_square_meter = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "Макс. цена за м²"
        }, null, _parent));
        _push(`</div></div><div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Площадь (м²)</h4><div class="button-group flex-col" data-v-69edca2c>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(filters).min_total_area,
          "onUpdate:modelValue": ($event) => unref(filters).min_total_area = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "Мин. общая"
        }, null, _parent));
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(filters).max_total_area,
          "onUpdate:modelValue": ($event) => unref(filters).max_total_area = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "Макс. общая"
        }, null, _parent));
        _push(`</div>`);
        if (!unref(isHouse)) {
          _push(`<div class="button-group flex-col" data-v-69edca2c>`);
          _push(ssrRenderComponent(_component_UInput, {
            modelValue: unref(filters).min_living_area,
            "onUpdate:modelValue": ($event) => unref(filters).min_living_area = $event,
            modelModifiers: { number: true },
            type: "number",
            placeholder: "Мин. жилая"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UInput, {
            modelValue: unref(filters).max_living_area,
            "onUpdate:modelValue": ($event) => unref(filters).max_living_area = $event,
            modelModifiers: { number: true },
            type: "number",
            placeholder: "Макс. жилая"
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(isHouse)) {
          _push(`<div class="button-group flex-col" data-v-69edca2c>`);
          _push(ssrRenderComponent(_component_UInput, {
            modelValue: unref(filters).min_kitchen_area,
            "onUpdate:modelValue": ($event) => unref(filters).min_kitchen_area = $event,
            modelModifiers: { number: true },
            type: "number",
            placeholder: "Мин. кухня"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UInput, {
            modelValue: unref(filters).max_kitchen_area,
            "onUpdate:modelValue": ($event) => unref(filters).max_kitchen_area = $event,
            modelModifiers: { number: true },
            type: "number",
            placeholder: "Макс. кухня"
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (!unref(isFlat)) {
          _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Площадь участка (сот.)</h4><div class="button-group flex-col" data-v-69edca2c>`);
          _push(ssrRenderComponent(_component_UInput, {
            modelValue: unref(filters).min_land_area,
            "onUpdate:modelValue": ($event) => unref(filters).min_land_area = $event,
            modelModifiers: { number: true },
            type: "number",
            placeholder: "Мин. площадь"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UInput, {
            modelValue: unref(filters).max_land_area,
            "onUpdate:modelValue": ($event) => unref(filters).max_land_area = $event,
            modelModifiers: { number: true },
            type: "number",
            placeholder: "Макс. площадь"
          }, null, _parent));
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(isFlat)) {
          _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Спальни</h4><div class="button-group" data-v-69edca2c><!--[-->`);
          ssrRenderList([1, 2, 3, 4, 5], (bedroom) => {
            _push(ssrRenderComponent(_component_UButton, {
              key: bedroom,
              variant: unref(filters).bedrooms_count?.includes(bedroom) ? "solid" : "outline",
              color: unref(filters).bedrooms_count?.includes(bedroom) ? "primary" : "neutral",
              onClick: ($event) => toggleArrayFilter("bedrooms_count", bedroom),
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(bedroom)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(bedroom), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(isHouse)) {
          _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Комнаты</h4><div class="button-group" data-v-69edca2c><!--[-->`);
          ssrRenderList([1, 2, 3, 4, 5, 0], (room) => {
            _push(ssrRenderComponent(_component_UButton, {
              key: room,
              variant: unref(filters).rooms_count?.includes(room) ? "solid" : "outline",
              color: unref(filters).rooms_count?.includes(room) ? "primary" : "neutral",
              onClick: ($event) => toggleArrayFilter("rooms_count", room),
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(getRoomLabel(room))}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(getRoomLabel(room)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Этажи</h4>`);
        if (!unref(isHouse)) {
          _push(`<div class="button-group flex-col" data-v-69edca2c>`);
          _push(ssrRenderComponent(_component_UInput, {
            modelValue: unref(filters).min_floor,
            "onUpdate:modelValue": ($event) => unref(filters).min_floor = $event,
            modelModifiers: { number: true },
            type: "number",
            placeholder: "Мин. этаж"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UInput, {
            modelValue: unref(filters).max_floor,
            "onUpdate:modelValue": ($event) => unref(filters).max_floor = $event,
            modelModifiers: { number: true },
            type: "number",
            placeholder: "Макс. этаж"
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="button-group flex-col" data-v-69edca2c>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(filters).min_house_floors_count,
          "onUpdate:modelValue": ($event) => unref(filters).min_house_floors_count = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "Мин. кол-во этажей"
        }, null, _parent));
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(filters).max_house_floors_count,
          "onUpdate:modelValue": ($event) => unref(filters).max_house_floors_count = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "Макс. кол-во этажей"
        }, null, _parent));
        _push(`</div></div>`);
        if (!unref(isHouse)) {
          _push(`<div class="filter-section" data-v-69edca2c>`);
          if (unref(filters).is_new_house) {
            _push(`<h4 data-v-69edca2c>Тип отделки</h4>`);
          } else if (unref(filters).is_new_house === false) {
            _push(`<h4 data-v-69edca2c>Тип ремонта</h4>`);
          } else if (unref(filters).is_new_house == null) {
            _push(`<h4 data-v-69edca2c>Тип ремонта/отделки</h4>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="button-group" data-v-69edca2c><!--[-->`);
          ssrRenderList(unref(filteredRenovationOptions), (option) => {
            _push(ssrRenderComponent(_component_UButton, {
              key: option.value,
              variant: unref(filters).renovation_type.includes(option.value) ? "solid" : "outline",
              color: unref(filters).renovation_type.includes(option.value) ? "primary" : "neutral",
              onClick: ($event) => toggleArrayFilter("renovation_type", option.value),
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(option.label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(option.label), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Тип санузла</h4><div class="button-group" data-v-69edca2c><!--[-->`);
        ssrRenderList(unref(filteredBathroomOptions), (option) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: option.value,
            variant: unref(filters).bathroom_type.includes(option.value) ? "solid" : "outline",
            color: unref(filters).bathroom_type.includes(option.value) ? "primary" : "neutral",
            onClick: ($event) => toggleArrayFilter("bathroom_type", option.value),
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(option.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(option.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div>`);
        if (!unref(isFlat)) {
          _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Коммуникации</h4><div class="button-group flex-col" data-v-69edca2c>`);
          _push(ssrRenderComponent(_component_UCheckbox, {
            "model-value": unref(filters).has_water_supply,
            "onUpdate:modelValue": (v) => setBooleanFilter("has_water_supply", v),
            label: "Вода"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UCheckbox, {
            "model-value": unref(filters).has_electricity,
            "onUpdate:modelValue": (v) => setBooleanFilter("has_electricity", v),
            label: "Электричество"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UCheckbox, {
            "model-value": unref(filters).has_gas,
            "onUpdate:modelValue": (v) => setBooleanFilter("has_gas", v),
            label: "Газ"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UCheckbox, {
            "model-value": unref(filters).has_sewerage,
            "onUpdate:modelValue": (v) => setBooleanFilter("has_sewerage", v),
            label: "Канализация"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UCheckbox, {
            "model-value": unref(filters).has_heating,
            "onUpdate:modelValue": (v) => setBooleanFilter("has_heating", v),
            label: "Отопление"
          }, null, _parent));
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Удобства</h4><div class="button-group flex-col" data-v-69edca2c>`);
        if (!unref(isHouse)) {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(_component_UCheckbox, {
            "model-value": unref(filters).has_furniture,
            "onUpdate:modelValue": (v) => setBooleanFilter("has_furniture", v),
            label: "Мебель"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UCheckbox, {
            "model-value": unref(filters).has_elevator,
            "onUpdate:modelValue": (v) => setBooleanFilter("has_elevator", v),
            label: "Лифт"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UCheckbox, {
            "model-value": unref(filters).has_balcony,
            "onUpdate:modelValue": (v) => setBooleanFilter("has_balcony", v),
            label: "Балкон"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UCheckbox, {
            "model-value": unref(filters).has_garbage_chute,
            "onUpdate:modelValue": (v) => setBooleanFilter("has_garbage_chute", v),
            label: "Мусоропровод"
          }, null, _parent));
          _push(`<!--]-->`);
        } else if (!unref(isFlat)) {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(_component_UCheckbox, {
            "model-value": unref(filters).has_guard,
            "onUpdate:modelValue": (v) => setBooleanFilter("has_guard", v),
            label: "Охрана"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UCheckbox, {
            "model-value": unref(filters).has_garage,
            "onUpdate:modelValue": (v) => setBooleanFilter("has_garage", v),
            label: "Гараж"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UCheckbox, {
            "model-value": unref(filters).has_bathhouse,
            "onUpdate:modelValue": (v) => setBooleanFilter("has_bathhouse", v),
            label: "Баня"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UCheckbox, {
            "model-value": unref(filters).has_pool,
            "onUpdate:modelValue": (v) => setBooleanFilter("has_pool", v),
            label: "Бассейн"
          }, null, _parent));
          _push(ssrRenderComponent(_component_UCheckbox, {
            "model-value": unref(filters).has_terrace,
            "onUpdate:modelValue": (v) => setBooleanFilter("has_terrace", v),
            label: "Терраса"
          }, null, _parent));
          _push(`<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
        if (!unref(isHouse)) {
          _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Вид из окон</h4><div class="button-group" data-v-69edca2c><!--[-->`);
          ssrRenderList(unref(windowViewTypeOptions), (option) => {
            _push(ssrRenderComponent(_component_UButton, {
              key: option.value,
              variant: unref(filters).window_view_type.includes(option.value) ? "solid" : "outline",
              color: unref(filters).window_view_type.includes(option.value) ? "primary" : "neutral",
              onClick: ($event) => toggleArrayFilter("window_view_type", option.value),
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(option.label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(option.label), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(isHouse)) {
          _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Тип парковки</h4><div class="button-group" data-v-69edca2c><!--[-->`);
          ssrRenderList(unref(parkingTypeOptions), (option) => {
            _push(ssrRenderComponent(_component_UButton, {
              key: option.value,
              variant: unref(filters).parking_type.includes(option.value) ? "solid" : "outline",
              color: unref(filters).parking_type.includes(option.value) ? "primary" : "neutral",
              onClick: ($event) => toggleArrayFilter("parking_type", option.value),
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(option.label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(option.label), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Дополнительно</h4><div class="button-group flex-col" data-v-69edca2c>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(filters).min_house_built_year,
          "onUpdate:modelValue": ($event) => unref(filters).min_house_built_year = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "Год постройки от"
        }, null, _parent));
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(filters).max_house_built_year,
          "onUpdate:modelValue": ($event) => unref(filters).max_house_built_year = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "Год постройки до"
        }, null, _parent));
        _push(`</div><div class="button-group flex-col" data-v-69edca2c>`);
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(filters).min_ceiling_height,
          "onUpdate:modelValue": ($event) => unref(filters).min_ceiling_height = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "Высота потолков от",
          step: "0.1"
        }, null, _parent));
        _push(ssrRenderComponent(_component_UInput, {
          modelValue: unref(filters).max_ceiling_height,
          "onUpdate:modelValue": ($event) => unref(filters).max_ceiling_height = $event,
          modelModifiers: { number: true },
          type: "number",
          placeholder: "Высота потолков до",
          step: "0.1"
        }, null, _parent));
        _push(`</div></div><div class="filter-section" data-v-69edca2c>`);
        if (!unref(isFlat) && !unref(isHouse)) {
          _push(`<h4 data-v-69edca2c>Тип/материал дома</h4>`);
        } else if (unref(isHouse)) {
          _push(`<h4 data-v-69edca2c>Материал дома</h4>`);
        } else if (unref(isFlat)) {
          _push(`<h4 data-v-69edca2c>Тип дома</h4>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="button-group" data-v-69edca2c><!--[-->`);
        ssrRenderList(unref(filteredHouseMaterialOptions), (option) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: option.value,
            variant: unref(filters).house_material_type.includes(option.value) ? "solid" : "outline",
            color: unref(filters).house_material_type.includes(option.value) ? "primary" : "neutral",
            onClick: ($event) => toggleArrayFilter("house_material_type", option.value),
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(option.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(option.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div>`);
        if (!unref(isFlat)) {
          _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Тип участка</h4><div class="button-group" data-v-69edca2c><!--[-->`);
          ssrRenderList(unref(landTypeOptions), (option) => {
            _push(ssrRenderComponent(_component_UButton, {
              key: option.value,
              variant: unref(filters).land_type.includes(option.value) ? "solid" : "outline",
              color: unref(filters).land_type.includes(option.value) ? "primary" : "neutral",
              onClick: ($event) => toggleArrayFilter("land_type", option.value),
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(option.label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(option.label), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Тип отопления</h4><div class="button-group" data-v-69edca2c><!--[-->`);
        ssrRenderList(unref(filteredHeatingOptions), (option) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: option.value,
            variant: unref(filters).heating_type.includes(option.value) ? "solid" : "outline",
            color: unref(filters).heating_type.includes(option.value) ? "primary" : "neutral",
            onClick: ($event) => toggleArrayFilter("heating_type", option.value),
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(option.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(option.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div>`);
        if (unref(isHouse)) {
          _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Тип газоснабжения</h4><div class="button-group" data-v-69edca2c><!--[-->`);
          ssrRenderList(unref(gasTypeOptions), (option) => {
            _push(ssrRenderComponent(_component_UButton, {
              key: option.value,
              variant: unref(filters).gas_type.includes(option.value) ? "solid" : "outline",
              color: unref(filters).gas_type.includes(option.value) ? "primary" : "neutral",
              onClick: ($event) => toggleArrayFilter("gas_type", option.value),
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(option.label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(option.label), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(isHouse)) {
          _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Тип канализации</h4><div class="button-group" data-v-69edca2c><!--[-->`);
          ssrRenderList(unref(sewerageTypeOptions), (option) => {
            _push(ssrRenderComponent(_component_UButton, {
              key: option.value,
              variant: unref(filters).sewerage_type.includes(option.value) ? "solid" : "outline",
              color: unref(filters).sewerage_type.includes(option.value) ? "primary" : "neutral",
              onClick: ($event) => toggleArrayFilter("sewerage_type", option.value),
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(option.label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(option.label), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(isHouse)) {
          _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Тип водоснабжения</h4><div class="button-group" data-v-69edca2c><!--[-->`);
          ssrRenderList(unref(waterSupplyTypeOptions), (option) => {
            _push(ssrRenderComponent(_component_UButton, {
              key: option.value,
              variant: unref(filters).water_supply_type.includes(option.value) ? "solid" : "outline",
              color: unref(filters).water_supply_type.includes(option.value) ? "primary" : "neutral",
              onClick: ($event) => toggleArrayFilter("water_supply_type", option.value),
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(option.label)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(option.label), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Категория цены</h4><div class="button-group" data-v-69edca2c><!--[-->`);
        ssrRenderList(priceCategoryOptions, (option) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: option.value,
            variant: unref(filters).price_category.includes(option.value) ? "solid" : "outline",
            color: unref(filters).price_category.includes(option.value) ? "primary" : "neutral",
            onClick: ($event) => toggleArrayFilter("price_category", option.value),
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(option.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(option.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div><div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Удобство для пожилых</h4><div class="button-group" data-v-69edca2c><!--[-->`);
        ssrRenderList(elderlyCategoryOptions, (option) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: option.value,
            variant: unref(filters).elderly_category.includes(option.value) ? "solid" : "outline",
            color: unref(filters).elderly_category.includes(option.value) ? "primary" : "neutral",
            onClick: ($event) => toggleArrayFilter("elderly_category", option.value),
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(option.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(option.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div><div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Удобство для семьи</h4><div class="button-group" data-v-69edca2c><!--[-->`);
        ssrRenderList(familyCategoryOptions, (option) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: option.value,
            variant: unref(filters).family_category.includes(option.value) ? "solid" : "outline",
            color: unref(filters).family_category.includes(option.value) ? "primary" : "neutral",
            onClick: ($event) => toggleArrayFilter("family_category", option.value),
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(option.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(option.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div><div class="filter-section" data-v-69edca2c><h4 data-v-69edca2c>Транспортная доступность</h4><div class="button-group" data-v-69edca2c><!--[-->`);
        ssrRenderList(transportAccessCategoryOptions, (option) => {
          _push(ssrRenderComponent(_component_UButton, {
            key: option.value,
            variant: unref(filters).transport_access_category.includes(option.value) ? "solid" : "outline",
            color: unref(filters).transport_access_category.includes(option.value) ? "primary" : "neutral",
            onClick: ($event) => toggleArrayFilter("transport_access_category", option.value),
            size: "sm"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(option.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(option.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div></div></div>`);
      }
      _push(`<div class="filters-header border-t border-t-neutral-200" data-v-69edca2c>`);
      _push(ssrRenderComponent(_component_UButton, {
        onClick: handleFiltersApply,
        color: "primary",
        class: "w-full flex justify-center"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Искать объекты `);
          } else {
            return [
              createTextVNode(" Искать объекты ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/FiltersSidebar.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-69edca2c"]]), { __name: "FiltersSidebar" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AddressAutocomplete",
  __ssrInlineRender: true,
  emits: ["address-selected", "search-triggered"],
  async setup(__props, { emit: __emit }) {
    let __temp, __restore;
    const emit = __emit;
    const searchQuery = ref("");
    const showSuggestions = ref(false);
    const { $api } = useNuxtApp();
    const { data: addressSuggestions, pending, error, refresh: fetchSuggestions } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "autocomplete",
      () => $api("/offers/autocomplete", {
        query: {
          q: searchQuery.value,
          limit: 10
        }
      }),
      {
        immediate: false,
        watch: [searchQuery]
      }
    )), __temp = await __temp, __restore(), __temp);
    const searchOffers = () => {
      const addressForSearch = searchQuery.value;
      searchQuery.value = "";
      showSuggestions.value = false;
      emit("search-triggered", addressForSearch);
    };
    watch(searchQuery, (newValue) => {
      if (newValue === "") {
        addressSuggestions.value = [];
        showSuggestions.value = false;
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UButton = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex gap-2" }, _attrs))} data-v-9dd2be40><div class="relative w-full" data-v-9dd2be40><input${ssrRenderAttr("value", unref(searchQuery))} type="text" placeholder="Введите адрес для поиска недвижимости..." class="autocomplete-input" data-v-9dd2be40>`);
      if (unref(showSuggestions) && unref(addressSuggestions) && unref(addressSuggestions).length > 0) {
        _push(`<ul class="suggestions-list" data-v-9dd2be40><!--[-->`);
        ssrRenderList(unref(addressSuggestions), (suggestion, index) => {
          _push(`<li class="suggestion-item" data-v-9dd2be40>${ssrInterpolate(suggestion)}</li>`);
        });
        _push(`<!--]--></ul>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showSuggestions) && unref(searchQuery) && !unref(pending) && unref(addressSuggestions) && unref(addressSuggestions).length === 0) {
        _push(`<ul class="suggestions-list" data-v-9dd2be40><li class="suggestion-item !cursor-default text-center text-muted hover:!bg-white" data-v-9dd2be40> Адреса не найдены </li></ul>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_component_UButton, {
        icon: "i-lucide-search",
        color: "info",
        onClick: searchOffers,
        class: "search-button font-semibold"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Найти `);
          } else {
            return [
              createTextVNode(" Найти ")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AddressAutocomplete.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-9dd2be40"]]), { __name: "AddressAutocomplete" });

export { __nuxt_component_0 as _, __nuxt_component_1 as a };
//# sourceMappingURL=AddressAutocomplete-BIuZl98m.mjs.map
