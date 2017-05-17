import { combineReducers } from 'redux';
import selectedImage from './selected-image';
import pageConfig from './page-config';


export default combineReducers({
	pageConfig: pageConfig,
	selectedImage: selectedImage
});
