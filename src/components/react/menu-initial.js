import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'
import Img from 'react-image';

import { openUpload, openSettings, openEdit, closeNav } from '../../actions';
import Buttons from '../../_config/config-buttons';
import changeContainerSize from './scripts/change-container-size';

import stateChange from '../../scripts/state-change';


class InitialMenu extends Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.buttons = Buttons.initial;
  }

  handleClick(action) {

    switch (action) {
      case 'here-add-image':
        this.props.openUpload();
        break;
      case 'here-open-info':
        this.props.closeNav();
        stateChange.openInfo();
        break;
      case 'here-open-settings':
        this.props.openSettings();
        break;
      case 'here-open-edit':
        this.props.openEdit();
        break;
      default:
        break;
    }
  }

  componentWillMount() {
    changeContainerSize(this.buttons.length);
  }

  componentWillUnmount() {
    document.getElementById('here-nav-container').style.width = 0;
  }

  render() {

    const x = this.buttons.map((button, i, all) => {

      return (
          <div key={button.action} className='here-nav-button'  data-action={button.action} onClick={this.handleClick.bind(this, button.action)} style={{width: 100 / all.length + '%'}}>
            <div className='here-nav-icon-container'>
              <Img className='here-nav-icon' src={button.icon} />
            </div>
            <div className='here-nav-button-text'> {button.text} </div>
          </div>
      );

    });

    return (
      <div className='react-required-wrapper'>
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
  return bindActionCreators( { openUpload, openSettings, openEdit, closeNav }, dispatch)
}

export default connect (mapStatetoProps, mapDispatchtoProps)(InitialMenu);
