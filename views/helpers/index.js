module.exports = {
  // doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/
  equal: function (x, y, options) {
    if ( x !== y ) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    };
  },
  // http://stackoverflow.com/questions/11924452/iterating-over-basic-for-loop-using-handlebars-js
  times: function (number, block) {
    var accum = 1,
        i;

    for (i = 0; i < number; ++i)
      accum += block.fn(i);
    return accum;
  },
  repeat: function (times, opts) {
    var out = "";
    var i;
    var data = {};

    if ( times ) {
        for ( i = 1; i < times + 1; i += 1 ) {
            data.index = i;
            out += opts.fn(this, {
                data: data
            });
        }
    } else {

        out = opts.inverse(this);
    }

    return out;
  }
};
