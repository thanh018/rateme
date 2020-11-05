const _ = require('underscore');

const arrayAverage = arr => {
  if (!arr.length ) return 0;
  const total = _.reduce(arr, (a, b) => a + b, 0);
  const avg = total / arr.length;
  const tenths = avg - Math.floor(avg); // that after Decimal point (0.25 in 5.25)
  if (tenths >= 0.75) return Math.floor(avg) + 1;
  if (tenths > 0.25 && tenths < 0.75) return Math.floor(avg) + 0.5;
  return Math.floor(avg);
};

module.exports = { arrayAverage };
