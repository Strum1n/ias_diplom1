<template>
  <UContainer class="px-5!">
    <div class="mt-5">
      <span
        >Опубликовано:
        {{
          new Date(offer.creation_date_source).toLocaleString("ru-RU", {
            timeZone: "Europe/Moscow",
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        }}
      </span>

      <div class="flex gap-12">
        <div class="max-w-200">
          <div>
            <h1 class="text-4xl font-bold my-2 text-black">{{ offer.title }}</h1>
          </div>
          <div class="text-muted my-4">
            {{ offer.address.full_address }}
            <ULink class="text-primary cursor-pointer" @click="showOnMap(offer)">На карте</ULink>
          </div>
          <div class="mb-6">
            <div class="flex-1 w-full">
              <UCarousel
                ref="carousel"
                v-slot="{ item }"
                arrows
                :items="offer.images_urls"
                :prev="{ onClick: onClickPrev }"
                :next="{ onClick: onClickNext }"
                :ui="{
                  controls: 'absolute top-61 inset-x-17.5 opasity-0',
                }"
                class="w-full max-w-200 min-h-120 mx-auto border-2 border-[#e5e7eb]"
                @select="onSelect">
                <img :src="item" width="2000" height="480" class="rounded-lg" />
              </UCarousel>

              <div ref="thumbsContainer" class="no-scroll flex gap-3 max-w-200 overflow-x-auto whitespace-nowrap pt-4 mx-auto">
                <div
                  v-for="(item, index) in offer.images_urls"
                  :key="index"
                  class="sas h-15 opacity-35 hover:opacity-100 transition-opacity"
                  :class="{ 'opacity-100': activeIndex === index }"
                  @click="select(index)">
                  <img :src="item" width="78" height="100" class="rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h3 class="!mt-0">Оценки</h3>
            <div class="flex justify-between">
              <div class="category-item">
                <span class="category-label">Для пожилых:</span>
                <UBadge size="lg" :color="getCategoryColor(offer.elderly_category)">
                  {{ getCategoryLabel(offer.elderly_category) }}
                </UBadge>
              </div>
              <div class="category-item">
                <span class="category-label">Для семьи:</span>
                <UBadge size="lg" :color="getCategoryColor(offer.family_category)">
                  {{ getCategoryLabel(offer.family_category) }}
                </UBadge>
              </div>
              <div class="category-item">
                <span class="category-label">Транспортная доступность:</span>
                <UBadge size="lg" :color="getCategoryColor(offer.transport_access_category)">
                  {{ getCategoryLabel(offer.transport_access_category) }}
                </UBadge>
              </div>
            </div>

            <h3 class="mb-0!">Описание</h3>

            <UAccordion
              type="multiple"
              :items="items"
              :unmount-on-hide="false"
              :ui="{
                trigger: 'text-base whitespace-pre-line ',
                body: 'text-base  whitespace-pre-line ',
              }">
              <template #body="{ item }">
                <MDC :value="item.content" />
              </template>
            </UAccordion>
            <div class="flex gap-10" v-if="['Квартира', 'Апартаменты'].includes(offer.property_type.name)">
              <div class="flex-1">
                <h3 class="!mt-0">О квартире</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Тип:</span>
                    <span v-if="offer.is_new_house" class="value">Новостройка</span>
                    <span v-else="offer.is_new_house" class="value">Вторичка</span>
                  </div>
                  <div v-if="offer.rooms_count > 0 && offer.rooms_count < 10" class="info-item">
                    <span class="label">Кол-во комнат:</span>
                    <span class="value">{{ offer.rooms_count }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Общая площадь:</span>
                    <span class="value">{{ offer.total_area }} м²</span>
                  </div>
                  <div v-if="offer.living_area" class="info-item">
                    <span class="label">Жилая площадь:</span>
                    <span class="value">{{ offer.living_area }} м²</span>
                  </div>
                  <div v-if="offer.kitchen_area" class="info-item">
                    <span class="label">Площадь кухни:</span>
                    <span class="value">{{ offer.kitchen_area }} м²</span>
                  </div>
                  <div v-if="offer.ceiling_height" class="info-item">
                    <span class="label">Высота потолков:</span>
                    <span class="value">{{ offer.ceiling_height }} м</span>
                  </div>
                  <div v-if="offer.bathrooms_count" class="info-item">
                    <span class="label">Кол-во санузлов:</span>
                    <span class="value">{{ offer.bathrooms_count }} {{ offer.bathroom_type?.name }}</span>
                  </div>
                  <div v-if="offer.has_balcony" class="info-item">
                    <span class="label">Балкон</span>
                    <span class="value">Есть</span>
                  </div>
                  <div v-if="offer.floor" class="info-item">
                    <span class="label">Этаж:</span>
                    <span class="value">{{ offer.floor }}</span>
                  </div>
                  <div v-if="offer.window_view_type" class="info-item">
                    <span class="label">Вид из окон:</span>
                    <span class="value">{{ offer.window_view_type?.name }}</span>
                  </div>
                  <div v-if="offer.renovation_type" class="info-item">
                    <span v-if="offer.is_new_house" class="label">Отделка:</span>
                    <span v-else class="label">Ремонт:</span>
                    <span class="value">{{ offer.renovation_type?.name }}</span>
                  </div>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="!mt-0">О доме</h3>
                <div class="info-grid">
                  <div v-if="offer.house_built_year" class="info-item">
                    <span class="label">Год постройки:</span>
                    <span class="value">{{ offer.house_built_year }}</span>
                  </div>
                  <div v-if="offer.house_floors_count" class="info-item">
                    <span class="label">Кол-во этажей:</span>
                    <span class="value">{{ offer.house_floors_count }}</span>
                  </div>
                  <div v-if="offer.elevators_count" class="info-item">
                    <span class="label">Кол-во лифтов:</span>
                    <span class="value">{{ offer.elevators_count }}</span>
                  </div>
                  <div v-if="offer.house_material_type" class="info-item">
                    <span class="label">Тип дома:</span>
                    <span class="value">{{ offer.house_material_type?.name }}</span>
                  </div>
                  <div v-if="offer.heating_type" class="info-item">
                    <span class="label">Отопление:</span>
                    <span class="value">{{ offer.heating_type?.name }}</span>
                  </div>
                  <div v-if="offer.parking_type" class="info-item">
                    <span class="label">Парковка:</span>
                    <span class="value">{{ offer.parking_type?.name }}</span>
                  </div>
                  <div v-if="offer.has_garbage_chute" class="info-item">
                    <span class="label">Мусоропровод:</span>
                    <span class="value">Есть</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-0.5" v-else>
              <div class="flex gap-10">
                <div class="flex-1">
                  <h3 class="!mt-0">О доме</h3>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">Площадь:</span>
                      <span class="value">{{ offer.total_area }} м²</span>
                    </div>
                    <div v-if="offer.house_material_type" class="info-item">
                      <span class="label">Материал дома:</span>
                      <span class="value">{{ offer.house_material_type?.name }}</span>
                    </div>
                    <div v-if="offer.house_floors_count" class="info-item">
                      <span class="label">Кол-во этажей:</span>
                      <span class="value">{{ offer.house_floors_count }}</span>
                    </div>
                    <div v-if="offer.bedrooms_count" class="info-item">
                      <span class="label">Кол-во спален:</span>
                      <span class="value">{{ offer.bedrooms_count }}</span>
                    </div>
                    <div v-if="offer.house_built_year" class="info-item">
                      <span class="label">Год постройки:</span>
                      <span class="value">{{ offer.house_built_year }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="!mt-0">Об участке</h3>
                  <div class="info-grid">
                    <div v-if="offer.land_area" class="info-item">
                      <span class="label">Площадь</span>
                      <span class="value">{{ offer.land_area }} сот.</span>
                    </div>
                    <div v-if="offer.land_type" class="info-item">
                      <span class="label">Статус участка</span>
                      <span class="value">{{ offer.land_type?.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <h3>Коммуникации и удобства</h3>
              <div class="info-grid">
                <div v-if="offer.bathrooms_count" class="info-item">
                  <span class="label">Кол-во санузлов:</span>
                  <span class="value">{{ offer.bathrooms_count }} {{ offer.bathroom_type?.name?.toLowerCase() }}</span>
                </div>
                <div v-if="offer.sewerage_type" class="info-item">
                  <span class="label">Канализация</span>
                  <span class="value">{{ offer.sewerage_type?.name }}</span>
                </div>
                <div v-if="offer.water_supply_type" class="info-item">
                  <span class="label">Водоснабжение</span>
                  <span class="value">{{ offer.water_supply_type?.name }}</span>
                </div>
                <div v-if="offer.heating_type" class="info-item">
                  <span class="label">Отопление</span>
                  <span class="value">{{ offer.heating_type?.name }}</span>
                </div>
                <div v-if="offer.has_electricity" class="info-item">
                  <span class="label">Электричество</span>
                  <span class="value">Есть</span>
                </div>
                <div v-if="offer.gas_type" class="info-item">
                  <span class="label">Газ</span>
                  <span class="value">{{ offer.gas_type?.name }}</span>
                </div>
                <div v-if="offer.has_garage || offer.has_terrace || offer.has_bathhouse || offer.has_pool" class="info-item !items-start">
                  <span class="label">Дополнительно</span>
                  <div class="flex flex-col gap-1">
                    <span v-if="offer.has_garage" class="value">Гараж</span>
                    <span v-if="offer.has_terrace" class="value">Терраса</span>
                    <span v-if="offer.has_bathhouse" class="value">Баня</span>
                    <span v-if="offer.has_pool" class="value">Бассейн</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="map-placeholder">
            <h3>Расположение</h3>

            <yandex-map
              v-model="map"
              real-settings-location
              :settings="{
                location: {
                  ...LOCATION,
                  duration: 2500,
                },
                camera,
                showScaleInCopyrights: true,
              }"
              width="100%"
              height="500px">
              <yandex-map-default-scheme-layer />
              <yandex-map-default-features-layer />
              <yandex-map-marker :settings="{ coordinates: offer.address.coordinates_list }">
                <div class="house-marker">
                  <svg class="marker-svg" data-name="Pin" width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M27 0C16.507 0 8 8.507 8 19C8 30.6644 19.5164 38.5163 27 46C34.4076 38.5197 46 30.622 46 19C46 8.507 37.493 0 27 0Z"></path>
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M27 33C34.7317 33 41 26.7317 41 19C41 11.2683 34.7317 5 27 5C19.2683 5 13 11.2683 13 19C13 26.7317 19.2683 33 27 33Z"
                      fill="white"></path>
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M33.4665 19.5633V12.2365H30.2323V15.6778L27.0001 11.7947L18 22.6071L20.9939 25.099L27.0001 17.8834L33.0061 25.099L36 22.6071L33.4665 19.5633Z"></path>
                    <circle cx="27" cy="50" r="3" fill="white"></circle>
                    <circle cx="27" cy="50" r="2"></circle>
                  </svg>
                </div>
              </yandex-map-marker>
              <yandex-map-marker v-for="(marker, index) in markers" :key="index" :settings="marker">
                <div class="marker">
                  <UIcon size="20" :name="getInfrastructureIcon(marker.properties?.type_id)" />
                </div>
              </yandex-map-marker>
              <yandex-map-hint hint-property="hint">
                <template #default="{ content }">
                  <div class="hint" v-html="content" />
                </template>
              </yandex-map-hint>
            </yandex-map>
          </div>

          <div class="infrastructure-section">
            <h3>Ближайшая инфраструктура</h3>
            <div class="infrastructure-list">
              <div
                v-for="infra in getClosestInfrastructure(offer)"
                @click="[
                  (LOCATION = {
                    center: infra.infrastructure.coordinates_list,
                    zoom: 20,
                  }),
                ]"
                :key="infra.infrastructure.id"
                class="infrastructure-item">
                <UIcon size="20" :name="getInfrastructureIcon(infra.infrastructure.infrastructure_type.id)" />
                <div v-if="infra.infrastructure.name !== 'unknown'" class="infra-info">
                  <span class="infra-type">{{ infra.infrastructure.infrastructure_type.name }}</span>

                  <span class="infra-type font-semibold !text-black">{{ infra.infrastructure.name }}</span>
                </div>
                <div v-else class="infra-info">
                  <span class="infra-type">{{ infra.infrastructure.infrastructure_type.name }}</span>
                </div>
                <span class="infra-distance">{{ infra.distance }} м</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-1">
          <!-- card -->
          <div class="sticky top-17">
            <div class="contact-card rounded-lg ring ring-default">
              <div class="price-section">
                <div class="price">
                  <p class="flex gap-4 items-center">
                    {{ formatPrice(offer.price) }} ₽
                    <UBadge size="lg" :color="getPriceCategoryColor(offer.price_category)">
                      {{ getPriceCategoryLabel(offer.price_category) }}
                    </UBadge>
                  </p>

                  <button class="favorite-heart" :class="{ active: isFavorite(offer.id) }" @click.stop="toggleFavorite(offer)">
                    <UIcon size="30" :name="isFavorite(offer.id) ? 'material-symbols-light:favorite' : 'material-symbols-light:favorite-outline'" class="heart-icon" />
                  </button>
                </div>

                <div class="price-per-meter">
                  <span>Цена за метр:</span><span class="font-semibold !text-[#38a169]">{{ formatPrice(offer.price_per_square_meter) }} ₽/м²</span>
                </div>
              </div>
              <div class="contacts">
                <h3 class="mt-2 mb-3">Контакты:</h3>

                <div v-if="offer.contact_phone" class="phone-number">{{ formatPhone(offer.contact_phone) }}</div>
                <div v-else>Временный номер, проверьте в источнике</div>

                <div class="seller-info">
                  <div class="seller-type">{{ offer.seller.seller_type?.name }}</div>
                  <div class="seller-name">{{ offer.seller.name }}</div>
                </div>
                <div class="original-link">
                  <UIcon size="18" name="i-heroicons-link"></UIcon>
                  <a target="_blank" :href="offer.url">Источник</a>
                </div>
              </div>
            </div>
            <div v-if="offer.price_history.length > 1" class="price-history-section">
              <h3>История цен</h3>

              <VChart v-if="priceChartOption" :option="priceChartOption" autoresize style="height: 328px" />
              <!-- <div v-else class="no-data">Нет данных по истории цен</div> -->

              <!-- <div v-else class="no-data">Нет данных по истории цен</div> -->
            </div>
            <div class="views-section">
              <h3>Статистика просмотров</h3>
              <div class="views-stats">
                <div class="stat-item">
                  <span class="stat-label">Всего:</span>
                  <span class="stat-value">{{ offer.views_count }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">10 дней:</span>
                  <span class="stat-value">{{ offer.last_ten_days_views_count }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Сегодня:</span>
                  <span class="stat-value">{{ offer.daily_views_count }}</span>
                </div>
              </div>
            </div>

            <VChart v-if="viewsChartOption" :option="viewsChartOption" autoresize style="height: 328px" />
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import type { YMap, YMapCameraRequest, YMapMarkerProps } from "@yandex/ymaps3-types";
import type { YMapLocationRequest } from "@yandex/ymaps3-types/imperative/YMap";
import { shallowRef } from "vue";
import { YandexMap, YandexMapDefaultFeaturesLayer, YandexMapDefaultSchemeLayer, YandexMapHint, YandexMapMarker } from "vue-yandex-maps";
import type { OfferResponseFull, AddressResponseFull, InfrastructureResponseFull, AddressInfrastructureLinkResponseFull } from "~/types/api";

const map = shallowRef<null | YMap>(null);
const markers = ref<YMapMarkerProps[]>([]);

interface PriceHistory {
  priceData: {
    price: number;
    currency: string;
  };
  changeTime: string;
}

const camera = ref<YMapCameraRequest>({
  duration: 2500,
});

const LOCATION = ref<YMapLocationRequest>({
  center: [37.623082, 55.75254],
  zoom: 15,
});

interface ViewsHistory {
  date: string;
  views: number;
}

type Offer = OfferResponseFull;
type InfrastructureLink = AddressInfrastructureLinkResponseFull;

const carousel = useTemplateRef("carousel");
const activeIndex = ref(0);
const thumbsContainer = ref<HTMLElement | null>(null);

function scrollThumbTo(index: number) {
  thumbsContainer.value?.children[index]?.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "nearest",
  });
}
const getClosestInfrastructure = (offer: Offer) => {
  const typeMap = new Map<number, InfrastructureLink>();

  offer.address.infrastructures_links.forEach((item) => {
    const typeId = item.infrastructure.infrastructure_type.id;
    if (!typeMap.has(typeId) || typeMap.get(typeId)!.distance > item.distance) {
      typeMap.set(typeId, item);
    }
  });

  return Array.from(typeMap.values()).sort((a, b) => a.distance - b.distance);
};
function onClickPrev() {
  activeIndex.value--;
  scrollThumbTo(activeIndex.value);
}

function onClickNext() {
  activeIndex.value++;
  scrollThumbTo(activeIndex.value);
}

function onSelect(index: number) {
  activeIndex.value = index;
  scrollThumbTo(index);
}

function select(index: number) {
  activeIndex.value = index;
  carousel.value?.emblaApi?.scrollTo(index);
  scrollThumbTo(index);
}

const mapState = useMapState();

const showOnMap = (offer: Offer) => {
  ((mapState.value.center = offer.address.coordinates_list), (mapState.value.offerId = offer.id));
  navigateTo("/map");
};

const route = useRoute();
const offerId = route.params.id as string;

const { $api } = useNuxtApp();

// const { data: offer, pending, error } = useAsyncData(`offer/${offerId}`,
//     async () => {
//         return await $api(`offers/${offerId}`)
//     },
//     {
//         // Кеширование на 5 минут
//         dedupe: 'defer',
//         getCachedData: (key) => {
//             return useNuxtData(key).data.value;
//         }
//     }
// )

const {
  data: offer,
  pending,
  error,
} = await useAsyncData(`offers/${offerId}`, () => $api(`offers/${offerId}`), {
  getCachedData: (key) => {
    return useNuxtData(key).data.value;
  },
});

const { data: favoritesData, refresh: refreshFavorites } = useAsyncData("favorites", () => $api("offers/favorites/"));

const favoriteOffers = computed(() => {
  return new Set(favoritesData.value?.map((item) => item.id) || []);
});

const toggleFavorite = async (offer: Offer) => {
  if (!offer.id) return;

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
    }
  } catch (error) {
    console.error("Ошибка при обновлении избранного:", error);
  }
};

const isFavorite = (offerId: number | null): boolean => {
  return offerId !== null && favoriteOffers.value.has(offerId);
};

watch(
  () => offer.value,
  (newOffer) => {
    if (newOffer) {
      LOCATION.value.center = newOffer.address.coordinates_list;
      console.log("Установили центр");
      markers.value = newOffer.address.infrastructures_links.map((infra, index) => ({
        onClick: () => {
          LOCATION.value = {
            center: infra.infrastructure.coordinates_list,
            zoom: 20,
          };
        },
        hideOutsideViewport: true,
        coordinates: infra.infrastructure.coordinates_list,
        properties: {
          hint: `<p>${infra.infrastructure.infrastructure_type?.name}</p><p>${infra.infrastructure.name != "unknown" ? infra.infrastructure.name : ""}</p><p>${
            infra.distance
          } м</p>`,
          name: infra.infrastructure.name,
          type_id: infra.infrastructure.infrastructure_type.id,
        },
      }));
    }
  },
  { immediate: true },
);

const priceChartOption = computed(() => {
  if (!offer.value?.price_history?.length) return null;

  const data = [...offer.value.price_history].sort((a, b) => +new Date(a.changeTime) - +new Date(b.changeTime)).map((item) => [item.changeTime, item.priceData.price]);

  return {
    tooltip: {
      trigger: "axis",
      valueFormatter: (v: number) => `${formatPrice(v)} ₽`,
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (v: number) => formatPrice(v),
      },
      name: "Цена, ₽",
    },
    grid: {
      left: 40,
      right: 20,
      top: 30,
      bottom: 30,
    },
    series: [
      {
        type: "line",
        data,
        smooth: true,
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: "#059669",
        },
        itemStyle: {
          color: "#059669",
        },
        areaStyle: {
          color: "rgba(5,150,105,0.1)",
        },
      },
    ],
  };
});

// График истории просмотров
const viewsChartOption = computed(() => {
  if (!offer.value?.views_history?.length) return null;

  const data = [...offer.value.views_history].sort((a, b) => +new Date(a.date) - +new Date(b.date)).map((item) => [item.date, item.views]);

  return {
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      min: 0,
      name: "Просмотры",
    },
    grid: {
      left: 40,
      right: 20,
      top: 30,
      bottom: 30,
    },
    series: [
      {
        type: "line",
        data,
        smooth: true,
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: "#3b82f6",
        },
        itemStyle: {
          color: "#3b82f6",
        },
      },
    ],
  };
});

const items = computed<AccordionItem[]>(() => {
  const lines =
    offer.value?.description
      ?.replace(/<[^>]*>/g, "\n") // заменяет любой HTML-тег на новую строку
      .split("\n") ?? [];

  const labelLines = lines.slice(0, 2); // строки 1–3
  const contentLines = lines.slice(2); // начиная с 4-й

  return [
    {
      label: labelLines.join("\n"),
      content: contentLines.join("\n"),
    },
  ];
});
const viewsChartSeries = computed(() => {
  if (!offer.value?.views_history?.length) return null;

  const sortedHistory = [...offer.value.views_history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return [
    {
      name: "Просмотры",
      data: sortedHistory.map((item) => ({
        x: new Date(item.date).getTime(),
        y: item.views,
      })),
    },
  ];
});

// Вспомогательные функции
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ru-RU").format(price);
};

const formatPhone = (phone: string) => {
  return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 ($2) $3-$4-$5");
};

const getPriceCategoryLabel = (category: string) => {
  const labels: { [key: string]: string } = {
    expensive: "Выше рынка",
    normal: "Рыночная цена",
    cheap: "Ниже рынка",
  };
  return labels[category] || category;
};

const getPriceCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    expensive: "error",
    normal: "info",
    cheap: "success",
  };
  return colors[category] || "gray";
};

const getCategoryLabel = (category: string) => {
  const labels: { [key: string]: string } = {
    low: "Низкая",
    medium: "Средняя",
    high: "Высокая",
  };
  return labels[category] || category;
};
const getInfrastructureIcon = (typeId: number): string => {
  const icons: { [key: number]: string } = {
    1: "ic:baseline-school",
    2: "material-symbols:child-hat",
    3: "ic:sharp-local-hospital",
    4: "maki:fitness-centre",
    5: "",
    6: "mdi:bus-stop",
    7: "material-symbols:metro",
    8: "ion:restaurant-sharp",
    9: "temaki:town-hall",
    10: "icon-park-solid:shopping",
    11: "icon-park-solid:shopping",
    12: "healthicons:pharmacy-24px",
    13: "",
    14: "",
  };
  return icons[typeId] || "📍";
};
const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    low: "error",
    medium: "warning",
    high: "success",
  };
  return colors[category] || "gray";
};
</script>

<style scoped>
@reference "tailwindcss";

:deep(.info-card) span.iconify {
  @apply cursor-pointer;
}

.info-card {
  @apply ring ring-[var(--ui-border)] rounded-lg h-max p-7;
}

.info-card h3,
.contact-card h3 {
  @apply text-2xl font-semibold my-4;
}

.stat-item,
.category-item {
  @apply flex gap-4 items-center bg-[#f8fafc] p-4 rounded-lg;
}

/* .stat-item,
.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
} */

.house-marker {
  width: 50px;
}

.marker-svg {
  position: relative;
  top: -40px;
  right: 20px;
  fill: black;
}

.price {
  display: flex;
  justify-content: space-between;
  font-size: 1.8rem;
  font-weight: bold;
  color: #2b6cb0;
  align-items: center;
}

.price-per-meter span {
  color: #718096;
}

.price-per-meter {
  margin-top: 3px;
  font-size: 1.025rem;
  color: #38a169;
  display: flex;
  justify-content: space-between;
}

.gallery-section {
  margin-bottom: 2rem;
}

.main-image {
  width: 100%;
  height: 400px;
  margin-bottom: 1rem;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
}

.main-image-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-thumbnails {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.thumbnail {
  width: 80px;
  height: 60px;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  opacity: 0.7;
  transition: all 0.2s;
  flex-shrink: 0;
}

.thumbnail.active {
  border-color: #3b82f6;
  opacity: 1;
}

.favorite-heart {
  color: red;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.favorite-heart.active {
  background: rgba(239, 68, 68, 0.1);
  color: red;
}

.heart-icon {
  font-size: 1.25rem;
  transition: all 0.3s ease;
}

.favorite-heart.active .heart-icon {
  color: #ef4444;
}

.favorite-heart:hover {
  color: #ef4444;
  background: #eff1f3;
}

.hint {
  position: absolute;
  padding: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  white-space: nowrap;
  transform: translate(8px, -50%);
  left: 10px;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.marker {
  background: #1874cf;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.main-info-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.contact-card {
  top: 66px;
  background: white;
  height: max-content;
  padding: 1.5rem;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-grid .info-item:last-of-type {
  border-bottom: none;
}

.label {
  color: #6b7280;
  font-weight: 500;
}

.value {
  color: #1f2937;
  font-weight: 600;
}

.seller-info {
  margin-top: 12px;
  margin-bottom: 12px;
}

.seller-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-top: 0.5rem;
}

.seller-type {
  color: #718096;
  font-size: 14px;
}

.phone-section {
  margin-bottom: 1.5rem;
}

.phone-number {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.call-button {
  width: 100%;
}

.scrlbrwdthnn {
  scrollbar-width: none;
}

.sas img {
  height: 100% !important;
  max-width: inherit !important;
}

.map-link {
  color: var(--color-success);
  cursor: pointer;
  font-size: 0.95rem;
  margin-left: 6px;
}

.map-link:hover {
  color: black;
  transition: all 0.2s ease-in-out;
}

.overflow-hidden img {
  height: 480px !important;
  object-fit: scale-down !important;
}

.original-link {
  display: flex;
  align-items: center;
  gap: 5px;
}

.original-link :deep(a) {
  padding-left: 0 !important;
  padding: 0;
}

.description-section {
  margin-top: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-bottom: 0px;
  padding: 1.5rem;
  padding-bottom: 0;
}

.infrastructure-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(390px, auto));
  gap: 8px;
}

.infrastructure-item {
  display: grid;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  gap: 8px;
  background: #f8f9fa;
  grid-template-columns: max-content 6fr max-content;
}

.infra-info {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.infra-icon {
  font-size: 16px;
  width: 24px;
  text-align: center;
}

.address-section,
.views-section,
.categories-section {
  margin-top: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-bottom: 0px;
  padding: 1.5rem;
  padding-bottom: 0;
}

.price-history-section {
  margin-top: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  padding: 1.5rem;
  padding-bottom: 0;
}

.description-section :deep(button) {
  padding: 0 !important;
}

.views-section h3,
.price-history-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.description-text {
  line-height: 1.6;
  color: #4b5563;
  white-space: pre-line;
}

.offer-content {
  margin-top: 2rem;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 0.5rem;
  border-radius: 0.5rem;
  color: #6b7280;
  justify-content: start;
}

.infrastructure-section h3,
.map-placeholder h3 {
  font-size: 1.5rem;
  color: black;
  padding-left: 1.5rem;
  font-weight: 600;
  margin: 1.5rem 0;
}

.infra-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.infra-type {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  text-align: center;
}

.chart-container {
  background: white;

  padding: 1rem;
  padding-top: 1.5rem;

  border: 2px solid #e5e7eb;
  border-top: 0;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 2px dashed #d1d5db;
}

.views-stats,
.categories-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.stat-label,
.category-label {
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  font-weight: 600;
  color: #1f2937;
}

/* Lightbox стили */
.lightbox-content {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: black;
}

.lightbox-header {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
}

.lightbox-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.lightbox-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.lightbox-thumbnails {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  justify-content: center;
}

.lightbox-thumbnail {
  width: 80px;
  height: 60px;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  opacity: 0.7;
  transition: all 0.2s;
  flex-shrink: 0;
}

.lightbox-thumbnail.active {
  border-color: #3b82f6;
  opacity: 1;
}

.lightbox-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
