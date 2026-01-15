export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    'vue-yandex-maps/nuxt',
    '@nuxtjs/mdc',
    'nuxt-auth-utils'
  ],
  devServer: {
    host: '127.0.0.1',
    port: 3000
  },
  yandexMaps: {
    apikey: 'c5e28dc9-864f-4c09-9ae2-bd82441ff849'
  },

  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    apiBase: 'http://localhost:8000',
    public: {
      apiBase: '/api',
    },
  }

})