export interface Timer {
  id?: number;
  timedOut: boolean;
}

/**
 * Creates a timeout object which updates itself to "timedOut = true" after interval
 */
export const startTimer = (interval: number): Timer => {
  const timer: Timer = { timedOut: false };
  if (interval === 0) return timer;
  timer.id = <any>setTimeout(() => (timer.timedOut = true), interval);
  return timer;
};
