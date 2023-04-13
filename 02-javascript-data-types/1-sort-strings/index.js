/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param) {

  const sortedArray = arr.slice(0).sort((a, b) =>
    a.localeCompare(b, 'ru-RU-u-kf-upper', { sensitivity: 'case' }));

  if (param === 'desc') {
    return sortedArray.reverse();
  }
  return sortedArray;
}
