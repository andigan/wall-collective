import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux'

import Buttons from '../../_config/config-buttons';
import NavButtons from './nav-buttons';

import { openUpload, openSettings, openEdit, closeNav, openInfo } from '../../actions';
import stateChange from '../../scripts/state-change';

class InitialMenu extends Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.buttons = Buttons.initial;
  }

  handleClick(action) {

    switch (action) {
      case 'open-add':
        this.props.openUpload();
        break;
      case 'open-app-info':
        this.props.openInfo();
        document.getElementById('app-info').style.display = 'block';
        stateChange.hideDraggers();
        break;
      case 'open-settings':
        this.props.openSettings();
        break;
      case 'open-edit':
        this.props.openEdit();
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
  return bindActionCreators( { openUpload, openSettings, openEdit, closeNav, openInfo }, dispatch);
}

export default connect (null, mapDispatchtoProps)(InitialMenu);
