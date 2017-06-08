export function igramInit() {

  // set igram-container's height
  document.getElementById('igram-container').style.height = (window.innerHeight) + 'px';
  document.getElementById('igram-images-container').style.height = (window.innerHeight * 0.8) + 'px';
  document.getElementById('igram-images-container').style.top = (window.innerHeight * 0.1) + 'px';
  document.getElementById('igram-header').style.height = (window.innerHeight * 0.07) + 'px';
  document.getElementById('igram-opacity-mask').style.height = (window.innerHeight * 0.8) + 'px';
  document.getElementById('igram-opacity-mask').style.top = (window.innerHeight * 0.1) + 'px';


  // igram-#6: On page load, if query includes ?open_igram (added by igram middleware),
  // fetch igram data and open the divs
  if (window.location.href.includes('open_igram')) {
    window.socket.emit('ce:_fetchIgramData'); // (-#7)

    document.getElementById('igram-header').style.display = 'flex';
    document.getElementById('igram-container').style.display = 'block';
    document.body.classList.add('a-nav-container-is-open');

    // animate open hamburgers
    document.getElementById('ham-line1').style.top = '35%';
    document.getElementById('ham-line3').style.top = '65%';

    // remove query string from url
    // window.history.pushState('object or string', 'Title', '/' + window.location.href.substring(window.location.href.lastIndexOf('/') + 1).split('?')[0]);
  };
}
