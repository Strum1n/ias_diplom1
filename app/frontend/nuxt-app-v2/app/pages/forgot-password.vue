<template>
  <div class="login-container">
    <UCard class="login-card">
      <template #header>
        <h2 class="login-title">Восстановление пароля</h2>
      </template>

      <!-- Успешная отправка -->
      <div v-if="success" class="success-message">
        <p class="success-text">На указанный email отправлена ссылка для восстановления пароля.</p>
        <div class="button-container" style="margin-top: 1rem">
          <NuxtLink to="/login">
            <UButton class="w-full!" color="primary">Вернуться ко входу</UButton>
          </NuxtLink>
        </div>
      </div>

      <!-- Форма -->
      <UForm v-else @submit="handleSubmit" :state="form" :validate="validate" class="login-form">
        <div class="form-field">
          <UFormField label="Email" name="email">
            <UInput v-model="form.email" type="email" placeholder="your@email.com" />
          </UFormField>
        </div>

        <div class="button-container">
          <UButton type="submit" class="button-submit" color="primary" :loading="loading"> Отправить ссылку </UButton>
        </div>
      </UForm>

      <div v-if="error" class="error-message">
        <p class="error-text">{{ error }}</p>
      </div>

      <template #footer>
        <p class="footer-text">
          Вспомнили пароль?
          <NuxtLink to="/login" class="footer-link w-max!"> Вернуться ко входу </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type {FormError} from "@nuxt/ui";

const form = reactive({
  email: "",
});

const loading = ref(false);
const success = ref(false);
const error = ref<string | null>(null);

const validate = (state: any): FormError[] => {
  const errors = [];
  if (!state.email) {
    errors.push({name: "email", message: "Введите email"});
  }
  return errors;
};
const runtimeConfig = useRuntimeConfig();
const handleSubmit = async () => {
  error.value = null;
  loading.value = true;

  try {
    await $fetch(`${runtimeConfig.public.apiBase}/auth/request-password-reset`, {
      method: "POST",
      body: {email: form.email},
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
    });

    success.value = true;
  } catch (e) {
    error.value = "Ошибка при отправке запроса. Попробуйте позже.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  background-color: #f9fafb;
}

.login-card {
  width: 100%;
  max-width: 28rem;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  line-height: 2rem;
  color: #111827;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.form-field :deep(.u-form-field) {
  width: 100%;
  max-width: 20rem;
}

.button-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.button-container :deep(button) {
  width: 45% !important;
  max-width: 20rem !important;
}

.button-submit {
  justify-content: center !important;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
}

.error-text {
  font-size: 0.875rem;
  color: #dc2626;
  text-align: center;
  margin: 0;
}

.success-message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #ecfdf5;
  border: 1px solid #6ee7b7;
  border-radius: 0.375rem;
}

.success-text {
  font-size: 0.875rem;
  color: #047857;
  text-align: center;
  margin: 0;
}

.footer-text {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.footer-link {
  color: #2563eb;
  font-weight: 500;
  margin-left: 0.25rem;
}

.footer-link:hover {
  text-decoration: underline;
}
</style>
