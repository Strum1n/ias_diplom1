<template>
  <div class="relative">
    <!-- Кнопка открытия -->
    <UButton
      icon="i-heroicons-chat-bubble-left-right"
      color="primary"
      variant="outline"
      @click="toggle"
    >
      <span class="hidden sm:inline">Помощник</span>
    </UButton>

    <!-- Чат -->
    <Transition name="fade-slide">
      <div v-if="open" class="chat-panel">
        <header class="chat-header">
          <span>Умный помощник</span>
          <UButton
            icon="i-heroicons-x-mark"
            size="xs"
            variant="ghost"
            @click="open = false"
          />
        </header>

        <div class="chat-body">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            :class="['chat-message', msg.role]"
          >
            <!-- Текст пользователя -->
            <template v-if="msg.role === 'user'">
              {{ msg.content }}
            </template>

            <!-- Ответ ассистента -->
            <template v-else>
              <!-- Ошибка -->
              <div v-if="typeof msg.content === 'object' && msg.content.error">
                {{ msg.content }}
              </div>

              <!-- Обычный текст ассистента -->
              <div v-else-if="typeof msg.content === 'string'">
                {{ msg.content }}
              </div>

              <!-- Результаты поиска -->
              <template
                v-else-if="msg.content.result && msg.content.result.length > 0"
              >
                <div class="assistant-intro">
                  Я нашёл подходящие объявления:
                </div>

                <div class="assistant-results">
                  <div
                    v-for="offer in msg.content.result"
                    :key="offer.id"
                    class="assistant-offer"
                    @click="navigateTo(`/offers/${offer.id}`)"
                  >
                    <img
                      :src="offer.first_image"
                      alt="Фото"
                      class="offer-image"
                    />

                    <div class="offer-info">
                      <div class="offer-price">
                        {{ formatPrice(offer.price) }}
                      </div>

                      <div class="offer-address">
                        {{ offer.full_address }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="assistant-intro">
                  К сожалению я не нашел объявлений по такому запросу.
                </div>
              </template>
            </template>
          </div>

          <div v-if="loading" class="chat-message assistant">Думаю…</div>
        </div>

        <form class="chat-input" @submit.prevent="send">
          <UInput
            class="w-full"
            v-model="input"
            placeholder="Задайте вопрос…"
            autocomplete="off"
          />
          <UButton icon="i-heroicons-paper-airplane" type="submit" />
        </form>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
type AssistantResponse = {
  sql?: string;
  result?: {
    id: number;
    full_address: string;
    price: number;
    is_new_house: boolean;
    images_urls: string;
  }[];
  error?: boolean;
};

interface Message {
  role: "user" | "assistant";
  content: string | AssistantResponse;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
}

const {$api} = useNuxtApp();

const open = ref(false);
const input = ref("");
const loading = ref(false);

const messages = ref<Message[]>([
  {
    role: "assistant",
    content:
      "Здравствуйте! Я умный помощник, который поможет подобрать вам жилье. Опишите свои предпочтения, а я подберу варианты.",
  },
]);

function toggle() {
  open.value = !open.value;
}

async function send() {
  if (!input.value.trim()) return;

  const userMessage = input.value;
  input.value = "";
  loading.value = true;

  messages.value.push({
    role: "user",
    content: userMessage,
  });

  try {
    const response = await $api("/analysis/chat_assistant", {
      method: "GET",
      params: {query: userMessage},
    });

    messages.value.push({
      role: "assistant",
      content: response,
    });
  } catch (e) {
    messages.value.push({
      role: "assistant",
      content: {error: true},
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
@reference "tailwindcss";
@reference "@nuxt/ui";
.chat-panel {
  @apply fixed inset-0 z-50 bg-white flex flex-col
  sm:absolute sm:inset-auto sm:right-0 sm:top-12 
  sm:w-80 sm:h-[420px] sm:border sm:rounded-lg sm:shadow-lg;
}

.chat-header {
  @apply flex justify-between items-center px-3 py-2 border-b font-semibold;
}

.chat-body {
  @apply flex-1 overflow-y-auto p-3 space-y-2 text-sm;
}

.chat-message {
  @apply px-3 py-2 rounded-md max-w-[90%];
}

.chat-message.user {
  @apply bg-primary text-white ml-auto;
}

.chat-message.assistant {
  @apply bg-gray-100 text-gray-800;
}

.chat-input {
  @apply flex gap-2 p-2 border-t w-full;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.assistant-intro {
  @apply text-sm font-medium mb-2;
}

.assistant-results {
  @apply flex flex-col gap-3;
}

.assistant-offer {
  @apply flex gap-3 p-2 border rounded-md hover:bg-gray-50 cursor-pointer;
}

.offer-image {
  @apply w-16 h-16 rounded object-cover flex-shrink-0;
}

.offer-info {
  @apply flex flex-col gap-1;
}

.offer-price {
  @apply font-semibold text-primary text-sm;
}

.offer-address {
  @apply text-xs text-gray-600 line-clamp-2;
}
</style>
