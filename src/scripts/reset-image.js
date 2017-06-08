import { setDraggerLocations } from '../components/draggers';
import { highestZ, shiftZsAboveXDown, zReport, initializeImage } from '../components/images';

export default function () {

      let imageID = window.store.getState().selectedImage.id;

      if (imageID !== '') {
        let imageEl = document.getElementById(imageID),
            topZ = highestZ(),
            socketdata;

        // change zIndexes
        if (parseInt(imageEl.style.zIndex) < topZ) {
          shiftZsAboveXDown(imageEl.style.zIndex);
          imageEl.style.zIndex = topZ;
          window.socket.emit('ce:_changeZs', zReport());
        };

        initializeImage(imageEl);

        socketdata = {
          imageID: imageID,
          filename: imageEl.title
        };

        setDraggerLocations(imageID);

        window.socket.emit('ce:_resetImageAll', socketdata);
      }
};
