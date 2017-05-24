export function igramInit() {

  // set insta-container's height
  document.getElementById('insta-container').style.height = (window.innerHeight) + 'px';
  document.getElementById('insta-images-container').style.height = (window.innerHeight * 0.8) + 'px';
  document.getElementById('insta-images-container').style.top = (window.innerHeight * 0.1) + 'px';
  document.getElementById('insta-header').style.height = (window.innerHeight * 0.07) + 'px';
  document.getElementById('background-opacity').style.height = (window.innerHeight * 0.8) + 'px';
  document.getElementById('background-opacity').style.top = (window.innerHeight * 0.1) + 'px';


  // igram-#6: On page load, if query includes ?open_igram (added by igram middleware),
  // fetch igram data and open the divs
  if (window.location.href.includes('open_igram')) {
    window.socket.emit('ce:_fetchIgramData'); // (-#7)

    document.getElementById('insta-header').style.display = 'flex';
    document.getElementById('insta-container').style.display = 'block';
    document.body.classList.add('a-nav-container-is-open');

    // animate open hamburgers
    document.getElementById('ham-line1').style.top = '35%';
    document.getElementById('ham-line3').style.top = '65%';

    // possible fix: remove query string from url
    //   history.replaceState({}, 'wall-collective', '/');
    // };
  };
}
