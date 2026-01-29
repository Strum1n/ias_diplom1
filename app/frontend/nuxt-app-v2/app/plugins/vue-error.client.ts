export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    console.error('🔥 Vue error:', err)
    console.error('📍 Info:', info)
    console.error('🧩 Component:', instance)
  }
})