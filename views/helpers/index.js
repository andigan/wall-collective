
// doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/
module.exports = {
  equal: function (x, y, options) {
    if ( x !== y ) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    };
  }
};
