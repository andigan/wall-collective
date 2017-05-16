// beta

module.exports = {

  hideImage(id) {
    window.socket.emit('ce:  hide_image', id);
  }

};
