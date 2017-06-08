import React, { Component } from 'react';
import { connect } from 'react-redux';
import SettingsMenu from './menu-settings';
import UploadMenu from './menu-upload';
import InitialMenu from './menu-initial';
import EditMenu from './menu-edit';

class NavMain extends Component {

  getMenu() {
    switch (this.props.navBar.status) {
      case 'initial':
        return <InitialMenu />
      case 'upload':
        return <UploadMenu />
      case 'settings':
        return <SettingsMenu />
      case 'edit':
        return <EditMenu />
      default:
        return null;
    };
  }

  render() {
    return this.getMenu();
  }
}

function mapStatetoProps(state) {
  return {
    navBar: state.navBar
  }
}

export default connect (mapStatetoProps)(NavMain);
