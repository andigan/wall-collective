module.exports = {

  clickme: function (id, time) {
    setTimeout(function () {
      document.getElementById(id).dispatchEvent(new Event ('click'));
    }, time);
  }

};
