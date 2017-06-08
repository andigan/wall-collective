export default function () {
  let xhr = new XMLHttpRequest ();

  xhr.open('GET', '/resetpage');
  xhr.send(null);

  window.socket.emit('ce:_saveBackground', '#000000');

  xhr.onreadystatechange = function () {
    // readyState 4: request is done.
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // send socket to reset other pages
        window.socket.emit('ce:_resetPage');
        // reload the page
        window.location.assign([location.protocol, '//', location.host, location.pathname].join(''));
      } else {
        console.log('Error: ' + xhr.status);
      };
    }
  };
}
