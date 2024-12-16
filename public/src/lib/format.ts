export const capitalizeFirstLetter = (str: string | undefined): string => {
  if (str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return "";
};

export const formatPrice = (
  price: number | string | undefined | null
): string => {
  if (price !== null || price !== undefined) {
    return Number(price).toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });
  }
  return "";
};

export const formatEstimation = (estimation: string): string => {
  estimation = estimation.toLowerCase();
  estimation = estimation.replace(/hari/g, "").trim();

  if (estimation.includes("-")) {
    const [startStr, endStr] = estimation.split("-").map((s) => s.trim());
    const start = parseInt(startStr);
    const end = parseInt(endStr);

    if (start === 0 && end === 0) {
      return "hari ini";
    }
    if (start === 0 && end === 1) {
      return "hari ini - besok";
    }
    if (start === 1 && end === 2) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return `besok - ${tomorrow.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      })}`;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + start);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + end);

    return `${startDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    })} - ${endDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    })}`;
  }

  const days = parseInt(estimation);
  if (days === 0) {
    return "hari ini";
  }
  if (days === 1) {
    return "besok";
  }

  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
};
