import { defineNuxtConfig } from 'nuxt/config'
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr:true,
  modules: ['@nuxt/ui', // '@nuxtjs/mdc',
  'vue-yandex-maps/nuxt', 'nuxt-auth-utils', 'nuxt-echarts', '@nuxtjs/mdc'],
  fonts: {
    provider: 'bunny'
  },
  echarts: {
    charts: ["BarChart", "BoxplotChart", "LineChart", "PieChart","RadarChart"],
    components: [
      "TitleComponent",
      "GridComponent",
      "TooltipComponent",
      "LegendComponent",
      "DataZoomComponent",
      "GraphicComponent"
    ],
    renderer: "canvas",
  },
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