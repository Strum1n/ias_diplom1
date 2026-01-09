<template>
    <header v-if="showHeader" class="header">
        <UContainer class="flex min-w-360 justify-between items-center gap-3 h-16">


            <!-- Логотип + навигация -->

            <NuxtLink to="/" class="logo">
                <UIcon name="ic:round-maps-home-work" class="logo-icon" />
                <span>Real</span>
                <span class="text-primary">Estate</span>
            </NuxtLink>

            <UNavigationMenu highlight class="text-xl" :items="items" />


            <!-- Правая часть -->
            <div class="right">

                <div class="auth">
                    <template v-if="isAuthenticated">
                        <span class="user-email">
                            {{ userEmail }}
                        </span>

                        <UButton class="cursor-pointer" variant="soft" @click="logout" :loading="loading" size="sm">
                            Выйти
                        </UButton>
                    </template>

                    <template v-else>
                        <UButton variant="soft" @click="navigateTo('/login')" size="sm">Войти</UButton>
                        <UButton variant="solid" @click="navigateTo('/register')" size="sm">Регистрация</UButton>
                    </template>
                </div>

            </div>

        </UContainer>
    </header>

    <slot />
</template>

<script setup lang="ts">
import { jwtDecode } from 'jwt-decode'

const route = useRoute()
const { logout, loading, accessToken, isAuthenticated } = useAuth()

// Скрываем хедер на страницах логина и регистрации
const showHeader = computed(() => !['/login', '/register'].includes(route.path))

// Извлекаем email (sub) из токена
const userEmail = computed(() => {
    if (!accessToken.value) return ''
    try {
        const { sub } = jwtDecode<{ sub: string }>(accessToken.value)
        return sub
    } catch {
        return ''
    }
})


const items = ref([
    {
        label: 'Объявления',
        icon: 'mdi:house-find-outline',
        to: '/offers',
    },
    {
        label: 'Избранное',
        icon: 'material-symbols-light:favorite',
        to: '/favorites',
    },
    {
        label: 'Аналитика',
        icon: 'icon-park-solid:analysis',
        to: '/board',

    },
    {
        label: 'Карта',
        icon: 'uiw:map',
        // badge: '3.8k',
        to: '/map',
    },

])

</script>

<style scoped>
/* HEADER */
.header {
    position: sticky;
    top: 0;
    z-index: 50;

    background: white;
    color: #111;

    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* контейнер с вертикальным padding */
.container {
    padding-top: 1rem;
    padding-bottom: 1rem;
}

.header-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.left {
    display: flex;
    align-items: center;
    gap: 2.5rem;
}

.logo {
    display: flex;
    align-items: end;
    font-size: 1.25rem;
    font-weight: 700;
}

.logo-icon {
    width: 2rem;
    height: 2rem;
    color: var(--color-primary);
}

.nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}



.right {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.auth {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.user-email {
    color: #4b5563;
    font-size: 0.875rem;
    display: none;
}

@media (min-width: 640px) {
    .user-email {
        display: block;
    }
}
</style>
