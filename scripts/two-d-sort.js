// http://blog.hao909.com/sorting-a-two-dimensional-array-in-javascript/
module.exports = function (a,b) {
  var A = a[0],
      B = b[0].toLowerCase();

  A = A.toLowerCase();
  B = B.toLowerCase();
  if (A < B) return -1;
  if (A > B) return 1;
  return 0;
};
