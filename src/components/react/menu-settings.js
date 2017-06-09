import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Buttons from '../../_config/config-buttons';
import NavButtons from './nav-buttons';

import { closeNav } from '../../actions';
import { igramLogout } from '../../_i-gram/button-actions';
import chooseColor from '../../scripts/choose-color';
import resetPage from '../../scripts/reset-page';

class SettingsMenu extends Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.buttons = Buttons.settings;
  }

  handleClick(action) {

    switch (action) {
      case 'reset-page':
        resetPage();
        break;
      case 'change-background-color':
        chooseColor();
        break;
      case 'igram-logout':
        igramLogout();
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

export default connect (null, mapDispatchtoProps)(SettingsMenu);
