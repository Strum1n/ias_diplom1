<template>
  <UContainer class="px-5! mt-5">
    <div class="flex gap-3.5 items-center sm:items-end">
      <p class="font-semibold text-3xl w-min sm:w-max">Избранные объявления</p>
      <UBadge color="success" class="mb-0.5 font-bold">
        {{ filteredOffers.length }}
      </UBadge>
    </div>

    <USeparator class="my-7" />

    <div class="filters-section">
      <div class="filter-group">
        <label>Тип недвижимости:</label>
        <USelect
          v-model="propertyType"
          :items="propertyTypesItems"
          class="w-48"
          value-key="value"
        >
        </USelect>
      </div>

      <div class="filter-group">
        <label>Сортировка:</label>
        <USelect
          v-model="sortValue"
          :items="sortFields"
          class="w-48"
          value-key="value"
          :icon="icon"
          :ui="{
            trailingIcon:
              'group-data-[state=open]:rotate-180 transition-transform duration-200',
          }"
        >
        </USelect>
      </div>
    </div>

    <div v-if="pending" class="loading">
      <UIcon class="size-10" name="codex:loader" />
    </div>

    <div v-else-if="error" class="error">
      <h3>Ошибка при загрузке</h3>
      <p>{{ error.message }}</p>
    </div>

    <div v-else-if="filteredOffers.length === 0" class="empty-state">
      <UIcon
        name="material-symbols-light:favorite"
        class="size-25 bg-red-500"
      />
      <h3>В избранном пока пусто</h3>
    </div>

    <div v-else class="offers-list">
      <div v-for="offer in sortedOffers" :key="offer.id" class="offer-card">
        <div class="offer-content">
          <div class="offer-header">
            <div class="offer-gallery aspect-4/3 overflow-hidden">
              <img class="gallery-image" :src="offer.images_urls[0]" />
              <UBadge
                v-if="offer.is_new_house == true"
                color="info"
                variant="solid"
                class="type-badge"
              >
                Новостройка
              </UBadge>
            </div>
            <div class="flex flex-col flex-2">
              <div class="flex flex-col w-full gap-1 pt-2.5">
                <div class="title-container">
                  <div class="flex gap-1 flex-wrap sm:gap-2.5">
                    <UBadge
                      v-if="offer.transport_access_score"
                      :color="getCategoryColor(offer.transport_access_category)"
                      >Транспорт
                      {{ offer.transport_access_score?.toFixed(2) }}</UBadge
                    >
                    <UBadge
                      v-if="offer.elderly_score"
                      :color="getCategoryColor(offer.elderly_category)"
                      >Пожилые {{ offer.elderly_score?.toFixed(2) }}
                    </UBadge>
                    <UBadge
                      v-if="offer.family_score"
                      :color="getCategoryColor(offer.family_category)"
                      >Семья {{ offer.family_score?.toFixed(2) }}
                    </UBadge>
                  </div>

                  <span class="price">
                    <UBadge
                      v-if="offer.price_category"
                      :color="getPriceCategoryColor(offer.price_category)"
                      >{{ getPriceCategoryLabel(offer.price_category) }}</UBadge
                    >{{ formatPrice(offer.price) }} ₽
                  </span>
                </div>
                <div class="title-container">
                  <h3 class="offer-title">{{ offer.title }}</h3>
                  <span class="price-per-meter">
                    {{ formatPrice(offer.price_per_square_meter) }} ₽/м²
                  </span>
                </div>
                <div class="address">
                  <UIcon
                    class="size-13 sm:size-5"
                    name="tabler:map-pin"
                  ></UIcon>
                  {{ offer.address.full_address }}
                </div>
              </div>

              <div class="characteristics">
                <div class="char-item">
                  <span class="char-label">Общая площадь:</span>
                  <span class="char-value">{{ offer.total_area }} м²</span>
                </div>
                <div v-if="offer.living_area" class="char-item">
                  <span class="char-label">Жилая площадь:</span>
                  <span class="char-value">{{ offer.living_area }} м²</span>
                </div>
                <div v-if="offer.kitchen_area" class="char-item">
                  <span class="char-label">Площадь кухни:</span>
                  <span class="char-value">{{ offer.kitchen_area }} м²</span>
                </div>
                <div v-if="offer.floor !== null" class="char-item">
                  <span class="char-label">Этаж:</span>
                  <span class="char-value"
                    >{{ offer.floor }}/{{ offer.house_floors_count }}</span
                  >
                </div>
                <div v-else="offer.floor !== null" class="char-item">
                  <span class="char-label">Этажей в доме:</span>
                  <span class="char-value">{{ offer.house_floors_count }}</span>
                </div>
                <div
                  v-if="
                    offer.rooms_count !== null &&
                    offer.rooms_count !== 0 &&
                    offer.rooms_count !== 10
                  "
                  class="char-item"
                >
                  <span class="char-label">Комнаты:</span>
                  <span class="char-value">{{ offer.rooms_count }}</span>
                </div>
                <div
                  v-if="
                    offer.bedrooms_count !== null &&
                    offer.bedrooms_count !== 0 &&
                    offer.bedrooms_count !== 10
                  "
                  class="char-item"
                >
                  <span class="char-label">Спальни:</span>
                  <span class="char-value">{{ offer.bedrooms_count }}</span>
                </div>
                <div v-if="offer.ceiling_height" class="char-item">
                  <span class="char-label">Высота потолков:</span>
                  <span class="char-value">{{ offer.ceiling_height }} м</span>
                </div>
                <div
                  v-if="offer.house_built_year && offer.is_new_house === null"
                  class="char-item"
                >
                  <span class="char-label">Год постройки:</span>
                  <span class="char-value">{{ offer.house_built_year }}</span>
                </div>
                <div
                  v-if="offer.house_built_year && offer.is_new_house === true"
                  class="char-item"
                >
                  <span class="char-label">Год сдачи:</span>
                  <span class="char-value">{{ offer.house_built_year }}</span>
                </div>
              </div>
              <div class="infrastructure">
                <h4>Ближайшая инфраструктура</h4>
                <div class="infrastructure-list">
                  <div
                    v-for="item in getClosestInfrastructure(offer)"
                    :key="item.infrastructure.id"
                    class="infrastructure-item"
                  >
                    <UIcon
                      size="20"
                      :name="
                        getInfrastructureIcon(
                          item.infrastructure.infrastructure_type.id,
                        )
                      "
                    />
                    <div class="infra-info">
                      <span class="infra-type">{{
                        item.infrastructure.infrastructure_type.name
                      }}</span>
                    </div>
                    <span class="infra-distance">{{ item.distance }} м</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="contact-info">
            <div class="flex gap-3">
              <p class="font-semibold text-sm">
                Опубликовано:

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
              </p>
              <div v-if="offer.contact_phone" class="flex items-center gap-1">
                <UIcon size="16" name="solar:phone-outline"></UIcon>
                <a :href="`tel:${offer.contact_phone}`" class="phone-number">
                  {{ offer.contact_phone }}
                </a>
              </div>
            </div>

            <div class="actions">
              <UButton
                color="info"
                trailing-icon="i-lucide-arrow-right"
                :to="`/offers/${offer.id}`"
              >
                К объекту
              </UButton>
              <UButton
                color="error"
                icon="material-symbols:delete-forever"
                @click="removeFromFavorites(offer.id)"
              >
                Удалить
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
    <USeparator class="my-10" />

    <div v-if="filteredOffers.length > 1" class="comparison-section-bottom">
      <div class="section-header">
        <h2>Помощь в выборе</h2>
        <p>
          Воспользуйтесь методами многокритериального принятия решений, для
          выбора объекта недвижимости
        </p>
      </div>

      <div class="comparison-controls">
        <button @click="toggleComparisonInterface" class="compare-btn">
          {{ showComparisonInterface ? "Скрыть" : "🎯 Выбрать метод" }}
        </button>
      </div>

      <div v-if="showComparisonInterface" class="comparison-interface">
        <div class="method-selection">
          <label>Метод анализа:</label>
          <select v-model="selectedMethod" class="method-select">
            <option value="electre">ELECTRE</option>
            <option value="topsis">TOPSIS</option>
          </select>
        </div>

        <!-- Выбор критериев -->
        <div class="criteria-selection">
          <h3>Выбор критериев для сравнения</h3>
          <p class="selection-info">
            Доступны только критерии, присутствующие у всех объектов
          </p>

          <div
            v-if="availableCriteria.length === 0"
            class="no-criteria-available"
          >
            <div class="no-criteria-icon">⚠️</div>
            <h4>Нет доступных критериев для сравнения</h4>
            <p>
              У выбранных объектов нет общих критериев. Попробуйте изменить
              фильтры или добавить больше объектов в избранное.
            </p>
          </div>

          <div v-else class="criteria-grid">
            <div
              v-for="criterion in availableCriteria"
              :key="criterion.key"
              class="criterion-item"
              :class="{selected: isCriterionSelected(criterion.key)}"
              @click="toggleCriterion(criterion.key)"
            >
              <div class="criterion-checkbox">
                <input
                  type="checkbox"
                  :checked="isCriterionSelected(criterion.key)"
                  @change="toggleCriterion(criterion.key)"
                />
                <span class="checkmark"></span>
              </div>
              <div class="criterion-info">
                <div class="criterion-name">{{ criterion.displayName }}</div>
                <div class="criterion-range">
                  {{ formatCriterionRange(criterion) }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="selectedCriteria.length === 0 && availableCriteria.length > 0"
            class="no-criteria-warning"
          >
            ⚠️ Выберите хотя бы один критерий для анализа
          </div>
        </div>

        <div v-if="selectedCriteria.length > 0" class="criteria-weights">
          <h3 class="mb-3">Настройка весов критериев</h3>

          <div class="weights-grid">
            <div
              v-for="criterion in selectedCriteriaWithWeights"
              :key="criterion.key"
              class="weight-item"
            >
              <div class="weight-info">
                <span class="weight-name">{{ criterion.displayName }}</span>
                <span class="weight-direction">
                  {{
                    criterion.direction === "max" ? "↑ максимум" : "↓ минимум"
                  }}
                </span>
              </div>
              <div class="weight-controls">
                <select
                  :value="criterion.direction"
                  @change="
                    updateCriterionDirection(criterion.key, $event.target.value)
                  "
                  class="direction-select"
                >
                  <option value="max">Максимизация</option>
                  <option value="min">Минимизация</option>
                </select>
                <input
                  type="number"
                  :value="criterion.weight"
                  min="1"
                  max="10"
                  step="1"
                  class="weight-input"
                  @input="
                    updateCriterionWeight(criterion.key, $event.target.value)
                  "
                />
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="selectedCriteria.length > 0 && selectedMethod === 'electre'"
          class="algorithm-params"
        >
          <h4>Параметры алгоритма ELECTRE:</h4>
          <div class="params-grid">
            <div class="param-group">
              <label>Alpha (порог согласия):</label>
              <input
                type="number"
                v-model.number="electreParams.alpha"
                min="0.1"
                max="0.9"
                step="0.05"
              />
            </div>
            <div class="param-group">
              <label>Beta (порог несогласия):</label>
              <input
                type="number"
                v-model.number="electreParams.beta"
                min="0.1"
                max="0.9"
                step="0.05"
              />
            </div>
            <!-- <div class="param-group">
              <label>Шаг изменения:</label>
              <input type="number" v-model.number="electreParams.step" min="0.01" max="0.1" step="0.01" />
            </div> -->
          </div>
        </div>

        <div class="analysis-actions">
          <button
            @click="runAnalysis"
            :disabled="analysisLoading || selectedCriteria.length === 0"
            class="analyze-button"
          >
            <span v-if="analysisLoading">Анализ...</span>
            <span v-else>Запустить анализ</span>
          </button>
          <button @click="resetWeights" class="reset-button">
            Сбросить настройки
          </button>
        </div>

        <!-- Результаты анализа ELECTRE -->
        <div v-if="electreResults" class="results-section electre-results">
          <div class="method-header">
            <h3>Результаты метода ELECTRE</h3>
            <button @click="electreResults = null" class="close-method-button">
              ×
            </button>
          </div>
          <p class="results-description">
            Метод ELECTRE выявляет недоминируемые объекты (ядро) и показывает
            сравнение объектов.
          </p>

          <!-- Ядро недоминируемых объектов -->
          <div
            class="kernel-section"
            v-if="electreResults.kernel && electreResults.kernel.length > 0"
          >
            <h4>🎯 Ядро (недоминируемые объекты)</h4>
            <div class="kernel-list">
              <div
                v-for="kernelIndex in electreResults.kernel"
                :key="kernelIndex"
                class="kernel-item"
              >
                <div class="kernel-offer">
                  <div class="kernel-title">
                    {{ getOfferTitleByIndex(kernelIndex) }}
                  </div>
                  <div class="kernel-address">
                    {{ getOfferAddressByIndex(kernelIndex) }}
                  </div>
                </div>
                <UButton
                  color="info"
                  trailing-icon="i-lucide-arrow-right"
                  :to="`/offers/${getOfferIdByIndex(kernelIndex)}`"
                >
                  К объекту
                </UButton>
              </div>
            </div>
          </div>

          <!-- Детальное сравнение объектов -->
          <div class="comparison-section">
            <h4>📊 Сравнительный анализ</h4>
            <div class="comparison-list">
              <div
                v-for="kernelIndex in electreResults.kernel"
                :key="kernelIndex"
                class="comparison-card"
              >
                <div class="comparison-header">
                  <div class="comparison-info">
                    <div class="comparison-title">
                      {{ getOfferTitleByIndex(kernelIndex) }}
                    </div>
                    <div class="comparison-address">
                      {{ getOfferAddressByIndex(kernelIndex) }}
                    </div>
                  </div>
                  <UButton
                    color="info"
                    trailing-icon="i-lucide-arrow-right"
                    :to="`/offers/${getOfferIdByIndex(kernelIndex)}`"
                  >
                    К объекту
                  </UButton>
                </div>

                <div class="dominance-comparisons">
                  <div
                    v-for="(comparison, idx) in getDominanceComparisons(
                      electreResults.allIds[kernelIndex],
                    )"
                    :key="comparison.otherOfferId"
                    class="dominance-item mb-4 border rounded-xl overflow-hidden bg-white"
                  >
                    <!-- Заголовок сравнения (кликабельный) -->
                    <div
                      class="comparison-header p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                      @click="toggleComparisonDetail(kernelIndex, idx)"
                    >
                      <div class="flex items-center gap-3">
                        <UIcon
                          name="i-heroicons-arrows-right-left"
                          class="w-5 h-5 text-gray-400"
                        />
                        <div class="flex flex-col">
                          <span class="font-medium">
                            {{ getOfferTitle(comparison.otherOfferId) }}
                          </span>
                          <span class="text-sm text-muted">
                            {{ getOfferAddress(comparison.otherOfferId) }}
                          </span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-base" size="sm">
                          {{ comparison.superior.length }} ✅
                        </span>
                        <span class="text-base" size="sm">
                          {{ comparison.inferior.length }} ❌
                        </span>
                        <span class="text-base" size="sm">
                          {{ comparison.equal.length }} ⚖️
                        </span>
                        <UIcon
                          :name="
                            expandedComparisons[`${kernelIndex}-${idx}`]
                              ? 'i-heroicons-chevron-up'
                              : 'i-heroicons-chevron-down'
                          "
                          class="w-5 h-5 text-gray-500"
                        />
                      </div>
                    </div>

                    <!-- Детализация (раскрывается) -->
                    <div
                      v-if="expandedComparisons[`${kernelIndex}-${idx}`]"
                      class="comparison-details p-4 border-t bg-gray-50"
                    >
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Критерии, по которым превосходит -->
                        <div
                          v-if="comparison.superior.length"
                          class="space-y-3"
                        >
                          <h5
                            class="text-sm font-semibold text-green-600 flex items-center gap-1"
                          >
                            <UIcon
                              name="i-heroicons-check-circle"
                              class="w-4 h-4"
                            />
                            Превосходство
                          </h5>
                          <div
                            v-for="cIdx in comparison.superior"
                            :key="cIdx"
                            class="criterion-detail bg-white p-3 rounded-lg border border-green-100"
                          >
                            <div class="flex justify-between items-center">
                              <div class="flex items-center gap-2">
                                <span class="text-sm font-medium">{{
                                  getCriterionShortName(selectedCriteria[cIdx])
                                }}</span>
                                <UBadge
                                  size="sm"
                                  :color="
                                    criteriaDirections[
                                      selectedCriteria[cIdx]
                                    ] === 'max'
                                      ? 'green'
                                      : 'red'
                                  "
                                  variant="soft"
                                >
                                  {{
                                    criteriaDirections[
                                      selectedCriteria[cIdx]
                                    ] === "max"
                                      ? "↑ макс"
                                      : "↓ мин"
                                  }}
                                </UBadge>
                              </div>
                              <span class="text-xs text-green-600 font-medium">
                                +{{
                                  calculateAdvantage(
                                    electreResults.allIds[kernelIndex],
                                    comparison.otherOfferId,
                                    selectedCriteria[cIdx],
                                  )
                                }}%
                              </span>
                            </div>

                            <!-- Значения критериев -->
                            <div
                              class="flex justify-between items-center mt-2 text-sm"
                            >
                              <span class="text-gray-600">{{
                                formatCriterionValue(
                                  selectedCriteria[cIdx],
                                  getCriterionValueForOffer(
                                    electreResults.allIds[kernelIndex],
                                    selectedCriteria[cIdx],
                                  ),
                                )
                              }}</span>
                              <span class="text-gray-400 mx-1">→</span>
                              <span class="text-gray-600">{{
                                formatCriterionValue(
                                  selectedCriteria[cIdx],
                                  getCriterionValueForOffer(
                                    comparison.otherOfferId,
                                    selectedCriteria[cIdx],
                                  ),
                                )
                              }}</span>
                            </div>

                            <!-- Индикатор направления -->
                          </div>
                        </div>

                        <!-- Критерии, по которым уступает -->
                        <div
                          v-if="comparison.inferior.length"
                          class="space-y-3"
                        >
                          <h5
                            class="text-sm font-semibold text-red-600 flex items-center gap-1"
                          >
                            <UIcon
                              name="i-heroicons-x-circle"
                              class="w-4 h-4"
                            />
                            Уступает
                          </h5>
                          <div
                            v-for="cIdx in comparison.inferior"
                            :key="cIdx"
                            class="criterion-detail bg-white p-3 rounded-lg border border-red-100"
                          >
                            <div class="flex justify-between items-center">
                              <div class="flex items-center gap-2">
                                <span class="text-sm font-medium">{{
                                  getCriterionShortName(selectedCriteria[cIdx])
                                }}</span>
                                <UBadge
                                  size="sm"
                                  :color="
                                    criteriaDirections[
                                      selectedCriteria[cIdx]
                                    ] === 'max'
                                      ? 'green'
                                      : 'red'
                                  "
                                  variant="soft"
                                >
                                  {{
                                    criteriaDirections[
                                      selectedCriteria[cIdx]
                                    ] === "max"
                                      ? "↑ макс"
                                      : "↓ мин"
                                  }}
                                </UBadge>
                              </div>
                              <span class="text-sm text-red-600 font-medium">
                                -{{
                                  calculateDisadvantage(
                                    electreResults.allIds[kernelIndex],
                                    comparison.otherOfferId,
                                    selectedCriteria[cIdx],
                                  )
                                }}%
                              </span>
                            </div>

                            <!-- Значения критериев -->
                            <div
                              class="flex justify-between items-center mt-2 text-sm"
                            >
                              <span class="text-gray-600">{{
                                formatCriterionValue(
                                  selectedCriteria[cIdx],
                                  getCriterionValueForOffer(
                                    electreResults.allIds[kernelIndex],
                                    selectedCriteria[cIdx],
                                  ),
                                )
                              }}</span>
                              <span class="text-gray-400 mx-1">→</span>
                              <span class="text-gray-600">{{
                                formatCriterionValue(
                                  selectedCriteria[cIdx],
                                  getCriterionValueForOffer(
                                    comparison.otherOfferId,
                                    selectedCriteria[cIdx],
                                  ),
                                )
                              }}</span>
                            </div>

                            <!-- Индикатор направления -->
                          </div>
                        </div>

                        <!-- Равные критерии -->
                        <div
                          v-if="comparison.equal.length"
                          class="md:col-span-2 mt-2"
                        >
                          <h5
                            class="text-sm font-semibold text-gray-500 flex items-center gap-1"
                          >
                            <UIcon name="i-heroicons-minus" class="w-4 h-4" />
                            Равны по критериям
                          </h5>
                          <div
                            class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2"
                          >
                            <div
                              v-for="cIdx in comparison.equal"
                              :key="cIdx"
                              class="bg-white p-2 rounded-lg border border-gray-200"
                            >
                              <div
                                class="flex items-center justify-between gap-1 mb-1"
                              >
                                <span class="text-xs font-medium">{{
                                  getCriterionShortName(selectedCriteria[cIdx])
                                }}</span>
                                <UBadge
                                  size="sm"
                                  :color="
                                    criteriaDirections[
                                      selectedCriteria[cIdx]
                                    ] === 'max'
                                      ? 'green'
                                      : 'red'
                                  "
                                  variant="soft"
                                >
                                  {{
                                    criteriaDirections[
                                      selectedCriteria[cIdx]
                                    ] === "max"
                                      ? "↑ макс"
                                      : "↓ мин"
                                  }}
                                </UBadge>
                              </div>
                              <div
                                class="text-sm font-semibold text-gray-700 text-center"
                              >
                                {{
                                  formatCriterionValue(
                                    selectedCriteria[cIdx],
                                    getCriterionValueForOffer(
                                      electreResults.allIds[kernelIndex],
                                      selectedCriteria[cIdx],
                                    ),
                                  )
                                }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Результаты анализа TOPSIS -->
        <div v-if="topsisResults" class="topsis-results">
          <div class="method-header">
            <h3>Результаты метода TOPSIS</h3>
            <button @click="topsisResults = null" class="close-method-button">
              ×
            </button>
          </div>
          <div class="ranking-section">
            <h4 class="mb-2">Рейтинг объектов</h4>
            <div class="ranking-list">
              <div
                v-for="(rank, index) in topsisRanking"
                :key="rank.offerId"
                class="rank-item"
                :class="getRankItemClass(index)"
              >
                <div class="rank-header">
                  <div class="rank-number" :class="getRankNumberClass(index)">
                    {{ index + 1 }}
                  </div>
                  <div class="rank-info">
                    <div class="offer-title">
                      {{ getOfferTitle(rank.offerId) }}
                    </div>
                    <div class="offer-address">
                      {{ getOfferAddress(rank.offerId) }}
                    </div>
                  </div>
                  <UButton
                    color="info"
                    trailing-icon="i-lucide-arrow-right"
                    :to="`/offers/${rank.offerId}`"
                  >
                    К объекту
                  </UButton>
                </div>

                <div class="score-section">
                  <div class="score-info">
                    <div>
                      <span class="score-label">Коэффициент близости: </span>
                      <span class="score-value">{{
                        rank.score.toFixed(4)
                      }}</span>
                    </div>
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        :style="{width: rank.score * 100 + '%'}"
                        :class="getProgressFillClass(index)"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <VChart
          v-if="radarSeries.length && (electreResults || topsisResults)"
          :option="radarOption"
          autoresize
          class="radar-chart"
        />
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type {SelectItem} from "@nuxt/ui";
import type {OfferResponseFull} from "~/types/api";

// Используем типы из API
type Offer = OfferResponseFull;

const propertyTypesItems = ref<SelectItem[]>([
  {label: "Все типы", value: "Все типы"},
  {label: "Квартира", value: "Квартира"},
  {label: "Апартаменты", value: "Апартаменты"},
  {label: "Дом", value: "Дом"},
  {label: "Коттедж", value: "Коттедж"},
  {label: "Таунхаус", value: "Таунхаус"},
]);

const sortFields = ref<SelectItem[]>([
  {
    label: "Цена",
    value: "price:asc",
    icon: "material-symbols:arrow-upward-alt",
  },
  {
    label: "Цена",
    value: "price:desc",
    icon: "material-symbols:arrow-downward-alt",
  },
  {
    label: "Цена за м²",
    value: "price_per_square_meter:asc",
    icon: "material-symbols:arrow-upward-alt",
  },
  {
    label: "Цена за м²",
    value: "price_per_square_meter:desc",
    icon: "material-symbols:arrow-downward-alt",
  },
  {
    label: "Площадь",
    value: "total_area:asc",
    icon: "material-symbols:arrow-upward-alt",
  },
  {
    label: "Площадь",
    value: "total_area:desc",
    icon: "material-symbols:arrow-downward-alt",
  },
  {
    label: "Дата публикации",
    value: "creation_date_source:asc",
    icon: "material-symbols:arrow-upward-alt",
  },
  {
    label: "Дата публикации",
    value: "creation_date_source:desc",
    icon: "material-symbols:arrow-downward-alt",
  },
  {
    label: "Просмотры",
    value: "views_count:asc",
    icon: "material-symbols:arrow-upward-alt",
  },
  {
    label: "Просмотры",
    value: "views_count:desc",
    icon: "material-symbols:arrow-downward-alt",
  },
]);
const sortValue = ref(sortFields.value[7]?.value);
const icon = computed(
  () => sortFields.value.find(item => item.value === sortValue.value)?.icon,
);
const expandedComparisons = ref<Record<string, boolean>>({});

const toggleComparisonDetail = (
  kernelIndex: number,
  comparisonIndex: number,
) => {
  const key = `${kernelIndex}-${comparisonIndex}`;
  expandedComparisons.value[key] = !expandedComparisons.value[key];
};
const calculateAdvantage = (
  offerIdA: number,
  offerIdB: number,
  criterionKey: string,
): number => {
  const valueA = getCriterionValueForOffer(offerIdA, criterionKey);
  const valueB = getCriterionValueForOffer(offerIdB, criterionKey);
  if (!valueA || !valueB) return 0;

  const direction = criteriaDirections.value[criterionKey] || "max";

  if (direction === "max") {
    return Math.round(((valueA - valueB) / valueB) * 100);
  } else {
    // Для минимизации (меньше = лучше)
    return Math.round(((valueB - valueA) / valueA) * 100);
  }
};

// Расчёт отставания в процентах
const calculateDisadvantage = (
  offerIdA: number,
  offerIdB: number,
  criterionKey: string,
): number => {
  const valueA = getCriterionValueForOffer(offerIdA, criterionKey);
  const valueB = getCriterionValueForOffer(offerIdB, criterionKey);
  if (!valueA || !valueB) return 0;

  const direction = criteriaDirections.value[criterionKey] || "max";

  if (direction === "max") {
    return Math.round(((valueB - valueA) / valueA) * 100);
  } else {
    // Для минимизации
    return Math.round(((valueA - valueB) / valueB) * 100);
  }
};
const getCriterionPercentage = (
  offerIdA: number,
  offerIdB: number,
  criterionKey: string,
): number => {
  const valueA = getCriterionValueForOffer(offerIdA, criterionKey);
  const valueB = getCriterionValueForOffer(offerIdB, criterionKey);
  if (valueA === null || valueB === null || valueA === 0) return 0;

  const direction = criteriaDirections.value[criterionKey] || "max";
  // Для максимизации: показываем, насколько A лучше B (отношение)
  if (direction === "max") {
    return Math.min(100, (valueA / valueB) * 100);
  } else {
    // Для минимизации: показываем обратное отношение (меньше = лучше)
    return Math.min(100, (valueB / valueA) * 100);
  }
};

interface ElectreParams {
  alpha: number;
  beta: number;
}
const getCriterionValueForOffer = (offerId: number, criterionKey: string) => {
  if (!favoriteOffers.value) return null;

  const offer = favoriteOffers.value.find(o => o.id === offerId);
  if (!offer) return null;

  const criterion = availableCriteria.value.find(c => c.key === criterionKey);
  if (!criterion) return null;

  return criterion.getValue(offer);
};
interface ElectreResults {
  kernel: number[];
  dominance_info: {
    [key: string]: {
      [key: string]: {
        superior: number[];
        equal: number[];
        inferior: number[];
      };
    };
  };
  outranking: boolean[][];
  allIds: number[];
}
const formatCriterionValue = (key: string, value: number | null) => {
  if (value === null || value === undefined) return "-";

  if (key === "price" || key === "price_per_square_meter") {
    return `${formatPrice(value)} ₽`;
  }

  if (key === "total_area" || key === "living_area" || key === "kitchen_area") {
    return `${value} м²`;
  }

  if (key === "ceiling_height") {
    return `${value} м`;
  }
  if (
    key.includes("score") ||
    key === "transport_access_score" ||
    key === "elderly_score" ||
    key === "family_score"
  ) {
    return value.toFixed(2);
  }

  if (key.includes("infrastructure")) {
    return `${value} м`;
  }
  return value.toString();
};
interface TopsisResults {
  scores: number[];
  ranked_indices: number[];
}

interface AnalysisCriterion {
  key: string;
  displayName: string;
  weight: number;
  direction: "min" | "max";
  getValue: (offer: Offer) => number | null;
  minValue?: number;
  maxValue?: number;
  isAvailableForAll?: boolean;
}

const {$api} = useNuxtApp();

const {
  data: favoriteOffers,
  pending,
  error,
} = await useAsyncData(() => $api("offers/favorites/"));

const showComparisonInterface = ref(false);
const selectedMethod = ref("electre");
const analysisLoading = ref(false);
const availableCriteria = ref<AnalysisCriterion[]>([]);
const selectedCriteria = ref<string[]>([]);
const criteriaWeights = ref<{[key: string]: number}>({});
const criteriaDirections = ref<{[key: string]: "min" | "max"}>({});

const propertyType = ref(propertyTypesItems.value[0].value);

const electreParams = ref<ElectreParams>({
  alpha: 0.4,
  beta: 0.8,
});

const electreResults = ref<ElectreResults | null>(null);

const topsisResults = ref<TopsisResults | null>(null);
const topsisRanking = ref<
  Array<{offerId: number; score: number; rank: number}>
>([]);

const filteredOffers = computed(() => {
  if (!favoriteOffers.value) return [];
  if (!propertyType.value || propertyType.value == "Все типы") {
    return favoriteOffers.value;
  }
  return favoriteOffers.value.filter(
    offer => offer.property_type.name === propertyType.value,
  );
});

const sortedOffers = computed(() => {
  if (!filteredOffers.value) return [];
  const filtered = [...filteredOffers.value];

  switch (sortValue.value) {
    case "price:asc":
      return filtered.sort((a, b) => a.price - b.price);
    case "price:desc":
      return filtered.sort((a, b) => b.price - a.price);
    case "price_per_square_meter:asc":
      return filtered.sort((a, b) => {
        const pricePerMeterA =
          a.price_per_square_meter || a.price / (a.total_area || 1);
        const pricePerMeterB =
          b.price_per_square_meter || b.price / (b.total_area || 1);
        return pricePerMeterA - pricePerMeterB;
      });
    case "price_per_square_meter:desc":
      return filtered.sort((a, b) => {
        const pricePerMeterA =
          a.price_per_square_meter || a.price / (a.total_area || 1);
        const pricePerMeterB =
          b.price_per_square_meter || b.price / (b.total_area || 1);
        return pricePerMeterB - pricePerMeterA;
      });
    case "total_area:asc":
      return filtered.sort((a, b) => (a.total_area || 0) - (b.total_area || 0));
    case "total_area:desc":
      return filtered.sort((a, b) => (b.total_area || 0) - (a.total_area || 0));
    case "creation_date_source:asc":
      return filtered.sort((a, b) => {
        const dateA = a.creation_date_source || a.update_date || a.created_at;
        const dateB = b.creation_date_source || b.update_date || b.created_at;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
    case "creation_date_source:desc":
      return filtered.sort((a, b) => {
        const dateA = a.creation_date_source || a.update_date || a.created_at;
        const dateB = b.creation_date_source || b.update_date || b.created_at;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    case "views_count:asc":
      return filtered.sort(
        (a, b) => (a.views_count || 0) - (b.views_count || 0),
      );
    case "views_count:desc":
      return filtered.sort(
        (a, b) => (b.views_count || 0) - (a.views_count || 0),
      );
    default:
      return filtered;
  }
});

const selectedCriteriaWithWeights = computed(() => {
  return selectedCriteria.value.map(key => {
    const criterion = availableCriteria.value.find(c => c.key === key);
    return {
      key: key,
      displayName: criterion?.displayName || key,
      weight: criteriaWeights.value[key] || 0,
      direction: criteriaDirections.value[key] || "max",
    };
  });
});

// Методы
const removeFromFavorites = async (offerId: number) => {
  if (!favoriteOffers.value) return;

  const backup = [...favoriteOffers.value];

  // 1. Удаляем мгновенно из UI
  favoriteOffers.value = favoriteOffers.value.filter(
    offer => offer.id !== offerId,
  );

  try {
    await $api(`offers/favorites/${offerId}`, {method: "DELETE"});
  } catch (err) {
    // 2. Если сервер упал — возвращаем назад
    favoriteOffers.value = backup;
    console.error("Ошибка при удалении:", err);
  }
};

const getPriceCategoryColor = (category: string) => {
  switch (category) {
    case "expensive":
      return "error";
    case "normal":
      return "info";
    case "cheap":
      return "success";
    default:
      return "neutral";
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "high":
      return "success";
    case "medium":
      return "warning";
    case "low":
      return "error";
    default:
      return "neutral";
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

const getClosestInfrastructure = (offer: Offer) => {
  const typeMap = new Map<number, any>();

  offer.address.infrastructures_links.forEach(item => {
    const typeId = item.infrastructure.infrastructure_type.id;
    if (!typeMap.has(typeId) || typeMap.get(typeId)!.distance > item.distance) {
      typeMap.set(typeId, item);
    }
  });

  return Array.from(typeMap.values()).sort((a, b) => a.distance - b.distance);
};

const getInfrastructureIcon = (typeId: number): string => {
  const icons: {[key: number]: string} = {
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

const toggleComparisonInterface = () => {
  showComparisonInterface.value = !showComparisonInterface.value;
  if (showComparisonInterface.value) {
    electreResults.value = null;
    topsisResults.value = null;
    topsisRanking.value = [];

    initializeAvailableCriteria();

    const defaultCriteria = ["price", "total_area"];
    selectedCriteria.value = defaultCriteria.filter(key =>
      availableCriteria.value.some(c => c.key === key && c.isAvailableForAll),
    );

    selectedCriteria.value.forEach(key => {
      criteriaWeights.value[key] = 1;

      if (!criteriaDirections.value[key]) {
        const criterion = availableCriteria.value.find(c => c.key === key);
        criteriaDirections.value[key] = criterion?.direction || "max";
      }
    });
  }
};

const initializeAvailableCriteria = () => {
  const currentOffers = filteredOffers.value;
  if (!currentOffers || currentOffers.length === 0) {
    availableCriteria.value = [];
    return;
  }

  const basicCriteria: AnalysisCriterion[] = [
    {
      key: "price",
      displayName: "Цена",
      weight: 1,
      direction: "min",
      getValue: (offer: Offer) => offer.price,
    },
    {
      key: "price_per_square_meter",
      displayName: "Цена за м²",
      weight: 1,
      direction: "min",
      getValue: (offer: Offer) => offer.price_per_square_meter,
    },
    {
      key: "total_area",
      displayName: "Общая площадь",
      weight: 1,
      direction: "max",
      getValue: (offer: Offer) => offer.total_area,
    },
    {
      key: "living_area",
      displayName: "Жилая площадь",
      weight: 1,
      direction: "max",
      getValue: (offer: Offer) => offer.living_area,
    },
    {
      key: "kitchen_area",
      displayName: "Площадь кухни",
      weight: 1,
      direction: "max",
      getValue: (offer: Offer) => offer.kitchen_area,
    },
    {
      key: "rooms_count",
      displayName: "Количество комнат",
      weight: 1,
      direction: "max",
      getValue: (offer: Offer) => offer.rooms_count,
    },
    {
      key: "bedrooms_count",
      displayName: "Количество спален",
      weight: 1,
      direction: "max",
      getValue: (offer: Offer) => offer.bedrooms_count,
    },
    {
      key: "floor",
      displayName: "Этаж",
      weight: 1,
      direction: "max",
      getValue: (offer: Offer) => offer.floor,
    },
    {
      key: "house_built_year",
      displayName: "Год постройки",
      weight: 1,
      direction: "max",
      getValue: (offer: Offer) => offer.house_built_year,
    },

    {
      key: "ceiling_height",
      displayName: "Высота потолков",
      weight: 1,
      direction: "max",
      getValue: (offer: Offer) => offer.ceiling_height,
    },
    {
      key: "transport_access_score",
      displayName: "Транспортная доступность",
      weight: 1,
      direction: "max",
      getValue: (offer: Offer) => offer.transport_access_score,
    },
    {
      key: "elderly_score",
      displayName: "Комфорт для пожилых",
      weight: 1,
      direction: "max",
      getValue: (offer: Offer) => offer.elderly_score,
    },
    {
      key: "family_score",
      displayName: "Комфорт для семьи",
      weight: 1,
      direction: "max",
      getValue: (offer: Offer) => offer.family_score,
    },
  ];

  const infrastructureCriteria: AnalysisCriterion[] = [];

  const infrastructureTypes = new Map<number, string>();
  currentOffers.forEach(offer => {
    offer.address.infrastructures_links.forEach(link => {
      const typeId = link.infrastructure.infrastructure_type.id;
      const typeName = link.infrastructure.infrastructure_type.name;
      if (!infrastructureTypes.has(typeId)) {
        infrastructureTypes.set(typeId, typeName);
      }
    });
  });

  infrastructureTypes.forEach((typeName, typeId) => {
    infrastructureCriteria.push({
      key: `infrastructure_${typeId}`,
      displayName: `Расстояние до ${typeName}`,
      weight: 1,
      direction: "min",
      getValue: (offer: Offer) => {
        const closest = getClosestInfrastructureByType(offer, typeId);
        return closest ? closest.distance : null;
      },
    });
  });

  const allCriteria = [...basicCriteria, ...infrastructureCriteria];

  availableCriteria.value = allCriteria.filter(criterion => {
    const hasValueForAllOffers = currentOffers.every(offer => {
      const value = criterion.getValue(offer);
      return value !== null && value !== undefined && value !== 0;
    });

    if (hasValueForAllOffers) {
      const values = currentOffers
        .map(offer => {
          const value = criterion.getValue(offer);
          return value !== null && value !== undefined ? value : 0;
        })
        .filter(val => val !== null && val !== undefined);

      if (values.length > 0) {
        criterion.minValue = Math.min(...values);
        criterion.maxValue = Math.max(...values);
      }
    }

    criterion.isAvailableForAll = hasValueForAllOffers;
    return hasValueForAllOffers;
  });
};

const getClosestInfrastructureByType = (offer: Offer, typeId: number) => {
  const infrastructuresOfType = offer.address.infrastructures_links.filter(
    link => link.infrastructure.infrastructure_type.id === typeId,
  );

  if (infrastructuresOfType.length === 0) {
    return null;
  }

  return infrastructuresOfType.reduce((closest, current) =>
    current.distance < closest.distance ? current : closest,
  );
};

const isCriterionSelected = (key: string) => {
  return selectedCriteria.value.includes(key);
};

const toggleCriterion = (key: string) => {
  const index = selectedCriteria.value.indexOf(key);

  if (index > -1) {
    selectedCriteria.value.splice(index, 1);
  } else {
    selectedCriteria.value.push(key);

    if (criteriaWeights.value[key] === undefined) {
      criteriaWeights.value[key] = 1;
    }

    if (!criteriaDirections.value[key]) {
      const criterion = availableCriteria.value.find(c => c.key === key);
      criteriaDirections.value[key] = criterion?.direction || "max";
    }
  }
};

const formatCriterionRange = (criterion: AnalysisCriterion | undefined) => {
  if (!criterion) return "Нет данных";

  if (criterion.minValue === undefined || criterion.maxValue === undefined) {
    return "Нет данных";
  }

  // Используем formatCriterionValue для единообразного форматирования
  return `${formatCriterionValue(criterion.key, criterion.minValue)} - ${formatCriterionValue(criterion.key, criterion.maxValue)}`;
};

const radarIndicators = computed(() => {
  return selectedCriteria.value
    .map(key => {
      const c = availableCriteria.value.find(i => i.key === key);
      if (!c || c.minValue === undefined || c.maxValue === undefined)
        return null;

      return {
        name: c.displayName,
        min: c.minValue,
        max: c.maxValue,
      };
    })
    .filter(Boolean);
});

const radarSeries = computed(() => {
  if (!filteredOffers.value.length || !selectedCriteria.value.length) return [];

  return filteredOffers.value.map(offer => ({
    name: offer.title || `Объект ${offer.id}`,
    value: selectedCriteria.value.map(key => {
      const c = availableCriteria.value.find(i => i.key === key);
      return c?.getValue(offer) ?? 0;
    }),
  }));
});

const radarOption = computed(() => {
  if (!radarIndicators.value.length || !radarSeries.value.length) return {};

  return {
    tooltip: {
      trigger: "item",
      textStyle: {
        fontSize: isMobile.value ? 10 : 12,
      },
      padding: isMobile.value ? 6 : 10,
      borderWidth: 0,
      extraCssText: isMobile.value
        ? "max-width:160px; white-space:normal;"
        : "",
    },
    legend: {
      type: "scroll",
      bottom: isMobile.value ? 0 : 10,
      textStyle: {
        fontSize: isMobile.value ? 10 : 12,
      },
    },
    radar: {
      indicator: radarIndicators.value,
      radius: isMobile.value ? "25%" : "65%",
    },
    series: [
      {
        type: "radar",
        data: radarSeries.value,
        symbolSize: isMobile.value ? 4 : 6,
        areaStyle: {
          opacity: 0.15,
        },
      },
    ],
  };
});

const updateCriterionWeight = (key: string, value: string) => {
  const numValue = parseFloat(value);
  if (!isNaN(numValue) && numValue >= 1) {
    criteriaWeights.value[key] = numValue;
  }
};

const updateCriterionDirection = (key: string, direction: "min" | "max") => {
  criteriaDirections.value[key] = direction;
};

const resetWeights = () => {
  selectedCriteria.value = [];
  criteriaWeights.value = {};
  criteriaDirections.value = {};

  const defaultCriteria = ["price", "total_area"];
  selectedCriteria.value = defaultCriteria.filter(key =>
    availableCriteria.value.some(c => c.key === key && c.isAvailableForAll),
  );

  selectedCriteria.value.forEach(key => {
    criteriaWeights.value[key] = 1;
    const criterion = availableCriteria.value.find(c => c.key === key);
    criteriaDirections.value[key] = criterion?.direction || "max";
  });
};

const runAnalysis = async () => {
  if (selectedMethod.value === "electre") {
    await runElectreAnalysis();
  } else if (selectedMethod.value === "topsis") {
    await runTopsisAnalysis();
  }
};

const runElectreAnalysis = async () => {
  analysisLoading.value = true;

  try {
    const selectedOffersData = filteredOffers.value;
    if (!selectedOffersData || selectedOffersData.length === 0) {
      return;
    }

    const evaluations = selectedOffersData.map(offer =>
      selectedCriteria.value.map(key => {
        const criterion = availableCriteria.value.find(c => c.key === key);
        const value = criterion ? criterion.getValue(offer) : 0;
        return value !== null && value !== undefined ? value : 0;
      }),
    );

    const weights = selectedCriteria.value.map(
      key => criteriaWeights.value[key] || 0,
    );
    const isMin = selectedCriteria.value.map(
      key => criteriaDirections.value[key] === "min",
    );

    const response = await $api("analysis/electre", {
      method: "GET",
      params: {
        evaluations: JSON.stringify(evaluations),
        weights: JSON.stringify(weights),
        is_min: JSON.stringify(isMin),
        alpha_init: electreParams.value.alpha,
        beta_init: electreParams.value.beta,
        step: electreParams.value.step,
      },
    });

    if (response) {
      electreResults.value = {
        ...response,

        allIds: selectedOffersData.map(offer => offer.id),
      };
    }
  } catch (err: any) {
    console.error("Ошибка при анализе ELECTRE:", err);
  } finally {
    analysisLoading.value = false;
  }
};

const runTopsisAnalysis = async () => {
  analysisLoading.value = true;

  try {
    const selectedOffersData = filteredOffers.value;
    if (!selectedOffersData || selectedOffersData.length === 0) {
      return;
    }

    const evaluations = selectedOffersData.map(offer =>
      selectedCriteria.value.map(key => {
        const criterion = availableCriteria.value.find(c => c.key === key);
        const value = criterion ? criterion.getValue(offer) : 0;
        return value !== null && value !== undefined ? value : 0;
      }),
    );

    const weights = selectedCriteria.value.map(
      key => criteriaWeights.value[key] || 0,
    );

    const criteriaDirectionsArray = selectedCriteria.value.map(
      key => criteriaDirections.value[key] === "max",
    );

    const response = await $api("analysis/topsis", {
      method: "GET",
      params: {
        X: JSON.stringify(evaluations),
        weights: JSON.stringify(weights),
        criteria: JSON.stringify(criteriaDirectionsArray),
      },
    });

    if (response) {
      topsisResults.value = response;

      const rankedIndices = [...response.ranked_indices];

      const rankedOfferIds = [...response.ranked_indices].map(
        (index: number) => selectedOffersData[index].id,
      );

      topsisRanking.value = rankedOfferIds.map(
        (offerId: number, index: number) => ({
          offerId,
          score: response.scores[rankedIndices[index]],
          rank: index + 1,
        }),
      );
    }
  } catch (err: any) {
    console.error("Ошибка при анализе TOPSIS:", err);
    err.message || "Ошибка при выполнении анализа TOPSIS";
  } finally {
    analysisLoading.value = false;
  }
};

const getDominanceComparisons = (offerId: number) => {
  if (!electreResults.value || !favoriteOffers.value) return [];

  const comparisons = [];
  const offerIndex = electreResults.value.allIds.indexOf(offerId);

  if (offerIndex === -1) return [];

  const dominanceInfo =
    electreResults.value.dominance_info[offerIndex.toString()];

  if (!dominanceInfo) return [];

  for (const [otherIndexStr, comparison] of Object.entries(dominanceInfo)) {
    const otherIndex = parseInt(otherIndexStr);
    const otherOfferId = electreResults.value.allIds[otherIndex];

    if (otherOfferId !== undefined && otherOfferId !== offerId) {
      comparisons.push({
        otherOfferId,
        superior: comparison.superior || [],
        inferior: comparison.inferior || [],
        equal: comparison.equal || [],
      });
    }
  }

  return comparisons;
};

const getCriterionShortName = (criterionKey: string) => {
  const criterion = availableCriteria.value.find(c => c.key === criterionKey);
  if (!criterion) return criterionKey;

  const shortNames: {[key: string]: string} = {
    price: "Цена",
    price_per_square_meter: "Цена за м²",
    total_area: "Общая площадь",
    living_area: "Жилая площадь",
    kitchen_area: "Площадь кухни",
    rooms_count: "Комнаты",
    bedrooms_count: "Спальни",
    floor: "Этаж",
    house_floors_count: "Этажей дома",
    ceiling_height: "Высота потолков",
    transport_access_score: "Транспортная доступность",
    elderly_score: "Комфорт для пожилых",
    family_score: "Комфорт для семьи",
  };

  return shortNames[criterionKey] || criterion.displayName;
};

const getOfferTitleByIndex = (index: number) => {
  if (
    !electreResults.value ||
    !electreResults.value.allIds ||
    !favoriteOffers.value
  )
    return `Объявление ${index}`;
  const offerId = electreResults.value.allIds[index];
  const offer = favoriteOffers.value.find(o => o.id === offerId);
  return offer ? `${offer.title}` : `Объявление ${index}`;
};

const getOfferAddressByIndex = (index: number) => {
  if (
    !electreResults.value ||
    !electreResults.value.allIds ||
    !favoriteOffers.value
  )
    return "Адрес не указан";
  const offerId = electreResults.value.allIds[index];
  const offer = favoriteOffers.value.find(o => o.id === offerId);
  return offer ? offer.address.full_address : "Адрес не указан";
};

const getOfferIdByIndex = (index: number) => {
  if (
    !electreResults.value ||
    !electreResults.value.allIds ||
    !favoriteOffers.value
  )
    return "#";
  const offerId = electreResults.value.allIds[index];
  const offer = favoriteOffers.value.find(o => o.id === offerId);
  return offer ? offer.id : "#";
};

const getOfferTitle = (offerId: number) => {
  if (!favoriteOffers.value) return `Объявление ${offerId}`;
  const offer = favoriteOffers.value.find(o => o.id === offerId);
  return offer ? `${offer.title}` : `Объявление ${offerId}`;
};

const getOfferAddress = (offerId: number) => {
  if (!favoriteOffers.value) return "Адрес не указан";
  const offer = favoriteOffers.value.find(o => o.id === offerId);
  return offer ? offer.address.full_address : "Адрес не указан";
};

const getOfferUrl = (offerId: number) => {
  if (!favoriteOffers.value) return "#";
  const offer = favoriteOffers.value.find(o => o.id === offerId);
  return offer ? offer.url : "#";
};

const getRankItemClass = (index: number) => {
  if (index === 0) return "rank-item-first";
  if (index === 1) return "rank-item-second";
  if (index === 2) return "rank-item-third";
  return "";
};

const getRankNumberClass = (index: number) => {
  if (index === 0) return "rank-number-first";
  if (index === 1) return "rank-number-second";
  if (index === 2) return "rank-number-third";
  return "";
};

const getProgressFillClass = (index: number) => {
  if (index === 0) return "progress-fill-first";
  if (index === 1) return "progress-fill-second";
  if (index === 2) return "progress-fill-third";
  return "";
};
const isMobile = ref(false);

onMounted(() => {
  const check = () => {
    isMobile.value = window.innerWidth < 640;
  };

  check();
  window.addEventListener("resize", check);
});
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ru-RU").format(price);
};
</script>

<style scoped>
@reference "tailwindcss";
@reference "@nuxt/ui";

.radar-chart {
  @apply h-130 w-full mt-8 bg-white pb-4 rounded-xl border border-default;
}

.no-criteria-available {
  @apply text-center py-10 px-5 bg-[#f8f9fa] rounded-lg border-2 border-dashed border-[#dee2e6];
}

.no-criteria-icon {
  @apply text-5xl mb-4;
}

.no-criteria-available h4 {
  @apply text-[#6c757d] mb-2;
}

.no-criteria-available p {
  @apply text-[#6c757d] m-0;
}

.filters-section {
  @apply flex gap-4 mb-5 w-full;
}

.filter-group {
  @apply flex gap-4 items-center;
}

.filter-group label {
  @apply text-sm whitespace-nowrap font-semibold;
}

.loading,
.error,
.empty-state {
  @apply text-center py-15 px-5 bg-white rounded-lg;
}

.error h3 {
  @apply text-[#dc3545] mb-2.5;
}

.empty-state h3 {
  @apply text-[#333] mb-2.5;
}

.empty-state p {
  @apply text-[#666] m-0;
}

.offers-list {
  @apply flex flex-col gap-5;
}

.offer-card {
  @apply flex bg-white overflow-hidden transition-all duration-200 p-3.5 rounded-lg border border-default sm:p-7;
}

.offer-gallery {
  @apply max-w-100 relative;
}

.gallery-image {
  @apply object-cover rounded-lg w-full h-full;
}

.type-badge {
  @apply absolute top-3 left-3;
}

.title-container {
  @apply flex justify-between items-start;
}

.offer-title {
  @apply text-base font-semibold m-0 flex-1 mr-4 leading-tight;
}

.price {
  @apply text-xl font-bold text-[#2c5aa0] flex items-center gap-3;
}

.price-per-meter {
  @apply text-sm font-semibold text-[#38a169] pb-0.5 font-medium;
}

.address {
  @apply flex items-center gap-1 text-[#666] mb-4 text-sm mt-2.5;
}

.characteristics {
  @apply grid grid-cols-2 gap-x-6 gap-y-3 mb-4 p-3 bg-[#f8f9fa] rounded-lg sm:grid-cols-4;
}

.char-item {
  @apply flex justify-between text-sm;
}

.char-label {
  @apply text-[#666];
}

.char-value {
  @apply font-semibold text-[#333];
}

.infrastructure {
  @apply mb-4;
}

.infrastructure h4 {
  @apply m-0 mb-3 text-sm text-[#333] font-semibold;
}

.infrastructure-list {
  @apply flex flex-wrap gap-2;
}

.infrastructure-item {
  @apply flex items-center gap-3 p-2 bg-[#f8f9fa] rounded-lg;
}

.infra-info {
  @apply flex-1 flex flex-col;
}

.infra-type {
  @apply text-xs text-[#666];
}

.infra-distance {
  @apply text-xs font-semibold text-[#2c5aa0] whitespace-nowrap;
}

.contact-info {
  @apply flex justify-between items-center pt-4 border-t border-[#f0f0f0];
}

.phone-number {
  @apply text-[#2c5aa0] text-sm no-underline font-semibold hover:underline;
}

.actions {
  @apply flex gap-4;
}

.comparison-section-bottom {
  @apply mt-10;
}

.section-header {
  @apply mb-6 text-center;
}

.section-header h2 {
  @apply text-[#333] mb-2 text-2xl;
}

.section-header p {
  @apply text-[#666] text-base m-0;
}

.comparison-controls {
  @apply flex justify-center mb-7;
}

.compare-btn {
  @apply px-7 py-3.5 bg-[#2c5aa0] text-white border-none rounded-lg text-base cursor-pointer font-semibold transition-all duration-200;
}

.compare-btn:hover {
  @apply bg-[#1e3d6f] translate-y-[-2px];
}

.comparison-interface {
  @apply bg-white rounded-xl p-7 border border-default;
}

.method-selection {
  @apply mb-6 p-4 bg-[#f8f9fa] rounded-lg justify-between items-center flex sm:justify-start gap-3;
}

.method-select {
  @apply p-2 border border-[#ddd] rounded text-sm;
}

.criteria-selection {
  @apply mb-6;
}

.selection-info {
  @apply text-[#666] text-sm mb-4;
}

.criteria-grid {
  @apply grid grid-cols-2 gap-3 mb-4 max-h-[400px] overflow-y-auto p-2;
}

.criterion-item {
  @apply flex items-center p-3 border-2 border-default rounded-lg cursor-pointer transition-all duration-200 bg-white;
}

.criterion-item:hover {
  @apply border-[#2c5aa0] bg-[#f8f9fa];
}

.criterion-item.selected {
  @apply border-[#2c5aa0] bg-[#f0f8ff];
}

.criterion-checkbox {
  @apply relative mr-3;
}

.criterion-checkbox input {
  @apply opacity-0 absolute;
}

.checkmark {
  @apply inline-block w-5 h-5 border-2 border-[#ddd] rounded bg-white relative;
}

.criterion-item.selected .checkmark {
  @apply bg-[#2c5aa0] border-[#2c5aa0];
}

.criterion-item.selected .checkmark::after {
  content: "✓";
  @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm font-bold;
}

.criterion-info {
  @apply flex-1;
}

.criterion-name {
  @apply font-semibold mb-1 text-[#333];
}

.criterion-range {
  @apply text-xs text-[#666];
}

.no-criteria-warning {
  @apply p-3 bg-[#fff3cd] border border-[#ffeaa7] rounded text-[#856404] text-center;
}

.criteria-weights {
  @apply mb-6 p-4 bg-[#f8f9fa] rounded-lg;
}

.weights-grid {
  @apply flex flex-col gap-3;
}

.weight-item {
  @apply flex justify-between items-center p-3 bg-white rounded-lg border border-default;
}

.weight-info {
  @apply flex-1;
}

.weight-name {
  @apply font-semibold block mb-1;
}

.weight-direction {
  @apply text-sm text-[#666];
}

.weight-controls {
  @apply flex gap-3 items-center;
}

.direction-select {
  @apply p-1.5 border border-[#ddd] rounded text-xs;
}

.weight-input {
  @apply w-20 p-1.5 border border-[#ddd] rounded text-center;
}

.algorithm-params {
  @apply my-5 p-4 bg-[#f0f8ff] rounded-lg;
}

.params-grid {
  @apply grid grid-cols-2 gap-3 mt-3;
}

.param-group {
  @apply flex flex-col gap-1;
}

.param-group label {
  @apply text-sm font-semibold text-[#333];
}

.param-group input {
  @apply p-1.5 border border-[#ddd] rounded;
}

.analysis-actions {
  @apply flex gap-3 justify-center mt-6 pt-4 border-t border-default;
}

.analyze-button {
  @apply px-6 py-3 bg-[#2c5aa0] text-white border-none rounded text-base cursor-pointer min-w-40 disabled:bg-[#6c757d] disabled:cursor-not-allowed hover:bg-[#1e3d6f];
}

.reset-button {
  @apply px-6 py-3 bg-[#6c757d] text-white border-none rounded text-base cursor-pointer hover:bg-[#5a6268];
}

.results-section {
  @apply mt-6 border-t-2 border-default pt-3;
}

.method-header {
  @apply flex justify-between items-center mb-4 pb-3 border-b border-default;
}

.method-header h3 {
  @apply m-0 text-[#2c5aa0] text-xl;
}

.close-method-button {
  @apply bg-none border-none pt-0 text-2xl cursor-pointer text-[#666] p-1 rounded hover:bg-[#f0f0f0] hover:text-[#333];
}

.results-description {
  @apply text-[#666] mb-5 italic;
}

.kernel-section {
  @apply mb-6 p-4 bg-[#e8f5e8] rounded-lg border-l-4 border-[#2e7d32];
}

.kernel-section h4 {
  @apply m-0 mb-3 text-[#2e7d32] text-base;
}

.kernel-list {
  @apply flex flex-col gap-2;
}

.kernel-item {
  @apply flex justify-between items-center p-3 bg-white rounded-lg border border-[#c8e6c9];
}

.kernel-offer {
  @apply flex-1;
}

.kernel-title {
  @apply font-semibold text-[#333] mb-1;
}

.kernel-address {
  @apply text-sm text-[#666];
}

.kernel-link {
  @apply px-3 py-1.5 bg-[#2c5aa0] text-white no-underline rounded text-sm whitespace-nowrap ml-3 hover:bg-[#1e3d6f];
}

.comparison-section {
  @apply mt-6;
}

.comparison-section h4 {
  @apply m-0 mb-4 text-[#333] text-base;
}

.comparison-list {
  @apply flex flex-col gap-4;
}

.comparison-card {
  @apply p-4 bg-white rounded-lg border border-default;
}

.comparison-header {
  @apply flex justify-between items-start mb-4 pb-3 border-b border-[#f0f0f0];
}

.comparison-info {
  @apply flex-1;
}

.comparison-title {
  @apply font-semibold text-[#333] mb-1;
}

.comparison-address {
  @apply text-sm text-[#666];
}

.comparison-link {
  @apply px-3 py-1.5 bg-[#2c5aa0] text-white no-underline rounded text-sm whitespace-nowrap ml-3 hover:bg-[#1e3d6f];
}

.dominance-comparisons {
  @apply flex flex-col gap-3;
}

.dominance-item {
  @apply p-3 bg-[#f8f9fa] rounded-lg border-[#2c5aa0];
}

.comparison-with {
  @apply mb-2 font-medium text-[#333];
}

.comparison-category {
  @apply mb-2;
}

.category-label {
  @apply font-semibold mb-1.5 text-sm;
}

.category-label.superior {
  @apply text-[#2e7d32];
}

.category-label.inferior {
  @apply text-[#c62828];
}

.criterion-detail {
  transition: all 0.2s;
}

.comparison-header {
  user-select: none;
}

.category-label.equal {
  @apply text-[#ef6c00];
}

.criteria-chips {
  @apply flex flex-wrap gap-1.5;
}

.chip {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.superior-chip {
  @apply bg-[#e8f5e8] text-[#2e7d32] border border-[#c8e6c9];
}

.inferior-chip {
  @apply bg-[#ffebee] text-[#c62828] border border-[#ffcdd2];
}

.equal-chip {
  @apply bg-[#fff3e0] text-[#ef6c00] border border-[#ffe0b2];
}

.topsis-results {
  @apply mt-6 border-t-2 border-default pt-3;
}

.ranking-section {
  @apply mb-6;
}

.ranking-list {
  @apply flex flex-col gap-3 mt-4;
}

.rank-item {
  @apply p-4 bg-white rounded-lg border-2 border-default transition-all duration-300;
}

.rank-item-first {
  @apply border-[#ffd700] bg-[#fff9e6] scale-[1.02];
}

.rank-item-second {
  @apply border-[#c0c0c0] bg-[#f8f8f8];
}

.rank-item-third {
  @apply border-[#cd7f32] bg-[#fef4e8];
}

.rank-header {
  @apply flex items-center gap-4 mb-3;
}

.rank-number {
  @apply w-10 h-10 rounded-full bg-[#6c757d] text-white flex items-center justify-center font-bold text-base flex-shrink-0;
}

.rank-number-first {
  @apply bg-[#ffd700] text-[#333];
}

.rank-number-second {
  @apply bg-[#c0c0c0];
}

.rank-number-third {
  @apply bg-[#cd7f32];
}

.rank-info {
  @apply flex-1;
}

.offer-title {
  @apply font-semibold text-[#333] mb-1;
}

.offer-address {
  @apply text-sm text-[#666];
}

.rank-link {
  @apply px-4 py-2 bg-[#2c5aa0] text-white no-underline rounded text-sm font-medium transition-colors duration-200 whitespace-nowrap hover:bg-[#1e3d6f];
}

.score-section {
  @apply border-t border-[#f0f0f0] pt-3;
}

.score-info {
  @apply flex flex-col gap-2;
}

.score-label {
  @apply text-sm text-[#666];
}

.score-value {
  @apply font-semibold text-[#333];
}

.progress-bar {
  @apply w-full h-2 bg-[#f0f0f0] rounded overflow-hidden;
}

.progress-fill {
  @apply h-full bg-[#2c5aa0] rounded transition-all duration-500;
}

.progress-fill-first {
  background: linear-gradient(90deg, #ffd700, #ffed4a);
}

.progress-fill-second {
  background: linear-gradient(90deg, #c0c0c0, #e0e0e0);
}

.progress-fill-third {
  background: linear-gradient(90deg, #cd7f32, #e6a65d);
}

.offer-content {
  padding-top: 10px;
  width: 100%;
}

@media (min-width: 768px) {
  .offer-header {
    @apply flex gap-5;
  }
}

@media (max-width: 768px) {
  .price {
    @apply flex-col text-nowrap ml-2 gap-0;
  }

  .filters-section {
    @apply flex-col w-3/4 gap-1.5;
  }

  .filter-group {
    @apply justify-between;
  }

  .offers-list {
    @apply grid grid-cols-1;
  }

  .characteristics {
    @apply grid-cols-1;
  }

  .contact-info {
    @apply flex-col items-stretch gap-3;
  }

  .actions {
    @apply justify-between;
  }

  .comparison-interface {
    @apply p-4;
  }

  .criteria-grid {
    @apply grid-cols-1;
  }

  .weight-item {
    @apply flex-col items-start gap-3;
  }

  .weight-controls {
    @apply w-full justify-between;
  }

  .analysis-actions {
    @apply flex-col;
  }

  .analyze-button,
  .reset-button {
    @apply w-full;
  }

  .params-grid {
    @apply grid-cols-1;
  }

  .comparison-header {
    @apply flex-col gap-3;
  }

  .comparison-link {
    @apply ml-0 self-start;
  }

  .kernel-item {
    @apply flex-col items-start gap-3;
  }

  .kernel-link {
    @apply ml-0 self-stretch text-center;
  }

  .rank-header {
    @apply flex-col items-start gap-3;
  }

  .rank-link {
    @apply self-stretch text-center;
  }

  .rank-item-first,
  .rank-item-second,
  .rank-item-third {
    transform: none;
  }

  .section-header h2 {
    @apply text-2xl;
  }
}

@media (max-width: 480px) {
  .characteristics {
    @apply grid-cols-1;
  }

  .comparison-interface {
    @apply p-3;
  }

  .compare-btn {
    @apply w-full px-5 py-3;
  }
}
</style>
