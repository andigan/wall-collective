import React, { Component } from 'react';
import { connect } from 'react-redux';
import InitialMenu from './menu-initial';
import SettingsMenu from './menu-settings';
import EditMenu from './menu-edit';
import AddMenu from './menu-add';

class NavContainer extends Component {

  getMenu() {
    switch (this.props.navBar.status) {
      case 'initial':
        return <InitialMenu />;
      case 'upload':
        return <AddMenu />;
      case 'settings':
        return <SettingsMenu />;
      case 'edit':
        return <EditMenu />;
      default:
        return null;
    };
  }

  render() {
    return (
      <div id='nav-container' className='nav-container'>
        {this.getMenu()}
      </div>
    );
  }
}

function mapStatetoProps(state) {
  return {
    navBar: state.navBar
  };
}

export default connect (mapStatetoProps)(NavContainer);
