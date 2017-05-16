// beta

module.exports = {

  hideImage(id) {
    window.socket.emit('ce:_hideImage', id);
  }

};
