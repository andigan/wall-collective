import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Buttons from '../../_config/config-buttons';
import NavButtons from './nav-buttons';

import findElement from './scripts/find-element';

import exitDoorDrop from '../../scripts/exit-door-drop';
import resetImage from '../../scripts/reset-image';
import removeImage from '../../scripts/remove-image';

class EditMenu extends Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.buttons = Buttons.edit;
  }

  componentDidMount() {
    if (this.props.navBar.imageSelected) {
      this.setExitDrop();
      this.setImageIcon();
    }
  }

  componentDidUpdate() {
    if (this.props.navBar.imageSelected) {
      this.setExitDrop();
      this.setImageIcon();
    }
  }

  setExitDrop() {
    findElement('remove-image').id = 'exit-drop';
    exitDoorDrop();
  }

  setImageIcon() {
    findElement('nav-image-placeholder').style.backgroundImage = `url(${document.getElementById(this.props.selectedImageId).src})`;
  }

  handleClick(action) {

    switch (action) {
      case 'open-switches':
        {
          let switchesEl = document.getElementById('switches-container');

          if (switchesEl.classList.contains('switches-container-open')) {
            switchesEl.classList.remove('switches-container-open');
          } else {
            switchesEl.classList.add('switches-container-open');
          }
        }
        break;
      case 'reset-image':
        resetImage();
        break;
      case 'remove-image':
        removeImage();
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

function mapStatetoProps(state) {
  return {
    navBar: state.navBar,
    selectedImageId: state.selectedImage.id
  };
}

export default connect (mapStatetoProps)(EditMenu);
