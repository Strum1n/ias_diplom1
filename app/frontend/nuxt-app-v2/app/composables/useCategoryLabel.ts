export type Category = "high" | "medium" | "low" | "cheap" |"expensive" | "normal"

export const useCategoryLabel = () => {
  const getCategoryLabel = (
    category?: string | null
  ): string => {
    switch (category) {
      case "high":
        return "Высокий"
      case "medium":
        return "Средний"
      case "low":
        return "Низкий"
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
