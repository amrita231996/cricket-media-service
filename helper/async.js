const asyncFunctions = {};
asyncFunctions.asyncSeries = (promiseArray) => {
  try {
    const promiseArrayResults = [];
    for (let index = 0; index < promiseArray.length; index += 1) {
      const element = promiseArray[index];
      promiseArrayResults.push(...element);
    }
    return promiseArrayResults;
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = asyncFunctions;
