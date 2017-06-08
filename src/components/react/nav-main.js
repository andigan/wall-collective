import React, { Component } from 'react';
import { connect } from 'react-redux';
import SettingsMenu from './menu-settings';
import UploadMenu from './menu-upload';
import InitialMenu from './menu-initial';
import EditMenu from './menu-edit';
import stateChange from '../../scripts/state-change';

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

    let x = this.getMenu();


    return x;


    // return (
    //   <div className={this.props.navBar.isOpen ? 'anav-container nav-open' : 'anav-container'}>
    //
    //     {this.props.selectedImage.id !== '' ? <img id='test' src={ document.getElementById(this.props.selectedImage.id).src } /> : <div /> }
    //     {this.props.selectedImage.id !== '' ? document.getElementById(this.props.selectedImage.id).getAttribute('data-owner') : '' }
    //   </div>
    // );
  }
}


function mapStatetoProps(state) {
  return {
    selectedImage: state.selectedImage,
    navBar: state.navBar
  }
}

export default connect (mapStatetoProps)(NavMain);
