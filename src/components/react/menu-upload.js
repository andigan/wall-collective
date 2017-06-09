import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import NavButtons from './nav-buttons';
import Buttons from '../../_config/config-buttons';
import findElement from './scripts/find-element';

import { IgramClick } from '../../_i-gram/button-actions';
import { closeNav } from '../../actions';

class UploadMenu extends Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.buttons = Buttons.add;
  }

  componentDidMount() {
    // move form to component; change width of input
    let fromDeviceButton = findElement('add-from-device');

    document.getElementById('fileselect').style.width = fromDeviceButton.style.width;
    fromDeviceButton.appendChild(document.getElementById('upload-form'));
  }

  componentWillUnmount() {
    // move form back to DOM
    document.getElementById('upload-form-holder').appendChild(document.getElementById('upload-form'));
  }

  handleClick(action) {
    switch (action) {
      case 'add-from-device':
        // handled by fileselect's event listener
        break;
      case 'add-from-igram':
        IgramClick();
        this.props.closeNav();
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className='nav-react-wrapper'>
        <NavButtons buttons={this.buttons} handleClick={this.handleClick} />
      </div>
    );
  }
}

function mapDispatchtoProps(dispatch) {
  return bindActionCreators( { closeNav }, dispatch);
}

export default connect (null, mapDispatchtoProps)(UploadMenu);
