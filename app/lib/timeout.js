"use strict";

/**
 * Creates a timeout object which updates itself to "timedOut = true" after interval
 * @params {number} -  Timeout interval. Interval of 0 will not trigger timeout
 * @returns {Object}
 */
exports.startTimer = interval => {
  const timer = { timedOut: false };
  if (interval === 0) return timer;
  timer.id = setTimeout(() => timer.timedOut = true, interval);
  return timer;
};

