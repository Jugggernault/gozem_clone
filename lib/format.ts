// "1 500 FCFA" with a narrow no-break space (U+202F) as thousands separator.
export const formatFCFA = (n: number) =>
  `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
