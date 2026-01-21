<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <UIcon name="i-heroicons-home-modern" class="w-12 h-12 text-primary-600 mx-auto mb-2" />
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Регистрация</h2>
          <p class="text-gray-600 dark:text-gray-300 mt-1">Создайте новый аккаунт</p>
        </div>
      </template>
      <div class="flex justify-center">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormField label="Email" name="email">
            <UInput v-model="form.email" type="email" placeholder="your@email.com" required />
          </UFormField>

          <UFormField label="Имя пользователя" name="user_name">
            <UInput v-model="form.user_name" type="text" placeholder="Ваше имя пользователя" required />
          </UFormField>

          <UFormField label="Пароль" name="password">
            <UInput v-model="form.password" type="password" placeholder="••••••••" required />
          </UFormField>

          <UFormField label="Подтвердите пароль" name="confirmPassword">
            <UInput v-model="form.confirmPassword" type="password" placeholder="••••••••" required />
          </UFormField>

          <UFormField label="Полное имя" name="full_name">
            <UInput v-model="form.full_name" type="text" placeholder="Ваше полное имя" required />
          </UFormField>

          <UFormField label="Роль" name="role_id">
            <USelect v-model="form.role_id" :items="roleOptions" required />
          </UFormField>

          <UButton type="submit" color="primary" class="w-full" :loading="loading" size="lg"> Зарегистрироваться </UButton>
        </form>
      </div>
      <div v-if="error" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
        <p class="text-red-700 dark:text-red-400 text-sm">{{ error }}</p>
      </div>

      <template #footer>
        <p class="text-center text-gray-600 dark:text-gray-400 text-sm">
          Уже есть аккаунт?
          <NuxtLink to="/login" class="text-primary-600 dark:text-primary-400 hover:underline font-medium"> Войти </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { SelectItem } from "@nuxt/ui";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

const loading = ref(false);
const error = ref<string | null>(null);

const form = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  user_name: "", // имя пользователя
  full_name: "", // полное имя
  role_id: 1, // роль, можно будет динамически обновить
});

const roleOptions = ref<SelectItem[]>([
  { value: 1, label: "Пользователь" },
  { value: 2, label: "Администратор" },
]);

const router = useRouter();
const config = useRuntimeConfig();
const handleSubmit = async () => {
  // Проверяем, совпадают ли пароли
  if (form.password !== form.confirmPassword) {
    error.value = "Пароли не совпадают!";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Отправляем запрос на сервер с правильными данными
    const response = await $fetch(`${config.public.apiBase}/auth/register`, {
      method: "POST",
      body: {
        user_name: form.user_name, // Имя пользователя
        email: form.email, // Email
        password: form.password, // Пароль
        full_name: form.full_name, // Полное имя
        role_id: form.role_id, // Роль
      },
    });

    // Если регистрация успешна, перенаправляем на страницу входа
    if (response.message === "User registered successfully") {
      router.push({ path: "/login", query: { registered: "true" } });
    }
  } catch (err: any) {
    console.error(err);
    // Если сервер вернул JSON с detail
    if (err?.data?.detail === "Username already registered") {
      error.value = "Email уже зарегистрирован";
    } else {
      error.value = err.message || "Ошибка регистрации";
    }
  } finally {
    loading.value = false;
  }
};
</script>
