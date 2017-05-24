import { combineReducers } from 'redux';
import selectedImage from './selected-image';
import pageConfig from './page-config';
import igramConfig from '../_i-gram/igram-reducers';

export default combineReducers({
	pageConfig: pageConfig,
	selectedImage: selectedImage,
	igramConfig: igramConfig
});
