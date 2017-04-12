module.exports = {
  // image verification
  image_check: function (filename) {
    return (path.extname(filename) === '.jpg'
         || path.extname(filename) === '.jpeg'
         || path.extname(filename) === '.png'
         || path.extname(filename) === '.gif' );
  },

  // this .sort callback targets alphabetical strings
  // and works for a two-dimensional array because of the [0]
  // http://blog.hao909.com/sorting-a-two-dimensional-array-in-javascript/
  two_dSort: function (a,b) {
    var A = a[0],
        B = b[0].toLowerCase();

    A = A.toLowerCase();
    B = B.toLowerCase();
    if (A < B) return -1;
    if (A > B) return 1;
    return 0;
  }
};
