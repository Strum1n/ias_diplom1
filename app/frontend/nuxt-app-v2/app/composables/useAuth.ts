import { jwtDecode } from 'jwt-decode'

interface LoginResponse {
  access_token: string
  token_type?: string
}

interface JwtPayload {
  exp: number
  sub: string
}

export function useAuth() {
  const router = useRouter()
  const config = useRuntimeConfig()

  const accessToken = useState<string | null>('access_token', () => null)

  const loading = ref(false)
  const error = ref<string | null>(null)

  let refreshInterval: ReturnType<typeof setInterval> | null = null

  const isTokenExpired = (token: string | null) => {
    if (!token) return true
    try {
      const { exp } = jwtDecode<JwtPayload>(token)
      return Date.now() >= exp * 1000
    } catch {
      return true
    }
  }

  const getTokenExpiry = (token: string | null) => {
    if (!token) return 0
    try {
      const { exp } = jwtDecode<JwtPayload>(token)
      return exp * 1000
    } catch {
      return 0
    }
  }

  const isAuthenticated = computed(() => {
    return !!accessToken.value && !isTokenExpired(accessToken.value)
  })

  const setAccessToken = (token: string | null) => {
    accessToken.value = token
  }
  const runtimeConfig = useRuntimeConfig()
  // ---------------------------
  // Refresh access token
  // ---------------------------
  const refreshAccessToken = async () => {
    try {
      const res = await $fetch(`${runtimeConfig.public.apiBase}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      })
      setAccessToken(res.access_token)
      return res.access_token
    } catch (err) {
      logout()
      throw err
    }
  }

  // ---------------------------
  // Login
  // ---------------------------
  const handleLogin = async (username: string, password: string) => {
    error.value = null
    loading.value = true

    try {
      const body = new URLSearchParams()
      body.append('username', username)
      body.append('password', password)

      const res: LoginResponse = await $fetch(`${runtimeConfig.public.apiBase}/auth/login`, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
      })

      setAccessToken(res.access_token)
      startAutoRefresh()
      console.log('✅ Login успешен')
      await router.push('/offers')
    } catch (err: any) {
      console.error(err)
      if (!err.response) {
        error.value = 'Нет соединения с сервером'
      } else if (err.response.status === 401) {
        error.value = 'Неверный логин или пароль'
      } else {
        error.value = 'Ошибка сервера'
      }
    } finally {
      loading.value = false
    }
  }

  // ---------------------------
  // Logout
  // ---------------------------
  const logout = async () => {
    try {
      await $fetch(`${runtimeConfig.public.apiBase}/auth/logout`, { method: 'POST', credentials: 'include' })
    } catch (err) {
      console.warn('Ошибка при logout', err)
    } finally {
      accessToken.value = null
      stopAutoRefresh()
      router.push('/')
    }
  }

  // ---------------------------
  // Автообновление токена
  // ---------------------------
  const startAutoRefresh = () => {
    stopAutoRefresh() // на всякий случай
    refreshInterval = setInterval(async () => {
      if (!accessToken.value) return

      const expiry = getTokenExpiry(accessToken.value)
      const now = Date.now()
      const timeLeft = expiry - now

      // если осталось меньше 1 минуты — обновляем
      if (timeLeft < 60 * 1000) {
        try {
          await refreshAccessToken()
        } catch {
          // если не удалось — logout произойдёт внутри refreshAccessToken
        }
      }
    }, 30 * 1000) // проверяем каждые 30 секунд
  }

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
      refreshInterval = null
    }
  }

  return {
    handleLogin,
    logout,
    isAuthenticated,
    loading,
    error,
    accessToken,
    setAccessToken,
    refreshAccessToken,
    startAutoRefresh,
    stopAutoRefresh
  }
}