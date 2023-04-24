/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */

export function createGetter(path) {
  return function(obj) {
    const searchLevels = path.split('.');
    let jar = obj;
    for (let searchLevel in searchLevels) {
      if (typeof jar[searchLevels[searchLevel]] === 'undefined') {
        jar = undefined;
        break;
      }
      jar = jar[searchLevels[searchLevel]];
    }
    return jar;
  };
}
