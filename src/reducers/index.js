import { combineReducers } from 'redux';
import pageConfig from './page-config';
import navBarControls from './nav-controls';
import selectedImage from './selected-image';
import igramConfig from '../_i-gram/igram-reducers';

export default combineReducers({
	pageConfig: pageConfig,
	selectedImage: selectedImage,
	igramConfig: igramConfig,
	navBar: navBarControls
});
