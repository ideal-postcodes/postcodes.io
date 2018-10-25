"use strict";

const emptyRe = /^[\s\xa0]*$/;

/**
 * Returns true if string is empty 
 * @param {string} str - String to be tested
 * @returns {boolean}
 */
const isEmpty = str => {
  if (str === null) return true;
  if (str === undefined) return true;
  return emptyRe.test(str);
};

module.exports = { isEmpty };

