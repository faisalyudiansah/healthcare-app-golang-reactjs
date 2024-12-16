export const toIDRFormattedShort = (amount: number): string => {
  const idrFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'IDR',
  });

  const formatted = idrFormatter.format(amount);
  return formatted.substring(0, formatted.length - 3);
};

export const toRpFormattedShort = (amount: number): string => {
  return toIDRFormattedShort(amount)
    .replaceAll('IDR', 'Rp')
    .replaceAll(',', '.');
};
