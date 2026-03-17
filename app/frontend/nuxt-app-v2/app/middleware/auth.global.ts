export default defineNuxtRouteMiddleware(async (to) => {
  const { initAuth, isAuthenticated } = useAuth()
  if (to.path === '/login') return
  // Инициализируем авторизацию (пытаемся обновить токен)
  await initAuth()

  const publicPages = ['/', '/login', '/register','/forgot-password','/reset-password']

  // Если авторизован → нельзя на /login и /register
  if (isAuthenticated.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/offers')
  }

  // Если НЕ авторизован → пустим только на publicPages
  if (!isAuthenticated.value && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }
})