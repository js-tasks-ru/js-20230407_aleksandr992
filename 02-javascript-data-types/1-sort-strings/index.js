/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {

  const directions = {
    asc: 1,
    desc: -1,
  };

  const direction = directions[param];

  if (!direction) {
    throw new Error(`Wrong param: ${param}`);
  }

  return arr.slice(0).sort((a, b) =>
    direction * a.localeCompare(b, 'ru-RU-u-kf-upper', { sensitivity: 'case' }));
}
