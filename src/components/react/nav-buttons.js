import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Img from 'react-image';

import changeContainerSize from './scripts/change-container-size';

class NavButtons extends Component {

  buttonsToRender(props) {

    return this.props.buttons.filter((button) => {
      //           !imageReq imageSelected !tokenReq hasToken
      // delete:   F         T             T         T         T show
      // delete:   F         T             T         F         T show
      // delete:   F         F             T         T         F no show
      // delete:   F         F             T         F         F no show
      // draggers: T         T             T         T         T show
      // draggers: T         T             T         F         T show
      // draggers: T         F             T         T         T show
      // draggers: T         F             T         F         T show
      // ilogout:  T         T             F         T         T show
      // ilogout:  T         T             F         F         F no show
      // ilogout:  T         F             F         T         T show
      // ilogout:  T         F             F         F         F no show
      return ((!button.imageReq || props.navBar.imageSelected)
              && (!button.igramTokenReq || props.hasToken));
    });
  }

  componentWillMount() {
    changeContainerSize(this.buttonsToRender(this.props).length);
  }

  componentWillUnmount() {
    document.getElementById('nav-container').style.width = 0;
  }

  componentWillUpdate(nextProps) {
    changeContainerSize(this.buttonsToRender(nextProps).length);
  }

  render() {
    const x = this.buttonsToRender(this.props).map((button, i, all) => {

      return (
          <div key={button.action} className='nav-button' data-action={button.action} onClick={this.props.handleClick.bind(this, button.action)} style={{width: 100 / all.length + '%'}}>
            <div className='nav-icon-container'>
              <Img className='nav-button-icon' src={button.icon} alt={button.iconalt}/>
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
    hasToken: state.igramConfig.hasIGramToken
  };
}

export default connect (mapStatetoProps)(NavButtons);
