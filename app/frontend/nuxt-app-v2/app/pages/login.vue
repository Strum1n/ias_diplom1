<template>
  <div class="login-container">
    <UCard class="login-card">
      <template #header>
        <h2 class="login-title">Вход в систему</h2>
      </template>

      <!-- Сообщение об успешной регистрации -->
      <div v-if="registrationSuccess" class="success-message">
        <p class="success-text">Регистрация прошла успешно! Теперь вы можете войти</p>
      </div>

      <UForm @submit="handleSubmit" :state="form" :validate="validate" class="login-form">
        <div class="form-field">
          <UFormField label="Email" name="email">
            <UInput v-model="form.email" type="email" placeholder="your@email.com" />
          </UFormField>
        </div>

        <div class="form-field">
          <UFormField label="Пароль" name="password">
            <UInput v-model="form.password" type="password" placeholder="••••••••" />
          </UFormField>
        </div>

        <div class="button-container">
          <UButton type="submit" class="button-submit" color="primary" :loading="loading"> Войти </UButton>
        </div>
        <NuxtLink to="/forgot-password" class="footer-link text-sm! w-fit! mx-auto!"> Забыли пароль? </NuxtLink>
      </UForm>

      <div v-if="error" class="error-message">
        <p class="error-text">{{ error }}</p>
      </div>

      <template #footer>
        <p class="footer-text">
          Нет аккаунта?
          <NuxtLink to="/register" class="footer-link"> Зарегистрироваться </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { FormError } from "@nuxt/ui";


const { handleLogin, loading, error } = useAuth();
const route = useRoute();

// Показываем сообщение об успешной регистрации
const registrationSuccess = computed(() => route.query.registered === "true");

const form = reactive({
  email: "",
  password: "",
});

const validate = (state: any): FormError[] => {
  const errors = [];
  if (!state.email) errors.push({ name: "email", message: "Required" });
  if (!state.password) errors.push({ name: "password", message: "Required" });
  return errors;
};

const handleSubmit = async () => {
  await handleLogin(form.email, form.password);
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

/* ✅ Добавляем стили для успешного сообщения */
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
