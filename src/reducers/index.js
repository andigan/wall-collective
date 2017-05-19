import { combineReducers } from 'redux';
import selectedImage from './selected-image';
import pageConfig from './page-config';
import instaConfig from '../_i-gram/insta-reducers';

export default combineReducers({
	pageConfig: pageConfig,
	selectedImage: selectedImage,
	instaConfig: instaConfig
});
