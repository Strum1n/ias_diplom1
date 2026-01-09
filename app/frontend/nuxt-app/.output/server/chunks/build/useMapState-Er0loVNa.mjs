import { j as useState, V as VueYandexMaps, h as hVue2, e as hF, g as getAttrsForVueVersion, i as isVue2, t as throwException, s as sleep, f as getException } from './server.mjs';
import { defineComponent, shallowRef, ref, provide, computed, watch, nextTick, h, inject, getCurrentInstance, isRef, triggerRef } from 'vue';

function applyModifier(coords, modifier) {
  const result = {
    x: 0,
    y: 0
  };
  result.x = coords.x * modifier;
  result.y = coords.y * modifier;
  return result;
}
function applyFunctionModifier(coords, functionModifier) {
  const result = {
    x: 0,
    y: 0
  };
  result.x = functionModifier(coords.x, 1);
  result.y = functionModifier(coords.y, 2);
  return result;
}
function worldToPixels$1(coords, modifier) {
  const i = 2 ** modifier / 2 * 256;
  return applyModifier({
    x: coords.x + 1,
    y: 1 - coords.y
  }, i);
}
function convertWorldCoordinates(projection, coordinates, modifier) {
  const worldCoordinates = projection.toWorldCoordinates(coordinates);
  return worldToPixels$1(worldCoordinates, modifier);
}
function pixelsToWorld$1(coords, modifier) {
  const i = 2 ** modifier / 2 * 256;
  return {
    x: coords.x / i - 1,
    y: 1 - coords.y / i
  };
}
function findNeededValue(t, e, i) {
  return Math.max(Math.min(t, i), e);
}
function worldCoordsFromModifier(projection, coords, modifier) {
  const resultCoords = applyFunctionModifier(pixelsToWorld$1(coords, modifier), ((value) => findNeededValue(value, -1, 1 - 1e-15)));
  return projection.fromWorldCoordinates(resultCoords);
}
function convertBounds(projection, bounds, modifier) {
  const topLeft = convertWorldCoordinates(projection, bounds[0], modifier);
  const bottomRight = convertWorldCoordinates(projection, bounds[1], modifier);
  const modified = 2 ** modifier * 256;
  const updatedBounds = [[topLeft.x, topLeft.y], [bottomRight.x, bottomRight.y]];
  if (topLeft.x > bottomRight.x) {
    updatedBounds[0][0] = topLeft.x;
    updatedBounds[1][0] = bottomRight.x + modified;
  }
  if (topLeft.y > bottomRight.y) {
    updatedBounds[0][1] = bottomRight.y;
    updatedBounds[1][1] = topLeft.y;
  }
  return updatedBounds;
}
function applyMarginToCoords(coords, margin) {
  return {
    x: Math.max(coords.x - (margin ? margin[1] + margin[3] : 0), 1),
    y: Math.max(coords.y - (margin ? margin[0] + margin[2] : 0), 1)
  };
}
function findZoom(projection, bounds, coords, isSnap, zoomRange) {
  const [[topLeftFirst, topLeftSecond], [bottomRightFirst, bottomRightSecond]] = convertBounds(projection, bounds, 0);
  const firstCalc = Math.max(Math.abs(bottomRightFirst - topLeftFirst), 1e-10);
  const secondCalc = Math.max(Math.abs(bottomRightSecond - topLeftSecond), 1e-10);
  const zoom = findNeededValue(Math.min(Math.log2(coords.x / firstCalc), Math.log2(coords.y / secondCalc)), zoomRange.min, zoomRange.max);
  return isSnap ? Math.floor(zoom + 1e-6) : zoom;
}
function findCenter(projection, bounds, zoom) {
  const [[topLeftFirst, topLeftSecond], [bottomRightFirst, bottomRightSecond]] = convertBounds(projection, bounds, zoom);
  return worldCoordsFromModifier(projection, {
    x: (topLeftFirst + bottomRightFirst) / 2,
    y: (topLeftSecond + bottomRightSecond) / 2
  }, zoom);
}
async function getLocationFromBounds({
  bounds,
  map,
  roundZoom,
  comfortZoomLevel
}) {
  const ctxMap = Object.keys(map).find((x) => x.endsWith("CtxMap"));
  if (!ctxMap) {
    throwException({
      text: "CtxMap was not found in useYMapsGetCenterAndZoomFromBounds",
      isInternal: true
    });
  }
  const ctx = map[ctxMap];
  const mapZoom = map.zoom;
  const ctxItem = await new Promise((resolve, reject) => {
    ctx.forEach((item, { name }) => {
      if (name !== "map") return;
      resolve(item);
    });
    reject(getException({
      text: "Map item was not found in useYMapsGetCenterAndZoomFromBounds",
      isInternal: true
    }));
  });
  const ctxItemMapKey = Object.keys(ctxItem).find((x) => x.endsWith("_context"));
  if (!ctxItemMapKey) {
    throwException({
      text: "CtxMapKey was not found in useYMapsGetCenterAndZoomFromBounds",
      isInternal: true
    });
  }
  const ctxItemMap = ctxItem[ctxItemMapKey].map;
  const projection = ctxItemMap.projection;
  const size = ctxItemMap.size;
  const margin = ctxItemMap.margin;
  const isSnap = ctxItemMap.effectiveZoomRounding === "snap";
  const zoomRange = ctxItemMap.zoomRange;
  let zoom = findZoom(projection, bounds, applyMarginToCoords(size, margin), isSnap, zoomRange);
  const center = findCenter(projection, bounds, zoom);
  {
    const originalZoom = zoom;
    let roundedZoom = Math["floor"](zoom);
    zoom = roundedZoom;
    {
      const userSettings = {};
      if (userSettings.roundStrategy) roundedZoom = Math[userSettings.roundStrategy](originalZoom);
      const diff2 = originalZoom - roundedZoom;
      const settings = {
        diff: 0.5,
        correction: 1,
        ...userSettings
      };
      if (diff2 < settings.diff) {
        zoom -= settings.correction;
      }
      if (zoom <= mapZoom) {
        zoom = originalZoom;
      }
    }
  }
  return {
    zoom,
    center
  };
}
function getBoundsFromCoords(coordinates) {
  if (coordinates.length < 2) {
    throwException({
      text: "Invalid parameters in getBoundsFromCoords: you must pass at least two LngLat"
    });
  }
  const {
    minLongitude,
    minLatitude,
    maxLongitude,
    maxLatitude
  } = coordinates.reduce(
    (acc, [longitude, latitude]) => ({
      minLongitude: Math.min(acc.minLongitude, longitude),
      minLatitude: Math.min(acc.minLatitude, latitude),
      maxLongitude: Math.max(acc.maxLongitude, longitude),
      maxLatitude: Math.max(acc.maxLatitude, latitude)
    }),
    {
      minLongitude: Infinity,
      minLatitude: Infinity,
      maxLongitude: -Infinity,
      maxLatitude: -Infinity
    }
  );
  return [[minLongitude, minLatitude], [maxLongitude, maxLatitude]];
}
function injectMap() {
  if (!getCurrentInstance()) {
    throwException({
      text: "injectMap must be only called on runtime.",
      isInternal: true
    });
  }
  const map = inject("map");
  if (!map || !isRef(map)) {
    throwException({
      text: "Was not able to inject valid map in injectMap.",
      isInternal: true
    });
  }
  return map;
}
const _sfc_main$G = defineComponent({
  name: "YandexMap",
  props: {
    modelValue: {
      type: Object,
      default: null
    },
    value: {
      type: Object,
      default: null
    },
    tag: {
      type: String,
      default: "div"
    },
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "100%"
    },
    // z-index for Map Container. Without this, elements of the map will be displayed under your site's elements due to high z-index inside of them
    zIndex: {
      type: Number,
      default: 0
    },
    /**
    * @description Settings for cart initialization.,
    *
    * You can modify this object or use map methods, such as setLocation/setBehaviors e.t.c.
    * @see https://yandex.ru/dev/maps/jsapi/doc/3.0/dg/concepts/map.html#map-parms
    * @see https://yandex.com/dev/maps/jsapi/doc/3.0/dg/concepts/map.html#map-parms
    */
    settings: {
      type: Object,
      required: true
    },
    /**
    * @description Makes settings readonly. Enable this if reactivity causes problems
    */
    readonlySettings: {
      type: Boolean,
      default: false
    },
    /**
    * @description Always inserts actual user center or bounds (based on your input) on every location change
    * @note This prop will cause user location change on every settings update (if user did move since last time). Use it with caution.
    */
    realSettingsLocation: {
      type: Boolean,
      default: false
    },
    /**
    * @description You can also add layers through <yandex-*> components
    *
    * Modifying this object after mount will cause no effect.
    *
    * Instead, please use map methods, such as addChild.
    * @see https://yandex.ru/dev/maps/jsapi/doc/3.0/dg/concepts/map.html#layers
    * @see https://yandex.com/dev/maps/jsapi/doc/3.0/dg/concepts/map.html#layers
    */
    layers: {
      type: Array,
      default: (() => [])
    },
    /**
    * @description Adds cursor: grab/grabbing to ymaps scheme layer
    */
    cursorGrab: {
      type: Boolean,
      default: false
    }
  },
  /**
  * @description Other events are NOT available. You can listen to events via layers prop, addChildren prop or by adding <ymap-listener> as children.
  * @see https://yandex.ru/dev/maps/jsapi/doc/3.0/dg/concepts/events.html
  * @see https://yandex.com/dev/maps/jsapi/doc/3.0/dg/concepts/events.html
  */
  emits: {
    "input"(map) {
      return !map || typeof ymaps3 === "undefined" || map instanceof ymaps3.YMap;
    },
    "update:modelValue"(map) {
      return !map || typeof ymaps3 === "undefined" || map instanceof ymaps3.YMap;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const map = shallowRef(null);
    const mapRef = shallowRef(null);
    const layers = shallowRef([]);
    const projection = shallowRef(null);
    const ymapContainer = shallowRef(null);
    const mounted = shallowRef(false);
    const needsToHold = ref(0);
    provide("map", map);
    provide("layers", layers);
    provide("projection", projection);
    provide("needsToHold", needsToHold);
    emit("input", null);
    emit("update:modelValue", null);
    const getSettings = computed(() => ({
      ...props.settings,
      projection: void 0
    }));
    const init = async () => {
      if (!props.settings.location) {
        throwException({
          text: "You must specify location in YandexMap settings"
        });
      }
      if (map.value) map.value.destroy();
      const container = ymapContainer.value;
      if (!container) return;
      const settings = getSettings.value;
      if (projection.value) settings.projection = projection.value;
      map.value = new ymaps3.YMap(container, settings, [
        ...layers.value,
        ...props.layers
      ]);
      emit("input", map.value);
      emit("update:modelValue", map.value);
    };
    let reInit = false;
    watch(VueYandexMaps.loadStatus, async (val) => {
      if (val === "pending") {
        reInit = true;
        mounted.value = false;
        return;
      }
      if (val !== "loaded" && !reInit) return;
      mounted.value = true;
      await nextTick();
      if (needsToHold.value) {
        await new Promise((resolve) => watch(needsToHold, () => {
          if (!needsToHold.value) resolve();
        }, {
          immediate: true
        }));
      }
      await init();
    });
    return () => {
      const mapNodeProps = {
        class: [
          "__ymap",
          {
            "__ymap--grab": props.cursorGrab
          }
        ],
        ref: mapRef,
        style: {
          width: props.width,
          height: props.height,
          "z-index": props.zIndex.toString()
        }
      };
      const containerNode = h("div", {
        class: "__ymap_container",
        ref: ymapContainer
      });
      const slotsNodeProps = {
        class: "__ymap_slots",
        style: { display: "none" }
      };
      if (!mounted.value) return h(props.tag, mapNodeProps, [containerNode, h("div", slotsNodeProps)]);
      return h(props.tag, mapNodeProps, [
        containerNode,
        h("div", slotsNodeProps, slots.default?.({}))
      ]);
    };
  }
});
defineComponent({
  name: "YandexMapListener",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => hVue2(slots.default?.({}));
  }
});
const _sfc_main$E = defineComponent({
  name: "YandexMapDefaultFeaturesLayer",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const hold = inject("needsToHold");
    hold.value++;
    return () => hVue2(slots.default?.({}));
  }
});
const _sfc_main$D = defineComponent({
  name: "YandexMapDefaultSchemeLayer",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const hold = inject("needsToHold");
    hold.value++;
    return () => slots.default?.({});
  }
});
defineComponent({
  name: "YandexMapDefaultSatelliteLayer",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const hold = inject("needsToHold");
    hold.value++;
    return () => hVue2(slots.default?.({}));
  }
});
defineComponent({
  name: "YandexMapTileDataSource",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const hold = inject("needsToHold");
    hold.value++;
    return () => hVue2(slots.default?.({}));
  }
});
defineComponent({
  name: "YandexMapFeatureDataSource",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const hold = inject("needsToHold");
    hold.value++;
    return () => hVue2(slots.default?.({}));
  }
});
defineComponent({
  name: "YandexMapLayer",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const hold = inject("needsToHold");
    hold.value++;
    return () => hVue2(slots.default?.({}));
  }
});
function getMarkerContainerProps({
  position,
  containerAttrs,
  wrapperAttrs,
  zeroSizes
}) {
  const root = {
    class: ["__ymap-marker"],
    style: {}
  };
  const children = {
    class: ["__ymap-marker_wrapper"],
    style: {}
  };
  const isDefaultPosition = position === "default" || position === "default default";
  if (position && !isDefaultPosition) {
    if (position.startsWith("translate")) {
      children.style.transform = position;
    } else {
      let translateX = 0;
      let translateY = 0;
      const splitted = position.split(" ");
      for (let i = 0; i < splitted.length; i++) {
        let local = 0;
        const item = splitted[i];
        switch (item) {
          case "top":
          case "left":
            local = -100;
            break;
          case "top-center":
          case "left-center":
            local = -50;
            break;
          case "bottom":
          case "right":
            local = 100;
            break;
          case "bottom-center":
          case "right-center":
            local = 50;
            break;
          default:
            local = 0;
        }
        if (item.startsWith("left") || item.startsWith("right")) translateX = local;
        else translateY = local;
      }
      children.style.transform = `translate(${translateX}%, ${translateY}%)`;
    }
  }
  if (zeroSizes === true || zeroSizes !== false && position && !isDefaultPosition) {
    root.style.width = "0";
    root.style.height = "0";
    if (children.style.transform) children.style.width = "fit-content";
  }
  const attrs = {
    root: { ...containerAttrs ?? {} },
    children: { ...wrapperAttrs ?? {} }
  };
  for (const [key, value] of Object.entries(attrs)) {
    const obj = key === "root" ? root : children;
    if (value.class) {
      if (!Array.isArray(value.class)) value.class = [value.class];
      value.class = [
        ...obj.class,
        ...value.class
      ];
    }
    if (value?.style) {
      if (typeof value.style !== "object" || Array.isArray(value.style)) {
        console.warn(`Style property was given in ${key} of marker, but it is not an object. Style of this prop can only be an object, therefore it was ignored.`);
      } else {
        value.style = {
          ...obj.style,
          ...value.style
        };
      }
    }
    Object.assign(obj, value);
  }
  return {
    root,
    children
  };
}
function excludeYandexMarkerProps(props) {
  props = { ...props };
  const toExclude = {
    position: true,
    containerAttrs: true,
    wrapperAttrs: true,
    zeroSizes: true
  };
  for (const excluded in toExclude) {
    if (excluded in props) delete props[excluded];
  }
  return props;
}
const _sfc_main$y = defineComponent({
  name: "YandexMapMarker",
  inheritAttrs: false,
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    },
    /**
    * @description Sets translate(%, %) to marker to align it properly.
    *
    * If you want to make aligment to be like Yandex Maps 2.0, set this property to "top left-center".
    * @default default (as goes in Yandex by default)
    */
    position: {
      type: String
    },
    /**
    * @description Allows you to add any attributes to <div class="__ymap-marker"> container.
    *
    * Important: to pass styles, you must use object-style prop instead of string.
    */
    containerAttrs: {
      type: Object,
      default: () => ({})
    },
    /**
    * @description Allows you to add any attributes to <div class="__ymap-marker_wrapper"> container.
    *
    * Important: to pass styles, you must use object-style prop instead of string.
    */
    wrapperAttrs: {
      type: Object,
      default: () => ({})
    },
    /**
    * @description Will add width and height: 0 to container.
    *
    * Null enables default behavior, false disables it completely (even if position is specified).
    *
    * @default true if position is specified, false otherwise
    */
    zeroSizes: {
      type: Boolean,
      default: null
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit,
    attrs
  }) {
    const element = ref(null);
    const rootProps = computed(() => getMarkerContainerProps({
      position: props.position,
      containerAttrs: props.containerAttrs,
      wrapperAttrs: props.wrapperAttrs,
      zeroSizes: props.zeroSizes
    }));
    return () => hF([
      h("div", {
        ...rootProps.value.root,
        ref: element,
        ...getAttrsForVueVersion(attrs)
      }, [
        h("div", {
          ...rootProps.value.children
        }, slots.default?.({}))
      ])
    ]);
  }
});
defineComponent({
  name: "YandexMapDefaultMarker",
  inheritAttrs: false,
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit,
    attrs
  }) {
    const popup = ref(null);
    const closeFunc = ref(() => {
    });
    const contentFunc = (close) => {
      closeFunc.value = close;
      return popup.value;
    };
    computed(() => {
      const settings = { ...props.settings };
      if (settings.popup && (typeof settings.popup.content === "undefined" || settings.popup.content === "fromSlot") && popup.value) {
        settings.popup = {
          ...settings.popup,
          content: contentFunc
        };
      }
      return settings;
    });
    watch(popup, () => {
      if (popup.value) popup.value.parentNode?.removeChild(popup.value);
    });
    return () => {
      if (slots.popup) {
        return hF([
          h("div", {
            ref: popup
          }, slots.popup?.({ close: closeFunc.value }))
        ]);
      }
      return void 0;
    };
  }
});
defineComponent({
  name: "YandexMapFeature",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => hVue2(slots.default?.({}));
  }
});
const _sfc_main$v = defineComponent({
  name: "YandexMapControls",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const mapChildren = shallowRef(null);
    return () => mapChildren.value ? hVue2(slots.default?.({})) : h("div");
  }
});
defineComponent({
  name: "YandexMapControl",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit,
    attrs
  }) {
    const element = ref(null);
    return () => hF([
      h("div", {
        ref: element,
        ...getAttrsForVueVersion(attrs)
      }, slots.default?.({}))
    ]);
  }
});
defineComponent({
  name: "YandexMapControlButton",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit,
    attrs
  }) {
    const element = ref(null);
    return () => hF([
      h("div", {
        ref: element,
        ...getAttrsForVueVersion(attrs)
      }, slots.default?.({}))
    ]);
  }
});
defineComponent({
  name: "YandexMapGeolocationControl",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => hVue2(slots.default?.({}));
  }
});
const _sfc_main$r = defineComponent({
  name: "YandexMapZoomControl",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => hVue2(slots.default?.({}));
  }
});
defineComponent({
  name: "YandexMapScaleControl",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => hVue2(slots.default?.({}));
  }
});
defineComponent({
  name: "YandexMapCartesianProjection",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    bounds: {
      type: Array,
      required: true
    },
    cycled: {
      type: Array
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const hold = inject("needsToHold");
    hold.value++;
    inject("projection");
    return () => hVue2(slots.default?.({}));
  }
});
defineComponent({
  name: "YandexMapSphericalMercatorProjection",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const hold = inject("needsToHold");
    hold.value++;
    inject("projection");
    return () => hVue2(slots.default?.({}));
  }
});
const _sfc_main$n = defineComponent({
  name: "YandexMapHint",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    // Property that you will set on YandexMapMarker or YandexMapFeature to display hint content
    hintProperty: {
      type: String,
      required: true
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit,
    attrs
  }) {
    const element = shallowRef(null);
    const hintContent = shallowRef("");
    return () => hF([
      h("div", {
        ref: element,
        ...getAttrsForVueVersion(attrs)
      }, slots.default?.({ content: hintContent.value }))
    ]);
  }
});
defineComponent({
  name: "YandexMapOpenMapsButton",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => hVue2(slots.default?.({}));
  }
});
const _sfc_main$l = defineComponent({
  name: "YandexMapClustererCluster",
  props: {
    clusterMarkerProps: {
      type: Object,
      default: () => ({})
    },
    zoomOnClusterClick: {
      type: [Boolean, Object],
      default: false
    },
    feature: {
      type: Object,
      required: true
    }
  },
  emits: {
    // Exact features bounds returned on cluster click
    trueBounds(bounds) {
      return bounds.length === 2;
    },
    // Auto-corrected features bounds returned on cluster click
    updatedBounds(bounds) {
      return bounds.length === 2;
    },
    updatedCluster(clusterId) {
      return true;
    }
  },
  slots: Object,
  setup(props, { slots, emit }) {
    const map = injectMap();
    const element = ref(null);
    const containerProps = computed(() => getMarkerContainerProps({
      position: props.clusterMarkerProps?.position ?? "top-center left-center",
      containerAttrs: props.clusterMarkerProps?.containerAttrs,
      wrapperAttrs: props.clusterMarkerProps?.wrapperAttrs,
      zeroSizes: props.clusterMarkerProps?.zeroSizes
    }));
    function updateElement() {
      const _element = element.value;
      if (!_element) return;
      const clusterElement = props.feature.element;
      const clusterer = props.feature.clusterer;
      if (clusterElement.children.length) {
        clusterElement.children.forEach((x) => {
          try {
            clusterElement.removeChild(x);
          } catch (e) {
            console.warn("Non-fatal error occurred when updating Map clusterer", e);
          }
        });
      }
      try {
        clusterElement.addChild(new ymaps3.YMapMarker({
          ...excludeYandexMarkerProps(props.clusterMarkerProps),
          coordinates: clusterer.lnglat,
          onClick: async (event, mapEvent) => {
            props.clusterMarkerProps.onClick?.(event, mapEvent);
            if (clusterer.features.length >= 2) {
              const settings = typeof props.zoomOnClusterClick === "object" ? props.zoomOnClusterClick : {};
              const featuresCoords = clusterer.features.map((x) => x.geometry.coordinates);
              const bounds = getBoundsFromCoords(featuresCoords);
              emit("trueBounds", bounds);
              if (!props.zoomOnClusterClick) return;
              const defaultDuration = settings.duration ?? 500;
              if (settings.strategy === "boundsCorrect") {
                const [[minLongitude, maxLatitude], [maxLongitude, minLatitude]] = bounds;
                const latDiff = maxLatitude - minLatitude;
                const longDiff = maxLongitude - minLongitude;
                const updatedBounds = [[minLongitude - longDiff, maxLatitude - latDiff], [maxLongitude + longDiff, minLatitude + latDiff]];
                emit("updatedBounds", updatedBounds);
                map.value?.setLocation({
                  bounds: updatedBounds,
                  duration: defaultDuration,
                  easing: settings.easing
                });
              } else {
                const { center, zoom } = await getLocationFromBounds({
                  bounds,
                  map: map.value,
                  roundZoom: true,
                  comfortZoomLevel: true
                });
                map.value?.setLocation({
                  center,
                  zoom,
                  duration: defaultDuration,
                  easing: settings.easing
                });
                await sleep(defaultDuration + 50);
                if (map.value) emit("updatedBounds", map.value.bounds);
              }
            }
          }
        }, _element));
      } catch (e) {
        console.error(e);
      }
    }
    watch(element, updateElement);
    ref(false);
    return () => {
      return hF([
        h("div", {
          ...containerProps.value.root,
          ref: element
        }, [
          h("div", containerProps.value.children, slots.default?.({
            clusterer: props.feature.clusterer,
            coordinates: props.feature.clusterer.lnglat,
            length: props.feature.clusterer.features.length
          }))
        ])
      ]);
    };
  }
});
const _sfc_main$k = defineComponent({
  name: "YandexMapClustererClusters",
  props: {
    clusterMarkerProps: {
      type: Object,
      default: () => ({})
    },
    zoomOnClusterClick: {
      type: [Boolean, Object],
      default: false
    }
  },
  emits: {
    // Exact features bounds returned on cluster click
    trueBounds(bounds) {
      return bounds.length === 2;
    },
    // Auto-corrected features bounds returned on cluster click
    updatedBounds(bounds) {
      return bounds.length === 2;
    },
    updatedCluster(clusterId) {
      return true;
    }
  },
  slots: Object,
  setup(props, { emit, slots }) {
    const features = inject("clusterFeatures");
    return () => {
      let clusterSlots;
      if (isVue2()) {
        clusterSlots = features.value.map((feature) => h(_sfc_main$l, {
          props: {
            clusterMarkerProps: props.clusterMarkerProps,
            zoomOnClusterClick: props.zoomOnClusterClick,
            feature
          },
          on: {
            trueBounds: (e) => emit("trueBounds", e),
            updatedBounds: (e) => emit("updatedBounds", e),
            updatedCluster: (e) => emit("updatedCluster", e)
          },
          scopedSlots: {
            default: (options) => h("div", {}, [slots.default?.(options)])
          },
          key: feature.clusterer.clusterId
        }));
      } else {
        clusterSlots = features.value.map((feature) => h(_sfc_main$l, {
          clusterMarkerProps: props.clusterMarkerProps,
          zoomOnClusterClick: props.zoomOnClusterClick,
          feature,
          onTrueBounds: (e) => emit("trueBounds", e),
          onUpdatedBounds: (e) => emit("updatedBounds", e),
          onUpdatedCluster: (e) => emit("updatedCluster", e),
          key: feature.clusterer.clusterId
        }, {
          default: (options) => slots.default?.(options)
        }));
      }
      return hF(clusterSlots);
    };
  }
});
const _sfc_main$j = defineComponent({
  name: "YandexMapClusterer",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    /**
    * @description All custom (non-settings) props are also supported
    */
    clusterMarkerProps: {
      type: Object,
      default: () => ({})
    },
    /**
    * @description Size of the grid division in pixels
    *
    * Used in settings.method via Yandex clusterByGrid method
    *
    * @see https://yandex.ru/maps-api/docs/js-api/object/markers/YMapClusterer.html
    */
    gridSize: {
      type: Number,
      default: 64
    },
    /**
    * @description Zooms to bounds of features of cluster
    */
    zoomOnClusterClick: {
      type: [Boolean, Object],
      default: false
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    },
    // Exact features bounds returned on cluster click
    trueBounds(bounds) {
      return bounds.length === 2;
    },
    // Auto-corrected features bounds returned on cluster click
    updatedBounds(bounds) {
      return bounds.length === 2;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const mapChildren = shallowRef(null);
    const entities = shallowRef([]);
    const clusterFeatures = shallowRef([]);
    const revision = ref(0);
    const filteredFeatures = computed(() => clusterFeatures.value.filter((x) => x.clusterer.features.length > 1));
    provide("clusterFeatures", filteredFeatures);
    const tickTimeout = computed(() => props.settings.tickTimeout);
    const getSettings = () => {
      const settings = { ...props.settings };
      if (tickTimeout.value) settings.tickTimeout = tickTimeout.value;
      let marker = settings.marker;
      if (!marker) {
        marker = (feature) => {
          const entity = entities.value.find((x) => x._props.id === feature.id);
          if (!entity) {
            throwException({
              text: `No entity with id ${feature.id} (coordinates: ${feature.geometry.coordinates.join(", ")}) were found in YandexMapClusterer.`,
              isInternal: true,
              warn: true
            });
            return new ymaps3.YMapMarker({ coordinates: feature.geometry.coordinates });
          }
          return entity;
        };
      }
      const cluster = (coordinates) => {
        const foundCluster = clusterFeatures.value.find((x) => x.clusterer.lnglat[0] === coordinates[0] && x.clusterer.lnglat[1] === coordinates[1]);
        if (!foundCluster) {
          throwException({
            text: `No element with coordinates of ${coordinates.join(", ")} were found in YandexMapClusterer.`,
            isInternal: true,
            warn: true
          });
          return new ymaps3.YMapMarker({ coordinates });
        }
        return foundCluster.element;
      };
      let features = settings.features;
      if (!features) {
        features = entities.value.map((entity, i) => {
          if (!entity._props.id) {
            entity.update({
              id: Math.random().toString() + Date.now().toString()
            });
          }
          return {
            type: "Feature",
            id: entity._props.id,
            geometry: {
              type: "Point",
              coordinates: entity._props.coordinates
            },
            properties: "properties" in entity._props ? entity._props.properties : {}
          };
        });
      }
      settings.onRender = (clustersList) => {
        if (clustersList.length <= 1) revision.value++;
        clusterFeatures.value = clustersList.map((clusterer) => {
          clusterer.clusterId = `cluster-${revision.value}-${clusterer.features.map((x) => x.id).join(",")}`;
          return {
            clusterer,
            element: clusterFeatures.value.find((x) => x.clusterer.clusterId === clusterer.clusterId)?.element || new ymaps3.YMapCollection({})
          };
        });
        if (props.settings.onRender) return props.settings.onRender(clustersList);
      };
      return {
        ...settings,
        marker,
        features,
        cluster
      };
    };
    const update = async () => {
      clusterFeatures.value = [];
      await nextTick();
      mapChildren.value?.update(getSettings());
      mapChildren.value?._render();
    };
    watch(() => [props.settings, props.gridSize], () => {
      update();
    }, {
      deep: true
    });
    watch(entities, async () => {
      await nextTick();
      update();
    });
    return () => {
      if (!mapChildren.value) return h("div");
      if (isVue2()) {
        return h("div", [
          ...slots.default?.({}) || [],
          h(_sfc_main$k, {
            props: {
              clusterMarkerProps: props.clusterMarkerProps,
              zoomOnClusterClick: props.zoomOnClusterClick
            },
            on: {
              trueBounds: (e) => emit("trueBounds", e),
              updatedBounds: (e) => emit("updatedBounds", e),
              updatedCluster: () => revision.value++
            },
            scopedSlots: {
              default: (options) => h("div", {}, [slots.cluster?.(options)])
            }
          })
        ]);
      }
      return h("div", [
        ...slots.default?.({}) || [],
        h(_sfc_main$k, {
          clusterMarkerProps: props.clusterMarkerProps,
          zoomOnClusterClick: props.zoomOnClusterClick,
          onTrueBounds: (e) => emit("trueBounds", e),
          onUpdatedBounds: (e) => emit("updatedBounds", e),
          onUpdatedCluster: (e) => revision.value++
        }, {
          default: (options) => slots.cluster?.(options)
        })
      ]);
    };
  }
});
defineComponent({
  name: "YandexMapCollection",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const mapChildren = shallowRef(null);
    return () => {
      if (!mapChildren.value) return h("div");
      return () => hVue2(slots.default?.({}));
    };
  }
});
defineComponent({
  name: "YandexMapEntity",
  inheritAttrs: false,
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    index: Number
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit,
    attrs
  }) {
    const element = ref(null);
    return () => hF([
      h("div", {
        ref: element,
        ...getAttrsForVueVersion(attrs)
      }, slots.default?.({}))
    ]);
  }
});
defineComponent({
  name: "YandexMapRuler",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    pointProps: {
      type: Object,
      default: () => ({})
    },
    previewPointProps: {
      type: [String, Object],
      default: () => ({})
    },
    /**
    * @description readonly-array with all points states
    */
    pointsState: {
      type: Array,
      default: () => []
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    },
    "update:pointsState"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    class RulerPoint extends ymaps3.YMapComplexEntity {
      entity;
      constructor(props2, entity) {
        super(props2);
        this.entity = entity;
      }
      _onUpdate(props2) {
        if (props2.state !== void 0) {
          this.entity.state.state = props2.state;
          triggerRef(entities);
        }
      }
    }
    const previewPoint = ref(null);
    const entities = shallowRef([]);
    watch(entities, () => {
      emit("update:pointsState", entities.value.map((x) => x.state));
    });
    const getEntity = (state) => {
      const rulerPoint = {};
      rulerPoint.entity = new RulerPoint(state, rulerPoint);
      return rulerPoint;
    };
    const handleEntityRequest = (params) => {
      const entity = getEntity(params);
      entities.value.splice(params.state.index, 0, entity);
      entity.state = params;
      triggerRef(entities);
      return entity.entity;
    };
    const handleUpdate = (state) => {
      props.settings.onUpdate?.(state);
      if (state.points.length >= entities.value.length) return;
      const actualPoints = new Set(state.points.map((p) => String(p)));
      entities.value = entities.value.filter(({ state: entityState }) => actualPoints.has(String(entityState?.state.coordinates)));
    };
    computed(() => {
      return {
        ...props.settings,
        point: handleEntityRequest,
        previewPoint: previewPoint.value ?? (void 0).createElement("div"),
        onUpdate: handleUpdate
      };
    });
    const containerProps = computed(() => getMarkerContainerProps({
      position: props.pointProps?.position ?? "top-center left-center",
      containerAttrs: props.pointProps?.containerAttrs,
      wrapperAttrs: props.pointProps?.wrapperAttrs,
      zeroSizes: props.pointProps?.zeroSizes
    }));
    const previewProps = computed(() => {
      const settings2 = props.previewPointProps === "fromPointProps" ? props.pointProps : props.previewPointProps;
      return getMarkerContainerProps({
        position: settings2.position ?? "top-center left-center",
        containerAttrs: settings2.containerAttrs,
        wrapperAttrs: settings2.wrapperAttrs,
        zeroSizes: settings2.zeroSizes
      });
    });
    return () => {
      const list = Object.values(entities.value);
      const entitiesSlots = list.map(({ entity, state }) => {
        return hF([
          h("div", {
            ...containerProps.value.root,
            ref: (element) => {
              if (!element) return;
              const settings2 = {
                ...props.pointProps,
                coordinates: state.state.coordinates,
                draggable: props.settings.editable ?? state.state.editable,
                source: state.state.source,
                onDragEnd: (...args) => {
                  props.pointProps.onDragEnd?.(...args);
                  state.onDragEnd(...args);
                },
                onDragMove: (...args) => {
                  props.pointProps.onDragMove?.(...args);
                  state.onDragMove(...args);
                },
                onDragStart: (...args) => {
                  props.pointProps.onDragStart?.(...args);
                  state.onDragStart(...args);
                }
              };
              if (entity.children.length && element.closest("ymaps")) {
                const marker2 = entity.children[0];
                marker2.update(settings2);
                return;
              }
              const marker = new ymaps3.YMapMarker(settings2, element);
              entity.children.map((x) => entity.removeChild(x));
              entity.addChild(marker);
            }
          }, [h("div", containerProps.value.children, slots.point(state))])
        ], {
          key: String(state.state.index) + state?.state.totalCount
        });
      });
      return hVue2([
        hF(entitiesSlots),
        h("div", {
          ...previewProps.value.root,
          ref: previewPoint
        }, [h("div", previewProps.value.children, slots.previewPoint({}))])
      ]);
    };
  }
});
defineComponent({
  name: "YandexMapTrafficLayer",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => slots.default?.({});
  }
});
defineComponent({
  name: "YandexMapTrafficEventsLayer",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => slots.default?.({});
  }
});
defineComponent({
  name: "YandexMapRotateControl",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => hVue2(slots.default?.({}));
  }
});
defineComponent({
  name: "YandexMapTiltControl",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => hVue2(slots.default?.({}));
  }
});
defineComponent({
  name: "YandexMapRotateTiltControl",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => hVue2(slots.default?.({}));
  }
});
defineComponent({
  name: "YandexMapResizer",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => hVue2(slots.default?.({}));
  }
});
defineComponent({
  name: "YandexMapMiniMap",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => hVue2(slots.default?.({}));
  }
});
defineComponent({
  name: "YandexMapContextMenu",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const mapChildren = shallowRef(void 0);
    return () => mapChildren.value ? hVue2(slots.default?.({})) : h("div");
  }
});
defineComponent({
  name: "YandexMapContextMenuItem",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => hVue2(slots.default?.({}));
  }
});
defineComponent({
  name: "YandexMapDrawerControl",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const content = ref(null);
    shallowRef(void 0);
    const contentFunc = () => {
      return content.value;
    };
    computed(() => {
      return { ...props.settings, content: contentFunc };
    });
    return () => {
      return hF([
        h("div", {
          ref: content
        }, slots.default?.({}))
      ]);
    };
  }
});
defineComponent({
  name: "YandexMapSignpost",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const mapChildren = shallowRef(void 0);
    return () => mapChildren.value ? hVue2(slots.default?.({})) : h("div");
  }
});
defineComponent({
  name: "YandexMapSpinner",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const mapChildren = shallowRef(void 0);
    return () => mapChildren.value ? hVue2(slots.default?.({})) : h("div");
  }
});
defineComponent({
  name: "YandexMapUiMarker",
  inheritAttrs: false,
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit,
    attrs
  }) {
    const popup = ref(null);
    const contentFunc = () => {
      return popup.value;
    };
    computed(() => {
      const settings = { ...props.settings };
      if (settings.popup && (typeof settings.popup.content === "undefined" || settings.popup.content === "fromSlot") && popup.value) {
        settings.popup = {
          ...settings.popup,
          content: contentFunc
        };
      }
      return settings;
    });
    watch(popup, () => {
      if (popup.value) popup.value.parentNode?.removeChild(popup.value);
    });
    return () => {
      if (slots.popup) {
        return hF([
          h("div", {
            ref: popup
          }, slots.popup?.({}))
        ]);
      }
      return void 0;
    };
  }
});
defineComponent({
  name: "YandexMapSearchControl",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    },
    index: Number
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => hVue2(slots.default?.({}));
  }
});
defineComponent({
  name: "YandexMapRouteControl",
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      default: () => ({})
    },
    index: Number
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    return () => hVue2(slots.default?.({}));
  }
});
defineComponent({
  name: "YandexMapPopupMarker",
  inheritAttrs: false,
  props: {
    value: {
      type: Object,
      default: null
    },
    modelValue: {
      type: Object,
      default: null
    },
    settings: {
      type: Object,
      required: true
    }
  },
  emits: {
    "input"(item) {
      return true;
    },
    "update:modelValue"(item) {
      return true;
    }
  },
  slots: Object,
  setup(props, {
    slots,
    emit
  }) {
    const element = ref(null);
    const contentFunc = () => {
      return element.value;
    };
    computed(() => {
      return {
        ...props.settings,
        content: contentFunc
      };
    });
    return () => {
      return hF([
        h("div", {
          ref: element
        }, slots.default?.({}))
      ]);
    };
  }
});
const useMapState = () => {
  return useState("mapState", () => ({
    center: void 0,
    zoom: 20,
    offerId: void 0
  }));
};

export { _sfc_main$G as _, _sfc_main$D as a, _sfc_main$E as b, _sfc_main$v as c, _sfc_main$r as d, _sfc_main$j as e, _sfc_main$y as f, _sfc_main$n as g, useMapState as u };
//# sourceMappingURL=useMapState-Er0loVNa.mjs.map
