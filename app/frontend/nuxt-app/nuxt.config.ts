export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    'vue-yandex-maps/nuxt',
    '@nuxtjs/mdc',
    'nuxt-auth-utils',
  ],
  devServer: {
    host: '127.0.0.1',
    port: 3000
  },
  yandexMaps: {
    apikey: '314886a8-d1c0-4824-878c-46d76b59030a'
  },

  css: ['~/assets/css/main.css'],
 runtimeConfig: {
  apiBase: 'http://localhost:8000', // 👈 SSR (Node)
  public: {
    apiBase: '/api',                // 👈 browser (vite proxy)
  },
}

})