import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Img from 'react-image';

import Buttons from '../../_config/config-buttons';
import findElement from './scripts/find-element';
import changeContainerSize from './scripts/change-container-size';

import exitDoorDrop from '../../scripts/exit-door-drop';
import resetImage from '../../scripts/reset-image';
import removeImage from '../../scripts/remove-image';

class EditMenu extends Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.buttons = Buttons.edit;
  }

  componentWillMount() {
    changeContainerSize(this.buttonsToRender(this.props).length);
  }

  componentDidMount() {
    if (this.props.navBar.imageSelected) {
      this.setExitDrop();
      this.setImageIcon();
    }
  }

  componentWillUpdate(nextProps) {
    changeContainerSize(this.buttonsToRender(nextProps).length);
  }

  componentDidUpdate() {
    if (this.props.navBar.imageSelected) {
      this.setExitDrop();
      this.setImageIcon();
    }
  }

  componentWillUnmount() {
    document.getElementById('nav-container').style.width = 0;
  }

  buttonsToRender(props) {
    return (props.navBar.imageSelected) ? this.buttons : this.buttons.filter((button) => {
      return !button.imageReq;
    });
  }

  setExitDrop() {
    findElement('here-remove-image').id = 'exit-drop';
    exitDoorDrop();
  }

  setImageIcon() {
    findElement('here-image-placeholder').style.backgroundImage = `url(${document.getElementById(this.props.selectedImageId).src})`;
  }

  handleClick(action) {

    switch (action) {
      case 'here-open-draggers':
        {
          let switchesEl = document.getElementById('switches-container');

          if (switchesEl.classList.contains('switches-container-open')) {
            switchesEl.classList.remove('switches-container-open');
          } else {
            switchesEl.classList.add('switches-container-open');
          }
        }
        break;
      case 'here-reset-image':
        resetImage();
        break;
      case 'here-remove-image':
        removeImage();
        break;
      default:
        break;
    }

  }

  render() {
    let x = this.buttonsToRender(this.props).map((button, i, all) => {

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
    navBar: state.navBar,
    selectedImageId: state.selectedImage.id
  };
}

export default connect (mapStatetoProps)(EditMenu);
