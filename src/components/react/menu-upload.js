import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Img from 'react-image';

import Buttons from '../../_config/config-buttons';
import changeContainerSize from './scripts/change-container-size';
import findElement from './scripts/find-element';

import { IgramClick } from '../../_i-gram/button-actions';
import { closeNav } from '../../actions';


class UploadMenu extends Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.buttons = Buttons.add;
  }

  componentWillMount() {
    changeContainerSize(this.buttons.length);
  }

  componentDidMount() {
    // move form to component; change width of input
    let fromDeviceButton = findElement('here-from-device');

    document.getElementById('fileselect').style.width = fromDeviceButton.style.width;
    fromDeviceButton.appendChild(document.getElementById('upload-form'));
  }

  componentWillUnmount() {
    // move form back to DOM
    document.getElementById('upload-form-holder').appendChild(document.getElementById('upload-form'));
    document.getElementById('nav-container').style.width = 0;
  }

  handleClick(action) {
    switch (action) {
      case 'here-from-device':
        // handled by fileselect
        break;
      case 'here-from-igram':
        IgramClick();
        this.props.closeNav();
      break;
    }
  }

  render() {

    const x = this.buttons.map((button, i, all) => {

      return (
          <div key={button.action} className='nav-button' data-action={button.action} onClick={this.handleClick.bind(this, button.action)} style={{width: 100 / all.length + '%'}}>
            <div className='nav-icon-container'>
              <Img className='nav-button-icon' src={button.icon} />
            </div>
            <div className='nav-button-text'> {button.text} </div>
          </div>
      );

    });

    return (
      <div className='nav-react-wrapper'>
        {x}
      </div>
    );
  }
}


function mapStatetoProps(state) {
  return {
    navBar: state.navBar
//  account: state.account
  }
}

function mapDispatchtoProps (dispatch) {
  return bindActionCreators( { closeNav }, dispatch)
}

export default connect (mapStatetoProps, mapDispatchtoProps)(UploadMenu);
