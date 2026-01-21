export type Category = "high" | "medium" | "low" | "cheap" |"expensive" | "normal"

export const useCategoryLabel = () => {
  const getCategoryLabel = (
    category?: string | null
  ): string => {
    switch (category) {
      case "high":
        return "Высокая"
      case "normal":
        return "Средняя"
      case "low":
        return "Низкая"
      case "cheap":
        return "Ниже рынка"
      case "normal":
        return "Рыночная цена"
      case "expensive":
        return "Выше рынка"
      default:
        return ""
    }
  }

  return {
    getCategoryLabel,
  }
}
