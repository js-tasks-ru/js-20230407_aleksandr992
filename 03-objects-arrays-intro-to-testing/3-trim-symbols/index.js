/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */

export function trimSymbols(string, size) {
  if (size === 0) {
    return '';
  }
  if (typeof size === 'undefined') {
    return string;
  }
  let repeats = 0;
  const symbols = string.split('');
  const trimmedSymbols = symbols.filter((symbol, index) => {
    if (symbol === symbols[index - 1]) {
      repeats++;
      return repeats < size;
    } else {
      repeats = 0;
      return true;
    }
  });
  return trimmedSymbols.join('');
}
