import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Buttons from '../../_config/config-buttons';
import NavButtons from './nav-buttons';

import findElement from './scripts/find-element';

import { closeNav, gridToggle } from '../../actions';
import { igramLogout } from '../../_i-gram/button-actions';
import chooseColor from '../../scripts/choose-color';
import resetPage from '../../scripts/reset-page';

class SettingsMenu extends Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.buttons = Buttons.settings;
  }

  handleClick(action, e) {

    switch (action) {
      case 'reset-page':
        resetPage();
        break;
      case 'change-background-color':
        chooseColor();
        break;
      case 'grid-toggle':
        this.props.gridToggle();
        if (store.getState().navBar.gridOn) {
          e.target.src = Buttons.altIcons.grid.on;
          findElement('grid-toggle').children[1].textContent = 'grid on';
        } else {
          e.target.src = Buttons.altIcons.grid.off;
          findElement('grid-toggle').children[1].textContent = 'grid off';
        }
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
  return bindActionCreators( { closeNav, gridToggle }, dispatch);
}

export default connect (null, mapDispatchtoProps)(SettingsMenu);
