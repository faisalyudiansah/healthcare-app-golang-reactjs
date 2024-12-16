export function validateQuantity(d: number): string | boolean {
  if (!d) {
    return 'Please enter quantity in number';
  }

  return true;
}

export function getNumberFromFormattedString(s: string): number {
  const toNumber = Number(
    s.replaceAll('.', '').replaceAll('Rp', '').replaceAll(' ', ''),
  );
  return toNumber;
}

export function validatePrice(d: string): string | boolean {
  if (!d) {
    return 'Please enter price';
  }

  if (getNumberFromFormattedString(d) <= 1000) {
    return 'TODO: apakah ada minimum price?';
  }

  return true;
}
