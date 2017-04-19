// beta

module.exports = {

  hideImage(id) {
    window.socket.emit('c-e:  hide_image', id);
  }

};
