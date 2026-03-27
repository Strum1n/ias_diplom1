export default defineNuxtPlugin(async () => {

    const config = useRuntimeConfig()
    let baseURL = process.server
    ? 'http://backend:8000' : '/apiback/'
    baseURL = config.public.isDev? 'http://localhost:8000': baseURL
    // console.log(baseURL)
    // console.log(config.public.isDev)
  const api = $fetch.create({
    baseURL: baseURL,
    credentials: 'include',

    async onRequest({ options, event }) {
      const token = useState('access_token', event).value

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