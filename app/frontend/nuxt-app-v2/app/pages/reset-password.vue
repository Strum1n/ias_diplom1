<template>
  <div class="login-container">
    <UCard class="login-card">
      <template #header>
        <h2 class="login-title">Сброс пароля</h2>
      </template>

      <!-- Проверка токена -->
      <div v-if="loading" class="info-message">
        <p class="info-text">Проверка ссылки...</p>
      </div>

      <!-- Ошибка токена -->
      <div v-else-if="tokenError" class="error-message">
        <p class="error-text">{{ tokenError }}</p>
      </div>

      <!-- Успешная смена -->
      <div v-else-if="success" class="success-message">
        <p class="success-text">Пароль успешно обновлён!</p>
        <div class="button-container" style="margin-top: 1rem">
          <NuxtLink to="/login">
            <UButton class="w-full!" color="primary">Перейти ко входу</UButton>
          </NuxtLink>
        </div>
      </div>

      <!-- Форма -->
      <UForm v-else @submit="handleSubmit" :state="form" :validate="validate" class="login-form">
        <div class="form-field">
          <UFormField label="Новый пароль" name="password">
            <UInput v-model="form.password" type="password" placeholder="••••••••" />
          </UFormField>
        </div>

        <div class="form-field">
          <UFormField label="Подтвердите пароль" name="confirmPassword">
            <UInput v-model="form.confirmPassword" type="password" placeholder="••••••••" />
          </UFormField>
        </div>

        <div class="button-container">
          <UButton type="submit" class="button-submit" color="primary" :loading="submitting"> Сменить пароль </UButton>
        </div>
      </UForm>

      <div v-if="formError" class="error-message">
        <p class="error-text">{{ formError }}</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { FormError } from "@nuxt/ui";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const token = ref<string | null>(null);

const loading = ref(true);
const submitting = ref(false);
const success = ref(false);

const tokenError = ref<string | null>(null);
const formError = ref<string | null>(null);

const form = reactive({
  password: "",
  confirmPassword: "",
});

onMounted(async () => {
  const queryToken = route.query.token;

  if (!queryToken || typeof queryToken !== "string") {
    router.push("/forgot-password");
    return;
  }

  token.value = queryToken;

  try {
    await $fetch("/api/auth/validate-reset-token", {
      method: "POST",
      body: { token: token.value },
    });
  } catch {
    tokenError.value = "Ссылка недействительна или устарела.";
  } finally {
    loading.value = false;
  }
});

const validate = (state: any): FormError[] => {
  const errors = [];
  if (!state.password) {
    errors.push({ name: "password", message: "Введите пароль" });
  }
  if (!state.confirmPassword) {
    errors.push({ name: "confirmPassword", message: "Подтвердите пароль" });
  }
  return errors;
};

const handleSubmit = async () => {
  formError.value = null;

  if (form.password.length < 6) {
    formError.value = "Пароль должен быть не менее 6 символов.";
    return;
  }

  if (form.password !== form.confirmPassword) {
    formError.value = "Пароли не совпадают.";
    return;
  }

  if (!token.value) return;

  submitting.value = true;

  try {
    await $fetch("http://localhost:8000/auth/confirm-password-reset", {
      method: "POST",
      body: {
        token: token.value,
        new_password: form.password,
      },
    });

    success.value = true;
  } catch (e: any) {
    formError.value = e?.data?.detail || "Ошибка при сбросе пароля.";
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* Берём тот же layout что и login */
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

.info-message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.375rem;
}

.info-text {
  font-size: 0.875rem;
  color: #1d4ed8;
  text-align: center;
  margin: 0;
}
</style>
