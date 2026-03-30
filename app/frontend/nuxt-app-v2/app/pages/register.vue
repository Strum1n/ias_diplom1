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

          <UFormField label="Логин" name="user_name">
            <UInput v-model="form.login" type="text" placeholder="Ваш логин" required />
          </UFormField>

          <UFormField label="Пароль" name="password">
            <UInput v-model="form.password" type="password" placeholder="••••••••" required />
          </UFormField>

          <UFormField label="Подтвердите пароль" name="confirmPassword">
            <UInput v-model="form.confirmPassword" type="password" placeholder="••••••••" required />
          </UFormField>

          <UFormField label="Имя" name="name">
            <UInput v-model="form.name" type="text" placeholder="Ваше имя" required />
          </UFormField>
          <UFormField label="Фамилия" name="surname">
            <UInput v-model="form.surname" type="text" placeholder="Ваша фамилия" required />
          </UFormField>

          <UFormField label="Уровень подписки:" name="role">
            <USelect class="w-full" v-model="form.role" :items="roleOptions" required />
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
import type {SelectItem} from "@nuxt/ui";

const loading = ref(false);
const error = ref<string | null>(null);

const form = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  login: "", // имя пользователя
  name: "",
  surname: "", // полное имя
  role: "Стандарт", // роль, можно будет динамически обновить
});

const roleOptions = ref<SelectItem[]>(["Стандарт", "Премиум"]);

const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const handleSubmit = async () => {
  // Проверяем, совпадают ли пароли
  if (form.password.length < 6) {
    error.value = "Пароль должен быть не менее 6 символов.";
    return;
  }
  if (form.password !== form.confirmPassword) {
    error.value = "Пароли не совпадают!";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Отправляем запрос на сервер с правильными данными
    const response = await $fetch(`${runtimeConfig.public.apiBase}/auth/register`, {
      method: "POST",
      body: {
        login: form.login, // Имя пользователя
        email: form.email, // Email
        password: form.password, // Пароль
        name: form.name, // Полное имя
        surname: form.surname,
        role: form.role, // Роль
      },
    });

    // Если регистрация успешна, перенаправляем на страницу входа
    if (response.message === "User registered successfully") {
      router.push({path: "/login", query: {registered: "true"}});
    }
  } catch (err: any) {
    console.error(err);
    // Если сервер вернул JSON с detail
    if (err?.data?.detail === "Username already registered") {
      error.value = "Email уже зарегистрирован";
    } else {
      error.value = err?.data?.detail || "Ошибка регистрации";
    }
  } finally {
    loading.value = false;
  }
};
</script>
