export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const baseURL = process.server
    ? config.apiBase
    : config.public.apiBase
  const api = $fetch.create({
    baseURL: baseURL,
    credentials: 'include',

    async onRequest({ options, event }) {
      const token = useCookie('access_token', event).value

      if (token) {
        options.headers.set('Authorization', `Bearer ${token}`)
      }
    },

    async onResponseError({ response }) {
      if (response.status === 401 && process.client) {
        await navigateTo('/login')
      }
    },
  })

  return {
    provide: { api },
  }
})