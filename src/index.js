// wall-collective
//
// Version: 0.7.0
// Requires: jQuery v1.7+
//           jquery-ui
//           jquery.mobile-events
//           jquery.ui.touch-punch
//           socket.io v1.3.7+
//           interact.js
//
// Copyright (c) 2018 Andrew Nease (andrew.nease.code@gmail.com)

import config from './_config/config';

// css for webpack
import styles from './assets/stylesheets/main.scss';

// redux store
import configureStore from './_config/config-store';
const store = configureStore();

// components
import Page from './components/page';
import { createDraggers } from './components/draggers';
import { buttonsInit } from './components/buttons';
import { navToggleInit } from './components/ui-elements/nav-toggle-button';
import { uploadInit } from './components/upload';

// main drag
import { assignImageDrag } from './components/ui-elements/main-image-drag';

// Interact.js
import { assignImageInteract } from './components/ui-elements/main-image-interact';

// draggers
import { draggersInit } from './components/draggers';
import { dSwitchsInit } from './components/d-switchs';

// sockets
import { IOInit } from './sockets/io';

// react
import React from 'react'; // required
import ReactDOM from 'react-dom';
import { Provider }  from 'react-redux';

import NavContainer from './components/react/nav-container';


// OPTIONAL Igram
import { igramInit } from './_i-gram/init';
import { igramIOInit } from './_i-gram/igram-io';
import igramStyle from './_i-gram/igram-styles.scss';

// OPTIONAL debug
import debug from './_debug/debug';
import debugStyle from './_debug/debug.scss';

// Experimental
import { textboxInit } from './components/ui-elements/textbox.js';

document.getElementById('nav-tog-button').dispatchEvent(new Event ('click'));


window.store = store;
window.socket = IOInit();

// i-gram conditional
if (useIGram) {
  config.useIGram = useIGram; // instagram switch; arriving from server response
  igramInit();
  igramIOInit(window.socket);
};

// debug conditional
if (config.debugOn) debug.init(store);

ReactDOM.render(
  <Provider store={store}>
    <NavContainer />
  </Provider>, document.getElementById('nav'));
createDraggers();
Page.init(); // set page sizes and resize listeners
buttonsInit(); // create buttons and assign functionality
navToggleInit(); // make nav-toggle-button draggable
draggersInit(); // set up draggers functionality
dSwitchsInit(); // set up dragger switches
textboxInit();
uploadInit();

assignImageDrag(); // assign draggable to all .wallPic elements
assignImageInteract(); // assign Interact.js to .wallPic elements
