/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */

export function createGetter(path) {
  return function(obj) {
    const searchLevels = path.split('.');
    let jar = obj;
    for (const searchLevel of searchLevels) {
      if (typeof jar === 'undefined') {
        break;
      }
      jar = jar[searchLevel];
    }
    return jar;
  };
}
