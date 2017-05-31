import config from '../_config/config';
import stateChange from '../views/state-change';

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
        document.getElementById('upload-image-preview').src = event.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    };
  }

  // confirm upload button
  // on click, send a submit to the html form with id='upload-form-button'
  // the html form with id='upload-form-button' posts to '/addfile'
  // and is parsed by busboy
  document.getElementById('button-confirm-upload').onclick = function () {
    let request = new XMLHttpRequest,
        form = document.getElementById('upload-form-button'),
        data,
        inputField = document.createElement('input');

    // send file size as fieldna,e
    inputField.setAttribute('name', 'filesize');
    inputField.value = document.getElementById('fileselect').files[0].size;
    inputField.style.display = 'none';

    form.appendChild(inputField);

    data = new FormData(form);

    request.open(form.method, form.action);
    request.send(data);

    document.getElementById('upload-confirm-container').style.display = 'none';

    request.onreadystatechange = function () {
      // readyState 4: request is done.
      if (request.readyState === 4) {
        if (request.status === 200) {
          let response;

          if (request.response) {
            response = JSON.parse(request.response);
            console.log(response.error);
          };

          stateChange.afterUpload();

          config.uploadTotal = 0;

        } else {
          console.log('Error:' + request.status);
          // change nav-main-container and remove upload_preview
          stateChange.afterUpload();
          config.uploadTotal = 0;
        };
      }
    };
  };
}
