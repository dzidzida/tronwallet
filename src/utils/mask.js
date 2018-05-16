import currencyFormatter from 'currency-formatter'

export function maskPrice(value, isNegative) {
  if (value) {
    let price = (`${value}`).replace(/[^\d]/g, '');
    if (price.length > 6) price = `${price.substring(0, 6)}`;
    if (isNegative) price = '-'.concat(price);
    return currencyFormatter
      .format((Number(price) / 100).toFixed(2),
        { code: 'USD', symbol: '' })
      .trim();
  }
  return '';
}