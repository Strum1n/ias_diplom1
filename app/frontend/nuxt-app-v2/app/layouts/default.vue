<template>
  <header v-if="showHeader" class="header">
    <UContainer class="flex justify-between items-center gap-3 h-16 sm:min-w-full lg:min-w-360">
      <NuxtLink to="/" class="logo">
        <UIcon name="ic:round-maps-home-work" class="logo-icon" />
        <span>Real</span>
        <span class="text-primary">Estate</span>
      </NuxtLink>

      <!-- Dropdown для мобильных -->
      <div class="ml-0 mr-auto sm:hidden">
        <UDropdownMenu
          arrow
          :items="items"
          :ui="{
            content: 'w-48',
          }">
          <UButton icon="i-lucide-menu" color="neutral" variant="outline" />
        </UDropdownMenu>
      </div>

      <div class="hidden sm:block">
        <UNavigationMenu highlight class="text-xl" :items="items" />
      </div>

      <div class="right">
        <div class="auth">
          <template v-if="isAuthenticated">
            <span class="sm:inline text-sm font-semibold user-email">
              {{ userEmail }}
            </span>

            <UButton class="cursor-pointer" variant="soft" @click="logout" :loading="loading" size="sm"> Выйти </UButton>
          </template>

          <template v-else>
            <UButton variant="soft" @click="navigateTo('/login')" size="sm" class="hidden sm:inline-flex">Войти</UButton>
            <UButton variant="solid" @click="navigateTo('/register')" size="sm">Регистрация</UButton>
          </template>
        </div>
      </div>
    </UContainer>
  </header>

  <slot />
</template>

<script setup lang="ts">
import { jwtDecode } from "jwt-decode";

const route = useRoute();
const { logout, loading, accessToken, isAuthenticated } = useAuth();

const showHeader = computed(() => !["/login", "/register"].includes(route.path));

const userEmail = computed(() => {
  if (!accessToken.value) return "";
  try {
    const { sub } = jwtDecode<{ sub: string }>(accessToken.value);
    return sub;
  } catch {
    return "";
  }
});

const items = ref([
  {
    label: "Объявления",
    icon: "mdi:house-find-outline",
    to: "/offers",
  },
  {
    label: "Избранное",
    icon: "material-symbols-light:favorite",
    to: "/favorites",
  },
  {
    label: "Карта",
    icon: "uiw:map",
    to: "/map",
  },
  {
    label: "Аналитика",
    icon: "icon-park-solid:analysis",
    to: "/dashboard",
  },
]);
</script>

<style scoped>
@reference "@nuxt/ui";
@reference 'tailwindcss';
:deep(a) {
  @apply font-semibold;
}

.header {
  @apply sticky top-0 z-50 bg-white/92 text-[#111] backdrop-blur backdrop-saturate-180 border-b border-b-default;
}

.logo {
  @apply flex items-end text-[1.35rem] font-bold;
}

.logo-icon {
  @apply w-8 h-8 text-primary;
}

.right {
  @apply flex items-center gap-4;
}

.auth {
  @apply flex items-center gap-3;
}

/* Адаптивные стили для мобильных устройств */
@media (max-width: 640px) {
  .auth {
    @apply gap-2;
  }

  .logo {
    @apply text-[1.1rem];
  }

  .logo-icon {
    @apply w-6 h-6;
  }
}
</style>
