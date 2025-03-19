export const getOrdinalSuffix = (num: number): string => {
    const suffixes: string[] = ["th", "st", "nd", "rd"];
    const remainder = num % 100;
  
    if (remainder >= 11 && remainder <= 13) {
      return `${num}th`;
    }
  
    const lastDigit = num % 10;
    return `${num}${suffixes[lastDigit] || "th"}`;
  }