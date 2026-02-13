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

  const accessToken = useCookie<string | null>('access_token', {
    path: '/',
    sameSite: 'lax'
  })

  const loading = ref(false)
  const error = ref<string | null>(null)

  const isTokenExpired = (token: string | null) => {
    if (!token) return true
    try {
      const { exp } = jwtDecode<JwtPayload>(token)
      return Date.now() >= exp * 1000
    } catch {
      return true
    }
  }

  const isAuthenticated = computed(() => {
    return !!accessToken.value && !isTokenExpired(accessToken.value)
  })

  const setAccessToken = (token: string | null) => {
    accessToken.value = token
  }
  const config = useRuntimeConfig()
  const handleLogin = async (username: string, password: string) => {
    error.value = null
    loading.value = true

    try {
      const body = new URLSearchParams()
      body.append('username', username)
      body.append('password', password)
      const base = config.apiBase;
      const res: LoginResponse = await $fetch(`http://localhost:8000/auth/login`, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include', // сохраняем куки
      })

      setAccessToken(res.access_token)

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

  const logout = () => {
    accessToken.value = null
    router.push('/')
  }

  return {
    handleLogin,
    logout,
    isAuthenticated,
    loading,
    error,
    accessToken,
    setAccessToken
  }
}