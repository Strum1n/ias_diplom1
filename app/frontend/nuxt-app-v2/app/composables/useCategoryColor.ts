
export type CategoryColor = "success" | "warning" | "error" | "gray"| "info"

export const useCategoryColor = () => {
  const getCategoryColor = (
    category?: string
  ): CategoryColor => {
    switch (category) {
      case "high":
        return "success"
      case "medium":
        return "warning"
      case "low":
        return "error"
      case "cheap":
        return "success"
      case "normal":
        return "info"
      case "expensive":
        return "error"
      default:
        return "gray"
    }
  }

  return {
    getCategoryColor,
  }
}