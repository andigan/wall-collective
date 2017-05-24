import config from '../_config/config';


export default function (socket) {

  // display the number of connected clients
  socket.on('bc:_changeConnectedClients', function (clients) {
    document.getElementById('connect-info').innerHTML = clients.reduce(function (str, client) {
      return str + `<img id='${client}' src='icons/person-icon.png' class='icon-person' />`;
    }, '');
  });

  // if this client is the uploader, show upload statistics from busboy
  socket.on('bc:_uploadChunkSent', function (uploaddata) {
    if (uploaddata.sessionID === window.store.getState().pageConfig.sessionID && (!!document.getElementById('fileselect').files[0])) {
      config.uploadTotal += uploaddata.chunkSize;
      document.getElementById('upload-confirm-info').textContent = 'Uploaded ' + config.uploadTotal  + ' bytes of ' + document.getElementById('fileselect').files[0].size + ' bytes.';
    };
  });

  socket.on('bc:_changeBackground', function (color) {
    document.getElementById('images').style.backgroundColor = color;
  });

  // reset page across all clients
  socket.on('bc:_resetPage', function () {
    window.location.reload(true);
  });

}
