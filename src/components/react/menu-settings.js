import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Img from 'react-image';

import { closeNav } from '../../actions';
import Buttons from '../../_config/config-buttons';
import changeContainerSize from './scripts/change-container-size';

import resetPage from '../../scripts/reset-page';
import chooseColor from '../../scripts/choose-color';
import { igramLogout } from '../../_i-gram/button-actions';


class SettingsMenu extends Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.buttons = Buttons.settings;
  }

  componentWillMount() {
    changeContainerSize(this.buttons.length);
  }

  componentWillUnmount() {
    document.getElementById('here-nav-container').style.width = 0;
  }

  handleClick(action) {

    switch (action) {
      case 'here-reset-page':
        resetPage();
        break;
      case 'here-change-background-color':
        chooseColor();
        break;
      case 'here-igram-logout':
        igramLogout();
        break;
      default:
        break;
    }
  }

  render() {

    const x = this.buttons.map((button, i, all) => {

      return (
          <div key={button.action} className='here-nav-button' data-action={button.action} onClick={this.handleClick.bind(this, button.action)} style={{width: 100 / all.length + '%'}}>
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
  return bindActionCreators( { closeNav }, dispatch)
}

export default connect (mapStatetoProps, mapDispatchtoProps)(SettingsMenu);
