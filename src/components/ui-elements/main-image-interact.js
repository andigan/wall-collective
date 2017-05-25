// --Interact.gesturable, for touchscreen rotating and scaling
import stateChange from '../../views/state-change';

export function assignImageInteract() {
  interact('.wallPic').gesturable({
    onstart: function (event) {
      this.imageID = event.target.getAttribute('id');
      this.imageEl = event.target;

      stateChange.hideDraggers();

      // retrieve original angle and scale
      this.angle = parseFloat(this.imageEl.getAttribute('data-angle'));
      this.scale = parseFloat(this.imageEl.getAttribute('data-scale'));

      // pass id to ce:_lockID
      window.socket.emit('ce:_lockID', this.imageID);

      // prepare socketdata
      this.socketdata = {};
      this.socketdata.imageID = this.imageID;
      this.socketdata.filename = this.imageEl.getAttribute('title');
    },
    onmove: function (event) {
      // retrieve scale and angle from event object
      // event.ds is scale difference; event.da is the angle difference
      this.scale = this.scale * (1 + event.ds);
      this.angle += event.da;

      // modify element with new transform
      this.imageEl.style.transform = this.imageEl.style.transform.replace(/rotate\(.*?\)/, 'rotate(' + this.angle + 'deg)');
      this.imageEl.style.transform = this.imageEl.style.transform.replace(/scale\(.*?\)/ , 'scale(' + this.scale + ')');

      // send socketdata
      this.socketdata.transform = this.imageEl.style.transform;
      socket.emit('ce:_transforming', this.socketdata);
    },
    onend: function (event) {
      // if angle is < 0 or > 360, revise the angle to 0-360 range
      if (this.angle < 0) {
        this.angle = (360 + this.angle);
        this.imageEl.style.transform = this.imageEl.style.transform.replace(/rotate\(.*?\)/, 'rotate(' + this.angle + 'deg)');
      };
      if (this.angle > 360) {
        this.angle = (this.angle - 360);
        this.imageEl.style.transform = this.imageEl.style.transform.replace(/rotate\(.*?\)/, 'rotate(' + this.angle + 'deg)');
      };

      // send socketdata
      this.socketdata.scale = this.scale.toFixed(2);
      this.socketdata.angle = this.angle.toFixed(2);
      this.socketdata.rotateX = this.imageEl.getAttribute('data-rotateX');
      this.socketdata.rotateY = this.imageEl.getAttribute('data-rotateY');
      this.socketdata.rotateZ = this.imageEl.getAttribute('data-rotateZ');

      socket.emit('ce:_saveDataAttributes', this.socketdata);
      this.socketdata.transform = this.imageEl.style.transform;
      socket.emit('ce:_saveTransform', this.socketdata);

      // pass id to ce:_unlockID
      socket.emit('ce:_unlockID', this.imageID);

      // put new scale and angle into data-scale and data-angle
      event.target.setAttribute('data-scale', this.scale.toFixed(2));
      event.target.setAttribute('data-angle', this.angle.toFixed(2));
    }
  });

}
