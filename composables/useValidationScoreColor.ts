import { useTheme } from 'vuetify'

export const useValidationScoreColor = () => {
  const theme = useTheme()

  const selectValidationColor = (validationScore: number) => {
    if (validationScore === null) {
      return '#BAC7CB'
    } else {
      switch (true) {
        case validationScore >= 0 && validationScore < 10:
          return theme.current.value.colors.error
        case validationScore >= 10 && validationScore < 95:
          return theme.current.value.colors.warning
        case validationScore >= 95 && validationScore <= 100:
          return theme.current.value.colors.rewardVeryHigh
        default:
          return '#BAC7CB'
      }
    }
  }
  return { selectValidationColor }
}
