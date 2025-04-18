/**
 * Breaks array into n sized chunks
 */
export const chunk = <T = unknown>(a: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < a.length; i += size) {
    result.push(a.slice(i, i + size));
  }
  return result;
};
