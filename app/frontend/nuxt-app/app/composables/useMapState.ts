export const useMapState = () => {
  return useState<{
    center: number[] | undefined
    zoom: number | undefined
    offerId: number | undefined
  }>('mapState', () => ({
    center: undefined,
    zoom: 20,
    offerId: undefined
  }))
}