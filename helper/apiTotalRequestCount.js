const logger = require('../config/logger');

const dict = {};
const apiTotalRequestCount = {};
apiTotalRequestCount.incrementTotalCountAsPerApiName = (apiName) => {
  const allKeys = Object.keys(dict);
  const isKeyExist = allKeys.includes(apiName);
  let totalCount = 1;
  if (isKeyExist) totalCount = dict[apiName] + 1;
  dict[apiName] = totalCount;
};

apiTotalRequestCount.getTotalCountAsPerApiName = (apiName) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(process.memoryUsage())) {
    logger.saveError(`Memory usage by ${key}, ${value / 1000000}MB `);
  }
  return dict[apiName];
};

apiTotalRequestCount.decrementTotalCountAsPerApiName = (apiName) => {
  const allKeys = Object.keys(dict);
  const isKeyExist = allKeys.includes(apiName);
  let totalCount = 0;
  if (isKeyExist) totalCount = dict[apiName] - 1;
  dict[apiName] = totalCount;
};

module.exports = apiTotalRequestCount;
