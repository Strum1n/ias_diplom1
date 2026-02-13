<template>
  <yandex-map
    v-if="visible"
    v-model="map"
    cursor-grab
    :height="'100%'"
    :settings="{
      location: {
        ...LOCATION,
        duration: 2500,
      },
      camera,
      showScaleInCopyrights: true,
    }"
    :width="'100%'">
    <yandex-map-default-scheme-layer />
    <yandex-map-default-features-layer />
    <!-- <yandex-map-controls :settings="{ position: 'bottom left', orientation: 'vertical' }">
            <yandex-map-control-button>
                Zoom: {{ zoom }}
            </yandex-map-control-button>
            <yandex-map-control-button>
                Bounds: <span class="bounds">{{ JSON.stringify(bounds) }}</span>
            </yandex-map-control-button>
        </yandex-map-controls> -->
    <yandex-map-controls :settings="{ position: 'right' }">
      <yandex-map-zoom-control />
    </yandex-map-controls>
    <yandex-map-clusterer
      v-model="clusterer"
      :grid-size="64"
      :settings="{
        features: getPointList,
        marker: createMarker,
      }"
      zoom-on-cluster-click>
      <template #cluster="{ length, coordinates }">
        <div class="cluster" @click="openClusterPopup(coordinates)">
          {{ length }}
        </div>
        <div v-if="clusterPopup && areCoordsEqual(clusterPopup.coordinates, coordinates)" class="cluster-popup">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm">Объявлений в доме: {{ length }}</p>
            <button class="cluster-close-btn" @click.stop="clusterPopup = null">×</button>
          </div>

          <div class="offers-list">
            <div class="offer-card" v-for="(offer, index) in clusterPopup.offers" :key="offer.id">
              <div class="font-bold text-base">{{ offer.title }}</div>
              <div class="relative">
                <UBadge class="absolute top-1.5 left-1.5" v-if="offer.is_new_house" color="neutral">Новостройка</UBadge>
                <img class="offer-img" :src="offer.image_url" alt="" />
                <button class="favorite-heart" :class="{ active: isFavorite(offer.id) }" @click.stop="toggleFavorite(offer)">
                  <UIcon size="20" :name="isFavorite(offer.id) ? 'material-symbols-light:favorite' : 'material-symbols-light:favorite-outline'" />
                </button>
              </div>

              <div class="gap-2 font-semibold text-[var(--color-info)] flex items-center">
                {{ formatPrice(offer.price) }}

                <UBadge v-if="offer.price_category == 'expensive'" color="error"> {{ getPriceCategoryLabel(offer.price_category) }}</UBadge>
                <UBadge v-else-if="offer.price_category == 'normal'" color="info"> {{ getPriceCategoryLabel(offer.price_category) }}</UBadge>
                <UBadge v-else="offer.price_category == 'cheap'" color="success"> {{ getPriceCategoryLabel(offer.price_category) }}</UBadge>
              </div>

              <div class="text-muted text-sm">{{ offer.address?.full_address }}</div>

              <div class="flex gap-4 items-center">
                <UButton class="w-max mt-1.5 text-sm" size="md" color="info" trailing-icon="i-lucide-arrow-right" :to="`/offers/${offer.id}`"> К объекту </UButton>
                <UButton
                  class="mt-1.5 h-8 text-sm"
                  color="neutral"
                  icon="lucide:navigation"
                  target="_blank"
                  :to="`https://yandex.ru/maps/?mode=routes&routes[activeComparisonMode]=auto&rtext=~${offer.address?.coordinates_list[1]},${offer.address?.coordinates_list[0]}&z=17`">
                  Маршрут
                </UButton>
              </div>

              <USeparator v-if="index < clusterPopup.offers.length - 1" class="my-3" orientation="horizontal" />
            </div>
          </div>
        </div>
      </template>
    </yandex-map-clusterer>
  </yandex-map>
</template>

<script setup lang="ts">
import type { LngLatBounds, YMap, YMapCameraRequest, YMapLocationRequest, YMapMarker } from "@yandex/ymaps3-types";
import type { Feature as ClustererFeature, YMapClusterer } from "@yandex/ymaps3-types/packages/clusterer";
import { computed, onMounted, ref, shallowRef, useCssModule } from "vue";
import { YandexMap, YandexMapClusterer, YandexMapControls, YandexMapDefaultFeaturesLayer, YandexMapDefaultSchemeLayer, YandexMapZoomControl } from "vue-yandex-maps";

const props = defineProps<{
  parentOffers?: Offer[];
}>();
const mapState = useMapState();

const map = shallowRef<YMap | null>(null);
const clusterer = shallowRef<YMapClusterer | null>(null);
const visible = ref(true);

const zoom = ref(0);
const bounds = ref<LngLatBounds>([
  [0, 0],
  [0, 0],
]);

const { data: favoritesData, refresh: refreshFavorites } = useAsyncData("favorites", () => $api("offers/favorites/"));

const openRouteToOffer = (coords: number[], type: "auto" | "pedestrian" | "mt" = "auto") => {
  if (!coords || coords.length !== 2) return;
  const [lng, lat] = coords;

  const url = `https://yandex.ru/maps/?mode=routes&routes[activeComparisonMode]=auto&rtext=~${lat},${lng}&z=17`;
  window.open(url, "_blank");
};

const { $api } = useNuxtApp();

const favoriteOffers = computed(() => {
  return new Set(favoritesData.value?.map((item) => item.id) || []);
});

const toggleFavorite = async (offer: Offer) => {
  if (!offer.id) return;
  console.log(favoritesData.value);
  console.log(favoriteOffers.value);
  const offerId = offer.id;
  const wasFavorite = favoriteOffers.value.has(offerId);

  try {
    if (wasFavorite) {
      $api(`offers/favorites/${offerId}`, { method: "DELETE" });

      if (favoritesData.value) {
        favoritesData.value = favoritesData.value.filter((item) => item.id !== offerId);
      }
    } else {
      $api(`offers/favorites/${offerId}`, { method: "POST" });

      if (favoritesData.value) {
        favoritesData.value = [...favoritesData.value, offer];
      }
      refreshFavorites();
    }
  } catch (error) {
    console.error("Ошибка при обновлении избранного:", error);
  }
};

const isFavorite = (offerId: number | null): boolean => {
  return offerId !== null && favoriteOffers.value.has(offerId);
};

onMounted(() => {
  console.log("Маунтимся");
  console.log("Офферы от родителя", props.parentOffers);
  console.log("Центр из mapState", mapState.value.center);
  console.log("OfferId из mapState", mapState.value.offerId);
  if (mapState.value.center) {
    LOCATION.value.center = mapState.value.center;
    LOCATION.value.zoom = mapState.value.zoom;
  }

  // setInterval(() => {
  //     if (map.value) {
  //         zoom.value = map.value.zoom;
  //         bounds.value = map.value.bounds;
  //     }
  // }, 1000);
});

// watch(map, val => console.log('map', val));
// watch(clusterer, val => console.log('cluster', val));

const clusterPopup = ref<null | { coordinates: [number, number]; offers: Offer[] }>(null);

function areCoordsEqual(a: [number, number], b: [number, number]) {
  return Number(a[0].toFixed(6)) === Number(b[0].toFixed(6)) && Number(a[1].toFixed(6)) === Number(b[1].toFixed(6));
}

const getPricePopup = (feature: ClustererFeature): string => {
  return `<div class=" min-w-max rounded-sm mb-12.5 border border-gray-300 bg-white px-1 py-0.5 text-sm font-semibold text-[var(--color-info)]">
    ${formatPrice(feature.properties.price)}
  </div>`;
};

const getInfoPopup = (feature: ClustererFeature): string => {
  const filledIcon =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KCTxwYXRoIGZpbGw9IiNlNzAwMGIiIGQ9Im0xMiAxOS42NTRsLS43NTgtLjY4NXEtMi40NDgtMi4yMzYtNC4wNS0zLjgyOHEtMS42MDEtMS41OTMtMi41MjgtMi44MXQtMS4yOTYtMi4yVDMgOC4xNXEwLTEuOTA4IDEuMjk2LTMuMjA0VDcuNSAzLjY1cTEuMzIgMCAyLjQ3NS42NzVUMTIgNi4yODlRMTIuODcgNSAxNC4wMjUgNC4zMjVUMTYuNSAzLjY1cTEuOTA4IDAgMy4yMDQgMS4yOTZUMjEgOC4xNXEwIC45OTYtLjM2OCAxLjk4cS0uMzY5Ljk4Ni0xLjI5NiAyLjIwMnQtMi41MTkgMi44MDlxLTEuNTkyIDEuNTkyLTQuMDYgMy44Mjh6IiAvPgo8L3N2Zz4=";
  const outlineIcon =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KCTxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0ibTEyIDE5LjY1NGwtLjc1OC0uNjg1cS0yLjQ0OC0yLjIzNi00LjA1LTMuODI4cS0xLjYwMS0xLjU5My0yLjUyOC0yLjgxdC0xLjI5Ni0yLjJUMyA4LjE1cTAtMS45MDggMS4yOTYtMy4yMDRUNy41IDMuNjVxMS4zMiAwIDIuNDc1LjY3NVQxMiA2LjI4OVExMi44NyA1IDE0LjAyNSA0LjMyNVQxNi41IDMuNjVxMS45MDggMCAzLjIwNCAxLjI5NlQyMSA4LjE1cTAgLjk5Ni0uMzY4IDEuOThxLS4zNjkuOTg2LTEuMjk2IDIuMjAydC0yLjUxOSAyLjgwOXEtMS41OTIgMS41OTItNC4wNiAzLjgyOHptMC0xLjM1NHEyLjQtMi4xNyAzLjk1LTMuNzE2dDIuNDUtMi42ODV0MS4yNS0yLjAxNVEyMCA5LjAwNiAyMCA4LjE1cTAtMS41LTEtMi41dC0yLjUtMXEtMS4xOTQgMC0yLjIwNC42ODJUMTIuNDkgNy4zODVoLS45NzhxLS44MTctMS4zOS0xLjgxNy0yLjA2M3EtMS0uNjcyLTIuMTk0LS42NzJxLTEuNDggMC0yLjQ5IDFUNCA4LjE1cTAgLjg1Ni4zNSAxLjczNHQxLjI1IDIuMDE1dDIuNDUgMi42NzVUMTIgMTguM20wLTYuODI1IiAvPgo8L3N2Zz4=";

  return feature.properties?.is_new_house
    ? `<div class="marker-popup">
        

        <div class="offer-card">
        <div class="flex items-start justify-between gap-3">
            <p class="font-bold text-base">${feature.properties?.title}</p>
            <button class="cluster-close-btn">×</button>
        </div>
            <div class="relative">
            
                <button class="favorite-heart" data-offer-id="${feature.id}">
                    <img class="favorite-icon" src="${isFavorite(Number(feature.id)) ? filledIcon : outlineIcon}" alt="icon" />
                </button>
                <span class="font-medium inline-flex items-center text-xs px-2 py-1 gap-1 rounded-md text-inverted bg-inverted absolute top-1.5 left-1.5">Новостройка</span>
                <img src="${feature.properties?.image_url}" alt="" class="w-full h-37.5 object-cover rounded-md bg-gray-100" />
            </div>

            <div class="flex gap-2 font-semibold text-[var(--color-info)]">
                ${formatPrice(feature.properties?.price)} 
                <span style="background-color: ${getPriceCategoryColor(feature.properties?.price_category)}" class="font-medium inline-flex items-center text-xs px-2 py-1 gap-1 rounded-md text-inverted">${getPriceCategoryLabel(feature.properties?.price_category)}</span>
            </div>

            <div class="text-sm text-muted">${feature.properties?.address}</div>

            <div class="flex items-center gap-4">
            <a href="/offers/${feature.id}" class="rounded-md mt-1.5 font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2.5 py-1.5 text-sm gap-1.5 text-inverted bg-info hover:bg-info/75 active:bg-info/75 disabled:bg-info aria-disabled:bg-info focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info w-max">
                К объекту <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWFycm93LXJpZ2h0LWljb24gbHVjaWRlLWFycm93LXJpZ2h0Ij48cGF0aCBkPSJNNSAxMmgxNCIvPjxwYXRoIGQ9Im0xMiA1IDcgNy03IDciLz48L3N2Zz4="/>
            </a>
            <a href="https://yandex.ru/maps/?mode=routes&amp;routes[activeComparisonMode]=auto&amp;rtext=~${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}&amp;z=17" target="_blank" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2.5 py-1.5 gap-1.5 text-inverted bg-inverted hover:bg-inverted/90 active:bg-inverted/90 disabled:bg-inverted aria-disabled:bg-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverted mt-1.5 h-8 text-sm">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='20' height='20'%3E%3Cpath fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m3 11l19-9l-9 19l-2-8z'/%3E%3C/svg%3E"/> Маршрут
            <a/>
            </div>
            
        </div>
    </div>`
    : `<div class="marker-popup">
        

        <div class="offer-card">
        <div class="flex items-start justify-between gap-3">
            <p class="font-bold text-base">${feature.properties?.title}</p>
            <button class="cluster-close-btn">×</button>
        </div>
            <div class="relative">
            
                <button class="favorite-heart" data-offer-id="${feature.id}">
                    <img class="favorite-icon" src="${isFavorite(Number(feature.id)) ? filledIcon : outlineIcon}" alt="icon" />
                </button>
                
                <img src="${feature.properties?.image_url}" alt="" class="w-full h-37.5 object-cover rounded-md bg-gray-100" />
            </div>

            <div class="flex gap-2 font-semibold text-[var(--color-info)]">
                ${formatPrice(feature.properties?.price)} 
                <span style="background-color: ${getPriceCategoryColor(feature.properties?.price_category)}" class="font-medium inline-flex items-center text-xs px-2 py-1 gap-1 rounded-md text-inverted">${getPriceCategoryLabel(feature.properties?.price_category)}</span>
            </div>

            <div class="text-sm text-muted">${feature.properties?.address}</div>

            <div class="flex items-center gap-4">
            <a href="/offers/${feature.id}" class="rounded-md mt-1.5 font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2.5 py-1.5 text-sm gap-1.5 text-inverted bg-info hover:bg-info/75 active:bg-info/75 disabled:bg-info aria-disabled:bg-info focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info w-max">
                К объекту <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWFycm93LXJpZ2h0LWljb24gbHVjaWRlLWFycm93LXJpZ2h0Ij48cGF0aCBkPSJNNSAxMmgxNCIvPjxwYXRoIGQ9Im0xMiA1IDcgNy03IDciLz48L3N2Zz4="/>
            </a>
            <a href="https://yandex.ru/maps/?mode=routes&amp;routes[activeComparisonMode]=auto&amp;rtext=~${feature.geometry.coordinates[1]},${feature.geometry.coordinates[0]}&amp;z=17" target="_blank" class="rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 transition-colors px-2.5 py-1.5 gap-1.5 text-inverted bg-inverted hover:bg-inverted/90 active:bg-inverted/90 disabled:bg-inverted aria-disabled:bg-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverted mt-1.5 h-8 text-sm">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='20' height='20'%3E%3Cpath fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m3 11l19-9l-9 19l-2-8z'/%3E%3C/svg%3E"/> Маршрут
            <a/>
            </div>
            
        </div>
    </div>`;
};

function openClusterPopup(clusterCoords: [number, number]) {
  const rounded = [Number(clusterCoords[0].toFixed(6)), Number(clusterCoords[1].toFixed(6))] as [number, number];

  const matchingOffers = props.parentOffers?.filter((offer) => {
    const c = offer.address?.coordinates_list;
    if (!c) return false;

    return Number(c[0].toFixed(6)) === rounded[0] && Number(c[1].toFixed(6)) === rounded[1];
  });

  if (matchingOffers.length === 0) {
    clusterPopup.value = null;
    return;
  }
  if (prevFeature.value && prevFeature.value.properties?.isSelected == true) {
    console.log(`Меняем IsSelected у предыдущего маркера с id ${prevFeature.value?.id} с true на false`);
    prevFeature.value.properties!.isSelected = !prevFeature.value.properties?.isSelected;
    const prevMarker = allMarkers.get(prevFeature.value.id);
    prevMarker.element.innerHTML = getPricePopup(prevFeature.value);
  }
  clusterPopup.value = {
    coordinates: rounded,
    offers: matchingOffers,
  };
}

const getPointList = computed(() => {
  if (!map.value) return [];

  const result: ClustererFeature[] = [];

  for (let i = 0; i < props.parentOffers.length; i++) {
    result.push({
      type: "Feature",
      id: `${props.parentOffers[i]?.id}`,
      geometry: {
        type: "Point",
        coordinates: props.parentOffers[i]?.address?.coordinates_list,
      },
      properties: {
        is_new_house: props.parentOffers[i]?.is_new_house,
        title: props.parentOffers[i]?.title,
        price: props.parentOffers[i]?.price,
        price_category: props.parentOffers[i]?.price_category,
        image_url: props.parentOffers[i]?.image_url,
        address: props.parentOffers[i]?.address?.full_address,
        isSelected: mapState?.value?.offerId === props.parentOffers[i]?.id,
      },
    });
  }

  return result;
});

const getPriceCategoryColor = (category: string) => {
  switch (category) {
    case "expensive":
      return "var(--color-error)";
    case "normal":
      return "var(--color-info)";
    case "cheap":
      return "var(--color-success)";
    default:
      return "gray";
  }
};

const getPriceCategoryLabel = (category: string) => {
  switch (category) {
    case "expensive":
      return "Выше рынка";
    case "normal":
      return "Рыночная цена";
    case "cheap":
      return "Ниже рынка";
    default:
      return category;
  }
};

const allMarkers: Map<string, YMapMarker> = new Map();
const selectedMarkerId = ref<string | null>(null);
const prevFeature = ref<ClustererFeature | null>(null);

function openMarkerPopup(feature: ClustererFeature) {
  console.log(`Кликнули на маркер с id ${feature.id}`);
  console.log(`Предыдущий маркер с id ${prevFeature.value?.id}`);
  const marker = allMarkers.get(feature.id);
  feature.properties!.isSelected = !feature.properties?.isSelected;
  if (feature.properties!.isSelected == true) {
    marker.element.innerHTML = getInfoPopup(feature);
  } else {
    console.log(`Маркер с id ${feature.id} меняется на IsSelected`);
    marker.element.innerHTML = getPricePopup(feature);
  }

  if (prevFeature.value && prevFeature.value.id != feature.id) {
    console.log(`Сейчас будем менять предыдущий маркер с id ${prevFeature.value?.id}`);
    console.log(`У предыдущего маркера IsSelected это ${prevFeature.value?.properties?.isSelected}`);
    if (prevFeature.value.properties?.isSelected == true) {
      console.log(`Меняем IsSelected у предыдущего маркера с id ${prevFeature.value?.id} с true на false`);
      prevFeature.value.properties!.isSelected = !prevFeature.value.properties?.isSelected;
      const prevMarker = allMarkers.get(prevFeature.value.id);
      prevMarker.element.innerHTML = getPricePopup(prevFeature.value);
    }
  }
  prevFeature.value = feature;
  return;
}

const allFeatures: Map<string, ClustererFeature> = new Map();
const cssModule = useCssModule();
const createMarker = (feature: ClustererFeature) => {
  console.log("Сработало событие createMarker");
  const featureCircle = document.createElement("div");
  featureCircle.classList.add(cssModule["marker"]);
  featureCircle.style.backgroundColor = getPriceCategoryColor(feature.properties?.price_category);
  allFeatures.set(feature.id, feature);

  if (feature.properties!.isSelected == true) {
    featureCircle.innerHTML = getInfoPopup(feature);
  } else {
    featureCircle.innerHTML = getPricePopup(feature);
  }

  // Добавляем обработчик клика на кнопку избранного
  featureCircle.addEventListener("click", async (e) => {
    const favoriteBtn = (e.target as HTMLElement).closest(".favorite-heart");
    if (favoriteBtn) {
      e.stopPropagation();
      const offerId = Number(favoriteBtn.getAttribute("data-offer-id"));
      const offer = props.parentOffers?.find((o) => o.id === offerId);
      if (offer) {
        await toggleFavorite(offer);

        // Обновляем иконку после успешного выполнения toggleFavorite
        const icon = favoriteBtn.querySelector(".favorite-icon") as HTMLImageElement;
        if (icon) {
          const filledIcon =
            "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KCTxwYXRoIGZpbGw9IiNlNzAwMGIiIGQ9Im0xMiAxOS42NTRsLS43NTgtLjY4NXEtMi40NDgtMi4yMzYtNC4wNS0zLjgyOHEtMS42MDEtMS41OTMtMi41MjgtMi44MXQtMS4yOTYtMi4yVDMgOC4xNXEwLTEuOTA4IDEuMjk2LTMuMjA0VDcuNSAzLjY1cTEuMzIgMCAyLjQ3NS42NzVUMTIgNi4yODlRMTIuODcgNSAxNC4wMjUgNC4zMjVUMTYuNSAzLjY1cTEuOTA4IDAgMy4yMDQgMS4yOTZUMjEgOC4xNXEwIC45OTYtLjM2OCAxLjk4cS0uMzY5Ljk4Ni0xLjI5NiAyLjIwMnQtMi41MTkgMi44MDlxLTEuNTkyIDEuNTkyLTQuMDYgMy44Mjh6IiAvPgo8L3N2Zz4=";
          const outlineIcon =
            "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KCTxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0ibTEyIDE5LjY1NGwtLjc1OC0uNjg1cS0yLjQ0OC0yLjIzNi00LjA1LTMuODI4cS0xLjYwMS0xLjU5My0yLjUyOC0yLjgxdC0xLjI5Ni0yLjJUMyA4LjE1cTAtMS45MDggMS4yOTYtMy4yMDRUNy41IDMuNjVxMS4zMiAwIDIuNDc1LjY3NVQxMiA2LjI4OVExMi44NyA1IDE0LjAyNSA0LjMyNVQxNi41IDMuNjVxMS45MDggMCAzLjIwNCAxLjI5NlQyMSA4LjE1cTAgLjk5Ni0uMzY4IDEuOThxLS4zNjkuOTg2LTEuMjk2IDIuMjAydC0yLjUxOSAyLjgwOXEtMS41OTIgMS41OTItNC4wNiAzLjgyOHptMC0xLjM1NHEyLjQtMi4xNyAzLjk1LTMuNzE2dDIuNDUtMi42ODV0MS4yNS0yLjAxNVEyMCA5LjAwNiAyMCA4LjE1cTAtMS41LTEtMi41dC0yLjUtMXEtMS4xOTQgMC0yLjIwNC42ODJUMTIuNDkgNy4zODVoLS45NzhxLS44MTctMS4zOS0xLjgxNy0yLjA2M3EtMS0uNjcyLTIuMTk0LS42NzJxLTEuNDggMC0yLjQ5IDFUNCA4LjE1cTAgLjg1Ni4zNSAxLjczNHQxLjI1IDIuMDE1dDIuNDUgMi42NzVUMTIgMTguM20wLTYuODI1IiAvPgo8L3N2Zz4=";

          icon.src = isFavorite(offerId) ? filledIcon : outlineIcon;
        }
      }
    }
  });

  const yMapMarker = new ymaps3.YMapMarker(
    {
      hideOutsideViewport: true,
      id: feature.id,
      coordinates: feature.geometry.coordinates,
      onClick: () => {
        console.log("Кликнули на маркер", map.value?.bounds);
        selectedMarkerId.value = feature.id;
        clusterPopup.value = null;
        openMarkerPopup(feature);
      },
    },
    featureCircle,
  );
  allMarkers.set(feature.id, yMapMarker);

  return yMapMarker;
};

interface Address {
  house_number: string | null;
  full_address: string;
  coordinates_list: number[];
}
const formatPrice = (price: number | null) => (price ? new Intl.NumberFormat("ru-RU").format(price) + " ₽" : "Цена не указана");
interface Offer {
  id: number | null;
  url: string | null;
  price: number | null;
  total_area: number | null;
  land_area: number | null;
  living_area: number | null;
  rooms_count: number | null;
  floor: number | null;
  title: string | null;
  price_category: string | null;
  is_new_house: Boolean | null;
  address: Address | null;
  image_url: string | null;
}
const camera = ref<YMapCameraRequest>({
  duration: 2500,
});

const LOCATION = ref<YMapLocationRequest>({
  center: [37.623082, 55.75254],
  zoom: 10,
});
</script>
<style>
.ymaps3x0--marker:has(.offer-list) {
  z-index: 999 !important;
}

.ymaps3x0--marker {
  z-index: 998 !important;
}

.ymaps3x0--marker:has(.marker-popup) {
  z-index: 999 !important;
}
</style>

<style scoped>
@reference "tailwindcss";

.cluster {
  @apply bg-[var(--ui-info)] text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow-md cursor-pointer transition-all ease-linear transform hover:scale-140;
}

.cluster:hover {
  animation: pulse-animation 1.3s infinite;
}

@keyframes pulse-animation {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }

  100% {
    box-shadow: 0 0 0 8px rgba(0, 0, 0, 0);
  }
}

:deep(.cluster-close-btn),
.cluster-close-btn {
  @apply flex justify-center items-center min-w-5.5 h-5.5 pb-1 border-none bg-gray-200 rounded-full cursor-pointer text-gray-700 hover:bg-gray-300;
}

.offers-list {
  @apply max-h-81 overflow-y-auto pr-3.5;
}

:deep(.offer-card),
.offer-card {
  @apply flex flex-col gap-1.5;
}

.offer-img {
  @apply w-full h-37.5 object-cover rounded-md;
}

:deep(.favorite-heart),
.favorite-heart {
  @apply absolute top-1.5 right-1.5 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-all ease-linear z-10;
}

:deep(.active),
.active {
  @apply bg-[#fdecec] text-red-500 transition-all duration-300;
}

.cluster-popup {
  @apply absolute top-6 left-4.5 bg-white p-3 rounded-xl shadow-lg min-w-75 overflow-hidden z-1000;
}

:deep(.favorite-heart:hover),
.favorite-heart:hover {
  background: var(--ui-color-neutral-100);
}

:deep(.marker-popup) {
  @apply absolute bg-white rounded-xl p-3 text-black min-w-75 shadow-lg cursor-default top-4 left-2.5;
}
</style>

<style module>
.marker {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 18px;
  height: 18px;
  cursor: pointer;

  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  transition: all 0.2s ease;
}

.marker:has(:deep(.marker-popup)) {
  transform: none !important;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5) !important;
}

.marker:hover:not(:has(:global(.marker-popup))) {
  transform: scale(1.15);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
}
</style>
