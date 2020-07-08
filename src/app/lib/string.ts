const emptyRe = /^[\s\xa0]*$/;
/**
 * Returns true if string is empty
 */
export const isEmpty = (str: string): boolean => {
  if (str === null) return true;
  if (str === undefined) return true;
  return emptyRe.test(str);
};

export const toString = (value: unknown): string => value.toString();
