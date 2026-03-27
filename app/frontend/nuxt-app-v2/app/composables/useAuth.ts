export function useAuth() {
  const router = useRouter()
  const config = useRuntimeConfig()

  const accessToken = useState<string | null>('access_token', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = computed(() => !!accessToken.value)

  let initPromise: Promise<void> | null = null

  async function refresh() {
    console.log('Обновляем токен')
    try {
      const refreshToken = useCookie('refresh_token')
      const headers: Record<string, string> = {}

      if (refreshToken.value) {
        headers.Cookie = `refresh_token=${refreshToken.value}`
      }
      console.log('url: ',`${config.apiBase}/auth/refresh-token`)
      const res = await $fetch<{ access_token: string }>(
        `${config.apiBase}/auth/refresh-token`,
        {
          method: 'POST',
          headers,
          credentials: 'include' 
        }
      )
      console.log('Успешно обновили токен')
      accessToken.value = res.access_token
      console.log('acces_token:', accessToken.value)
      return res.access_token
    } catch (error) {
      console.error('Ошибка обновления токена:', error)
      accessToken.value = null
      return null
    }
  }

  async function login(username: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const body = new URLSearchParams({ username, password })

      const res = await $fetch(`${config.public.apiBase}/auth/login`, {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include'
      })

      accessToken.value = res.access_token
      await router.push('/offers')
    } catch (err: any) {
      if (err?.response?.status === 401) {
        error.value = 'Неверный логин или пароль'
      } else {
        error.value = 'Ошибка сервера'
      }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await $fetch(`${config.public.apiBase}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } finally {
      accessToken.value = null
      router.push('/login')
    }
  }

  async function initAuth() {
    if (accessToken.value) return

    if (!initPromise) {
      initPromise = (async () => {
        const token = await refresh()
        accessToken.value = token || null
      })()
    }

    await initPromise
  }

  return {
    accessToken,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    refresh,
    initAuth
  }
}