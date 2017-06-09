module.exports = function (filename) {
  return (path.extname(filename) === '.jpg'
       || path.extname(filename) === '.jpeg'
       || path.extname(filename) === '.png'
       || path.extname(filename) === '.gif' );
};
