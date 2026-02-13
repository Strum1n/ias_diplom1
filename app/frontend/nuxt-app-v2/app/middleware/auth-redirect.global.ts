export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()

  // Страницы, доступные без авторизации
  const publicPages = ['/', '/login', '/register']

  // Если авторизован → нельзя на /login и /register
  if (isAuthenticated.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/offers')
  }

  // Если НЕ авторизован → пустим только на publicPages
  if (!isAuthenticated.value && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }
})
