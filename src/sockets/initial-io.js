import { getCookie } from '../helpers';
import { setCookie } from '../helpers';

import { setSessionID } from '../actions';


export default function (socket) {
  // on initial connect, retrieve sessionID cookie and send results to server
  socket.on('connect', function () {
    socket.emit ('ce:_sendSessionID', { sessionID: getCookie('sessionID')});
  });

  // initial set up for all visits.
  socket.on('connect:_setClientVars', function (clientVars) {

    // assign sessionID.  used by upload_counter and user_count
    // the server sends a unique id or the previous id from the cookie
    window.store.dispatch(setSessionID(clientVars.sessionID));

    // set background color
    document.getElementById('wrapper').style.backgroundColor = clientVars.backgroundColor;

    // set or reset sessionID cookie
    setCookie('sessionID', clientVars.sessionID, 7);

    // hack: Problem:  busboy stream received the file stream before the sessionID
    //                 which was passed as a data value in the xml submit
    //       Solution: change the HTML 'name' attribute of the form's input to the sessionID
    //                 which always arrives concurrently
    document.getElementById('fileselect').setAttribute('name', clientVars.sessionID);
  });
};
