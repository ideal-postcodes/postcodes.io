module.exports = (filterQuery) => {
  const filterAsSet = new Set (filterQuery.replace(/\s/g, '').toLowerCase().split(","));

  const filterFunc = (jsonResultObj) => {
    jsonResultObj = Object.keys(jsonResultObj).reduce((acc,curr) => {
      if (filterAsSet.has(curr)) acc[curr] = jsonResultObj[curr];
      return acc;
    } , {});
    return jsonResultObj;
  }
  return filterFunc;
}
