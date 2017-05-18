import stateChange from '../views/state-change';
import config from '../_config/config';
import { assignImageDrag } from './ui-elements/main-image-drag';

export function uploadInit() {

  // on file_select element change, load up the image preview
  document.getElementById('fileselect').onchange = function () {
    stateChange.uploadPreview();
    readURL(this);
  };

  // put the image selected by the browser into the upload_preview container.
  // http://stackoverflow.com/questions/18934738/select-and-display-images-using-filereader
  // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
  function readURL(input) {
    let reader;

    if (input.files && input.files[0]) {
      reader = new FileReader();
      reader.onload = function (event) {
        // wait until the image is ready to upload_preview container
        document.getElementById('upload-preview-container').classList.add('upload-preview-container_is_open');
        document.getElementById('image-upload-preview').src = event.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    };
  }

  // confirm upload button
  // on click, send a submit to the html form with id='upload-form-button'
  // the html form with id='upload-form-button' posts to '/addfile'
  document.getElementById('button-confirm-upload').onclick = function (e) {
    let request = new XMLHttpRequest,
        form = document.getElementById('upload-form-button'),
        data = new FormData(form);

    request.open(form.method, form.action);
    request.send(data);

    document.getElementById('upload-confirm-container').style.display = 'none';

    request.onreadystatechange = function () {
      // readyState 4: request is done.
      if (request.readyState === 4) {
        if (request.status === 200) {

          // response JSON from server is the uploaded file information
          let socketdata = {},
              imagesEl = document.getElementById('images'),
              imageEl = document.createElement('img'),
              response = JSON.parse(request.response);

//                  create new image
          imageEl.setAttribute('id', response.dom_id);
          imageEl.setAttribute('title', response.imageFilename);
          imageEl.classList.add('wallPic');
          imageEl.src = response.location + response.imageFilename;
          imageEl.setAttribute('data-scale', '1');
          imageEl.setAttribute('data-angle', '0');
          imageEl.setAttribute('data-rotateX', '0');
          imageEl.setAttribute('data-rotateY', '0');
          imageEl.setAttribute('data-rotateZ', '0');
          imageEl.setAttribute('data-persective', '0');
          imageEl.style.width = config.uploadWidth;
          imageEl.style.height = config.uploadheight;
          imageEl.style.zIndex = response.z_index;
          imageEl.style.top = config.uploadTop;
          imageEl.style.left = config.uploadLeft;
          imageEl.style.opacity = 1;
          imageEl.style.WebkitFilter = 'grayscale(0) blur(0px) invert(0) brightness(1) contrast(1) saturate(1) hue-rotate(0deg)';
          imageEl.style.transform = 'rotate(0deg) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';

          imagesEl.appendChild(imageEl);

          // assign drag to added element
          assignImageDrag(response.dom_id);

          stateChange.afterUpload();

          // emit to other clients
          socketdata.uploadedFilename = response.imageFilename;
          socket.emit('ce:_share_upload', socketdata);

          config.uploadtotal = 0;
        } else {
          console.log('Error:' + request.status);
          // change nav-main-container and remove upload_preview
          stateChange.afterUpload();
          config.uploadtotal = 0;
        };
      }
    };
  };
}
