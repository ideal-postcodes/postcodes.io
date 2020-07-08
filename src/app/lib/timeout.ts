"use strict";
/**
 * Creates a timeout object which updates itself to "timedOut = true" after interval
 * @params {number} -  Timeout interval. Interval of 0 will not trigger timeout
 * @returns {Object}
 */

export interface Timer {
  id?: number;
  timedOut: boolean;
}

export const startTimer = (interval: number): Timer => {
  const timer: Timer = { timedOut: false };
  if (interval === 0) return timer;
  timer.id = <any>setTimeout(() => (timer.timedOut = true), interval);
  return timer;
};
