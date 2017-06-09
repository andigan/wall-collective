export function igramInit() {

  // igram-#6: On page load, if query includes ?open_igram (added by igram middleware),
  // fetch igram data and open the divs
  if (window.location.href.includes('open_igram')) {
    window.socket.emit('ce:_fetchIgramData'); // (-#7)

    document.getElementById('igram-header').style.display = 'flex';
    document.getElementById('igram-container').style.display = 'block';

    // animate open hamburgers
    document.getElementById('ham-line1').style.top = '35%';
    document.getElementById('ham-line3').style.top = '65%';

    // remove query string from url
    window.history.pushState('object or string', 'Title', '/' + window.location.href.substring(window.location.href.lastIndexOf('/') + 1).split('?')[0]);
  };
}
