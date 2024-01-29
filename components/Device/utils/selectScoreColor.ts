export function selectValidationScoreColor(validationScore: number) {
  switch (true) {
    case validationScore >= 0 && validationScore <= 20:
      return '#F6736D'
    case validationScore > 20 && validationScore <= 40:
      return '#EF8B4F'
    case validationScore > 40 && validationScore <= 60:
      return '#F3AD4E'
    case validationScore > 60 && validationScore <= 80:
      return '#E1CA60'
    case validationScore > 80 && validationScore <= 100:
      return '#46D163'
    default:
      return '#BAC7CB'
  }
}
