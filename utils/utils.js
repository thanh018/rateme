const _ = require('underscore');

const arrayAverage = arr => {
  const avg =
    _.reduce(
      arr,
      (num1, num2) => {
        return num1 + num2;
      },
      0,
    ) / (arr.length === 0 ? 1 : arr.length);
  if (avg === 0) return 0;
  const toil = avg - Math.floor(avg);
  if (toil >= 0.75) return Math.floor(avg) + 1;
  if (toil < 0.75 && toil > 0.25) return Math.floor(avg) + 0.5;
  return Math.floor(avg);
};

module.exports = { arrayAverage };
