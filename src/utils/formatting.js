export function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

export function formatNumber(value, locale) {
  const formatter = new Intl.NumberFormat(locale);
  return formatter.format(value);
}
