export const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-indexed month
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};
