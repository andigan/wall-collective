import config from '../_config/config';

export default function () {
  let jscolorEl,
      chooserPos = config.chooserPos,
      wrapperEl = document.getElementById('wrapper');

  // fires rapidly when dragging on palette box
  window.jScOlOrUpdate = function (jscolor) {
    wrapperEl.style.backgroundColor = `#${jscolor}`;
    window.socket.emit('ce:_changeBackground', `#${jscolor}`);
  }.bind(this);

  // fires on mouseup
  window.jScOlOrChoice = function (jscolor) {
    window.socket.emit('ce:_saveBackground', `#${jscolor}`);
  };

  jscolorEl = document.createElement('input');
  jscolorEl.id = 'color-chooser';
  jscolorEl.classList.add('jscolor');

  jscolorEl.style.display = 'none';
  jscolorEl.style.position = 'fixed';
  jscolorEl.style.width = '1px';
  jscolorEl.style.height = '1px';
  jscolorEl.style.opacity = '0';

  jscolorEl.setAttribute('data-jscolor', `{position: 'top', mode:'HVS', width:${chooserPos.width}, height:${chooserPos.height}, padding:0, shadow:false, borderWidth:0, backgroundColor:'transparent', insetColor:'#000', onFineChange: 'window.jScOlOrUpdate(this)'}`);
  jscolorEl.setAttribute('onchange', 'window.jScOlOrChoice(this.jscolor)');

  wrapperEl.appendChild(jscolorEl);
};
