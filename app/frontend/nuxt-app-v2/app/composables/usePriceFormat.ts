export const usePriceFormat = () => {
  const formatPrice = (price?: number | null): string => {
    if (price == null) {
      return "Цена не указана"
    }

    return `${new Intl.NumberFormat("ru-RU").format(price)} ₽`
  }

  return {
    formatPrice,
  }
}